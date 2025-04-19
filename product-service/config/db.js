const mysql = require("mysql2");
require("dotenv").config();

// Get maximum retry attempts from environment or default to 5
const MAX_RETRIES = process.env.RETRY_CONNECT ? parseInt(process.env.RETRY_CONNECT) : 5;
let retryCount = 0;

// MySQL connection configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
};

let db;

function connectWithRetry() {
  console.log(`Attempting to connect to database (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
  
  db = mysql.createConnection(dbConfig);
  
  db.connect((err) => {
    if (err) {
      console.error('Database connection error:', err.message);
      
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        console.log(`Retrying connection in 5 seconds...`);
        setTimeout(connectWithRetry, 5000);
      } else {
        console.error(`Maximum retry attempts (${MAX_RETRIES}) reached. Exiting.`);
        process.exit(1);
      }
      return;
    }
    
    console.log("Connected to MySQL database successfully!");
    retryCount = 0; // Reset retry counter on successful connection
  });
  
  db.on('error', (err) => {
    console.error('Database connection lost:', err.message);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.log('Reconnecting to database...');
      connectWithRetry();
    } else {
      throw err;
    }
  });
}

// Initial connection attempt
connectWithRetry();

module.exports = db;
