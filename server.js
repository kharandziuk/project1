const {APP_PORT} = process.env

const assert = require('assert')
const _ = require('underscore')
const express = require('express')
assert(!_.isUndefined(APP_PORT))


const app = express()

app.get('/test', (req, res) => {
  res.json({text: 'it works'})
})

app.listen(APP_PORT, function() {
  console.log(`listen on port ${APP_PORT}`)
})
