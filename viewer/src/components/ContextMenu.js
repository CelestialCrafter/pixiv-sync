import React, { useEffect, useState } from 'react';

import './ContextMenu.css';

const ContextMenu = ({ children }) => {
	const [post, setPost] = useState({});
	const [points, setPoints] = useState({ x: 0, y: 0 });
	const [imageDetails, setImageDetails] = useState({ x: 0, y: 0 });
	const [clicked, setClicked] = useState(false);
	const [likeAction, setLikeAction] = useState('');
	const [error, setError] = useState(false);
	const animationTime = 700;

	const generateUrl = (like = true, priv = false, r18 = false) =>
		`http://${process.env.REACT_APP_API_IP}/${like ? 'like' : 'unlike'}/${post.id}?priv=${priv}&r18=${r18}`;

	const runAction = async (button, url, action) => {
		if (button !== 0) return;
		setClicked(false);
		const response = await fetch(url).catch(() => setError(true));
		if (!response.ok) setError(true);
		setLikeAction(action);
		setTimeout(() => {
			setLikeAction('');
			setError(false);
		}, animationTime);
	};

	const likeStyles = {
		opacity: likeAction === '' ? 0 : 1,
		left: imageDetails.x - 32,
		top: imageDetails.y - 32,
		animation: '',
		filter: ''
	};

	useEffect(() => {
		const handleClick = () => setClicked(false);
		document.onclick = handleClick;
		return () => document.onclick = null;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const renderChildren = () =>
		React.Children.map(children, child => React.cloneElement(child, {
			setPoints,
			setClicked,
			setPost,
			setImageDetails
		}));

	if (error) likeStyles.filter = 'invert(1)';
	else likeStyles.filter = '';
	if (likeAction === 'like') likeStyles.animation = `${animationTime}ms linear like`;
	else if (likeAction === 'unlike') likeStyles.animation = `${animationTime}ms linear unlike`;
	else likeStyles.animation = '';

	return <React.Fragment>
		<img
			style={likeStyles}
			className="like"
			src="like.svg"
			alt="Like/Unlike"
		/>
		{post ? <div onContextMenu={event => { event.preventDefault(); return false; }} className="contextMenu" style={{ display: clicked ? 'inherit' : 'none', left: points.x, top: points.y }}>
			<button onClick={({ button }) => runAction(button, generateUrl(true), 'like')}>Like</button>
			<button onClick={({ button }) => runAction(button, generateUrl(true, true), 'like')}>Like: Private</button>
			<button onClick={({ button }) => runAction(button, generateUrl(true, true, true), 'like')}>Like: Private R-18</button>
			<button onClick={({ button }) => runAction(button, generateUrl(false), 'unlike')}>Unlike</button>
			<button onClick={({ button }) => button === 0 ? navigator.clipboard.writeText(post.id) : 0}>Copy ID</button>
		</div> : null}
		{renderChildren()}
	</React.Fragment>;
};

export default ContextMenu;