/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const dotenv = require('dotenv');
const axios = require('axios');
const {
	writeFileSync,
	readFileSync,
	existsSync
} = require('fs');
const { join } = require('path');

const downloadTranslations = require('./translations');
const setImageSizes = require('./imageSizes');
const removeUnliked = require('./unliked');
const downloadNew = require('./new');

dotenv.config();

const {
	useCache,
	privateImages,
	userId,
	requestCooldown
} = require('../config.json');

const postCachePath = join(__dirname, '../data/posts.json');

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

	return posts.filter((post, i) => posts.indexOf(post) === i).filter(post => post.updateDate !== '1970-01-01T00:00:00+09:00');
};

(async () => {
	let posts = null;

	// Check or create cache
	if (useCache && existsSync(postCachePath)) posts = JSON.parse(readFileSync(postCachePath));
	else {
		posts = await getPosts(userId);
		writeFileSync(postCachePath, JSON.stringify(posts));
	}

	removeUnliked(posts);
	downloadNew(posts, headers);
	setImageSizes(posts);
	downloadTranslations(posts, { headers });
})();
