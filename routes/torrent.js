const handleTorrent = (req, res, next, client, db) => {
		try {
		/*let fetchedLink = req.params.id;
		db('flai').where('link', '=', fetchedLink)
		.then(data => {
			if(data[0]) {
				magnetURI = data[0].magnetURI;
			}
			else {
				return res.redirect('https://flai.ml/#/error');
			}
		})*/
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

			let stream = torrent.files[id].createReadStream();
			stream.pipe(res);
			stream.on("error", (err) => {
				return next(err);
			}).on('close', (err) => {
				client.destroy(err => {
			      console.log("error:", err);
			      console.log("shutdown allegedly complete");
			    });
			});
		}
		else {
			client.add(magnetURI, torrent => {
				
				let id = -1;
				for(i = 0; i < torrent.files.length; i++) {
					if(torrent.files[i].name == req.params.file_name) {
						id = i;
						break;
					}
				}
				if(id === -1)
					return res.redirect('https://flai.ml/#/error');

				db('flai').where('url', '=', url)
				.then(data => {
					if(data[0]) {
						link = data[0].link;
					}
					else {
						link = "torrent/" + req.params.file_name;
						db('flai').insert({link: link, url: magnetURI, extension: "magnet"}).returning('*')
							.then(data => console.log(link));
					}
				})
				let stream = torrent.files[id].createReadStream();
				stream.pipe(res);
				stream.on("error", (err) => {
					return next(err);
				}).on('close', (err) => {
				client.destroy(err => {
				      console.log("error:", err);
				      console.log("shutdown allegedly complete");
				    });
				});
			})
			.on('error', (err) => {
	        console.log('Cannot Add torrent:', err);

	        try { client.remove(magnetURI) }
	        catch(err) { console.log('Err:', err) }

	        res.redirect('https://flai.ml/#/error');
	      });
		}
	}
	catch(e) {
		console.log("Z-Error: ",e);
		res.redirect('https://flai.ml/#/error');
	}
}

module.exports = {
	handleTorrent: handleTorrent
}