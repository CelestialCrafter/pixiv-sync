/* eslint-disable no-await-in-loop */
const dotenv = require('dotenv');
const axios = require('axios');
const {
	writeFileSync,
	readFileSync,
	existsSync
} = require('fs');
const { join } = require('path');

const downloadTranslations = require('./actions/translations');
const setImageSizes = require('./actions/imageSizes');
const removeUnliked = require('./actions/unliked');
const downloadNew = require('./actions/new');
const checkIntegrity = require('./actions/integrity');

dotenv.config();

let {
	/* eslint-disable prefer-const */
	useCache,
	privateImages,
	userId,
	requestCooldown
	/* eslint-enable prefer-const */
} = require('../../config.json');

const postCachePath = join(__dirname, '../../data/', privateImages ? 'privatePosts.json' : 'posts.json');

const generateURL = (offset = 0) =>
	`https://www.pixiv.net/ajax/user/${userId}/illusts/bookmarks?tag=&offset=${offset}&limit=100&rest=${privateImages ? 'hide' : 'show'}&lang=en`;

const headers = {
	'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:102.0) Gecko/20100101 Firefox/103.0',
	Cookie: `PHPSESSID=${userId}_${process.env.PIXIV_TOKEN};`
};

const getPosts = async () => {
	const maxLikesPerRequest = 100;
	let posts = [];
	let likes = 0;
	const postFormat = post => ({
		id: post.id,
		url: post.url,
		updateDate: post.updateDate,
		pageCount: post.pageCount,
		tags: post.tags
	});

	const initialResponse = await axios.get(generateURL(), { headers }).catch(err => {
		console.log(err.request);
		throw new Error(err.toString());
	});

	likes = initialResponse.data.body.total;
	posts = posts.concat(initialResponse.data.body.works)
		.filter(post => post.illustType === 0)
		.map(postFormat);
	console.log(`${Math.min(posts.length, likes)}/${likes}`);

	let prevPosts = 0;

	for (let i = 0; posts.length > prevPosts; i++) {
		prevPosts = posts.length;
		// eslint-disable-next-line no-promise-executor-return
		await new Promise(res => setInterval(res, requestCooldown));
		const response = await axios.get(generateURL(i * maxLikesPerRequest), { headers });

		const newPosts = response.data.body.works
			.filter(post => post.illustType === 0)
			.map(postFormat);
		posts = posts.concat(newPosts);

		console.log(`${Math.min(posts.length, likes)}/${Math.max(likes, posts.length)}`);
	}

	return posts.filter((post, i) => posts.map(p => p.id).indexOf(post.id) === i).filter(post => post.updateDate !== '1970-01-01T00:00:00+09:00');
};

const tryDownloads = async (posts, retrys = 0) => {
	await downloadNew(posts, headers);
	await setImageSizes(posts);

	const corrupted = await checkIntegrity();
	if (!corrupted) return;

	if (retrys < 2) tryDownloads(posts, headers);
	else console.log(`Could not fix corruption after ${retrys + 1} download attempts`);
};

const sync = async overrideSettings => {
	Object.keys(overrideSettings).forEach(key => {
		// eslint-disable-next-line global-require
		const config = require('../../config.json');
		if (!Object.keys(config).includes(key)) return;

		const value = overrideSettings[key];

		let prefix = '';
		let suffix = '';

		if (typeof config[key] === 'string') {
			prefix = '"';
			suffix = '"';
		}

		// Sets the override key to the override value.
		// instead of doing somethiSng like config.userId, it overrides the userId variable directly by using eval to set variables directly

		// eslint-disable-next-line no-eval
		eval(`${key} = ${prefix}${value}${suffix}`);
	});

	let posts = null;

	// Check or create cache
	if (useCache && existsSync(postCachePath)) posts = JSON.parse(readFileSync(postCachePath));
	else {
		posts = await getPosts(userId);
		writeFileSync(postCachePath, JSON.stringify(posts));
	}

	await removeUnliked(posts);
	await tryDownloads(posts);
	await downloadTranslations(posts, { headers });
	console.log('Finished Sync');
};

if (process.env.RUN_SYNC_IMMEDIATELY) if (!process.env.WAIT_FOR_SETTINGS) sync();
else process.on('message', settings => sync(settings));

module.exports = sync;
