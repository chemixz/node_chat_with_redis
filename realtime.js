module.exports = function(server,session_redis_middleware){
	var io = require("socket.io")(server);
	var redis = require("redis");
	var client = redis.createClient();


	client.subscribe("images");
	client.subscribe("comments");

	io.use(function(socket,next){
		session_redis_middleware(socket.request, socket.request.res, next)
		// configuramos para que utilice la misma session cn express
	})
	io.sockets.on("connection",function(socket){
		console.log("desde socket realtime");
		console.log(socket.request.session.current_user);
	});

	client.on("message", function(channel,message){
		console.log("desde socket io canal -->"+channel);
		if (channel == "images")
		{
			io.emit("new Image" , message);
		}
		if (channel == "comments")
		{
			io.emit("new Comment" , message);
		}
		
	});
}