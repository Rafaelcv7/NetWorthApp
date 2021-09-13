var mysql = require('mysql');

config = {
   host: 'localhost',
   user: 'root',
   password: '102397',
   database: 'bank_info'
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