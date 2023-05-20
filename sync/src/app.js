const proxy = require('express-http-proxy');
const { fork } = require('child_process');
const { createServer } = require('http');
const ioWrapper = require('socket.io');
const express = require('express');
const { join } = require('path');
const axios = require('axios');
const cors = require('cors');

const { pictureDirectory, userId } = require('../config.json');

require('dotenv').config();

const app = express();
const server = createServer(app);
const io = ioWrapper(server);

const devURI = 'localhost:3000';

const devProxy = proxy(devURI, {
	// eslint-disable-next-line global-require
	proxyReqPathResolver: req => require('url').parse(req.originalUrl).path
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

app.get('/imgproxy/:id/', async (req, res) => {
	const { date: dateUnderscore, page } = req.query;
	const { id, url } = req.params;
	const date = dateUnderscore.replace(/_/g, '/');

	const { data: stream } = await axios({
		url: decodeURIComponent(url) || `https://i.pximg.net/img-master/img/${date}/${id}_p${page || 0}_master1200.jpg`,
		method: 'get',
		responseType: 'stream',
		headers: {
			Referer: 'https://www.pixiv.net'
		}
	});

	res.writeHead(200);
	stream.pipe(res);
});

app.get('/pages/:id', async (req, res) => {
	const { id } = req.params;

	const pages = await axios({
		url: `https://www.pixiv.net/ajax/illust/${id}/pages`,
		method: 'get',
		headers: authHeaders
	});

	res.json(pages.data.body.map(page => ({
		url: page.urls.original,
		width: page.width,
		height: page.height
	})));
});

const getFromPixiv = async (req, res, pixivUrl, processing = posts => posts) => {
	try {
		const posts = await axios({
			url: pixivUrl,
			method: 'get',
			headers: { ...authHeaders }
		});

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
	} catch (err) {
		res.status(500).json(err?.response?.data || err);
	}
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
		res.status(500).json(err?.response?.data || err);
	}
});

app.get('/unlike/:id', async (req, res) => {
	const { id } = req.params;

	try {
		const { data: postData } = await axios({
			url: `https://www.pixiv.net/ajax/illust/${id}`,
			method: 'get',
			headers: { ...authHeaders }
		});

		const bookmarkId = postData.body.bookmarkData?.id;

		if (!bookmarkId) return res.status(404).json({ error: true, message: 'Bookmark data does not exist.', body: [] });

		const { data: deleteData } = await axios({
			url: 'https://www.pixiv.net/ajax/illusts/bookmarks/delete',
			method: 'post',
			data: `bookmark_id=${bookmarkId}`,
			headers: { 'x-csrf-token': process.env.CSRF_TOKEN, ...authHeaders }
		});

		res.json(deleteData);
	} catch (err) {
		res.status(500).json(err?.response?.data || err);
	}
});

app.get('/relevant/:id/:version?', async (req, res) => {
	const { id, version } = req.params;

	getFromPixiv(req, res, `https://www.pixiv.net/ajax/illust/${id}/recommend/init?limit=180&lang=en${version ? `&version=${version}` : ''}`, posts =>
		posts.illusts
			.filter(post => post.illustType === 0)
			.filter(post => (post.isAdContainer ? null : post))
			.sort((a, b) => {
				const scoreA = posts.recommendedIllusts[a.id];
				const scoreB = posts.recommendedIllusts[b.id];

				return scoreA - scoreB;
			}));
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

app.get('/user/:id', async (req, res) => {
	const { id } = req.params;

	const postIds = await axios({
		url: `https://www.pixiv.net/ajax/user/${id}/profile/all?lang=en`,
		method: 'get',
		headers: authHeaders
	});

	const urlMappedIllusts = Object.keys(postIds.data.body.illusts).reverse().slice(0, 100).map(postId => `ids[]=${postId}`);
	getFromPixiv(
		req,
		res,
		`https://www.pixiv.net/ajax/user/${id}/profile/illusts?${urlMappedIllusts.join('&')}&work_category=illustManga&is_first_page=1`,
		(posts) => Object.values(posts.works).filter(post => post.illustType === 0).reverse()
	);
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
			child?.stdout.removeAllListeners();
			child?.stderr.removeAllListeners();
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
