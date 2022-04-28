class Contact {

    constructor (email,username,birthday,status,pseudofrom,pseudoto) {
        this.email = email;
    	this.username = username;
        this.birthday = birthday;
    	this.status = status;
        this.from_fk = from_fk;
        this.to_fk = to_fk;
        this.pseudo_from = pseudo_from;
        this.pseudo_to = pseudo_to;
        this.accepted = accepted;
        this.blocked = blocked;
    }

    static verificationInvitation(from, to, callback){
		var query = db.query("SELECT * FROM contacts WHERE (from_fk = ? AND to_fk = ?) OR (from_fk = ? AND to_fk = ?) AND blocked = 0",[from,to, to, from], function(error,rows,fields){
	      	if(!!error){
	        	console.log('Error : ' + query.sql);
	      	}else if (rows[0]){
	      		// Invitation en attente, ou déjà accepté
	      		callback(true);
			}else{
				// Invitation en cours
				callback(false);
			}
		}); 
	}

	static addContact(from, to, callback) {
		var query = db.query('INSERT INTO contacts (from_fk, to_fk, accepted) VALUES (?,?,?)',[from, to, 0], function(error, result){
			if(!!error){
				console.log('Error : ' + query.sql);
			}else{
				callback(result.insertId);
			}
		});
	}

	static getContactwithId(contactId,callback){
		var query = db.query("SELECT * FROM users INNER JOIN contacts WHERE users.id = contacts.from_fk AND contacts.contactId = ?",[contactId], function(error,rows,fields){
			if(!!error){
				console.log('Error : ' + query.sql);
			}else if (rows[0]){
				var contact=rows[0];
				delete contact.password;
            	callback(contact);
			} else {
				callback(null);
			}
		});    
	}

    static getContactwithUsername(userid,username,callback){
		var query = db.query("SELECT * FROM users INNER JOIN contacts WHERE (((users.id = contacts.from_fk)  AND ( contacts.to_fk = ?)) OR ((users.id = contacts.to_fk) AND ( contacts.from_fk = ?))) AND users.username = ?",[userid,userid,username], function(error,rows,fields){
	      	if(!!error){
	        	console.log('Error : ' + query.sql);
	      	}else if (rows[0]){
				var contact=rows[0];
				delete contact.password;
            	callback(contact);
			} else {
				callback(null);
			}
		});    
	}

	static getContacts(userid,callback){
		var contacts = [];
		var query = db.query("SELECT * FROM users INNER JOIN contacts WHERE (((users.id = contacts.from_fk AND contacts.to_fk = ?) OR (users.id = contacts.to_fk AND contacts.from_fk = ?)) AND contacts.accepted=1)",[userid,userid], function(error,rows,fields){
			if(!!error){
				console.log('Error : ' + query.sql);
			}else{
				for (var i=0;i<rows.length;i++){
					var contact=rows[i];
					delete contact.password;
					contacts.push(contact);
				}
            	callback(contacts);
			}
		});    
	} 
	

	static getRequests(userid,callback){
		var requests = [];
			var query = db.query("SELECT * FROM users INNER JOIN contacts WHERE users.id = contacts.from_fk AND contacts.to_fk = ? AND contacts.accepted=0 AND contacts.blocked=0",[userid], function(error,rows,fields){
			if(!!error){
				console.log('Error : ' + query.sql);
			}else{
				for (var i=0;i<rows.length;i++){
					var contact=rows[i];
					delete contact.password;					
					requests.push(contact);
				}
            	callback(requests);
			}
		});    
	}
	static deleteContact(from,to) {
		var query = db.query("DELETE FROM contacts WHERE (from_fk = ? AND to_fk = ?) OR (from_fk = ? AND to_fk = ?)",[from,to,to,from], function(error,rows,fields){
			if(!!error){
				console.log('Error : ' + query.sql);
			}
		});
	}

	static acceptRequest(contactid){
		var query = db.query("UPDATE contacts SET accepted = 1 WHERE contactId=?",[contactid], function(error,rows,fields){
			if(!!error){
				console.log('Error : ' + query.sql);
			}
		});
	}

	static refuseRequest(contactid){
		var query = db.query("DELETE FROM contacts WHERE contactId=?",[contactid], function(error,rows,fields){
			if(!!error){
				console.log('Error : ' + query.sql);
			}
		});
	}


	static sendInvit(contactId,callback){
		var query = db.query("SELECT * FROM users INNER JOIN contacts WHERE users.id = contacts.from_fk AND contacts.contactId = ?",[contactId], function(error,rows,fields){
			if(!!error){
				console.log('Error : ' + query.sql);
			}else if (rows[0]){
				var contact=rows[0];
				delete contact.password;
            	callback(contact);
			} else {
				callback(null);
			}
		});    
	}

	static setNotifFrom(nbr,contactId){
		var query = db.query("UPDATE contacts SET notif_from = ? WHERE contactId = ?",[nbr,contactId], function(error,rows,fields){
			if(!!error){
				console.log('Error : ' + query.sql);
			}
		});  
	}
	static setNotifTo(nbr,contactId){
		var query = db.query("UPDATE contacts SET notif_to = ? WHERE contactId = ?",[nbr,contactId], function(error,rows,fields){
			if(!!error){
				console.log('Error : ' + query.sql);
			}
		});  
	}

	static getNotif(contactId,callback){
		var query = db.query("SELECT notif_from,notif_to FROM contacts WHERE contactId = ?",[contactId], function(error,rows,fields){
			if(!!error){
				console.log('Error : ' + query.sql);
			}else if (rows[0]){
				callback(rows[0]);
			}else{
				callback(null)
			}
		});  
	}



}
var db = include('app/context/db.js');
module.exports = Contact;