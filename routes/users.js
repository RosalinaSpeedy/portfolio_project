const { check, validationResult } = require('express-validator');

// Create a new router
const express = require("express")
const router = express.Router()

const bcrypt = require('bcrypt')

const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('../../users/login') // redirect to the login page
    } else {
        next(); // move to the next middleware function
    }
}

router.get('/register', function (req, res, next) {
    res.render('register.ejs')
})

router.post('/registered', [check('email').isEmail(), check('password').isLength({ min: 8 }), check('username').isLength({ min: 5 }), check('first').notEmpty(), check('last').notEmpty()], function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.redirect('./register');
    }
    else {
        const saltRounds = 10
        const plainPassword = req.body.password
        bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {
            // store hashed password
            console.log("adding user");
            // saving data in database
            let sqlquery = "INSERT INTO users (username, firstName, lastName, email, hashedPassword) VALUES (?,?,?,?,?)"
            // execute sql query
            let newrecord = [req.sanitize(req.body.username), req.sanitize(req.body.first), req.sanitize(req.body.last), req.sanitize(req.body.email), hashedPassword]
            db.query(sqlquery, newrecord, (err, result) => {
                if (err) {
                    next(err)
                }
                else {
                    var result = 'Hello ' + req.sanitize(req.body.first) + ' ' + req.sanitize(req.body.last) + ' you are now registered!  We will send an email to you at ' + req.sanitize(req.body.email) + ' <a href=' + '../' + '>Home</a>';
                    res.send(result)
                }
            })
        })
    }
})

router.get('/login', function (req, res, next) {
    res.render('login.ejs')
})

router.post('/loggedin', function (req, res, next) {
    let sqlquery = "SELECT hashedPassword FROM users WHERE username=\"" + req.sanitize(req.body.username) + "\"" // query database to get password
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err)
        }
        if (result.length > 0) {
            var hashedPassword = result[0].hashedPassword;
        } else {
            res.send("User account not found! " + "<a href='/users/login'>" + "Log in page" + "</a>");
        }
        console.log(hashedPassword);
        bcrypt.compare(req.sanitize(req.body.password), hashedPassword, function (err, result) {
            if (err) {
                next(err)
            }
            else if (result == true) {
                req.session.userId = null;
                req.session.databaseId = null;
                // Save user session here, when login is successful
                let idQuery = "SELECT id FROM users WHERE username = \"" + req.body.username + "\"";
                db.query(idQuery, (err, result1) => {
                    if (err) {
                        next(err)
                    }
                    else if (result1.length == 1) {
                        console.log(result1[0].id);
                        console.log(req.session.databaseId)
                        req.session.userId = req.body.username;
                        req.session.databaseId = result1[0].id;
                        console.log(req.session);
                        res.redirect('../')
                    }
                    else {
                        console.log("Wrong number of users found!")
                    }
                })
            }
            else {
                res.send("Login failed! " + "<a href='/users/login'>" + "Log in page" + "</a>");
            }
        })
    })
})

router.get('/myevents/:id', redirectLogin, (req, res, next) => {
    try {
        const userId = req.params.id;
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
                        AND attendees.userId = ?`
        let queryParameters = [userId, userId];
        db.query(sqlquery, queryParameters, (err, result) => {
            if (err) {
                next(err)
            }
            res.render("myevents.ejs", { events: result, bookings: result })
        })
    } catch {
        console.log("Some error occured");
    }
})

router.get('/logout', redirectLogin, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('../')
        }
        res.send('you are now logged out. <a href=' + '../' + '>Home</a>');
    })
})

// Export the router object so index.js can access it
module.exports = router