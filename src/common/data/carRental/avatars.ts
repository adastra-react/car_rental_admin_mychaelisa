import wanna1 from '../../../assets/img/wanna/wanna1.png';
import wanna1Webp from '../../../assets/img/wanna/wanna1.webp';
import wanna2 from '../../../assets/img/wanna/wanna2.png';
import wanna2Webp from '../../../assets/img/wanna/wanna2.webp';
import wanna3 from '../../../assets/img/wanna/wanna3.png';
import wanna3Webp from '../../../assets/img/wanna/wanna3.webp';
import wanna4 from '../../../assets/img/wanna/wanna4.png';
import wanna4Webp from '../../../assets/img/wanna/wanna4.webp';
import wanna5 from '../../../assets/img/wanna/wanna5.png';
import wanna5Webp from '../../../assets/img/wanna/wanna5.webp';
import wanna6 from '../../../assets/img/wanna/wanna6.png';
import wanna6Webp from '../../../assets/img/wanna/wanna6.webp';
import wanna7 from '../../../assets/img/wanna/wanna7.png';
import wanna7Webp from '../../../assets/img/wanna/wanna7.webp';

export interface IAvatar {
	src: string;
	srcSet: string;
}

export const AVATARS: IAvatar[] = [
	{ src: wanna1, srcSet: wanna1Webp },
	{ src: wanna2, srcSet: wanna2Webp },
	{ src: wanna3, srcSet: wanna3Webp },
	{ src: wanna4, srcSet: wanna4Webp },
	{ src: wanna5, srcSet: wanna5Webp },
	{ src: wanna6, srcSet: wanna6Webp },
	{ src: wanna7, srcSet: wanna7Webp },
];

export const getAvatarForIndex = (index: number): IAvatar => AVATARS[index % AVATARS.length];
