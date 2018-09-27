const express = require('express')
const jwt = require('express-jwt')
const router = express.Router()
const userService = require('../services/users')

router.post('/auth', userService.auth)

router.get('/', userService.getAll)

router.get('/:email' , userService.get)

router.get('/publicaddress/:publicAddress' , userService.getByPublicAddress)

router.post('/', userService.create)

router.put('/:id', jwt({ secret: 'shhhh' }), userService.update)

router.delete('/', jwt({ secret: 'shhhh' }), userService.delete)

module.exports = router
