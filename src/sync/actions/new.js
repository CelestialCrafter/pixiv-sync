const { createWriteStream, readdirSync } = require('fs');
const { join } = require('path');
const axios = require('axios');

const downloadNewWrapper = ({
	batchSize,
	privateImages,
	requestCooldown,
	pictureDirectory
}) => {
	const imagesPath = join(pictureDirectory, privateImages ? 'private' : 'images', 'pixiv');
	const images = readdirSync(imagesPath).filter(image => image.endsWith('.jpg')).map(image => image.replace('.jpg', ''));

	const getNew = posts => posts.filter(post => !images.map(image => image.split('-')[0]).includes(post.id));
	const getArtworkImageURLs = post => {
		const date = post.updateDate.replace(/-/g, '/').replace(/T/g, '/').replace(/:/g, '/').replace(/\+.+/, '');
		return Array(post.pageCount).fill('').map((_url, i) => `https://i.pximg.net/img-master/img/${date}/${post.id}_p${i}_master1200.jpg`);
	};

	const createDownloadRequest = (url, i, post, headers) => async () => {
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

	const downloadNew = async (posts, headers) => {
		const newPosts = getNew(posts);
		if (newPosts.length > 0) {
			console.log(`Downloading ${newPosts.length} posts`);

			// Create all download functions
			const postRequests = [];
			let batch = 0;

			// eslint-disable-next-line no-restricted-syntax
			for (const post of newPosts) postRequests.push(
				getArtworkImageURLs(post).map((url, i) => createDownloadRequest(url, i, post, headers))
			);

			// Split up the requests into batches of batchSize
			const splitPostRequests = [];

			for (let i = 0; i < postRequests.length; i += batchSize) {
				const batchArray = postRequests.slice(i, i + batchSize);
				splitPostRequests.push(batchArray.flat());
			}

			await Promise.all(splitPostRequests.map(async requestFunctions => {
				const promises = await Promise.all(requestFunctions.map(f => f()));
				console.log(`Finished batch ${batch}`);
				batch++;
				// eslint-disable-next-line no-promise-executor-return
				await new Promise(res => setTimeout(res, requestCooldown));
				return promises;
			}));
		} else console.log('No new posts to download');
	};

	return downloadNew;
};

module.exports = downloadNewWrapper;
