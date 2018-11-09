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
    
    await db.collection('SCproposals').find({}).toArray(function(err, docs) {
        let proposals = docs.filter(proposal => {
                                        return proposal.status===1
                                   })
        docs.forEach(async(proposal) => {
            let now = Math.floor(new Date().getTime()/1000)
            proposalStatus = await SemadaCore.proposalVotes(proposal, now)

            proposal.status = proposalStatus.status
            proposal.noRepStaked = 
                proposalStatus.totalRep - proposalStatus.totalYesRep
            proposal.yesRepStaked = proposalStatus.totalYesRep
            proposal.noSlashRep = proposalStatus.noSlashRep

            let remaining = proposal.timeout - now
            remaining = remaining < 0 ? 0 : remaining
            proposal.voteTimeRemaining = remaining

            await db.collection('proposals').find(
                {proposalIndex: String(proposal._id)})
                .toArray(async(err, docs) => {
                    let pro =  docs.length ? docs[0] : {}
                    pro.status = proposalStatus.status
                    pro.noRepStaked = 
                        proposalStatus.totalRep - proposalStatus.totalYesRep
                    pro.yesRepStaked = proposalStatus.totalYesRep
                    pro.noSlashRep = proposalStatus.noSlashRep
                    pro.voteTimeRemaining = remaining
                    await db.collection('proposals').updateOne(
                        {_id: ObjectID(pro._id)}, 
                        {$set: pro}, 
                        (err, r) => {if(err) return null})
                })
            await db.collection('SCproposals').updateOne(
                {_id: ObjectID(proposal._id)}, 
                {$set: proposal}, 
                (err, r) => {if(err) return null})
            if(proposal.status !== 1 && proposal.proposalIndex) {
                await SemadaCore.distRep(
                    db, 
                    proposal.proposalIndex, 
                    proposal.yesRepStaked + proposal.noRepStaked, 
                    proposal.yesRepStaked, 
                    proposal.noRepStaked, 
                    proposal.noSlashRep)
                await SemadaCore.distSem(
                    db, 
                    proposal.tokenNumberIndex)
            }
        })
    })
  }
  
}

module.exports = handleProposals