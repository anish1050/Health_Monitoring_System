const express = require('express');
const mysql = require('mysql');
const { SerialPort } = require('serialport'); // Correct import for SerialPort
const { ReadlineParser } = require('@serialport/parser-readline'); // Correct import for ReadlineParser

// Create the Express app
const app = express();
const port = 3000;

// MySQL connection setup
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Anish@1050',
  database: 'health_monitoring_system'
});

// Replace this with actual username if known or pass dynamically from frontend
const username = 'anish1050'; // Set this manually for now

// Connect to the MySQL database
db.connect((err) => {
  if (err) {
    console.log('Error connecting to database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Set up the SerialPort to read from Bluetooth (HC-05)
const serialPort = new SerialPort({ path: 'COM4', baudRate: 9600 }); // Updated instantiation
const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' })); // Updated to ReadlineParser

// Parse incoming data from Arduino
parser.on('data', (data) => {
  console.log('Received data:', data);

  const parts = data.split(/\s+/);
  if (parts.length < 4) {
    console.log('Invalid data format');
    return;
  }

  const bpmValue = parts[1];
  const stressValue = parts[3];

  if (!isNaN(bpmValue) && bpmValue > 0 && ['Low', 'Normal', 'Moderate', 'High'].includes(stressValue)) {
    const query = 'INSERT INTO health_data (username, heart_rate, stress, timestamp) VALUES (?, ?, ?, NOW())';
    db.query(query, [username, stressValue], (err, result) => {
      if (err) {
        console.log('Error inserting data:', err);
      } else {
        console.log('Data inserted into database:', result);
      }
    });
  } else {
    console.log('Invalid Heart Rate or Stress Value');
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
