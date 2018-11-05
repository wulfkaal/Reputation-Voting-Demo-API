const express = require('express')
const router = express.Router()
const proposalService = require('../services/proposals')

router.get('/dao/:daoId', proposalService.getAll)

router.get('/:id', proposalService.get)

router.get('/', proposalService.getGreatestIndex)

router.post('/', proposalService.create)

router.put('/:id', proposalService.update)

router.delete('/:id', proposalService.delete)

module.exports = router
