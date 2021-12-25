const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];

const User = require('./user');
const Score = require('./score');
const Inquire = require('./inquire');
const db ={};
const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;
db.Sequelize = sequelize;

db.User = User;
db.Score = Score;
db.Inquire = Inquire;

User.init(sequelize);
Score.init(sequelize);
Inquire.init(sequelize);

// User.associate(db);
// Score.associations(db);
// Inquire.associations(db);

module.exports = db;