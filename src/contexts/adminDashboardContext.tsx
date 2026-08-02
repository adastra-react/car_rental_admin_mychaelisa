import React, {
	createContext,
	FC,
	ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react';
import AuthContext from './authContext';
import { getApiErrorMessage } from '../services/apiClient';
import {
	fetchAdminBookings,
	fetchAdminDamageClaims,
	fetchAdminPayouts,
	fetchAdminVehicles,
	SerializedAdminBooking,
	SerializedAdminDamageClaim,
	SerializedAdminPayout,
	SerializedAdminVehicle,
} from '../services/adminDashboardApi';

export interface IAdminDashboardContextProps {
	bookings: SerializedAdminBooking[];
	payouts: SerializedAdminPayout[];
	claims: SerializedAdminDamageClaim[];
	vehicles: SerializedAdminVehicle[];
	isLoading: boolean;
	error: string | null;
	lastUpdatedAt: string | null;
	refresh(): Promise<void>;
}

const AdminDashboardContext = createContext<IAdminDashboardContextProps>(
	{} as IAdminDashboardContextProps,
);

interface IAdminDashboardProviderProps {
	children: ReactNode;
}

export const AdminDashboardProvider: FC<IAdminDashboardProviderProps> = ({ children }) => {
	const { isAuthenticated } = useContext(AuthContext);
	const [bookings, setBookings] = useState<SerializedAdminBooking[]>([]);
	const [payouts, setPayouts] = useState<SerializedAdminPayout[]>([]);
	const [claims, setClaims] = useState<SerializedAdminDamageClaim[]>([]);
	const [vehicles, setVehicles] = useState<SerializedAdminVehicle[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

	const refresh = useCallback(async () => {
		if (!isAuthenticated) {
			setBookings([]);
			setPayouts([]);
			setClaims([]);
			setVehicles([]);
			setError(null);
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const [nextBookings, nextPayouts, nextClaims, nextVehicles] = await Promise.all([
				fetchAdminBookings(),
				fetchAdminPayouts(),
				fetchAdminDamageClaims(),
				fetchAdminVehicles(),
			]);
			setBookings(nextBookings);
			setPayouts(nextPayouts);
			setClaims(nextClaims);
			setVehicles(nextVehicles);
			setLastUpdatedAt(new Date().toISOString());
		} catch (err) {
			setError(getApiErrorMessage(err));
		} finally {
			setIsLoading(false);
		}
	}, [isAuthenticated]);

	useEffect(() => {
		void refresh();
	}, [refresh]);

	return (
		<AdminDashboardContext.Provider
			value={{
				bookings,
				payouts,
				claims,
				vehicles,
				isLoading,
				error,
				lastUpdatedAt,
				refresh,
			}}>
			{children}
		</AdminDashboardContext.Provider>
	);
};

export default AdminDashboardContext;
