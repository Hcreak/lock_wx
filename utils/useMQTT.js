var Paho = require('utils/paho-mqtt-min.js')

client = new Paho.Client("172.20.0.145", 8083, "clientId");
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;
client.connect({
	useSSL: false,
	userName: 'user',
	password: 'pwd',
	cleanSession: true,
	keepAliveInterval: 30,
	onSuccess: onConnect });

function onConnect() {
	// Once a connection has been made, make a subscription and send a message.
	console.log("onConnect");
	client.subscribe("/World");
	message = new Paho.MQTT.Message("Hello");
	message.destinationName = "/World";
	client.send(message);
};
function onConnectionLost(responseObject) {
	if (responseObject.errorCode !== 0)
		console.log("onConnectionLost:" + responseObject.errorMessage);
};
function onMessageArrived(message) {
	console.log("onMessageArrived:" + message.payloadString);
};