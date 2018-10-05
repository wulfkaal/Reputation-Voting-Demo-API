const MongoClient = require('mongodb').MongoClient;
const {ObjectID} = require('mongodb')
const path = require('path');

const contracts = {

  get: async (req, res) => {
    const collection = req.db.collection("contracts").find({name: req.params.name})
    .toArray((err, docs) => {
      let result = docs.length ? docs[0] : {}
      console.log(path.join(__dirname, 'public'))
      res.status(200).send(result);
    })
       
  },
  getAll: async (req, res) => {
     const collection = req.db.collection("contracts").find({})
      .toArray((err, docs) => {
        res.status(200).send(docs);
      })
  },
  create: async (req, res) => {
    req.db.collection('contracts').insertOne(req.body, (err, r) => {
      if (err) {
          // If it failed, return error
          res.send("There was a problem adding the information to the database.");
      }
      else {
          res.status(200).send(req.body);
      }
    })
  },
  update: async (req, res) => {   
    let obj = {...req.body}
    delete obj._id
    req.db.collection('contracts').updateOne({name: ObjectID(req.params.name)}, {$set: obj}, function (err, r) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem updating the information in the database.");
        }
        else {
            res.status(200).send(req.body);
        }
    });
  },
  delete: async (req, res) => {

  }
}

module.exports = contracts
