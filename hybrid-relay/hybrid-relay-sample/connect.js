var https = require('https');
var tunnel = require('./lib/tunnel');
var WebSocket = require('hyco-websocket');

var argv = require('optimist').argv;
if (argv._.length < 4) {
  console.log('connect.js [namespace] [path] [key-rule] [key]')
  process.exit(1);
}

var ns = argv._[0];
var path = argv._[1];
var keyrule = argv._[2];
var key = argv._[3];
var server = WebSocket.createRelaySendUri(ns, path);
var token = WebSocket.createRelayToken('http://' + ns, keyrule, key);

var credentials, tunnels = [];

var shell = global.shell = require('./lib/shell');

shell.on('command', function(cmd, args) {
  if (cmd == 'help') {
    shell.echo('Commands:');
    shell.echo('tunnel [localhost:]port [remotehost:]port');
    shell.echo('close [tunnel-id]');
    shell.echo('list');
    shell.echo('exit');
    shell.prompt();
  } else
  if (cmd == 'tunnel') {
    tunnel.createTunnel(server, token, credentials, args[0], args[1], function(err, server) {
      if (err) {
        shell.echo(String(err));
      } else {
        var id = tunnels.push(server);
        shell.echo('Tunnel created with id: ' + id);
      }
      shell.prompt();
    });
  } else
  if (cmd == 'close') {
    var id = parseInt(args[0], 10) - 1;
    if (tunnels[id]) {
      tunnels[id].close();
      tunnels[id] = null;
      shell.echo('Tunnel ' + (id + 1) + ' closed.');
    } else {
      shell.echo('Invalid tunnel id.');
    }
    shell.prompt();
  } else
  if (cmd == 'list') {
    shell.echo('Number of Tunnels: ' + tunnels.length);
    shell.prompt();
  } else
  if (cmd == 'exit') {
    shell.exit();
  } else {
    shell.echo('Invalid command. Type `help` for more information.');
    shell.prompt();
  }
});

shell.echo('WebSocket Tunnel Console v0.1');
shell.echo('Remote Host: ' + ns);

authenticate(function() {
  shell.prompt();
});

function authenticate(callback) {
  shell.prompt('Username: ', function(user) {
    shell.prompt('Password: ', function(pw) {
      credentials = user + ':' + pw;
      callback();
    }, {passwordMode: true});
  });
}
