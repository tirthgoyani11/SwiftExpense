import { Router } from 'express'

const router = Router()

router.get('/', (req, res) => {
  res.json({ success: true, message: 'Users endpoint - Coming Soon' })
})

export default router