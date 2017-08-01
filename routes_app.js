var express = require("express");
var router = express.Router();
var fs = require("fs"); //lector de archivos
var redis = require("redis");

var client = redis.createClient();
// var mv = require('mv');
var User = require("./models/user").User; // .User es apara solo obtener el User
var Image = require("./models/image"); // .User es apara solo obtener el User
var Comment = require("./models/comment"); // .User es apara solo obtener el User

var find_Image_middleware = require("./middlewares/find_image");
var find_User_middleware = require("./middlewares/find_user");
var mainRoute = "dashboard";

// REST home
router.get("/", function(req,res){
	Comment.find({})
		.populate("creator")
		.exec(function(err,comments){
			res.render(mainRoute+"/home" , {mainRoute: "/"+mainRoute , comments: comments });
		});
		
});

/////////////// // REST Users

router.route("/users")
	.get(function(req,res){
		User.find({},function(err,users){
			// console.log(users);
			res.render(mainRoute+"/users/index" , {mainRoute: "/"+mainRoute , users: users } );
		})
	})

		///////  Users/:id
router.all("/users/:id*",find_User_middleware);

router.get("/users/:id/edit" , function(req,res){
	console.log("editar , locals", res.locals);
	res.render(mainRoute+"/users/edit" , {mainRoute: "/"+mainRoute });
})

router.route("/users/:id")
	.get(function(req,res){
		console.log("mostrando local desde show user", res.locals)
		res.render(mainRoute+"/users/show" , {mainRoute: "/"+mainRoute });
	})
	.put(function(req,res){
		console.log("mostrand post", req.fields);
		res.locals.user.name= req.fields.name,
		res.locals.user.sex= req.fields.sex,
		res.locals.user.age= req.fields.age,
		res.locals.user.save(function(err){
			if (!err) {
				res.redirect("/"+mainRoute+"/users/"+res.locals.user._id)
			}
			else{
				console.log("el error", err);
				res.render(mainRoute+"/users/edit" , {mainRoute: "/"+mainRoute , errors: err.errors});
			}
		})
	})
	.delete(function(req,res){
		User.findOneAndRemove({_id: req.params.id},function(err){
			if (!err)
			{
				res.redirect("/"+mainRoute+"/users/");

			}
			else{
				console.log(err);
				res.redirect("/"+mainRoute+"/users/"+req.params.id);
				
			}
		})
	});

router.get("/users/:id/images" , function(req,res){
	Image.find({creator: res.locals.current_user._id},function(err,imgs){
		// console.log(imgs);
		res.render(mainRoute+"/users/images" ,{mainRoute: "/"+mainRoute  , images: imgs} );
	})
})

//////// REST IMAGES 


router.get("/images/new",function(req,res){
	console.log("ruta new image")
	res.render(mainRoute+"/images/new" ,{mainRoute: "/"+mainRoute } );
});

router.route("/images")
	.get(function(req,res){
		Image.find({})
			.populate("creator")
			.exec(function(err,imgs){
				if (err) console.log(err);
				res.render(mainRoute+"/images/index" ,{mainRoute: "/"+mainRoute  , images: imgs} );
			})
	
	})
	.post(function(req,res){
		var extension = req.files.photo.name.split(".").pop();
		var imgData = {
			title: req.fields.title,
			creator: res.locals.current_user._id,
			extension: extension,
		}
		console.log("objeto formado de la img" ,req.files.photo.path);
		var image = new Image(imgData)
		image.save(function(err){
			if (!err){
				User.findById(image.creator,function(err,user){
					var imgJSON={
						"id": image._id,
						"title": image.title,
						"extension": image.extension,
						"creator": user,
					}
					client.publish("images",JSON.stringify(imgJSON));
					fs.rename(req.files.photo.path, "public/images/"+image._id+"."+extension);
					res.redirect("/"+mainRoute+"/images/"+image._id);
				});
			}
			else{
				res.render(err);
			}
		});

	});



// IMAGE ID
		// middleware refactor find image
router.all("/images/:id*",find_Image_middleware);

router.get("/images/:id/edit",function(req,res){
	  // console.log("editar imagen", res.locals.image);
		res.render(mainRoute+"/images/edit" ,{mainRoute: "/"+mainRoute  } );

});


router.route("/images/:id")
	.get(function(req,res){

		res.render(mainRoute+"/images/show" ,{mainRoute: "/"+mainRoute  } );
	})
	.put(function(req,res){
		var extension = req.files.photo.name.split(".").pop();
		var path_to_delete= "public/images/"+res.locals.image._id+"."+res.locals.image.extension ;
		// console.log("objeto formado de la img" ,req.files.photo.path);
		fs.exists(path_to_delete, function(exists) {
		  if(exists) {
		    fs.unlink(path_to_delete ,function(err){
				  if(err){
					  	console.log(err);
				  		console.log("no se pudo actualizar la imagen");
				  }
				  else
				  {
				  	console.log("Imagen Borrada correctamente");
				  }
				}); 

		  } 
		  else 
		  {
		   	console.log("Imagen no existe")
		  }
			res.locals.image.title = req.fields.title;
			res.locals.image.extension = extension;
			console.log("ver locals desps: ", res.locals)
			res.locals.image.save(function(err){
				if (!err) {
					fs.rename(req.files.photo.path, "public/images/"+res.locals.image._id+"."+extension);
					res.redirect("/"+mainRoute+"/images/"+res.locals.image._id)

				}
				else{
					console.log("el error", err);
					res.redirect("/"+mainRoute+"/images/"+res.locals.image._id)
				}
			})
		});

	})
	.delete(function(req,res){
		console.log("ELiminar imagen >:C ", res.locals.image);
		res.locals.image.remove(function(err){
			if (!err)
			{
				fs.unlink("public/images/"+res.locals.image._id+"."+res.locals.image.extension ,function(err){
		        if(err) return console.log(err);
		        console.log('file deleted successfully');
		   	}); 
				// res.render(mainRoute+"/images" , {mainRoute: "/"+mainRoute, images: imgs});
				res.redirect("/"+mainRoute+"/images/");

			}
			else
			{
				console.log("no se pudo borrar");
				console.log(err);
				res.redirect("/"+mainRoute+"/images/"+req.params.id);
			}
		})
		// Image.findOneAndRemove({_id: req.params.id},function(err){
		// 	if (!err)
		// 	{
		// 		console.log("borrando");
		// 		res.render(mainRoute+"/images" , {mainRoute: "/"+mainRoute, images: imgs});
		// 	}
		// 	else{
		// 		console.log(err);
		// 		res.redirect("/"+mainRoute+"/images/"+req.params.id);
				
		// 	}
		// })
	});



////////////////// FIN REST IMAGES



//////// Rest Comments
router.route("/comments")
	.post(function(req,res){
		console.log(req.fields)
		var date = new Date();

		var commentData = {
			comment: req.fields.comment,
			creator: res.locals.current_user._id,
			createt_at: date,
		}
		var comment = new Comment(commentData)
		comment.save(function(err){
			
			if (!err){
				User.findById(comment.creator, function(err, user)
				{
					console.log("populando usuario ",user);
					var commentJSON={
						"id": comment._id,
						"comment": comment.comment,
						"creator": user,
						"createt_at": comment.created_at,
					}

					client.publish("comments",JSON.stringify(commentJSON));
					res.redirect("/"+mainRoute);
				});
			}
			else{
				res.render(err);
			}
		
		});

	});


router.route("/comments/:id")
	.delete(function(req,res){
		Comment.findOneAndRemove({_id: req.params.id},function(err){
			if (!err)
			{
				// res.render(mainRoute+"/home");
				res.redirect("/"+mainRoute);
			}
			else{
				console.log(err);
				res.render(err);
				
			}
		})
	});

//// FIN REST Comments
// REST otro

router.get("/logout",function(req,res){
	req.session.current_user = undefined;
	res.redirect(mainRoute);
});

module.exports = router;