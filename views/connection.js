const { connect } = require('http2');
const mysql = require('mysql2');
var con = mysql.createConnection({
    hot:'localhost',
    user:'root',
    password:'sup@098',
    database:'cab_management'
});
var connection =  con.connect((err)=>{
    if(err){
        console.log("not connected: "+JSON.stringify(err,undefined,2));
    }else{
        console.log("successs!!!");
    }
})
module.exports=con
