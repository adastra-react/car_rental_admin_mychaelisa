import React, { useContext } from 'react';
import UserContact from '../../../../components/UserContact';
import AuthContext from '../../../../contexts/authContext';
import { getInitialsAvatarUri } from '../../../../helpers/helpers';

const DutyReviewerCard = () => {
	const { currentUser } = useContext(AuthContext);

	if (!currentUser) {
		return null;
	}

	return (
		<UserContact
			name={currentUser.name}
			position='On-duty reviewer'
			mail={currentUser.email}
			phone={currentUser.phone}
			src={getInitialsAvatarUri(currentUser.name)}
		/>
	);
};

export default DutyReviewerCard;
