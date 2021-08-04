// const { createPool } = require('mysql');
// const pool=createPool({
//     host:process.env.DB_HOST,
//     user:process.env.DB_USER,
//     password:process.env.DB_PASS,
//     database:process.env.MYSQL_DB,
//     connectionLimit:10 
// });

var mysql=require('mysql');
var  pool=mysql.createConnection ({ 
    host: "localhost",
    user: "root",
    password: "",
    database : "my_db"
      }); 
      pool.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
      });
      module.exports =pool;
