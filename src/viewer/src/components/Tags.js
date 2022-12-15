import React, { useState } from 'react';

const Tags = ({ setCurrentTags, currentTags, setPrivateImages, privateImages, tags, posts, privatePosts, setPosts, setPrivatePosts }) => {
	const [filter, setFilter] = useState('');
	const [dropdown, setDropdown] = useState(false);

	const usedPosts = privateImages ? privatePosts : posts;
	const ctwp = [...new Set(usedPosts.map(post => {
		const postTags = post.tags.map(tag => tags[tag]).filter(t => t);
		if (currentTags.every(tag => postTags.includes(tag))) return postTags;
		return false;
	}).filter(t => t).flat())];

	return (
		<React.Fragment>
			<button onClick={() => setDropdown(!dropdown)}>TOGGLE</button>

			{dropdown ? <div style={{ marginTop: 8 }}>
				<button
					style={{ backgroundColor: 'red' }}
					onClick={() => setCurrentTags([])}
				>RESET</button>
				<button
					style={{ backgroundColor: privateImages ? 'red' : 'inherit' }}
					onClick={() => setPrivateImages(!privateImages)}
				>PRIVATE</button>
				<button style={{ marginBottom: 8 }} onClick={() => {
					setPosts(prevPosts => [...prevPosts.sort(() => Math.random() - 0.5), prevPosts[0]]);
					setPosts(prevPosts => prevPosts.slice(0, -1));
					setPrivatePosts(prevPrivatePosts => [...prevPrivatePosts.sort(() => Math.random() - 0.5)]);
				}}>Randomize</button>

				<input type="text" value={filter} onChange={e => setFilter(e.target.value)} />
				<div style={{
					maxHeight: '30vh',
					overflowY: 'auto',
					scrollbarWidth: 'none'
				}}>
					{ctwp.map(tag => {
						const toggleTag = () => setCurrentTags(currentTags.includes(tag) ? currentTags.filter(t => t !== tag) : [...currentTags, tag]);
						if (tag.toLowerCase().includes(filter)) return <button
							style={{ backgroundColor: currentTags.includes(tag) ? 'lime' : 'inherit' }}
							key={tag}
							onClick={() => toggleTag()}
						>{tag}</button>;
						return <React.Fragment></React.Fragment>;
					})}
				</div>
			</div> : <React.Fragment></React.Fragment>
			}
		</React.Fragment >
	);
};

export default Tags;