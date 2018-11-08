const express = require('express')
const router = express.Router()
const semadaCoreService = require('../services/semada-core')

router.post('/create-dao', semadaCoreService.createDao)

router.get('/daos/:tokenNumberIndex/rep-balance/:account', 
  semadaCoreService.getRepBalance)
  
router.get('/daos/:tokenNumberIndex/total-supply', 
  semadaCoreService.getRepTotalSupply)

router.get('/balances/:account', 
  semadaCoreService.getSemBalance)
  
router.put('/balances/:account', 
  semadaCoreService.setSemBalance)
  
router.put('/proposals/:proposalIndex/distribute-rep', 
  semadaCoreService.distributeRep)
  
router.put('/daos/:tokenNumberIndex/distribute-sem', 
  semadaCoreService.distributeSem)
  
router.put('/daos/:tokenNumberIndex/join', 
  semadaCoreService.joinDao)
  
router.get('/daos/:tokenNumberIndex', 
  semadaCoreService.getRepContract)
  
router.post('/proposals', 
  semadaCoreService.newProposal)
  
router.put('/daos/:tokenNumberIndex/mint-rep', 
  semadaCoreService.mintRep)

router.get('/proposals/:proposalIndex/votes/:now/proposal-votes', 
  semadaCoreService.getProposalVotes)

router.get('/proposals/:proposalIndex/votes/:voteIndex', 
  semadaCoreService.getVote)
  
router.put('/proposals/:proposalIndex/vote', 
  semadaCoreService.vote)
  


module.exports = router
