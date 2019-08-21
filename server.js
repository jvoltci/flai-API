const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const knex = require('knex');
const WebTorrent = require('webtorrent')

const download = require('./routes/download');
const links = require('./routes/links');
const play = require('./routes/play');
const metadata = require('./routes/metadata');
const torrent = require('./routes/torrent');
const torrents = require('./routes/torrents');

const db = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: true
  }
});

let magnetURI = '';
let password = '';
isAllow = 1; //Something msterious here

const client = new WebTorrent();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://flai.ml");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.get('/', (req, res) => { res.send('It is working') })
app.post('/download', (req, res) => { download.handleDownload(req, res, db) })
app.get('/links/:id', (req, res) => { links.handleLinks(req, res, db) })
app.get('/play/:id', (req, res) => { play.handlePlay(req, res, db) })
app.post('/metadata', (req, res) => { metadata.handleMetadata(req, res, client) })
app.get('/torrent/:file_name', (req, res, next) => { torrent.handleTorrent(req, res, next, client, db)  })
app.get('/torrents/:file_name', (req, res, next) => { torrents.handleTorrents(req, res, next, client) })


process.on('uncaughtException', (err) => {
    console.log('Error: Process', err);
});

app.listen(port, () => {
    console.log(`App is running on port ${port}`);
})

module.exports = app;