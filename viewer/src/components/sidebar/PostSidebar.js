import React, { useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { selectPrivateEnabled, selectSelectedPost, resetPostsOverride, setPostsFromPixiv, addPostsFromPixiv } from '../../slices/posts';

import './PostSidebar.css';

const PostSidebar = () => {
	const privateEnabled = useSelector(selectPrivateEnabled);
	const post = useSelector(selectSelectedPost);
	const dispatch = useDispatch();
	const [version, setVersion] = useState(Date.now().toString(16));
	const [page, setPage] = useState('home');
	const [followingPage, setFollowingPage] = useState(1);
	let postSpecificNavigationComponent = null;
	let postSpecificImageComponent = null;

	const setNewPage = newPage => {
		const addIfSamePage = (page === newPage ? addPostsFromPixiv : setPostsFromPixiv);
		switch (newPage) {
			case 'home':
				dispatch(resetPostsOverride());
				break;
			case 'browse':
				dispatch(addIfSamePage(`http://${process.env.REACT_APP_API_IP}/browse/${version}`));
				break;
			case 'following':
				dispatch(addIfSamePage(`http://${process.env.REACT_APP_API_IP}/following/${followingPage}`));
				break;
			case 'relevant':
				dispatch(setPostsFromPixiv(`http://${process.env.REACT_APP_API_IP}/relevant/${post.id}`));
				break;
			default:
				return setNewPage('home');
		}

		if (page === newPage && page === 'following') setFollowingPage(prevValue => prevValue + 1);
		else setFollowingPage(1);

		setPage(newPage);
	};

	if (post) {
		const date = post.updateDate.replace(/-/g, '/').replace(/T/g, '/').replace(/:/g, '/').replace(/\+.+/, '');
		const url = `https://i.pximg.net/img-master/img/${date}/${post.id}_p0_master1200.jpg`;
		// const url = `http://localhost/imgproxy/${date.replace(/\//g, '_')}/${post.id}`;
		const localUrl = `http://${process.env.REACT_APP_API_IP}/${privateEnabled ? 'private' : 'images'}/${post.id}-0.jpg`;

		postSpecificNavigationComponent = <button onClick={() => setNewPage('relevant')}>Relevant Posts</button>;
		postSpecificImageComponent = <ul className="imageList">
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
		</ul>;
	} else {
		postSpecificImageComponent = null;
		postSpecificNavigationComponent = null;
	}

	return <React.Fragment>
		<button onClick={() => setNewPage('home')}>Home</button>
		<button onClick={() => setNewPage('browse')}>Browse</button>
		<button onClick={() => setNewPage('following')}>Following</button>
		{postSpecificNavigationComponent}
		<div className="version">
			<span>Browse Version</span>
			<input maxLength={10} onChange={event => setVersion(event.target.value)} value={version} />
		</div>
		{postSpecificImageComponent}
	</React.Fragment>;
};

export default PostSidebar;
