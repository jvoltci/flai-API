const handleMetadata = (req, res, client) => {
	try {
		password = req.body.password;
		if(req.method === "POST" && password === process.env.PASS) {
			magnetURI = req.body.url;

			if(client.get(magnetURI)) {
				const torrent = client.get(magnetURI);
				const files = [];
				torrent.files.forEach( (data) => {
					files.push(data.name);
				});
				res.status(200);
				res.json(files);
			}
			else {
				client.add(magnetURI, torrent => {
					const files = [];
					torrent.files.forEach( (data) => {
						files.push(data.name);
					});
					res.status(200);
					res.json(files);
				})
				.on('error', (err) => {
					console.log('[metadata]Error: Client Add Error');
					
					try { client.remove(magnetURI) }
					catch(err) { console.log('[metadata]Error: Magnet Remove') }

					res.redirect('https://flai.ml/#/error');
				})
			}
		}
		else
			return res.redirect('https://flai.ml/#/error');
	}
	catch(err) {
		console.log('[metadata]Error: Metadata');
		res.redirect('https://flai.ml/#/error');
	}
}

module.exports = {
	handleMetadata: handleMetadata
};