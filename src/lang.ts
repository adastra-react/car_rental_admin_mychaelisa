export interface ILang {
	[key: string]: {
		text: string;
		lng: 'en' | 'de' | 'fr' | 'tr';
		icon: string;
	};
}

const LANG: ILang = {
	EN: {
		text: 'English',
		lng: 'en',
		icon: 'CustomUsa',
	},
	DE: {
		text: 'Deutsche',
		lng: 'de',
		icon: 'CustomGermany',
	},
	FR: {
		text: 'Français',
		lng: 'fr',
		icon: 'CustomFrance',
	},
	TR: {
		text: 'Türkçe',
		lng: 'tr',
		icon: 'CustomTurkey',
	},
};

export const getLangWithKey = (key: ILang['key']['lng']): ILang['key'] | undefined => {
	const foundKey = Object.keys(LANG).find((k) => key.includes(LANG[k].lng));
	return foundKey ? LANG[foundKey] : undefined;
};

export default LANG;
