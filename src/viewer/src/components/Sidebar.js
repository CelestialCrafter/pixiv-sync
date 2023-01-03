import React, { useState } from 'react';

import './Sidebar.css';
import LeftSidebar from './SettingsSidebar';
import PostSidebar from './PostSidebar';

const Sidebar = props => {
	const [hidden, setHidden] = useState(true);
	const [sidebar, setSidebar] = useState('left');

	const padding = sidebar === 'right' ? 0 : 4;

	return <div className="sidebarWrapper" style={{
		width: hidden ? 0 : sidebar === 'right' ? '20%' : '15%',
		height: hidden ? 0 : null,
		backgroundColor: hidden ? 'inherit' : 'white'
	}}>
		<button
			onClick={() => setHidden(prevHidden => !prevHidden)}
			style={{ border: 'none' }}
		><i className="material-icons">menu</i></button>
		<button
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
			paddingBottom: padding,
			paddingTop: 0,
			marginBottom: 8,
		}}>
			{sidebar === 'left' ? <LeftSidebar {...props} /> : <PostSidebar {...props} />}
		</div>
	</div>;
};

export default Sidebar;
