# Create database script for portfolio project

# Create the database
CREATE DATABASE IF NOT EXISTS portfolio_project;
USE portfolio_project;

-- # Create the tables
-- CREATE TABLE IF NOT EXISTS books (id INT AUTO_INCREMENT,name VARCHAR(50),price DECIMAL(5, 2) unsigned,PRIMARY KEY(id));
CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT, username VARCHAR(50), firstName VARCHAR(50), lastName VARCHAR(50), email VARCHAR(50), hashedPassword VARCHAR(100), PRIMARY KEY(id));
CREATE TABLE IF NOT EXISTS events (id INT AUTO_INCREMENT,name VARCHAR(50),fees DECIMAL(5, 2) unsigned, location VARCHAR(50), date DATE, createdAt DATE, updatedAt DATE, startTime TIME, duration INT, description VARCHAR(100), organiserId INT, FOREIGN KEY (organiserId) REFERENCES users(id), PRIMARY KEY(id));
CREATE TABLE `attendees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `eventId` int DEFAULT NULL,
  `userId` int DEFAULT NULL,
  `ticketQuantity` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `eventId` (`eventId`),
  KEY `userId` (`userId`),
  CONSTRAINT `attendees_ibfk_1` FOREIGN KEY (`eventId`) REFERENCES `events` (`id`),
  CONSTRAINT `attendees_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `portfolio_project`.`attendees`
(`id`,
`eventId`,
`userId`,
`ticketQuantity`)
VALUES
(<{id: }>,
<{eventId: }>,
<{userId: }>,
<{ticketQuantity: 0}>);

# Create the app user
CREATE USER IF NOT EXISTS 'portfolio_project_app'@'localhost' IDENTIFIED BY 'qwertyuiop'; 
GRANT ALL PRIVILEGES ON portfolio_project.* TO ' portfolio_project_app'@'localhost';
