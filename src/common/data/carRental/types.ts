export type AdminUserRole = 'Owner' | 'Renter' | 'Admin';
export type AdminAccountStatus = 'active' | 'suspended' | 'banned';
export type AdminLicenseStatus = 'pending' | 'verified' | 'rejected';

export interface IAdminUser {
	id: string;
	name: string;
	email: string;
	phone: string;
	role: AdminUserRole;
	accountStatus: AdminAccountStatus;
	licenseStatus: AdminLicenseStatus;
	licenseRejectionReason?: string | null;
	averageRating: number;
	reviewCount: number;
	joinedAt: string;
	src: string;
	srcSet: string;
}

export type ListingStatus = 'draft' | 'active' | 'inactive' | 'removed';
export interface IVehicleListing {
	id: string;
	ownerId: string;
	ownerName: string;
	title: string;
	parish: string;
	dailyRate: number;
	weeklyRate: number;
	status: ListingStatus;
	averageRating: number;
	reviewCount: number;
	createdAt: string;
}

export type BookingStatus = 'Pending' | 'Confirmed' | 'Active' | 'Completed' | 'Cancelled';
export interface IAdminBooking {
	id: string;
	vehicleTitle: string;
	ownerName: string;
	renterName: string;
	status: BookingStatus;
	startDate: string;
	endDate: string;
	totalAmount: number;
	blockedContactAttempts: number;
	flaggedForReview: boolean;
}

export type DamageClaimStatus = 'Submitted' | 'Disputed' | 'Approved' | 'Rejected';
export interface IAdminDamageClaim {
	id: string;
	bookingId: string;
	vehicleTitle: string;
	ownerName: string;
	renterName: string;
	description: string;
	claimedAmount: number;
	status: DamageClaimStatus;
	createdAt: string;
}

export type PayoutRequestStatus = 'Pending' | 'Processed';
export interface IAdminPayoutRequest {
	id: string;
	ownerName: string;
	amount: number;
	status: PayoutRequestStatus;
	requestedAt: string;
	referenceNote?: string | null;
}
