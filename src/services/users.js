const MongoClient = require('mongodb').MongoClient;

const users = {

  get: async (req, res) => {
     const collection = req.db.collection("users").find({email: req.params.email})
      .toArray((err, docs) => {
        let result = docs.length ? docs[0] : {}
        res.status(200).send({
            ...result
        });
      })
  },
  getAll: async (req, res) => {

  },
  create: async (req, res) => {

  },
  update: async (req, res) => {   
    req.db.collection('proposals').updateOne({_id: req.params.id}, {$set: req.body}, function (err, r) {
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

module.exports = users
