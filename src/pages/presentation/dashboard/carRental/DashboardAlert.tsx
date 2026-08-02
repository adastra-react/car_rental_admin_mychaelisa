import React, { useContext, useMemo } from 'react';
import Alert, { AlertHeading } from '../../../../components/bootstrap/Alert';
import Button from '../../../../components/bootstrap/Button';
import AdminDashboardContext from '../../../../contexts/adminDashboardContext';

const DashboardAlert = () => {
	const { claims, payouts, isLoading, error, refresh } = useContext(AdminDashboardContext);
	const { flaggedDisputesCount, pendingPayoutsCount } = useMemo(
		() => ({
			flaggedDisputesCount: claims.filter(
				(claim) => claim.status === 'Submitted' || claim.status === 'Disputed',
			).length,
			pendingPayoutsCount: payouts.filter((payout) => payout.status === 'Pending').length,
		}),
		[claims, payouts],
	);

	if (error) {
		return (
			<Alert icon='ReportProblem' isLight color='danger' borderWidth={0}>
				<AlertHeading tag='h2' className='h4'>
					Unable to load dashboard data
				</AlertHeading>
				<div className='d-flex justify-content-between align-items-center gap-3 flex-wrap'>
					<span>{error}</span>
					<Button color='danger' isLight onClick={() => refresh()}>
						Retry
					</Button>
				</div>
			</Alert>
		);
	}

	return (
		<Alert
			icon='ReportProblem'
			isLight
			color='warning'
			borderWidth={0}
			className='shadow-3d-warning'
			isDismissible>
			<AlertHeading tag='h2' className='h4'>
				{isLoading
					? 'Loading live admin workload...'
					: `${flaggedDisputesCount} dispute${
							flaggedDisputesCount === 1 ? '' : 's'
					  } need your review`}
			</AlertHeading>
			<span>
				{isLoading
					? 'Pulling payouts, claims, and booking moderation from the database.'
					: `${pendingPayoutsCount} owner payout request${
							pendingPayoutsCount === 1 ? '' : 's'
					  } are also waiting to be processed.`}
			</span>
		</Alert>
	);
};

export default DashboardAlert;
