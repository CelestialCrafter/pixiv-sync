/* eslint-disable no-await-in-loop */
const {
	writeFileSync,
	readFileSync,
	existsSync
} = require('fs');
const { join } = require('path');
const axios = require('axios');

const downloadIndividualWrapper = ({
	startIndividualFrom,
	downloadIndividualData,
	requestCooldown,
	dataDirectory
}) => {
	const tagCachePath = join(dataDirectory, 'tags.json');
	const likeCachePath = join(dataDirectory, 'likes.json');

	const downloadIndividual = async (postsOriginal, { headers }) => {
		let posts = postsOriginal;
		const startIndex = posts.indexOf(posts.find(post => post.id === startIndividualFrom));
		posts = startIndividualFrom ? posts.slice(startIndex) : posts;
		if (!downloadIndividualData) return console.log('Tag translation is disabled');

		const tags = existsSync(tagCachePath) ? JSON.parse(readFileSync(tagCachePath)) : {};
		const likes = existsSync(likeCachePath) ? JSON.parse(readFileSync(likeCachePath)) : {};
		let i = 0;

		// eslint-disable-next-line no-restricted-syntax
		for (const post of posts) try {
			// eslint-disable-next-line no-promise-executor-return
			await new Promise(res => setInterval(res, requestCooldown));
			const response = await axios.get(`https://www.pixiv.net/ajax/illust/${post.id}`, { headers });

			likes[post.id] = response.data.body.bookmarkCount;

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
				writeFileSync(likeCachePath, JSON.stringify(likes));
			}
			i++;
		} catch (e) {
			if (e.response.statusCode === 429) {
				console.log('Rate limited');
				break;
			}
		}

		console.log('Saved tags!');
		writeFileSync(tagCachePath, JSON.stringify(tags));
		writeFileSync(likeCachePath, JSON.stringify(likes));
	};

	return downloadIndividual;
};

module.exports = downloadIndividualWrapper;
