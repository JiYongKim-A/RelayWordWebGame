"use strict"
var socketIo = io();
const param = location.search;
const query = new URLSearchParams(param);
const roomId = query.get('roomId');


// nunjuck를 통해 html 렌더시에 자신의 nickName값
const myNickName = document.getElementById('myNickName').innerText;
const mainBox = document.getElementById('suggestion');
const memberGrid = document.getElementById('memberGrid');

const member1 = document.getElementById('member1');
const member2 = document.getElementById('member2');
const member3 = document.getElementById('member3');

const eachChatBox = document.getElementById('chatBox'); //채팅 보여지는 박스
const chatSendBox = document.querySelector('.sendBox-inputBox'); // 자신이 작성하는 채팅박스
const chatSendButton = document.querySelector('.sendBox-sendButton');
const startButtonDiv = document.querySelector('.startButtonDiv');
const getOutDiv = document.getElementById('getOut');

// 현재 html에서의 렌더가 완료된 인원의 닉네임 배열
// 게임 순서에도 필요한 배열 
const renderedMem = [];
let mytrun = false;
let testIndex = 0;


// 접속시 자신의 roomUUID 값과 자신의 nickName 전송하여 roomId 의 room으로 접속
socketIo.emit("join-room", roomId,myNickName);
mainBox.value="인원 참여중입니다 잠시만 기다려주세요";

// roomId 값을 서버로 보내 현재방의 인원 알려달라고 보냄
socketIo.emit("giveInfo", roomId);


// 현재 방에 있는 인원 배열을 받음 => members로 첫 인원 세팅
socketIo.on("receieveInfo", members=>{
    // connect(접속)시 바로 알 수 있는 현재 방 인원들
    console.log("recieveInfo" ,members); 

    members.forEach(mem => {

            if(member1.innerText==''){
                member1.innerHTML=`${mem}<img src="/img/cat.png" style="width: 100px; height: 100px;">`;
                renderedMem.push(mem);

                let inputTag = document.createElement('input')
                inputTag.id=mem;
                inputTag.style.color='black';
                inputTag.readOnly= true;
                eachChatBox.appendChild(inputTag);

            }else{

                if(member2.innerText==''){
                    member2.innerHTML=`${mem}<img src="/img/cat.png" style="width: 100px; height: 100px;">`;
                    renderedMem.push(mem);

                    let inputTag = document.createElement('input')
                    inputTag.id=mem;
                    inputTag.style.color='black';
                    inputTag.readOnly= true;
                    eachChatBox.appendChild(inputTag);

                }else{
                    member3.innerHTML=`${mem}<img src="/img/cat.png" style="width: 100px; height: 100px;">`;
                    renderedMem.push(mem);
                    let inputTag = document.createElement('input')
                    inputTag.id=mem;
                    inputTag.style.color='black'
                    inputTag.readOnly= true;
                    eachChatBox.appendChild(inputTag);
                }
            }
    });
})

// 동일한 방에 인원 입장시 마다 오는 이벤트로 이후 인원 세팅
socketIo.on("user-connected", newMembers=>{
    console.log("user connect",newMembers);
    console.log("renderedMem =", renderedMem);

    newMembers.forEach(mem =>{
        if(!(renderedMem.includes(mem))){
            if(member2.innerText==''){
                member2.innerHTML=`${mem}<img src="/img/cat.png" style="width: 100px; height: 100px;">`;
                renderedMem.push(mem);
                let inputTag = document.createElement('input')
                inputTag.id=mem;
                inputTag.style.color='black';
                inputTag.readOnly= true;
                eachChatBox.appendChild(inputTag);
            }else{
                member3.innerHTML=`${mem}<img src="/img/cat.png" style="width: 100px; height: 100px;">`;
                renderedMem.push(mem);
                let inputTag = document.createElement('input')
                inputTag.id=mem;
                inputTag.style.color='black';
                inputTag.readOnly= true;
                eachChatBox.appendChild(inputTag);
            }
        }
    })

    // 모든 인원 참여 완료
    if(renderedMem.length==3 && renderedMem[0] == myNickName){
        let gameStart = document.createElement('button');
        gameStart.style.width='200px';
        gameStart.style.height='50px';
        gameStart.style.color='black';
        gameStart.type='button';
        gameStart.classList='startButton';
        gameStart.innerHTML='게임 시작'
        startButtonDiv.appendChild(gameStart);

        gameStart.addEventListener("click",()=>{
            gameStart.remove();
            socketIo.emit("gameStart",roomId);
        })
    }
})

// 채팅 보낼때 로직
function sendChat(){
    const sendData={
        nickName: myNickName, // 자신의 nickName
        message: chatSendBox.value, //message에는 메세지 입력란의 값
    }
    socketIo.emit("chat",roomId,sendData);
}
function sendWord(){
    const sendData = {
        before : mainBox.value,
        word : chatSendBox.value
    }
    var turning = document.getElementById('turn');
    turning.remove();
    socketIo.emit("word",roomId,sendData);
    mytrun=false;
}

//Enter입력시 senfunc 함수 실행
chatSendBox.addEventListener('keypress',(button)=>{  
    if((button.key === 'Enter')&&(chatSendBox.value!=="")){
        if(mytrun){
            sendWord();
            console.log('send 완료',chatSendBox.value);
        }
        sendChat(); // sendChat 함수를 실행시킴
        chatSendBox.value='';
    }
})
// 버튼 클릭시 sendChat를 실행시킴
chatSendButton.addEventListener("click", ()=>{
    if(chatSendBox.value!==""){
        if(mytrun){
            sendWord();
        }
        sendChat(); // sendChat 함수를 실행시킴
        chatSendBox.value='';
    }
}); 

// 채팅 받을때 로직
socketIo.on('chat',sendData=>{
    var chatPerson = document.getElementById(`${sendData.nickName}`);
    chatPerson.value= sendData.message;
})

//게임 시작 버튼 누른 이후
function gameRunning(){
    if(renderedMem.length ==3){ // 3명 모두 살아있을 경우

        if(renderedMem[testIndex%3] == myNickName){ // 자신의차례
            mytrun = true;
            let turnTag = document.createElement('div')
            turnTag.id ='turn';
            turnTag.innerText='<my turn>'
            turnTag.style.textAlign='center';
            if(testIndex%3==0){
                member1.appendChild(turnTag);
            }else if(testIndex%3 == 1){
                member2.appendChild(turnTag);
            }else if(testIndex%3==2){
                member3.appendChild(turnTag);
            };
            
        }else{

            let turnTag = document.createElement('div')
            turnTag.id ='turn';
            turnTag.innerText='<my turn>'
            turnTag.style.textAlign='center';
            if(testIndex%3==0){
                member1.appendChild(turnTag);
            }else if(testIndex%3 == 1){
                member2.appendChild(turnTag);
            }else if(testIndex%3==2){
                member3.appendChild(turnTag);
            };
        }
    
    }else if(renderedMem.length ==2){ // 2명 남았을때
        console.log("2명 남음!")
        if(renderedMem[testIndex%2] == myNickName){ // 자신의차례
            mytrun = true;
            let turnTag = document.createElement('div')
            turnTag.id ='turn';
            turnTag.innerText='<my turn>'
            turnTag.style.textAlign='center';
            if(testIndex%2==0){
                if(member1.innerText == renderedMem[0]){
                    member1.appendChild(turnTag);
                }else if(member2.innerText == renderedMem[0]){
                    member2.appendChild(turnTag);
                }else{
                    member3.appendChild(turnTag);
                }
            }else{
                if(member1.innerText == renderedMem[1]){
                    member1.appendChild(turnTag);
                }else if(member2.innerText == renderedMem[1]){
                    member2.appendChild(turnTag);
                }else{
                    member3.appendChild(turnTag);
                }
            }  
        }else{

            let turnTag = document.createElement('div')
            turnTag.id ='turn';
            turnTag.innerText='<my turn>'
            turnTag.style.textAlign='center';
            if(testIndex%2==0){
                if(member1.innerText == renderedMem[0]){
                    member1.appendChild(turnTag);
                }else if(member2.innerText == renderedMem[0]){
                    member2.appendChild(turnTag);
                }else{
                    member3.appendChild(turnTag);
                }
            }else{
                if(member1.innerText == renderedMem[1]){
                    member1.appendChild(turnTag);
                }else if(member2.innerText == renderedMem[1]){
                    member2.appendChild(turnTag);
                }else{
                    member3.appendChild(turnTag);
                }

            }
        }    
    
    }else if (renderedMem.length ==1){ //우승
        if(renderedMem[0] == myNickName){
            let finishMem = renderedMem[testIndex%renderedMem.length];
            socketIo.emit('finishMem',finishMem,renderedMem.length);
        }
        
        mainBox.value=`우승자 [ ${renderedMem[0]} ]`

        console.log(`${renderedMem[0]} 우승`);
        getOutDiv.innerHTML='<a href="/" class="likeabutton"> 나가기 </a>';
    
    }else{
        testIndex++;
    };
}

async function tagRemove(){
    try{
        let tag = document.getElementById('turn');
        tag.remove();
    }catch(err){
        // throw err;
    }
    
}

// 게임 구성 
socketIo.on('gameStart',(testWord)=>{
    // 게임 로직
    console.log("게임이 시작되었습니다.");
    mainBox.value = testWord;

    if(renderedMem[testIndex%3] == myNickName){
        mytrun = true;
        gameRunning();
    }else{
        gameRunning();
    }
});



socketIo.on('success',(nextWord)=>{
    testIndex++;
    mainBox.value = nextWord;
    console.log("존재하는 단어 입니다.");
    tagRemove().then(gameRunning());
})


socketIo.on('fail',()=>{
    
    // 이부분에서 score 넣어주기
    let finishMem = renderedMem[testIndex%renderedMem.length];

    // 자신이 끝나면 자신이 서버에게 끝났다 알림
    if(finishMem == myNickName)
        socketIo.emit('finishMem',finishMem,renderedMem.length);
    
    let failTag = document.createElement('div');
    failTag.innerText='[탈락]';

    console.log("mem1 inner",member1.innerText);
    console.log("mem2 inner",member2.innerText);
    console.log("mem3 inner",member3.innerText);
    

    if(`${member1.innerText}`.includes(finishMem)){
        member1.appendChild(failTag);
    }
    else if(`${member2.innerText}`.includes(finishMem)){
        member2.appendChild(failTag);
    }else{
        member3.appendChild(failTag);
    }
    
    renderedMem.splice(testIndex%renderedMem.length,1);
    console.log("존재 하지 않는 단어입니다 탈락");
    console.log("배열 길이 =",renderedMem.length);
    console.log(renderedMem);
    testIndex++; 
    tagRemove().then(gameRunning());
})
