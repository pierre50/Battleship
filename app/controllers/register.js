module.exports = (app,upload,fs,mkdirp,User) => {

	app.get('/register',function(req,res)
	{
		res.redirect('/');
	});


	// POST : /register
	app.post('/register',upload.single('file'),function(req,res)
	{
		var sess=req.session;

		if(!sess.user) {

			if ((req.body.username!=null)&&(req.body.email!=null)&&(req.body.password!=null)) {

				var birthday =  req.body.year + "-" + req.body.month + "-" + req.body.day;

				var user = new User(req.body.email,req.body.username,birthday,req.body.password,"Offline")

				User.UserExists(req.body.email, req.body.username, function(result){
					if (result==true) { 
						sess.alert = new app.alert("Error !","Username, email already exists.","danger")
						res.redirect('/#signup'); 
					}
					else { setuser(); }
				});

				var setuser = function() {
		    		User.register(user);

					User.login(user.email,user.password, function(result) {
						if (result!=null){ setsession(result); }
					});
		  		}

				var setsession = function(user) {
					sess.user=user;
					sess.user.status="Online";
					res.redirect('/play');
				}
			}else res.redirect('/');
		}else res.redirect('/');
	});

}