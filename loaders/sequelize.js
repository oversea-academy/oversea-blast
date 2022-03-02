const { Sequelize } = require('sequelize');
const model = require('../models');

module.exports = () => {
  return new Promise(async (resolve) => {
    const db = new Sequelize({
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      dialect: 'postgres',
      logging: process.env.DB_LOG ? console.log : false,
      timezone: 'Asia/Jakarta'
    });

    const user = model.user(db);

    db.authenticate()
      .then(() => {
        console.log('Database connection has been established successfully.');
        global.sequelize = db;
        resolve({
          user
        });
      })
      .catch((error) => {
        console.error('Unable to connect to the database:', error);
      });
  });
};
