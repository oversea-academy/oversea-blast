const dotenv = require('dotenv');

module.exports = () => {
    return new Promise((resolve) => {
    	process.env.NODE_ENV = process.env.NODE_ENV || 'development';
	    const config = dotenv.config({ path: './config/.env' });
	    if (config.error) {
	        throw new Error('Could not find .env file');
	    }
	    console.log('Environment successfully loaded');
	    resolve();
    });
};