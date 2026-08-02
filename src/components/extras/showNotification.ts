import { Store } from 'react-notifications-component';
import { JSX } from 'react';

const showNotification = (
	title: string | JSX.Element,
	message: string | JSX.Element,
	type: 'success' | 'danger' | 'info' | 'default' | 'warning' = 'default',
) => {
	Store.addNotification({
		title,
		message,
		type,
		insert: 'top',
		container: 'top-right',
		animationIn: ['animate__animated', 'animate__fadeIn'],
		animationOut: ['animate__animated', 'animate__fadeOut'],
		dismiss: {
			duration: 5000,
			pauseOnHover: true,
			onScreen: true,
			showIcon: true,
			waitForAnimation: true,
		},
	});
};

export default showNotification;
