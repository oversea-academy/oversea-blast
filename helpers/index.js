module.exports = {
	replaceMessage: (message, item, mode) => {
		return new Promise(resolve => {
			if (mode == 'default') {
				const replaceName = module.exports.replaceName(message, item);
				resolve(replaceName);
			} else if (mode == 'toefl') {
				const replaceName 		= module.exports.replaceName(message, item);
				const replaceStructure 	= module.exports.replaceTOEFL(replaceName, item, 'structure');
				const replaceReading 	= module.exports.replaceTOEFL(replaceStructure, item, 'reading');
				const replaceListening 	= module.exports.replaceTOEFL(replaceReading, item, 'listening');
				const replaceTotal 		= module.exports.replaceTOEFL(replaceListening, item, 'total');
				resolve(replaceTotal);
			} else {
				resolve(message);	
			}
		});
	},
	replaceName: (message, item) => {
		if (item['Nama Panggilan']) {
			return message.replace('#name', item['Nama Panggilan']);
		} else if (item['Nama']) {
			return message.replace('#name', item['Nama']);
		} else {
			return message.replace('#name', '');
		}
	},
	replaceTOEFL: (message, item, key) => {
		if (key == 'structure') {
			return message.replace('#structure', item['Structure']);
		} else if (key == 'reading') {
			return message.replace('#reading', item['Reading']);
		} if (key == 'listening') {
			return message.replace('#listening', item['Listening']);
		} if (key == 'total') {
			return message.replace('#total', item['Total']);
		} else {
			return message;
		}
	}
}