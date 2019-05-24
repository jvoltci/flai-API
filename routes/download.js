const http = require('http');
const https = require('https');

const { makeid } = require('./lib/makeid');

const handleDownload = (req, res, db) => {

	password = req.body.user.password;
	let link = '';
	if (password === process.env.PASS) {
		url = req.body.user.url;

		db('flai').where('url', '=', url)
		.then(data => {
			if(data[0]) {
				link = data[0].link;
			}
			else {
				link = makeid(10);
				db('flai').insert({link: link, url: url}).returning('*')
					.then(data => console.log(link));
			}
		})
		.then(() => res.redirect('/links/' + link))
		.catch(err => console.log(err))
	}
	else
		return res.redirect('https://flai.ml/#/error');
}

module.exports = {
	handleDownload: handleDownload
}