const express = require("express")
const router = express.Router()

router.get('/events', function (req, res, next) {

    // Query database to get all the books
    let sqlquery = "SELECT * FROM events WHERE 1=1 "
    if (req.sanitize(req.query.search_term) !== undefined) {
        sqlquery += ` AND (events.name LIKE '%${req.sanitize(req.query.search_term)}%' OR events.description LIKE '%${req.sanitize(req.query.search_term)}%') `;
    }
    if (req.sanitize(req.query.date) !== undefined) {
        sqlquery += ` AND events.date='${req.sanitize(req.query.date)}' `;
    }
    if (req.sanitize(req.query.location) !== undefined) {
        sqlquery += ` AND events.location LIKE '%${req.sanitize(req.query.location)}%' `;
    }
    if (req.sanitize(req.query.ticketCost) !== undefined) {
        sqlquery += ` AND events.fees<='${req.sanitize(req.query.ticketCost)}' `;
    }
    console.log(sqlquery);
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