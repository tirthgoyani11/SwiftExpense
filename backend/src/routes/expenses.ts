import { Router } from 'express'

const router = Router()

// GET /api/expenses
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Get expenses endpoint - Coming Soon',
    data: []
  })
})

// POST /api/expenses
router.post('/', (req, res) => {
  res.json({
    success: true,
    message: 'Create expense endpoint - Coming Soon',
    data: null
  })
})

export default router