import React, { FC, useEffect, useRef } from 'react';
import classNames from 'classnames';

interface IValidationProps {
	isTouched?: boolean;
	invalidFeedback?: string;
	validFeedback?: string;
	isTooltip?: boolean;
}
const Validation: FC<IValidationProps> = ({
	isTouched,
	invalidFeedback,
	validFeedback,
	isTooltip,
}) => {
	const ref = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const parentNode = ref.current?.parentNode as HTMLElement | null | undefined;
		if (isTooltip && parentNode) {
			for (let i = 0; i < parentNode.classList.length; i += 1) {
				if (['input-group'].includes(parentNode.classList[i])) {
					(parentNode.parentNode as HTMLElement | null)?.classList.add(
						'position-relative',
					);
				} else {
					parentNode.classList.add('position-relative');
				}
			}
		}
	});

	if (isTouched && invalidFeedback) {
		return (
			<div
				ref={ref}
				className={classNames({
					'invalid-feedback': !isTooltip,
					'invalid-tooltip': isTooltip,
				})}>
				{invalidFeedback}
			</div>
		);
	}
	return (
		!invalidFeedback &&
		validFeedback && (
			<div
				ref={ref}
				className={classNames({
					'valid-feedback': !isTooltip,
					'valid-tooltip': isTooltip,
				})}>
				{validFeedback}
			</div>
		)
	);
};

export default Validation;
