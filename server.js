// Load module
var express = require('express');
var session = require('express-session');
var multer  = require('multer');

var app = express();
var server= require('http').createServer(app);

var bodyParser = require('body-parser');
var io = require('socket.io').listen(server);
var ejs = require('ejs'); 

var fs = require('fs');
var mkdirp = require('mkdirp');

var nodemailer = require('nodemailer');

var crypto = require('crypto');
    crypto.algorithm = 'aes-256-ctr';
    crypto.password = 'd6F3Efeq';

app.locals.decrypt = function(text){
  var decipher = crypto.createDecipher(crypto.algorithm,crypto.password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}
app.locals.encrypt = function(text){
  var cipher = crypto.createCipher(crypto.algorithm,crypto.password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}

// Mail configuration
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'projectdev2017@gmail.com',
        pass: 'Supinf0!'
    }
});

// Session configuration
var sessionMiddleware = session({
    secret: "keyboard cat",
    cookie: {}, 
    resave: true,
    saveUninitialized: true
});

// Set session to socket.io
io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});

// Application configuration 
global.base_dir = __dirname;
global.abs_path = function(path) {
  return base_dir + path;
}
global.include = function(file) {
  return require(abs_path('/' + file));
}

// Define upload file path
var upload = multer({ dest: 'uploads/' });

app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.use(sessionMiddleware);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/app'));
app.use(express.static(__dirname + '/data'));
app.set('views', __dirname + '/app/views');

app.alert = include('app/models/alert.js')

// Database configuration
var mysql = require('mysql');

var db = mysql.createConnection({
    host     : 'mysql3.gear.host',
    user     : 'battleship',
    password : 'Zh76yXVtB?-f',
    database : 'battleship'
});

// Try connection with Database
db.connect(function(error){
	if(!!error){
		console.log('-Error database');
	}else{
		console.log('-Connected database');
	}
});

// We clean our database setting all user status offline, in case server crash
var query = db.query("UPDATE users SET status = 'Offline'",function(error,rows,fields){
	if(!!error){
		console.log('Error : ' + query.sql);
	}else{
		console.log('-Database cleaned');
	}
});

// Start the server
server.listen(process.env.PORT || 8888);
console.log('-Server running ...');

//app.context = require(__dirname + '/app/context/context.js')(db);

// We load the models
var User = include('app/models/user.js')
var Contact = include('app/models/contact.js')
var Game = include('app/models/game.js')

// We load all the controllers
app.controllers=[
	require(__dirname + '/app/controllers/login.js')(app,User),
	require(__dirname + '/app/controllers/logout.js')(app),
  require(__dirname + '/app/controllers/home.js')(app),
	require(__dirname + '/app/controllers/delete.js')(app,fs,User,Contact),
	require(__dirname + '/app/controllers/play.js')(app,User,Contact),
	require(__dirname + '/app/controllers/restore.js')(app,transporter,User),
	require(__dirname + '/app/controllers/register.js')(app,upload,fs,mkdirp,User)
]

// We load our application server
app.server = require(__dirname + '/server/index')(app,io,fs,mkdirp,User,Contact,Game);
