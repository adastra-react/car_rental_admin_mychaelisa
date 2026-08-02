import React, { createContext, FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { TOKEN_STORAGE_KEY, getApiErrorMessage } from '../services/apiClient';
import { fetchCurrentUser, login as loginRequest, SerializedUser } from '../services/authApi';

export interface IAuthContextProps {
	token: string | null;
	currentUser: SerializedUser | null;
	isAuthenticated: boolean;
	isAuthLoading: boolean;
	login(email: string, password: string): Promise<void>;
	logout(): void;
}
const AuthContext = createContext<IAuthContextProps>({} as IAuthContextProps);

interface IAuthContextProviderProps {
	children: ReactNode;
}
export const AuthContextProvider: FC<IAuthContextProviderProps> = ({ children }) => {
	const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_STORAGE_KEY));
	const [currentUser, setCurrentUser] = useState<SerializedUser | null>(null);
	const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);

	const logout = () => {
		localStorage.removeItem(TOKEN_STORAGE_KEY);
		setToken(null);
		setCurrentUser(null);
	};

	useEffect(() => {
		const onUnauthorized = () => logout();
		window.addEventListener('auth:unauthorized', onUnauthorized);
		return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
	}, []);

	useEffect(() => {
		if (token && !currentUser) {
			fetchCurrentUser()
				.then(setCurrentUser)
				.catch(() => logout());
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [token]);

	const login = async (email: string, password: string) => {
		setIsAuthLoading(true);
		try {
			const { token: newToken, user } = await loginRequest(email, password);
			localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
			setToken(newToken);
			setCurrentUser(user);
		} catch (err) {
			throw new Error(getApiErrorMessage(err), { cause: err });
		} finally {
			setIsAuthLoading(false);
		}
	};

	const value = useMemo(
		() => ({
			token,
			currentUser,
			isAuthenticated: token !== null,
			isAuthLoading,
			login,
			logout,
		}),
		[token, currentUser, isAuthLoading],
	);
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
