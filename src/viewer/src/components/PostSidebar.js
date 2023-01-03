import React from 'react';

import { useSelector } from 'react-redux';
import { selectPrivateEnabled, selectSelectedPost } from '../slices/posts';

import './PostSidebar.css';

const RightSidebar = () => {
	const privateEnabled = useSelector(selectPrivateEnabled);
	const post = useSelector(selectSelectedPost);

	return post ? <React.Fragment>
		<button
			target="_blank"
			rel="noreferrer"
			onClick={() => window.open(`https://pixiv.net/artworks/${post.id}`, '_blank', 'noreferrer')}
		>Open Post</button>
		<button
			target="_blank"
			rel="noreferrer"
			onClick={() => alert('Not Implemented!')}
		>Open Relevant Posts</button>
		<ul className="imageList">
			{Array(post.pageCount).fill(0).map((_, i) =>
				<img
					key={i}
					id={post.id}
					alt={`${post.id}`}
					style={{
						width: '100%'
					}}
					src={`http://${process.env.REACT_APP_API_IP}/${privateEnabled ? 'private' : 'images'}/${post.id}-${i}.jpg`}
				/>
			)}
		</ul>
	</React.Fragment> : null;
};

export default RightSidebar;
