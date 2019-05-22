const handleTorrents = (req, res, client, Archiver) => {
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

			res.writeHead(200, {
		        'Content-Type': 'application/zip',
		        'Content-disposition': 'attachment; filename=Immortal.zip'
		    });
		    const zip = Archiver('zip');
		    zip.pipe(res);

		    let j = 0;

		    let heatStream = [];

		    let alpha = -1;
		    let beta = 0;

		    let notStreamed = '';

		    const interval = setInterval(() => {
		    	if(alpha === beta && j <= torrent.files.length) {
		    		if(j < torrent.files.length) {
		    			heatStream[j].destroy()
			    		notStreamed += `${torrent.files[j].name}\n`;
			    		zip.append(`${torrent.files[j].name}`, { name: `[Not Downloaded].txt` });
		    		}
		    		j++;
		    		autoStreamOnEnd();
		    	}
		    	else
		    		alpha = beta;
		    }, 25000);

		    const autoStreamOnEnd = () => {

		    	if(j < torrent.files.length) {
		    		heatStream[j] = torrent.files[j].createReadStream(torrent.files[j].name);	
		    		heatStream[j].on('data', (chunk) => {
		    			beta += chunk.length;
		    		}).on('end', (err) => {
		    			if(j <= torrent.files.length) {
		    				heatStream[j] = torrent.files[j].createReadStream(torrent.files[j].name);
		    				heatStream[j].on('end', () => {
		    					j++;
		    					autoStreamOnEnd();
		    				})
		    				zip.append(heatStream[j], {name: torrent.files[j].name});
		    			}
		    		}).on("error", (err) => {
						return next(err);
					});
		    	}
		    	if(j > torrent.files.length) {

		    		let count = 0;
		    		for(q = 0; q < notStreamed.length; q++)
		    			if(notStreamed[q] === '\n')
		    				count += 1;

		    		zip.append(notStreamed, {name: `[Not Downloaded].txt`});
		    		clearInterval(interval);
		    		zip.finalize();
		    		client.remove(magnetURI);
		    	}
		    }

		    autoStreamOnEnd();
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

				res.writeHead(200, {
			        'Content-Type': 'application/zip',
			        'Content-disposition': 'attachment; filename=Immortal.zip'
			    });
			    const zip = Archiver('zip');
			    zip.pipe(res);

			    let j = 0;

			    let heatStream = [];

			    let alpha = -1;
			    let beta = 0;

			    let notStreamed = '';

			    const interval = setInterval(() => {
			    	if(alpha === beta && j <= torrent.files.length) {
			    		if(j < torrent.files.length) {
			    			heatStream[j].destroy()
				    		notStreamed += `${torrent.files[j].name}\n`;
				    		zip.append(`${torrent.files[j].name}`, { name: `[Not Downloaded].txt` });
			    		}
			    		j++;
			    		autoStreamOnEnd();
			    	}
			    	else
			    		alpha = beta;
			    }, 25000);

			    const autoStreamOnEnd = () => {

			    	if(j < torrent.files.length) {
			    		heatStream[j] = torrent.files[j].createReadStream(torrent.files[j].name);	
			    		heatStream[j].on('data', (chunk) => {
			    			beta += chunk.length;
			    		}).on('end', (err) => {
			    			if(j <= torrent.files.length) {
			    				heatStream[j] = torrent.files[j].createReadStream(torrent.files[j].name);
			    				heatStream[j].on('end', () => {
			    					j++;
			    					autoStreamOnEnd();
			    				})
			    				zip.append(heatStream[j], {name: torrent.files[j].name});
			    			}
			    		}).on("error", (err) => {
							return next(err);
						});
			    	}
			    	if(j > torrent.files.length) {

			    		let count = 0;
			    		for(q = 0; q < notStreamed.length; q++)
			    			if(notStreamed[q] === '\n')
			    				count += 1;

			    		zip.append(notStreamed, {name: `[Not Downloaded].txt`});
			    		clearInterval(interval);
			    		zip.finalize();
			    		client.remove(magnetURI);
			    	}
			    }

			    autoStreamOnEnd();
			}).on('error', (err) => {
				console.log('Cannot Add torrent:', err);

				try { client.remove(magnetURI) }
				catch(err) { console.log('Err:', err) }

				res.redirect('https://flai.ml/#/error');
			});
		}
	}
	catch(e) {
		console.log("Z-ip Error: ", e);
		client.remove(magnetURI);
		res.redirect('https://flai.ml/#/error');
		//process.setMaxListeners(0);
	}
}
module.exports = {
	handleTorrents: handleTorrents
}