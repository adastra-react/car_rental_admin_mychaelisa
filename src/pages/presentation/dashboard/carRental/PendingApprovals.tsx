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
import Badge from '../../../../components/bootstrap/Badge';
import Alert from '../../../../components/bootstrap/Alert';
import Spinner from '../../../../components/bootstrap/Spinner';
import Button from '../../../../components/bootstrap/Button';
import Icon from '../../../../components/icon/Icon';
import { TColor } from '../../../../type/color-type';
import { jmdFormat } from '../../../../helpers/helpers';
import AdminDashboardContext from '../../../../contexts/adminDashboardContext';
import AdminUsersContext from '../../../../contexts/adminUsersContext';

const APPROVAL_BADGES: {
	[key: string]: {
		text: string;
		color?: TColor;
	};
} = {
	DISPUTE: { text: 'Dispute', color: 'danger' },
	PAYOUT: { text: 'Payout', color: 'warning' },
	LICENSE: { text: 'License', color: 'info' },
	BOOKING: { text: 'Booking', color: 'primary' },
};

interface IApprovalItem {
	id: string;
	title: string;
	date: string;
	description: string;
	owner?: string;
	badge: {
		text: string;
		color?: TColor;
	};
}

const PendingApprovals = () => {
	const { bookings, payouts, claims, isLoading, error, lastUpdatedAt, refresh } =
		useContext(AdminDashboardContext);
	const { users } = useContext(AdminUsersContext);
	const items = useMemo<IApprovalItem[]>(() => {
		const nextItems: IApprovalItem[] = [
			...claims
				.filter((claim) => claim.status === 'Submitted' || claim.status === 'Disputed')
				.map((claim) => ({
					id: `dispute-${claim.id}`,
					title: `Review damage claim for ${claim.vehicleTitle}`,
					date: claim.createdAt,
					description: `Booking #${claim.bookingId} · ${jmdFormat(claim.claimedAmount)}`,
					owner: claim.vehicleLocation,
					badge: APPROVAL_BADGES.DISPUTE,
				})),
			...payouts
				.filter((payout) => payout.status === 'Pending')
				.map((payout) => ({
					id: `payout-${payout.id}`,
					title: `Process payout for ${payout.ownerName ?? payout.ownerEmail ?? payout.ownerId}`,
					date: payout.requestedAt,
					description: jmdFormat(payout.amount),
					owner: payout.ownerEmail,
					badge: APPROVAL_BADGES.PAYOUT,
				})),
			...users
				.filter((user) => user.license?.status === 'pending')
				.map((user) => ({
					id: `license-${user.id}`,
					title: `Verify driver's license for ${user.name}`,
					date: user.createdAt,
					description: user.email,
					owner: `${user.role} account`,
					badge: APPROVAL_BADGES.LICENSE,
				})),
			...bookings
				.filter((booking) => booking.moderation.flaggedForReviewAt)
				.map((booking) => ({
					id: `booking-${booking.id}`,
					title: `Review chat moderation flag for ${booking.title}`,
					date: booking.moderation.flaggedForReviewAt ?? booking.updatedAt,
					description: `${booking.moderation.blockedContactAttempts} blocked contact attempt${
						booking.moderation.blockedContactAttempts === 1 ? '' : 's'
					}`,
					owner: booking.renterName ?? booking.ownerName,
					badge: APPROVAL_BADGES.BOOKING,
				})),
		];

		return nextItems.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());
	}, [bookings, payouts, claims, users]);

	const totalsByType = useMemo(
		() =>
			items.reduce<Record<string, number>>((acc, item) => {
				acc[item.badge.text] = (acc[item.badge.text] ?? 0) + 1;
				return acc;
			}, {}),
		[items],
	);

	return (
		<Card stretch>
			<CardHeader>
				<CardLabel icon='AssignmentTurnedIn' iconColor='danger'>
					<CardTitle tag='div' className='h5'>
						Pending Approvals
					</CardTitle>
					<CardSubTitle tag='div'>
						{isLoading
							? 'Loading live admin queues...'
							: `Live queue built from claims, payouts, users, and booking moderation`}
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
							<Badge color='primary' isLight className='px-3 py-2'>
								Total: {items.length}
							</Badge>
							{Object.entries(totalsByType).map(([type, count]) => (
								<Badge
									key={type}
									color={
										Object.values(APPROVAL_BADGES).find((badge) => badge.text === type)
											?.color ?? 'primary'
									}
									isLight
									className='px-3 py-2'>
									{type}: {count}
								</Badge>
							))}
							{lastUpdatedAt && (
								<Badge color='success' isLight className='px-3 py-2'>
									Updated {dayjs(lastUpdatedAt).fromNow()}
								</Badge>
							)}
						</div>
						<div className='d-flex flex-column gap-3'>
							{items.map((item) => (
								<div
									key={item.id}
									className='rounded-4 border border-light-subtle bg-l10-light p-3 position-relative overflow-hidden'>
									<div
										className={`position-absolute top-0 start-0 h-100 bg-${item.badge.color ?? 'primary'}`}
										style={{ width: 4 }}
									/>
									<div className='ps-2'>
										<div className='d-flex justify-content-between align-items-start gap-3 mb-2'>
											<div>
												<div className='fw-semibold lh-sm mb-1'>{item.title}</div>
												<div className='text-muted small'>{item.description}</div>
												{item.owner && (
													<div className='text-muted small mt-1 d-flex align-items-center gap-2'>
														<Icon icon='Person' />
														<span>{item.owner}</span>
													</div>
												)}
											</div>
											<Badge color={item.badge.color} isLight>
												{item.badge.text}
											</Badge>
										</div>
										<div className='text-muted small d-flex justify-content-between align-items-center'>
											<span>{dayjs(item.date).format('MMM D, h:mm A')}</span>
											<span>{dayjs(item.date).fromNow()}</span>
										</div>
									</div>
								</div>
							))}
						</div>
					</>
				) : (
					<div className='text-muted'>No approvals are waiting right now.</div>
				)}
			</CardBody>
		</Card>
	);
};

export default PendingApprovals;
