const path = require('path');

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const {v4:uuidV4} = require('uuid');
const cookieParser = require('cookie-parser');
const app = express();
const session = require('express-session');
const roomArr=[]; // 모든 방 정보


router.route('/gameList')
    .get(async (req, res, next)=>{
        try{
            if(req.session.nickName == undefined){
                res.redirect('/log/login');
            }else{
                res.render('gameList.html',{
                    roomArr : roomArr
                });
            }
        } catch(err){
            console.log(err);
            next(err);
        }
    });


router.route('/mkGame')
.get(async (req, res, next)=>{
    try{
        if(req.session.nickName == undefined){
            res.redirect('/log/login');
        }else{
            res.render('mkGame');
        }
        
    } catch(err){
        console.lor(err);
        next(err);
    }
});

router.route('/mkGame')
.post(async(req,res,next)=>{
    try{
        let uuid = uuidV4();
        let nickName = req.session.nickName;
        let room ={
            nickName : nickName,
            title : req.body.title,
            uuid : uuid
        }
        roomArr.push(room);
        console.log(roomArr);
        res.redirect(`/game/startGame?roomId=${room.uuid}`);
    } catch(err){
        console.log(err);
        next(err);
    }
});

router.route('/startGame')
.get(async(req, res, next)=>{
    try{
        res.render('startGame',{
            nickName: req.session.nickName
        });
    }catch(err){
        console.log(err);
        next(err);
    }
})

module.exports =router;


