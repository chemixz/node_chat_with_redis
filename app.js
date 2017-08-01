var express = require("express");
var session = require("express-session"); // para  trabajar con redis
const formidable = require('express-formidable');
var methodOverride = require("method-override");

var User = require("./models/user").User; // .User es apara solo obtener el User
var router_app = require("./routes_app"); // rutas modulares ,
var check_session_middleware = require("./middlewares/session"); // middleware para validar session em rutas
var RedisStore = require("connect-redis")(session); // le pasamos session al redis

var http = require("http"); // socket io tiene q ser una instancia de http
var realtime = require("./realtime");

var app = express(); // instansia del express
var server = http.Server(app); // nuevo servidor para pasar app expres en server

var session_redis_middleware = session({
	store: new RedisStore({}),
	secret: "Subarashi watashin o himitsu"
});

// para q express y socket io comparta la misma session
realtime(server,session_redis_middleware); 
var searchFields = "_id , name , email , age , sex" ;
// configurando e instanciando
app.use(express.static('assets')); //datos staticos
app.use(express.static('public')); //datos staticos
// app.use(bodyParser.json()); // sirve para leer parametros de peticion json,
// app.use(bodyParser.urlencoded({extended: true})); // parametros normal // si es falso no parse arreglos objetos // si es true permite parsear arreglos objetos 
app.use(formidable({
  encoding: 'utf-8',
  uploadDir: 'public/temp',
  //multiples: true, // req.files to be arrays of files 
}));


app.use(session_redis_middleware); //para almasenar sessiones en redis

app.set("view engine", "pug"); // seleccionar el motor de vistas

//rutas



//GETS
app.get("/",function(req,res){ 
	if(req.session.current_user){
		res.redirect("/dashboard");
	}
	res.render("index" , {title: "Inicio Proyecto"})
});

app.get("/login",function(req,res){
		res.render("login" )
});
app.get("/register",function(req,res){
		res.render("register" )
});


//post

app.post("/signup", function(req,res){
	var user = new User({
		name: req.fields.name,
		age: req.fields.age,
		sex: req.fields.sex,
		email: req.fields.email,
		password: req.fields.password,
		password_confirmation: req.fields.password_confirmation 
	});
	console.log("Guardado " + user);
	user.save(function(err){ if (err) { console.log(String(err));  res.send( String(err) + "<br> Inputs: <br>"+ String(user) ); }
	else { res.send("registrando: " + req.body.user.email); } })
	user.save().then(function(user)
	{
			 console.log("Guardado " + user);
			 res.redirect("/login");
	},function(err){
		if (err)
		{
				console.log(err.errors);
				res.render("register" , {errors: err.errors} );
		}
	});
});


app.post("/signin", function(req,res){
	if ( req.fields.email || req.fields.password)
	{
		User.findOne({email: req.fields.email , password: req.fields.password}, searchFields,function(err,userDoc){
			if (err || !userDoc)
			{
				console.log("error en signin session -----> ", err);
				res.redirect("/login");
			}
			else
			{
				// console.log("del login el usuario es", userDoc);
				req.session.current_user = userDoc;
				res.redirect("/dashboard");
			}
		});
	}
	else
	{
		console.log("campos vacios");
		res.redirect("/login");
	}
		
});

app.use(methodOverride("_method"));
app.use("/dashboard",check_session_middleware); // valido la session cuando entro a la ruta dashboard
app.use("/dashboard",router_app); // rutas modulares, ruta dashboard ,

// app.listen(8080,function(){
// 	console.log("Corriendo proyecto 2 redis");
// });
// ahora el servidor es quien recibe peticiones
server.listen(8080,function(){ 
 	console.log("Corriendo proyecto 2 redis");
});