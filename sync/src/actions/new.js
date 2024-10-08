const { createWriteStream, readdirSync } = require('fs');
const { join } = require('path');

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
			const { body: file } = await fetch(url, {
				headers: {
					Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
					Referer: 'https://www.pixiv.net/',
					'User-Agent': headers['User-Agent']
				}
			});
			const stream = createWriteStream(join(imagesPath, `${post.id}-${i}.jpg`));
			file.pipe(stream);
			await new Promise(res => { stream.on('finish', res); });
			console.log(`Finished downloading ${post.id}-${i}`);
		} catch (err) {
			console.log(`Post ${post.id}`);
			console.error(err.toString());
		}
	};

	const downloadNew = async (posts, headers) => {
		const newPosts = getNew(posts);
		if (newPosts.length > 0) {
			console.log(`Downloading ${newPosts.length} posts`);

			// Create all download functions
			const postRequests = [];
			let batchNum = 0;

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

			/* eslint-disable no-await-in-loop */
			// eslint-disable-next-line no-restricted-syntax
			for (const requestFunctions of splitPostRequests) {
				await Promise.all(requestFunctions.map(f => f()));
				console.log(`Finished batch ${batchNum}`);
				batchNum++;
				await new Promise(res => { setTimeout(res, requestCooldown); });
			}
			/* eslint-enable no-await-in-loop */
		} else console.log('No new posts to download');
	};

	return downloadNew;
};

module.exports = downloadNewWrapper;
