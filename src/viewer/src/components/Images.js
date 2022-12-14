import React, { useEffect, useState } from 'react';
import Image from './Image';

import tags from '../data/tags.json';

import './Images.css';

const Images = ({ currentTags, privateImages, privatePosts, posts }) => {
	const [usedPosts, setUsedPosts] = useState(privateImages ? privatePosts : posts);
	const forceLoadAmount = 25;
	const [loadedImages, setLoadedImages] = useState(Array(forceLoadAmount).fill(false));

	const postsWithTags = usedPosts.map(post => ({
		id: post.id,
		tagsEn: post.tags.map(tag => tags[tag]).filter(t => t)
	}));

	useEffect(() => setUsedPosts(privateImages ? privatePosts : posts), [posts, privateImages, privatePosts]);

	return <div>
		<button onClick={() => {
			setUsedPosts(prevUsedPosts => [...prevUsedPosts.sort(() => Math.random() - 0.5), prevUsedPosts[0]]);
			setUsedPosts(prevUsedPosts => prevUsedPosts.slice(0, -1));
		}}>Randomize</button>
		<div className="images">
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
							i={i}
							page={postI}
						/>);
					return <React.Fragment key={post.id}></React.Fragment>;
				})
			}
		</div>
	</div>
};

export default Images;
