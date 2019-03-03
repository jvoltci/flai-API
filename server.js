const express = require('express');
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
let file = "paradox";
let password = '';

app.get('/', (req, res) => {
	res.send("<h1><a href='https://flai.herokuapp.com' >Go to FLai</a></h1>")
})

app.post('/download', (req, res) => {
	password = req.body.user.password;

	if (password === process.env.PASS) {
		extension = req.body.user.extension;
		url = req.body.user.url;
		
		if(extension === ".mp4") {
			contentType = 'video/mp4';
			file = "ergo";
		}
		else if(extension === ".mp3") {
			contentType = 'audio/mp3';
			file = "sonorous";
		}
		else if(extension === ".mkv") {
			contentType = 'video/webm';
			file = "limerence";
		}
		else {
			contentType = 'application/zip';
			file = "paradox";
		}
		return res.redirect('/link');
	}
	else
		return res.redirect('https://flai.herokuapp.com');

})

app.get('/link', (req, res) => {
	if(url && extension) {
		if(url[4] !== 's') {
			const request = http.get(url, function(response) {
			res.writeHead(200, {
				"Content-Disposition": "attachment;filename=" + file + extension,
				'Content-Type': contentType
			});
			response.pipe(res);
		});	
		}
		else {
			const request = https.get(url, function(response) {
				res.writeHead(200, {
					"Content-Disposition": "attachment;filename=" + file + extension,
					'Content-Type': contentType
				});
				response.pipe(res);
			});
		}
	}

	else {
		password = '';
		res.redirect('https://flai.herokuapp.com');
	}
})

app.get('/play', (req, res) => {

	if(url) {
		if(url[4] !== 's') {
			const request = http.get(url, function(response) {
			res.writeHead(200, {
				'Content-Type': contentType
			});
			response.pipe(res);
		});	
		}
		else {
			const request = https.get(url, function(response) {
				res.writeHead(200, {
					'Content-Type': contentType
				});
				response.pipe(res);
			});
		}
	}
	else {
		res.redirect('https://flai.herokuapp.com');
	}
})

app.listen(port, () => {
    console.log("Listening on *:5000")
})

module.exports = app;