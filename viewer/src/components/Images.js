import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectAllCurrentPosts } from '../slices/posts';
import { selectAllCurrentTags } from '../slices/tags';

import Image from './Image';
import tags from '../data/tags.json';

const debounce = (fn, delay) => {
	let timer;
	return (...args) => {
		clearTimeout(timer);
		timer = setTimeout(() => { fn.apply(this, args); }, delay);
	};
};

const Images = ({ imagesRef, ...contextMenuProps }) => {
	const [windowWidth, setWindowWidth] = useState(window.innerWidth);


	useEffect(() => {
		const listener = debounce(() => setWindowWidth(window.innerWidth), 100);

		window.addEventListener('resize', listener);
		return () => window.removeEventListener('resize', listener);
	}, []);

	const currentPosts = useSelector(selectAllCurrentPosts);
	const currentTags = useSelector(selectAllCurrentTags);

	const postsWithTags = currentPosts.map(post => ({
		id: post.id,
		tagsEn: post.tags.map(tag => tags[tag]).filter(t => t) || []
	}));

	const getCurrentPosts = () => {
		let visibleI = 0;
		return currentPosts.map((post, i) => {
			const postTags = postsWithTags.find(p => p.id === post.id).tagsEn;
			if (currentTags.every(tag => postTags.includes(tag))) {
				visibleI++;
				return <Image key={post.id} i={visibleI - 1} windowWidth={windowWidth} {...contextMenuProps} />;
			}
			return false;
		}).filter(img => img);
	};

	return <div ref={imagesRef} style={{ overflowY: 'hidden' }}>{getCurrentPosts()}</div>;
};

export default React.memo(Images);
