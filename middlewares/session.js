var User = require("../models/user").User; // .User es apara solo obtener el User
var searchFields = "_id , name , email , age , sex" ;

module.exports = function(req,res,next){
	if(req.session.current_user == undefined){
		res.redirect("/login");
	}
	else
	{
		// buscamos al usuario para 
		User.findById(req.session.current_user._id , searchFields , function(err,user) {
			// console.log("desde middleware Session", user)
			if (err)
			{
				
				// console.log("error en middle session -----> ", err);
				res.redirect("login");
			}
			else
			{
				// console.log("desde session lo encontro", user)
				res.locals.current_user = user // esto hacer merge al locals , no sobre escribe
				next();
			}
		});
	}
}