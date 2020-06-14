var express = require('express');
var router = express.Router();
var firebase = require("firebase");
var dateFormat = require('dateformat');

router.get('/', function(req, res, next) {
    res.redirect('boardList');
});

var config = {
    apiKey: "AIzaSyCdhOW5dyO-xyDlNDMS1Sdt0nLwmKMc2_8",
    authDomain: "setest-b5882.firebaseapp.com",
    databaseURL: "https://setest-b5882.firebaseio.com",
    projectId: "setest-b5882",
    storageBucket: "setest-b5882.appspot.com",
    messagingSenderId: "619014912969",
    appId: "1:619014912969:web:4b489cf1989f464c8d0618",
    measurementId: "G-RVTHWGL35P"
};
firebase.initializeApp(config);

var db = firebase.firestore();

router.get('/loginForm', function(req, res, next) {
    res.render('board3/loginForm');
});

router.post('/loginChk', function(req, res, next) {
    firebase.auth().signInWithEmailAndPassword(req.body.id, req.body.passwd)
       .then(function(firebaseUser) {
           res.redirect('boardList');
       })
      .catch(function(error) {
          res.redirect('loginForm');
      });    
});

router.get('/boardList', function(req, res, next) {
    if (!firebase.auth().currentUser) {
        res.redirect('loginForm');
        return;
    }
    
    db.collection('board').orderBy("brddate", "desc").get()
          .then((snapshot) => {
              var rows = [];
              snapshot.forEach((doc) => {
                  var childData = doc.data();
                  childData.brddate = dateFormat(childData.brddate, "yyyy-mm-dd");
                  rows.push(childData);
              });
              res.render('board3/boardList', {rows: rows});
          })
          .catch((err) => {
              console.log('Error getting documents', err);
          });
});


router.get('/boardRead', function(req, res, next) {
    if (!firebase.auth().currentUser) {
        res.redirect('loginForm');
        return;
    }
    
    db.collection('board').doc(req.query.brdno).get()
        .then((doc) => {
            var childData = doc.data();
            
            childData.brddate = dateFormat(childData.brddate, "yyyy-mm-dd hh:mm");
            res.render('board3/boardRead', {row: childData});
        })
});

router.get('/boardForm', function(req,res,next){
    if (!firebase.auth().currentUser) {
        res.redirect('loginForm');
        return;
    }
    
    if (!req.query.brdno) { // new
        res.render('board3/boardForm', {row: ""});
        return;
    }
    
    // update
    db.collection('board').doc(req.query.brdno).get()
          .then((doc) => {
              var childData = doc.data();
              res.render('board3/boardForm', {row: childData});
          })
});

router.post('/boardSave', function(req,res,next){
    var user = firebase.auth().currentUser;
    if (!user) {
        res.redirect('loginForm');
        return;
    }
    
    var postData = req.body;
    if (!postData.brdno) {  // new
        postData.brddate = Date.now();
        var doc = db.collection("board").doc();
        postData.brdno = doc.id;
        postData.brdwriter = user.email;
        doc.set(postData);
    } else {                // update
        var doc = db.collection("board").doc(postData.brdno);
        doc.update(postData);
    }
    
    res.redirect('boardList');
});

router.get('/boardDelete', function(req,res,next){
    if (!firebase.auth().currentUser) {
        res.redirect('loginForm');
        return;
    }
    
    db.collection('board').doc(req.query.brdno).delete()

    res.redirect('boardList');
});

module.exports = router;
