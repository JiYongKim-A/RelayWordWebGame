const path = require('path');
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const session = require('express-session');
const { Inquire } = require('../models');


router.route('/')
.get(async(req, res, next)=>{
    try{
        if(!req.session.nickName){
            res.redirect('/log/login');
        }else{
            var arr =[];
        Inquire.findAll({where:{userName : `${req.session.nickName}`} }).then(q =>{
            q.forEach(d =>{
                var data ={
                    id : d.id,
                    nickName : d.userName,
                    title : d.title
                }
                arr.push(data);
            });
            res.render('qnaList',{
                list : arr
            });
        });

        }
        
    }catch(err){
        console.log(err);
        next(err);
    }
});

router.route('/inquire')
.get(async(req,res,next)=>{
    try{
        if(!req.session.nickName){
            res.redirect('/log/login');
        }else{
            res.render('inquire',{
                nickName : req.session.nickName
            })

        }
    }catch(err){
        console.log(err);
    }

})

.post(async(req,res,next)=>{
    try{
        let title = req.body.title;
        let content = req.body.content;
        if(title == ""){
            title = '내용 없음';
        }
        if(content == ""){
            content = '내용 없음';
        }

        Inquire.create({
            userName : `${req.session.nickName}`,
            title : `${title}`,
            content : `${content}`
        }).then(
            res.redirect('/qna')
        );
        // res.redirect('/qna');
    }catch(err){
        console.log(err);
    }

})

router.route('/answer/:number')
.get(async(req,res,next)=>{
    try{
        if(!req.session.nickName){
            res.redirect('/log/login');
        }else{
            // 내 세션값과 닉네임이 다르면 리다이렉트
        let num = req.params.number;
        Inquire.findOne({where:{id :`${num}`}}).then(q=>{
            res.render('qnaAnswer',{
                nickName : q.userName,
                title : q.title,
                content : q.content,
                anser : q.answer
            });
        });
        }
        

    } catch(err){
        console.log(err);
    }
})

module.exports =router;


