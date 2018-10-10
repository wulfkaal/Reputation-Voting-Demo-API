const express = require('express')
const router = express.Router()
const contractService = require('../services/contracts')

router.get('/', contractService.getAll)

router.get('/:name', contractService.get)

router.post('/', contractService.create)

router.put('/:name', contractService.update)

router.delete('/:name', contractService.delete)

module.exports = router
