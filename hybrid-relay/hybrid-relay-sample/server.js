var fs = require('fs');
var net = require('net');
var urlParse = require('url').parse;
var WebSocket = require('hyco-websocket');
var WebSocketServer = require('hyco-websocket').relayedServer;

process.chdir(__dirname);

var argv = require('optimist').argv;
var pidfile;

//kill an already running instance
if (argv.kill) {
  pidfile = argv.kill;
  if (!pidfile.match(/\.pid$/i))
    pidfile += '.pid';
  try {
    var pid = fs.readFileSync(pidfile, 'utf8');
    fs.unlinkSync(pidfile);
    process.kill(parseInt(pid, 10));
    console.log('Killed process ' + pid);
  } catch (e) {
    console.log('Error killing process ' + (pid || argv.kill));
  }
  process.exit();
}

//write pid to file so it can be killed with --kill
if (argv.pidfile) {
  pidfile = argv.pidfile;
  if (!pidfile.match(/\.pid$/i))
    pidfile += '.pid';
  fs.writeFileSync(pidfile, process.pid);
}

var users = loadUsers();

if (argv._.length < 4) {
  console.log('server.js [namespace] [path] [key-rule] [key]')
  process.exit(1);
}

var ns = argv._[0];
var path = argv._[1];
var keyrule = argv._[2];
var key = argv._[3];

var wsServer = new WebSocketServer({
  server: WebSocket.createRelayListenUri(ns, path),
  token: function() {
    return WebSocket.createRelayToken('http://' + ns, keyrule, key);
  }
});

wsServer.on('request', function(request) {
  var url = urlParse(request.resource, true);
  var args = url.pathname.split('/').slice(1);
  var action = args.shift();
  var params = url.query;
  //if (action == 'tunnel') {
    createTunnel(request, params.port, params.host);
  //} else {
  //  request.reject(404);
  //}
});

function authenticate(request) {
  var encoded = request.headers['authorization'] || '', credentials;
  encoded = encoded.replace(/Basic /i, '');
  try {
    credentials = new Buffer(encoded, 'base64').toString('utf8').split(':');
  } catch (e) {
    credentials = [];
  }
  var user = credentials[0], pwd =credentials[1];
  return (users[user] == pwd);
}

function createTunnel(request, port, host) {
  if (!authenticate(request.httpRequest)) {
    request.reject(403);
    return;
  }
  request.accept(null, null, null, function(webSock) {
    console.log(webSock.remoteAddress + ' Connected - Protocol Version ' + webSock.webSocketVersion);

    var tcpSock = new net.Socket();

    tcpSock.on('error', function(err) {
      webSock.send(JSON.stringify({ status: 'error', details: 'Upstream socket error; ' + err }));
    });

    tcpSock.on('data', function(data) {
      webSock.send(data);
    });

    tcpSock.on('close', function() {
      webSock.close();
    });

    tcpSock.connect(port, host || '127.0.0.1', function() {
      webSock.on('message', function(msg) {
        if (msg.type === 'utf8') {
          console.log('Received utf message: ' + msg.utf8Data);
        } else {
          console.log('Received binary message of length ' + msg.binaryData.length);
          tcpSock.write(msg.binaryData);
        }
      });
      webSock.send(JSON.stringify({ status: 'ready', details: 'Upstream socket connected' }));
    });

    webSock.on('close', function() {
      tcpSock.destroy();
      console.log(webSock.remoteAddress + ' disconnected');
    });
  });
}

function loadUsers() {
  var lines = fs.readFileSync('./users.txt', 'utf8');
  var users = {};
  lines.split(/[\r\n]+/g).forEach(function(line) {
    var parts = line.split(':');
    if (parts.length == 2) {
      users[parts[0]] = parts[1];
    }
  });
  return users;
}

function parseAddr(str, addr) {
  if (str) {
    var parts = str.split(':');
    if (parts.length == 1) {
      if (parts[0] == parseInt(parts[0], 10).toString()) {
        addr.port = parts[0];
      } else {
        addr.host = parts[0];
      }
    } else
      if (parts.length == 2) {
        addr = { host: parts[0], port: parts[1] };
      }
  }
  return addr;
}
