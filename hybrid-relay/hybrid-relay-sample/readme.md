# TCP tunnels through Azure Relay Hybrid Connections  

This sample illustrates how to create fully transparent TCP socket tunnels using Azure Relay
Hybrid Connections with Node. This sample is a fork and adaptation of the [node-websocket-tunnel](https://github.com/sstur/node-websocket-tunnel)
project by [Simon Sturmer](https://github.com/sstur).  

Comparing this project and the base project illustrates the differences between the regular WebSocket 
stack and using the Hybrid Connections variant.  

This tool allows you to tunnel TCP connections over WebSocket protocol using SSL/TLS. It consists of a 
server agent and a client console. If the server agent is running on a remote machine you can use it 
as a middle-man to route connections securely to any network host even through firewalls and proxies.

## Example use-cases:
 - You are on a restricted network that only allows traffic on port 443
 - You wish to connect securely to a service from a public access point, and cannot use SSH

Due to WebSocket connections starting out as normal HTTPS, this can be used to tunnel connections through certain
restrictive firewalls that do not even allow SSH or OpenVPN over port 443.

## Usage

On a server, run `server.js` specifying the namespace and path for a previously created 
Azure Relay Hybrid Connection, as well as a SAS rule name and key that grants "Listen" permission 
for that path:

`node server.js myns.servicebus.windows.net mypath listenrule [base64 key]`

On a client, run `connect.js` specifying namespace and path of an Azure Relay Hybrid Connection with
an active listener, along with a SAS rule name and a key that grants "Send" permission:

`node connect.js myns.servicebus.windows.net mypath sendrule [base64 key]`

You will be prompted for username/password, which the server will be verified against users.txt once you
establish a connection, then you are presented with a command shell where you can create and destroy tunnels.

> **Security note:**
> The users.txt file holds username and password for the server in clear text! Mind that this is a 
> code sample showing that you can flow the "Authorization" header end-to-end in addition to the 
> security boundary provided by the Relay. It's not a sample that illustrates management of user 
> secrets. (The base sample uses an unsalted MD5 hash, which is worse as it suggests being a solution)

`> tunnel 3306 8.12.44.238:3306`

This will listen on port 3306 on the client (localhost) and forward connections to remote host 8.12.44.238 via the
WebSocket server. Destination port, if omitted, will default to source port.

There is no need to manage SSL/TLS certificates for this sample, unlike in the base sample. TLS 
is handles by the cloud service for both legs of the network connection.  

> ** Security note:**
> This sample (not Hybrid Connections per-se) permits any authorized client to establish a tunnel 
> to any TCP network destination that the server can connect to. The client program "connect.js"
> will expose a raw TCP connectivity path. Be aware that once you have started the *connect.js* 
> program with a valid send key, have interactively entered a password held in users.txt *and* have explicitly 
> opened the tunnel (three boundaries), there is no further protection mechanism for the destination 
> other than what it itself provided as a native security model. (It shouldn't be necessary to make
> that point, but better be safe)
