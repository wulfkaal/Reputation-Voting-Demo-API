const proposals = {

  get: async (req, res) => {
    var db = req.db;
    var collection = db.get('proposals');
    collection.find({_id:req.params.id},{},function(e,docs){
        res.status(200).send({
            "proposals" : docs
        });
    });
  },
  getAll: async (req, res) => {
    var db = req.db;
    var collection = db.get('proposals');
    collection.find({daoId:req.params.daoId},{},function(e,docs){
        res.status(200).send({
            "proposallist" : docs
        });
    });
  },
  create: async (req, res) => {
    var db = req.db;
    var collection = db.get('proposals');
    // TODO: Remove the below log
    console.log(req.body);
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
    await proposalDataAccess.update(req.body)
    
    res.status(200).send()
  },
  delete: async (req, res) => {
    await proposalDataAccess.delete(req.params.id)
    
    res.status(200).send(req.params.id)
  }
}

module.exports = proposals
