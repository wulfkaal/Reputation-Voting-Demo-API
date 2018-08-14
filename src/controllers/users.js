const express = require('express')
const router = express.Router()
const userService = require('../services/users')

router.get('/:email', userService.get)

router.get('/', userService.getAll)

router.post('/', userService.create)

router.put('/', userService.update)

router.delete('/', userService.delete)

module.exports = router
