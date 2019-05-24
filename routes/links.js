const http = require('http');
const https = require('https');

const handleLinks = (req, res, db) => {

	let fetchedLink = req.params.id;
	if(fetchedLink.length < 10) res.redirect('https://flai.ml');
	db('flai').where('link', '=', fetchedLink)
	.then(data => {
		console.log(data)
		if(data[0]) {
			url = data[0].url;
			return url;
		}
		else
			return url = '';
	})
	.then(() => {
		console.log(url)
		if(url) {
			if(url[4] !== 's') {
				try {
					const request = http.get(url, (response) => {
						res.writeHead(200, {
							"Content-Disposition": response.headers['content-disposition'],
							'Content-Type': response.headers['content-type']
						});
						response.pipe(res);
					});
				}
				catch(error) {
					res.redirect('https://flai.ml/#/error');
				}
			}
			else {
				try {
					const request = https.get(url, (response) => {
						res.writeHead(200, {
							"Content-Disposition": response.headers['content-disposition'],
							'Content-Type': response.headers['content-type']
						});
						response.pipe(res);
					});
				}
				catch(error) {
					res.redirect('https://flai.ml/#/error');
				}
			}
		}
		else {
			password = '';
			res.redirect('https://flai.ml');
		}
	})
	.catch(err => res.send(err))
}

module.exports = {
	handleLinks: handleLinks
}