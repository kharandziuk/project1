const H = require('highland')
const P = require('bluebird')
const _ = require('underscore')
const cors = require('cors')
const express = require('express')
const assert = require('assert');
const bodyParser = require('body-parser')
const busboy = require('connect-busboy')
const path = require('path')
const uuid = require('node-uuid')
const fs = require('fs')
let {ObjectID} = require('mongodb')


const app = express()

module.exports = (db, config) => {
  app.use(cors())
  app.use(bodyParser.json())
  app.use(busboy())

  app.get('/pretendents', (req, res)=> {
    P.join(
      db.collection('pretendents').find({}).toArrayAsync(),
      db.collection('attachments').find({}).toArrayAsync()
    ).spread((pretendents, attachments) => {
      let results = pretendents.map((p)=> {
          p.attachments = attachments.filter((el) => {
            return (ObjectID(el.pretendentId).equals(ObjectID(p._id)))
          })
          return p
        })
      res.json({ results })
    }).catch((err)=> console.log(err))
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
        Promise.all([req.data, db.collection('pretendents')])
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
              res.json({result: ops[0]})
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
  return app
}
