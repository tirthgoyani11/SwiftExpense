import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// GET /api/analytics/dashboard - Company dashboard analytics
router.get('/dashboard', [
  authenticateToken,
  authorizeRoles('ADMIN', 'MANAGER')
], async (req: AuthRequest, res: Response) => {
  try {
    const { companyId, role, id: userId } = req.user

    // Date filters
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Base where clause for role-based access
    let baseWhere: any = { companyId }
    if (role === 'MANAGER') {
      baseWhere = {
        companyId,
        OR: [
          { employeeId: userId },
          { employee: { managerId: userId } }
        ]
      }
    }

    // Get expense statistics
    const [
      totalExpenses,
      currentMonthExpenses,
      lastMonthExpenses,
      pendingExpenses,
      approvedExpenses,
      rejectedExpenses,
      categoryBreakdown,
      recentExpenses,
      topSpenders
    ] = await Promise.all([
      // Total expenses count and amount
      prisma.expense.aggregate({
        where: baseWhere,
        _count: { id: true },
        _sum: { convertedAmount: true }
      }),
      
      // Current month expenses
      prisma.expense.aggregate({
        where: {
          ...baseWhere,
          createdAt: { gte: startOfMonth }
        },
        _count: { id: true },
        _sum: { convertedAmount: true }
      }),
      
      // Last month expenses
      prisma.expense.aggregate({
        where: {
          ...baseWhere,
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        },
        _count: { id: true },
        _sum: { convertedAmount: true }
      }),

      // Pending expenses
      prisma.expense.aggregate({
        where: { ...baseWhere, status: 'PENDING' },
        _count: { id: true },
        _sum: { convertedAmount: true }
      }),

      // Approved expenses
      prisma.expense.aggregate({
        where: { ...baseWhere, status: 'APPROVED' },
        _count: { id: true },
        _sum: { convertedAmount: true }
      }),

      // Rejected expenses
      prisma.expense.aggregate({
        where: { ...baseWhere, status: 'REJECTED' },
        _count: { id: true },
        _sum: { convertedAmount: true }
      }),

      // Category breakdown
      prisma.expense.groupBy({
        by: ['category'],
        where: baseWhere,
        _count: { id: true },
        _sum: { convertedAmount: true }
      }),

      // Recent expenses (last 10)
      prisma.expense.findMany({
        where: baseWhere,
        include: {
          employee: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),

      // Top spenders (if admin)
      role === 'ADMIN' ? prisma.expense.groupBy({
        by: ['employeeId'],
        where: baseWhere,
        _count: { id: true },
        _sum: { convertedAmount: true },
        orderBy: {
          _sum: {
            convertedAmount: 'desc'
          }
        },
        take: 5
      }) : []
    ])

    // Calculate growth rate
    const currentAmount = currentMonthExpenses._sum.convertedAmount || 0
    const lastAmount = lastMonthExpenses._sum.convertedAmount || 0
    const growthRate = lastAmount > 0 ? ((currentAmount - lastAmount) / lastAmount) * 100 : 0

    // Format response
    const analytics = {
      summary: {
        totalExpenses: {
          count: totalExpenses._count.id || 0,
          amount: totalExpenses._sum.convertedAmount || 0
        },
        currentMonth: {
          count: currentMonthExpenses._count.id || 0,
          amount: currentAmount,
          growthRate: Math.round(growthRate * 100) / 100
        },
        pendingApprovals: {
          count: pendingExpenses._count.id || 0,
          amount: pendingExpenses._sum.convertedAmount || 0
        }
      },
      
      statusBreakdown: {
        pending: {
          count: pendingExpenses._count.id || 0,
          amount: pendingExpenses._sum.convertedAmount || 0
        },
        approved: {
          count: approvedExpenses._count.id || 0,
          amount: approvedExpenses._sum.convertedAmount || 0
        },
        rejected: {
          count: rejectedExpenses._count.id || 0,
          amount: rejectedExpenses._sum.convertedAmount || 0
        }
      },

      categoryBreakdown: categoryBreakdown.map(cat => ({
        category: cat.category,
        count: cat._count.id,
        amount: cat._sum.convertedAmount || 0
      })),

      recentActivity: recentExpenses.map(expense => ({
        id: expense.id,
        description: expense.description,
        amount: expense.convertedAmount,
        currency: expense.originalCurrency,
        category: expense.category,
        status: expense.status,
        employee: `${expense.employee.firstName} ${expense.employee.lastName}`,
        createdAt: expense.createdAt
      })),

      ...(role === 'ADMIN' && {
        topSpenders: await Promise.all(
          topSpenders.slice(0, 5).map(async (spender) => {
            const employee = await prisma.user.findUnique({
              where: { id: spender.employeeId },
              select: { firstName: true, lastName: true, email: true }
            })
            return {
              employee: employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown',
              email: employee?.email || '',
              count: spender._count.id,
              amount: spender._sum.convertedAmount || 0
            }
          })
        )
      })
    }

    res.json({
      success: true,
      message: 'Analytics retrieved successfully',
      data: analytics
    })

  } catch (error) {
    console.error('Analytics error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// GET /api/analytics/trends - Expense trends over time
router.get('/trends', [
  authenticateToken,
  authorizeRoles('ADMIN', 'MANAGER')
], async (req: AuthRequest, res: Response) => {
  try {
    const { companyId, role, id: userId } = req.user
    
    // Base where clause
    let baseWhere: any = { companyId }
    if (role === 'MANAGER') {
      baseWhere = {
        companyId,
        OR: [
          { employeeId: userId },
          { employee: { managerId: userId } }
        ]
      }
    }

    // Get monthly trends for the last 6 months
    const trends = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      const monthData = await prisma.expense.aggregate({
        where: {
          ...baseWhere,
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        },
        _count: { id: true },
        _sum: { convertedAmount: true }
      })

      trends.push({
        month: startOfMonth.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        count: monthData._count.id || 0,
        amount: monthData._sum.convertedAmount || 0
      })
    }

    res.json({
      success: true,
      message: 'Trends retrieved successfully',
      data: { trends }
    })

  } catch (error) {
    console.error('Trends error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

export default router