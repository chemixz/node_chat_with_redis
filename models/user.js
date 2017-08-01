var mongoose = require("mongoose");
var Schema = mongoose.Schema; // instacia del schema para ser usado


mongoose.connect("mongodb://localhost/fotos");//conexion a la bd, 
var mival ="Chemixz";
/*
String Number Date Buffer Boolean Mixed Objectid Array
*/

//Validaciones 
var posibles_valores = ["M","F"]; //para enum
var email_match = [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ , "Coloca un email vlaido" ];


//Validaciones personalizada
var password_validation = {
	validator: function(){
		if (this.password_confirmation && this.password)
		{
			return this.password_confirmation == this.password;
		}
	}, 
	message: "Las Contrasenhas deben coincidir"
};


var user_schema = new Schema({
	name:{ type:String , required: "Nombre requerido" , maxlength:[50, "Maximo caracteres 50"] , minlength:[5 , "Minimo 5 caracteres"] },
	email:{ type:String , required: "Correo Requerido" , match: email_match  },
	password:{type: String , minlength:[6 , "Password minimo 6 caracteres"] , required: "Password requerido", validate: password_validation},
	age: {type: Number, min:[4 ,"Edad minima es 4 "] , max:[100,"Edad maxima 100"] , required: "Edad requerida"},
	date_of_bird:Date,
	sex: {type: String ,  enum:{values: posibles_valores , message: "Sexo invalido" , required: "Genero requerido"} }

}); // crea el objeto schema para mongoose



user_schema.virtual("password_confirmation").get(function(){

	return this.p_c;

}).set(function(password){
	this.p_c = password;
}); // es un tipo de validacion


var User = mongoose.model("User", user_schema);// crea el modelo deacuerdo al schema


module.exports.User = User;
// exporto Attrib User q es igual al modelo User
//ex[prtp ara q sea accedido desde el app