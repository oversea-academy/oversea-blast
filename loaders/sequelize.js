const { Sequelize } = require('sequelize');
const model 		= require('../models');

module.exports = () => {
	return new Promise(async (resolve) => {
		const db = new Sequelize(process.env.DATABASE_URL, {
			logging : process.env.DATABASE_LOGGING ? console.log : false,
			native  : true, 
			ssl     : true
		});
		
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