/* eslint-disable no-await-in-loop */
const {
	writeFileSync,
	readFileSync,
	existsSync
} = require('fs');
const { join } = require('path');
const axios = require('axios');

const tagCachePath = join(__dirname, '../../../data/tags.json');
const startFrom = null;

const downloadTranslationsWrapper = ({ translateTags, requestCooldown }) => {
	const downloadTranslations = async (postsOriginal, { headers }) => {
		let posts = postsOriginal;
		const startIndex = posts.indexOf(posts.find(post => post.id === startFrom));
		posts = startFrom ? posts.slice(startIndex) : posts;
		if (!translateTags) return console.log('Tag translation is disabled');

		const tags = existsSync(tagCachePath) ? JSON.parse(readFileSync(tagCachePath)) : {};
		let i = 0;

		// eslint-disable-next-line no-restricted-syntax
		for (const post of posts) try {
			const response = await axios.get(`https://www.pixiv.net/ajax/illust/${post.id}`, { headers });
			// eslint-disable-next-line no-promise-executor-return
			await new Promise(res => setInterval(res, requestCooldown));

			console.log(`Checking ${post.id}`);
			// very confusing, blame pixiv ajax api
			response.data.body.tags.tags.forEach(tag => {
				const nameJp = tag.tag;
				const nameEn = tag.translation?.en;

				if (!tags[nameJp] && nameEn) {
					tags[nameJp] = nameEn;
					console.log(`Found new tag! ${nameEn}`);
				}
			});

			if (i % 10 === 0) {
				console.log('Saved tags!');
				writeFileSync(tagCachePath, JSON.stringify(tags));
			}
			i++;
		} catch (e) {
			console.log(e.response);
			if (e.response.statusCode === 429) {
				console.log('Rate limited');
				break;
			}
		}
	};

	return downloadTranslations;
};

module.exports = downloadTranslationsWrapper;
