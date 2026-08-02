/// <reference types="react-scripts" />

declare namespace NodeJS {
	interface ProcessEnv {
		readonly REACT_APP_PRIMARY_COLOR: string;
		readonly REACT_APP_SECONDARY_COLOR: string;
		readonly REACT_APP_SUCCESS_COLOR: string;
		readonly REACT_APP_INFO_COLOR: string;
		readonly REACT_APP_WARNING_COLOR: string;
		readonly REACT_APP_DANGER_COLOR: string;
		readonly REACT_APP_LIGHT_COLOR: string;
		readonly REACT_APP_DARK_COLOR: string;
	}
}

// react-scripts only declares `*.module.scss`/`*.module.css` (CSS modules);
// plain, non-module stylesheet side-effect imports have no ambient module
// declaration at all, which TS's `bundler` moduleResolution now flags.
declare module '*.scss';
declare module '*.css';

declare module '@omtanke/react-use-event-outside' {
	export default function useEventOutside(
		ref: React.RefObject<Element | null>,
		eventName: string,
		handler: () => void,
	): void;
}

declare module 'jsx-to-string' {
	export default function jsxToString(
		node: React.ReactNode,
		options?: Record<string, any>,
	): string;
}

declare module 'react-image-webp/dist/utils' {
	export function isWebpSupported(): boolean;
}
