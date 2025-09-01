import { Router } from 'express'
import { preferencesController } from '../controllers/preferences.controller'
import {
  requireAuth,
  getAuthenticatedRequest,
} from '../middleware/auth.middleware'

const router: Router = Router()

// Apply authentication middleware to all routes
router.use(requireAuth)

// User preferences routes
router.get('/', (req, res) => {
  const authReq = getAuthenticatedRequest(req)
  if (!authReq) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return preferencesController.getUserPreferences(authReq, res)
})
router.put('/', (req, res) => {
  const authReq = getAuthenticatedRequest(req)
  if (!authReq) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return preferencesController.updateUserPreferences(authReq, res)
})
router.put('/notifications', (req, res) => {
  const authReq = getAuthenticatedRequest(req)
  if (!authReq) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return preferencesController.updateNotificationSettings(authReq, res)
})
router.put('/display', (req, res) => {
  const authReq = getAuthenticatedRequest(req)
  if (!authReq) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return preferencesController.updateDisplaySettings(authReq, res)
})
router.post('/reset', (req, res) => {
  const authReq = getAuthenticatedRequest(req)
  if (!authReq) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return preferencesController.resetPreferences(authReq, res)
})
router.get('/notifications', (req, res) => {
  const authReq = getAuthenticatedRequest(req)
  if (!authReq) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return preferencesController.getNotificationSettings(authReq, res)
})
router.get('/display', (req, res) => {
  const authReq = getAuthenticatedRequest(req)
  if (!authReq) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return preferencesController.getDisplaySettings(authReq, res)
})

export default router
