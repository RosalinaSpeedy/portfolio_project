const express = require("express")
const router = express.Router()
const request = require('request')
const { check, validationResult } = require('express-validator');
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('../users/login') // redirect to the login page
    } else {
        next(); // move to the next middleware function
    }
}

router.get('/events', function (req, res, next) {

    // Query database to get all the books
    let sqlquery = "SELECT * FROM events"
    if (req.sanitize(req.query.search_term) !== undefined) {
        sqlquery += " WHERE name LIKE '%" + req.sanitize(req.query.search_term) + "%'";
    }

    // Execute the sql query
    db.query(sqlquery, (err, result) => {
        // Return results as a JSON object
        if (err) { 
            res.json(err)
            next(err)
        }
        else {
            res.json(result)
        }
    })
})

// Export the router object so index.js can access it
module.exports = router