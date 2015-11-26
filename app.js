const H = require('highland')
const P = require('bluebird')
const promisify = P.promisify
const _ = require('underscore')
const cors = require('cors')
const express = require('express')
const assert = require('assert');
const bodyParser = require('body-parser')
const busboy = require('connect-busboy')
const path = require('path')
const uuid = require('node-uuid')
const fs = require('fs')

const PORT = 8000
var {MongoClient, ObjectID} = P.promisifyAll(require('mongodb'))
var url = 'mongodb://localhost:8017/local';


let mediaPath = path.resolve(__dirname, 'media')

const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(busboy())



app.use(function(req, res, next){
  req.db = name =>
    MongoClient.connectAsync(url).then((db) => db.collection(name))
  next()
})

app.get('/pretendents', (req, res)=> {
  req.db('pretendents')
    .then((pretendents) => pretendents.find({}).toArrayAsync())
    .then((docs) => res.json(docs))
})

app.post('/attachments',
    (req, res, next)=> {
      let {busboy} = req
      assert(!_.isUndefined(busboy))
      req.pipe(busboy)
      let parserStream = H(
        function(push) {
          busboy.on('file', (fieldname, file, filename, encoding, mimetype)=> {
            let name = uuid.v1()
            let extension = path.extname(filename)
            let saveTo = path.resolve(mediaPath, `${name}${extension}`)
            file.pipe(fs.createWriteStream(saveTo))
            push(null, {
              [fieldname]: { filename }
            })
          })
          busboy.on('field', (key, value, keyTruncated, valueTruncated) => {
            push(null, {[key]: value})
          })
          busboy.on('finish', () =>
            push(null, H.nil)
          )
        })
        .reduce({}, _.extend)

      req.data = new Promise((resolve) => {
        parserStream.apply(resolve)
      })
      next()
    },
    (req, res)=> {
      Promise.all([req.data, req.db('pretendents')])
        .then(([data, pretendents]) => {
          return Promise.all([
            pretendents.find(ObjectID(data.pretendentId)).toArrayAsync().then((docs) => { return docs.length === 1}),
            data,
            req.db('attachments'),
          ])
        })
        .then(([isUser, data, attachments])=> {
            assert(isUser)
            console.log(data)
            return attachments.insertAsync(data)
        })
        .then(({ops})=> {
            console.log('added an attachment')
            res.json(ops[0])
        })
        .catch((err)=> {
          console.log('some error')
          console.log(err)
        })
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
