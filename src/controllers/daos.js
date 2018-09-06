const express = require('express')
const router = express.Router()
const daoService = require('../services/daos')

router.get('/', daoService.getAll)

router.get('/:id', daoService.get)

router.post('/', daoService.create)

router.put('/:id', daoService.update)

router.delete('/:id', daoService.delete)

module.exports = router
