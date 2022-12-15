import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
	selectAllPosts,
	selectAllPrivatePosts,
	selectPrivateEnabled,
	setPosts,
	setPrivateEnabled,
	togglePrivateEnabled
} from '../slices/posts';
import { setCurrentPosts, selectAllCurrentPosts } from '../slices/cross';
import { selectAllCurrentTags, selectAllTags, setCurrentTags, toggleTag } from '../slices/tags';

const Tags = () => {
	const privatePosts = useSelector(selectAllPrivatePosts);
	const posts = useSelector(selectAllPosts);
	const tags = useSelector(selectAllTags);
	const currentTags = useSelector(selectAllCurrentTags);
	const currentPosts = useSelector(selectAllCurrentPosts);
	const privateEnabled = useSelector(selectPrivateEnabled);

	const dispatch = useDispatch();

	const [filter, setFilter] = useState('');
	const [dropdown, setDropdown] = useState(false);

	const postsWithTags = currentPosts.map(post => {
		return {
			id: post.id,
			tagsEn: post.tags.map(tag => tags[tag]).filter(t => t) || []
		};
	});

	const ctwp = [
		...new Set(Object.values(tags).filter(tag => postsWithTags.find(({ tagsEn }) => tagsEn.includes(tag))))
	];

	return (
		<React.Fragment>
			<button onClick={() => setDropdown(!dropdown)}>TOGGLE</button>

			{dropdown ? <div style={{ marginTop: 8 }}>
				<button
					style={{ backgroundColor: 'red' }}
					onClick={() => dispatch(setCurrentTags([]))}
				>RESET</button>
				<button
					style={{ backgroundColor: privateEnabled ? 'red' : 'inherit' }}
					onClick={() => {
						dispatch(togglePrivateEnabled());
						dispatch(setCurrentPosts());
					}}
				>PRIVATE</button>
				<button style={{ marginBottom: 8 }} onClick={() => {
					dispatch(setPosts(posts.sort(() => Math.random() - 0.5)));
					dispatch(setPrivateEnabled(privatePosts.sort(() => Math.random() - 0.5)));
				}}>Randomize</button>

				<input type="text" value={filter} onChange={e => setFilter(e.target.value)} />
				<div style={{
					maxHeight: '30vh',
					overflowY: 'auto',
					scrollbarWidth: 'none'
				}}>
					{ctwp.map(tag => {
						if (tag.toLowerCase().includes(filter)) return <button
							style={{ backgroundColor: currentTags.includes(tag) ? 'lime' : 'inherit' }}
							key={tag}
							onClick={() => dispatch(toggleTag(tag))}
						>{tag}</button>;
						return <React.Fragment></React.Fragment>;
					})}
				</div>
			</div> : <React.Fragment></React.Fragment>
			}
		</React.Fragment>
	);
};

export default Tags;