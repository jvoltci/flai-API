const express = require('express');
const cors = require('cors');
const app = express();
const https = require('https');
const http = require('http');
const bodyParser = require('body-parser');

const knex = require('knex');

//const MultiStream = require('multistream');
//const magnet = require('parse-torrent')
const Archiver = require('archiver');
const parseTorrent = require('archiver');
const WebTorrent = require('webtorrent')
//process.setMaxListeners(0);
const client = new WebTorrent();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
const port = process.env.PORT || 5000;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://flai.ml");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

let magnetURI = ''
let url = '';
let link = '';
let contentType = '';
let extension = '';
let file = "Paradox";
let password = '';

const db = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: true
  }
});

app.get('/', (req, res) => {
	res.send("<h1><a href='https://flai.ml' >Go to flai</a></h1>")
})

app.post('/download', (req, res) => {
	password = req.body.user.password;

	if (password === process.env.PASS) {
		extension = req.body.user.extension;
		url = req.body.user.url;

		db('flai').where('url', '=', url)
		.then(data => {
			if(data[0]) {
				link = data[0].link;
			}
			else {
				link = makeid(10);
				db('flai').insert({link: link, url: url, extension: extension}).returning('*')
					.then(data => console.log(link));
			}
		})
		.then(() => {
			if(extension === ".mp4") {
				contentType = 'video/mp4';
				file = "Ergo";
			}
			else if(extension === ".mp3") {
				contentType = 'audio/mp3';
				file = "Sonorous";
			}
			else if(extension === ".mkv") {
				contentType = 'video/webm';
				file = "Limerence";
			}
			else {
				contentType = 'application/zip';
				file = "Paradox";
			}
			return res.redirect('/link/' + link);
		}
		)
	}
	else
		return res.redirect('https://flai.ml/#/error');

})

app.get('/link/:id', (req, res) => {

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
})

app.get('/play/:id', (req, res) => {

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
				res.redirect('https://flai.ml');
			}
		})
		.catch(err => res.send(err))
})

app.post('/metadata', (req, res) => {
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
					console.log('Z-', err);
					client.remove(magnetURI);
					res.redirect('https://flai.ml/#/error');
				})
			}
		}
		else
			return res.redirect('https://flai.ml/#/error');
	}
	catch(e) {
		console.log("Z-Error: ",e);
		res.redirect('https://flai.ml/#/error');
		/*res.send("<div style='height: 400px;width: 800px; background: red; display: flex; flex-direction: column; justify-content: center; text-align: center;'><h1>❝Vanilla Error❞</h1></div>");*/
	}
})

app.get('/torrent/:file_name', (req, res, next) => {

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
				console.log('Z-', err);
				client.remove(magnetURI);
				res.redirect('https://flai.ml/#/error');
			});
		}
	}
	catch(e) {
		console.log("Z-Error: ",e);
		res.redirect('https://flai.ml/#/error');
	}

});

app.get('/torrents/:file_name', (req, res, next) => {

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

		    let j = 0, haveTo = 0;

		    let heatStream = torrent.files[j].createReadStream(torrent.files[j].name);

		    let alpha = '';
		    let beta = '';

		    let notStreamed = [];

		    const autoStreamOnEnd = () => {
		    	if(j < torrent.files.length) {
		    		heatStream = torrent.files[j].createReadStream(torrent.files[j].name);	
		    		heatStream.on('data', (chunk) => {
		    			try {
		    				console.log(chunk, chunk.name, chunk.length);
		    			}
		    			catch(e) {
		    				console.log("Hey");
		    			}
		    			beta = chunk;
		    			haveTo = 0;
		    		}).on('end', (err) => {
		    			if(j < torrent.files.length) {
		    				j++;
		    				console.log(j, torrent.files[j-1].name);
		    				autoStreamOnEnd();
		    			}
		    		}).on("error", (err) => {
						return next(err);
					});

		    		zip.append(heatStream, {name: torrent.files[j].name});
		    	}
		    	//See here
		    	if(j === 100) {
		    		//clearInterval(interval);
		    		zip.finalize();
		    	}
		    }

		    autoStreamOnEnd();		 

		    const keepAlive = () => {
		    	console.log("Inside keepAlive")
		    	for(let k = 1; k > 0; k++) {
		    		if(haveTo) {
		    			zip.append(`${torrent.files[j].name}`, { name: `#${torrent.files[j].name}[Not Downloaded].txt` });
		    		}
		    		else
		    			break;
		    	}
		    	console.log("Outside keepAlive");
		    }

		    setInterval(() => {
		    	if(beta !== 0 && (alpha === beta)) {
		    		notStreamed.push(`${j}- ${torrent.files[j].name}\n`);
		    		haveTo = 1;
		    		console.log(notStreamed);
		    		j++;
		    		autoStreamOnEnd();
		    		keepAlive();
		    	}
		    	else
		    		alpha = beta;
		    }, 30000);
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

				res.writeHead(200, {
			        'Content-Type': 'application/zip',
			        'Content-disposition': 'attachment; filename=Immortal.zip'
			    });
			    const zip = Archiver('zip');
			    zip.pipe(res);

			    let j = 0;

			    let heatStream = torrent.files[j].createReadStream(torrent.files[j].name);

			    let alpha = '';
			    let beta = '';

			    let notStreamed = [];

			    setInterval(() => {
			    	console.log(`${j} Inside interval`);
			    	if(beta !== 0 && (alpha === beta)) {
			    		console.log(torrent.files[j].name);
			    		notStreamed.push(`${j} ${torrent.files[j].name}`);
			    		j++;
			    		autoStreamOnEnd();
			    	}
			    	else
			    		alpha = beta;
			    }, 30000);

			    const autoStreamOnEnd = () => {
			    	if(j < torrent.files.length) {
			    		heatStream = torrent.files[j].createReadStream(torrent.files[j].name);
			    		heatStream.on('data', (chunk) => {
			    			console.log(chunk.length);
			    		}).on('end', (err) => {
			    			if(j < torrent.files.length) {
			    				j++;
			    				console.log(j, torrent.files[j-1].name);
			    				autoStreamOnEnd();
			    			}
			    		}).on("error", (err) => {
							return next(err);
						});

			    		zip.append(heatStream, {name: torrent.files[j].name});
			    	}
			    	if(j === torrent.files.length) {
			    		zip.finalize();
			    	}
			    }

			    autoStreamOnEnd();
			})
			.on('error', (err) => {
				console.log('Z-', err);
				client.remove(magnetURI);
				res.redirect('https://flai.ml/#/error');
			});
		}
	}
	catch(e) {
		console.log("Z-Error: ",e);
		client.remove(magnetURI);
		res.redirect('https://flai.ml/#/error');
	}

});

const makeid = (length) => {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

const setFileName = () => {
	if(extension === ".mp4") {
		contentType = 'video/mp4';
		file = "Ergo";
	}
	else if(extension === ".mp3") {
		contentType = 'audio/mp3';
		file = "Sonorous";
	}
	else if(extension === ".mkv") {
		contentType = 'video/webm';
		file = "Limerence";
	}
	else {
		contentType = 'application/zip';
		file = "Paradox";
	}
}

// Important stuffs`
process.on('uncaughtException', (err) => {
    console.log("Z-Error: ", err);
});

app.listen(port, () => {
	/*parseTorrent.remote('https://ftuforum.com/wp-content/uploads/2019/05/FreeTutorials.Us-Udemy-Mastering-Magento-2.torrent', (err, parsedTorrent) => {
	  if (err) throw err
	  console.log(parsedTorrent)
	})*/
    console.log("Listening on *:5000")
})

module.exports = app;