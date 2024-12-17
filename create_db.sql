# Create database script for portfolio project

# Create the database
CREATE DATABASE IF NOT EXISTS portfolio_project;
USE portfolio_project;

CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) DEFAULT NULL,
  `firstName` varchar(50) DEFAULT NULL,
  `lastName` varchar(50) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `hashedPassword` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) 

CREATE TABLE IF NOT EXISTS `events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `fees` decimal(5,2) unsigned DEFAULT NULL,
  `location` varchar(400) NOT NULL,
  `date` date DEFAULT NULL,
  `createdAt` date DEFAULT NULL,
  `updatedAt` date DEFAULT NULL,
  `startTime` time DEFAULT NULL,
  `duration` int DEFAULT NULL,
  `description` varchar(100) DEFAULT NULL,
  `organiserId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `organiserId` (`organiserId`),
  CONSTRAINT `events_ibfk_1` FOREIGN KEY (`organiserId`) REFERENCES `users` (`id`)
) 

CREATE TABLE IF NOT EXISTS `attendees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `eventId` int DEFAULT NULL,
  `userId` int DEFAULT NULL,
  `ticketQuantity` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `eventId` (`eventId`,`userId`),
  KEY `userId` (`userId`),
  CONSTRAINT `attendees_ibfk_1` FOREIGN KEY (`eventId`) REFERENCES `events` (`id`),
  CONSTRAINT `attendees_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
)

# Create the app user
CREATE USER IF NOT EXISTS 'portfolio_project_app'@'localhost' IDENTIFIED BY 'qwertyuiop'; 
GRANT ALL PRIVILEGES ON portfolio_project.* TO ' portfolio_project_app'@'localhost';
