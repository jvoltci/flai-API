const express = require('express');
const app = express();
const https = require('https');
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
const port = process.env.PORT || 5000;
let url = '';

app.get('/', (req, res) => {
	res.send("<h1><a href='https://flai-herokuapp.com' >Go to FLai</a></h1>")
})

app.post('/download', (req, res) => {
	let post = req.body;
	let contentType = '';
	let file = "paradox";
	url = post.user.url;

	if(post.user.extension === ".mp4") {
		contentType = 'video/mp4';
		file = "ergo";
	}
	else if(post.user.extension === ".mp3")
		contentType = 'audio/mp3';
	else if(post.user.extension === ".zip")
		contentType = 'application/zip';


	if(url && post.user.extension) {
		const request = https.get(url, function(response) {
			res.writeHead(200, {
				"Content-Disposition": "attachment;filename=" + file + post.user.extension,
				'Content-Type': contentType
			});
			response.pipe(res);
		});
	}
	else {
		res.sendFile(__dirname + '/public/index.html');
	}
})

app.get('/play', (req, res) => {

	if(url) {
		const request = https.get(url, function(response) {
			res.writeHead(200, {
				'Content-Type': 'video/mp4'
			});
			response.pipe(res);
		});
	}
	else {
		res.sendFile(__dirname + '/public/index.html');
	}
})

app.listen(port, () => {
    console.log("Listening on *:3000")
})

module.exports = app;