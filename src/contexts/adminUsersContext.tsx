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
import { fetchAllUsers, SerializedUser } from '../services/authApi';

export interface IAdminUsersContextProps {
	users: SerializedUser[];
	isLoading: boolean;
	error: string | null;
	refresh(): Promise<void>;
	patchUser(updated: SerializedUser): void;
}
const AdminUsersContext = createContext<IAdminUsersContextProps>({} as IAdminUsersContextProps);

interface IAdminUsersProviderProps {
	children: ReactNode;
}
export const AdminUsersProvider: FC<IAdminUsersProviderProps> = ({ children }) => {
	const { isAuthenticated } = useContext(AuthContext);
	const [users, setUsers] = useState<SerializedUser[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const refresh = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const fetched = await fetchAllUsers();
			setUsers(fetched);
		} catch (err) {
			setError(getApiErrorMessage(err));
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		if (isAuthenticated) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			refresh();
		} else {
			setUsers([]);
			setError(null);
			setIsLoading(false);
		}
	}, [isAuthenticated, refresh]);

	const patchUser = useCallback((updated: SerializedUser) => {
		setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
	}, []);

	return (
		<AdminUsersContext.Provider value={{ users, isLoading, error, refresh, patchUser }}>
			{children}
		</AdminUsersContext.Provider>
	);
};

export default AdminUsersContext;
