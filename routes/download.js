const http = require('http');
const https = require('https');

const { makeid } = require('./lib/makeid');

const handleDownload = (req, res, db) => {

	password = req.body.user.password;
	let link = '';
	if (password === process.env.PASS) {
		url = req.body.user.url;

		db.collection('flai').find({ url }).project({ url: 1 }).toArray()
		.then(data => {
			if(data[0]) {
				link = data[0].link;
			}
			else {
				now = Date().toString();
				link = makeid(10);
				db.collection('flai').insertOne({link, url, date: now}, (error, result) => {
					if (result) {
						console.log(link)
					}
				})
			}
		})
		.then(() => {
			return res.redirect('/links/' + link);
		})
	}
	else
		return res.redirect('https://jvoltci.github.io/flai/#/error');
}

module.exports = {
	handleDownload: handleDownload
}