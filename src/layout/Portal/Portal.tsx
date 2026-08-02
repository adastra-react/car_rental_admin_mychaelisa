import ReactDOM from 'react-dom';
import React, { FC, Fragment, ReactNode, useContext } from 'react';
import ThemeContext from '../../contexts/themeContext';

interface IPortalProps {
	children: ReactNode;
	id?: string;
}
const Portal: FC<IPortalProps> = ({ id = 'portal-root', children }) => {
	const { fullScreenStatus } = useContext(ThemeContext);

	const mount = document.getElementById(id);
	if (fullScreenStatus) return <Fragment>{children}</Fragment>;
	if (mount) return ReactDOM.createPortal(children, mount);
	return null;
};

export default Portal;
