import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectAllCurrentPosts } from '../slices/cross';
import { selectAllCurrentTags, selectAllTags } from '../slices/tags';

import Image from './Image';

const Images = () => {
	const tags = useSelector(selectAllTags);
	const currentPosts = useSelector(selectAllCurrentPosts);
	const currentTags = useSelector(selectAllCurrentTags);

	const forceLoadAmount = 25;
	const [loadedImages, setLoadedImages] = useState(Array(forceLoadAmount).fill(false));

	const postsWithTags = currentPosts.map(post => ({
		id: post.id,
		tagsEn: post.tags.map(tag => tags[tag]).filter(t => t) || []
	}));

	return <div style={{ overflowY: 'hidden' }}>
		{
			currentPosts.map((post, i) => {
				const postTags = postsWithTags.find(p => p.id === post.id).tagsEn;
				if (currentTags.every(tag => postTags.includes(tag)))
					return <Image
						key={post.id}
						forceLoad={i < forceLoadAmount && !loadedImages[i]}
						setLoaded={state => setLoadedImages(prevLoadedImages => {
							prevLoadedImages[i] = state;
							return prevLoadedImages;
						})}
						i={i}
					/>;
				return <React.Fragment key={post.id}></React.Fragment>;
			})
		}
	</div>;
};

export default Images;
