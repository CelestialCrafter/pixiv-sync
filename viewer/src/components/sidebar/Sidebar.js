import React, { useState } from 'react';

import './Sidebar.css';
import SettingsSidebar from './SettingsSidebar';
import PostSidebar from './PostSidebar';

const Sidebar = props => {
	const [hidden, setHidden] = useState(true);
	const [sidebar, setSidebar] = useState('left');

	const padding = sidebar === 'right' ? 0 : 4;

	return <div className="sidebarWrapper" style={{
		width: hidden ? 0 : '18%',
		height: hidden ? 0 : null,
		backgroundColor: hidden ? 'inherit' : '#0a0a0acc'
	}}>
		<button
			className="menuIcon"
			onClick={() => setHidden(prevHidden => !prevHidden)}
		><i className="material-icons">menu</i></button>
		<button
			className="menuIcon"
			style={{
				display: hidden ? 'none' : 'unset',
				border: 'none'
			}}
			onClick={() => setSidebar(prevSidebar => prevSidebar === 'left' ? 'right' : 'left')}
		><i className="material-icons">swap_horiz</i></button>

		<div className="sidebar" style={{
			display: hidden ? 'none' : 'block',
			paddingLeft: padding,
			paddingRight: padding,
			paddingBottom: padding
		}}>
			{sidebar === 'left' ? <SettingsSidebar {...props} /> : <PostSidebar {...props} />}
		</div>
	</div>;
};

export default Sidebar;
