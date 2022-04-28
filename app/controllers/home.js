module.exports = (app, User) => {

// GET : /
app.get('/', function(req,res){
	sess=req.session;

	var alert = sess.alert;
	sess.alert = null;

	var user = sess.user;
	res.render('layout',{content:"home/index",user:user,alert:alert});
});


}