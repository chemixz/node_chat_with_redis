var User = require("../models/user").User; // .User es apara solo obtener el User

module.exports = function(req,res,next){
	User.findById(req.params.id,function(err,user){
		console.log("desde finder user",user)
		if (user != null)
		{
			res.locals.user = user;
			next();
		}
		else{
			res.redirect("/dashboard/users");
		}
	})
}
