import express from "express";
import mysql from "mysql2";
import bodyParser from "body-parser";
import cors from "cors";
import axios from "axios";
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import dotenv from "dotenv";
import { fork } from "child_process"; 
import { fileURLToPath } from "url";
import path from "path";

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ CORS setup
const prodOrigins = [process.env.ORIGIN_1, process.env.ORIGIN_2];
const devOrigin = ["http://localhost:5173"];
const allowedOrigins =
  process.env.NODE_ENV === "production" ? prodOrigins : devOrigin;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(bodyParser.json());

const db = mysql.createConnection ({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Hugging Face API key

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to database.');
});

// Registration route
app.post('/health_monitoring_system/users/register', (req, res) => {
    const { first_name, last_name, username, email, password } = req.body;

    // Checks if user with the same email already exists
    const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkEmailQuery, [email], (err, result) => {
        if (err) {
            console.error('Error checking email:', err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        // If email already exists, returns error
        if (result.length > 0) {
            return res.json({ success: false, message: 'Email is already registered' });
        }
        // Insert the user data into the database
        const query = 'INSERT INTO users (first_name, last_name, username, email, password) VALUES (?, ?, ?, ?, ?)';
        db.query(query, [first_name, last_name, username, email, password], (err, result) => {
            if (err) {
                console.error('DB insert error:', err);
                return res.status(500).json({ success: false, message: "Database error" });
            }
            res.json({ success: true });
        });

    });
});

// Login route
app.post('/health_monitoring_system/users/login', (req, res) => {
    const { email, password } = req.body;

    // Find user by email
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, result) => {
        if (err) {
            console.error('DB query error:', err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        // If no user is found
        if (result.length === 0) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Compare password with the hashed password from the database
        const user = result[0]; // Get the first (and ideally only) user

        if (password === user.password) {
            return res.json({
                success: true,
                message: 'Login successful',
                username: user.username
            });
        } else {
            return res.json({ success: false, message: 'Invalid credentials' });
        }

        if (password === user.password) {
            global.loggedInUsername = user.username;
        
            // Optionally, start the Bluetooth listener script
            const { fork } = require('child_process');
            fork('bluetooth-reader.js');
        
            return res.json({
                success: true,
                message: 'Login successful',
                username: user.username
            });
        }
        
    });
});

//Primary Heart Rate
app.post('/health_monitoring_system/health_data', (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ success: false, message: 'Username is required' });
    }

    const query = 'SELECT heart_rate FROM health_data WHERE username = ?';

    db.query(query, [username], (err, result) => {
        if (err) {
            console.error('DB query error:', err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        if (result.length === 0) {
            return res.json({ success: false, message: 'No data found' });
        }

        return res.json({ success: true, heart_rate: result[0].heart_rate });
    });
});

//Heart Rate With Time
app.get('/health_monitoring_system/health_data', (req, res) => {
    const query = `
  SELECT 
  heart_rate,
  timestamp,
  CASE 
    WHEN HOUR(timestamp) BETWEEN 5 AND 11 THEN 'Morning'
    WHEN HOUR(timestamp) BETWEEN 12 AND 16 THEN 'Afternoon'
    WHEN HOUR(timestamp) BETWEEN 17 AND 21 THEN 'Evening'
    ELSE 'Other'
  END AS period
FROM anish_health_monitoring_system.health_data
ORDER BY timestamp DESC;
`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('DB query error:', err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        const grouped = {
            Morning: [],
            Afternoon: [],
            Evening: [],
        };

        results.forEach(row => {
            if (grouped[row.period]) {
                grouped[row.period].push({
                    heart_rate: row.heart_rate,
                    timestamp: row.timestamp
                });
            }
        });

        res.json({ success: true, data: grouped });
    });
});

// async function getHealthInsights(heartRate) {
//     const input = `Provide health insights for someone with a heart rate of ${heartRate} BPM. Include recommendations.`;

//     try {
//         const response = await axios.post(
//             'https://api-inference.huggingface.co/models/google/flan-t5-base',
//             { 
//                 inputs: input,
//                 parameters: {
//                     max_length: 150,
//                     temperature: 0.3,
//                     do_sample: true
//                 }
//             },
//             {
//                 headers: {
//                     Authorization: `Bearer ${HF_API_TOKEN}`,
//                     'Content-Type': 'application/json',
//                 },
//                 timeout: 30000 // Increased timeout for model loading
//             }
//         );

//         console.log('Hugging Face API response:', response.data);

//         // FLAN-T5 returns an array with generated_text
//         if (Array.isArray(response.data) && response.data.length > 0) {
//             if (response.data[0].generated_text) {
//                 return response.data[0].generated_text;
//             }
//             // Sometimes the response is directly the text
//             if (typeof response.data[0] === 'string') {
//                 return response.data[0];
//             }
//         }
        
//         // Handle single object response
//         if (response.data && response.data.generated_text) {
//             return response.data.generated_text;
//         }
        
//         // Handle direct string response
//         if (typeof response.data === 'string') {
//             return response.data;
//         }

//         // Log unexpected format for debugging
//         console.log('Unexpected response format:', response.data);
//         return getFallbackResponse(heartRate);

//     } catch (error) {
//         console.error('Hugging Face API error:', error);

//         // Handle specific error cases
//         if (error.response) {
//             console.error('Error status:', error.response.status);
//             console.error('Error data:', error.response.data);
            
//             // Model loading error (503)
//             if (error.response.status === 503) {
//                 console.log('Model is loading, this might take a few minutes...');
//                 return `Model is currently loading. Please try again in a few minutes. In the meantime: ${getFallbackResponse(heartRate)}`;
//             }
            
//             // Authentication error (401)
//             if (error.response.status === 401) {
//                 console.log('Authentication failed - check your API token');
//                 return getFallbackResponse(heartRate);
//             }
//         }

//         return getFallbackResponse(heartRate);
//     }
// }

// Helper function for fallback responses
function getFallbackResponse(heartRate) {
    const normalRange = heartRate >= 60 && heartRate <= 100;
    const lowHR = heartRate < 60;
    const highHR = heartRate > 100;

    let response = `Your heart rate is ${heartRate} BPM. `;

    if (normalRange) {
        response += "This is within the normal resting range (60-100 BPM). Keep up healthy habits!";
    } else if (lowHR) {
        response += "This is below the typical resting range. If you're not an athlete, consult a doctor.";
    } else if (highHR) {
        response += "This is above the typical resting range. Stress, dehydration, or illness may be factors.";
    }

    return response;
}


// Health data route that provides AI insights
app.post('/health_monitoring_system/health_data/insights', async (req, res) => {
    const { username } = req.body;
  
    if (!username) {
      return res.status(400).json({ success: false, message: 'Username is required' });
    }
  
    const query = 'SELECT heart_rate FROM anish_health_monitoring_system.health_data WHERE username = ? ORDER BY timestamp DESC LIMIT 1';
  
    db.query(query, [username], async (err, result) => {
      if (err) {
        console.error('DB query error:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
  
      if (result.length === 0) {
        return res.json({ success: false, message: 'No data found' });
      }
  
      const heartRate = result[0].heart_rate;
      
      // Get AI health insights
      const insights = await getFallbackResponse(heartRate);
  
      res.json({ success: true, heart_rate: heartRate, insights: insights });
    });
  });


  app.post('/health_monitoring_system/health_data/spo2', (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ success: false, message: 'Username is required' });
    }

    const query = 'SELECT heart_rate FROM anish_health_monitoring_system.health_data WHERE username = ? ORDER BY timestamp DESC LIMIT 1';

    db.query(query, [username], (err, result) => {
        if (err) {
            console.error('DB query error:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (result.length === 0) {
            return res.json({ success: false, message: 'No heart rate data found for this user' });
        }

        const heartRate = result[0].heart_rate;

        // Simulate SpO2 estimation based on heart rate
        let spo2 = 98 - Math.abs(heartRate - 75) * 0.05;
        spo2 = Math.max(90, Math.min(spo2, 100)); // Clamp to 90–100%

        res.json({ 
            success: true, 
            heart_rate: heartRate, 
            estimated_spo2: parseFloat(spo2.toFixed(2)) 
        });
    });
});

function readHeartRateFromArduino() {
    return new Promise((resolve, reject) => {
        let timeout = setTimeout(() => {
            port.close();
            reject(new Error("Timeout while reading heart rate"));
        }, 7000); // wait max 7 seconds

        port.open((err) => {
            if (err) {
                clearTimeout(timeout);
                return reject(err);
            }

            parser.once('data', (line) => {
                clearTimeout(timeout);
                port.close();
                const hr = parseInt(line.trim());
                if (!isNaN(hr)) {
                    resolve(hr);
                } else {
                    reject(new Error("Invalid heart rate data"));
                }
            });
        });
    });
}

// API route to get health data from MySQL
app.get('/api/health_data', (req, res) => {
    const query = 'SELECT * FROM anish_health_monitoring_system.health_data ORDER BY timestamp DESC LIMIT 10';
    
    db.query(query, (err, results) => {
      if (err) {
        console.log('Error fetching data:', err);
        res.status(500).send('Error fetching data');
      } else {
        res.json(results); // Send the results as JSON
      }
    });
  });
  

// app.post('/health_monitoring_system/health_data/insert', (req, res) => {
//     const { username, heart_rate } = req.body;

//     if (!username || !heart_rate) {
//         return res.status(400).json({ success: false, message: 'Missing required fields' });
//     }

//     // Determine time of day
//     const currentHour = new Date().getHours();
//     let time_of_day = 'Morning';

//     if (currentHour >= 12 && currentHour < 17) {
//         time_of_day = 'Afternoon';
//     } else if (currentHour >= 17 || currentHour < 5) {
//         time_of_day = 'Evening';
//     }

//     const query = 'INSERT INTO health_data (username, heart_rate, time_of_day) VALUES (?, ?, ?)';
//     db.query(query, [username, heart_rate, time_of_day], (err, result) => {
//         if (err) {
//             console.error('DB insert error:', err);
//             return res.status(500).json({ success: false, message: 'Database error' });
//         }
//         return res.json({ success: true, message: `Heart rate inserted for ${time_of_day}` });
//     });
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
