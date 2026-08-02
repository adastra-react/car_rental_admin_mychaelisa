import React, { FC, HTMLAttributes, ReactNode } from 'react';
import classNames from 'classnames';
import { useMeasure } from 'react-use';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles<string, { width: number; scale: number }>({
	// stylelint-disable-next-line selector-type-no-unknown
	scale: {
		// stylelint-disable-next-line scss/selector-no-redundant-nesting-selector
		'& .rccs': {
			zoom: (data) => (data.width / 290) * data.scale,
		},
	},
	// stylelint-disable-next-line selector-type-no-unknown
	fluid: {
		// stylelint-disable-next-line scss/selector-no-redundant-nesting-selector
		'& .rccs': {
			zoom: (data) => data.width / 290,
		},
	},
});

interface IReactCreditCardsContainerProps extends HTMLAttributes<HTMLDivElement> {
	className?: string;
	children: ReactNode;
	is3dShadow?: boolean;
	issuer?: string;
	scale?: number;
}
const ReactCreditCardsContainer: FC<IReactCreditCardsContainerProps> = ({
	className,
	is3dShadow = true,
	issuer,
	scale = 0,
	children,
	...props
}) => {
	const [ref, { width }] = useMeasure<HTMLDivElement>();
	const classes = useStyles({ width, scale });
	return (
		<div
			ref={ref}
			className={classNames(
				{
					[`rccs-shadow-3d-${
						(issuer === 'visa' && 'info') ||
						(issuer === 'mastercard' && 'warning') ||
						(issuer === 'amex' && 'success') ||
						(issuer === 'hipercard' && 'danger') ||
						'dark'
					}`]: is3dShadow,
				},
				{ [classes.scale]: !!scale, [classes.fluid]: width < 290 },
				className,
			)}
			{...props}>
			{children}
		</div>
	);
};

export default ReactCreditCardsContainer;
