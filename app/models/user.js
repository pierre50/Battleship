class User {

    constructor (email,username,birthday,password,status) {
        this.email = email;
    	this.username = username;
        this.birthday = birthday;
        this.password = password;
    	this.status = status;
    }

    static getId(username,callback){
		var query = db.query("SELECT id FROM users WHERE username = ?",[username], function(error,rows,fields){
	      	if(!!error){
	        	console.log('Error : ' + query.sql);
	      	}else if (rows[0]){
            	callback(rows[0]);
			}else{
				callback(null);
			}
		}); 
	}

	static getUserwithId(userid,callback){
		var query = db.query("SELECT * FROM users WHERE id = ?",[userid], function(error,rows,fields){
	      	if(!!error){
	        	console.log('Error : ' + query.sql);
	      	}else if (rows[0]){
            	callback(rows[0]);
			}else{
				callback(null);
			}
		});    
	}
    
    static getUserwithUsername(username,callback){
		var query = db.query("SELECT * FROM users WHERE username = ?",[username], function(error,rows,fields){
	      	if(!!error){
	        	console.log('Error : ' + query.sql);
	      	}else if (rows[0]){
            	callback(rows[0]);
			}else{
				callback(null);
			}
		});    
	}

    static getUserCompact(email,callback){
		var query = db.query("SELECT * FROM users WHERE email = ? or username = ?",[email,email], function(error,rows,fields){
	      	if(!!error){
	        	console.log('Error : ' + query.sql);
	      	}else if (rows[0]){
            	callback(rows[0]);
			}else{
				callback(null);
			}
		});    
	}

    static UserExists(email, username, callback){
		var query = db.query("SELECT * FROM users WHERE email = ? OR username = ?",[email,username], function(error,rows,fields){
	      	if(!!error){
	        	console.log('Error : ' + query.sql);
	      	}else if (rows[0]){
            	callback(true);
			}else{
				callback(false);
			}
		});    
	}

	static login(email,password,callback){
		var query = db.query("SELECT * FROM users WHERE (email = ? OR username = ? ) AND password = ?",[email,email,password], function(error,rows,fields){
	      	if(!!error){
	        	console.log('Error : ' + query.sql);
	      	}else if (rows[0]){
            	callback(rows[0]);
			}else{
				callback(null);
			}
		});    
	}

	static register(user){
		var query = db.query('INSERT INTO users SET ?',user, function(error,rows,fields){
	      	if(!!error){
	        	console.log('Error : ' + query.sql);
	      	}
		});    
	}


	static changeStatus(newstatus,userid){
		var query = db.query("UPDATE users SET status = ? WHERE id=?",[newstatus,userid], function(error,rows,fields){
			if(!!error){
				console.log('Error : ' + query.sql);
			}
		});
	}

	static getStatus(userid, callback){
		var query = db.query("SELECT status FROM users WHERE id = ?",[userid], function(error,rows,fields){
	      	if(!!error){
	        	console.log('Error : ' + query.sql);
	      	}else if (rows[0]){
            	callback(rows[0]);
			}else{
				callback(null);
			}
		}); 
	}

	static edit(user){
		var query = db.query("UPDATE users SET ? WHERE id=?",[user,user.id], function(error,rows,fields){
			if(!!error){
				console.log('Error : ' + query.sql);
			}
		});
	}

	static delete(userid){
		var query = db.query("DELETE FROM users WHERE id=?",[userid], function(error,rows,fields){
			if(!!error){
				console.log('Error : ' + query.sql);
			}
		});
	}

}
var db = include('app/context/db.js');
module.exports = User;