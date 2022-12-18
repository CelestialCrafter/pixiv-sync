const dotenv = require('dotenv');
const {
	writeFileSync,
	readFileSync,
	existsSync
} = require('fs');
const { join } = require('path');

const downloadTranslationsWrapper = require('./actions/translations');
const removeUnlikedWrapper = require('./actions/unliked');
const tryDownloadsWrapper = require('./actions/tryDownloads');
const getPostsWrapper = require('./actions/getPosts');

dotenv.config();

const sync = async (overrideSettings = {}) => {
	/* eslint-disable global-require */
	const originalConfig = require('../../config.json');
	const config = require('../../config.json');
	/* eslint-enable global-require */

	Object.keys(overrideSettings).forEach(key => {
		if (!Object.keys(originalConfig).includes(key)) return;
		config[key] = overrideSettings[key];
	});

	const postCachePath = join(__dirname, '../../data/', config.privateImages ? 'privatePosts.json' : 'posts.json');

	const downloadTranslations = downloadTranslationsWrapper(config);
	const removeUnliked = removeUnlikedWrapper(config);
	const tryDownloads = tryDownloadsWrapper(config);
	const getPosts = getPostsWrapper(config);

	let posts = null;

	const { userId, useCache } = config;

	// Check or create cache
	if (useCache && existsSync(postCachePath)) posts = JSON.parse(readFileSync(postCachePath));
	else {
		posts = await getPosts(userId);
		writeFileSync(postCachePath, JSON.stringify(posts));
	}

	const headers = {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:102.0) Gecko/20100101 Firefox/103.0',
		Cookie: `PHPSESSID=${userId}_${process.env.PIXIV_TOKEN};`
	};

	await removeUnliked(posts);
	await tryDownloads(posts);
	await downloadTranslations(posts, { headers });
	console.log('Finished Sync');
	process.removeAllListeners();
};

if (process.env.RUN_SYNC_IMMEDIATELY) if (!process.env.WAIT_FOR_SETTINGS) sync();
else process.on('message', settings => sync(settings));

module.exports = sync;
