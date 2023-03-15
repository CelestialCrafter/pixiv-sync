const { writeFileSync } = require('fs');
const { join } = require('path');
const { promisify } = require('util');
const sizeOf = promisify(require('image-size'));

const setImageSizesWrapper = ({ privateImages, pictureDirectory, dataDirectory }) => {
	const imagesPath = join(pictureDirectory, privateImages ? 'private' : 'images', 'pixiv');
	const postCachePath = join(dataDirectory, privateImages ? 'privatePosts.json' : 'posts.json');

	const setImageSizes = async originalPosts => {
		const posts = originalPosts;
		console.log(`Setting ${posts.length} image sizes`);
		for (let postI = 0; postI < posts.length; postI++) {
			const post = posts[postI];
			const sizes = [];

			for (let i = 0; i < post.pageCount; i++) try {
				// eslint-disable-next-line no-await-in-loop
				const { width, height } = await sizeOf(join(imagesPath, `${post.id}-${i}.jpg`));
				sizes.push({ width, height });
			} catch (e) { }

			posts[postI] = {
				...post,
				sizes
			};
		}

		writeFileSync(postCachePath, JSON.stringify(posts));
	};

	return setImageSizes;
};

module.exports = setImageSizesWrapper;
