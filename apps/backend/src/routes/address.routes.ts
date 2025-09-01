import { Router } from 'express'
import { addressController } from '../controllers/address.controller'
import {
  requireAuth,
  getAuthenticatedRequest,
} from '../middleware/auth.middleware'

const router: Router = Router()

// Apply authentication middleware to all routes
router.use(requireAuth)

// Address management routes
router.get('/', (req, res) => {
  const authReq = getAuthenticatedRequest(req)
  if (!authReq) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return addressController.getUserAddresses(authReq, res)
})
router.post('/', (req, res) => {
  const authReq = getAuthenticatedRequest(req)
  if (!authReq) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return addressController.createAddress(authReq, res)
})
router.get('/:id', (req, res) => {
  const authReq = getAuthenticatedRequest(req)
  if (!authReq) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return addressController.getAddressById(authReq, res)
})
router.put('/:id', (req, res) => {
  const authReq = getAuthenticatedRequest(req)
  if (!authReq) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return addressController.updateAddress(authReq, res)
})
router.delete('/:id', (req, res) => {
  const authReq = getAuthenticatedRequest(req)
  if (!authReq) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return addressController.deleteAddress(authReq, res)
})
router.put('/:id/default', (req, res) => {
  const authReq = getAuthenticatedRequest(req)
  if (!authReq) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return addressController.setDefaultAddress(authReq, res)
})

export default router
