const path = require('path');
const express = require('express');
const router = express.Router();

//session
const session = require('express-session');
const app = express();
const cookieParser = require('cookie-parser');
const { User, Score } = require('../models');


router.route('/login')
.get(async (req, res, next)=>{
    try{
        res.render('login');
    } catch(err){
        console.log(err);
        next(err);
    }
})
.post(async (req, res, next)=>{
    try{
        // need logic
        let id = req.body.id;
        let pw = req.body.pw;
        User.findOne({where:{identify:`${id}`}})
        .then(user =>{
            if(user == null){
                res.redirect('/log/login');
            }else{
                

                if(pw != user.get('password')){
                    res.redirect('/log/login');
                }else{
                    //login success
                    
                    // 여기에 세션값 생성
                    req.session.nickName= user.get("nickName");
                    res.redirect('/');
                }
            }
       })
    } catch(err){
        console.log(err);
        next(err);
    }
});

router.route('/logout')
.get(async (req, res, next)=>{
    req.session.destroy(err=>{
        if(err){
            console.log(err);}
        res.redirect('/');
    });
});

router.route('/signUp')
.get(async (req, res, next)=>{
    try{
        res.render('signUp');
    } catch(err){
        console.log(err);
        next(err);
    }
})
.post(async (req, res, next)=>{
    try{
        let signId = req.body.id;
        let signPw = req.body.pw;
        let signNickName = req.body.nickName;
        if(signId==null||signId==""){
            res.redirect('/log/signUp');
        }else{
            if(signNickName==null||signNickName==""){
                res.redirect('/log/signUp');
            }else{
                User.findOne({where:{identify:`${signId}`}})
                .then(user =>{
                    if(user != null){
                        res.redirect('/log/signUp');
                    }else{
                        User.findOne({where:{nickName:`${signNickName}`}})
                            .then(user =>{
                                if(user != null){
                                    res.redirect('/log/signUp');
                                }
                            })
                            //All success logic
                            User.create({
                                identify: `${signId}`,
                                password: `${signPw}`,
                                nickName:`${signNickName}`
                            });
                            Score.create({
                                userName: `${signNickName}`,
                            })
                            res.redirect("/log/login");
                    }
                });
            } 
        }
    } catch(err){
        console.log(err);
        next(err);
    }
});


module.exports = router;
