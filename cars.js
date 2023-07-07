
const express = require("express");
const con = require("./views/connection");
const app = express();
const path = require("path");
const session = require("express-session");
const router = express.Router();




//view cars
router.get('/view_cars', (req, res) => {
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
  router.post("/addcar", (req, res) => {
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
  router.post("/deletecar", (req, res) => {
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
  router.post("/updatecar", (req, res) => {
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

  module.exports=router