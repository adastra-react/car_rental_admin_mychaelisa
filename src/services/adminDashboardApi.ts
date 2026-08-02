import apiClient from './apiClient';

export interface SerializedAdminBooking {
	id: string;
	vehicleId: string;
	ownerId: string;
	renterId: string;
	status: string;
	startDate: string;
	endDate: string;
	totalDays: number;
	totalAmount: number;
	ownerPayout: number;
	pickupPointId: string;
	dropoffPointId: string;
	title: string;
	location: string;
	ownerName?: string;
	renterName?: string;
	notes: string;
	moderation: {
		blockedContactAttempts: number;
		lastBlockedContactAt?: string;
		flaggedForReview: boolean;
		flaggedForReviewAt?: string;
	};
	createdAt: string;
	updatedAt: string;
}

export interface SerializedAdminPayout {
	id: string;
	ownerId: string;
	ownerName?: string;
	ownerEmail?: string;
	amount: number;
	status: string;
	referenceNote?: string;
	requestedAt: string;
	processedAt?: string;
}

export interface SerializedAdminDamageClaim {
	id: string;
	bookingId: string;
	vehicleId: string;
	ownerId: string;
	renterId: string;
	vehicleTitle: string;
	vehicleLocation: string;
	bookingStatus?: string;
	bookingStartDate?: string;
	bookingEndDate?: string;
	description: string;
	claimedAmount: number;
	photos: Array<{ url?: string; public_id?: string }>;
	status: string;
	disputeWindowEndsAt: string;
	disputeReason?: string;
	disputedAt?: string;
	adminReviewNote?: string;
	reviewedBy?: string;
	reviewedAt?: string;
	chargeStatus: string;
	chargeNote?: string;
	chargeTriggeredBy?: string;
	chargeTriggeredAt?: string;
	createdAt: string;
	updatedAt: string;
}

export interface SerializedAdminVehicle {
	id: string;
	ownerId: string;
	ownerName?: string;
	ownerEmail?: string;
	make: string;
	model: string;
	parishCode?: string | null;
	location: string;
	dailyRate: number;
	weeklyRate: number;
	status: string;
	reviewCount: number;
	averageRating: number;
	createdAt: string;
	updatedAt: string;
}

export interface SerializedPickupPoint {
	id: string;
	name: string;
	parishCode: string;
	parish: string;
	address: string;
	note: string;
	kind: 'parish' | 'airport';
	airportCode?: 'KIN' | 'MBJ';
}

export async function fetchAdminBookings(): Promise<SerializedAdminBooking[]> {
	const { data } = await apiClient.get('/bookings/admin');
	return data.bookings;
}

export async function fetchAdminPayouts(): Promise<SerializedAdminPayout[]> {
	const { data } = await apiClient.get('/payouts/admin');
	return data.payouts;
}

export async function fetchAdminDamageClaims(): Promise<SerializedAdminDamageClaim[]> {
	const { data } = await apiClient.get('/damage-claims');
	return data.claims;
}

export async function fetchAdminVehicles(): Promise<SerializedAdminVehicle[]> {
	const { data } = await apiClient.get('/vehicles/admin');
	return data.vehicles;
}

export async function fetchPickupPoints(): Promise<SerializedPickupPoint[]> {
	const { data } = await apiClient.get('/pickup-points');
	return data.pickupPoints;
}
