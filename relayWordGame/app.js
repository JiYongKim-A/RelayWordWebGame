const path = require('path'); // 경로 설정 모듈 
const express = require('express'); // 서버 구성 모듈

const http = require('http');
const dotenv = require('dotenv'); // env 파일 사용을 위한 모듈
const nunjucks = require('nunjucks'); // view engine 모듈
const socketModule = require('socket.io'); //socket.io 모듈
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const session = require('express-session');
const {sequelize, Score, User} = require('./models');

// server,socket_server
const app = express();
const server = http.createServer(app);
const io = socketModule(server);

//route
const randomWords = require('./public/words');
const logRoute = require('./routes/logRoute');
const gameRoute = require('./routes/gameRoute');
const myPageRoute = require('./routes/myPageRoute');
const rankRoute =require('./routes/rankRoute');
const clientCenter = require('./routes/clientCenter');

//백과 사전 api 관련
// 자신의 api id와 secret을 작성해 주세요.
const client_id = 'API id';
const client_secret = 'API password';

const request = require('request');

// 게임 생성시 저장 배열
const rooms = [];

dotenv.config();
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'html');
nunjucks.configure('views', {
    autoescape: true,
    express: app,
    watch: true
});

sequelize.sync({ force : false })
.then(()=>{
    console.log("db연결 성공");
}).catch((err)=>{
    console.log(err);
})

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    httpOnly: true,
    secure: false,
    secret: process.env.SECRET,
    resave : false ,
    saveUninitialized : false,
    cookie:{
        httpOnly: false,
        secure: false
    }
}));

// route folder mapping 
app.use('/log', logRoute);
app.use('/game', gameRoute);
app.use('/myPage',myPageRoute);
app.use('/rank',rankRoute);
app.use('/qna',clientCenter);

app.get('/',(req,res,next)=>{
    if(req.session.nickName){
        res.render('main',{
            nickName : req.session.nickName
        });
    }else{
        res.render('main',{
            nickName : null
        });
    }
})

function words(){ // 랜덤 단어 보내주는 함수
    let randomSet = randomWords.words;
    let word =randomSet.split(",")[Math.floor(Math.random()*100)];
    console.log(word);
    return word;
}
// socket 관련
io.on('connection', socket => {




    socket.on('join-room', (roomId, nickName) => {
        // log
        console.log("join-room \n roomId = ", roomId);
        console.log("nickName = ", nickName);

        // roomId의 room에 참가
        socket.join(roomId);

        // roomId와 동일한 room의 존재 확인 
        function isExist(element) {
            if (element.roomId == roomId) {
                return true;
            }
        }
        const findRoom = rooms.find(isExist);

        // 존재할 경우
        if (findRoom != undefined) {
            // room의 members 프로퍼티에 nickname 추가
            findRoom.members.push(nickName);

            socket.broadcast.to(roomId).emit('user-connected', findRoom.members);

        } else {
            // roomId의 room에 첫 접속시
            var room = {
                roomId: roomId,
                members: [nickName]
            }
            rooms.push(room);
        }
        // rooms 
        console.log(rooms);
    })


    socket.on("giveInfo", roomId => {
        function isExist(element) {
            if (element.roomId == roomId) {
                return true;
            }
        }
        const findRoom = rooms.find(isExist);
        // io.to(roomId).emit("receieveInfo",findRoom.members);
        // io.to(roomId).emit("receieveInfo",findRoom.members);
        socket.emit("receieveInfo", findRoom.members);
    })

    //채팅을 위한 소켓
    socket.on('chat', (roomId, sendData) => {
        io.to(roomId).emit('chat', sendData);
    })

    socket.on('gameStart',(roomId) =>{

        io.to(roomId).emit('gameStart',words());
    })

    
    socket.on('word',(roomId,sendData)=>{
        // 첫 단어 검증
        let word = sendData.word;
        if(sendData.word.split('')[0] != sendData.before.split('')[sendData.before.length-1]){
            io.to(roomId).emit('fail');
        }else{
        
        var api_url = 'https://openapi.naver.com/v1/search/encyc.json?query=' + encodeURI(word); // json 결과
        var options = {
            url: api_url,
            headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
    };


        request(options,(err,res,body)=>{
            let result = JSON.parse(body);
            console.log(body);
            var items = result.items;
            var check = false;
        
            for(var i = 0; i<items.length; i++){
                if(items[i].title == "<b>"+word+"</b>"){
                    console.log("있음");
                    check = true;
                    break;
                }
                else if(items[i].title == word){
                    check = true;
                    break;
                }
                else{
                }
            }
            if(check == true){
                io.to(roomId).emit('success',word);
            }else if(check == false){
                io.to(roomId).emit('fail');
            }else{};
        })}
    })

    socket.on('finishMem',(finishNickName, rank)=>{
        // 여기서 각각 점수 넣어주기
        console.log(`${finishNickName}님 탈락!!  등수=`,rank);    
        if(rank ==1 ){
            Score.increment({score : +150},
                {where: {userName : `${finishNickName}`}});
        }else if (rank == 2){
            Score.increment({score : +60},
                {where: {userName : `${finishNickName}`}});
        }else{
            Score.decrement({score : 30},
                {where: {userName : `${finishNickName}`}});
        }
        Score.findOne({ where: { userName: `${finishNickName}` } }).then(mem =>{
            console.log("socre is ==",mem.score);
            if(mem.score < 0){
                // 노예 전락
                Score.update({rank : '백정'}, {where : { userName : `${finishNickName}`}});
            }else if (mem.score >500 && mem.score <1000){
                Score.update({rank : '양반'}, {where : { userName : `${finishNickName}`}});
            }else if (mem.score >= 1000 && mem.score <1500){
                Score.update({rank : '탐관오리'}, {where : { userName : `${finishNickName}`}});
            }else if (mem.score >= 1500) {
                Score.update({rank : '세종대왕'},{where : { userName : `${finishNickName}`}});
            }else{
            }
        });
    })
})


server.listen(process.env.PORT, () => console.log(`Port Server is open!!`))

module.exports = app;
module.exports = io;
