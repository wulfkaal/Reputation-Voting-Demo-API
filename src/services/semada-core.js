const MongoClient = require('mongodb').MongoClient;
const {ObjectID} = require('mongodb')

const semadaCore = {


  createDao: async (req, res) => {
    let now = Math.floor(new Date().getTime()/1000)
    let timeout = now + 180
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

    //insert proposal
    let proposal = await req.db.collection('SCproposals').insertOne({
      from: req.body.fromAccount,
      tokenNumberIndex: repContract.insertedId.toString(),
      name: req.body.dao.name,
      timeout: timeout,
      evidence: req.body.dao.name,
      //insert 2 votes
      votes: [
        {
          from: req.body.fromAccount,
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
      proposalIndex: proposal.insertedId.toString()
    })
    
  },

  getRepBalance: async (req, res) => {
    
    const collection = 
      req.db.collection("SCrepContracts")
      .find({_id: ObjectID(req.params.tokenNumberIndex)})
    .toArray((err, docs) => {
      let result = docs.length ? docs[0] : {}
      res.status(200).send({
          balance: result.balances[req.params.account].rep || 0
      });
    })
  },

}

module.exports = semadaCore
