// Create a new router
const express = require("express")
const router = express.Router()

function checkLogin(request) {
    if (!request.session.userId) {
        return false;
    }
    return {isLoggedIn: true, userId: request.session.databaseId};
}

// Handle our routes
router.get('/', function (req, res, next) {
    user = checkLogin(req);
    console.log(user);
    res.render('index.ejs', user) 
})

router.get('/about', function (req, res, next) {
    res.render('about.ejs', {isLoggedIn: checkLogin(req)})
})

router.get('/events', function (req, res, next) {
    res.render('events.ejs', {isLoggedIn: checkLogin(req)})
})

// Export the router object so index.js can access it
module.exports = router