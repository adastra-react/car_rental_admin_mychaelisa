import React, { useContext, useMemo } from 'react';
import Card, {
	CardActions,
	CardBody,
	CardHeader,
	CardLabel,
	CardSubTitle,
	CardTitle,
} from '../../../../components/bootstrap/Card';
import Button from '../../../../components/bootstrap/Button';
import Popovers from '../../../../components/bootstrap/Popovers';
import Avatar, { AvatarGroup } from '../../../../components/Avatar';
import Spinner from '../../../../components/bootstrap/Spinner';
import Alert from '../../../../components/bootstrap/Alert';
import { jmdFormat } from '../../../../helpers/helpers';
import { getInitialsAvatarUri } from '../../../../helpers/helpers';
import AdminDashboardContext from '../../../../contexts/adminDashboardContext';

const PayoutsQueueCard = () => {
	const { payouts, isLoading, error } = useContext(AdminDashboardContext);
	const pendingPayouts = useMemo(
		() => payouts.filter((payout) => payout.status === 'Pending'),
		[payouts],
	);
	const pendingTotal = pendingPayouts.reduce((sum, payout) => sum + payout.amount, 0);

	return (
		<Card stretch>
			<CardHeader className='bg-transparent'>
				<CardLabel>
					<CardTitle tag='div' className='h5'>
						Payouts Queue
					</CardTitle>
					<CardSubTitle tag='div' className='h6 text-muted'>
						{isLoading
							? 'Loading payout requests...'
							: `${pendingPayouts.length} request${
									pendingPayouts.length === 1 ? '' : 's'
							  } · ${jmdFormat(pendingTotal)} total`}
					</CardSubTitle>
				</CardLabel>
				<CardActions>
					<Popovers
						desc='Payout management page is coming in a later update'
						trigger='hover'>
						<span>
							<Button icon='ArrowForwardIos' aria-label='View all' isDisable />
						</span>
					</Popovers>
				</CardActions>
			</CardHeader>
			<CardBody>
				{error ? (
					<Alert color='danger' icon='ReportProblem' isLight className='mb-0'>
						{error}
					</Alert>
				) : isLoading ? (
					<div className='d-flex justify-content-center py-4'>
						<Spinner />
					</div>
				) : pendingPayouts.length ? (
					<AvatarGroup>
						{pendingPayouts.map((payout) => (
							<Avatar
								key={payout.id}
								src={getInitialsAvatarUri(
									payout.ownerName ?? payout.ownerEmail ?? payout.ownerId,
								)}
								userName={payout.ownerName ?? payout.ownerEmail ?? payout.ownerId}
							/>
						))}
					</AvatarGroup>
				) : (
					<div className='text-muted'>No payout requests are waiting right now.</div>
				)}
			</CardBody>
		</Card>
	);
};

export default PayoutsQueueCard;
