const sequelizeModule = require('./sequelize');

module.exports = async () => {
  global.db = await sequelizeModule();
};
