const express = require('express')
const router = express.Router()
const notificationService = require('../services/notifications')

router.get('/:email', notificationService.getAll)

router.get('/markasseen/:email', notificationService.markAsSeen)

router.get('/notification/:id', notificationService.get)

router.post('/', notificationService.create)

router.put('/:id', notificationService.update)

router.delete('/:id', notificationService.delete)

module.exports = router
