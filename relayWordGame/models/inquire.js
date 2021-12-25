const Sequelize = require('sequelize');

module.exports = class Inquire extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            userName: {
                type: Sequelize.STRING(100),
                allowNull: false,
                unique: false,
            },  
            title: {
                type: Sequelize.TEXT,
                allowNull: false,
                defaultValue: '내용없음',
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: false,
                defaultValue:'내용없음',
            },
            answer:{
                type: Sequelize.TEXT,
                allowNull: true,
            }
        },{
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'Inquire',
            tableName: 'inquire',
            paranoid: false,
            charset : 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    static associate(db){
        Inquire.belongTo(db.Score,{foreignKey:'userName', targetKey:'userName'});
    }
};


