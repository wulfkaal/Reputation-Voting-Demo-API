const MongoClient = require('mongodb').MongoClient;
const {ObjectID} = require('mongodb')

const notifications = {

  get: async (req, res) => {
    const collection = req.db.collection("notifications").find(
      {_id: ObjectID(req.params.id)})
    .toArray((err, docs) => {
      let result = docs.length ? docs[0] : {}
      res.status(200).send({
          ...result
      });
    })
       
  },
  getAll: async (req, res) => {
     const collection = req.db.collection("notifications").find({
      email: req.params.email
     })
      .toArray((err, docs) => {
        res.status(200).send({
            notifications: docs
        });
      })
  },
  markAsSeen: async (req, res) => {
      req.db.collection("notifications").updateMany({
        email: req.params.email,
        seen: false
      }, {
        $set: {seen: true}
      }, (err, r) => {
        if (err) {
          // If it failed, return error
          res.send("There was a problem updating the information in the database")
        }
        else {
          res.status(200).send(req.body)
        }
      })
  },
  create: async (req, res) => {
    if (req.body.email){
      req.body.createDate = new Date()
      req.body.seen = false
      req.db.collection('notifications').insertOne(req.body, (err, r) => {
        if (err) {
          // If it failed, return error
          res.send("There was a problem adding the information to the database.")
        }
        else {
            res.status(200).send(r);
        }
      })
    } else {
      res.send("user email is mandatory.")
    }
  },
  update: async (req, res) => {
    let obj = {...req.body}
    delete obj._id
    req.db.collection('notifications').updateOne(
      {_id: ObjectID(req.params.id)}, {$set: obj}, (err, r) => {
      if (err) {
        // If it failed, return error
        res.send("There was a problem updating the information in the database")
      }
      else {
        res.status(200).send(req.body);
      }
    })
  },
  delete: async (req, res) => {

  }
}

module.exports = notifications
