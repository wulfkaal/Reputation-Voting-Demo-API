const MongoClient = require('mongodb').MongoClient;
const {ObjectID} = require('mongodb')
const {values} = require('lodash')

const semadaCore = {


  createDao: async (req, res) => {
    
    let now = Math.floor(new Date().getTime()/1000)
    let timeout = now
    delete req.body.dao._id
    let tokenNumberIndex
    let proposalIndex
    
    //insert dao
    let repContract = await req.db.collection('SCrepContracts').insertOne({
      totalSupply: req.body.sem,
      balances: {
        'semcore' : {
          account: 'semcore',
          rep: req.body.sem
        }
      },
      sem: req.body.sem
    })
    
    //reduce SEM balance
    let accountBalance = await req.db.collection("SCbalances")
      .findOne({account: req.body.account})
    
    await req.db.collection('SCbalances').updateOne(
      {account: req.body.account}, 
      {$set: {
        sem: accountBalance.sem - req.body.sem
      }})


    //insert proposal
    let proposal = await req.db.collection('SCproposals').insertOne({
      from: req.body.account,
      tokenNumberIndex: repContract.insertedId.toString(),
      name: req.body.dao.name,
      timeout: timeout,
      evidence: req.body.dao.name,
      //insert 2 votes
      votes: [
        {
          from: req.body.account,
          rep: req.body.sem / 2,
          vote: true         
        },
        {
          from: 'semcore',
          rep: req.body.sem / 2,
          vote: false
        }
      ]
    })
    
    res.status(200).send({
      tokenNumberIndex: repContract.insertedId.toString(),
      proposalIndex: proposal.insertedId.toString(),
      timeout: timeout
    })
    
  },

  getRepBalance: async (req, res) => {
    
    const collection = 
      req.db.collection("SCrepContracts")
      .find({_id: ObjectID(req.params.tokenNumberIndex)})
    .toArray((err, docs) => {
      let result = docs.length ? docs[0] : {}
      let rep = result.balances[req.params.account] ? 
        result.balances[req.params.account].rep : 0
      res.status(200).send({
          balance: parseInt(rep)
      });
    })
  },
  
  getRepTotalSupply: async (req, res) => {
    
    const collection = 
      req.db.collection("SCrepContracts")
      .find({_id: ObjectID(req.params.tokenNumberIndex)})
    .toArray((err, docs) => {
      let result = docs.length ? docs[0] : {}
      let totalSupply = result.totalSupply || 0 

      res.status(200).send({
          totalSupply: totalSupply
      });
    })
  },
    
  getSemBalance: async (req, res) => {
    
    const account = await req.db.collection("SCbalances")
      .findOne({account: req.params.account})
    
    let sem = account ? account.sem : 0

    res.status(200).send({
        sem: sem
    });
  },
    
  setSemBalance: async (req, res) => {
    let accountBalance = await req.db.collection("SCbalances")
      .findOne({account: req.body.account})
      
    if(accountBalance) {
      req.db.collection('SCbalances').updateOne(
        {account: req.body.account}, 
        {$set: {
          sem: req.body.sem
        }})
    } else {
      req.db.collection('SCbalances').insertOne({
          account: req.body.account,
          sem: req.body.sem
        })
    }
    
    
    res.status(200).send();
    
  },

  proposalVotes: async (proposal, now) => {
    let status = 1
    let totalRep = 0
    let totalYesRep = 0
    let totalNoRep = 0
    let noSlashRep = 0

    for(let vote of proposal.votes) {
      totalRep += vote.rep
      
      if(vote.vote){
        totalYesRep += vote.rep
      } else if (!vote.vote) {
        totalNoRep += vote.rep
        
        if(vote.from === 'semcore') {
          noSlashRep += vote.rep
        }
      }
    }
    // console.log(`VOTES: ${totalRep}, ${totalYesRep}`)
    if(now >= proposal.timeout){
      if(totalYesRep >= totalRep / 2){
        status = 2;
        noSlashRep = 0;
      } else {
        status = 3;
        totalRep = totalRep - noSlashRep;
      }
    } else {
      if(totalYesRep >= totalRep / 2){
        //reset as we aren't going to slash rep if YES wins
        noSlashRep = 0;
      } else {
        totalRep = totalRep - noSlashRep;
      }
      status = 1;
    } 
    
    return {
      status: status,
      totalRep: totalRep,
      totalYesRep: totalYesRep,
      totalNoRep: totalNoRep,
      noSlashRep: noSlashRep
    }
  },

  getProposalVotes: async (req, res) => {
    
    const proposal = await req.db.collection("SCproposals")
      .findOne({_id: ObjectID(req.params.proposalIndex)})
      
    if(proposal){
      
      let result = await proposalVotes(proposal, req.params.now)
      
      res.status(200).send({
        status: result.status,
        totalYesRep: result.totalYesRep,
        totalNoRep: result.totalRep - result.totalYesRep,
        noSlashRep: result.noSlashRep
      })

    } else {
      res.status(200).send();
    }
  },

  distributeRep: async (req, res) => {
    let proposalIndex = req.params.proposalIndex
    let totalRepStaked = req.body.totalRepStaked
    let yesRepStaked = req.body.yesRepStaked
    let noSlashRep = req.body.noSlashRep
    await distRep(req.db, proposalIndex, totalRepStaked, yesRepStaked, noRepStaked, noSlashRep)

    res.status(200).send({})
  },

  distRep: async(db, 
    proposalIndex, 
    totalRepStaked, 
    yesRepStaked, 
    noRepStaked, 
    noSlashRep) => {
      
    console.log(totalRepStaked, yesRepStaked, noRepStaked, noSlashRep)
    const pool = await db.collection("SCproposals")
      .findOne({_id: ObjectID(proposalIndex)})
      
    const rep = await db.collection("SCrepContracts")
      .findOne({_id: ObjectID(pool.tokenNumberIndex)})
          
    if(noSlashRep > 0) {
      rep.totalSupply -= noSlashRep
      rep.balances['semcore']['rep'] -= noSlashRep
    }
    
    for(let j = 0; j < pool.votes.length; j++){
      let betAmtWon = 0
      if(noSlashRep == 0 && pool.votes[j].vote){
        betAmtWon = parseFloat(((pool.votes[j].rep / yesRepStaked) * totalRepStaked).toFixed(2))
        rep.balances['semcore']['rep'] -= betAmtWon
        if (rep.balances[pool.votes[j].from]){
          rep.balances[pool.votes[j].from]['rep'] += betAmtWon
        } else {
          let act = {}
          act['account'] = pool.votes[j].from
          act['rep'] = betAmtWon
          rep.balances[pool.votes[j].from] = act
        }
      } else if (noSlashRep > 0
          && !pool.votes[j].vote 
          && pool.votes[j].from !== 'semcore'){
        
        betAmtWon = parseFloat(((pool.votes[j].rep / noRepStaked) * totalRepStaked).toFixed(2))
        rep.balances['semcore']['rep'] -= betAmtWon
        if (rep.balances[pool.votes[j].from]){
          rep.balances[pool.votes[j].from]['rep'] += betAmtWon
        } else {
          let act = {}
          act['account'] = pool.votes[j].from
          act['rep'] = betAmtWon
          rep.balances[pool.votes[j].from] = act
        }
      }
    }
    
    await db.collection('SCrepContracts').updateOne(
      {_id: ObjectID(pool.tokenNumberIndex)}, 
      {$set: rep})
  },
  
  distributeSem: async (req, res) => {
    let tokenNumberIndex = req.params.tokenNumberIndex
    await distSem(req.db, tokenNumberIndex)
    res.status(200).send({})
  },

  distSem: async(db, tokenNumberIndex) => {
    let rep = await db.collection("SCrepContracts")
      .findOne({_id: ObjectID(tokenNumberIndex)})
    let salary = 0
    
    let balances = values(rep.balances)
    
    for(let i = 0; i < balances.length; i++) {
      if(balances[i].rep > 0) {
        salary = (balances[i].rep / rep.totalSupply) * rep.sem
        
        let accountBalance = await db.collection("SCbalances")
          .findOne({account: balances[i].account})
        
        if(accountBalance) {
          accountBalance.sem += salary  
          await db.collection('SCbalances').updateOne(
            {account: balances[i].account}, 
            {$set: {
              sem: accountBalance.sem
            }})
        }
      }
    }
    rep.sem = 0
    
    await db.collection('SCrepContracts').updateOne(
      {_id: ObjectID(tokenNumberIndex)}, 
      {$set: rep})
  },
  
  joinDao: async (req, res) => {
    
    let now = Math.floor(new Date().getTime()/1000)
    let timeout = now + 180
    
    let rep = await req.db.collection("SCrepContracts")
      .findOne({_id: ObjectID(req.params.tokenNumberIndex)})
    
    rep.totalSupply += parseInt(req.body.sem)
    if(rep.balances['semcore']){
      rep.balances['semcore']['rep'] += req.body.sem
    } else {
      let act = {}
      act['account'] = 'semcore'
      act['rep'] = req.body.sem
      rep.balances['semcore'] = act
    }
    rep.sem += req.body.sem
    
    await req.db.collection('SCrepContracts').updateOne(
      {_id: ObjectID(req.params.tokenNumberIndex)}, 
      {$set: rep})
    
    let accountBalance = await req.db.collection("SCbalances")
      .findOne({account: req.body.account})
    
    if(accountBalance) {
      accountBalance.sem -= req.body.sem  
      
      await req.db.collection('SCbalances').updateOne(
        {account: req.body.account}, 
        {$set: accountBalance})
    } else {
      accountBalance = {
        account: req.body.account,
        sem: req.body.sem
      }
      
      await req.db.collection('SCbalances').insertOne(
        {account: req.body.account}, 
        accountBalance)
    }

    let proposal = await req.db.collection('SCproposals').insertOne({
      from: req.body.account,
      tokenNumberIndex: rep._id.toString(),
      name: 'Join DAO',
      timeout: timeout,
      evidence: 'Join DAO',
      //insert 2 votes
      votes: [
        {
          from: req.body.account,
          rep: req.body.sem / 2,
          vote: true         
        },
        {
          from: 'semcore',
          rep: req.body.sem / 2,
          vote: false
        }
      ]
    })

    res.status(200).send({
      proposalIndex: proposal.insertedId.toString(),
      timeout: timeout
    })
  },

  getRepContract: async (req, res) => {
    
    let rep = await req.db.collection("SCrepContracts")
      .findOne({_id: ObjectID(req.params.tokenNumberIndex)})
  
    res.status(200).send(rep)
  },
  
  newProposal: async (req, res) => {
    let now = Math.floor(new Date().getTime()/1000)
    let timeout = now + 30
    
    let rep = await req.db.collection("SCrepContracts")
      .findOne({_id: ObjectID(req.body.tokenNumberIndex)})
    
    rep.totalSupply = parseInt(rep.totalSupply) + parseInt(req.body.sem)
    
    if(rep.balances['semcore']){
      rep.balances['semcore']['rep'] =
        parseInt(rep.balances['semcore']['rep']) + parseInt(req.body.sem)
    } else {
      let act = {}
      act['account'] = 'semcore'
      act['rep'] = sem
      rep.balances['semcore'] = act
    }
    rep.sem = parseInt(rep.sem) + parseInt(req.body.sem)
    
    await req.db.collection('SCrepContracts').updateOne(
      {_id: ObjectID(req.body.tokenNumberIndex)}, 
      {$set: rep})

    let accountBalance = await req.db.collection("SCbalances")
      .findOne({account: req.body.account})
    
    if(accountBalance) {
      accountBalance.sem = parseInt(accountBalance.sem) - parseInt(req.body.sem)
      
      await req.db.collection('SCbalances').updateOne(
        {account: req.body.account}, 
        {$set: accountBalance})
    } else {
      accountBalance = {
        account: req.body.account,
        sem: req.body.sem
      }
      
      await req.db.collection('SCbalances').insertOne(
        {account: req.body.account}, 
        accountBalance)
    }
    
    let proposal = await req.db.collection('SCproposals').insertOne({
      from: req.body.account,
      tokenNumberIndex: req.body.tokenNumberIndex,
      name: req.body.name,
      timeout: timeout,
      evidence: req.body.description,
      //insert 2 votes
      votes: [
        {
          from: req.body.account,
          rep: parseInt(req.body.sem) / 2,
          vote: true         
        },
        {
          from: 'semcore',
          rep: parseInt(req.body.sem) / 2,
          vote: false
        }
      ]
    })
    
    res.status(200).send({
      proposalIndex: proposal.insertedId.toString(),
      timeout: timeout
    })
  },

  mintRep: async (req, res) => {
    
    let rep = await req.db.collection("SCrepContracts")
      .findOne({_id: ObjectID(req.params.tokenNumberIndex)})
      
    rep.totalSupply += req.body.sem
    
    if(rep.balances[req.body.account]){
      rep.balances[req.body.account].rep += req.body.sem
    } else {
      let act = {}
      act.account = req.body.account
      act.rep = req.body.sem
      rep.balances[req.body.account] = act
    }
    
    rep.sem += req.body.sem

    await req.db.collection('SCrepContracts').updateOne(
      {_id: ObjectID(req.params.tokenNumberIndex)}, 
      {$set: rep})
      
    let accountBalance = await req.db.collection("SCbalances")
      .findOne({account: req.body.account})

    accountBalance.sem -= req.body.sem  
    
    await req.db.collection('SCbalances').updateOne(
      {account: req.body.account}, 
      {$set: accountBalance})

    res.status(200).send()
  },
  
  vote: async (req, res) => {
    let rep = await req.db.collection("SCrepContracts")
      .findOne({_id: ObjectID(req.body.tokenNumberIndex)})
    
    const pool = await req.db.collection("SCproposals")
      .findOne({_id: ObjectID(req.params.proposalIndex)})
    
    let now = Math.floor(new Date().getTime()/1000)
  
    if (now > pool.timeout && 
      rep.balances[req.body.account].rep < req.body.rep){
      return
    }
    pool.votes.push(
      {
        from: req.body.account,
        rep: parseInt(req.body.rep),
        vote: req.body.vote
      }
    )
    
    await req.db.collection('SCproposals').updateOne(
      {_id: ObjectID(req.params.proposalIndex)}, 
      {$set: pool})
    
    rep.balances[req.body.account].rep = 
      parseInt(rep.balances[req.body.account].rep) - parseInt(req.body.rep)
    
    rep.balances['semcore'].rep = 
      parseInt(rep.balances['semcore'].rep) + parseInt(req.body.rep)
    
    await req.db.collection('SCrepContracts').updateOne(
      {_id: ObjectID(req.body.tokenNumberIndex)}, 
      {$set: rep})
    
    res.status(200).send()
  },
  
  getVote: async (req, res) => {
    
    let pool = await req.db.collection("SCproposals")
      .findOne({_id: ObjectID(req.params.proposalIndex)})
    
    let vote = pool.votes[req.params.voteIndex]
    
    res.status(200).send(vote)
  }
}

module.exports = semadaCore
