const proxy = require('express-http-proxy');
const { fork } = require('child_process');
const { createServer } = require('http');
const ioWrapper = require('socket.io');
const express = require('express');
const { join } = require('path');
const axios = require('axios');
const cors = require('cors');
const url = require('url');

const { pictureDirectory } = require('../config.json');

const app = express();
const server = createServer(app);
const io = ioWrapper(server);

const devURI = 'localhost:3000';

const devProxy = proxy(devURI, {
	proxyReqPathResolver: req => url.parse(req.originalUrl).path
});

app.use(cors());

const imagesPath = join(pictureDirectory, 'images/pixiv');
const privatePath = join(pictureDirectory, 'private/pixiv');

app.use('/images', express.static(imagesPath));
app.use('/private', express.static(privatePath));

app.get('/config', (req, res) => res.sendFile(join(__dirname, '../config.json')));

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

io.on('connection', socket => {
	console.log('Connected to client');

	socket.on('setSettings', newSettings => { settingsValidator.settings = newSettings; });
	socket.on('requestSettings', () => socket.emit('settings', settingsValidator.validSettings));

	socket.on('sync', () => {
		console.log('Recieved Sync request');
		io.emit('settings', settingsValidator.validSettings);

		const child = fork('src/sync/sync.js', {
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
		app.use(express.static(join(__dirname, 'viewer/build')));
	}

	server.listen(80, () => console.log('Listening on port 80'));
};

start();
