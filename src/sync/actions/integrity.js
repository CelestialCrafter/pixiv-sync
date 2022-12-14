const { readFileSync, rmSync, readdirSync } = require('fs');
const { join } = require('path');

const {
	privateImages,
	pictureDirectory
} = require('../../../config.json');

const imagesPath = join(pictureDirectory, privateImages ? 'private' : 'images', 'pixiv');
const images = readdirSync(imagesPath, { withFileTypes: true }).filter(dirent => dirent.isFile()).map(dirent => dirent.name);

const checkIntegrity = async () => {
	console.log('Searching for corruption.');
	let corruptedCount = 0;

	images.forEach(filename => {
		try {
			const image = readFileSync(join(imagesPath, filename));
			const data = Uint8Array.from(image);
			// Valid JPGs end with FF D9 (255 127)
			const corrupted = !(data[data.length - 2] === 255 && data[data.length - 1] === 217);

			if (corrupted) {
				corruptedCount++;
				const id = filename.split('-')[0];
				images.filter(newFilename => newFilename.startsWith(id)).forEach(newFilename => rmSync(join(imagesPath, newFilename)));
				console.log(`Found corrupted image! ${filename}`);
			}
		} catch (err) {
			if (!err.toString().includes('ENOENT')) throw err;
		}
	});

	console.log(`Found ${corruptedCount} corrupted images.`);
	return corruptedCount > 0;
};

module.exports = checkIntegrity;
