import { TColor } from '../type/color-type';

export function test() {
	return null;
}

export function getOS() {
	const { userAgent } = window.navigator;
	const { platform } = window.navigator;
	const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
	const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
	const iosPlatforms = ['iPhone', 'iPad', 'iPod'];
	let os = null;

	if (macosPlatforms.indexOf(platform) !== -1) {
		os = 'MacOS';
	} else if (iosPlatforms.indexOf(platform) !== -1) {
		os = 'iOS';
	} else if (windowsPlatforms.indexOf(platform) !== -1) {
		os = 'Windows';
	} else if (/Android/.test(userAgent)) {
		os = 'Android';
	} else if (!os && /Linux/.test(platform)) {
		os = 'Linux';
	}

	document.documentElement.setAttribute('os', os ?? '');
	return os;
}

export const hasNotch = () => {
	/**
	 * For storybook test
	 */
	const storybook = window.location !== window.parent.location;
	const iPhone =
		/iPhone/.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream;
	const aspect = window.screen.width / window.screen.height;
	const aspectFrame = window.innerWidth / window.innerHeight;
	return (
		(iPhone && aspect.toFixed(3) === '0.462') ||
		(storybook && aspectFrame.toFixed(3) === '0.462')
	);
};

export const mergeRefs = (refs: any[]) => {
	return (value: any) => {
		refs.forEach((ref) => {
			if (typeof ref === 'function') {
				ref(value);
			} else if (ref != null) {
				ref.current = value;
			}
		});
	};
};

export const randomColor = (): TColor => {
	const colors: TColor[] = ['primary', 'secondary', 'success', 'info', 'warning', 'danger'];

	const color = Math.floor(Math.random() * colors.length);

	return colors[color];
};

export const priceFormat = (price: number) => {
	return price.toLocaleString('en-US', {
		style: 'currency',
		currency: 'USD',
	});
};

export const jmdFormat = (price: number) => {
	return price.toLocaleString('en-JM', {
		style: 'currency',
		currency: 'JMD',
		maximumFractionDigits: 0,
	});
};

export const average = (array: any[]) => array.reduce((a, b) => a + b) / array.length;

export const percent = (value1: number, value2: number) =>
	Number(((value1 / value2 - 1) * 100).toFixed(2));

export const getFirstLetter = (text: string, letterCount = 2): string =>
	(text.toUpperCase().match(/\b(\w)/g) ?? []).join('').substring(0, letterCount);

export const getInitialsAvatarUri = (name: string): string => {
	const initials = getFirstLetter(name || '?', 2) || '?';
	const hash = Array.from(name || '').reduce((acc, char) => acc + char.charCodeAt(0), 0);
	const hue = hash % 360;
	const svg =
		`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">` +
		`<rect width="128" height="128" fill="hsl(${hue},55%,55%)"/>` +
		`<text x="50%" y="50%" dy=".35em" text-anchor="middle" ` +
		`font-family="sans-serif" font-size="52" fill="#fff">${initials}</text>` +
		`</svg>`;
	return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const debounce = (func: (...args: any[]) => void, wait = 1000) => {
	let timeout: string | number | NodeJS.Timeout | undefined;

	return function executedFunction(...args: any[]) {
		const later = () => {
			clearTimeout(timeout);
			func(...args);
		};

		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
};
