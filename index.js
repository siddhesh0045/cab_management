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
// use espress-session
app.use(
  session({
    secret: "cab_management",
    resave: false,
    saveUninitialized: false,
  })
);
app.set("view engine", "ejs");

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
