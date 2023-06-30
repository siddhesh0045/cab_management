const express = require("express");
const con = require("./views/connection");
const app = express();
const path = require("path");
const session = require("express-session");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "views")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "cab_management",
    resave: false,
    saveUninitialized: false,
  })
);

app.set("view engine", "ejs");
const port = 3000;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views/index.html"));
});

app.post("/register", (req, res) => {
  var name = req.body.name;
  var email = req.body.email;
  var password = req.body.password;
  var mobno = req.body.mobno;

  console.log(req.body);

  con.connect((err) => {
    if (err) {
      throw err;
    }

    var sql =
      "INSERT INTO users(name, email, password, mobno) VALUES ('" +
      name +
      "','" +
      email +
      "','" +
      password +
      "','" +
      mobno +
      "')";

    con.query(sql, (err, result) => {
      if (err) {
        throw err;
      }

      res.sendFile(path.join(__dirname, "views/index.html"));
    });
  });
});

app.post("/login", (req, res) => {
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
        res.sendFile(path.join(__dirname, "views/rent1.html"));
      } else {
        res.send("Invalid email or password");
      }
    });
  });
});

/// rent1 request routes are here
// app.post('/rent', (req, res) => {
//   // Retrieve the selected car type and driver language from the form
//   const carType = req.body.carType;
//   const driverLanguage = req.body.driverLanguage;

//   //get user information
//   const user = req.session.user;
//   const username = user.name;
//   const email = user.email;

//   // Fetch a random available car of the selected type
//   const selectCarQuery = `SELECT * FROM cars WHERE type_id = ? AND present > 0 ORDER BY RAND() LIMIT 1`;
//   con.query(selectCarQuery, [carType], (carErr, carResult) => {
//     if (carErr) throw carErr;
//     console.log(carResult);

//     // Fetch a random available driver of the selected language
//     const selectDriverQuery = `SELECT * FROM drivers WHERE lan = ? AND present > 0 ORDER BY RAND() LIMIT 1`;
//     con.query(selectDriverQuery, [driverLanguage], (driverErr, driverResult) => {
//       if (driverErr) throw driverErr;

//      console.log(driverResult);

//       // Render the confirmation page and pass the selected car and driver data
//       res.render('confirmation', { car: carResult[0], driver: driverResult[0], username: username,
//         email: email });
//     });
//   });
// });
app.post("/rent", (req, res) => {
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

app.post("/confirm", (req, res) => {
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

app.post("/adminlogin", (req, res) => {
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

//admin routes are begin from here

// second
app.get("/view_driver", (req, res) => {
  // Fetch data from the MySQL database
  con.query("SELECT * FROM drivers", (error, results) => {
    if (error) {
      console.log("Error occurred while fetching data:", error);
      res.sendStatus(500);
    } else {
      res.render("drivers", {
        students: results,
      });
    }
  });
});

/// CRUD operations on Driver Table
// Add
app.post("/add", (req, res) => {
  // Extract the data from the request body
  const { name, licence, language } = req.body;

  // Perform validation if needed
  // ...

  // Insert the data into the "drivers" table
  const query = `INSERT INTO drivers ( dr_name, licence, lan,present) VALUES ( ?, ?, ?,?)`;
  const values = [name, licence, language, 1];

  // Execute the SQL query
  con.query(query, values, (error, results) => {
    if (error) {
      console.error('Error inserting data into the "drivers" table:', error);
      res.status(500).json({ error: "Internal server error" });
    } else {
      console.log('Data inserted successfully into the "drivers" table');
      res.status(200).json({ message: "Data inserted successfully" });
    }
  });
  const updateQuery = `UPDATE driver_type SET count = count + 1 WHERE d_language = ?`;
  const updateValues = [language];

  con.query(updateQuery, updateValues, (updateError, updateResults) => {
    if (updateError) {
      console.error('Error updating data in the "cartypes" table:', updateError);
      res.status(500).json({ error: "Internal server error" });
    } else {
      console.log('Count value updated successfully in the "cartypes" table');
      res.status(200).json({ message: "Data inserted successfully in both tables" });

    }
  });

});

//delete

app.post("/delete", (req, res) => {
  const driverId = req.body.id;

  //RETRIVE THE LANGUAGE
  const getTypeIDQuery = "SELECT lan FROM drivers WHERE id = ?";
  con.query(getTypeIDQuery, [driverId], (selectError, selectResults) => {
    if (selectError) {
      console.error("Error retrieving driver language:", selectError);
      res.status(500).send("Error deleting driver");
    } else if (selectResults.length === 0) {
      console.error("driver not found");
      res.status(404).send("driver not found");
    } 
      const language = selectResults[0].lan;
      const updateQuery = "UPDATE driver_type SET count = count - 1 WHERE d_language = ?";
      con.query(updateQuery, [language], (updateError, updateResults) => {
        if (updateError) {
          console.error("Error updating count in driver table:", updateError);
          res.status(500).send("Error deleting driver");
        } else {
          console.log("Count value updated successfully in driever_type table");
          res.status(200).send("drier deleted successfully");
        }
      });


  // Perform the deletion query
  con.query(
    "DELETE FROM drivers WHERE id = ?",
    [driverId],
    (error, results) => {
      if (error) {
        console.error("Error deleting driver:", error);
        res.status(500).send("Error deleting driver");
      } else {
        res.send("Driver deleted successfully");
      }
    }
  );
});

});

//update
app.post("/update", (req, res) => {
  
  const driverID = req.body.uDr_id;

  // Retrieve the existing car details from the database
  const getCarQuery = "SELECT * FROM drivers WHERE id = ?";
  con.query(getCarQuery, [driverID], (selectError, selectResults) => {
    if (selectError) {
      console.error("Error retrieving Driver details:", selectError);
      res.status(500).send("Error updating Drivers");
    } else if (selectResults.length === 0) {
      console.error("Driver not found");
      res.status(404).send("Driver not found");
    }
    const currentDriver = selectResults[0];
    const currlan = currentDriver.lan;
    const newlan = req.body.ulanguage;
    if (newlan != "-1") {
      const increaseCountQuery = `UPDATE driver_type
                            SET count = CASE
                              WHEN d_language = ? THEN count + 1
                              WHEN d_language = ? THEN count - 1
                              ELSE count
                            END
                            WHERE d_language IN (?, ?)`;
      con.query(increaseCountQuery, [newlan, currlan, newlan, currlan], (error, results) => {
        if (error) {
          console.error('Error updating Driver counts:', error);
          res.status(500).json({ error: "Internal server error" });
        } else {
          console.log('Driver counts updated successfully');
          res.status(200).json({ message: "Driver counts updated successfully for types table" });
        }
      });


    }
    // Columns:
    // id int AI PK 
    // dr_name varchar(255) 
    // licence varchar(255) 
    // lan varchar(255) 
    // present int




    // Prepare the updated values based on user input
    const updatedDriver = {
      dr_name: req.body.uname !== " " ? req.body.uname : currentDriver.dr_name,
      licence: req.body.ulicence !== " " ? req.body.ulicence : currentDriver.licence,
      lan: req.body.ulanguage !== "-1" ? req.body.ulanguage : currentDriver.lan,
      present: req.body.upresent !== "-1" ? req.body.upresent : currentDriver.present
    };

    // Perform the update query
    const updateQuery = "UPDATE drivers SET ? WHERE id = ?";
    con.query(updateQuery, [updatedDriver, driverID], (updateError, updateResults) => {
      if (updateError) {
        console.error("Error updating Driver:", updateError);
        // res.status(500).send("Error updating car");
      } else {
        console.log("Car updated successfully");
        res.status(200).send("Driver updated successfully");
      }
    });

  });
});


//driver CRUD Ended here

//CRUD operations on cars table

//view cars
app.get('/view_cars', (req, res) => {
  con.connect((error) => {
    if (error) {
      console.log(error);
    }
    var sql = "select * from cars";
    con.query(sql, (error, result) => {
      if (error) {
        console.log(error);
      } else {
        res.render("cars", {
          car: result,
        });
      }
      // console.log(result);
      //  res.render(__dirname+"/stu",{stus:result});
    })
  });
});


//add new
app.post("/addcar", (req, res) => {
  // Extract the data from the request body
  const { type_id, Reg_number, color } = req.body;

  // Perform validation if needed
  // ...

  // Insert the data into the "drivers" table
  const query = `INSERT INTO cars ( type_id, registration_number, color,present) VALUES ( ?, ?, ?,?)`;
  const values = [type_id, Reg_number, color, 1];

  // Execute the SQL query
  con.query(query, values, (error, results) => {
    if (error) {
      console.error('Error inserting data into the "cars" table:', error);
      res.status(500).json({ error: "Internal server error" });
    } else {
      console.log('Data inserted successfully into the "cars" table');

    }
  });
  const updateQuery = `UPDATE cartypes SET count = count + 1 WHERE type_id = ?`;
  const updateValues = [type_id];

  con.query(updateQuery, updateValues, (updateError, updateResults) => {
    if (updateError) {
      console.error('Error updating data in the "cartypes" table:', updateError);
      res.status(500).json({ error: "Internal server error" });
    } else {
      console.log('Count value updated successfully in the "cartypes" table');
      res.status(200).json({ message: "Data inserted successfully in both tables" });

    }
  });

});

//delete existing
app.post("/deletecar", (req, res) => {
  const carID = req.body.vcar_id;

  // Retrieve the type_id of the car being deleted
  const getTypeIDQuery = "SELECT type_id FROM cars WHERE car_id = ?";
  con.query(getTypeIDQuery, [carID], (selectError, selectResults) => {
    if (selectError) {
      console.error("Error retrieving car type_id:", selectError);
      res.status(500).send("Error deleting car");
    } else if (selectResults.length === 0) {
      console.error("Car not found");
      res.status(404).send("Car not found");
    } 
      const typeID = selectResults[0].type_id;

      // Perform the deletion query
      const deleteQuery = "DELETE FROM cars WHERE car_id = ?";
      con.query(deleteQuery, [carID], (deleteError, deleteResults) => {
        if (deleteError) {
          console.error("Error deleting car:", deleteError);
          res.status(500).send("Error deleting car");
        } else {
          console.log("Car deleted successfully");

          // Update the count value in the "cartypes" table
          const updateQuery = "UPDATE cartypes SET count = count - 1 WHERE type_id = ?";
          con.query(updateQuery, [typeID], (updateError, updateResults) => {
            if (updateError) {
              console.error("Error updating count in cartypes table:", updateError);
              res.status(500).send("Error deleting car");
            } else {
              console.log("Count value updated successfully in cartypes table");
              res.status(200).send("Car deleted successfully");
            }
          });
        }
      });
    
  });
});


//update cars
app.post("/updatecar", (req, res) => {
  const carID = req.body.Car_id;

  // Retrieve the existing car details from the database
  const getCarQuery = "SELECT * FROM cars WHERE car_id = ?";
  con.query(getCarQuery, [carID], (selectError, selectResults) => {
    if (selectError) {
      console.error("Error retrieving car details:", selectError);
      res.status(500).send("Error updating car");
    } else if (selectResults.length === 0) {
      console.error("Car not found");
      res.status(404).send("Car not found");
    }
    const existingCar = selectResults[0];
    const typeID = existingCar.type_id;
    const newID = req.body.type_id;
    if (newID != "-1") {
      const increaseCountQuery = `UPDATE cartypes
                            SET count = CASE
                              WHEN type_id = ? THEN count + 1
                              WHEN type_id = ? THEN count - 1
                              ELSE count
                            END
                            WHERE type_id IN (?, ?)`;
      con.query(increaseCountQuery, [newID, typeID, newID, typeID], (error, results) => {
        if (error) {
          console.error('Error updating car counts:', error);
          res.status(500).json({ error: "Internal server error" });
        } else {
          console.log('Car counts updated successfully');
          res.status(200).json({ message: "Car counts updated successfully for types table" });
        }
      });


    }





    // Prepare the updated values based on user input
    const updatedCar = {
      type_id: req.body.type_id !== "-1" ? req.body.type_id : existingCar.type_id,
      registration_number: req.body.UReg_number !== " " ? req.body.UReg_number : existingCar.registration_number,
      color: req.body.Ucolor !== " " ? req.body.Ucolor : existingCar.color,
      present: req.body.present !== "-1" ? req.body.present : existingCar.present
    };

    // Perform the update query
    const updateQuery = "UPDATE cars SET ? WHERE car_id = ?";
    con.query(updateQuery, [updatedCar, carID], (updateError, updateResults) => {
      if (updateError) {
        console.error("Error updating car:", updateError);
        res.status(500).send("Error updating car");
      } else {
        console.log("Car updated successfully");
        res.status(200).send("Car updated successfully");
      }
    });

  });
});




//
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
