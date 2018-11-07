const express = require('express')
const router = express.Router()
const semadaCoreService = require('../services/semada-core')

router.post('/create-dao', semadaCoreService.createDao)

router.get('/daos/:tokenNumberIndex/rep-balance/:account', 
  semadaCoreService.getRepBalance)

module.exports = router
