const { writeFileSync } = require('fs');
const { join } = require('path');
const { promisify } = require('util');
const sizeOf = promisify(require('image-size'));

const {
	privateImages,
	pictureDirectory
} = require('../config.json');

const imagesPath = join(pictureDirectory, privateImages ? 'nsfw' : 'images', 'pixiv');
const postCachePath = join(__dirname, '../data/posts.json');

const setImageSizes = async originalPosts => {
	const posts = originalPosts;
	console.log(`Setting ${posts.length} image sizes`);
	for (let postI = 0; postI < posts.length; postI++) {
		const post = posts[postI];
		for (let i = 0; i < post.pageCount; i++) try {
			// eslint-disable-next-line no-await-in-loop
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

module.exports = setImageSizes;
