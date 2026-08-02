import React, {
	FC,
	ReactNode,
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useState,
} from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { useTour } from '@reactour/tour';
import Button, { IButtonProps } from '../../../components/bootstrap/Button';
import Badge from '../../../components/bootstrap/Badge';
import { HeaderRight } from '../../../layout/Header/Header';
import OffCanvas, {
	OffCanvasBody,
	OffCanvasHeader,
	OffCanvasTitle,
} from '../../../components/bootstrap/OffCanvas';
import Alert from '../../../components/bootstrap/Alert';
import Dropdown, {
	DropdownItem,
	DropdownMenu,
	DropdownToggle,
} from '../../../components/bootstrap/Dropdown';
import Icon from '../../../components/icon/Icon';
import ThemeContext from '../../../contexts/themeContext';
import LANG, { getLangWithKey, ILang } from '../../../lang';
import showNotification from '../../../components/extras/showNotification';
import useDarkMode from '../../../hooks/useDarkMode';
import Popovers from '../../../components/bootstrap/Popovers';
import Spinner from '../../../components/bootstrap/Spinner';
import { jmdFormat } from '../../../helpers/helpers';
import AdminDashboardContext from '../../../contexts/adminDashboardContext';
import AdminUsersContext from '../../../contexts/adminUsersContext';
import { TColor } from '../../../type/color-type';
import { TIcons } from '../../../type/icons-type';

interface IHeaderNotificationItem {
	id: string;
	title: string;
	description: string;
	timestamp: string;
	color: TColor;
	icon: TIcons;
	category: 'Action needed' | 'Resolved';
}

const buildNotification = (item: IHeaderNotificationItem) => item;

interface ICommonHeaderRightProps {
	beforeChildren?: ReactNode;
	afterChildren?: ReactNode;
}
const CommonHeaderRight: FC<ICommonHeaderRightProps> = ({ beforeChildren, afterChildren }) => {
	const { darkModeStatus, setDarkModeStatus } = useDarkMode();
	const {
		bookings,
		payouts,
		claims,
		isLoading: dashboardLoading,
		error: dashboardError,
		lastUpdatedAt,
		refresh: refreshDashboard,
	} = useContext(AdminDashboardContext);
	const {
		users,
		isLoading: usersLoading,
		error: usersError,
		refresh: refreshUsers,
	} = useContext(AdminUsersContext);

	const { fullScreenStatus, setFullScreenStatus } = useContext(ThemeContext);
	const styledBtn: IButtonProps = {
		color: darkModeStatus ? 'dark' : 'light',
		hoverShadow: 'default',
		isLight: !darkModeStatus,
		size: 'lg',
	};

	const [offcanvasStatus, setOffcanvasStatus] = useState(false);

	const { i18n } = useTranslation();

	const changeLanguage = (lng: ILang['key']['lng']) => {
		i18n.changeLanguage(lng).then();
		showNotification(
			<span className='d-flex align-items-center'>
				<Icon icon={getLangWithKey(lng)?.icon} size='lg' className='me-1' />
				<span>{`Language changed to ${getLangWithKey(lng)?.text}`}</span>
			</span>,
			'You updated the language of the site. (Only "Aside" was prepared as an example.)',
		);
	};

	/**
	 * Language attribute
	 */
	useLayoutEffect(() => {
		document.documentElement.setAttribute('lang', i18n.language.substring(0, 2));
	});

	useEffect(() => {
		if (offcanvasStatus) {
			void refreshDashboard();
			void refreshUsers();
		}
	}, [offcanvasStatus, refreshDashboard, refreshUsers]);

	const notifications = useMemo<IHeaderNotificationItem[]>(() => {
		const nextItems: IHeaderNotificationItem[] = [
			...claims
				.filter((claim) => claim.status === 'Submitted' || claim.status === 'Disputed')
				.map((claim) =>
					buildNotification({
					id: `claim-pending-${claim.id}`,
					title: `Damage claim needs review`,
					description: `${claim.vehicleTitle} · ${jmdFormat(claim.claimedAmount)} · ${claim.status}`,
					timestamp: claim.createdAt,
					color: claim.status === 'Disputed' ? 'danger' : 'warning',
					icon: 'ReportProblem',
					category: 'Action needed',
					}),
				),
			...payouts
				.filter((payout) => payout.status === 'Pending')
				.map((payout) =>
					buildNotification({
					id: `payout-pending-${payout.id}`,
					title: `Payout request waiting`,
					description: `${payout.ownerName ?? payout.ownerEmail ?? 'Owner'} · ${jmdFormat(
						payout.amount,
					)}`,
					timestamp: payout.requestedAt,
					color: 'warning',
					icon: 'Payments',
					category: 'Action needed',
					}),
				),
			...users
				.filter((user) => user.license?.status === 'pending')
				.map((user) =>
					buildNotification({
					id: `license-pending-${user.id}`,
					title: `License verification pending`,
					description: `${user.name} · ${user.role} · ${user.email}`,
					timestamp: user.updatedAt,
					color: 'info',
					icon: 'Badge',
					category: 'Action needed',
					}),
				),
			...bookings
				.filter((booking) => booking.moderation.flaggedForReviewAt)
				.map((booking) =>
					buildNotification({
					id: `booking-flagged-${booking.id}`,
					title: `Booking moderation flag`,
					description: `${booking.title} · ${booking.moderation.blockedContactAttempts} blocked contact attempt${
						booking.moderation.blockedContactAttempts === 1 ? '' : 's'
					}`,
					timestamp: booking.moderation.flaggedForReviewAt ?? booking.updatedAt,
					color: 'primary',
					icon: 'DirectionsCar',
					category: 'Action needed',
					}),
				),
			...users
				.filter((user) => user.license?.reviewedAt)
				.map((user) =>
					buildNotification({
					id: `license-reviewed-${user.id}`,
					title:
						user.license?.status === 'verified'
							? `License approved`
							: `License review completed`,
					description: `${user.name} · ${user.license?.status ?? 'updated'}`,
					timestamp: user.license?.reviewedAt ?? user.updatedAt,
					color: user.license?.status === 'verified' ? 'success' : 'danger',
					icon: 'TaskAlt',
					category: 'Resolved',
					}),
				),
			...claims
				.filter((claim) => claim.reviewedAt)
				.map((claim) =>
					buildNotification({
					id: `claim-reviewed-${claim.id}`,
					title: `Damage claim reviewed`,
					description: `${claim.vehicleTitle} · ${claim.status}`,
					timestamp: claim.reviewedAt ?? claim.updatedAt,
					color: claim.status === 'Approved' ? 'success' : 'danger',
					icon: 'AssignmentTurnedIn',
					category: 'Resolved',
					}),
				),
			...payouts
				.filter((payout) => payout.processedAt)
				.map((payout) =>
					buildNotification({
					id: `payout-processed-${payout.id}`,
					title: `Payout processed`,
					description: `${payout.ownerName ?? payout.ownerEmail ?? 'Owner'} · ${jmdFormat(
						payout.amount,
					)}`,
					timestamp: payout.processedAt ?? payout.requestedAt,
					color: 'success',
					icon: 'CreditCard',
					category: 'Resolved',
					}),
				),
		];

		return nextItems
			.sort((a, b) => dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf())
			.slice(0, 10);
	}, [bookings, claims, payouts, users]);

	const actionableCount = useMemo(
		() => notifications.filter((item) => item.category === 'Action needed').length,
		[notifications],
	);
	const resolvedCount = notifications.length - actionableCount;
	const isLoading = dashboardLoading || usersLoading;
	const error = dashboardError || usersError;

	const { setIsOpen } = useTour();

	return (
		<HeaderRight>
			<div className='row g-3'>
				{beforeChildren}
				{/* Tour Modal */}
				{localStorage.getItem('tourModalStarted') === 'shown' && (
					<div className='col-auto position-relative'>
						<Popovers trigger='hover' desc='Start the "Facit" tour'>
							<Button
								// eslint-disable-next-line react/jsx-props-no-spreading
								{...styledBtn}
								icon='Tour'
								onClick={() => setIsOpen(true)}
								aria-label='Start the "Facit" tour'
							/>
						</Popovers>
						<Icon
							icon='Circle'
							className={classNames(
								'position-absolute start-65',
								'text-danger',
								'animate__animated animate__heartBeat animate__infinite animate__slower',
							)}
						/>
					</div>
				)}

				{/* Dark Mode */}
				<div className='col-auto'>
					<Popovers trigger='hover' desc='Dark / Light mode'>
						<Button
							// eslint-disable-next-line react/jsx-props-no-spreading
							{...styledBtn}
							onClick={() => setDarkModeStatus(!darkModeStatus)}
							className='btn-only-icon'
							data-tour='dark-mode'
							aria-label='Toggle dark mode'>
							<Icon
								icon={darkModeStatus ? 'DarkMode' : 'LightMode'}
								color={darkModeStatus ? 'info' : 'warning'}
								className='btn-icon'
							/>
						</Button>
					</Popovers>
				</div>

				{/*	Full Screen */}
				<div className='col-auto'>
					<Popovers trigger='hover' desc='Fullscreen'>
						<Button
							// eslint-disable-next-line react/jsx-props-no-spreading
							{...styledBtn}
							icon={fullScreenStatus ? 'FullscreenExit' : 'Fullscreen'}
							onClick={() => setFullScreenStatus(!fullScreenStatus)}
							aria-label='Toggle fullscreen'
						/>
					</Popovers>
				</div>

				{/* Lang Selector */}
				<div className='col-auto'>
					<Dropdown>
						<DropdownToggle hasIcon={false}>
							{typeof getLangWithKey(i18n.language as ILang['key']['lng'])?.icon ===
							'undefined' ? (
								<Button
									// eslint-disable-next-line react/jsx-props-no-spreading
									{...styledBtn}
									className='btn-only-icon'
									aria-label='Change language'
									data-tour='lang-selector'>
									<Spinner isSmall inButton='onlyIcon' isGrow />
								</Button>
							) : (
								<Button
									// eslint-disable-next-line react/jsx-props-no-spreading
									{...styledBtn}
									icon={
										getLangWithKey(i18n.language as ILang['key']['lng'])?.icon
									}
									aria-label='Change language'
									data-tour='lang-selector'
								/>
							)}
						</DropdownToggle>
						<DropdownMenu isAlignmentEnd data-tour='lang-selector-menu'>
							{Object.keys(LANG).map((i) => (
								<DropdownItem key={LANG[i].lng}>
									<Button
										icon={LANG[i].icon}
										onClick={() => changeLanguage(LANG[i].lng)}>
										{LANG[i].text}
									</Button>
								</DropdownItem>
							))}
						</DropdownMenu>
					</Dropdown>
				</div>

				{/* Quick Panel */}
				<div className='col-auto'>
					<Dropdown>
						<DropdownToggle hasIcon={false}>
							{/* eslint-disable-next-line react/jsx-props-no-spreading */}
							<Button {...styledBtn} icon='Tune' aria-label='Quick menu' />
						</DropdownToggle>
						<DropdownMenu isAlignmentEnd size='lg' className='py-0 overflow-hidden'>
							<div className='row g-0'>
								<div
									className={classNames(
										'col-12',
										'p-4',
										'd-flex justify-content-center',
										'fw-bold fs-5',
										'text-info',
										'border-bottom border-info',
										{
											'bg-l25-info': !darkModeStatus,
											'bg-lo25-info': darkModeStatus,
										},
									)}>
									Quick Panel
								</div>
								<div
									className={classNames(
										'col-6 p-4 transition-base cursor-pointer bg-light-hover',
										'border-end border-bottom',
										{ 'border-dark': darkModeStatus },
									)}>
									<div className='d-flex flex-column align-items-center justify-content-center'>
										<Icon icon='Public' size='3x' color='info' />
										<span>Dealers</span>
										<small className='text-muted'>Options</small>
									</div>
								</div>
								<div
									className={classNames(
										'col-6 p-4 transition-base cursor-pointer bg-light-hover',
										'border-bottom',
										{ 'border-dark': darkModeStatus },
									)}>
									<div className='d-flex flex-column align-items-center justify-content-center'>
										<Icon icon='Upcoming' size='3x' color='success' />
										<span>Inbox</span>
										<small className='text-muted'>Configuration</small>
									</div>
								</div>
								<div
									className={classNames(
										'col-6 p-4 transition-base cursor-pointer bg-light-hover',
										'border-end',
										{ 'border-dark': darkModeStatus },
									)}>
									<div className='d-flex flex-column align-items-center justify-content-center'>
										<Icon icon='Print' size='3x' color='danger' />
										<span>Print</span>
										<small className='text-muted'>Settings</small>
									</div>
								</div>
								<div className='col-6 p-4 transition-base cursor-pointer bg-light-hover'>
									<div className='d-flex flex-column align-items-center justify-content-center'>
										<Icon icon='ElectricalServices' size='3x' color='warning' />
										<span>Power</span>
										<small className='text-muted'>Mode</small>
									</div>
								</div>
							</div>
						</DropdownMenu>
					</Dropdown>
				</div>

				{/*	Notifications */}
				<div className='col-auto position-relative'>
					<Button
						// eslint-disable-next-line react/jsx-props-no-spreading
						{...styledBtn}
						icon='Notifications'
						onClick={() => setOffcanvasStatus(true)}
						aria-label='Notifications'
					/>
					{actionableCount > 0 && (
						<span className='position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger'>
							{actionableCount > 9 ? '9+' : actionableCount}
						</span>
					)}
				</div>
				{afterChildren}
			</div>

			<OffCanvas
				id='notificationCanvas'
				titleId='offcanvasExampleLabel'
				placement='end'
				isOpen={offcanvasStatus}
				setOpen={setOffcanvasStatus}>
				<OffCanvasHeader setOpen={setOffcanvasStatus}>
					<OffCanvasTitle id='offcanvasExampleLabel'>Notifications</OffCanvasTitle>
				</OffCanvasHeader>
				<OffCanvasBody className='d-flex flex-column gap-3'>
					<div className='d-flex align-items-center justify-content-between gap-3'>
						<div>
							<div className='fw-semibold'>Live admin feed</div>
							<div className='text-muted small'>
								Real events from approvals, claims, payouts, and booking moderation
							</div>
						</div>
						<Button
							color='light'
							isLight
							icon='Refresh'
							onClick={() => {
								void refreshDashboard();
								void refreshUsers();
							}}>
							Refresh
						</Button>
					</div>

					<div className='d-flex flex-wrap gap-2'>
						<Badge color='danger' isLight className='px-3 py-2'>
							Action needed: {actionableCount}
						</Badge>
						<Badge color='success' isLight className='px-3 py-2'>
							Resolved: {resolvedCount}
						</Badge>
						{lastUpdatedAt && (
							<Badge color='primary' isLight className='px-3 py-2'>
								Updated {dayjs(lastUpdatedAt).fromNow()}
							</Badge>
						)}
					</div>

					{error ? (
						<Alert color='danger' icon='ReportProblem' isLight className='mb-0'>
							{error}
						</Alert>
					) : isLoading ? (
						<div className='d-flex justify-content-center py-5'>
							<Spinner />
						</div>
					) : notifications.length ? (
						<div className='d-flex flex-column gap-3'>
							{notifications.map((item) => (
								<div
									key={item.id}
									className='rounded-4 border border-light-subtle bg-l10-light p-3'>
									<div className='d-flex justify-content-between align-items-start gap-3 mb-2'>
										<div className='d-flex align-items-center gap-2'>
											<div
												className={`d-flex align-items-center justify-content-center rounded-3 bg-l10-${item.color} text-${item.color}`}
												style={{ width: 42, height: 42 }}>
												<Icon icon={item.icon} />
											</div>
											<div>
												<div className='fw-semibold lh-sm'>{item.title}</div>
												<div className='text-muted small'>{item.description}</div>
											</div>
										</div>
										<Badge color={item.color} isLight>
											{item.category}
										</Badge>
									</div>
									<div className='text-muted small d-flex justify-content-between align-items-center'>
										<span>{dayjs(item.timestamp).format('MMM D, h:mm A')}</span>
										<span>{dayjs(item.timestamp).fromNow()}</span>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className='rounded-4 border border-light-subtle bg-l10-light p-4 text-center'>
							<div className='fw-semibold mb-1'>No notifications right now</div>
							<div className='text-muted small'>
								New approvals, review flags, and payout events will appear here.
							</div>
						</div>
					)}
				</OffCanvasBody>
			</OffCanvas>
		</HeaderRight>
	);
};

export default CommonHeaderRight;
