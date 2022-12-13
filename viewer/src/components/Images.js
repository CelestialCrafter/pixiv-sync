import React, { useEffect, useState } from 'react';

import './Images.css';
import tags from '../data/tags.json';
import posts from '../data/posts.json';
import nsfwPosts from '../data/nsfwPosts.json';
const Image = React.lazy(() => import('./Image'));

const Images = ({ currentTags, nsfw }) => {
	const [usedPosts, setUsedPosts] = useState(nsfw ? nsfwPosts : posts);
	const forceLoadAmount = 25;
	const [loadedImages, setLoadedImages] = useState(Array(forceLoadAmount).fill(false));

	const postsWithTags = usedPosts.map(post => ({
		id: post.id,
		tagsEn: post.tags.map(tag => tags[tag]).filter(t => t)
	}));

	useEffect(() => setUsedPosts(nsfw ? nsfwPosts : posts), [nsfw]);

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
							nsfw={nsfw}
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
