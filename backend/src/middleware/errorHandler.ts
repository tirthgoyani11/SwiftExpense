import { Request, Response, NextFunction } from 'express'

export interface CustomError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = error.statusCode || 500
  const message = error.message || 'Internal Server Error'

  // Log error (in production, use proper logging service)
  console.error(`Error ${statusCode}: ${message}`)
  if (process.env.NODE_ENV === 'development') {
    console.error(error.stack)
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  })
}