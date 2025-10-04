import { Router } from 'express'

const router = Router()

router.get('/', (req, res) => {
  res.json({ success: true, message: 'Analytics endpoint - Coming Soon' })
})

export default router