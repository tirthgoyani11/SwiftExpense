import { Router, Response, Request } from 'express'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const router = Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'receipts')
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const fileExtension = path.extname(file.originalname)
    cb(null, `receipt-${uniqueSuffix}${fileExtension}`)
  }
})

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only image files
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf'
  ]
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type. Only images and PDFs are allowed.'))
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
})

// POST /api/upload/receipt - Upload receipt file
router.post('/receipt', [
  authenticateToken,
  upload.single('receipt')
], async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      })
    }

    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      url: `/uploads/receipts/${req.file.filename}`
    }

    res.json({
      success: true,
      message: 'Receipt uploaded successfully',
      data: fileInfo
    })

  } catch (error) {
    console.error('Upload receipt error:', error)
    res.status(500).json({
      success: false,
      message: 'Upload failed'
    })
  }
})

// GET /api/upload/receipt/:filename - Serve uploaded receipt
router.get('/receipt/:filename', (req: Request, res: Response) => {
  try {
    const { filename } = req.params
    const filePath = path.join(process.cwd(), 'uploads', 'receipts', filename)
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      })
    }

    res.sendFile(filePath)

  } catch (error) {
    console.error('Serve receipt error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to serve file'
    })
  }
})

// DELETE /api/upload/receipt/:filename - Delete receipt file
router.delete('/receipt/:filename', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { filename } = req.params
    const filePath = path.join(process.cwd(), 'uploads', 'receipts', filename)
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      })
    }

    fs.unlinkSync(filePath)

    res.json({
      success: true,
      message: 'File deleted successfully'
    })

  } catch (error) {
    console.error('Delete receipt error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete file'
    })
  }
})

// POST /api/upload/ocr - Process OCR on uploaded receipt (placeholder)
router.post('/ocr', [
  authenticateToken,
  upload.single('receipt')
], async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded for OCR processing'
      })
    }

    // Mock OCR processing (in real implementation, you would use Tesseract.js or similar)
    const mockOcrResult = {
      amount: Math.floor(Math.random() * 5000) + 100,
      currency: 'INR',
      merchant: ['Starbucks', 'McDonald\'s', 'Uber', 'Amazon', 'Flipkart'][Math.floor(Math.random() * 5)],
      category: ['FOOD', 'TRAVEL', 'OFFICE', 'OTHER'][Math.floor(Math.random() * 4)],
      date: new Date().toISOString().split('T')[0],
      confidence: 0.85 + Math.random() * 0.1,
      lineItems: [
        { description: 'Coffee', amount: 150 },
        { description: 'Sandwich', amount: 200 },
        { description: 'Tax', amount: 35 }
      ]
    }

    res.json({
      success: true,
      message: 'OCR processing completed',
      data: {
        file: {
          filename: req.file.filename,
          url: `/uploads/receipts/${req.file.filename}`
        },
        ocr: mockOcrResult
      }
    })

  } catch (error) {
    console.error('OCR processing error:', error)
    res.status(500).json({
      success: false,
      message: 'OCR processing failed'
    })
  }
})

export default router