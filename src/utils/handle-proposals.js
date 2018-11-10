const SemadaCore = require('../services/semada-core')
const {ObjectID} = require('mongodb')

const handleProposals = {
  
  process: async (db) => {
    /*
    1. get staked rep by yes/no vote on active proposals
    2. update proposal in API with staked rep and status
    3. distribute REP when timeout
    4. distribute SEM when timeout
    */
    
    let activeProposals = await db.collection('proposals')
      .find({status: 1})
      .toArray()
    
    activeProposals.forEach(async(proposal) => {
        let scProposal = await db.collection('SCproposals')
          .findOne({_id: ObjectID(proposal.proposalIndex)})
          
        let now = Math.floor(new Date().getTime()/1000)
        proposalStatus = await SemadaCore.proposalVotes(scProposal, now)
        
        proposal.status = proposalStatus.status
        proposal.noRepStaked = proposalStatus.totalNoRep
        proposal.yesRepStaked = proposalStatus.totalYesRep
        proposal.totalRepStaked = proposal.noRepStaked + proposal.yesRepStaked
        proposal.noSlashRep = proposalStatus.noSlashRep
    
        let remaining = proposal.voteTimeEnd - now
        remaining = remaining < 0 ? 0 : remaining
        proposal.voteTimeRemaining = remaining
        
        await db.collection('proposals').updateOne(
            {_id: ObjectID(proposal._id)}, 
            {$set: proposal})

        if(proposal.status !== 1 && proposal.proposalIndex) {
            console.log(`Distribute REP/SEM: ${proposal.proposalIndex}`)
            await SemadaCore.distRep(
                db, 
                proposal.proposalIndex, 
                proposalStatus.totalRep,
                proposal.yesRepStaked, 
                proposal.noRepStaked - proposal.noSlashRep, 
                proposal.noSlashRep)
            await SemadaCore.distSem(
                db, 
                proposal.tokenNumberIndex)
        }
    })
  }
  
}

module.exports = handleProposals