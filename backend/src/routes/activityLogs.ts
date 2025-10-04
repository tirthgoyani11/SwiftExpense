import { Router, Response } from 'express'
import { query, validationResult } from 'express-validator'
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth'
import { ActivityLogger } from '../services/activityLogger'
import { ActivityAction } from '@prisma/client'

const router = Router()

// GET /api/activity-logs - Get activity history (Admin/Manager only)
router.get('/', [
  authenticateToken,
  authorizeRoles('ADMIN', 'MANAGER'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('userId').optional().isUUID(),
  query('expenseId').optional().isUUID(),
  query('action').optional().isIn(['LOGIN', 'EXPENSE_CREATED', 'EXPENSE_APPROVED', 'EXPENSE_REJECTED', 'USER_CREATED'])
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

    const { companyId, role, id: currentUserId } = req.user
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 50
    const userId = req.query.userId as string
    const expenseId = req.query.expenseId as string
    const action = req.query.action as ActivityAction

    // Managers can only see activities related to their team
    const options: any = { page, limit }
    
    if (userId) options.userId = userId
    if (expenseId) options.expenseId = expenseId
    if (action) options.action = action

    const result = await ActivityLogger.getActivityHistory(companyId, options)

    res.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Get activity logs error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// GET /api/activity-logs/stats - Get activity statistics (Admin only)
router.get('/stats', [
  authenticateToken,
  authorizeRoles('ADMIN'),
  query('days').optional().isInt({ min: 1, max: 365 })
], async (req: AuthRequest, res: Response) => {
  try {
    const { companyId } = req.user
    const days = parseInt(req.query.days as string) || 30

    const stats = await ActivityLogger.getActivityStats(companyId, days)

    res.json({
      success: true,
      data: {
        stats,
        period: `${days} days`,
        generatedAt: new Date()
      }
    })

  } catch (error) {
    console.error('Get activity stats error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

export default router