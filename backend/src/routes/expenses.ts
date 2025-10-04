import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { body, query, validationResult } from 'express-validator'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { externalAPIService } from '../services/externalAPI'

const router = Router()
const prisma = new PrismaClient()

// GET /api/expenses - List expenses with role-based filtering
router.get('/', [
  authenticateToken,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['PENDING', 'APPROVED', 'REJECTED']),
  query('category').optional().isIn(['FOOD', 'TRAVEL', 'OFFICE', 'COMMUNICATIONS', 'OTHER']),
  query('search').optional().isString()
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { role, companyId, id: userId } = req.user
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const skip = (page - 1) * limit
    const { status, category, search } = req.query

    // Build where clause based on role
    let where: any = { companyId }

    if (role === 'EMPLOYEE') {
      // Employees can only see their own expenses
      where.employeeId = userId
    } else if (role === 'MANAGER') {
      // Managers can see their team's expenses
      where.OR = [
        { employeeId: userId }, // Their own expenses
        { 
          employee: { managerId: userId } // Team expenses
        }
      ]
    }
    // Admin can see all company expenses (no additional filter needed)

    // Add optional filters
    if (status) where.status = status
    if (category) where.category = category
    if (search) {
      where.OR = [
        ...(where.OR || []),
        { description: { contains: search, mode: 'insensitive' } },
        { subcategory: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get expenses with pagination
    const [expenses, totalCount] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: {
          employee: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true
            }
          },
          approvalSteps: {
            include: {
              approver: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.expense.count({ where })
    ])

    // Process expenses data
    const processedExpenses = expenses.map(expense => ({
      ...expense,
      receiptData: expense.receiptData ? JSON.parse(expense.receiptData) : null,
      location: expense.location ? JSON.parse(expense.location) : null,
      tags: expense.tags ? JSON.parse(expense.tags) : []
    }))

    res.json({
      success: true,
      message: 'Expenses retrieved successfully',
      data: {
        expenses: processedExpenses,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page * limit < totalCount,
          hasPrev: page > 1
        }
      }
    })

  } catch (error) {
    console.error('Get expenses error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// POST /api/expenses - Create new expense
router.post('/', [
  authenticateToken,
  body('amount').isFloat({ min: 0.01 }),
  body('originalCurrency').isIn(['INR', 'USD', 'EUR', 'GBP']),
  body('category').isIn(['FOOD', 'TRAVEL', 'OFFICE', 'COMMUNICATIONS', 'OTHER']),
  body('subcategory').trim().isLength({ min: 1 }),
  body('description').trim().isLength({ min: 1 }),
  body('expenseDate').isISO8601(),
  body('tags').optional().isArray(),
  body('location').optional().isObject(),
  body('receiptData').optional().isObject()
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { companyId, id: employeeId } = req.user
    const {
      amount,
      originalCurrency,
      category,
      subcategory,
      description,
      expenseDate,
      tags = [],
      location,
      receiptData
    } = req.body

    // Convert currency using external API service
    let convertedAmount = amount
    let exchangeRate = 1.0

    if (originalCurrency !== 'INR') {
      try {
        const conversionResult = await externalAPIService.convertCurrency(
          amount,
          originalCurrency,
          'INR'
        )
        convertedAmount = conversionResult.convertedAmount
        exchangeRate = conversionResult.exchangeRate
      } catch (error) {
        console.warn('Currency conversion failed, using fallback rates:', error)
        // Fallback to hardcoded rates if external API fails
        const fallbackRates: { [key: string]: number } = {
          USD: 83.2,
          EUR: 90.5,
          GBP: 105.8
        }
        exchangeRate = fallbackRates[originalCurrency] || 1.0
        convertedAmount = amount * exchangeRate
      }
    }

    // Create expense and approval step in transaction
    const expense = await prisma.$transaction(async (tx) => {
      // Create the expense
      const newExpense = await tx.expense.create({
        data: {
          employeeId,
          companyId,
          amount: convertedAmount,
          originalCurrency,
          convertedAmount,
          exchangeRate,
          category,
          subcategory,
          description,
          expenseDate: new Date(expenseDate),
          status: 'PENDING',
          tags: tags.length > 0 ? JSON.stringify(tags) : null,
          location: location ? JSON.stringify(location) : null,
          receiptData: receiptData ? JSON.stringify(receiptData) : null
        },
        include: {
          employee: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      })

      // Check if company has managers and create approval step
      const managers = await tx.user.findMany({
        where: {
          companyId,
          role: 'MANAGER',
          isActive: true
        },
        select: { id: true }
      })

      // Create approval step if managers exist
      if (managers.length > 0) {
        await tx.approvalStep.create({
          data: {
            expenseId: newExpense.id,
            approverId: managers[0].id, // Assign to first available manager
            stepOrder: 1,
            status: 'PENDING'
          }
        })
      }

      return newExpense
    })

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: {
        ...expense,
        receiptData: expense.receiptData ? JSON.parse(expense.receiptData) : null,
        location: expense.location ? JSON.parse(expense.location) : null,
        tags: expense.tags ? JSON.parse(expense.tags) : []
      }
    })

  } catch (error) {
    console.error('Create expense error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// GET /api/expenses/:id - Get specific expense
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { role, companyId, id: userId } = req.user

    const expense = await prisma.expense.findFirst({
      where: { 
        id,
        companyId
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
            managerId: true
          }
        },
        approvalSteps: {
          include: {
            approver: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      })
    }

    // Check permissions
    const canView = expense.employeeId === userId || 
                   role === 'ADMIN' || 
                   (role === 'MANAGER' && expense.employee.managerId === userId)

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      })
    }

    res.json({
      success: true,
      message: 'Expense retrieved successfully',
      data: {
        ...expense,
        receiptData: expense.receiptData ? JSON.parse(expense.receiptData) : null,
        location: expense.location ? JSON.parse(expense.location) : null,
        tags: expense.tags ? JSON.parse(expense.tags) : []
      }
    })

  } catch (error) {
    console.error('Get expense error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// PUT /api/expenses/:id - Update expense (if pending)
router.put('/:id', [
  authenticateToken,
  body('amount').optional().isFloat({ min: 0.01 }),
  body('category').optional().isIn(['FOOD', 'TRAVEL', 'OFFICE', 'COMMUNICATIONS', 'OTHER']),
  body('subcategory').optional().trim().isLength({ min: 1 }),
  body('description').optional().trim().isLength({ min: 1 }),
  body('tags').optional().isArray(),
  body('location').optional().isObject()
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { id } = req.params
    const { companyId, id: userId } = req.user

    const expense = await prisma.expense.findFirst({
      where: { 
        id,
        companyId,
        employeeId: userId // Only owner can edit
      }
    })

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      })
    }

    if (expense.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Can only update pending expenses'
      })
    }

    // Build update data
    const updateData: any = {}
    const { amount, category, subcategory, description, tags, location } = req.body

    if (amount !== undefined) {
      updateData.amount = amount
      updateData.convertedAmount = amount // Assuming INR for simplicity
    }
    if (category !== undefined) updateData.category = category
    if (subcategory !== undefined) updateData.subcategory = subcategory
    if (description !== undefined) updateData.description = description
    if (tags !== undefined) updateData.tags = JSON.stringify(tags)
    if (location !== undefined) updateData.location = JSON.stringify(location)

    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: updateData,
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    res.json({
      success: true,
      message: 'Expense updated successfully',
      data: {
        ...updatedExpense,
        receiptData: updatedExpense.receiptData ? JSON.parse(updatedExpense.receiptData) : null,
        location: updatedExpense.location ? JSON.parse(updatedExpense.location) : null,
        tags: updatedExpense.tags ? JSON.parse(updatedExpense.tags) : []
      }
    })

  } catch (error) {
    console.error('Update expense error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// PUT /api/expenses/:id/status - Update expense status (Manager/Admin only)
router.put('/:id/status', [
  authenticateToken,
  body('status').isIn(['APPROVED', 'REJECTED']),
  body('comments').optional().trim()
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { id } = req.params
    const { role, companyId, id: approverId } = req.user
    const { status, comments } = req.body

    if (role === 'EMPLOYEE') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      })
    }

    const expense = await prisma.expense.findFirst({
      where: { 
        id,
        companyId,
        status: 'PENDING'
      },
      include: {
        employee: {
          select: { managerId: true }
        }
      }
    })

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Pending expense not found'
      })
    }

    // Managers can only approve their team's expenses
    if (role === 'MANAGER' && expense.employee.managerId !== approverId) {
      return res.status(403).json({
        success: false,
        message: 'Can only approve expenses from your team'
      })
    }

    // Update expense status and create approval record
    await prisma.$transaction(async (tx) => {
      await tx.expense.update({
        where: { id },
        data: { status }
      })

      await tx.approvalStep.create({
        data: {
          expenseId: id,
          approverId,
          stepOrder: 1,
          status,
          comments: comments || null
        }
      })
    })

    res.json({
      success: true,
      message: `Expense ${status.toLowerCase()} successfully`
    })

  } catch (error) {
    console.error('Update expense status error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// DELETE /api/expenses/:id - Delete expense (if pending)
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { companyId, id: userId } = req.user

    const expense = await prisma.expense.findFirst({
      where: { 
        id,
        companyId,
        employeeId: userId,
        status: 'PENDING' // Can only delete pending expenses
      }
    })

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Pending expense not found'
      })
    }

    await prisma.expense.delete({
      where: { id }
    })

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    })

  } catch (error) {
    console.error('Delete expense error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

export default router