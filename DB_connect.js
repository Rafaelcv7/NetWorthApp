var mysql = require('mysql');

config = {
   host: 'localhost',
   user: process.env.DB_USER,
   password: process.env.DB_PASS,
   database: 'BankV2',
   supportBigNumbers : true
}
var connection = mysql.createConnection(config); 
connection.connect(function(err){
  if (err){
    console.log('error connecting:' + err.message);
  }
  else
    console.log('connected successfully to DB.');
});

module.exports ={
     connection : mysql.createConnection(config) 
} 