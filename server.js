const {APP_PORT} = process.env

const assert = require('assert')
const _ = require('underscore')
assert(!_.isUndefined(APP_PORT))
var http = require('http');

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('Hello World\n');
}).listen(APP_PORT);
console.log(`Server running at http://APP_PRIVATE_IP_ADDRESS:${APP_PORT}/`);
