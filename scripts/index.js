'use strict';

function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
var id = window.localStorage.getItem('id');
var makeId = makeid();
if(id){
  makeId = id;
} else {
  makeId = makeid();
  window.localStorage.setItem('id', makeId);
}

var is_user_active = false;

var update_doc_set_setInterval = null;

var user_id_set_interval = null;

$('#user_id').text(makeId);

 var config = {
    apiKey: "AIzaSyDC9WtLPHOyk_R-5HLEUDVpxWcXfOzdiPo",
    authDomain: "saurav-test2.firebaseapp.com",
    databaseURL: "https://saurav-test2.firebaseio.com",
    projectId: "saurav-test2",
    storageBucket: "saurav-test2.appspot.com",
    messagingSenderId: "354849428622"
  };
window.firebase.initializeApp(config);

var onValueChangeUser = function(snapshot){
          if (snapshot.val()) {
            snapshot.forEach(function(snap) {
              var data = snap.val()
              var user_id = data.user_id;
              if(user_id === makeId || !user_id){
                createSession();
                return;
              }
              $('#message').text(user_id+' is using document . Please refresh the page at regular interval to get access.');
              updateDoc();

            });
          }else{
            createSession();
          }
}

var updateDoc = function(){

  if(update_doc_set_setInterval){
    window.clearInterval(update_doc_set_setInterval);
  }
  update_doc_set_setInterval =  window.setInterval(function(){ 
      doc_ref.once('value').then(onValueChangeDoc)
   }, 1000);
}


var onValueChangeDoc = function(snapshot){
            if (snapshot.val()) {
              snapshot.forEach(function(snap) {
                var data = snap.val()
                var text_data = data.value;
                if(text_data){
                  $('#shared_doc').val(text_data);
                }
              });
            }
}

var createSession = function(){

           var newUserRef = user_ref.push();
           var text_Ref   = doc_ref.push();
           var connected_ref = window.firebase.database().ref(".info/connected");

           var setUserId =  function () {
              newUserRef.set({ user_id: makeId, 
                           }).then(function() {
                                is_user_active = true;
                                $('#shared_doc').attr('disabled',false);
                                $('#message').text('Document is enabled . You can now use the collaborative document.');
                           });
              
           };

           var setTextValue = function(){
              text_Ref.update({ value: $('#shared_doc').val(),
                           }).then(function() {
                               console.log('text updated');
                           });

           };
           window.removeUser = function () {
             newUserRef.set({ user_id: null, 
                           }).then(function() {
                                console.log("Remove succeeded.");
                                $('#shared_doc').attr('disabled',true);
                                $('#message').text('Document is disabled.Please refresh the page to gain access to document.');
                           });

           };

            connected_ref.on("value", function(snap) {
              if (snap.val() === true) {
                 newUserRef.onDisconnect().remove();
                 setUserId();

                 $('#shared_doc').keyup(function(){
                    setTextValue();
                 });
              } 
            });

}

document.addEventListener("visibilitychange", function() {
  if(is_user_active){
    is_user_active = false;
    debugger;
    if(window.removeUser)
     window.removeUser();
  } else{
    user_ref.once('value').then(onValueChangeUser);
  }
 });


var user_ref = (function init(){
  var reference = window.firebase.database().ref('user');
  return reference;
})();

var doc_ref = (function init(){
  var reference = window.firebase.database().ref('document');
  return reference;
})();


user_ref.once('value').then(onValueChangeUser);

doc_ref.once('value').then(onValueChangeDoc)




