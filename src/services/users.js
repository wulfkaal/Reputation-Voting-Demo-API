const users = {

  get: async (req, res) => {
    var db = req.db;
    var collection = db.get('users');
    collection.find({email: req.params.email},{},function(e,docs){
        let result = docs.length ? docs[0] : {}
        res.status(200).send({
            ...result
        });
    });
  },
  getAll: async (req, res) => {
    var db = req.db;
    var collection = db.get('users');
    collection.find({},{},function(e,docs){
        res.status(200).send({
            "users" : docs
        });
    });
  },
  create: async (req, res) => {
    var db = req.db;
    var collection = db.get('users');
    collection.insert(req.body , function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            res.status(200).send(doc);
        }
    });
  },
  update: async (req, res) => {
    var db = req.db;
    var collection = db.get('users');       
    collection.update({email: req.body.email}, req.body, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem updating the information in the database.");
        }
        else {
            res.status(200).send(doc);
        }
    });
  },
  delete: async (req, res) => {
    await proposalDataAccess.delete(req.params.id)
    
    res.status(200).send(req.params.id)
  }
}

module.exports = users
