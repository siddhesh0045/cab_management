const express = require('express');
const con = require('./views/connection');
const app = express();
const path = require('path');
const session = require('express-session');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));


const port = 3000;

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/index.html'));
  
});

app.post('/register', (req, res) => {
  var name = req.body.name;
  var email = req.body.email;
  var password = req.body.password;
  var mobno = req.body.mobno;

  console.log(req.body);
  
  con.connect((err) => {
    if (err) {
      throw err;
    }
    
    var sql = "INSERT INTO users(name, email, password, mobno) VALUES ('" + name + "','" + email + "','" +  password + "','" + mobno + "')";
    
    con.query(sql, (err, result) => {
      if (err) {
        throw err;
      }
      
      res.sendFile(path.join(__dirname, 'views/index.html'));
    });
  });
});

app.post('/login', (req, res) => {
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

        res.sendFile(path.join(__dirname, 'views/rent1.html'));
      } else {
      
        res.send( "Invalid email or password" );

      }
    });
  });
});

/// this is updated login





//end here
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
