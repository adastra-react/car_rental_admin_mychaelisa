// eslint-disable-next-line no-undef
module.exports = {
	staticDirs: ['../public'],
	stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
	addons: [
		'@storybook/addon-links',
		'@storybook/preset-create-react-app',
		'@storybook/addon-a11y',
		'@storybook/addon-docs',
	],

	framework: {
		name: '@storybook/react-webpack5',
		options: {},
	},

	typescript: {
		reactDocgen: 'react-docgen',
	},
};
