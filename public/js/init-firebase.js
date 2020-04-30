const firebaseConfig = {
  apiKey: "AIzaSyA5fzM9gCPJkE8EJOeSODkh8kMyhDkEzdE",
  authDomain: "tchat-nodejs.firebaseapp.com",
  databaseURL: "https://tchat-nodejs.firebaseio.com",
  projectId: "tchat-nodejs",
  storageBucket: "tchat-nodejs.appspot.com",
  messagingSenderId: "243527312298",
  appId: "1:243527312298:web:fa2526e957b0bb1af041d3",
  measurementId: "G-ED3RZK5WY7"
}

firebase.initializeApp(firebaseConfig)
firebase.analytics()
