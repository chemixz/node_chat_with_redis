var Image = require("../models/image");

module.exports = function(image,req,res){
	//True si tiene permiso
	// false no tiene permiso
	console.log("validando owner");
	if (req.method === "GET" && req.path.indexOf("edit") < 0 )
	{
		// ver imagen
		// console.log("Puede ver la imagen");
		return true;
	}

	if (typeof image.creator == "undefined" )
	{
		return false;
	}

	if (image.creator._id.toString() == res.locals.current_user._id) 
	{
		// es duennio
		// console.log("solo el dueno edita");

		return true
	}

}
