const { Sequelize } = require('sequelize');
const model 		= require('../models');

module.exports = () => {
	return new Promise(async (resolve) => {
		const db = new Sequelize(
			process.env.DB_NAME, 
			process.env.DB_USERNAME, 
			process.env.DB_PASSWORD, 
			{
				host: process.env.DB_HOST,
				dialect: 'postgres',
				port: parseInt(process.env["DB_PORT"], 10) || 5432,
				native: true, 
				ssl: true
			}
		);
		const user 	= model.user(db);

		db.authenticate()
			.then(() => {
				console.log('Database connection has been established successfully.');
				global.sequelize = db;
				resolve({
					user
				});
			}).catch((error) => {
				console.error('Unable to connect to the database:', error);
			});
	});
}