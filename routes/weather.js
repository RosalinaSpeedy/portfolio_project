const express = require("express")
const router = express.Router()
const request = require('request')
const { check, validationResult } = require('express-validator');
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('./login') // redirect to the login page
    } else {
        next(); // move to the next middleware function
    }
}

router.post('/citynow', function (req, res, next) {
    let apiKey = '771a6bb9b639659e7aaf6c947e89823a'
    let city = req.sanitize(req.body.city);
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`

    request(url, function (err, response, body) {
        if (err) {
            next(err)
        } else {
            //res.send(body)
            var weather = JSON.parse(body)
            if (weather!==undefined && weather.main!==undefined) {
                var wmsg = 'It is ' + weather.main.temp +
                    ' degrees in ' + weather.name +
                    '! <br> The humidity now is: ' +
                    weather.main.humidity;
                res.send(wmsg);
            } else {
                res.send("Not found!");
            }

        }
    });
})

router.get('/', function (req, res, next) {
    res.render("weather.ejs");
})

// Export the router object so index.js can access it
module.exports = router