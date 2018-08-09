const proposals = {
  
  get: async (req, res) => {
    // let proposal = await proposalDataAccess.get(req.params.id)
    let proposal = {id: 1, url: 'https://hackernoon.com', semBalance: 50}
    res.status(200).send(proposal)
  },
  getAll: async (req, res) => {
    let proposals = await proposalDataAccess
      .getAll(req.params.daoId)
    
    res.status(200).send(proposals)
  },
  create: async (req, res) => {
    let id = await proposalDataAccess.create(req.body)
    let proposal = await proposalDataAccess.get(id)
    
    res.status(200).send(proposal)
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
