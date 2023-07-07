
const express = require("express");
const con = require("./views/connection");
const app = express();
const path = require("path");
const session = require("express-session");
const router = express.Router();



router.get('/view_driver', (req, res) => {
  con.connect((error) => {
    if (error) {
      console.log(error);
    }
    var sql = "select * from drivers";
    con.query(sql, (error, result) => {
      if (error) {
        console.log(error);
      } else {
        res.render("drivers", {
          students: result,
        });
      }
      // console.log(result);
      //  res.render(__dirname+"/stu",{stus:result});
    })
  });
});

// somethin going wrong here need to be modified for driver view
// router.post("/add", (req, res) => {
//     // Extract the data from the request body
//     const { name, licence, language } = req.body;
  
//     // Perform validation if needed
//     // ...
  
//     // Insert the data into the "drivers" table
//     const query = `INSERT INTO drivers ( dr_name, licence, lan,present) VALUES ( ?, ?, ?,?)`;
//     const values = [name, licence, language, 1];
  
//     // Execute the SQL query
//     con.query(query, values, (error, results) => {
//       if (error) {
//         console.error('Error inserting data into the "drivers" table:', error);
//         res.status(500).json({ error: "Internal server error" });
//       } else {
//         console.log('Data inserted successfully into the "drivers" table');
//         res.status(200).json({ message: "Data inserted successfully" });
//       }
//     });
//     const updateQuery = `UPDATE driver_type SET count = count + 1 WHERE d_language = ?`;
//     const updateValues = [language];
  
//     con.query(updateQuery, updateValues, (updateError, updateResults) => {
//       if (updateError) {
//         console.error('Error updating data in the "cartypes" table:', updateError);
//         res.status(500).json({ error: "Internal server error" });
//       } else {
//         console.log('Count value updated successfully in the "cartypes" table');
//         res.status(200).json({ message: "Data inserted successfully in both tables" });
  
//       }
//     });
  
//   });
  
//add driver
  router.post("/add", (req, res) => {
    const { name, licence, language } = req.body;
  
    const query = `INSERT INTO drivers (dr_name, licence, lan, present) VALUES (?, ?, ?, ?)`;
    const values = [name, licence, language, 1];
  
    con.query(query, values, (error, results) => {
      if (error) {
        console.error('Error inserting data into the "drivers" table:', error);
        res.status(500).json({ error: "Internal server error" });
      } else {
        console.log('Data inserted successfully into the "drivers" table');
        res.status(200).json({ message: "Data inserted successfully" });
  
        const updateQuery = `UPDATE driver_type SET count = count + 1 WHERE d_language = ?`;
        const updateValues = [language];
  
        con.query(updateQuery, updateValues, (updateError, updateResults) => {
          if (updateError) {
            console.error('Error updating data in the "cartypes" table:', updateError);
          } else {
            console.log('Count value updated successfully in the "cartypes" table');
          }
        });
      }
    });
  });
  

  //delete
  
  router.post("/delete", (req, res) => {
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
  router.post("/update", (req, res) => {
    
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
  module.exports=router