const express = require("express")
const router = express.Router()

router.get('/events/:search_term', function (req, res, next) {

    // Query database to get all the books
    let sqlquery = "SELECT * FROM events"
    if (req.sanitize(req.params.search_term) !== undefined) {
        sqlquery += ` WHERE events.name LIKE "\%${req.sanitize(req.params.search_term)}\%"`;
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