import React, { useContext, useMemo } from 'react';
import dayjs from 'dayjs';
import Card, {
	CardActions,
	CardBody,
	CardHeader,
	CardLabel,
	CardSubTitle,
	CardTitle,
} from '../../../../components/bootstrap/Card';
import Alert from '../../../../components/bootstrap/Alert';
import Spinner from '../../../../components/bootstrap/Spinner';
import Badge from '../../../../components/bootstrap/Badge';
import Button from '../../../../components/bootstrap/Button';
import Icon from '../../../../components/icon/Icon';
import AdminDashboardContext from '../../../../contexts/adminDashboardContext';
import AdminUsersContext from '../../../../contexts/adminUsersContext';
import { TColor } from '../../../../type/color-type';

interface IRecentActivityItem {
	id: string;
	label: string;
	timestamp: string;
	color: TColor;
	source: 'bookings' | 'claims' | 'payouts' | 'users';
	meta: string;
}

const RecentActivity = () => {
	const { bookings, payouts, claims, isLoading, error, lastUpdatedAt, refresh } =
		useContext(AdminDashboardContext);
	const { users } = useContext(AdminUsersContext);
	const items = useMemo<IRecentActivityItem[]>(() => {
		const nextItems: IRecentActivityItem[] = [];

		bookings.forEach((booking) => {
			nextItems.push({
				id: `booking-created-${booking.id}`,
				label: `${booking.renterName ?? 'A renter'} created a booking for ${booking.title}.`,
				timestamp: booking.createdAt,
				color: 'primary',
				source: 'bookings',
				meta: booking.location,
			});

			if (booking.moderation.flaggedForReviewAt) {
				nextItems.push({
					id: `booking-flagged-${booking.id}`,
					label: `${booking.title} chat was flagged for admin review.`,
					timestamp: booking.moderation.flaggedForReviewAt,
					color: 'warning',
					source: 'bookings',
					meta: `${booking.moderation.blockedContactAttempts} blocked attempt${
						booking.moderation.blockedContactAttempts === 1 ? '' : 's'
					}`,
				});
			}
		});

		payouts.forEach((payout) => {
			nextItems.push({
				id: `payout-requested-${payout.id}`,
				label: `${payout.ownerName ?? payout.ownerEmail ?? 'An owner'} requested a payout of ${payout.amount.toLocaleString()} JMD.`,
				timestamp: payout.requestedAt,
				color: 'warning',
				source: 'payouts',
				meta: payout.ownerEmail ?? 'Owner payout request',
			});

			if (payout.processedAt) {
				nextItems.push({
					id: `payout-processed-${payout.id}`,
					label: `Payout for ${payout.ownerName ?? payout.ownerEmail ?? 'an owner'} was processed.`,
					timestamp: payout.processedAt,
					color: 'success',
					source: 'payouts',
					meta: payout.referenceNote ?? 'Processed by admin',
				});
			}
		});

		claims.forEach((claim) => {
			nextItems.push({
				id: `claim-created-${claim.id}`,
				label: `Damage claim opened for ${claim.vehicleTitle}.`,
				timestamp: claim.createdAt,
				color: claim.status === 'Disputed' ? 'danger' : 'warning',
				source: 'claims',
				meta: `${claim.status} · ${claim.vehicleLocation || 'Location unavailable'}`,
			});

			if (claim.reviewedAt) {
				nextItems.push({
					id: `claim-reviewed-${claim.id}`,
					label: `Damage claim for ${claim.vehicleTitle} was ${claim.status.toLowerCase()}.`,
					timestamp: claim.reviewedAt,
					color: claim.status === 'Approved' ? 'success' : 'danger',
					source: 'claims',
					meta: claim.adminReviewNote ?? 'Admin review completed',
				});
			}
		});

		users.forEach((user) => {
			nextItems.push({
				id: `user-created-${user.id}`,
				label: `${user.name} joined as a ${user.role.toLowerCase()}.`,
				timestamp: user.createdAt,
				color: 'secondary',
				source: 'users',
				meta: user.email,
			});

			if (user.license?.reviewedAt) {
				nextItems.push({
					id: `license-reviewed-${user.id}`,
					label: `${user.name}'s driver's license was ${user.license.status}.`,
					timestamp: user.license.reviewedAt,
					color: user.license.status === 'verified' ? 'success' : 'danger',
					source: 'users',
					meta: user.license.rejectionReason ?? 'License verification updated',
				});
			}
		});

		const fortyEightHoursAgo = dayjs().subtract(48, 'hour');
		const recentItems = nextItems
			.filter((item) => dayjs(item.timestamp).isAfter(fortyEightHoursAgo))
			.sort((a, b) => dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf());

		if (recentItems.length) {
			return recentItems.slice(0, 6);
		}

		return nextItems
			.sort((a, b) => dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf())
			.slice(0, 6);
	}, [bookings, payouts, claims, users]);

	const sourceTotals = useMemo(
		() => [
			{ key: 'bookings', label: 'Bookings', count: bookings.length },
			{ key: 'claims', label: 'Claims', count: claims.length },
			{ key: 'payouts', label: 'Payouts', count: payouts.length },
			{ key: 'users', label: 'Users', count: users.length },
		],
		[bookings.length, claims.length, payouts.length, users.length],
	);

	const sourceBadgeColor: Record<IRecentActivityItem['source'], TColor> = {
		bookings: 'primary',
		claims: 'danger',
		payouts: 'warning',
		users: 'info',
	};

	return (
		<Card stretch>
			<CardHeader>
				<CardLabel icon='NotificationsActive' iconColor='warning'>
					<CardTitle tag='div' className='h5'>
						Recent Activity
					</CardTitle>
					<CardSubTitle tag='div' className='h6'>
						Live events from bookings, payouts, claims, and user verification
					</CardSubTitle>
				</CardLabel>
				<CardActions>
					<div className='d-flex align-items-center gap-2'>
						<Badge color='success' isLight>
							Live DB
						</Badge>
						<Button color='light' icon='Refresh' isLight onClick={() => refresh()}>
							Refresh
						</Button>
					</div>
				</CardActions>
			</CardHeader>
			<CardBody isScrollable>
				{error ? (
					<Alert color='danger' icon='ReportProblem' isLight className='mb-0'>
						{error}
					</Alert>
				) : isLoading ? (
					<div className='d-flex justify-content-center py-4'>
						<Spinner />
					</div>
				) : items.length ? (
					<>
						<div className='d-flex flex-wrap gap-2 mb-3'>
							{sourceTotals.map((item) => (
								<Badge key={item.key} color='light' isLight className='px-3 py-2'>
									{item.label}: {item.count}
								</Badge>
							))}
							{lastUpdatedAt && (
								<Badge color='success' isLight className='px-3 py-2'>
									Updated {dayjs(lastUpdatedAt).fromNow()}
								</Badge>
							)}
						</div>
						<div className='d-flex flex-column gap-3'>
							{items.map((activity) => (
								<div
									key={activity.id}
									className='rounded-4 border border-light-subtle bg-l10-light p-3'>
									<div className='d-flex justify-content-between align-items-start gap-3 mb-2'>
										<div className='d-flex align-items-center gap-2'>
											<span
												className={`bg-${activity.color} d-inline-block rounded-circle`}
												style={{ width: 10, height: 10 }}
											/>
											<Badge
												color={sourceBadgeColor[activity.source]}
												isLight>
												{activity.source}
											</Badge>
										</div>
										<div className='text-muted small text-end'>
											<div>{dayjs(activity.timestamp).format('MMM D, h:mm A')}</div>
											<div>{dayjs(activity.timestamp).fromNow()}</div>
										</div>
									</div>
									<div className='fw-semibold lh-sm mb-1'>{activity.label}</div>
									<div className='text-muted small d-flex align-items-center gap-2'>
										<Icon icon='Info' />
										<span>{activity.meta}</span>
									</div>
								</div>
							))}
						</div>
					</>
				) : (
					<div className='text-muted'>No recent admin activity yet.</div>
				)}
			</CardBody>
		</Card>
	);
};

export default RecentActivity;
