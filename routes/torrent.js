const streamOneHead = (req, res, next, torrent, client, id) => {

	res.on('end', () => {
		stream.destroy();
	})

	let alpha = 0, beta = 0;
	setTimeout(() => {
		if(alpha === beta)
			res.redirect('https://flai.ml/#/error/timeout');
	}, 25000);

	let stream = torrent.files[id].createReadStream();
	stream.pipe(res);
	stream.on('data', chunk => {
		alpha = beta;
		beta += chunk.length;
	}).on("error", (err) => {
		return next(err);
	});
}

const handleTorrent = (req, res, next, client, db) => {

		try {

			if(client.get(magnetURI)) {
				const torrent = client.get(magnetURI);
				let id = -1;
				for(i = 0; i < torrent.files.length; i++) {
					if(torrent.files[i].name == req.params.file_name) {
						id = i;
						break;
					}
				}
				if(id === -1)
					return res.redirect('https://flai.ml/#/error');

				streamOneHead(req, res, next, torrent, client, id);
			}
			else {
				client.add(magnetURI, (torrent) => {
					
					let id = -1;
					for(i = 0; i < torrent.files.length; i++) {
						if(torrent.files[i].name == req.params.file_name) {
							id = i;
							break;
						}
					}
					if(id === -1)
						return res.redirect('https://flai.ml/#/error');

					db('flai').where('url', '=', magnetURI)
					.then(data => {
						if(data[0]) {
							link = data[0].link;
						}
						else {
							now = Date().toString();
							link = "torrent/" + torrent.name;
							db('flai').insert({link: link, url: magnetURI, date: now}).returning('*')
								.then(data => console.log(link));
						}
					})
					.catch(err => console.log(err));

					streamOneHead(req, res, next, torrent, client, id);
				})
				.on('error', (err) => {
		        console.log('Cannot Add torrent:', err);

		        try { client.remove(magnetURI) }
		        catch(err) { console.log('[torrent]Error: Magnet Remove') }

		        res.redirect('https://flai.ml/#/error');
		      });
			}
	}
	catch(e) {
		console.log("[torrent]Z-Error: ",e);
		res.redirect('https://flai.ml/#/error');
	}
}

module.exports = {
	handleTorrent: handleTorrent
}