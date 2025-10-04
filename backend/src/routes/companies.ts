import { Router } from 'express'

const router = Router()

router.get('/', (req, res) => {
  res.json({ success: true, message: 'Companies endpoint - Coming Soon' })
})

export default router