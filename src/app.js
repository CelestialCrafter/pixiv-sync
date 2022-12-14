// @TODO write server code that uses built react site as static and adds api endpoints to:
// 	1. re-sync files
// 	2. change config options when re-syncing
// 	4. override config.json when passing options into sync()

// @TODO create seperate files for privatePosts.json and posts.json in sync

const proxy = require('express-http-proxy');
const express = require('express');
const { join } = require('path');
const url = require('url');
const axios = require('axios');
const cors = require('cors');

const { pictureDirectory } = require('../config.json');

const app = express();

const devProxy = proxy('localhost:3000', {
	proxyReqPathResolver: req => url.parse(req.originalUrl).path
});

app.use(cors());

app.use('/data', express.static(join(__dirname, '../data')));

const imagesPath = join(pictureDirectory, 'images/pixiv');
const privatePath = join(pictureDirectory, 'private/pixiv');

app.use('/images', express.static(imagesPath));
app.use('/private', express.static(privatePath));

const start = async () => {
	try {
		await axios.get('http://localhost:3000');
		console.log('Using dev proxy');
		app.use(devProxy);
	} catch (e) {
		console.log('Using prod build');
		app.use(express.static(join(__dirname, 'viewer/build')));
	}

	app.listen(80, () => console.log('Listening on port 80'));
};

start();
