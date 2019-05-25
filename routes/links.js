const http = require('http');
const https = require('https');

const handleLinks = (req, res, db) => {

	let fetchedLink = req.params.id;
	if(fetchedLink.length < 10) res.redirect('https://flai.ml');
	db('flai').where('link', '=', fetchedLink)
	.then(data => {
		if(data[0]) {
			url = data[0].url;
			return url;
		}
		else
			return url = '';
	})
	.then((url) => {
		if(url) {
			let cd = '';
			if(url[4] !== 's') {
				try {
					const request = http.get(url, (response) => {
						if(response.headers['content-disposition'])
							cd = response.headers['content-disposition'];
						else
							cd = "attachment;filename=flai[Change Extension].zip";
						res.writeHead(200, {
							"Content-Disposition": cd,
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
						if(response.headers['content-disposition'])
							cd = response.headers['content-disposition'];
						else
							cd = "attachment;filename=flai[Change Extension].zip";
						res.writeHead(200, {
							"Content-Disposition": cd,
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