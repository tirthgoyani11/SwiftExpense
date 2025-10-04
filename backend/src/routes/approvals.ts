import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { body, query, validationResult } from 'express-validator'
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// GET /api/approvals/pending - Get pending approvals for current user
router.get('/pending', [
  authenticateToken,
  authorizeRoles('ADMIN', 'MANAGER'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req: AuthRequest, res: Response) => {
  try {
    const { id: userId, role, companyId } = req.user
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const skip = (page - 1) * limit

    // Build where clause based on role
    let where: any = {
      status: 'PENDING',
      expense: { companyId }
    }

    if (role === 'MANAGER') {
      // Managers can only approve expenses from their team
      where.OR = [
        { approverId: userId }, // Specifically assigned to them
        { 
          expense: { 
            employee: { managerId: userId } 
          } 
        } // From their team members
      ]
    } else if (role === 'ADMIN') {
      // Admins can approve any expense in their company
      where.expense = { companyId }
    }

    const [approvals, totalCount] = await Promise.all([
      prisma.approvalStep.findMany({
        where,
        include: {
          expense: {
            include: {
              employee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  avatarUrl: true
                }
              }
            }
          },
          approver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.approvalStep.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    res.json({
      success: true,
      data: {
        approvals: approvals.map(approval => ({
          ...approval,
          expense: {
            ...approval.expense,
            receiptData: approval.expense.receiptData ? 
              JSON.parse(approval.expense.receiptData) : null,
            location: approval.expense.location ? 
              JSON.parse(approval.expense.location) : null,
            tags: approval.expense.tags ? 
              JSON.parse(approval.expense.tags) : []
          }
        })),
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    })

  } catch (error) {
    console.error('Get pending approvals error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// POST /api/approvals/:id/approve - Approve an expense
router.post('/:id/approve', [
  authenticateToken,
  authorizeRoles('ADMIN', 'MANAGER'),
  body('comments').optional().isString().trim()
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
    const { comments } = req.body
    const { id: approverId, role, companyId } = req.user

    // Get the approval step with expense details
    const approvalStep = await prisma.approvalStep.findFirst({
      where: {
        id,
        status: 'PENDING'
      },
      include: {
        expense: {
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                managerId: true
              }
            }
          }
        }
      }
    })

    if (!approvalStep) {
      return res.status(404).json({
        success: false,
        message: 'Pending approval not found'
      })
    }

    // Check if expense belongs to the same company
    if (approvalStep.expense.companyId !== companyId) {
      return res.status(403).json({
        success: false,
        message: 'Cannot approve expense from different company'
      })
    }

    // Check if manager can approve (only their team's expenses)
    if (role === 'MANAGER' && 
        approvalStep.expense.employee.managerId !== approverId &&
        approvalStep.approverId !== approverId) {
      return res.status(403).json({
        success: false,
        message: 'Can only approve expenses from your team or assigned to you'
      })
    }

    // Update approval step and expense status
    await prisma.$transaction(async (tx) => {
      await tx.approvalStep.update({
        where: { id },
        data: {
          status: 'APPROVED',
          comments,
          approvedAt: new Date()
        }
      })

      await tx.expense.update({
        where: { id: approvalStep.expenseId },
        data: { status: 'APPROVED' }
      })

      // Create notification for employee
      await tx.notification.create({
        data: {
          userId: approvalStep.expense.employeeId,
          companyId,
          type: 'EXPENSE_APPROVED',
          title: 'Expense Approved',
          message: `Your expense of ₹${approvalStep.expense.convertedAmount} has been approved.`,
          data: JSON.stringify({
            expenseId: approvalStep.expenseId,
            approverId,
            comments
          })
        }
      })

      // Log activity
      await tx.activityLog.create({
        data: {
          userId: approverId,
          expenseId: approvalStep.expenseId,
          action: 'EXPENSE_APPROVED',
          details: JSON.stringify({
            approvalStepId: id,
            comments,
            approvedAmount: approvalStep.expense.convertedAmount
          })
        }
      })
    })

    res.json({
      success: true,
      message: 'Expense approved successfully'
    })

  } catch (error) {
    console.error('Approve expense error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// POST /api/approvals/:id/reject - Reject an expense
router.post('/:id/reject', [
  authenticateToken,
  authorizeRoles('ADMIN', 'MANAGER'),
  body('comments').isString().trim().notEmpty().withMessage('Rejection reason is required')
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
    const { comments } = req.body
    const { id: approverId, role, companyId } = req.user

    // Get the approval step with expense details
    const approvalStep = await prisma.approvalStep.findFirst({
      where: {
        id,
        status: 'PENDING'
      },
      include: {
        expense: {
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                managerId: true
              }
            }
          }
        }
      }
    })

    if (!approvalStep) {
      return res.status(404).json({
        success: false,
        message: 'Pending approval not found'
      })
    }

    // Check if expense belongs to the same company
    if (approvalStep.expense.companyId !== companyId) {
      return res.status(403).json({
        success: false,
        message: 'Cannot reject expense from different company'
      })
    }

    // Check if manager can reject (only their team's expenses)
    if (role === 'MANAGER' && 
        approvalStep.expense.employee.managerId !== approverId &&
        approvalStep.approverId !== approverId) {
      return res.status(403).json({
        success: false,
        message: 'Can only reject expenses from your team or assigned to you'
      })
    }

    // Update approval step and expense status
    await prisma.$transaction(async (tx) => {
      await tx.approvalStep.update({
        where: { id },
        data: {
          status: 'REJECTED',
          comments,
          approvedAt: new Date()
        }
      })

      await tx.expense.update({
        where: { id: approvalStep.expenseId },
        data: { status: 'REJECTED' }
      })

      // Create notification for employee
      await tx.notification.create({
        data: {
          userId: approvalStep.expense.employeeId,
          companyId,
          type: 'EXPENSE_REJECTED',
          title: 'Expense Rejected',
          message: `Your expense of ₹${approvalStep.expense.convertedAmount} has been rejected. Reason: ${comments}`,
          data: JSON.stringify({
            expenseId: approvalStep.expenseId,
            approverId,
            comments
          })
        }
      })

      // Log activity
      await tx.activityLog.create({
        data: {
          userId: approverId,
          expenseId: approvalStep.expenseId,
          action: 'EXPENSE_REJECTED',
          details: JSON.stringify({
            approvalStepId: id,
            comments,
            rejectedAmount: approvalStep.expense.convertedAmount
          })
        }
      })
    })

    res.json({
      success: true,
      message: 'Expense rejected successfully'
    })

  } catch (error) {
    console.error('Reject expense error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// GET /api/approvals/history - Get approval history
router.get('/history', [
  authenticateToken,
  authorizeRoles('ADMIN', 'MANAGER'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('status').optional().isIn(['APPROVED', 'REJECTED'])
], async (req: AuthRequest, res: Response) => {
  try {
    const { id: userId, role, companyId } = req.user
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const skip = (page - 1) * limit
    const status = req.query.status as string

    // Build where clause
    let where: any = {
      status: { in: ['APPROVED', 'REJECTED'] },
      expense: { companyId }
    }

    if (status) {
      where.status = status
    }

    if (role === 'MANAGER') {
      where.OR = [
        { approverId: userId },
        { expense: { employee: { managerId: userId } } }
      ]
    }

    const [approvals, totalCount] = await Promise.all([
      prisma.approvalStep.findMany({
        where,
        include: {
          expense: {
            include: {
              employee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          },
          approver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: { approvedAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.approvalStep.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    res.json({
      success: true,
      data: {
        approvals,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    })

  } catch (error) {
    console.error('Get approval history error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

export default router