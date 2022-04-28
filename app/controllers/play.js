module.exports = (app,User,Contact) => {

	// GET : /play
	app.get('/play', function(req,res){
		sess=req.session;
		if(sess.user) {
			var user = sess.user;

			// Get contacts
			Contact.getContacts(user.id, function(result) {
				getrequests(result);
			});

			// Get Requests
			var getrequests = function(contacts) {
				Contact.getRequests(user.id, function(result) {
					sendview(contacts,result);
				});	
			}	

			var sendview = function(contacts,requests) {
				res.render('layout',{content:"play/index",user:user,contacts:contacts,requests:requests});
			}
		}else res.redirect('/');

	});


}