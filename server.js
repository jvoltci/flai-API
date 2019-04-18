const express = require('express');
const fs = require('fs');
const readLastLines = require('read-last-lines');
const cors = require('cors');
const app = express();
const https = require('https');
const http = require('http');
const bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
const port = process.env.PORT || 5000;

let url = '';
let contentType = '';
let extension = '';
let file = "Paradox";
let password = '';

app.get('/', (req, res) => {
	res.send("<h1><a href='https://flai.ml' >Go to flai</a></h1>")
})

app.post('/download', (req, res) => {
	password = req.body.user.password;

	if (password === process.env.PASS) {
		extension = req.body.user.extension;
		url = req.body.user.url;

		fs.appendFile('link.txt', url + '\n',(err) => {
		  if (err) throw err;
		});
		
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
		return res.redirect('/link');
	}
	else
		return res.redirect('https://flai.ml');

})

app.get('/link', (req, res) => {

	readNow();

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

app.get('/play', (req, res) => {

	readNow();

	if(url) {
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

const readNow = () => {
	readLastLines.read('link.txt', 1)
		.then((line) => url = line.toString().replace(/(\r\n|\n|\r)/gm, ""));
}

app.listen(port, () => {
    console.log("Listening on *:5000")
})

module.exports = app;