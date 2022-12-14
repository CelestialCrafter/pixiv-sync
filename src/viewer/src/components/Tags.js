import React, { useState } from 'react';

const Tags = ({ setCurrentTags, currentTags, setPrivateImages, privateImages, tags, posts, privatePosts }) => {
	const [filter, setFilter] = useState('');
	const [dropdown, setDropdown] = useState(false);

	const usedPosts = privateImages ? privatePosts : posts;
	const ctwp = [...new Set(usedPosts.map(post => {
		const postTags = post.tags.map(tag => tags[tag]).filter(t => t);
		if (currentTags.every(tag => postTags.includes(tag))) return postTags;
		return false;
	}).filter(t => t).flat())];

	return (
		<div>
			<button onClick={() => setDropdown(!dropdown)}>TOGGLE</button>
			{dropdown ? <div>
				<input type="text" value={filter} onChange={e => setFilter(e.target.value)} />
				<button
					style={{ border: '1px solid black', borderRadius: 5, padding: 3, margin: 2, backgroundColor: 'red' }}
					onClick={() => setCurrentTags([])}
				>RESET</button>
				<button
					style={{ border: '1px solid black', borderRadius: 5, padding: 3, margin: 2, backgroundColor: privateImages ? 'red' : 'inherit' }}
					onClick={() => setPrivateImages(!privateImages)}
				>PRIVATE</button>

				{ctwp.map(tag => {
					const styles = { border: '1px solid black', borderRadius: 5, padding: 3, margin: 2, backgroundColor: currentTags.includes(tag) ? 'lime' : 'inherit' };
					const toggleTag = () => setCurrentTags(currentTags.includes(tag) ? currentTags.filter(t => t !== tag) : [...currentTags, tag]);
					if (tag.toLowerCase().includes(filter)) return <button style={styles} key={tag} onClick={toggleTag}>{tag}</button>;
					return <React.Fragment></React.Fragment>;
				})}
			</div> : <React.Fragment></React.Fragment>}
		</div>
	);
};

export default Tags;