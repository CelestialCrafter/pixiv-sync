const {
	readdirSync,
	cpSync,
	rmSync
} = require('fs');
const { join } = require('path');

const removeUnlikedWrapper = ({ privateImages, pictureDirectory }) => {
	const imagesPath = join(pictureDirectory, privateImages ? 'private' : 'images', 'pixiv');
	const images = readdirSync(imagesPath).filter(image => image.endsWith('.jpg')).map(image => image.replace('.jpg', ''));
	const deletedPath = join(pictureDirectory, privateImages ? 'private' : 'images', 'pixiv/deleted');
	const getUnliked = posts => images.filter(image => !posts.map(post => post.id).find(post => post === image.split('-')[0]));

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

	return removeUnliked;
};

module.exports = removeUnlikedWrapper;
