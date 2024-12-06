require('dotenv').config(); // Load environment variables from .env file
const mqtt = require('mqtt');

// Connect to the MQTT broker using environment variables
const client = mqtt.connect(process.env.MQTT_BROKER_URL, { 
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD
});

// When connected to the broker
client.on('connect', () => {
    console.log('Connected to MQTT broker');
    
    // Subscribe to a topic
    const topic = '/arduino/stats'; // Replace with the topic you want to subscribe to
    client.subscribe(topic, (err) => {
        if (err) {
            console.error('Failed to subscribe to topic:', err);
        } else {
            console.log(`Subscribed to topic: ${topic}`);
        }
    });
});

// Handle incoming messages
client.on('message', (topic, message) => {
    console.log(`Received message on topic "${topic}":`, message.toString());
});

// Handle errors
client.on('error', (err) => {
    console.error('MQTT Client Error:', err);
});

// Close the client after a period of time (optional)
setTimeout(() => {
    client.end();
    console.log('Disconnected from MQTT broker');
}, 60000); // Disconnect after 1 minute
