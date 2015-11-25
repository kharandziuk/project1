const H = require('highland')
const P = require('bluebird')
const promisify = P.promisify
const _ = require('underscore')
const cors = require('cors')
const express = require('express')
const assert = require('assert');
const bodyParser = require('body-parser')

const PORT = 8000
var {MongoClient, ObjectID} = P.promisifyAll(require('mongodb'))
var url = 'mongodb://localhost:8017/local';


const app = express()

app.use(cors())
app.use(bodyParser.json())

app.use(function(req, res, next){
  var db = MongoClient.connectAsync(url)
  req.db = (...names) => {
      return db.then((db)=> names.map(n => db.collection(n)))
  }
  next()
})

app.get('/pretendents', (req, res)=> {
  req.db('pretendents')
    .spread((pretendents) => pretendents.find({}).toArrayAsync())
    .then((docs) =>  res.json(docs))
})

app.post('/pretendents', (req, res)=> {
  req.db('pretendents')
    .spread((pretendents) => 
      pretendents.insertAsync(
        {firstName: '', lastName: ''}
      )
    )
    .then(({ops}) => {
      res.json(ops[0])
    })
})

app.put('/pretendents', (req, res)=> {
  let id = req.body._id
  req.db('pretendents')
    .spread((pretendents) =>
        pretendents.updateOneAsync({_id: ObjectID(id)}, _(req.body).omit('_id'))
    )
    .then((docs)=> res.json({'_id': id}))
})

app.listen(PORT, function() {
  console.log(`listen on port ${PORT}`)
})
