const pool = require('../../../connection/config/db/db_connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fast2sms = require('fast-two-sms')
const saltRounds = 10;
var commonCon;

exports.userRegstration = (rq, rs) => {
   var now = new Date();
   var jsonDate = now.toJSON();
   var then = new Date(jsonDate);
   var data = rq.body;
   data['created_at'] = then;
   delete rq.body.confirmPass;
   var email = rq.body.email;
   var password = rq.body.password;
   var sql = 'SELECT * FROM user_register WHERE email = ? ';
   var sqls = "INSERT INTO user_register SET ?";
   pool.query(sql, [email], (er, resu) => {
      if (resu.length === 1) {
         rs.json({
            success: false,
            message: 'Email exist, Please try another email id !'
         });
      } else {
         bcrypt.hash(password, saltRounds, function (err, hash) {
            rq.body.password = hash
            pool.query(sqls, rq.body, (errs, results) => {
               if (errs) {
                  rs.json({
                     success: false,
                     message: errs,
                  });
               } else {
                  rs.json({
                     success: true,
                     message: 'User sinup successfully !',
                     data: results
                  });
               }
            });
         });
      }
   });
}

exports.userlogin = (request, response) => {
   var email = request.body.email;
   var sql = 'SELECT * FROM user_register WHERE email = ?';
   pool.query(sql, [email], (err, results) => {
      if (err) {
         response.json({
            success: false,
            message: err
         });
      } else {
         if (results.length == 1) {
            bcrypt.compare(request.body.password, results[0].password).then(function (result) {
               if (result == true) {
                  results.password = undefined;
                  let token = jwt.sign({ result: results }, 'myTokenKey'
                  ,{ expiresIn: '1h' }
                  );
                  response.json({
                     success: true,
                     message: 'Logged In !',
                     data: results,
                     token: token
                  })
               } else {
                  response.json({
                     success: false,
                     message: 'User not register !'
                  })
               }
            });
         } else {
            response.json({
               success: false,
               data: err,
               message: 'Invalid credentials'
            });
         }
      }
   });
}

exports.findUser = (req, res) => {
   pool.query('SELECT * FROM user_register WHERE user_id = ? ', [req.body.id], (err, data) => {
      if (err) {
         res.send({
            success: false,
            message: 'data not found !'
         });
      } else {
         res.send({
            success: true,
            message: 'data found!',
            data: data.filter(dr=>{
               return delete dr.otp;
             }),
         });
      }
   });
}

exports.updateUser = (req, res) => {
   var ids = req.body.user_id;
   delete req.body.id;
   var now = new Date();
   var jsonDate = now.toJSON();
   var then = new Date(jsonDate);
   var data = req.body;
   data['updated_at'] = then;
   var sql = "UPDATE user_register set ?  WHERE user_id = ? "
   pool.query(sql, [data, ids], (err, data) => {
      if (err) {
         res.send({
            success: false,
            message: 'not updated !',
            err: err
         });
      } else {
         res.send({
            success: true,
            message: 'updated !',
         });
      }
   });
}

exports.getAllUsers = (req, res) => {
   pool.query('SELECT * from user_register', (err, result) => {
      if (err) {
         res.send({
            success: false,
            message: 'not data found !',
            err: err
         });
      } else {
         res.send({
            success: true,
            message: 'data found !',
            data: result.filter(dr=>{
              return delete dr.otp;
            }),
         });
      }
   });
}

exports.deleteUser = (req, res) => {
   pool.query("DELETE from user_register WHERE user_id='" + req.body.id + "'", (er, result) => {
      if (er) {
         res.send({
            success: false,
            message: 'not deleted !',
            err: err
         });
      } else {
         res.send({
            success: true,
            message: 'User deleted !',
         });
      }
   });
}

exports.getOTP = (req, res) => {
   commonCon=req.body.contact;
   var now = new Date();
   var jsonDate = now.toJSON();
   var then = new Date(jsonDate);
   var data = {};
   data['updated_at'] = then;
   var val = Math.floor(1000 + Math.random() * 9000);
   data['otp'] = val;
   pool.query('Select * from user_register WHERE contact = ?', [req.body.contact], (errors, result) => {
      if (result.length == 1) {
         var sqls = "UPDATE user_register set ? WHERE contact = ? "
         pool.query(sqls, [data, req.body.contact], (err, data) => {
            if (err) {
               res.send({
                  success: false,
                  message: 'OTP Not generated!',
                  err: err
               });
            } else {
               var options = {authorization:
                  'fLbMB3kX52mSnPahzOYZVtAG1oJFUjdQ7RrH9veCcWpl0uqTs6ObzA5eKcCDprVNIRxQkoSwFnGguHE1',
                   message : "Your OTP : " + val ,  
                   numbers : [req.body.contact]} 
               fast2sms.sendMessage(options)
               res.send({
                  success: true,
                  message: 'OTP was sent on your number!',
                  otp:val
               });
            }
         });
      } else {
         res.send({
            success: false,
            message: 'User Not Register!',
         });
      }
   });
   setTimeout(() => {
      pool.query("UPDATE user_register set otp = 'wqwweAd3Gvv5h&&b3vv' WHERE contact = '" + commonCon + "'", (e, r) => { })
   }, 150000);
}

exports.verifyOTP = (req, res) => {
   var sql = 'SELECT * from user_register where contact = ? and otp= ?';
   pool.query(sql, [req.body.contact, req.body.otp], (err, result) => {
      if (result.length == 1) {
         res.send({
            success: true,
            message: 'OTP Verified!',
         });
      } else {
         res.send({
            success: false,
            message: 'Invalid  contact/OTP!',
         });
      }
   });
}

exports.changePassword = (rq, rs) => {
   var now = new Date();
   var jsonDate = now.toJSON();
   var then = new Date(jsonDate);
   var data = rq.body;
   data['updated_at'] = then;
   var contact = rq.body.contact;
   var password = rq.body.password;
   var sql = 'SELECT * FROM user_register WHERE contact = ? ';
   var sqls = "UPDATE user_register set ?  WHERE contact = ?";
   pool.query(sql, [contact], (er, resu) => {
      if (resu.length === 1) {
         {
            bcrypt.hash(password, saltRounds, function (err, hash) {
               rq.body.password = hash
               pool.query(sqls, [data, contact], (errs, results) => {
                  if (errs) {
                     rs.json({
                        success: false,
                        message: errs,
                     });
                  } else {
                     pool.query("UPDATE user_register set otp = 'wqwweAd3Gvv5h&&b3vv' WHERE contact = '" + contact + "'", (e, r) => { })
                     rs.json({
                        success: true,
                        message: 'Your Password Changed successfully !',
                     });
                  }
               });
            });
         }
      } else {
         rs.json({
            success: false,
            message: 'User Not Exist !',
         });
      }
   });

}
