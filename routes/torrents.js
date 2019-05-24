const Archiver = require('archiver');

const streamHead = (req, res, next, client, torrent) => {

	res.on('close', () => {
		node -= 1;
		console.log(`[Client ${node+1} Is Disconnected]`);

		try { heatStream.destroy() }
		catch { console.log("10|heatStream.destroy() Invalid") }
		
		try { client.destroy() }
		catch(err) { console.log('13|Cannot Remove Magnet') }

		try { clearInterval(interval) }
		catch { console.log("16|Unable To Clear Interval") }
	})

	let torrentFilesNumber = torrent.files.length;
	let id = -1;
	for(i = 0; i < torrentFilesNumber; i++) {
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

    let heatStream = '';

    let alpha = -1;
    let beta = 0;

    let notStreamed = '';

    interval = setInterval(() => {
    	if(alpha === beta && j <= torrentFilesNumber) {
    		if(j < torrentFilesNumber) {
    			console.log(`*(${j}/${torrentFilesNumber}) | ${torrent.files[j].name} | ${(beta/1000000).toFixed(1)} mb`);
	    		notStreamed += `${torrent.files[j].name}\n`;
	    		zip.append(`${beta} bytes`, { name: `[Download Buffers].txt` });
    		}
    		j++;
    		autoStreamOnEnd();
    	}
    	else {
    		zip.append(`${beta} bytes`, { name: `[Download Buffers].txt` });
    		alpha = beta;
    	}
    }, 25000);

    const autoStreamOnEnd = () => {

    	if(j < torrentFilesNumber) {
    		heatStream = torrent.files[j].createReadStream(torrent.files[j].name);	
    		heatStream.on('data', (chunk) => {
    			beta += chunk.length;
    		}).on('end', (err) => {
    			if(j <= torrentFilesNumber) {
    				console.log(`(${j}/${torrentFilesNumber}) | ${torrent.files[j].name} | ${(beta/1000000).toFixed(1)} mb`);
    				heatStream = torrent.files[j].createReadStream(torrent.files[j].name);
    				heatStream.on('end', () => {
    					j++;
    					autoStreamOnEnd();
    				})
    				zip.append(heatStream, {name: torrent.files[j].name});
    			}
    		}).on("error", (err) => {
				return next(err);
			});
    	}
    	if(j > torrentFilesNumber) {

    		let count = 0;
    		for(q = 0; q < notStreamed.length; q++)
    			if(notStreamed[q] === '\n')
    				count += 1;

    		zip.append(notStreamed, {name: `[Not Downloaded].txt`});
    		clearInterval(interval);
    		zip.finalize();
    		node -= 1;
    		try { client.destroy() }
			catch(err) { console.log('95|Cannot Remove Torrent') }
    	}
    }

    autoStreamOnEnd();
}


const handleTorrents = (req, res, next, client) => {

	if(node < 3) {
		try {

			if(client.get(magnetURI)) {
				node += 1;
				const torrent = client.get(magnetURI);
				streamHead(req, res, next, client, torrent);
			}
			else {
				client.add(magnetURI, (torrent) => {
					node += 1;
					streamHead(req, res, next, client, torrent);

				}).on('error', (err) => {

					console.log('120|Cannot Add Torrent');

					try { client.destroy() }
					catch(err) { console.log('123|Cannot Remove Torrent') }

					res.redirect('https://flai.ml/#/error');
				});
			}
		}
		catch(err) {
			node -= 1;
			console.log("[torrents]Error: Zip");

			try { client.destroy() }
			catch(err) { console.log('134|Cannot Remove Torrent') }

			res.redirect('https://flai.ml/#/error');
			//process.setMaxListeners(0);
		}
	}
	else {
		let error = new Error('[torrents][Busy Server]');
    	throw error;
	}
}
module.exports = {
	handleTorrents: handleTorrents
}	