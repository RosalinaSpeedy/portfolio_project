const { check, validationResult } = require('express-validator');

const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('/users/login') // redirect to the login page
    } else {
        next(); // move to the next middleware function
    }
}

const express = require("express")
const router = express.Router()

function calculateEndtime(result) {
    let startingTime = new Date();
    let [startHours, startMinutes, startSeconds] = result.startTime.split(':').map(Number);
    startingTime.setHours(startHours, startMinutes, startSeconds);
    endingTime = new Date();
    endingTime.setHours(startHours, startMinutes, startSeconds);
    endingTime.setMinutes(startingTime.getMinutes() + result.duration);
    endingTime = endingTime.toTimeString().split(' ')[0];
    return endingTime;
}

function getEvents(pageName, filters) {
    return new Promise((resolve, reject) => {
        var query = `SELECT * FROM events 
            JOIN users ON events.organiserId = users.id WHERE 1=1 `;
        //var parameters = [];
        console.log(filters);
        if (filters.searchText != '') {
            console.log(filters.searchText);
            query += ` AND CONCAT_WS(' ', users.username, events.name, events.description) LIKE '%${filters.searchText}%' `;
        }
        if (filters.date != '') {
            query += `AND events.date='${filters.date}' `
        }
        if (filters.location != '') {
            console.log(filters.location);
        }
        if (filters.distance != '') {
            console.log(filters.distance);
        }
        if (filters.ticketCost != '') {
            query += ` AND events.fees<='${filters.ticketCost}' `
        }
        console.log(query);
        db.query(query, (err, result) => {
            if (err) {
                console.error(err.message);
                reject(err); // if there is an error reject the Promise
            } else {
                for (let i = 0; i < result.length; i++) {
                    result[i].endTime = calculateEndtime(result[i]);
                }
                console.log(result)
                resolve(result); // the Promise is resolved with the result of the query
            }
        });
    })
}

router.get('/list', redirectLogin, function (req, res, next) {
    let sqlquery = "SELECT events.*, users.username FROM events JOIN users ON events.organiserId = users.id" // query database to get all the books
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err)
        }
        for (let i = 0; i < result.length; i++) {
            result[i].endTime = calculateEndtime(result[i]);
            result[i].yourEvent = false;
            result[i].attending = false;
            if (result[i].organiserId == req.session.databaseId) {
                result[i].yourEvent = true;
                result[i].attending = true;
            }
        }
        console.log(result);
        res.render("list.ejs", { events: result })
    })
})

router.get('/addevent', redirectLogin, function (req, res, next) {
    console.log(req.session.databaseId)
    res.render('addevent.ejs')
})

router.post('/eventadded', redirectLogin, [check('name').notEmpty(), check('fees').isDecimal()], function (req, res, next) {
    console.log(req.session.databaseId)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log("error")
        res.redirect('./addevent');
    } else {
        console.log("adding event");
        // saving data in database

        let startTime = new Date("1970-01-01T" + req.body.startTime + ":00Z");
        let endTime = new Date("1970-01-01T" + req.body.endTime + ":00Z");
        console.log(startTime);
        console.log(endTime);
        let durationMs = endTime - startTime;
        if (durationMs < 0) {
            endTime = new Date("1970-01-02T" + req.body.endTime + ":00Z");
            durationMs = endTime - startTime;
        }
        let durationMinutes = Math.floor((durationMs) / (60000));

        //(id INT AUTO_INCREMENT,name VARCHAR(50),fees DECIMAL(5, 2) unsigned, location VARCHAR(50), date DATE, createdAt DATE, updatedAt DATE, startTime TIME, duration INT, status VARCHAR(50), description VARCHAR(100), organiserId INT, FOREIGN KEY (organiserId) REFERENCES users(id), PRIMARY KEY(id));
        let sqlquery = "INSERT INTO events (name, fees, location, date, createdAt, updatedAt, startTime, duration, description, organiserId) VALUES (?,?,?,?,NOW(),NOW(),?,?,?,?)"
        // execute sql query
        let newrecord = [
            req.sanitize(req.body.name),
            req.sanitize(req.body.fees),
            req.sanitize(req.body.location),
            req.body.date,
            req.body.startTime,
            durationMinutes,
            req.sanitize(req.body.description),
            req.session.databaseId
        ]
        db.query(sqlquery, newrecord, (err, result) => {
            if (err) {
                next(err)
            }
            else {
                let eventId = result.insertId;
                let attendeeQuery = "INSERT INTO attendees (eventId, userId, ticketQuantity) VALUES (?, ?, ?)";
                let attendeeRecord = [eventId, req.session.databaseId, 1];
                db.query(attendeeQuery, attendeeRecord, (err, result1) => {
                    if (err) {
                        next(err)
                    }
                    else {
                        console.log(result1);
                    }
                })
                res.send(' This event is added to database, name: ' + req.sanitize(req.body.name) + ' price ' + req.sanitize(req.body.fees))
            }
        })
    }
})

router.get('/search', redirectLogin, function (req, res, next) {
    res.render("search.ejs")
})

router.get('/search_result', redirectLogin, function (req, res, next) {
    console.log(req.query.date);
    console.log(req.query);
    filters = {
        searchText: req.sanitize(req.query.search_text),
        date: req.query.date,
        location: req.sanitize(req.query.location),
        distance: req.query.distance,
        ticketCost: req.query.ticketCost
    }
    console.log(filters);
    for (var key in filters) {
        if (filters.hasOwnProperty(key)) {
            console.log(key + " -> " + filters[key]);
            if (filters[key] == undefined) filters[key] = '';
        }
    }
    Promise.all([
        getEvents("search_result", filters)
    ]).then(([events]) => {
        res.render("list.ejs", {
            events
        });
    }).catch((error) => {
        console.log(
            "Error getting data from database calls or in the code above"
        );
    });
})

router.get("/getticket/:id", redirectLogin, (req, res) => {
    try {
        const eventId = req.params.id;
        let sqlquery = `SELECT events.*, users.username FROM events JOIN users ON events.organiserId = users.id WHERE events.id=${eventId}`;
        db.query(sqlquery, (err, result) => {
            if (err) {
                next(err)
            }
            for (let i = 0; i < result.length; i++) {
                result[i].endTime = calculateEndtime(result[i]);
            }
            //console.log(result);
            res.render("getticket.ejs", { event: result[0] })
        })
    } catch {
        res.send("Something done gone wrong");
    }
});

router.get("/ammendbooking/:id", redirectLogin, (req, res) => {
    try {
        const eventId = req.params.id;
        //let sqlquery = `SELECT events.*, users.username FROM events JOIN users ON events.organiserId = users.id WHERE events.id=${eventId}`;
        let sqlquery = `SELECT 
                        events.*, 
                        users.username, 
                        attendees.ticketQuantity
                        FROM 
                            events
                        JOIN 
                            users 
                            ON events.organiserId = users.id
                        LEFT JOIN 
                            attendees 
                            ON attendees.eventId = events.id AND attendees.userId = ${req.session.databaseId}
                        WHERE 
                            events.id = ${eventId};`
        db.query(sqlquery, (err, result) => {
            if (err) {
                next(err)
            }
            for (let i = 0; i < result.length; i++) {
                result[i].endTime = calculateEndtime(result[i]);
            }
            //console.log(result);
            res.render("ammendbooking.ejs", { event: result[0] })
        })
    } catch {
        res.send("Something done gone wrong");
    }
});

router.post("/eventbooked/:id", redirectLogin, (req, res) => {
    try {
        const eventId = req.params.id;
        let sqlquery = `SELECT events.*, users.username, users.email FROM events JOIN users ON events.organiserId = users.id WHERE events.id=${eventId}`;
        let insertquery = `INSERT INTO attendees (eventId, userId, ticketQuantity)
                           VALUES (?, ?, ?)
                           ON DUPLICATE KEY UPDATE 
                           ticketQuantity = VALUES(ticketQuantity);`;
        db.query(sqlquery, (err, result) => {
            if (err) {
                next(err)
            }
            result[0].endTime = calculateEndtime(result[0]);
            insertParams = [result[0].id, req.session.databaseId, req.body.attendees];
            db.query(insertquery, insertParams, (err, result1) => {
                if (err) {
                    res.send("database insert failed");
                }
                result.ticketNo = req.body.attendees;
                res.render("eventbooked.ejs", { event: result[0] })
            })
            //console.log(result);
        })
    } catch {
        res.send("Error");
    }
});



// Export the router object so index.js can access it
module.exports = router