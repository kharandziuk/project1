const H = require('highland')
const P = require('bluebird')
const R = P.promisify(require('request'))
const _ = require('underscore')
const cors = require('cors')
const express = require('express')

const PORT = 8000

const app = express()
app.use(cors())

app.get('/pretendents', (req, res)=> {
  res.json([
    { id: 1, firstName: 'Max', lastName: 'Kharandziuk'},
    { id: 2, firstName: 'Olga', lastName: 'Yaksun'},
    { id: 3, firstName: 'Katia', lastName: 'Bukina'},
  ])
})
app.listen(PORT, function() {
  console.log(`listen on port ${PORT}`)
})
