const MongoClient = require('mongodb').MongoClient;
const {ObjectID} = require('mongodb')

const proposals = {

  get: async (req, res) => {
    const collection = req.db.collection("proposals").find({_id: ObjectID(req.params.id)})
    .toArray((err, docs) => {
      let result = docs.length ? docs[0] : {}
      res.status(200).send({
          ...result
      });
    })
       
  },
  getAll: async (req, res) => {
     const collection = req.db.collection("proposals").find({daoId:parseInt(req.params.daoId)})
      .toArray((err, docs) => {
        res.status(200).send({
            proposals: docs
        });
      })
  },
  create: async (req, res) => {
    req.db.collection('proposals').insertOne(req.body, (err, r) => {
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
    req.db.collection('proposals').updateOne({_id: ObjectID(req.params.id)}, {$set: obj}, (err, r) => {
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

module.exports = proposals
