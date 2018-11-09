const SemadaCore = require('../services/semada-core')

const handleProposals = {
  
  process: async () => {
    /*
    1. get staked rep by yes/no vote on active proposals
    2. update proposal in API with staked rep and status
    3. distribute REP when timeout
    4. distribute SEM when timeout
    */
    
    //TODO: filter only active proposals
    // let proposals = 
    //   await req.db.collection("proposals")
    //   .find({daoId: req.params.daoId})
    //  .toArray((err, docs) => {
    //    return docs
    //  })
    // 
    // for(let i = 0; i < proposals.length; i++){
    //   let proposal = {...proposals[i]}
    // 
    //   let now = Math.floor(new Date().getTime()/1000)
    //   proposalStatus = await SemadaCore.proposalVotes(proposal, now)
    // 
    //   try{
    //     proposal.status = proposalStatus[0].toNumber()
    //     proposal.yesRepStaked = proposalStatus[1].toNumber()
    //     proposal.noRepStaked = proposalStatus[2].toNumber()
    //     proposal.noSlashRep = proposalStatus[3].toNumber()
    //   } catch (e){
    //     proposal.status = proposalStatus[0]
    //     proposal.yesRepStaked = proposalStatus[1]
    //     proposal.noRepStaked = proposalStatus[2]
    //     proposal.noSlashRep = proposalStatus[3]
    //   }
    //   let now = Math.floor(new Date().getTime()/1000)
    //   let remaining = proposal.voteTimeEnd - now
    //   remaining = remaining < 0 ? 0 : remaining
    //   proposal.voteTimeRemaining = remaining
    // 
    //   // save/persist proposal to API with new status
    //   //TODO: update to save, no need to save and persist
    //   await this.props.baseSaveProposal(proposal)
    //   await this.props.basePersistProposal(proposal)
    // 
    //   //if not active, then proposal has completed
    //   if(proposal.status !== PROPOSAL_STATUSES.active) {
    //     // TODO: point to seperate distributeREp and distributeSEM methods
    //     let chain = await ChainFactory.getChain()
    //     let rep = await chain.distributeRepAndSem(proposal._id, proposal.proposalIndex,
    //       proposal.yesRepStaked + proposal.noRepStaked,
    //       proposal.yesRepStaked,
    //       proposal.noRepStaked,
    //       proposal.tokenNumberIndex)
    //     await this.props.saveRepBalance(rep)
    //   }
    // }
  // 2. refresh REP balance for DAO if a DAO is currently selected
  }
  
}

module.exports = handleProposals