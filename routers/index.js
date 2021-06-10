const { Router }    = require('express');
const controller    = require('../controllers');
const route         = Router();
const user          = require('./user');

route.use('/user', user({ route, controller }));

module.exports  = route;