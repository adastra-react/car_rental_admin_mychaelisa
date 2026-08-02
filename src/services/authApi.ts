import apiClient from './apiClient';

export type UserRole = 'Owner' | 'Renter' | 'Admin';
export type AccountStatus = 'active' | 'suspended' | 'banned';
export type LicenseStatus = 'pending' | 'verified' | 'rejected';

export interface SerializedLicense {
	url: string;
	public_id: string;
	status: LicenseStatus;
	rejectionReason?: string;
	reviewedAt?: string;
}

export interface SerializedDocument {
	url: string;
	public_id: string;
	label?: string;
}

export interface SerializedUser {
	id: string;
	email: string;
	role: UserRole;
	accountStatus: AccountStatus;
	name: string;
	phone: string;
	bio: string;
	license: SerializedLicense | null;
	documents: SerializedDocument[];
	notificationPreferences: {
		bookingUpdates: boolean;
		chatMessages: boolean;
		paymentAndClaims: boolean;
	};
	createdAt: string;
	updatedAt: string;
}

export async function login(
	email: string,
	password: string,
): Promise<{ token: string; user: SerializedUser }> {
	const { data } = await apiClient.post('/auth/login', { email, password });
	return data;
}

export async function fetchCurrentUser(): Promise<SerializedUser> {
	const { data } = await apiClient.get('/auth/me');
	return data.user;
}

export async function fetchAllUsers(): Promise<SerializedUser[]> {
	const { data } = await apiClient.get('/auth/users');
	return data.users;
}

export async function updateLicenseStatus(
	userId: string,
	status: LicenseStatus,
	rejectionReason?: string,
): Promise<SerializedUser> {
	const { data } = await apiClient.patch(`/auth/license-status/${userId}`, {
		status,
		rejectionReason,
	});
	return data.user;
}

export async function updateAccountStatus(
	userId: string,
	accountStatus: AccountStatus,
): Promise<SerializedUser> {
	const { data } = await apiClient.patch(`/auth/users/${userId}/status`, { accountStatus });
	return data.user;
}
