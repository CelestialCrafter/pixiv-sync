const axios = require('axios');
const axiosRetry = require('axios-retry');

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

const getPostsWrapper = ({ userId, requestCooldown, privateImages }) => {
	const headers = {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:102.0) Gecko/20100101 Firefox/103.0',
		Cookie: `PHPSESSID=${userId}_${process.env.PIXIV_TOKEN};`
	};

	const generateURL = (offset = 0) =>
		`https://www.pixiv.net/ajax/user/${userId}/illusts/bookmarks?tag=&offset=${offset}&limit=100&rest=${privateImages ? 'hide' : 'show'}&lang=en`;

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

		const initialResponse = await axios.get(generateURL(), { headers }).catch(err => { throw new Error(err.toString()); });

		likes = initialResponse.data.body.total;
		posts = posts.concat(initialResponse.data.body.works)
			.filter(post => post.illustType === 0)
			.map(postFormat);
		console.log(`${Math.min(posts.length, likes)}/${likes}`);

		let prevPosts = 0;

		for (let i = 0; posts.length > prevPosts; i++) {
			prevPosts = posts.length;

			/* eslint-disable no-await-in-loop */
			// eslint-disable-next-line no-promise-executor-return
			await new Promise(res => setInterval(res, requestCooldown));
			const response = await axios.get(generateURL(i * maxLikesPerRequest), { headers });
			/* eslint-enable no-await-in-loop */

			const newPosts = response.data.body.works
				.filter(post => post.illustType === 0)
				.map(postFormat);
			posts = posts.concat(newPosts);

			console.log(`${Math.min(posts.length, likes)}/${Math.max(likes, posts.length)}`);
		}

		return posts.filter((post, i) => posts.map(p => p.id).indexOf(post.id) === i).filter(post => post.updateDate !== '1970-01-01T00:00:00+09:00');
	};

	return getPosts;
};

module.exports = getPostsWrapper;
