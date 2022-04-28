var socket= io.connect();

var audioMsg = new Audio('/audio/msg.mp3');


/*
*
* Login
*
*/
function userLogin(email,password){
    socket.emit('user login',email,password);
}

/*
*
* Delete contact
*
*/
function deleteContact(user,contact) {
    socket.emit('delete contact',user,contact);
}
socket.on('delete success', function(data) {
    deleteSuccess(data);
});


/*
*
* Status change
*
*/
// Send new status to server
function ChangeStatus(value){
    socket.emit('change status', value);
}
// Display new status
socket.on('changed status', function(data){
    StatusChanged(data);
    if (typeof StatusChangedBis === "function") { 
        StatusChangedBis(data);
    }
});


/*
*
* Global chat
*
*/
function getUserGlobalChat(){
    socket.emit('get user globalchat');
}
socket.on('set user globalchat', function(users){
    setUserGlobalChat(users);
});


/*
*
* Message system
*
*/
// Send message to server
function SendMsg(message,from,channel,type,notif){
    socket.emit('send message', message,from,channel,type,notif);
}
// Display message from server
socket.on('new message', function(data){  
    if (typeof NewMsg === "function") { 
        NewMsg(data);    
    }else if (data.type!='info'){
        if (data.to){
            audioMsg.play();
            AddUnreadMessage(data.to,data.from.userId);
        }
    }

});
function AddUnreadMessage(user,fromId){
    AddContactNotif(fromId);
}


/*
*
* Accept/Refuse friend request
*
*/
function AcceptRequest(contactId){
    socket.emit('request accept', contactId);
}
function RefuseRequest(contactId){
    socket.emit('request refuse', contactId);
}
socket.on('request accepted', function(contact, crypted) {
    deleteRequest(contact.contactId);
    addContact(contact, crypted);
});
socket.on('request refused', function(contactId) {
    deleteRequest(contactId);
});


/*
*
* Leaderboards
*
*/
function getLeaderboard(){
    socket.emit('get leaderboard');
};
socket.on('set leaderboard', function(leaderboard){
    setLeaderboard(leaderboard);
});


/*
*
* Game
*
*/
function userReadyToPlay(data,board){
    socket.emit('user ready to play',data,board);
}
socket.on('oppo ready to play', function (room,board){
    oppoReadyToPlay(room,board);
});
socket.on('opponent cancel game',function(room){
    oppoLeaveGame(room);
});
function gameStart(data,board){
    socket.emit('game start',data,board);
}
socket.on('game started', function (room,board,gameId){
    gameStarted(room,board,gameId);
});
socket.on('set game id', function (gameId){
    setGameId(gameId);
});
function sendShot(data,row,col,stat,info){
    socket.emit('send shot',data,row,col,stat,info)
}
socket.on('receive shot', function (data,row,col,stat){
    receiveShot(data,row,col,stat);
});
function winGame(data,info){
    socket.emit('win game',data,info);
}
socket.on('loose game',function(user,room){
    endGame(user);
});


/*
*
* Search a user
*
*/
function searchUser(username){
    socket.emit('search user',username);
}
socket.on('open user profile', function (user){
    openUserProfile(user);
});


/*
*
* Search a game
*
*/
function searchUserGame(user){
    socket.emit('search user game',user)
}
socket.on('found user game', function(data){
    foundUserGame(data);
});
function cancelSearchUserGame(user){
    socket.emit('cancel search user game',user);
}
function sendUserGameRequest(user,contactId){
    socket.emit('search specific user game',user,contactId);
}
socket.on('user already in game',function(){
    alert("User already in game");
})
socket.on('user game request',function(user){
    userGameRequest(user);
})
function acceptUserGameRequest(from,to){
    socket.emit('accept user game request',from,to);
}
function refuseUserGameRequest(from,to){
    socket.emit('refuse user game request',from,to);
}
socket.on('refused user game request',function(from,to){
    refusedUserGameModal(from,to);
});


/*
*
* Add Contact
*
*/
function SendRequest(user, contact){
    socket.emit('add contact', user, contact);
}
// Invitation Success
socket.on('invitation success', function(data) {
    addRequest(data);
});
// Invitation pending
socket.on('invitation pending or already accepted', function() {
    //invitationPending();
});


/*
*
* Others
*
*/
// In case we need redirect the client
socket.on('redirect', function(destination) {
    window.location.href = destination;
});