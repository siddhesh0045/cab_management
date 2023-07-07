
const express = require("express");
const con = require("./views/connection");
const app = express();
const path = require("path");
const session = require("express-session");
const router = express.Router();

//login form for the adim 
router.post("/adminlogin", (req, res) => {
    var name = req.body.username;
    var password = req.body.password;
  
    console.log(req.body);
  
    con.connect((err) => {
      if (err) {
        throw err;
      }
  
      var sql = "SELECT * FROM adminlogin WHERE username = ? AND Passkey = ?";
      con.query(sql, [name, password], (err, result) => {
        if (err) {
          throw err;
        }
  
        if (result.length > 0) {
          req.session.user = {
            name: result[0].name,
          };
          // res.send("admin login successfull !!!!");
          res.sendFile(path.join(__dirname, "views/adminDashboard.html"));
        } else {
          res.send("Invalid email or password");
        }
      });
    });
  });
  module.exports=router  