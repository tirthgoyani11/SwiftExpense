import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { body, validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// GET /api/users - List users (Admin/Manager only)
router.get('/', authenticateToken, authorizeRoles('ADMIN', 'MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const { role, companyId } = req.user

    let users
    if (role === 'ADMIN') {
      // Admin can see all users in their company
      users = await prisma.user.findMany({
        where: { companyId, isActive: true },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          avatarUrl: true,
          createdAt: true,
          company: {
            select: { name: true, currencyCode: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else {
      // Manager can see employees under them
      users = await prisma.user.findMany({
        where: { 
          companyId,
          managerId: req.user.id,
          isActive: true 
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          avatarUrl: true,
          createdAt: true
        }
      })
    }

    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: users
    })

  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// GET /api/users/:id - Get specific user
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { role, companyId, id: userId } = req.user

    // Users can view their own profile, Admin can view anyone in company, Manager can view their team
    const user = await prisma.user.findFirst({
      where: { 
        id,
        companyId, // Ensure user is in same company
        isActive: true
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        managerId: true,
        isActive: true,
        avatarUrl: true,
        createdAt: true,
        preferences: true,
        company: {
          select: { name: true, currencyCode: true, country: true }
        },
        manager: {
          select: { firstName: true, lastName: true, email: true }
        }
      }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Check permissions
    const canView = user.id === userId || role === 'ADMIN' || (role === 'MANAGER' && user.managerId === userId)
    
    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      })
    }

    res.json({
      success: true,
      message: 'User retrieved successfully',
      data: {
        ...user,
        preferences: user.preferences ? JSON.parse(user.preferences as string) : {}
      }
    })

  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// PUT /api/users/:id - Update user profile
router.put('/:id', [
  authenticateToken,
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('avatarUrl').optional().isURL(),
  body('role').optional().isIn(['ADMIN', 'MANAGER', 'EMPLOYEE']),
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
    const { role, companyId, id: userId } = req.user
    const { firstName, lastName, avatarUrl, role: newRole, preferences } = req.body

    // Check if user exists in same company
    const targetUser = await prisma.user.findFirst({
      where: { id, companyId, isActive: true }
    })

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Permission checks
    const canUpdate = id === userId || role === 'ADMIN'
    const canChangeRole = role === 'ADMIN' && newRole

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      })
    }

    // Build update data
    const updateData: any = {}
    if (firstName !== undefined) updateData.firstName = firstName
    if (lastName !== undefined) updateData.lastName = lastName
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl
    if (preferences !== undefined) updateData.preferences = JSON.stringify(preferences)
    if (canChangeRole && newRole) updateData.role = newRole

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        avatarUrl: true,
        preferences: true,
        company: {
          select: { name: true, currencyCode: true }
        }
      }
    })

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        ...updatedUser,
        preferences: updatedUser.preferences ? JSON.parse(updatedUser.preferences as string) : {}
      }
    })

  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// POST /api/users/invite - Invite new team member (Admin/Manager only)
router.post('/invite', [
  authenticateToken,
  authorizeRoles('ADMIN', 'MANAGER'),
  body('email').isEmail().normalizeEmail(),
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 }),
  body('role').isIn(['MANAGER', 'EMPLOYEE']),
  body('tempPassword').isLength({ min: 8 })
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

    const { email, firstName, lastName, role: newUserRole, tempPassword } = req.body
    const { companyId, id: managerId, role } = req.user

    // Managers can only invite employees
    if (role === 'MANAGER' && newUserRole !== 'EMPLOYEE') {
      return res.status(403).json({
        success: false,
        message: 'Managers can only invite employees'
      })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email'
      })
    }

    // Hash temporary password
    const hashedPassword = await bcrypt.hash(tempPassword, 12)

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        role: newUserRole,
        companyId,
        managerId: newUserRole === 'EMPLOYEE' ? managerId : null,
        isActive: true,
        preferences: JSON.stringify({
          theme: 'light',
          notifications: true,
          mustChangePassword: true // Flag for first login
        })
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      }
    })

    res.status(201).json({
      success: true,
      message: 'User invited successfully',
      data: newUser
    })

  } catch (error) {
    console.error('Invite user error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

export default router