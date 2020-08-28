/**
 * receive incoming messages from IoT Hub
 */ 
$(document).ready(() => 
{
    // if deployed to a site supporting SSL, use wss://
    const protocol = document.location.protocol.startsWith('https') ? 'wss://' : 'ws://';
    const webSocket = new WebSocket(protocol + location.host);

    // when socket receives message, try to display to user
    webSocket.onmessage = function onMessage(message) 
    {
        try 
        {
            const messageData = message.data;
            //separate data fields by two spaces.
            document.getElementById("iothub-message-output-box").innerText = JSON.stringify(JSON.parse(messageData), null, 2);
        }

        catch (err) {
            console.error(err);
        }
    };
});