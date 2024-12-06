require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mqtt = require('mqtt');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

let stats = {}; // Change to an object to hold a single data item

const mqttClient = mqtt.connect('mqtt://broker.hivemq.com', {
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD
});

mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');
    mqttClient.subscribe('/arduino/stats', (err) => {
        if (err) {
            console.error('Failed to subscribe to topic:', err);
        } else {
            console.log('Subscribed to /arduino/stats');
        }
    });
});

mqttClient.on('message', (topic, message) => {
    console.log(`Received message on topic "${topic}":`, message.toString());
    const receivedData = JSON.parse(message.toString());

    // Reassign stats to a new object with the latest data
    stats = {
        ...receivedData,
        timestamp: new Date().toISOString(),
    };
});

app.post('/stats', (req, res) => {
    const data = req.body;

    if (!data || typeof data !== 'object') {
        return res.status(400).json({ error: 'Invalid data' });
    }

    // Reassign stats to a new object with the received data
    stats = {
        ...data,
        timestamp: new Date().toISOString(),
    };

    res.status(200).json({ message: 'Data received successfully' });

    const topic = '/arduino/stats';
    const formattedMessage = JSON.stringify(data);
    mqttClient.publish(topic, formattedMessage, { qos: 2 }, (err) => {
        if (err) {
            console.error('Publish error:', err);
        } else {
            console.log(`Message published to topic "${topic}":`, formattedMessage);
        }
    });
});

app.get('/stats', (req, res) => {
    console.log("Latest stats:", stats);
    res.status(200).json(stats);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

module.exports = { stats };
