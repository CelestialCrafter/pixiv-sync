import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectPrivateEnabled, selectSelectedPost, resetPostsOverride, setPostsFromPixiv, addPostsFromPixiv, selectRefererEnabled } from '../../slices/posts';

import './PostSidebar.css';

const PostSidebar = () => {
	const privateEnabled = useSelector(selectPrivateEnabled);
	const post = useSelector(selectSelectedPost);
	const refererEnabled = useSelector(selectRefererEnabled);
	const dispatch = useDispatch();
	const [version, setVersion] = useState(Math.floor(Math.random() * Date.now()).toString(20));
	const [userId, setUserId] = useState('');
	const [page, setPage] = useState('home');
	const [followingPage, setFollowingPage] = useState(1);
	const [fetchedPages, setFetchedPages] = useState({ id: 0, pages: [] });
	let postSpecificNavigationComponent = null;
	let postSpecificImageComponent = null;

	const setNewPage = newPage => {
		const addIfSamePage = (page === newPage ? addPostsFromPixiv : setPostsFromPixiv);
		switch (newPage) {
			case 'home':
				dispatch(resetPostsOverride());
				break;
			case 'browse':
				dispatch(addIfSamePage(`http://${process.env.REACT_APP_API_IP}/browse/${version + '_b'}`));
				break;
			case 'following':
				dispatch(addIfSamePage(`http://${process.env.REACT_APP_API_IP}/following/${followingPage}`));
				break;
			case 'relevant':
				dispatch(setPostsFromPixiv(`http://${process.env.REACT_APP_API_IP}/relevant/${post.id}/${version + '_r'}`));
				break;
			case 'user':
				dispatch(setPostsFromPixiv(`http://${process.env.REACT_APP_API_IP}/user/${userId}`));
				break;
			default:
				return setNewPage('home');
		}

		if (page === newPage && page === 'following') setFollowingPage(prevValue => prevValue + 1);
		else setFollowingPage(1);

		setPage(newPage);
	};

	useEffect(() => {
		(async () => {
			if (post && !post.local) {
				const pages = await (await fetch(`http://localhost/pages/${post.id}`)).json();
				setFetchedPages({ id: post.id, pages: pages.map(page => page.url) });
			}
		})();
	}, [post]);

	if (post) {
		const fetchedPagesValid = post.id === fetchedPages.id;
		const date = post.updateDate.replace(/-/g, '/').replace(/T/g, '/').replace(/:/g, '/').replace(/\+.+/, '');
		const url = page => {
			if (fetchedPagesValid) return refererEnabled
				? fetchedPages.pages[page]
				: `http://${process.env.REACT_APP_API_IP}/imgproxy?url=${encodeURIComponent(fetchedPages.pages.p)}`;
			else return refererEnabled
				? `https://i.pximg.net/img-master/img/${date}/${post.id}_p${page}_master1200.jpg`
				: `http://${process.env.REACT_APP_API_IP}/imgproxy/${post.id}?date=${date.replace(/\//g, '_')}&page=${page}`;
		};
		const localUrl = p => `http://${process.env.REACT_APP_API_IP}/${privateEnabled ? 'private' : 'images'}/${post.id}-${p}.jpg`;

		postSpecificNavigationComponent = <button onClick={() => setNewPage('relevant')}>Relevant Posts</button>;
		postSpecificImageComponent = <ul className="imageList">
			{Array(fetchedPagesValid ? fetchedPages.pages.length : post.pageCount).fill(0).map((_, i) =>
				<img
					key={i}
					id={post.id}
					alt={`${post.id}`}
					style={{
						width: '100%'
					}}
					src={post?.local ? localUrl(i) : url(i)}
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
		<button onClick={() => setNewPage('user')}>User</button>
		{postSpecificNavigationComponent}
		<div className="version">
			<span>Page Version</span>
			<input maxLength={15} onChange={event => setVersion(event.target.value)} value={version} />
		</div>
		<div className="user">
			<span>User ID</span>
			<input onChange={event => setUserId(event.target.value)} value={userId} />
		</div>
		{postSpecificImageComponent}
	</React.Fragment>;
};

export default PostSidebar;
