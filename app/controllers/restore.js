module.exports = (app,transporter,User) => {

	// GET : /restore
	app.get('/restore', function(req, res) {
		res.redirect('/');
	});

	// POST : /restore
	app.post('/restore', function(req, res) {
		var sess=req.session;

		// Generate new password
		var randomPassword = Math.random().toString(36).slice(-8);

		User.getUserCompact(req.body.sendemail, function(result) {
			if (result!=null){
				sendmail(result);
			}else{
				sess.alert = new app.alert("Danger !","There is no user with this username or email.","danger")
				res.redirect('/#forgot');
			}
		});
		
		var sendmail = function(user) {

			// Prepair the content of email
		 	var url = req.protocol + '://' + req.get('host') + '/login';
			var intro = "Hello "+user.username+",<br><br>";
			var base = "You have requested to reset the password for username: 	<b>"+user.username+"</b><br><br>";
			var txt = "Please change your password after login.<br>New Password: <b>"+randomPassword+"</b><br><br>";
			var link = "Login Link:<br> <a href="+url+">"+url+"</a><br><br>";
			var end = "See you back on Battleship!";

			// Email config
			var mailOptions = {
			    from: "Battleship",
			    to: user.email,
			    subject: "Your new password",
			    text: '',
			    html: intro+base+txt+link+end
			};


			// Send the email
			transporter.sendMail(mailOptions, function(error, info){
			     if(error){
					sess.alert = new app.alert("Danger !","Error while sending new password.","danger")
					res.redirect('/#forgot');
			     }else editpassword();
			});

			transporter.close();

			var editpassword = function() {

				// Edit the user
				user.password=randomPassword;
				User.edit(user);

				sess.alert = new app.alert("Success !","Your new password has been sent.","success")
				res.redirect('/#forgot');
			}
		}
	});

}