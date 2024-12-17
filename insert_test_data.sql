# Insert data into the tables - this adds one event with random data

USE portfolio_project;

INSERT INTO `events`
(`id`,
`name`,
`fees`,
`location`,
`date`,
`createdAt`,
`updatedAt`,
`startTime`,
`duration`,
`description`,
`organiserId`)
VALUES
(
<{name: 'Birthday'}>,
<{fees: '8.23'}>,
<{location: 'country=United Kingdom;city=London;street=Shoreditch High Street;houseNumber=19;postalCode=E1 6JN;'}>,
<{date: '2025-02-13'}>,
<{createdAt: '2024-12-12'}>,
<{updatedAt: '2024-12-12'}>,
<{startTime: '15:43:00'}>,
<{duration: '61'}>,
<{description: 'Celebrating!'}>,
<{organiserId: 1}>);