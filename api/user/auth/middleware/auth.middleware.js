const jwt = require('jsonwebtoken');


module.exports = {
    checkTcken: (req, res, next) => {
        let token = req.get('authorization');
        if (token) {
            token = token.slice(7);
            jwt.verify(token,'myTokenKey',(err,decoded)=>{
                if(err){
                   res.json({
                    success:false,
                    message:'Invalid Token'
                   })
                }else{
                    next();
                }
            });
        } else {
            res.json({
                success: false,
                message: 'Access denied! unauthorized user '
            })
        }
    }
}