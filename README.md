```
# Online Banking System

## Database Setup

Run the following SQL script in MySQL to create the database and tables:

sql
CREATE DATABASE online_banking;

USE online_banking;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    balance DECIMAL(10,2) DEFAULT 0.00
);

##After creating the .env file, change the content inside the file as mentioned below:

PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=#your login root password for MYSQL
DB_NAME=online_banking
JWT_SECRET=your_secret_key


## 📁 Project Structure

banking_system/
│
├── public/             # Static frontend files
│   └── index.html      # Main UI for the banking application
│
├── server.js           # Express server and API endpoints
└── .env                # Environment variables (DB credentials, JWT secret)


1️⃣ Install Dependencies
First, initialize your Node.js project and install the required packages:

mkdir online-banking
cd online-banking
npm init -y
npm install express mysql2 bcryptjs jsonwebtoken dotenv cors body-pars
