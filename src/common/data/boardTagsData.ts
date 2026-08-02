import COLORS from './enumColors';
import { TColor } from '../../type/color-type';

const TAGS: { [key: string]: { id: string; color: TColor; title: string } } = {
	critical: {
		id: 'critical',
		color: COLORS.SUCCESS.name,
		title: 'Critical',
	},
	design: {
		id: 'design',
		color: COLORS.WARNING.name,
		title: 'Design',
	},
	code: {
		id: 'code',
		color: COLORS.INFO.name,
		title: 'Code',
	},
	review: {
		id: 'review',
		color: COLORS.INFO.name,
		title: 'Review',
	},
	revise: {
		id: 'revise',
		color: COLORS.SECONDARY.name,
		title: 'Revise',
	},
};

export function getTagsDataWithId(id: { toString: () => any }) {
	const key = Object.keys(TAGS).find((f) => TAGS[f].id.toString() === id.toString());
	return key ? TAGS[key] : undefined;
}

export default TAGS;
