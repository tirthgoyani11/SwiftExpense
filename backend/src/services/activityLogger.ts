import { PrismaClient, ActivityAction } from '@prisma/client'

const prisma = new PrismaClient()

export class ActivityLogger {
  static async logActivity(
    userId: string,
    action: ActivityAction,
    details?: any,
    expenseId?: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    try {
      await prisma.activityLog.create({
        data: {
          userId,
          expenseId,
          action,
          details: details ? JSON.stringify(details) : null,
          ipAddress,
          userAgent
        }
      })
    } catch (error) {
      console.error('Activity logging error:', error)
    }
  }

  static async getActivityHistory(
    companyId: string,
    options: {
      userId?: string
      expenseId?: string
      action?: ActivityAction
      page?: number
      limit?: number
    } = {}
  ) {
    try {
      const { userId, expenseId, action, page = 1, limit = 50 } = options
      const skip = (page - 1) * limit

      // Build where clause
      const where: any = {}
      
      if (userId) where.userId = userId
      if (expenseId) where.expenseId = expenseId
      if (action) where.action = action

      // If no specific filters, get activities for users in the company
      if (!userId && !expenseId) {
        where.user = { companyId }
      }

      const [activities, totalCount] = await Promise.all([
        prisma.activityLog.findMany({
          where,
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                role: true
              }
            },
            expense: {
              select: {
                description: true,
                amount: true,
                originalCurrency: true,
                status: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.activityLog.count({ where })
      ])

      return {
        activities: activities.map(activity => ({
          ...activity,
          details: activity.details ? JSON.parse(activity.details) : null
        })),
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      }
    } catch (error) {
      console.error('Get activity history error:', error)
      return { activities: [], pagination: { page: 1, limit: 50, total: 0, pages: 0 } }
    }
  }

  static async getActivityStats(companyId: string, days: number = 30) {
    try {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

      const stats = await prisma.activityLog.groupBy({
        by: ['action'],
        where: {
          createdAt: { gte: since },
          user: { companyId }
        },
        _count: { action: true }
      })

      return stats.reduce((acc, stat) => {
        acc[stat.action] = stat._count.action
        return acc
      }, {} as Record<ActivityAction, number>)
    } catch (error) {
      console.error('Get activity stats error:', error)
      return {}
    }
  }
}

// Middleware to automatically log activities
export const activityLogger = (action: ActivityAction) => {
  return (req: any, res: any, next: any) => {
    const originalSend = res.send

    res.send = function(data: any) {
      // Only log successful operations (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user?.id
        const expenseId = req.params?.id || req.body?.expenseId
        const ipAddress = req.ip || req.connection.remoteAddress
        const userAgent = req.get('User-Agent')

        if (userId) {
          ActivityLogger.logActivity(
            userId,
            action,
            {
              method: req.method,
              url: req.originalUrl,
              statusCode: res.statusCode,
              timestamp: new Date()
            },
            expenseId,
            ipAddress,
            userAgent
          )
        }
      }

      return originalSend.call(this, data)
    }

    next()
  }
}