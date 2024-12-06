require('dotenv').config(); // Load environment variables from .env file
const mqtt = require('mqtt');

// Connect to the MQTT broker using environment variables
const client = mqtt.connect(process.env.MQTT_BROKER_URL, { 
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD
});

// Handle connection events
client.on('connect', () => {
    console.log('Connected to MQTT broker');
});

client.on('error', (err) => {
    console.error('MQTT Error:', err);
});

client.on('reconnect', () => {
    console.log('Reconnecting to MQTT broker...');
});

// Function to publish data to a topic
function publishData(topic, message) {
    const formattedMessage = typeof message === 'object' ? JSON.stringify(message) : message;

    client.publish(topic, formattedMessage, { qos: 2 }, (err) => {
        if (err) {
            console.error('Publish error:', err);
        } else {
            console.log(`Message published to topic "${topic}":`, formattedMessage);
        }
    });
}

module.exports = { publishData };

// Receive messages
client.on('message', (topic, message) => {
    console.log(`Received message on topic "${topic}":`, message.toString());
});

client.on('error', (err) => {
    console.error('MQTT Client Error:', err);
});

setTimeout(() => {
    client.end();
    console.log('Disconnected from MQTT broker');
}, 60000); // Disconnect after 1 minute
