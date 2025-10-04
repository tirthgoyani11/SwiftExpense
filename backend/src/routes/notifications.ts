import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { body, query, validationResult } from 'express-validator'
import { authenticateToken, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// GET /api/notifications - List user notifications
router.get('/', [
  authenticateToken,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('unread').optional().isBoolean()
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

    const { id: userId } = req.user
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const skip = (page - 1) * limit
    const unreadOnly = req.query.unread === 'true'

    // Build where clause
    const where: any = { userId }
    if (unreadOnly) {
      where.read = false
    }

    // Get notifications with pagination
    const [notifications, totalCount, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ 
        where: { userId, read: false } 
      })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    res.json({
      success: true,
      data: {
        notifications: notifications.map(n => ({
          ...n,
          data: n.data ? JSON.parse(n.data) : null
        })),
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        unreadCount
      }
    })

  } catch (error) {
    console.error('Get notifications error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// POST /api/notifications/:id/read - Mark notification as read
router.post('/:id/read', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { id: userId } = req.user

    const notification = await prisma.notification.findFirst({
      where: { 
        id,
        userId 
      }
    })

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      })
    }

    await prisma.notification.update({
      where: { id },
      data: { read: true }
    })

    res.json({
      success: true,
      message: 'Notification marked as read'
    })

  } catch (error) {
    console.error('Mark notification read error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// POST /api/notifications/read-all - Mark all notifications as read
router.post('/read-all', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id: userId } = req.user

    await prisma.notification.updateMany({
      where: { 
        userId,
        read: false 
      },
      data: { read: true }
    })

    res.json({
      success: true,
      message: 'All notifications marked as read'
    })

  } catch (error) {
    console.error('Mark all notifications read error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { id: userId } = req.user

    const notification = await prisma.notification.findFirst({
      where: { 
        id,
        userId 
      }
    })

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      })
    }

    await prisma.notification.delete({
      where: { id }
    })

    res.json({
      success: true,
      message: 'Notification deleted'
    })

  } catch (error) {
    console.error('Delete notification error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// GET /api/notifications/unread-count - Get unread count
router.get('/unread-count', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id: userId } = req.user

    const unreadCount = await prisma.notification.count({
      where: { 
        userId,
        read: false 
      }
    })

    res.json({
      success: true,
      data: { unreadCount }
    })

  } catch (error) {
    console.error('Get unread count error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

export default router