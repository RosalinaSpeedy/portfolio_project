// Create a new router
const express = require("express")
const router = express.Router()

function checkLogin(request) {
    if (!request.session.userId) {
        return false;
    }
    return true;
}

// Handle our routes
router.get('/', function (req, res, next) {
    res.render('index.ejs', {isLoggedIn: checkLogin(req)}) 
})

router.get('/about', function (req, res, next) {
    res.render('about.ejs', {isLoggedIn: checkLogin(req)})
})

router.get('/events', function (req, res, next) {
    res.render('events.ejs', {isLoggedIn: checkLogin(req)})
})

// Export the router object so index.js can access it
module.exports = router