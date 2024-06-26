const express = require("express");
const con = require("./views/connection");
const app = express();
const path = require("path");
const session = require("express-session");


// serve static files from a specific directory
app.use(express.static(path.join(__dirname, "public")));
// serve static files from a specific directory
app.use(express.static(path.join(__dirname, "views")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//This middleware is provided by Express and is specifically used to parse URL-encoded data, which is typically used when submitting form data.
// use espress-session
app.use(
  session({
    secret: "cab_management",
    //Uses a secret key ("cab_management") to secure the session cookies.
    resave: false,
    //Does not resave sessions that haven't been modified (resave: false).
    saveUninitialized: false,
    //Does not save unmodified sessions to the store (saveUninitialized: false).
  })
);
app.set("view engine", "ejs");
//The line app.set("view engine", "ejs"); is used to configure your Express.js application to use EJS (Embedded JavaScript) as its template engine for rendering views.
//creater the routes for various purpose
const port = 3000;
const auth = require("./auth");
const user = require("./user");
const admin = require("./admin");
const driver = require("./driver");
const cars = require("./cars");
//using routes in the app
app.use("/",auth);
app.use("/",user);
app.use("/",admin);
app.use("/",driver);
app.use("/",cars);






// confirmation msg that port is running
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
