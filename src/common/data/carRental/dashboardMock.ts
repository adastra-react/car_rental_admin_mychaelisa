import { TColor } from '../../../type/color-type';
import ADMIN_USERS from './adminUsers';
import { IAdminDamageClaim, IAdminPayoutRequest } from './types';

// TODO: replace with real aggregate calls once admin dashboard endpoints exist on car-rental-server.
export const DASHBOARD_STATS = {
	activeBookings: 18,
	activeBookingsLastWeek: 14,
	revenueThisMonthJmd: 742500,
	revenueLastMonthJmd: 611200,
	flaggedDisputesCount: 4,
	pendingPayoutsCount: 6,
	pendingPayoutsTotalJmd: 218400,
};

// Owners/renters whose driver's license photo is still awaiting manual review
// (automated ID verification is out of MVP scope, so this is a real admin queue).
export const DASHBOARD_PENDING_LICENSE_REVIEWS = ADMIN_USERS.filter(
	(u) => u.licenseStatus === 'pending',
);

export const RECENT_ACTIVITY: { label: string; hoursAgo: number; color: TColor }[] = [
	{
		label: 'Kadeen Brown submitted a new booking request for a Toyota Axio.',
		hoursAgo: 0.4,
		color: 'primary',
	},
	{
		label: 'Damage claim for booking #1042 was flagged for admin review.',
		hoursAgo: 3.1,
		color: 'danger',
	},
	{
		label: 'Payout request from Tamika Fletcher marked as Processed.',
		hoursAgo: 6.8,
		color: 'success',
	},
	{
		label: 'Devon Salmon flagged for a second contact-info sharing attempt in chat.',
		hoursAgo: 22,
		color: 'warning',
	},
	{ label: 'Owen Facey booking #1038 moved to Completed.', hoursAgo: 30, color: 'info' },
	{
		label: "Latoya Morrison's driver's license submitted for review.",
		hoursAgo: 48,
		color: 'secondary',
	},
];

export const DASHBOARD_FLAGGED_DISPUTES: IAdminDamageClaim[] = [
	{
		id: 'd1',
		bookingId: '1042',
		vehicleTitle: '2021 Honda Fit',
		ownerName: 'Marlon Reid',
		renterName: 'Owen Facey',
		description: 'Renter disputes scratch damage claim on rear bumper.',
		claimedAmount: 15000,
		status: 'Disputed',
		createdAt: '2026-07-28',
	},
	{
		id: 'd2',
		bookingId: '1039',
		vehicleTitle: '2020 Toyota Axio',
		ownerName: 'Andre Campbell',
		renterName: 'Kemar Thompson',
		description: 'Cracked windscreen reported after drop-off.',
		claimedAmount: 32000,
		status: 'Submitted',
		createdAt: '2026-07-29',
	},
	{
		id: 'd3',
		bookingId: '1031',
		vehicleTitle: '2019 Nissan Note',
		ownerName: 'Shauna-Kaye Grant',
		renterName: 'Simone Blackwood',
		description: 'Interior stain claim, renter disputes fault.',
		claimedAmount: 8000,
		status: 'Disputed',
		createdAt: '2026-07-30',
	},
	{
		id: 'd4',
		bookingId: '1027',
		vehicleTitle: '2022 Suzuki Swift',
		ownerName: 'Tamika Fletcher',
		renterName: 'Rohan Powell',
		description: 'Alloy rim damage reported by owner.',
		claimedAmount: 21500,
		status: 'Submitted',
		createdAt: '2026-07-30',
	},
];

export const DASHBOARD_PENDING_PAYOUTS: IAdminPayoutRequest[] = [
	{
		id: 'p1',
		ownerName: 'Andre Campbell',
		amount: 48000,
		status: 'Pending',
		requestedAt: '2026-07-27',
	},
	{
		id: 'p2',
		ownerName: 'Marlon Reid',
		amount: 32500,
		status: 'Pending',
		requestedAt: '2026-07-28',
	},
	{
		id: 'p3',
		ownerName: 'Tamika Fletcher',
		amount: 61200,
		status: 'Pending',
		requestedAt: '2026-07-29',
	},
	{
		id: 'p4',
		ownerName: 'Shauna-Kaye Grant',
		amount: 27800,
		status: 'Pending',
		requestedAt: '2026-07-30',
	},
	{
		id: 'p5',
		ownerName: 'Latoya Morrison',
		amount: 18900,
		status: 'Pending',
		requestedAt: '2026-07-30',
	},
	{
		id: 'p6',
		ownerName: 'Andre Campbell',
		amount: 30000,
		status: 'Pending',
		requestedAt: '2026-07-31',
	},
];
