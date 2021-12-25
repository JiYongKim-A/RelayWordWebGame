const Sequelize = require('sequelize');

module.exports = class Score extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            userName: {
                type: Sequelize.STRING(100),
                allowNull: false,
                unique: true,
            },  
            score: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            rank: {
                type: Sequelize.STRING(20),
                allowNull: false,
                defaultValue:"평민",
            },
        },{
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'Score',
            tableName: 'scores',
            paranoid: false,
            charset : 'utf8',
            collate: 'utf8_general_ci',
        });
    }
    static associate(db){
        Score.hasMany(db.Inquire,{foreignKey:'userName',sourceKey:'userName'});
        
    }
};
