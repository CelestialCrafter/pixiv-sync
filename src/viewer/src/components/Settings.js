import React, { createRef } from 'react';
import { connect } from 'react-redux';
import { setSyncSettings } from '../slices/sync';

class Settings extends React.Component {
	constructor(props) {
		super(props);
		const settingRefs = {};

		Object.keys(props.settings).forEach(key => {
			settingRefs[key] = createRef();
		});

		this.state = settingRefs;

		this.handleSubmitSettings = this.handleSubmitSettings.bind(this);
	}

	handleSubmitSettings() {
		let newSettings = {};

		Object.keys(this.state).forEach(key => {
			const ref = this.state[key];
			if (ref.current) {
				const type = ref.current.getAttribute('type');

				if (type === 'number') newSettings[key] = Number(ref.current.value);
				else if (type === 'checkbox') newSettings[key] = ref.current.checked;
				else if (type === 'text') newSettings[key] = ref.current.value;
			}
		});

		this.props.dispatch(setSyncSettings(newSettings));
		this.props.socket.emit('setSettings', newSettings);
	}

	componentDidMount() {
		console.log(this.props.socket);
		this.props.socket.on('settings', newSettings => {
			Object.keys(this.state).forEach(key => {
				const ref = this.state[key];
				if (ref.current) ref.current.value = newSettings[key];
			});
			this.props.dispatch(setSyncSettings(newSettings));
		});
	}

	render() {
		const { settings } = this.props;

		return <React.Fragment>
			{Object.keys(settings).map(key => {
				const type = typeof settings[key];
				let formType = null;
				let style = {};

				if (type === 'number') {
					formType = 'number';
					style = { width: '20%' };
				} else if (type === 'string') {
					formType = 'text';
					style = { width: '50%' };
				} else if (type === 'boolean') formType = 'checkbox';

				return <div className="setting" key={key}>
					<span>{key}</span>
					<input
						style={style}
						ref={this.state[key]}
						type={formType}
						defaultValue={settings[key]}
					/>
				</div>;
			})}
			<button onClick={this.handleSubmitSettings}>Submit Settings</button>
		</React.Fragment>;
	}
}

const mapStateToProps = state => ({ settings: state.sync.settings });

export default connect(mapStateToProps)(Settings);