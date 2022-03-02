const bcrypt    = require('bcrypt');
const { auth }  = require('../middlewares');

const service = {
    register: async (data) => {
        const hashedPassword    = await bcrypt.hashSync(data.password, 5); 
		const isExist           = await service.isEmailExist(data.email);

		return new Promise( resolve => {
			if (isExist) {
				resolve({
					status : false,
					msg : 'email was occupied'
				});
			} else {
				db.user.create({
					...data,
					password: hashedPassword,
					createby: data.username
				}).then((result) => {
					resolve({
						status: true,
						data: result
					});
				}).catch((error) => {
					resolve({
						status : false,
						msg : error
					});
				});
			}
		});
    },
    isEmailExist: (email) => {
		return new Promise(resolve => {
			db.user.findOne({
				where: {
					email: email
				}
			}).then(result => {
				if (result) {
					resolve(true);
				}
				resolve(false);
			});
		});
	},
    login: (data) => {
		return new Promise( async resolve => {
			const user = await db.user.findOne({
				attributes: ['user_uid', 'email', 'password'],
				where : {
					email: data.email
				},
				raw: true
			}).catch((error) => {
				resolve({
					status : false,
					msg : error
				});
			});
			if (user) {
				const checkPassword = await bcrypt.compareSync(data.password, user.password);
				if (checkPassword) {
					const token = await auth.signToken({
						email: user.email,
						user_uid: user.user_uid
					}).catch(error => {
						resolve({
							status : false,
							msg : error
						});
					});
					resolve({
						status: true,
						data: {
							token
						}
					});
				} else {
					resolve({
						status : false,
						msg : 'password is not match'
					});
				}
			} else {
				resolve({
					status : false,
					msg : 'email is not exist'
				});
			}
		});
	},
}

module.exports = {
    login: async (req, res) => {
        if (req.body.email && req.body.password) {
            const result = await service.login({
                ...req.body
            });

            res.json(result);
        } else {
            res.json({
                status: false,
                msg: 'Incomplete data'
            });
        }
    },
    register: async (req, res) => {
    	if (req.body.email && req.body.password && req.body.fullname) {
            const result = await service.register({
                ...req.body
            });
    
            res.json(result);
        } else {
            res.json({
                status: false,
                msg: 'Incomplete data'
            });
        }
    }
}
