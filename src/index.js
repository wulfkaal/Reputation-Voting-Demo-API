const http = require('http');
const app = require('./app')
require('dotenv').config()

var port = normalizePort(process.env.PORT || process.env.SEMADA_PORT);
app.set('port', port);

var server = http.createServer(app);

server.listen(port);

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}
