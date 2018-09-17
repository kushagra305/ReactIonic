  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyDvfqy7KUEYdi4ydzm0nkR8qQnEW4_rLWQ",
    authDomain: "cloudmessaging-e99f0.firebaseapp.com",
    databaseURL: "https://cloudmessaging-e99f0.firebaseio.com",
    projectId: "cloudmessaging-e99f0",
    storageBucket: "cloudmessaging-e99f0.appspot.com",
    messagingSenderId: "784212207329"
  };
	firebase.initializeApp(config);
	
	const messaging = firebase.messaging();

	messaging.usePublicVapidKey('BBFLvcR7_yr58n05gXTc8DRgiCw2ZIjx_THjudWUqe2b0-Ad2yJPNB7YolE0OShUw-TZddU_KYjzAf9uHRj6c5Q');

	messaging.requestPermission().then(function(){
		console.log('Notification permission granted.');
	}).catch(function(err){
		console.log('Unable to get permission to notify.', err);
    })
    

navigator.serviceWorker.register('/ReactIonic/firebase-messaging-sw.js')
    .then((register)=>{
        messaging.useServiceWorker(register);
    })    

	// Get Instance ID token. Initially this makes a network call, once retrieved
// subsequent calls to getToken will return from cache.
messaging.getToken().then(function(currentToken) {
  if (currentToken) {
		console.log(currentToken);
   // sendTokenToServer(currentToken);
    //updateUIForPushEnabled(currentToken);
  } else {
    // Show permission request.
    //console.log('No Instance ID token available. Request permission to generate one.');
    // Show permission UI.
    //updateUIForPushPermissionRequired();
    //setTokenSentToServer(false);
  }
}).catch(function(err) {
  console.log('An error occurred while retrieving token. ', err);
  //showToken('Error retrieving Instance ID token. ', err);
  //setTokenSentToServer(false);
});

// Callback fired if Instance ID token is updated.
messaging.onTokenRefresh(function() {
  messaging.getToken().then(function(refreshedToken) {
    console.log('Token refreshed.');
    // Indicate that the new Instance ID token has not yet been sent to the
    // app server.
    //setTokenSentToServer(false);
    // Send Instance ID token to app server.
    //sendTokenToServer(refreshedToken);
    // ...
  }).catch(function(err) {
    console.log('Unable to retrieve refreshed token ', err);
   // showToken('Unable to retrieve refreshed token ', err);
  });
});