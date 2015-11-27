const PORT = 8000
const P = require('bluebird')
const path = require('path')

var {MongoClient, ObjectID} = P.promisifyAll(require('mongodb'))
var url = 'mongodb://localhost:8017/local';
let mediaPath = path.resolve(__dirname, 'media')

MongoClient.connectAsync(url).then((db) => {
  let app = require('./app')(db, {})

  app.listen(PORT, function() {
    console.log(`listen on port ${PORT}`)
  })
})
