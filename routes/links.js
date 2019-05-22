const { setFileName } = require('./lib/setFileName');

const handleLinks = (req, res, db, http, https) => {

	let fetchedLink = req.params.id;
	if(fetchedLink.length < 10) res.redirect('https://flai.ml');
	db('flai').where('link', '=', fetchedLink)
		.then(data => {
			if(data[0]) {
				url = data[0].url;
				extension = data[0].extension;
				return setFileName();
			}
			else
				return url = '';
		})
		.then(() => {
			if(url && extension) {
				if(url[4] !== 's') {
					try {
						const request = http.get(url, (response) => {
							res.writeHead(200, {
								"Content-Disposition": "attachment;filename=" + file + extension,
								'Content-Type': contentType
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
								"Content-Disposition": "attachment;filename=" + file + extension,
								'Content-Type': contentType
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
	handleLink: handleLinks
}