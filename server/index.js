module.exports = (app,io,fs,mkdirp,User,Contact,Game) => {

var users = [];
var connections = [];
var waitingRoom = [];
var gamingRoom = [];
/** 
 * Connection
 * 
 */
io.sockets.on('connection',function(socket){
	// Get the user session
	var sess = socket.request.session;
	var user=sess.user;
	connections.push(socket);

	/** 
	 * Initializing
	 * 
	 */
	if (user){
		// Verify users already connected
		indexOf = users.map(function(x) {return x.id; }).indexOf(user.id);
		var userSearch = users[indexOf];
		if (userSearch){
			userSearch.socketid.push(socket.id);
		}else{
		  	var client ={
				id:user.id,
				username:user.username,
				socketid:[socket.id],
			};
			users.push(client);
		}
		User.changeStatus("Online",user.id);
		updateOthersStatus("Online",user.id);
		UpdateOthersUserGlobalChat(users);
    }


	/** 
	 * Disconnect
	 * 
	 */
	socket.on('disconnect',function(data){
		if (user){
			setTimeout(disconnect,3000);
		}
		connections.splice(connections.indexOf(socket),1);
	});
	function disconnect(){
		// Delete user from waiting room
		waitingRoom.splice(waitingRoom.indexOf(user.id),1);

		// Delete user from gaming room and tell opponent that he win
		for (var i = 0; i < gamingRoom.length; i++) {
			if (gamingRoom[i].player1==user.id){
				userCancelGame(gamingRoom[i].player2,gamingRoom[i].room);
				gamingRoom.splice(i,1)				
			}else if (gamingRoom[i].player2==user.id){
				userCancelGame(gamingRoom[i].player1,gamingRoom[i].room);
				gamingRoom.splice(i,1)				
			}
		}

		// Delete socket from user
		indexOf = users.map(function(x) {return x.id; }).indexOf(user.id);
		var userSearch = users[indexOf];
		if (userSearch){
			userSearch.socketid.splice(userSearch.socketid.indexOf(socket.id),1);
		}

		// If user not connected at all ( don't got any socket) we set him offline
		if (userSearch.socketid.length<=0){
			users.splice(indexOf,1)
			putstatus(user.id);
		}
	}
	function putstatus(userId){
		User.changeStatus("Offline",userId);
		updateOthersStatus("Offline",userId);
		UpdateOthersUserGlobalChat(users);
 	};


	/** 
   	* Leaderboards
   	* 
   	*/
   	socket.on('get leaderboard',function(){
		getAllRank(function(result) {
			next(result)
		});
		var next = function(leaderboard) {
			socket.emit('set leaderboard',leaderboard);
		}
   	});

   	function getAllRank(callback){
   		var leaderboard = [];
		Game.selectAll(function(result) {
			if (result){
				next(result);
			}else{
				// erreur utilisateur non trouvé
			}
		});
		var next = function(games) {
			games.forEach(function(game) {
				var gamesList=[];
				var userId=game.userId;
				delete game.userId;
				delete game.id;
    			indexOf = leaderboard.map(function(x) {return x.id; }).indexOf(userId);
				var userSearch = leaderboard[indexOf];
				if (userSearch){
					userSearch.games.push(game);
				}else{
					gamesList.push(game);
					leaderboard.push({id:userId,username:game.username,games:gamesList})
				}
			});
			getRank(leaderboard);
		}
		var getRank = function(leaderboard){
			for (var i = 0; i < leaderboard.length; i++) {
				var winCount=0;var looseCount=0;var roundAvg=0;
				var roundSum=0;var timeAvg=0;var timeSum=0;
				var gamesCount=leaderboard[i].games.length;
				leaderboard[i].games.forEach(function(game){
					roundSum += game.round;
					timeSum += game.playingTime;
					if (game.win==1){
						winCount++;
					}else{
						looseCount++;
					}
				});
				var roundAvg = roundSum/gamesCount;
				var timeAvg = timeSum/gamesCount;
				leaderboard[i].roundAvg=roundAvg;
				leaderboard[i].timeAvg=timeAvg;

				delete leaderboard[i].games;

				// Calcul our rank here
				leaderboard[i].rank=Math.round((winCount*gamesCount)/(looseCount+1));
			}
			verifyTie(leaderboard);
		}
		// Verification if user got the same rank we verify the round average then time average
		var verifyTie = function(leaderboard){
			for (var i = 0; i < leaderboard.length; i++) {
				for (var j = 0; j < leaderboard.length; j++) {
					if (leaderboard[i].rank==leaderboard[j].rank){
						if (leaderboard[i].roundAvg<leaderboard[j].roundAvg){
							leaderboard[j].rank-=1;
							// We decrease the rank of the other users
							for (var k = j+1; k < leaderboard.length; k++) {
								if (leaderboard[k].rank>0)
									leaderboard[k].rank-=1;
							}
						}else if (leaderboard[j].roundAvg<leaderboard[i].roundAvg){
							leaderboard[i].rank-=1;
							// We decrease the rank of the other users
							for (var k = i+1; k < leaderboard.length; k++) {
								if (leaderboard[k].rank>0)
									leaderboard[k].rank-=1;
							}							
						}else if (leaderboard[i].timeAvg<leaderboard[j].timeAvg){
							leaderboard[j].rank-=1;
							// We decrease the rank of the other users
							for (var k = j+1; k < leaderboard.length; k++) {
								if (leaderboard[k].rank>0)
									leaderboard[k].rank-=1;
							}
						}else if (leaderboard[j].timeAvg<leaderboard[i].timeAvg){
							leaderboard[i].rank-=1;
							// We decrease the rank of the other users
							for (var k = i+1; k < leaderboard.length; k++) {
								if (leaderboard[k].rank>0)
									leaderboard[k].rank-=1;
							}	
						}
					}
				}
			}
			leaderboard.sort(function(a, b) { 
				return b.rank - a.rank;
			})

			callback(leaderboard);
		}
   	}



	/** 
   	* Game
   	* 
   	*/
	socket.on('user ready to play', function(data,board){
		indexOf = users.map(function(x) {return x.id; }).indexOf(data.player2.id);
		var userSearch = users[indexOf];
		if (userSearch){
	  		for (var i = 0; i < userSearch.socketid.length; i++) {
	    		io.to(userSearch.socketid[i]).emit('oppo ready to play', data.room, board);
	  		}
		}
	});
	socket.on('game start', function(data,board){
		indexOf = users.map(function(x) {return x.id; }).indexOf(data.player2.id);
		var userSearch = users[indexOf];
		if (userSearch){
			var game1 = new Game(data.player1.id);
			var game2 = new Game(data.player2.id);
			Game.new(game1, function(result) {
				if (result){
					setGame2(result);		
				}
			});

			var setGame2 = function(game1id) {
				Game.new(game2, function(result) {
					if (result){
						sendGame(game1id,result);		
					}
				});		
			}
			var sendGame = function(game1id,game2id){
				socket.emit("set game id",game1id);
		  		for (var i = 0; i < userSearch.socketid.length; i++) {
		    		io.to(userSearch.socketid[i]).emit('game started', data.room, board, game2id);
		  		}
	  		}
		}	
	});
	socket.on('send shot',function(data,row,col,stat,info){
		info.id=data.player1.gameId;
		Game.update(info);

		indexOf = users.map(function(x) {return x.id; }).indexOf(data.player2.id);
		var userSearch = users[indexOf];
		if (userSearch){
	  		for (var i = 0; i < userSearch.socketid.length; i++) {
	    		io.to(userSearch.socketid[i]).emit('receive shot', data, row, col, stat);
	  		}
		}	
	});
	socket.on('win game',function(data,info){
		info.id=data.player1.gameId;
		info.win=true;
		Game.update(info)

		indexOf = users.map(function(x) {return x.id; }).indexOf(data.player2.id);
		var userSearch = users[indexOf];
		if (userSearch){
	  		for (var i = 0; i < userSearch.socketid.length; i++) {
	    		io.to(userSearch.socketid[i]).emit('loose game', data.player1);
	    	}
  		}
	});


	/** 
   	* Search user in game
   	* 
   	*/
	socket.on('search user game', function(userReq){
		var targetId;
		// Search in the waiting room if there is someone
		for (var i = 0; i < waitingRoom.length; i++) {
			targetId=waitingRoom[i];
		}
		// If there is
		if (targetId){
			// It's not ourself
			if (targetId!=userReq.id){
				// Get the user object
				User.getUserwithId(targetId, function(result) {
					if (result){
						waitingRoom.splice(waitingRoom.indexOf(targetId),1);
						delete result.password;
						sendFoundUserGame(result);		
					}
				});

				var sendFoundUserGame = function(contact) {
					createGame(userReq,contact);
				}
			}
		}else{
			// We are us in the waiting room
			waitingRoom.push(userReq.id);
		}
	});
	socket.on('search specific user game', function(userReq,contactReq){
		var contactFree=true;
		for (var i = 0; i < gamingRoom.length; i++) {
			if ((gamingRoom[i].player1==contactReq) || (gamingRoom[i].player2==contactReq)){
				contactFree=false;
			}
		}
		if (contactFree){
			indexOf = users.map(function(x) {return x.id; }).indexOf(contactReq);
			var userSearch = users[indexOf];
			if (userSearch){
		  		for (var i = 0; i < userSearch.socketid.length; i++) {
		    		io.to(userSearch.socketid[i]).emit('user game request',userReq);
		  		}
			}
		}else{
			socket.emit('user already in game');
		}
	});
	socket.on('accept user game request',function(from,to){
		createGame(from,to);
	});	
	socket.on('refuse user game request',function(from,to){
		indexOf = users.map(function(x) {return x.id; }).indexOf(to.id);
		var userSearch = users[indexOf];
		if (userSearch){
	  		for (var i = 0; i < userSearch.socketid.length; i++) {
	    		io.to(userSearch.socketid[i]).emit('refused user game request',from,to);
	  		}
		}
	});
	function createGame(user,contact){
		// Set a generate id for the room
		var room = guid();

		// Random who will start the game first
		var whoseTurn=user;
		var randomNbr=Math.round(Math.random());
		switch(randomNbr) {
		    case 0:
		        whoseTurn=contact;
		        break;
		    case 1:
		        whoseTurn=user;
		        break;
		    default:
		        whoseTurn=user;
		}

		// Add all the information to a gaming list used one user disconnect during a game session
		gamingRoom.push({player1:user.id,player2:contact.id,room:room});
		
		// Start game on user
		socket.emit('found user game',{player1:user, player2:contact, ready:false, whoseTurn:whoseTurn, room:room});

		// Start game on the other one
		indexOf = users.map(function(x) {return x.id; }).indexOf(contact.id);
		var userSearch = users[indexOf];
		if (userSearch){
	  		for (var i = 0; i < userSearch.socketid.length; i++) {
	    		io.to(userSearch.socketid[i]).emit('found user game', {player1:contact, player2:user, ready:false, whoseTurn:whoseTurn, room:room});
	  		}
		}
	}
	// Generate a guid key for a game session
	function guid() {
	    var d = new Date().getTime();
	    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	        var r = (d + Math.random()*16)%16 | 0;
	        d = Math.floor(d/16);
	        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
	    });
	    return uuid;
	}
	// When user don't want search game anymore we remove him from waiting room
	socket.on('cancel search user game',function(user){
		waitingRoom.splice(waitingRoom.indexOf(user.id),1);
	});
	// Function to prevent user when opponent leave the game suddently
	function userCancelGame(userId,room){
		indexOf = users.map(function(x) {return x.id; }).indexOf(userId);
		var userSearch = users[indexOf];
		if (userSearch){
	  		for (var i = 0; i < userSearch.socketid.length; i++) {
	    		io.to(userSearch.socketid[i]).emit('opponent cancel game', room);
	  		}
		}
	}

	/** 
   	* Global Chat
   	* 
   	*/
	socket.on('get user globalchat', function(){
		SendUserGlobalChat(users);
	});
	function SendUserGlobalChat(users){
		socket.emit('set user globalchat', users);
	}
	function UpdateOthersUserGlobalChat(users){
		users.forEach(function(user) {
			for (var i = 0; i < user.socketid.length; i++) {
				io.to(user.socketid[i]).emit('set user globalchat', users);
			}
		});
	}



	/** 
   	* Message
   	* 
   	*/
	socket.on('send message', function(message,from,to,type){
		Message(message,from,to,type);
 	});
 	function Message(message,from,to,type){
  		// Prepair the current date
		var d = new Date();
		var date =(("00" + (d.getMonth() + 1)).slice(-2) + "/" + ("00" + d.getDate()).slice(-2) + "/" + d.getFullYear() + " " + ("00" + d.getHours()).slice(-2) + ":" + ("00" + d.getMinutes()).slice(-2) + ":" + ("00" + d.getSeconds()).slice(-2));
	
	    // Send to clients
		SendMessage(message,from,to,date,type);
 	}
  	function SendMessage(message,from,to,date,type) {
  		if (to){
  			var tos=[]
  			tos.push(from);
  			tos.push(to);
			tos.forEach(function(to) {
				indexOf = users.map(function(x) {return x.id; }).indexOf(to.id);
				var userSearchTo = users[indexOf];
				if (userSearchTo){
					to.userId=to.id;
					from.userId=from.id;
					from.cryptedPseudo=app.locals.encrypt(from.username);
			  		for (var i = 0; i < userSearchTo.socketid.length; i++) {
			    		io.to(userSearchTo.socketid[i]).emit('new message', {msg: message, from:from, to:to, date:date, type:type});
			  		}
				}
			});
		}else{
			users.forEach(function(user) {
				from.userId=from.id;
				from.cryptedPseudo=app.locals.encrypt(from.username);
		  		for (var i = 0; i < user.socketid.length; i++) {
		    		io.to(user.socketid[i]).emit('new message', {msg: message, from:from, to:to, date:date, type:type});
		  		}
			});
		}
	}


	/** 
	 * Change status
	 * 
	 */
	socket.on('change status',function(newstatus){
		changestatus(newstatus,user.id);
	});
	function changestatus(newstatus,userid){
		User.changeStatus(newstatus,userid);
		updateOthersStatus(newstatus,userid);
	}
	function updateOthersStatus(newstatus,userid){
		users.forEach(function(user) {
			for (var i = 0; i < user.socketid.length; i++) {
				io.to(user.socketid[i]).emit('changed status',{newstatus:newstatus,userid:userid});
			}
		});
	}


	/** 
	 * Update requests
	 * 
	 */
	socket.on('request accept',function(contactId){
		Contact.acceptRequest(contactId);

		Contact.getContactwithId(contactId, function(result) {
			if (result){
				next(result);
			}else{
				// erreur utilisateur non trouvé
			}
		});
		var next = function(contact) {
			// Display our new contact
			socket.emit('request accepted',contact, app.locals.encrypt(contact.username));

			// Send to the dude who send request
			indexOf = users.map(function(x) {return x.id; }).indexOf(contact.id);
			var userSearch = users[indexOf];
			if (userSearch){
		  		for (var i = 0; i < userSearch.socketid.length; i++) {
				    io.to(userSearch.socketid[i]).emit('request accepted',user, app.locals.encrypt(user.username));		  		
				}
			}

		}
	});
	socket.on('request refuse',function(contactId){
		Contact.refuseRequest(contactId);
		socket.emit('request refused',contactId);
	});

	/** 
	 * Search a contact
	 * 
	 */
	socket.on('search user',function(username){
		User.getUserCompact(username, function(result) {
			if (result){
				delete result.password;
				sendUser(result);		
			}
		});

		var sendUser = function(user) {
			socket.emit('open user profile',user);
		}
	});


	/** 
	 * Add Contact
	 * 
	 */
 	socket.on('add contact', function(user,contact){
	 	Contact.verificationInvitation(user.id,contact.id, function(result) {
			if (result) {
				socket.emit('invitation pending or already accepted');
			} else {
				Contact.addContact(user.id,contact.id, function(result) {
					sendRequest(result)
				});

				var sendRequest = function(contactId) {
					user.contactId=contactId;
					indexOf = users.map(function(x) {return x.id; }).indexOf(contact.id);
					var userSearch = users[indexOf];
					if (userSearch){
			  			var cryptedUsername = app.locals.encrypt(user.username);
				  		for (var i = 0; i < userSearch.socketid.length; i++) {
				    		io.to(userSearch.socketid[i]).emit('invitation success', {user:user,to:contact.id,cryptedUsername:cryptedUsername});
				  		}
					}
				}
			}
		});
 	});


	/** 
	 * Delete Contact
	 * 
	 */
 	socket.on('delete contact', function(user,contact){
		Contact.deleteContact(user.id,contact.id);
		indexOf = users.map(function(x) {return x.id; }).indexOf(contact.id);
		var userSearch = users[indexOf];
		if (userSearch){
			for (var i = 0; i < userSearch.socketid.length; i++) {
				io.to(userSearch.socketid[i]).emit('delete success', {user:user,to:contact.id});
			}
		}
 	});



});

}