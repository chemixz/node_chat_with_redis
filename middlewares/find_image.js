var Image = require("../models/image"); // .User es apara solo obtener el User
var owner_check = require("./image_permission");


module.exports = function(req,res,next){
	Image.findById(req.params.id)
		.populate("creator")
		.exec(function(err,image){
				console.log("desde finder_image ",req.params.id);
				if (image != null && owner_check(image,req,res) )
				{
					res.locals.image = image;
					next();
				}
				else{
					console.log("desdel finder image no encontrado");
					res.redirect("/dashboard/images");
				}
		})
}