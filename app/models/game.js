class Game {

    constructor (userId) {
        this.userId = userId;
    	this.round = 0;
        this.playingTime = 0;
        this.missCount = 0;
    	this.hitCount = 0;
    	this.win = false;
    }

	static new(game,callback){
		var query = db.query('INSERT INTO games SET ?',game, function(error,result){
	      	if(!!error){
	        	console.log('Error : ' + query.sql);
	      	}else{
	      		callback(result.insertId)
	      	}
		});    
	}

	static update(game){
		var query = db.query("UPDATE games SET ? WHERE id = ?",[game,game.id], function(error,rows,fields){
			if(!!error){
				console.log('Error : ' + query.sql);
			}
		});
	}


	static selectAll(callback){
		var query = db.query("SELECT * FROM games INNER JOIN users WHERE users.id = games.userId", function(error,rows,fields){
			if(!!error){
				console.log('Error : ' + query.sql);
			}else{
				callback(rows);
			}
		});
	}

	static selectWithUserId(userId, callback){
		var query = db.query("SELECT * FROM games WHERE userId = ?",[userId], function(error,rows,fields){
			if(!!error){
				console.log('Error : ' + query.sql);
			}else{
				callback(rows);
			}
		});
	}
}
var db = include('app/context/db.js');
module.exports = Game;