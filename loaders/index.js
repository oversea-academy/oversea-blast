const configModule 		= require('./config');
const sequelizeModule 	= require('./sequelize');

module.exports = async () => {
    await configModule();
    global.db = await sequelizeModule();
};