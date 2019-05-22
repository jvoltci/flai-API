const http = require('http');
const https = require('https');

const { makeid } = require('./lib/makeid');

const handleDownload = (req, res, db) => {

	password = req.body.user.password;

	if (password === process.env.PASS) {
		extension = req.body.user.extension;
		url = req.body.user.url;

		db('flai').where('url', '=', url)
		.then(data => {
			if(data[0]) {
				link = data[0].link;
			}
			else {
				link = makeid(10);
				db('flai').insert({link: link, url: url, extension: extension}).returning('*')
					.then(data => console.log(link));
			}
		})
		.then(() => {
			if(extension === ".mp4") {
				contentType = 'video/mp4';
				file = "Ergo";
			}
			else if(extension === ".mp3") {
				contentType = 'audio/mp3';
				file = "Sonorous";
			}
			else if(extension === ".mkv") {
				contentType = 'video/webm';
				file = "Limerence";
			}
			else {
				contentType = 'application/zip';
				file = "Paradox";
			}
			return res.redirect('/links/' + link);
		}
		)
	}
	else
		return res.redirect('https://flai.ml/#/error');
}

module.exports = {
	handleDownload: handleDownload
}