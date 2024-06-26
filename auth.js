const express = require("express");
const con = require("./views/connection");
const app = express();
const path = require("path");
const session = require("express-session");
const router = express.Router();
const validator = require('validator');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
//authentication login register
router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views/index.html"));
  });
  
 // Importing the validator library

  // Validation function for email using the validator library
  const validateEmail = (email) => {
    return validator.isEmail(email);
  };
  
  // Validation function for mobile number (e.g., 10 digits)
  const validateMobileNumber = (mobno) => {
    return validator.isMobilePhone(mobno, 'en-IN'); // Assuming 'en-IN' for Indian mobile numbers
  };
  
  // Validation function for password (at least 8 characters, one uppercase, one lowercase, one digit)
  const validatePassword = (password) => {
    const isLengthValid = validator.isLength(password, { min: 8 });
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    return isLengthValid && hasUpperCase && hasLowerCase && hasDigit;
  };
  
  // router for registration of new user
  router.post('/register', (req, res) => {
    const { name, email, password, mobno } = req.body;
  
    // Input validation
    if (!validateEmail(email)) {
      
      return res.status(400).send('Invalid email format');
    }
  
    if (!validateMobileNumber(mobno)) {
      return res.status(400).send('Invalid mobile number format. It should be 10 digits.');
    }
  
    if (!validatePassword(password)) {
      return res.status(400).send('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one digit.');
    }
  
    // Connect to the database and insert the user
    con.connect((err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error connecting to the database');
      }
  
      const sql = 'INSERT INTO users(name, email, password, mobno) VALUES (?, ?, ?, ?)';
      const values = [name, email, password, mobno];
  
      con.query(sql, values, (err, result) => {
        if (err) {
          console.error(err);
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).send('Email already exists. Please enter another email.');
          } else {
           
            return res.status(500).send('Error occurred while registering');
          }
        }
        const popupScript = `
    <script>
      alert('Registered Successfully !');
      window.location.href = './index.html'; // Redirect to the home page or another page as needed
    </script>
  `;
  res.send(popupScript);

      });
    });
  });









  
  // router.post("/register", (req, res) => {
  //   var name = req.body.name;
  //   var email = req.body.email;
  //   var password = req.body.password;
  //   var mobno = req.body.mobno;
  
  //   console.log(req.body);
  
  //   con.connect((err) => {
  //     if (err) {
  //       console.error(err);
  //       res.status(500).send("Error connecting to the database");
  //       return;
  //     }
  
  //     var sql =
  //       "INSERT INTO users(name, email, password, mobno) VALUES (?, ?, ?, ?)";
  //     var values = [name, email, password, mobno];
  
  //     con.query(sql, values, (err, result) => {
  //       if (err) {
  //         console.error(err);
  //         if (err.code === "ER_DUP_ENTRY") {
  //           res.status(400).send("Email already exists. Please enter another email.");
  //         } else {
  //           res.status(500).send("Error occurred while registering");
  //         }
  //         return;
  //       }
  
  //       res.sendFile(path.join(__dirname, "views/index.html"));
  //     });
  //   });
  // });
  

  router.post("/login", (req, res) => {
    var email = req.body.email;
    var password = req.body.password;
  
    // console.log(req.body);
  
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
          var message = `
          <script>
          alert('Wrong Credentials, Please try again');
          window.location.href = './index.html';
        </script>`
          res.send(message);
        }
      });
    });
  });

// //implementing the forgot passward functionality here
// router.get('/forgot-password', (req, res) => {
//   res.sendFile(path.join(__dirname, '../public/forgot-password.html'));
// });

// const generateToken = () => {
//   return crypto.randomBytes(32).toString('hex');
// };

// // Route to handle forgot password
// router.post('/forgot-password', (req, res) => {
//   const { email } = req.body;

//   // Check if the email exists in the database
//   con.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).send('Error checking email');
//     }

//     if (result.length === 0) {
//       return res.status(400).send('Email not found');
//     }

//     const token = generateToken();
//     const tokenExpiry = Date.now() + 3600000; // Token expires in 1 hour

//     // Store the token and expiry in the database
//     con.query('UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?', [token, tokenExpiry, email], (err) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).send('Error saving reset token');
//       }

//       // Send the email with the reset link
//       const transporter = nodemailer.createTransport({
//         service: 'Gmail', // You can use any email service
//         auth: {
//           user: 'your-email@gmail.com',
//           pass: 'your-email-password'
//         }
//       });

//       const mailOptions = {
//         to: email,
//         from: 'siddheshwarg4u@gmail.com',
//         subject: 'Password Reset',
//         text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
//         Please click on the following link, or paste this into your browser to complete the process:\n\n
//         http://${req.headers.host}/reset-password/${token}\n\n
//         If you did not request this, please ignore this email and your password will remain unchanged.\n`
//       };

//       transporter.sendMail(mailOptions, (err) => {
//         if (err) {
//           console.error(err);
//           return res.status(500).send('Error sending email');
//         }

//         res.status(200).send('An email has been sent to ' + email + ' with further instructions.');
//       });
//     });
//   });
// });



  router.get("/logout", (req, res) => {
    // Clear the session and log out the user
    req.session.destroy((err) => {
      if (err) {
        console.error("Error logging out:", err);
      }
      // Redirect the user to the home page
      res.redirect("/views/index.html");
    });
  });

  module.exports=router