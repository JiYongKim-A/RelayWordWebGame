const path = require('path');

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const session = require('express-session');
const { Score } = require('../models');

// 모든 scores table Data를  score 크기에 정렬된 값으로 받아 view로 배열
router.route('/')
    .get(async (req, res, next)=>{
        try{
                var arr =[];
                Score.findAll({ order: [['score', 'DESC']]}).then(user=>{
                    user.forEach(mem => {
                        var data = {
                            nickName : mem.userName,
                            score : mem.score,
                            rank : mem.rank
                        }
                        arr.push(data);
                    });
                    res.render('rank',{
                        members : arr
                    });
                });
        } catch(err){
            console.log(err);
            next(err);
        }
});

router.route('/search')
.post(async(req,res,next)=>{
    try{
        Score.findOne({where:{userName:`${req.body.nickName}`}})
        .then(user =>{
            if(!user){
                res.redirect('/rank');
            }else{
                res.render('searchRank',{
                    nickName : user.userName,
                    score : user.score,
                    rank : user.rank
                });
            }
        })
    } catch(err){
        console.log(err);
        next(err);
    }
});

module.exports =router;


