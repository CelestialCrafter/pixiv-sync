import React, { useEffect, useState, useCallback } from 'react';
import Image from './Image';

const Images = ({ currentTags, privateImages, privatePosts, posts, tags, setForceUpdate }) => {
	const [usedPosts, setUsedPosts] = useState(privateImages ? privatePosts : posts);
	const forceLoadAmount = 25;
	const [loadedImages, setLoadedImages] = useState(Array(forceLoadAmount).fill(false));

	const [, updateState] = React.useState();
	const forceUpdate = useCallback(() => updateState({}), []);
	setForceUpdate(forceUpdate);

	const postsWithTags = usedPosts.map(post => ({
		id: post.id,
		tagsEn: post.tags.map(tag => tags[tag]).filter(t => t)
	}));

	useEffect(() => setUsedPosts(privateImages ? privatePosts : posts), [posts, privateImages, privatePosts]);

	return <div style={{ overflowY: 'hidden' }}>
		{
			usedPosts.map((post, i) => {
				const postTags = postsWithTags.find(p => p.id === post.id)?.tagsEn;
				if (currentTags.every(tag => postTags.includes(tag)))
					return Array(post.pageCount).fill(0).map((_page, postI) => <Image
						key={`${post.id}-${postI}`}
						forceLoad={i < forceLoadAmount && !loadedImages[i]}
						setLoaded={state => setLoadedImages(prevLoadedImages => {
							prevLoadedImages[i] = state;
							return prevLoadedImages;
						})}
						privateImages={privateImages}
						posts={usedPosts}
						tags={tags}
						i={i}
						page={postI}
					/>);
				return <React.Fragment key={post.id}></React.Fragment>;
			})
		}
	</div>
};

export default Images;
