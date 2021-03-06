const {APP_PORT} = process.env

const assert = require('assert')
const _ = require('underscore')
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

assert(!_.isUndefined(APP_PORT))


const app = express()
app.use(morgan('combined'))
app.use(cors())

var router = express.Router();

router.get('/test', (req, res) => {
  res.json({text: 'it works'})
})

app.use('/api', router)


app.listen(APP_PORT, function() {
  console.log(`listen on port ${APP_PORT}`)
})
