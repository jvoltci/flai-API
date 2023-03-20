const http = require('http');
const https = require('https');
const request = require('request');

const handlePlay = (req, res, db) => {

	let fetchedLink = req.params.id;

	if(fetchedLink.length < 10) res.redirect('https://flai.ml');

	db.collection('flai').find({ link: fetchedLink }).project({ link: 1 }).toArray()
		.then(data => {
			if(data[0]) {
				url = data[0].url;
				return '';
			}
			else
				return url = '';
		})
		.then(() => {
			if(url) {
				request.head({ url: url, followRedirect: false}, (err, resE) => {
	                if(resE.headers.location)
	                    url = resE.headers.location;

	                if(url[4] !== 's') {
						try {
							const request = http.get(url, (response) => {
								res.writeHead(200, {
									'Content-Type': response.headers['content-type']
								});
								response.pipe(res);
							});
						}
						catch(error) {
							res.redirect('https://jvoltci.github.io/flai/#/error');
						}
					}
					else {
						try {
							const request = https.get(url, (response) => {
								res.writeHead(200, {
									'Content-Type': response.headers['content-type']
								});
								response.pipe(res);
							});
						}
						catch(error) {
							res.redirect('https://jvoltci.github.io/flai/#/error');
						}
					}
	            })
			}
			else {
				res.redirect('https://flai.ml');
			}
		})
		.catch(err => res.send(err))
}

module.exports = {
	handlePlay: handlePlay
}