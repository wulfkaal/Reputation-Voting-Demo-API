const MongoClient = require('mongodb').MongoClient;
const {ObjectID} = require('mongodb');
const ethUtil = require('ethereumjs-util');
const jwt = require('jsonwebtoken');

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
  getByPublicAddress: async(req, res) => {
    const collection = req.db.collection("users").find({publicAddress: req.params.publicAddress})
      .toArray((err, docs) => {
        res.status(200).send({
            users: docs
        });
      })
  },
  getAll: async (req, res) => {
    const collection = req.db.collection("users").find({})
      .toArray((err, docs) => {
        res.status(200).send({
            users: docs
        });
      })
  },
  create: async (req, res) => {
    req.db.collection('users').insertOne(req.body, (err, r) => {
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
    req.db.collection('users').updateOne({_id: ObjectID(req.params.id)}, {$set: obj}, function (err, r) {
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

  },
  auth: async(req, res) => {
    let obj = {...req.body}
    // const { signature, publicAddress } = req.body;
    if (!obj.signature || !obj.publicAddress)
      return res
        .status(400)
        .send({ error: 'Request should have signature and publicAddress' });

    // return (
    matchingUsers = req.db.collection("users").find({publicAddress: obj.publicAddress})
      .toArray((err, docs) => {
        if (err || !docs.length) {
          // If it failed, return error
          res
          .status(401)
          .send({ error: `User with publicAddress ${publicAddress} is not found in database` });
        }
        else {
          user = docs[0]
          console.log(user)
          const msg = `I am signing my one-time nonce: ${user.nonce}`;
          const msgBuffer = ethUtil.toBuffer(msg);
          const msgHash = ethUtil.hashPersonalMessage(msgBuffer);
          const signatureBuffer = ethUtil.toBuffer(obj.signature);
          const signatureParams = ethUtil.fromRpcSig(signatureBuffer);
          const publicKey = ethUtil.ecrecover(
            msgHash,
            signatureParams.v,
            signatureParams.r,
            signatureParams.s
          );
          const addressBuffer = ethUtil.publicToAddress(publicKey);
          const address = ethUtil.bufferToHex(addressBuffer);
          console.log("address " + address)
          console.log("public address " + obj.publicAddress.toLowerCase())
          if (address.toLowerCase() !== obj.publicAddress.toLowerCase()) {
            return res
              .status(401)
              .send({ error: 'Signature verification failed' });
          }
          let usr = user
          usr.nonce = Math.floor(Math.random() * 10000);
          // return user.save();
          delete usr._id
          req.db.collection('users').updateOne({_id: ObjectID(user._id)}, {$set: usr}, function (err, r) {
            if (err) {
                res
                .status(401)
                .send({ error: 'user updation failed' });
            }
          });
          const signFn = (publicAddress) => {
            return new Promise((resolve, reject) => {
              jwt.sign(
                {
                  payload: {
                    id: user._id,
                    publicAddress
                  }
                },
                process.env.AUTH_SECRET,
                null,
                (err, token) => {
                  if (err) {
                    return reject(err);
                  }
                  return resolve(token);
                }
              )
            });
          };
          signFn(obj.publicAddress).then(accessToken => {
            console.log("accessToken :" + accessToken)
            res.status(200).json({ accessToken })
          });
        }
      })
  }
}

module.exports = users
