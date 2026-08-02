import axios from 'axios';

export const TOKEN_STORAGE_KEY = 'facit_authToken';
const apiBaseUrl =
	process.env.REACT_APP_API_BASE_URL ??
	(process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : undefined);

const apiClient = axios.create({
	baseURL: apiBaseUrl,
});

apiClient.interceptors.request.use((config) => {
	const token = localStorage.getItem(TOKEN_STORAGE_KEY);
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

apiClient.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			localStorage.removeItem(TOKEN_STORAGE_KEY);
			window.dispatchEvent(new Event('auth:unauthorized'));
		}
		return Promise.reject(error);
	},
);

export const getApiErrorMessage = (err: unknown): string => {
	if (axios.isAxiosError(err) && typeof err.response?.data?.message === 'string') {
		return err.response.data.message;
	}
	return 'Something went wrong. Please try again.';
};

export const resolveAssetUrl = (url: string): string => {
	if (url.startsWith('http')) {
		return url;
	}
	return `${apiBaseUrl ?? ''}${url}`;
};

export default apiClient;
