import React, { useEffect } from 'react';

const DefaultFooter = () => {
	useEffect(() => {
		document.documentElement.style.setProperty('--footer-height', '0px');
	}, []);

	return null;
};

export default DefaultFooter;
