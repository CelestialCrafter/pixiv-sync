import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
	selectPrivateEnabled,
	togglePrivateEnabled
} from '../../../slices/posts';
import { updateCurrentPosts, selectAllCurrentPosts } from '../../../slices/posts';
import { selectAllCurrentTags, setCurrentTags, toggleTag } from '../../../slices/tags';

import tags from '../../../data/tags.json';

const Tags = () => {
	const currentTags = useSelector(selectAllCurrentTags);
	const currentPosts = useSelector(selectAllCurrentPosts);
	const privateEnabled = useSelector(selectPrivateEnabled);

	const dispatch = useDispatch();

	const [filter, setFilter] = useState('');
	const [dropdown, setDropdown] = useState(false);

	const ctwp = useMemo(() => {
		const postsWithTags = currentPosts.map(post => ({
			id: post.id,
			tagsEn: post.tags.map(tag => tags[tag]).filter(t => t) || []
		}));

		return [
			...new Set(Object.values(tags).filter(tag => postsWithTags.find(({ tagsEn }) => tagsEn.includes(tag))))
		];
	}, [currentPosts]);

	return (
		<React.Fragment>
			<button
				style={{ backgroundColor: privateEnabled ? 'red' : 'inherit' }}
				onClick={() => {
					dispatch(togglePrivateEnabled());
					dispatch(updateCurrentPosts());
				}}
			>Private</button>
			<button
				style={{ backgroundColor: dropdown ? 'red' : 'inherit' }}
				onClick={() => setDropdown(prevDropdown => !prevDropdown)}
			>Toggle Tags</button>

			<div style={{ display: dropdown ? 'initial' : 'none' }}>
				<button
					style={{ backgroundColor: '#fa0000' }}
					onClick={() => {
						dispatch(setCurrentTags([]));
						dispatch(updateCurrentPosts());
					}}
				>Reset</button>

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
							onClick={() => {
								dispatch(toggleTag(tag));
								dispatch(updateCurrentPosts());
							}}
						>{tag}</button>;
						return <React.Fragment></React.Fragment>;
					})}
				</div>
			</div>
		</React.Fragment>
	);
};

export default Tags;