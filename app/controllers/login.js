module.exports = (app,User) => {

	app.get('/login',function(req,res)
	{
		res.redirect('/');
	});


	// POST : /login
	app.post('/login', function(req,res){
		var sess=req.session;
		
		if ((req.body.email!=null)&&(req.body.password!=null)){

			var email=req.body.email;
			var password=req.body.password;

			User.login(email,password, function(result) {
				if (result!=null){
					setsession(result);
				}else{
					sess.alert = new app.alert("Error !","Username, email or password invalid.","danger")
					res.redirect('/#signin');
				} 
			});

			var setsession = function(user) {
				sess.user=user;
				user.status="Online"
				
		  		res.redirect('/play');
		  	}
		  }else res.redirect('/');
	});

}