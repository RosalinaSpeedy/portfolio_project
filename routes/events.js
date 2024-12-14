const request = require('request')

const { check, validationResult } = require('express-validator');

const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('../users/login') // redirect to the login page
    } else {
        next(); // move to the next middleware function
    }
}

const express = require("express")
const router = express.Router()

let apiKey = 'tCNGoZKIq4A6VjAmsFcEiXb1u4a56MFNrsUzfEIa3fY'
let url = `https://js.api.here.com/v3/3.1/`
let appCode = 'MJlbBVYv5uTduZ53sy4N'

function getEvents(pageName, filters, userId) {
    return new Promise((resolve, reject) => {
        var query = `SELECT events.*, users.username,
                     CASE 
                     WHEN attendees.userId IS NOT NULL THEN 1 
                     ELSE 0 
                     END AS attending,
                     CASE WHEN events.organiserId = ? THEN 1 
                     ELSE 0 
                     END AS yourEvent,
                     ADDTIME(events.startTime, SEC_TO_TIME(events.duration * 60)) AS endTime
                     FROM events
                     JOIN users 
                     ON events.organiserId = users.id
                     LEFT JOIN attendees 
                     ON events.id = attendees.eventId 
                     AND attendees.userId = ?
                     WHERE 1=1 `;
        console.log(filters);

        if (filters.searchText != '') {
            console.log(filters.searchText);
            query += ` AND CONCAT_WS(' ', users.username, events.name, events.description) LIKE '%${filters.searchText}%' `;
        }
        if (filters.date != '') {
            query += `AND events.date='${filters.date}' `;
        }
        if (filters.location != '') {
            console.log(filters.location);
            query += ` AND events.location LIKE '%${filters.searchText}%' `;
        }
        if (filters.ticketCost != '') {
            query += ` AND events.fees<='${filters.ticketCost}' `;
        }
        console.log(query);
        console.log(filters);
        console.log(filters.latitude);
        console.log(filters.longitude);
        let eventParameters = [userId, userId]
        db.query(query, eventParameters, async (err, result) => {
            if (err) {
                console.error(err.message);
                reject(err);
                return;
            } else {
                if (filters.distance != 'na' && filters.latitude && filters.longitude) {
                    console.log(filters.distance);
                    const userLat = parseFloat(filters.latitude);
                    const userLon = parseFloat(filters.longitude);
                    const distanceLimit = parseInt(filters.distance);
                    console.log("Found distance limit: " + distanceLimit)
                    let promises = result.map(event => {
                        let tempApiUrl = `https://geocode.search.hereapi.com/v1/geocode?q=${event.location}&units=metric&appcode=${appCode}&apikey=${apiKey}`;
                        return new Promise((resolve, reject) => {
                            request(tempApiUrl, function (err, response, body) {
                                if (err) {
                                    console.log(err);
                                    reject(err);
                                    return;
                                } else {
                                    try {
                                        let loc = JSON.parse(body);
                                        if (loc.items[loc.items.length - 1].position !== undefined) {
                                            console.log(loc.items[loc.items.length - 1])
                                            console.log(loc.items[loc.items.length - 1].position);
                                            const eventCoords = loc.items[loc.items.length - 1].position;
                                            let distance = haversineDistance(
                                                userLat, userLon,
                                                eventCoords.lat, eventCoords.lng
                                            );
                                            console.log("distance from user: " + distance)
                                            if (distance <= distanceLimit) {
                                                console.log("event within the limit found: " + distance)
                                                event.distance = distance.toFixed(2);
                                                event.longitude = eventCoords.lng;
                                                event.latitude = eventCoords.lat;
                                                resolve(event);
                                            } else {
                                                console.log("Outside the limit: " + distance)
                                                resolve(null); // Remove event if it isn't in range
                                            }
                                        } else {
                                            resolve(null);
                                        }
                                    } catch {
                                        console.log("parsing went wrong somewhere - it's likely the event has no location")
                                        resolve(null);
                                    }
                                }
                            });
                        });
                    });
                    try {
                        let updatedResults = (await Promise.all(promises)).filter(event => event !== null);
                        console.log("RESULT");
                        console.log(updatedResults)
                        resolve(updatedResults);
                    } catch (apiError) {
                        console.log("FAILED")
                        console.log(apiError)
                        reject(apiError);
                    }
                } else {
                    console.log("IT all worked!")
                    resolve(result);
                }
            }
        });
    });
}

// haversine function: obtained from: https://stackoverflow.com/questions/14560999/using-the-haversine-formula-in-javascript
function haversineDistance(lat1Deg, lon1Deg, lat2Deg, lon2Deg) {
    function toRad(degree) {
        return degree * Math.PI / 180;
    }
    
    const lat1 = toRad(lat1Deg);
    const lon1 = toRad(lon1Deg);
    const lat2 = toRad(lat2Deg);
    const lon2 = toRad(lon2Deg);
    
    const { sin, cos, sqrt, atan2 } = Math;
    
    const R = 6371; // earth radius in km 
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
    const a = sin(dLat / 2) * sin(dLat / 2)
            + cos(lat1) * cos(lat2)
            * sin(dLon / 2) * sin(dLon / 2);
    const c = 2 * atan2(sqrt(a), sqrt(1 - a)); 
    const d = R * c;
    return d * 0.62137; // distance in miles
}

router.get('/list', redirectLogin, function (req, res, next) {
    let sqlquery = `SELECT events.*, users.username,
                    CASE 
                    WHEN attendees.userId IS NOT NULL THEN 1 
                    ELSE 0 
                    END AS attending,
                    CASE WHEN events.organiserId = ? THEN 1 
                    ELSE 0 
                    END AS yourEvent,
                    ADDTIME(events.startTime, SEC_TO_TIME(events.duration * 60)) AS endTime
                    FROM events
                    JOIN users 
                    ON events.organiserId = users.id
                    LEFT JOIN attendees 
                    ON events.id = attendees.eventId 
                    AND attendees.userId = ?`;
    let eventParameters = [req.session.databaseId, req.session.databaseId];
    // execute sql query
    db.query(sqlquery, eventParameters, (err, result) => {
        if (err) {
            return next(err);
        }
        console.log(result);
        res.render("list.ejs", { events: result, apiKey: apiKey, url: url, appCode: appCode });
    });
})

router.get('/addevent', redirectLogin, function (req, res, next) {
    console.log(req.session.databaseId)
    res.render('addevent.ejs')
})

router.post('/eventadded', redirectLogin, [
    check('name').notEmpty(),
    check('country').notEmpty(),
    check('city').notEmpty(),
    check('street').notEmpty(),
    check('houseNumber').notEmpty(),
    check('postcode').notEmpty(),
    check('fees').isDecimal()
], function (req, res, next) {
    console.log(req.session.databaseId)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log("error");
        console.log(errors);
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
        //country, state, county, city, district, street, houseNumber, and postalCode
        let processedLocation = `country=${req.sanitize(req.body.country)};city=${req.sanitize(req.body.city)};street=${req.sanitize(req.body.street)};houseNumber=${req.sanitize(req.body.houseNumber)};postalCode=${req.sanitize(req.body.postcode)};`;
        if (req.sanitize(req.body.county) !== undefined) {
            processedLocation += `county=${req.sanitize(req.body.county)};`
        }
        if (req.sanitize(req.body.district) !== undefined) {
            processedLocation += `district=${req.sanitize(req.body.district)};`
        }
        if (req.sanitize(req.body.state) !== undefined) {
            processedLocation += `state=${req.sanitize(req.body.state)};`
        }

        console.log(processedLocation)
        let sqlquery = "INSERT INTO events (name, fees, location, date, createdAt, updatedAt, startTime, duration, description, organiserId) VALUES (?,?,?,?,NOW(),NOW(),?,?,?,?)"
        // execute sql query
        let newrecord = [
            req.sanitize(req.body.name),
            req.sanitize(req.body.fees),
            processedLocation,
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
                res.send(' This event is added to database, name: ' + req.sanitize(req.body.name) + ' price ' + req.sanitize(req.body.fees) + ' <a href=' + '../' + '>Home</a>')
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
        ticketCost: req.query.ticketCost,
        latitude: req.query.latitude || null,
        longitude: req.query.longitude || null
    }
    console.log(filters);
    for (var key in filters) {
        if (filters.hasOwnProperty(key)) {
            console.log(key + " -> " + filters[key]);
            if (filters[key] == undefined) filters[key] = '';
        }
    }
    Promise.all([
        getEvents("search_result", filters, req.session.databaseId)
    ]).then(([events]) => {
        res.render("list.ejs", {
            apiKey: apiKey, url: url, appCode: appCode, events: events
        });
    }).catch((error) => {
        console.log(
            "Error getting data from database calls or in the code above"
        );
        console.log(error)
    });
})

router.get("/getticket/:id", redirectLogin, (req, res) => {
    try {
        const eventId = req.params.id;
        let sqlquery = `SELECT events.*, users.username, ADDTIME(events.startTime, SEC_TO_TIME(events.duration * 60)) AS endTime FROM events JOIN users ON events.organiserId = users.id WHERE events.id=${eventId}`;
        db.query(sqlquery, (err, result) => {
            if (err) {
                next(err)
            }
            res.render("getticket.ejs", { event: result[0] })
        })
    } catch {
        res.send("An unexpected error has occurred <a href=' + '../' + '>Home</a>");
    }
});

router.get("/ammendbooking/:id", redirectLogin, (req, res) => {
    try {
        const eventId = req.params.id;
        let sqlquery = `SELECT 
                        events.*, 
                        users.username, 
                        attendees.ticketQuantity,
                        ADDTIME(events.startTime, SEC_TO_TIME(events.duration * 60)) AS endTime
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
            res.render("ammendbooking.ejs", { event: result[0] })
        })
    } catch {
        res.send("An unexpected error has occurred <a href=' + '../' + '>Home</a>");
    }
});

router.post("/eventbooked/:id", redirectLogin, (req, res) => {
    try {
        const eventId = req.params.id;
        let sqlquery = `SELECT 
                        events.*, 
                        users.username, 
                        ADDTIME(events.startTime, SEC_TO_TIME(events.duration * 60)) AS endTime,
                        (SELECT email FROM users WHERE id = ${req.session.databaseId}) AS email 
                        FROM events 
                        JOIN users ON events.organiserId = users.id 
                        WHERE events.id = ${eventId};`;
        let insertquery = `INSERT INTO attendees (eventId, userId, ticketQuantity)
                           VALUES (?, ?, ?)
                           ON DUPLICATE KEY UPDATE 
                           ticketQuantity = VALUES(ticketQuantity);`;
        db.query(sqlquery, (err, result) => {
            if (err) {
                next(err)
            }
            insertParams = [result[0].id, req.session.databaseId, req.body.attendees];
            db.query(insertquery, insertParams, (err, result1) => {
                if (err) {
                    res.send("database insert failed - please try again <a href=' + '../' + '>Home</a>");
                }
                result.ticketNo = req.body.attendees;
                res.render("eventbooked.ejs", { event: result[0] })
            })
        })
    } catch {
        res.send("Something went wrong in the booking process, please try again <a href=' + '../' + '>Home</a>");
    }
});

router.get("/viewevent/:id", redirectLogin, (req, res) => {
    try {
        const eventId = req.params.id;
        let sqlquery = `SELECT events.*, users.username, ADDTIME(events.startTime, SEC_TO_TIME(events.duration * 60)) AS endTime FROM events JOIN users ON events.organiserId = users.id WHERE events.id=${eventId}`;
        db.query(sqlquery, (err, result) => {
            if (err) {
                next(err)
            }
            console.log(result[0]);
            let tempApiUrl = `https://geocode.search.hereapi.com/v1/geocode?q=${result[0].location}&units=metric&appcode=${appCode}&apikey=${apiKey}`;
            request(tempApiUrl, function (err, response, body) {
                if (err) {
                    console.log(err);
                    reject(err);
                    return;
                } else {
                    try {
                        console.log(body)
                        let loc = JSON.parse(body);
                        if (loc.items[loc.items.length - 1].position !== undefined) {
                            console.log(loc.items[loc.items.length - 1])
                            console.log(loc.items[loc.items.length - 1].position);
                            const eventCoords = loc.items[loc.items.length - 1].position;
                            result[0].longitude = eventCoords.lng;
                            result[0].latitude = eventCoords.lat;
                            console.log(result[0])
                            res.render("viewevent.ejs", { event: result[0], apiKey: apiKey, url: url, appCode: appCode })
                        } else {
                            console.log("error in the API request step")
                            result[0].longitude = null;
                            result[0].latitude = null;
                            res.render("viewevent.ejs", { event: result[0], apiKey: apiKey, url: url, appCode: appCode })
                        }
                    } catch {
                        console.log("That's an error; not sure which one")
                        result[0].longitude = null;
                        result[0].latitude = null;
                        res.render("viewevent.ejs", { event: result[0], apiKey: apiKey, url: url, appCode: appCode })
                    }
                }
            })
        })
    } catch {
        res.send("An unexpected error has occurred <a href=' + '../' + '>Home</a>");
    }
});

module.exports = router