var mongoose = require("mongoose");
var Schema = mongoose.Schema; // instacia del schema para ser usado



var image_schema = new Schema({
	title:{type: String , required:"Titulo Requerido"} ,
	creator:{type: Schema.Types.ObjectId , ref: "User" },
	extension:{type:String , required:true}
}); 

var Image = mongoose.model("Image", image_schema);// crea el modelo deacuerdo al schema

module.exports = Image;// exporto Attrib User q es igual al modelo User
