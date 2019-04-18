const express = require('express');
const cors = require('cors');
const app = express();
const https = require('https');
const http = require('http');
const bodyParser = require('body-parser');

const knex = require('knex');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
const port = process.env.PORT || 5000;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

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
				let xLink = makeid(7);
				db('flai').insert({link: xLink, url: url});
			}
		})

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
	else
		return res.redirect('https://flai.ml');

})

app.get('/link/:id', (req, res) => {

	let fetchedLink = req.params.id;
	db('flai').where('link', '=', fetchedLink)
		.then(data => {
			if(data[0]) {
				url = data[0].url;
			}
			else
				url = '';
		})

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

const makeid = (length) => {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

app.listen(port, () => {
    console.log("Listening on *:5000")
})

module.exports = app;