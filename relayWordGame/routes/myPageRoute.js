const path = require('path');

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const session = require('express-session');
const { User, Score } = require('../models');

router.route('/')
    .get(async (req, res, next)=>{
        try{
            if(req.session.nickName){
                
            Score.findOne({where:{userName:`${req.session.nickName}`}})
            .then(user =>{
                res.render('myPage',{
                    nickName : user.userName,
                    score : user.score,
                    rank : user.rank
                });
            })}else{
                res.redirect('/');
            }
        } catch(err){
            console.log(err);
            next(err);
        }
    });

module.exports =router;


