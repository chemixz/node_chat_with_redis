var socket = io();

socket.on("new Image",function(data){
	var dataImg = JSON.parse(data);
	console.log("desde el ciente ",dataImg);
	var container_img = document.querySelector("#images");
	var source = document.querySelector("#image-template").innerHTML;
	var template = Handlebars.compile(source);
	container_img.innerHTML += template(dataImg);
});


socket.on("new Comment",function(data){
	var dataComment = JSON.parse(data);
	console.log("desde el ciente ",dataComment);
	var container_img = document.querySelector("#comments");
	var source = document.querySelector("#comment-template").innerHTML;
	var template = Handlebars.compile(source);
	container_img.innerHTML += template(dataComment);

});