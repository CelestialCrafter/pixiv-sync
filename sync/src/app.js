const proxy = require('express-http-proxy');
const { fork } = require('child_process');
const { createServer } = require('http');
const ioWrapper = require('socket.io');
const express = require('express');
const { join } = require('path');
const axios = require('axios');
const cors = require('cors');
const url = require('url');

const { pictureDirectory, userId } = require('../config.json');

require('dotenv').config();

const app = express();
const server = createServer(app);
const io = ioWrapper(server);

const devURI = 'localhost:3000';

const devProxy = proxy(devURI, {
	proxyReqPathResolver: req => url.parse(req.originalUrl).path
});

const authHeaders = {
	'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:102.0) Gecko/20100101 Firefox/103.0',
	Cookie: `PHPSESSID=${userId}_${process.env.PIXIV_TOKEN};`
};

app.use(cors());

const imagesPath = join(pictureDirectory, 'images/pixiv');
const privatePath = join(pictureDirectory, 'private/pixiv');

app.use('/images', express.static(imagesPath));
app.use('/private', express.static(privatePath));

app.get('/config', (req, res) => res.sendFile(join(__dirname, '../config.json')));

app.get('/imgproxy/:date/:id', async (req, res) => {
	const { date: dateUnderscore, id } = req.params;
	const date = dateUnderscore.replace(/_/g, '/');

	const stream = await axios({
		url: `https://i.pximg.net/img-master/img/${date}/${id}_p0_master1200.jpg`,
		method: 'get',
		responseType: 'stream',
		headers: {
			Referer: 'https://www.pixiv.net',
			...authHeaders
		}
	});

	res.writeHead(200);
	stream.pipe(res);
});

const getFromPixiv = async (req, res, pixivUrl, processing = posts => posts) => {
	const posts = await axios({
		url: pixivUrl,
		method: 'get',
		headers: authHeaders
	}).catch();

	const formattedPosts = processing(posts.data.body)
		.map(post => ({
			id: post.id,
			url: post.url,
			updateDate: post.updateDate,
			pageCount: 1,
			tags: post.tags,
			sizes: [{ width: post.width, height: post.height }]
		}));

	res.json(formattedPosts);
};

app.get('/like/:id', async (req, res) => {
	const { id } = req.params;
	const { priv, r18 } = req.query;

	try {
		const { data } = await axios({
			url: 'https://www.pixiv.net/ajax/illusts/bookmarks/add',
			method: 'post',
			data: {
				illust_id: id,
				restrict: Number(priv === 'true'),
				tags: r18 === 'true' ? ['R-18'] : [],
				comment: ''
			},
			headers: { 'x-csrf-token': process.env.CSRF_TOKEN, ...authHeaders }
		});

		res.json(data);
	} catch (err) {
		res.json(err.response.data);
	}
});

app.get('/unlike/:id', async (req, res) => {
	const { id } = req.params;

	try {
		const { data } = await axios({
			url: 'https://www.pixiv.net/ajax/illusts/bookmarks/delete',
			method: 'post',
			data: `bookmark_id=${id}`,
			headers: { 'x-csrf-token': process.env.CSRF_TOKEN, ...authHeaders }
		});

		res.json(data);
	} catch (err) {
		res.json(err.response.data);
	}
});

app.get('/relevant/:id', async (req, res) => {
	const { id } = req.params;

	getFromPixiv(req, res, `https://www.pixiv.net/ajax/illust/${id}/recommend/init?limit=180&lang=en`, posts =>
		posts.illusts
			.filter(post => post.illustType === 0)
			.filter(post => (post.isAdContainer ? null : post)));
});

app.get('/browse/:version', async (req, res) => {
	const { version } = req.params;

	getFromPixiv(
		req,
		res,
		`https://www.pixiv.net/ajax/discovery/artworks?mode=all&limit=100&lang=en${version ? `&version=${version}` : ''}`,
		posts => posts.thumbnails.illust.filter(post => post.illustType === 0)
	);
});

app.get('/following/:page', async (req, res) => {
	const { page } = req.params;

	getFromPixiv(req, res, `https://www.pixiv.net/ajax/follow_latest/illust?p=${page}&mode=all&lang=en`, posts =>
		posts.thumbnails.illust
			.filter(post => post.illustType === 0));
});

app.get('/unlike/:id', async (req, res) => {
	const { id } = req.params;

	const { data: unlike } = await axios({
		url: 'https://www.pixiv.net/ajax/illusts/bookmarks/delete',
		method: 'post',
		headers: authHeaders,
		data: `bookmark_id=${id}`
	}).catch(err => res.json(err.data));

	res.json(unlike);
});

const debounce = (fn, delay) => {
	let timer;
	return (...args) => {
		clearTimeout(timer);
		timer = setTimeout(() => fn.apply(this, args), delay);
	};
};

const settingsValidator = {
	set settings(newSettings) {
		// eslint-disable-next-line global-require
		const validKeys = Object.keys(require('../config.json'));
		const newValidSettings = newSettings;

		Object.keys(newSettings).forEach(key => (!validKeys.includes(key) ? delete newValidSettings[key] : null));

		this.validSettings = newValidSettings;
	},
	// eslint-disable-next-line global-require
	validSettings: require('../config.json')
};

let child = null;

io.on('connection', socket => {
	console.log('Connected to client');

	socket.on('setSettings', newSettings => { settingsValidator.settings = newSettings; });
	socket.on('requestSettings', () => socket.emit('settings', settingsValidator.validSettings));

	socket.on('endSync', () => {
		child?.kill();
		child = null;
	});

	socket.on('sync', () => {
		if (child) return console.log('Sync in progress. Ignoring Sync request');
		console.log('Recieved Sync request');
		io.emit('settings', settingsValidator.validSettings);

		child = fork('src/sync.js', {
			env: {
				RUN_SYNC_IMMEDIATELY: true,
				WAIT_FOR_SETTINGS: true
			},
			stdio: ['ignore', 'pipe', 'pipe', 'ipc']
		});

		child.stdout.pipe(process.stdout);
		child.stderr.pipe(process.stderr);

		let queue = [];
		const debouncedEmitData = debounce(() => {
			io.emit('syncData', queue);
			queue = [];
		}, 150);

		const emitData = data => {
			queue.push(data);
			debouncedEmitData();
		};

		child.stdout.on('data', chunk => chunk.toString().split('\n').slice(0, -1).forEach(emitData));
		child.stderr.on('data', chunk => chunk.toString().split('\n').slice(0, -1).forEach(emitData));

		child.on('close', () => {
			child.stdout.removeAllListeners();
			child.stderr.removeAllListeners();
			child = null;
		});

		child.send(settingsValidator.validSettings);
	});

	socket.once('disconnect', () => console.log('Disconnected'));
});

const start = async () => {
	try {
		await axios.get(`http://${devURI}`);
		console.log('Using dev proxy');
		app.use(devProxy);
	} catch (e) {
		console.log('Using prod build');
		app.use(express.static(join(__dirname, '../../viewer/build')));
	}

	server.listen(80, () => console.log('Listening on port 80'));
};

start();
