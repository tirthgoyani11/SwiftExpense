import { Server } from 'socket.io'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const setupSocketIO = (io: Server) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`)

    // Join company room
    socket.on('join_company', (companyId: string) => {
      socket.join(`company_${companyId}`)
      console.log(`User ${socket.id} joined company ${companyId}`)
    })

    // Join user room
    socket.on('join_user', (userId: string) => {
      socket.join(`user_${userId}`)
      console.log(`User ${socket.id} joined user room ${userId}`)
    })

    // Handle expense status updates
    socket.on('expense_updated', (data) => {
      // Broadcast to company members
      socket.to(`company_${data.companyId}`).emit('expense_status_changed', data)
    })

    // Handle typing indicators for comments
    socket.on('typing_start', (data) => {
      socket.to(`expense_${data.expenseId}`).emit('user_typing', {
        userId: data.userId,
        userName: data.userName
      })
    })

    socket.on('typing_stop', (data) => {
      socket.to(`expense_${data.expenseId}`).emit('user_stopped_typing', {
        userId: data.userId
      })
    })

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`)
    })
  })

  return io
}

// Notification Broadcasting Functions
export class NotificationService {
  constructor(private io: Server) {}

  async broadcastExpenseSubmitted(expenseId: string, employeeId: string, companyId: string) {
    try {
      // Get expense details
      const expense = await prisma.expense.findUnique({
        where: { id: expenseId },
        include: {
          employee: {
            select: { firstName: true, lastName: true }
          }
        }
      })

      if (!expense) return

      // Get all managers and admins in the company
      const approvers = await prisma.user.findMany({
        where: {
          companyId,
          role: { in: ['ADMIN', 'MANAGER'] },
          isActive: true
        },
        select: { id: true }
      })

      // Broadcast to approvers
      approvers.forEach(approver => {
        this.io.to(`user_${approver.id}`).emit('new_expense_notification', {
          type: 'EXPENSE_SUBMITTED',
          expenseId,
          employeeName: `${expense.employee.firstName} ${expense.employee.lastName}`,
          amount: expense.convertedAmount,
          currency: expense.originalCurrency,
          description: expense.description,
          timestamp: new Date()
        })
      })

      // Broadcast to company room
      this.io.to(`company_${companyId}`).emit('expense_activity', {
        type: 'NEW_EXPENSE',
        expenseId,
        employeeId,
        amount: expense.convertedAmount,
        timestamp: new Date()
      })

    } catch (error) {
      console.error('Error broadcasting expense submission:', error)
    }
  }

  async broadcastExpenseApproved(expenseId: string, approverId: string, employeeId: string) {
    try {
      const expense = await prisma.expense.findUnique({
        where: { id: expenseId },
        include: {
          employee: { select: { firstName: true, lastName: true } }
        }
      })

      if (!expense) return

      // Notify the employee
      this.io.to(`user_${employeeId}`).emit('expense_approved', {
        expenseId,
        amount: expense.convertedAmount,
        currency: expense.originalCurrency,
        description: expense.description,
        timestamp: new Date()
      })

      // Broadcast to company
      this.io.to(`company_${expense.companyId}`).emit('expense_activity', {
        type: 'EXPENSE_APPROVED',
        expenseId,
        employeeId,
        approverId,
        timestamp: new Date()
      })

    } catch (error) {
      console.error('Error broadcasting expense approval:', error)
    }
  }

  async broadcastExpenseRejected(expenseId: string, approverId: string, employeeId: string, reason: string) {
    try {
      const expense = await prisma.expense.findUnique({
        where: { id: expenseId },
        include: {
          employee: { select: { firstName: true, lastName: true } }
        }
      })

      if (!expense) return

      // Notify the employee
      this.io.to(`user_${employeeId}`).emit('expense_rejected', {
        expenseId,
        amount: expense.convertedAmount,
        currency: expense.originalCurrency,
        description: expense.description,
        reason,
        timestamp: new Date()
      })

      // Broadcast to company
      this.io.to(`company_${expense.companyId}`).emit('expense_activity', {
        type: 'EXPENSE_REJECTED',
        expenseId,
        employeeId,
        approverId,
        timestamp: new Date()
      })

    } catch (error) {
      console.error('Error broadcasting expense rejection:', error)
    }
  }

  async broadcastUserActivity(userId: string, companyId: string, activity: string) {
    this.io.to(`company_${companyId}`).emit('user_activity', {
      userId,
      activity,
      timestamp: new Date()
    })
  }
}

let notificationService: NotificationService | null = null

export const initializeNotificationService = (io: Server) => {
  notificationService = new NotificationService(io)
  return notificationService
}

export const getNotificationService = () => notificationService