const Archiver = require('archiver');

let alpha = -1;
let beta = 0;

const streamHead = (req, res, next, torrent, client) => {

	res.on('close', () => {
		isAllow = 1;
		console.log(`[Client Is Disconnected]`);

		try { heatStream.destroy() }
		catch { console.log("13|heatStream.destroy() Invalid") }
		
		try { client.remove(magnetURI) }
		catch(err) { console.log('16|Cannot Remove client') }

		try { clearInterval(interval) }
		catch { console.log("19|Unable To Clear Interval") }
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
		return res.redirect('https://jvoltci.github.io/flai/#/error');

	res.writeHead(200, {
        'Content-Type': 'application/zip',
        'Content-disposition': `attachment; filename=${torrent.name}.zip`
    });
    const zip = Archiver('zip');
    zip.pipe(res);
    zip.append(`${beta} bytes`, { name: `[Download Buffers].txt` });

    let j = 0;

    let heatStream = '';

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

    		isAllow = 1;
    		
    		let count = 0;
    		for(q = 0; q < notStreamed.length; q++)
    			if(notStreamed[q] === '\n')
    				count += 1;

    		zip.append(notStreamed, {name: `[${count} Not Downloaded].txt`});
    		clearInterval(interval);
    		zip.finalize();
    		try { client.remove(magnetURI) }
			catch(err) { console.log('95|Cannot Remove Torrent') }
    	}
    }

    autoStreamOnEnd();
}


const handleTorrents = (req, res, next, client) => {

	if(isAllow == 1) {
		try {

			if(client.get(magnetURI)) {
				isAllow = 0;
				const torrent = client.get(magnetURI);
				streamHead(req, res, next, torrent, client);
			}
			else {
				client.add(magnetURI, (torrent) => {
					isAllow = 0;
					streamHead(req, res, next, torrent, client);

				}).on('error', (err) => {

					console.log('121|Cannot Add Torrent');

					try { client.remove(magnetURI) }
					catch(err) { console.log('123|Cannot Remove Torrent') }

					res.redirect('https://jvoltci.github.io/flai/#/error');
				});
			}
		}
		catch(err) {
			isAllow = 1;
			console.log("[torrents]Error: Zip", err);

			try { client.remove(magnetURI) }
			catch(err) { console.log('135|Cannot Remove Torrent') }

			res.redirect('https://jvoltci.github.io/flai/#/error');
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