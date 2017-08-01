var mongoose = require("mongoose");
var Schema = mongoose.Schema; // instacia del schema para ser usado



var comment_schema = new Schema({
	comment:{type: String , required:"comentario requerido"} ,
	creator:{type: Schema.Types.ObjectId , ref: "User" },
},
{
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
}); 

var Comment = mongoose.model("Comment", comment_schema);// crea el modelo deacuerdo al schema

module.exports = Comment;// exporto Attrib User q es igual al modelo User
