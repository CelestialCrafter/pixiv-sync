import React from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { selectPrivateEnabled, selectSelectedPost, setRelevantPosts, setPostsOverride, updateCurrentPosts } from '../../slices/posts';

import './PostSidebar.css';

const RightSidebar = () => {
	const privateEnabled = useSelector(selectPrivateEnabled);
	const post = useSelector(selectSelectedPost);
	const dispatch = useDispatch();

	if (post) {
		const date = post.updateDate.replace(/-/g, '/').replace(/T/g, '/').replace(/:/g, '/').replace(/\+.+/, '');
		const url = `https://i.pximg.net/img-master/img/${date}/${post.id}_p0_master1200.jpg`;
		// const url = `http://localhost/imgproxy/${date.replace(/\//g, '_')}/${post.id}`;
		const localUrl = `http://${process.env.REACT_APP_API_IP}/${privateEnabled ? 'private' : 'images'}/${post.id}-0.jpg`;

		return <React.Fragment>
			<button onClick={() => window.open(`https://pixiv.net/artworks/${post.id}`, '_blank', 'noreferrer')}>Open Post</button>
			<button onClick={() => dispatch(setRelevantPosts(post.id))}>Open Relevant Posts</button>
			<button onClick={() => {
				dispatch(setPostsOverride([]));
				dispatch(updateCurrentPosts());
			}}>Close Relevant Posts</button>
			<ul className="imageList">
				{Array(post.pageCount).fill(0).map((_, i) =>
					<img
						key={i}
						id={post.id}
						alt={`${post.id}`}
						style={{
							width: '100%'
						}}
						src={post?.local ? localUrl : url}
					/>
				)}
			</ul>
		</React.Fragment>;
	} else return <React.Fragment></React.Fragment>;
};

export default RightSidebar;
