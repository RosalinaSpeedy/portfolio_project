IMPORTANT:
If the mysql server boots you off - you will get an error stating that:
"Can't add new command when connection is in closed state"
To get around this: Go to the base root ("/", or the index page) - and RELOAD THE PAGE;

This will prompt a reconnect (you may have to wait about 30 seconds for everything to kick in). :)

Steps to set up application:

1) extract all files to the same directory - or, run "git clone https://github.com/RosalinaSpeedy/portfolio_project" to the desired directory
2) install node on the computer you'll be running the app on
3) run npm install express
4) run npm install ejs
5) run npm install mysql
6) run npm install bcrypt
7) run the packaged create_db.sql script
8) Optionally - run the insert_test_data.sql script to insert an event before loading the application
9) Run node index.js
10) navigate to the hosted URL (usually localhost:8000) 
11) allow location services in your browser