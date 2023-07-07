const express = require("express");
const con = require("./views/connection");
const app = express();
const path = require("path");
const session = require("express-session");
const router = express.Router();

//authentication login register
router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views/index.html"));
  });
  
  router.post("/register", (req, res) => {
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    var mobno = req.body.mobno;
  
    console.log(req.body);
  
    con.connect((err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error connecting to the database");
        return;
      }
  
      var sql =
        "INSERT INTO users(name, email, password, mobno) VALUES (?, ?, ?, ?)";
      var values = [name, email, password, mobno];
  
      con.query(sql, values, (err, result) => {
        if (err) {
          console.error(err);
          if (err.code === "ER_DUP_ENTRY") {
            res.status(400).send("Email already exists. Please enter another email.");
          } else {
            res.status(500).send("Error occurred while registering");
          }
          return;
        }
  
        res.sendFile(path.join(__dirname, "views/index.html"));
      });
    });
  });

  router.post("/login", (req, res) => {
    var email = req.body.email;
    var password = req.body.password;
  
    console.log(req.body);
  
    con.connect((err) => {
      if (err) {
        throw err;
      }
  
      var sql = "SELECT * FROM users WHERE email = ? AND password = ?";
      con.query(sql, [email, password], (err, result) => {
        if (err) {
          throw err;
        }
  
        if (result.length > 0) {
          req.session.user = {
            name: result[0].name,
            email: result[0].email,
          };
          // req.session.formSubmitted = true;
          res.sendFile(path.join(__dirname, "views/rent1.html"));
         
        } else {
res.send("wrong credentials");
        }
      });
    });
  });

  module.exports=router