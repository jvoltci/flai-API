const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient } = require("mongodb")
const WebTorrent = require('webtorrent')

const download = require('./routes/download');
const links = require('./routes/links');
const play = require('./routes/play');
const metadata = require('./routes/metadata');
const torrent = require('./routes/torrent');
const torrents = require('./routes/torrents');

// Database config
const connectionUrl = process.env.DATABASE//'mongodb+srv://jvoltci:jvoltci@genesis.ffs6wtd.mongodb.net/test'
const dbClient = new MongoClient(connectionUrl)
const databaseName = "flaiDB"
const db = dbClient.db(databaseName)
dbClient.connect()
console.log('Database Connected successfully to server')

magnetURI = '';
let password = '';
isAllow = 1; //Something msterious here

const client = new WebTorrent();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use((req, res, next) => {
  const allowedOrigins = ['https://jvoltci.github.io', 'https://jvoltci.github.io/flai', 'https://flai.ivehement.com'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
       res.setHeader('Access-Control-Allow-Origin', origin);
  }
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
