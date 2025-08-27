const mysql = require('mysql2');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

// Adjust this COM port to match what you found from Device Manager
const port = new SerialPort({ path: 'COM4', baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Anish@1050',
  database: 'health_monitoring_system'
});

parser.on('data', (data) => {
  const username = global.loggedInUsername; // <-- set this when login happens
  const heartRate = parseInt(data);

  if (isNaN(heartRate)) return;

  const query = 'INSERT INTO health_data (username, heart_rate) VALUES (?, ?)';
  db.query(query, [username, heartRate], (err, result) => {
    if (err) return console.error('DB insert error:', err);
    console.log(`Heart rate (${heartRate}) inserted for user: ${username}`);
  });
});
