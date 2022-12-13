/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const dotenv = require('dotenv');
const axios = require('axios');
const {
	readdirSync,
	rmSync,
	writeFileSync,
	readFileSync,
	existsSync,
	cpSync,
	createWriteStream
} = require('fs');
const { join } = require('path');
const { promisify } = require('util');
const downloadTranslations = require('./translations');
const sizeOf = promisify(require('image-size'));

dotenv.config();

const {
	useCache,
	privateImages,
	userId,
	requestCooldown,
	pictureDirectory
} = require('../config.json');

const imagesPath = join(pictureDirectory, privateImages ? 'nsfw' : 'images', 'pixiv');
const deletedPath = join(pictureDirectory, privateImages ? 'nsfw' : 'images', 'pixiv/deleted');
const images = readdirSync(imagesPath).filter(image => image.endsWith('.jpg')).map(image => image.replace('.jpg', ''));

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

const getUnliked = posts => images.filter(image => !posts.map(post => post.id).find(post => post === image.split('-')[0]));
const getNew = posts => posts.filter(post => !images.map(image => image.split('-')[0]).includes(post.id));
const getArtworkImageURLs = post => {
	const date = post.updateDate.replace(/-/g, '/').replace(/T/g, '/').replace(/:/g, '/').replace(/\+.+/, '');
	return Array(post.pageCount).fill('').map((_url, i) => `https://i.pximg.net/img-master/img/${date}/${post.id}_p${i}_master1200.jpg`);
};

const createDownloadRequest = (url, i, post) => async () => {
	try {
		const file = await axios.get(url, {
			headers: {
				Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
				Referer: 'https://www.pixiv.net/',
				'User-Agent': headers['User-Agent']
			},
			responseType: 'stream'
		});
		const stream = createWriteStream(join(imagesPath, `${post.id}-${i}.jpg`));
		file.data.pipe(stream);
		stream.on('finish', () => console.log(`Finished downloading ${post.id}-${i}`));
	} catch (err) {
		console.log(`Post ${post.id}`);
		console.error(err);
	}
};

const postCachePath = join(__dirname, '../data/posts.json');

const removeUnliked = async posts => {
	const unlikedPosts = getUnliked(posts);
	if (unlikedPosts.length > 0) {
		console.log(`Removing ${unlikedPosts.length} posts`);
		unlikedPosts.forEach(post => {
			console.log(`Removing ${post}`);
			cpSync(join(imagesPath, `${post}.jpg`), join(deletedPath, `${post}.jpg`));
			rmSync(join(imagesPath, `${post}.jpg`));
		});
	} else console.log('No posts to remove');
};

const downloadNew = async posts => {
	const newPosts = getNew(posts);
	if (newPosts.length > 0) {
		console.log(`Downloading ${newPosts.length} posts`);

		// Create all download functions
		const postRequests = [];
		let batch = 0;

		for (const post of newPosts) postRequests.push(
			getArtworkImageURLs(post).map((url, i) => createDownloadRequest(url, i, post))
		);

		// Split up the requests into batches of batchSize
		const batchSize = 15;
		const splitPostRequests = [];

		for (let i = 0; i < postRequests.length; i += batchSize) {
			const batchArray = postRequests.slice(i, i + batchSize);
			splitPostRequests.push(batchArray.flat());
		}

		for (const requestFunctions of splitPostRequests) {
			await Promise.all(requestFunctions.map(f => f()));
			console.log(`Finished batch ${batch}`);
			batch++;
		}
	} else console.log('No new posts to download');
};

const setImageSizes = async originalPosts => {
	const posts = originalPosts;
	console.log(`Setting ${posts.length} image sizes`);
	for (let postI = 0; postI < posts.length; postI++) {
		const post = posts[postI];
		for (let i = 0; i < post.pageCount; i++) try {
			const { width, height } = await sizeOf(join(imagesPath, `${post.id}-${i}.jpg`));
			posts[postI] = {
				...post,
				width,
				height
			};
		} catch (e) { }
	}

	writeFileSync(postCachePath, JSON.stringify(posts));
};

(async () => {
	let posts = null;

	// Check or create cache
	if (useCache && existsSync(postCachePath)) posts = JSON.parse(readFileSync(postCachePath));
	else {
		posts = await getPosts(userId);
		writeFileSync(postCachePath, JSON.stringify(posts));
	}

	await removeUnliked(posts);
	await downloadNew(posts);
	await setImageSizes(posts);
	await downloadTranslations(posts, { headers });
})();
