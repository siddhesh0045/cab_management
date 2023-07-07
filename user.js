
const express = require("express");
const con = require("./views/connection");
const app = express();
const path = require("path");
const session = require("express-session");
const router = express.Router();

// post method for rent form
router.post("/rent", (req, res) => {
    // Retrieve the selected car type and driver language from the form
    const carType = req.body.carType;
    const driverLanguage = req.body.driverLanguage;
    const starting = req.body.starting;
    const ending = req.body.ending;
    var price = 0;
  
    if (starting == "Pune" && ending == "Solapur") {
      price = 1000;
    } else if (starting == "Pune" && ending == "Kolhapur") {
      price = 750;
    } else if (starting == "Sangli" && ending == "Solapur") {
      price = 500;
    } else {
      price = 300;
    }
  
    price = price * carType;
  
    // Get the logged-in user's email from the session
    const userEmail = req.session.user.email;
  
    // Fetch the user's username and mobile number from the database
    const selectUserQuery = `SELECT name, mobno FROM users WHERE email = ?`;
    con.query(selectUserQuery, [userEmail], (userErr, userResult) => {
      if (userErr) throw userErr;
  
      // Fetch a random available car of the selected type
      const selectCarQuery = `SELECT * FROM cars WHERE type_id = ? AND present > 0 ORDER BY RAND() LIMIT 1`;
      con.query(selectCarQuery, [carType], (carErr, carResult) => {
        if (carErr) throw carErr;
  
        const car = carResult[0];
        req.session.carId = car.car_id;
        req.session.cartype = car.type_id;
  
        // Fetch a random available driver of the selected language
        const selectDriverQuery = `SELECT * FROM drivers WHERE lan = ? AND present > 0 ORDER BY RAND() LIMIT 1`;
        con.query(
          selectDriverQuery,
          [driverLanguage],
          (driverErr, driverResult) => {
            if (driverErr) throw driverErr;
  
            const driver = driverResult[0];
            req.session.driverId = driver.id;
            req.session.language = driver.lan;
  
            // Render the confirmation page and pass the selected car, driver, username, and mobile number
            res.render("confirmation", {
              car: carResult[0],
              driver: driverResult[0],
              user: userResult[0],
              price: price,
              starting: starting,
              ending: ending,
            });
          }
        );
      });
    });
  });
  
/// this is route for the final confirmation and updating the values
  router.post("/confirm", (req, res) => {
    const carId = req.session.carId;
    const cartype = req.session.cartype;
    const driverId = req.session.driverId;
    const language = req.session.language;
  
    // Update the cars table
    const updateCarQuery = `UPDATE cars SET present = 0 WHERE car_id = ?`;
    con.query(updateCarQuery, [carId], (carErr, carResult) => {
      if (carErr) {
        throw carErr;
      }
  
      // Update the cartypes table
      const updateCartypeQuery = `UPDATE cartypes SET count = count - 1 WHERE type_id = ? AND count > 0`;
      con.query(updateCartypeQuery, [cartype], (cartypeErr, cartypeResult) => {
        if (cartypeErr) {
          throw cartypeErr;
        }
  
        // Update the drivers table
        const updateDriverQuery = `UPDATE drivers SET present = 0 WHERE id = ?`;
        con.query(updateDriverQuery, [driverId], (driverErr, driverResult) => {
          if (driverErr) {
            throw driverErr;
          }
  
          // Update the driver_type table
          const updateDriverTypeQuery = `UPDATE driver_type SET count = count - 1 WHERE d_language = ? AND count > 0`;
          con.query(
            updateDriverTypeQuery,
            [language],
            (driverTypeErr, driverTypeResult) => {
              if (driverTypeErr) {
                throw driverTypeErr;
              }
  
              res.sendFile(path.join(__dirname, "views/success.html"));
            }
          );
        });
      });
    });
  });

  
  module.exports=router