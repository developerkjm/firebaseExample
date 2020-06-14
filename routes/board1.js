

var express = require('express');
var router = express.Router();
var firebase = require("firebase");
var dateFormat = require('dateformat');
 
router.get('/',function(req, res, next) {
    res.redirect('boardList');
});
 

/*
    1.내 firebase config 값!만! 가져오자!!!
*/
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



    
/* CRUD 구현 */       
/* 글 리스트 출력*/
router.get('/boardList',function(req, res, next) {
    //Realtime Database에 접근하기 위해 firebase.database()를 사용.
    //orderByKey(): 이 메서드를 사용하면 키를 기준으로 노드를 정렬할 수 있다. board를 어떤 키를 기준으로 정렬할 것이다.
                //이 메서드는 내림차순은 사용되지 않는다. 즉, 최신글이 가장 앞에 나오는 것을 구현할 수 없다.
                //Realtime DB의 최대단점.
                //<-> orderByValue() : 메소드를 사용하여 하위 키 값을 기준으로 노드를 정렬할 수 있습니다
    //once() : board의 데이터를 모두 가져오도록(once) 했다. 가지고 온 데이터는 키오ㅘ 데이터로 구성된 변수 snapsbot으로 반환되는데, snapshot을 그대로 html(ejs)로 보낼수 없어 rows로 변환해서 사용한다.    
    firebase.database().ref('board').orderByKey().once('value',function(snapshot) {
        var rows = [];
        //별도의 변환 함수가 있는 것이 아니고, snapshot의 개수 만큼 반복해서(forEach)
        snapshot.forEach(function(childSnapshot) {
            //키는 제외하고 데이터만 추출해서(val())
            var childData = childSnapshot.val();
         
            childData.brddate = dateFormat(childData.brddate,"yyyy-mm-dd");
            //rows에 추가한다
            rows.push(childData);
        });
        //변환이 완료되면, views의 board1폴더에 있는 boardList.ejs에 rows를 파라미터로 지정해서 호출한다
        res.render('board1/boardList', {rows: rows});
    });
});

// 글 읽기(boardRead)는 글 리스트에서 하나의 행(글번호)을 선택하면 상세한 내용을 출력하는 페이지
router.get('/boardRead',function(req, res, next) {
    firebase.database().ref('board/'+req.query.brdno).once('value',function(snapshot) {
        var childData = snapshot.val();
         
        childData.brdno = snapshot.key;
        childData.brddate = dateFormat(childData.brddate,"yyyy-mm-dd");
        res.render('board1/boardRead', {row: childData});
    });
});

router.get('/boardForm',function(req,res,next){
    //글번호(brdno) 값이 없으면 신규(new) 글쓰기로 별 다른 처리 없이 진행
    if (!req.query.brdno) {
        //신규일 경우에는 바로윗줄의 "boardForm.ejs" 파일을 호출하고 끝나지만
        res.render('board1/boardForm', {row:""});
        return;
    }
    //메서드의 큰 뜻 : 값이 있으면 글 수정을 위해 글번호에 해당하는 데이터를 가지고 와서 화면에 출력한다
        //만일 수정일 경우에는 firebase.database()에서 파라미터로 지정된 글번호(req.query.brdno)를 지정해서 하나의 값만 가지고 온다. 
        //데이터를 가지고 오는 것이 글 리스트(라인 40 - firebase.database().ref('board').orderByKey().once('value',function(snapshot) {)의 사용법과 동일하지만 Board 뒤에 키 값을 넣어서 하나의 데이터만 가지고 오도록 하는 차이가 있다.
    firebase.database().ref('board/'+req.query.brdno).once('value',function(snapshot) {
        var childData = snapshot.val();
         
        childData.brdno = snapshot.key;
        res.render('board1/boardForm', {row: childData});
    });
});
 
router.post('/boardSave',function(req,res,next){
    var postData = req.body;
    if (!postData.brdno) {
        postData.brdno = firebase.database().ref().child('posts').push().key;
        postData.brddate = Date.now();
    }else {
        postData.brddate = Number(postData.brddate);
    }
    firebase.database().ref('board/' + req.body.brdno).set(req.body);
    //var updates = {};
    //updates['/board/' + postData.brdno] = postData;
    //firebase.database().ref().update(updates);
     
    res.redirect('boardList');
});
 
router.get('/boardDelete',function(req,res,next){
    // 마지막으로 글삭제(boardDelete)는 주어진 글번호(brdno) 값을 remove()함수로 삭제한다
    firebase.database().ref('board/' + req.query.brdno).remove();
    // 글 삭제는 별도의 화면이 없고, 삭제 후 글 리스트로 이동한다
    res.redirect('boardList');
});


module.exports = router;