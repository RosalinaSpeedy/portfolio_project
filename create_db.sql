# Create database script for portfolio project

# Create the database
CREATE DATABASE IF NOT EXISTS portfolio_project;
USE portfolio_project;

-- # Create the tables
-- CREATE TABLE IF NOT EXISTS books (id INT AUTO_INCREMENT,name VARCHAR(50),price DECIMAL(5, 2) unsigned,PRIMARY KEY(id));
-- CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT, username VARCHAR(50), firstName VARCHAR(50), lastName VARCHAR(50), email VARCHAR(50), hashedPassword VARCHAR(100), PRIMARY KEY(id));

-- # Create the app user
-- CREATE USER IF NOT EXISTS 'bettys_books_app'@'localhost' IDENTIFIED BY 'qwertyuiop'; 
-- GRANT ALL PRIVILEGES ON bettys_books.* TO ' bettys_books_app'@'localhost';
