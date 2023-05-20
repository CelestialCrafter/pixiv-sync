const downloadNewWrapper = require('./new');
const checkIntegrityWrapper = require('./integrity');
const setImageSizesWrapper = require('./imageSizes');

const tryDownloadsWrapper = config => {
	const { userId } = config;

	const setImageSizes = setImageSizesWrapper(config);
	const checkIntegrity = checkIntegrityWrapper(config);
	let downloadNew = downloadNewWrapper(config);

	const headers = {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:102.0) Gecko/20100101 Firefox/103.0',
		Cookie: `PHPSESSID=${userId}_${process.env.PIXIV_TOKEN};`
	};

	const tryDownloads = async (posts, retrys = 0) => {
		await downloadNew(posts, headers);
		await setImageSizes(posts);

		const corrupted = await checkIntegrity();
		if (!corrupted) return;

		downloadNew = downloadNewWrapper(config);
		if (retrys < 2) tryDownloads(posts, retrys + 1);
		else console.log(`Could not fix corruption after ${retrys + 1} download attempts`);
	};

	return tryDownloads;
};

module.exports = tryDownloadsWrapper;
