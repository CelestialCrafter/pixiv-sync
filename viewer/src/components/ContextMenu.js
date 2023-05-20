import React, { useEffect, useState } from 'react';
import './ContextMenu.css';
import get from 'axios';

const ContextMenu = ({ children }) => {
	const [post, setPost] = useState(null);
	const [points, setPoints] = useState({ x: 0, y: 0 });
	const [clicked, setClicked] = useState(false);

	const generateUrl = (like = true, priv = false, r18 = false) =>
		`http://${process.env.REACT_APP_API_IP}/${like ? 'like' : 'unlike'}/${post.id}?priv=${priv}&r18=${r18}`;

	const runAction = async (url, action) => {
		await get(url);
		setClicked(false);
	};

	useEffect(() => {
		const handleClick = () => setClicked(false);
		document.onclick = handleClick;
		return () => document.onclick = null;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const renderChildren = () =>
		React.Children.map(children, child => React.cloneElement(child, { setPoints, setClicked, setPost }));

	return <React.Fragment>
		{post ? <div onContextMenu={event => { event.preventDefault(); return false; }} className="contextMenu" style={{ display: clicked ? 'inherit' : 'none', left: points.x, top: points.y }}>
			<button onClick={({ button }) => button === 0 ? runAction(generateUrl(true), 'like') : 0}>Like</button>
			<button onClick={({ button }) => button === 0 ? runAction(generateUrl(true, true), 'like') : 0}>Like: Private</button>
			<button onClick={({ button }) => button === 0 ? runAction(generateUrl(true, true, true), 'like') : 0}>Like: Private R-18</button>
			<button onClick={({ button }) => button === 0 ? runAction(generateUrl(false), 'unlike') : 0}>Unlike</button>
			<button onClick={({ button }) => button === 0 ? navigator.clipboard.writeText(post.id) : 0}>Copy ID</button>
		</div> : null}
		{renderChildren()}
	</React.Fragment>;
};

export default ContextMenu;