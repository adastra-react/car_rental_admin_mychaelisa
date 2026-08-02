import React, { useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Card, {
	CardActions,
	CardBody,
	CardHeader,
	CardLabel,
	CardSubTitle,
	CardTitle,
} from '../../../../components/bootstrap/Card';
import Button from '../../../../components/bootstrap/Button';
import Avatar, { AvatarGroup } from '../../../../components/Avatar';
import useDarkMode from '../../../../hooks/useDarkMode';
import { getInitialsAvatarUri } from '../../../../helpers/helpers';
import AdminUsersContext from '../../../../contexts/adminUsersContext';

const VerificationQueueCard = () => {
	const { darkModeStatus } = useDarkMode();
	const navigate = useNavigate();
	const handleOnClickToUsersPage = useCallback(() => navigate('/users'), [navigate]);

	const { users } = useContext(AdminUsersContext);
	const pendingReviews = users.filter((u) => u.license?.status === 'pending');
	const count = pendingReviews.length;

	return (
		<Card stretch>
			<CardHeader className='bg-transparent'>
				<CardLabel>
					<CardTitle tag='div' className='h5'>
						License Verification
					</CardTitle>
					<CardSubTitle tag='div' className='h6 text-muted'>
						{count} driver&apos;s license{count === 1 ? '' : 's'} awaiting review
					</CardSubTitle>
				</CardLabel>
				<CardActions>
					<Button
						icon='ArrowForwardIos'
						aria-label='Go to User Management'
						hoverShadow='default'
						color={darkModeStatus ? 'dark' : undefined}
						onClick={handleOnClickToUsersPage}
					/>
				</CardActions>
			</CardHeader>
			<CardBody>
				<AvatarGroup>
					{pendingReviews.map((user) => (
						<Avatar
							key={user.id}
							src={getInitialsAvatarUri(user.name)}
							userName={user.name}
						/>
					))}
				</AvatarGroup>
			</CardBody>
		</Card>
	);
};

export default VerificationQueueCard;
