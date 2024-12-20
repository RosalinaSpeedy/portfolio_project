// Import express and ejs and express-session
var express = require('express')
var ejs = require('ejs')
var session = require('express-session')
var validator = require ('express-validator');
const expressSanitizer = require('express-sanitizer');

//Import mysql module
var mysql = require('mysql2')


// Create the express application object
const app = express()
const port = 8000

// Tell Express that we want to use EJS as the templating engine
app.set('view engine', 'ejs')

// Set up the body parser 
app.use(express.urlencoded({ extended: true }))

// Set up public folder (for css and static js)
app.use(express.static(__dirname + '/public'))

// Create an input sanitizer
app.use(expressSanitizer());

// Define the database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'portfolio_project_app',
    password: 'qwertyuiop',
    database: 'portfolio_project'
})
// Connect to the database
db.connect((err) => {
    if (err) {
        throw err
    }
    console.log('Connected to database')
})

function disconnectHandling(runs) {
    db.connect((err) => {
        if (err) {
            if (runs < 5) {
                console.log('reconnection failed retrying in 5 secs', err);
                setTimeout(() => disconnectHandling(runs + 1), 5000);
            } else {
                console.log("five failed attempts to reconnect");
                throw(err);
            }
        } else {
            console.log('reconnected to database');
        }
    });
};
db.on('error', (err) => {
    console.error('error in database process', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        disconnectHandling(0);
    } else {
        throw err;
    }
});

global.db = db

// Create a session
app.use(session({
    secret: 'somerandomstuff',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}))

// Define our application-specific data
app.locals.siteData = { siteName: "EventEnthusiast" }

// Load the route handlers
const mainRoutes = require("./routes/main")
app.use('/', mainRoutes)

// Load the route handlers for /users
const usersRoutes = require('./routes/users')
app.use('/users', usersRoutes)

// Load the route handlers for /events
const eventsRoutes = require('./routes/events')
app.use('/events', eventsRoutes)

// Load the route handlers for /api
const apiRoutes = require('./routes/api')
app.use('/api', apiRoutes)

// Start the web app listening
app.listen(port, () => console.log(`Node app listening on port ${port}!`))