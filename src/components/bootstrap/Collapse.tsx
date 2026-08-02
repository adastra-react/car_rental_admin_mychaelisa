import React, {
	cloneElement,
	ElementType,
	FC,
	isValidElement,
	ReactNode,
	useRef,
	useState,
} from 'react';
import classNames from 'classnames';
import { Transition } from 'react-transition-group';
import {
	omit,
	pick,
	TransitionPropTypeKeys,
	TransitionStatuses,
	TransitionTimeouts,
} from './utils';

const transitionStatusToClassHash = {
	[TransitionStatuses.ENTERING]: 'collapsing',
	[TransitionStatuses.ENTERED]: 'collapse show',
	[TransitionStatuses.EXITING]: 'collapsing',
	[TransitionStatuses.EXITED]: 'collapse',
};

const getTransitionClass = (status: string) => {
	return transitionStatusToClassHash[status] || 'collapse';
};

const getHeight = (node: { scrollHeight: any } | null) => {
	return node?.scrollHeight;
};

// react-transition-group's Transition doesn't expose a typed static defaultProps
// (see @types/react-transition-group), so mirror its actual runtime defaults here.
const TRANSITION_DEFAULT_PROPS = {
	in: false,
	mountOnEnter: false,
	unmountOnExit: false,
	appear: false,
	enter: true,
	exit: true,
	onEnter: (() => {}) as (node: HTMLElement, isAppearing: boolean) => void,
	onEntering: (() => {}) as (node: HTMLElement, isAppearing: boolean) => void,
	onEntered: (() => {}) as (node: HTMLElement, isAppearing: boolean) => void,
	onExit: (() => {}) as (node: HTMLElement) => void,
	onExiting: (() => {}) as (node: HTMLElement) => void,
	onExited: (() => {}) as (node: HTMLElement) => void,
};

interface ICollapseProps extends Record<string, any> {
	tag?: ElementType | any;
	isOpen?: boolean;
	className?: string;
	isNavbar?: boolean;
	children: ReactNode;
	isChildClone?: boolean;
}
const Collapse: FC<ICollapseProps> = ({
	tag: Tag = 'div',
	isOpen,
	className,
	isNavbar,
	children,
	isChildClone,
	...restProps
}) => {
	const props = {
		...restProps,
		...TRANSITION_DEFAULT_PROPS,
		timeout: restProps.timeout ?? TransitionTimeouts.Collapse,
	};
	const ref = useRef<HTMLElement | null>(null);
	const NODE = ref.current;

	const [height, setHeight] = useState<number | null>(null);

	const onEntering = (isAppearing: any) => {
		setHeight(getHeight(NODE));
		props.onEntering(NODE!, isAppearing);
	};

	const onEntered = (isAppearing: any) => {
		setHeight(null);
		props.onEntered(NODE!, isAppearing);
	};

	const onExit = () => {
		setHeight(getHeight(NODE));
		props.onExit(NODE!);
	};

	const onExiting = () => {
		// getting this variable triggers a reflow
		const UNUSED = NODE?.offsetHeight; // eslint-disable-line @typescript-eslint/no-unused-vars
		setHeight(0);

		props.onExiting(NODE!);
	};

	const onExited = () => {
		setHeight(null);
		props.onExited(NODE!);
	};

	// props.timeout is always set above, so this always satisfies TimeoutProps.
	const transitionProps = pick(props, TransitionPropTypeKeys) as {
		timeout: number | { appear?: number; enter?: number; exit?: number };
	};
	const childProps = omit(props, TransitionPropTypeKeys);

	return (
		<Transition<HTMLElement>
			nodeRef={ref}
			// eslint-disable-next-line react/jsx-props-no-spreading
			{...transitionProps}
			in={isOpen}
			onEntering={onEntering}
			onEntered={onEntered}
			onExit={onExit}
			onExiting={onExiting}
			onExited={onExited}>
			{(status) => {
				const collapseClass = getTransitionClass(status);
				const classes = classNames(className, collapseClass, isNavbar && 'navbar-collapse');
				const style = height === null ? null : { height };
				if (
					isChildClone &&
					isValidElement<{ className?: string; [key: string]: any }>(children)
				) {
					return cloneElement(children, {
						ref,
						style: { ...childProps.style, ...style },
						className: classNames(classes, children.props.className),
						...childProps,
					});
				}
				return (
					<Tag
						// eslint-disable-next-line react/jsx-props-no-spreading
						{...childProps}
						style={{ ...childProps.style, ...style }}
						className={classes}
						ref={ref}>
						{children}
					</Tag>
				);
			}}
		</Transition>
	);
};

export default Collapse;
