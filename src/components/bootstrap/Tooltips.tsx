import React, { cloneElement, FC, isValidElement, ReactElement, ReactNode, useState } from 'react';
import { usePopper } from 'react-popper';
import classNames from 'classnames';
import Portal from '../../layout/Portal/Portal';

interface ITooltipsProps {
	children: ReactNode;
	title: ReactNode;
	placement?: 'auto' | 'top' | 'bottom' | 'right' | 'left';
	flip?: ('auto' | 'top' | 'bottom' | 'right' | 'left')[];
	delay?: number;
	isDisplayInline?: boolean;
	className?: string;
	modifiers?: object;
	isDisableElements?: boolean;
}
const Tooltips: FC<ITooltipsProps> = ({
	children,
	className,
	title,
	placement = 'top',
	flip = ['top', 'bottom'],
	delay = 0,
	isDisplayInline,
	isDisableElements,
	modifiers,
}) => {
	const [referenceElement, setReferenceElement] = useState<Element | null>(null);
	const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
	const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null);
	const { styles, attributes } = usePopper(referenceElement, popperElement, {
		placement,
		modifiers: [
			{
				name: 'offset',
				options: {
					offset: [0, -3],
				},
			},
			{
				name: 'flip',
				enabled: true,
				options: {
					fallbackPlacements: flip,
				},
			},
			{
				name: 'arrow',
				options: {
					element: arrowElement,
				},
			},
			{ ...modifiers },
		],
	});

	const [tooltipOpen, setTooltipOpen] = useState(false);

	const childElement = isValidElement<{
		onMouseOver?: () => void;
		onMouseLeave?: () => void;
		className?: string;
	}>(children)
		? children
		: undefined;

	const ON_MOUSE_OVER = () => {
		setTooltipOpen(true);
		childElement?.props?.onMouseOver?.();
	};

	const ON_MOUSE_LEAVE = () => {
		setTimeout(() => setTooltipOpen(false), delay);
		childElement?.props?.onMouseLeave?.();
	};

	const PROPS = {
		className: classNames(
			{ 'd-inline-block': isDisplayInline, 'tooltip-string': typeof children === 'string' },
			childElement?.props?.className,
		),
		onMouseOver: ON_MOUSE_OVER,
		onMouseLeave: ON_MOUSE_LEAVE,
	};

	return (
		<>
			{cloneElement(
				(typeof children === 'string' ? (
					<span ref={setReferenceElement} {...PROPS}>
						{children}
					</span>
				) : (
					(isDisableElements && (
						<span className='d-inline-block' tabIndex={0}>
							{children}
						</span>
					)) ||
					childElement
				)) as ReactElement<Record<string, any>>,
				{
					ref: setReferenceElement,
					...PROPS,
				},
			)}
			{tooltipOpen && (
				<Portal>
					<div
						ref={setPopperElement}
						role='tooltip'
						className={classNames('tooltip bs-tooltip-auto show', className)}
						style={styles.popper}
						{...attributes.popper}>
						<div ref={setArrowElement} className='tooltip-arrow' style={styles.arrow} />
						<div className='tooltip-inner'>{title}</div>
					</div>
				</Portal>
			)}
		</>
	);
};

export default Tooltips;
