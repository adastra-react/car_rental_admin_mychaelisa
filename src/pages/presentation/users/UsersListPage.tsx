import React, { useContext, useMemo, useState } from 'react';
import { useFormik } from 'formik';
import dayjs from 'dayjs';
import classNames from 'classnames';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import SubHeader, {
	SubHeaderLeft,
	SubHeaderRight,
	SubheaderSeparator,
} from '../../../layout/SubHeader/SubHeader';
import Page from '../../../layout/Page/Page';
import { carRentalMenu } from '../../../menu';
import Card, { CardBody, CardHeader, CardLabel, CardSubTitle, CardTitle } from '../../../components/bootstrap/Card';
import PaginationButtons, {
	dataPagination,
	PER_COUNT,
} from '../../../components/PaginationButtons';
import Button from '../../../components/bootstrap/Button';
import Icon from '../../../components/icon/Icon';
import Input from '../../../components/bootstrap/forms/Input';
import Dropdown, {
	DropdownItem,
	DropdownMenu,
	DropdownToggle,
} from '../../../components/bootstrap/Dropdown';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import Checks, { ChecksGroup } from '../../../components/bootstrap/forms/Checks';
import Badge from '../../../components/bootstrap/Badge';
import Avatar from '../../../components/Avatar';
import Alert from '../../../components/bootstrap/Alert';
import Spinner from '../../../components/bootstrap/Spinner';
import Popovers from '../../../components/bootstrap/Popovers';
import useSortableData from '../../../hooks/useSortableData';
import showNotification from '../../../components/extras/showNotification';
import { getInitialsAvatarUri } from '../../../helpers/helpers';
import { getApiErrorMessage } from '../../../services/apiClient';
import {
	AccountStatus,
	LicenseStatus,
	SerializedUser,
	updateAccountStatus,
	UserRole,
} from '../../../services/authApi';
import AdminUsersContext from '../../../contexts/adminUsersContext';
import UserDetailModal from './UserDetailModal';

const ROLES: UserRole[] = ['Owner', 'Renter', 'Admin'];
const STATUSES: AccountStatus[] = ['active', 'suspended', 'banned'];

const accountStatusColor: Record<AccountStatus, 'success' | 'warning' | 'danger'> = {
	active: 'success',
	suspended: 'warning',
	banned: 'danger',
};
const licenseStatusColor: Record<LicenseStatus, 'success' | 'warning' | 'danger'> = {
	verified: 'success',
	pending: 'warning',
	rejected: 'danger',
};
const roleColor = { Owner: 'info', Renter: 'primary', Admin: 'dark' } as const;
const roleDescription: Record<UserRole, string> = {
	Admin: 'Full platform access',
	Owner: 'Hosts vehicles on the platform',
	Renter: 'Books and manages trips',
};
const accountStatusDescription: Record<AccountStatus, string> = {
	active: 'Account is usable',
	suspended: 'Temporarily restricted',
	banned: 'Access permanently blocked',
};

const UsersListPage = () => {
	const { users, isLoading, error, refresh, patchUser } = useContext(AdminUsersContext);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [perPage, setPerPage] = useState<number>(PER_COUNT['10']);
	const [selectedUser, setSelectedUser] = useState<SerializedUser | null>(null);
	const [detailModalStatus, setDetailModalStatus] = useState<boolean>(false);
	const [pendingUserId, setPendingUserId] = useState<string | null>(null);

	const formik = useFormik({
		initialValues: {
			searchInput: '',
			role: ROLES,
			accountStatus: STATUSES,
		},
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		onSubmit: (values) => {},
	});

	const filteredData = users.filter(
		(u) =>
			(u.name.toLowerCase().includes(formik.values.searchInput.toLowerCase()) ||
				u.email.toLowerCase().includes(formik.values.searchInput.toLowerCase())) &&
			formik.values.role.includes(u.role) &&
			formik.values.accountStatus.includes(u.accountStatus),
	);

	const { items, requestSort, getClassNamesFor } = useSortableData(filteredData);
	const paginatedItems = useMemo(
		() => dataPagination(items, currentPage, perPage),
		[items, currentPage, perPage],
	);
	const summaryItems = useMemo(
		() => [
			{
				label: 'Showing',
				value: filteredData.length,
				helper: `${users.length} total users`,
				color: 'primary' as const,
				icon: 'Groups',
			},
			{
				label: 'Pending Licenses',
				value: filteredData.filter((u) => u.license?.status === 'pending').length,
				helper: 'Awaiting manual review',
				color: 'warning' as const,
				icon: 'Badge',
			},
			{
				label: 'Restricted Accounts',
				value: filteredData.filter((u) => u.accountStatus !== 'active').length,
				helper: 'Suspended or banned',
				color: 'danger' as const,
				icon: 'Block',
			},
			{
				label: 'Admins',
				value: filteredData.filter((u) => u.role === 'Admin').length,
				helper: 'Platform operators',
				color: 'dark' as const,
				icon: 'AdminPanelSettings',
			},
		],
		[filteredData, users.length],
	);
	const dashboardAlerts = useMemo(
		() => [
			{
				key: 'pending-license',
				show: filteredData.some((u) => u.license?.status === 'pending'),
				color: 'warning' as const,
				icon: 'Badge',
				title: `${filteredData.filter((u) => u.license?.status === 'pending').length} license review${
					filteredData.filter((u) => u.license?.status === 'pending').length === 1
						? ''
						: 's'
				} pending`,
				description: 'These users are waiting on manual document approval from the admin team.',
			},
			{
				key: 'restricted',
				show: filteredData.some((u) => u.accountStatus !== 'active'),
				color: 'danger' as const,
				icon: 'Shield',
				title: `${filteredData.filter((u) => u.accountStatus !== 'active').length} restricted account${
					filteredData.filter((u) => u.accountStatus !== 'active').length === 1
						? ''
						: 's'
				}`,
				description: 'Suspended and banned users are highlighted below for quick follow-up.',
			},
			{
				key: 'healthy',
				show:
					filteredData.length > 0 &&
					filteredData.every(
						(u) => u.accountStatus === 'active' && u.license?.status !== 'pending',
					),
				color: 'success' as const,
				icon: 'TaskAlt',
				title: 'User queue looks healthy',
				description: 'No pending license reviews or restricted accounts in the current filter set.',
			},
		].filter((item) => item.show),
		[filteredData],
	);

	const handleStatusChange = async (userId: string, status: AccountStatus) => {
		setPendingUserId(userId);
		try {
			const updated = await updateAccountStatus(userId, status);
			patchUser(updated);
			setSelectedUser((prev) => (prev && prev.id === userId ? updated : prev));
			showNotification(
				<span className='d-flex align-items-center'>
					<Icon icon='Info' size='lg' className='me-1' />
					<span>Account updated</span>
				</span>,
				`${updated.name}'s account status is now "${status}"`,
				status === 'banned' ? 'danger' : status === 'suspended' ? 'warning' : 'success',
			);
		} catch (err) {
			showNotification(
				<span className='d-flex align-items-center'>
					<Icon icon='ReportProblem' size='lg' className='me-1' />
					<span>Update failed</span>
				</span>,
				getApiErrorMessage(err),
				'danger',
			);
		} finally {
			setPendingUserId(null);
		}
	};

	const handleLicenseDecision = (updated: SerializedUser) => {
		patchUser(updated);
		setSelectedUser((prev) => (prev && prev.id === updated.id ? updated : prev));
	};

	const openDetail = (user: SerializedUser) => {
		setSelectedUser(user);
		setDetailModalStatus(true);
	};

	const renderHeaderCell = (
		label: string,
		sortKey?: keyof SerializedUser,
		align: 'start' | 'end' = 'start',
	) => (
		<div
			role={sortKey ? 'button' : undefined}
			tabIndex={sortKey ? 0 : -1}
			onClick={sortKey ? () => requestSort(sortKey) : undefined}
			onKeyDown={
				sortKey
					? (event) => {
							if (event.key === 'Enter' || event.key === ' ') {
								event.preventDefault();
								requestSort(sortKey);
							}
						}
					: undefined
			}
			className={classNames(
				'd-flex align-items-center gap-2 text-uppercase text-muted fw-semibold small',
				{ 'justify-content-xl-end': align === 'end', 'cursor-pointer': !!sortKey },
			)}>
			<span>{label}</span>
			{sortKey && <Icon size='lg' className={getClassNamesFor(sortKey)} icon='FilterList' />}
		</div>
	);

	return (
		<PageWrapper title={carRentalMenu.users.text}>
			<SubHeader>
				<SubHeaderLeft>
					<label
						className='border-0 bg-transparent cursor-pointer me-0'
						htmlFor='searchInput'>
						<Icon icon='Search' size='2x' color='primary' />
					</label>
					<Input
						id='searchInput'
						type='search'
						className='border-0 shadow-none bg-transparent'
						placeholder='Search by name or email...'
						onChange={formik.handleChange}
						value={formik.values.searchInput}
					/>
				</SubHeaderLeft>
				<SubHeaderRight>
					<Dropdown>
						<DropdownToggle hasIcon={false}>
							<Button
								icon='FilterAlt'
								color='dark'
								isLight
								className='btn-only-icon position-relative'
								aria-label='Filter'>
								{users.length !== filteredData.length && (
									<Popovers desc='Filtering applied' trigger='hover'>
										<span className='position-absolute top-0 start-100 translate-middle badge border border-light rounded-circle bg-danger p-2'>
											<span className='visually-hidden'>
												there is filtering
											</span>
										</span>
									</Popovers>
								)}
							</Button>
						</DropdownToggle>
						<DropdownMenu isAlignmentEnd size='lg'>
							<div className='container py-2'>
								<div className='row g-3'>
									<FormGroup label='Role' className='col-12'>
										<ChecksGroup>
											{ROLES.map((role) => (
												<Checks
													key={role}
													id={`role-${role}`}
													label={role}
													name='role'
													value={role}
													onChange={formik.handleChange}
													checked={formik.values.role.includes(role)}
												/>
											))}
										</ChecksGroup>
									</FormGroup>
									<FormGroup label='Account Status' className='col-12'>
										<ChecksGroup>
											{STATUSES.map((status) => (
												<Checks
													key={status}
													id={`status-${status}`}
													label={status}
													name='accountStatus'
													value={status}
													onChange={formik.handleChange}
													checked={formik.values.accountStatus.includes(
														status,
													)}
												/>
											))}
										</ChecksGroup>
									</FormGroup>
								</div>
							</div>
						</DropdownMenu>
					</Dropdown>
					<SubheaderSeparator />
					<span className='text-muted'>{filteredData.length} users</span>
				</SubHeaderRight>
			</SubHeader>
			<Page>
				<div className='row h-100'>
					<div className='col-12'>
						<Card stretch>
							<CardHeader className='border-0 px-4 px-xl-5 pt-4 pt-xl-5 pb-0'>
								<CardLabel icon='Groups' iconColor='primary'>
									<CardTitle tag='div' className='h4 mb-0'>
										User Management
									</CardTitle>
									<CardSubTitle tag='div'>
										Live admin view for account health, license verification, and user actions
									</CardSubTitle>
								</CardLabel>
							</CardHeader>
							<CardBody isScrollable className='p-4 p-xl-5'>
								{isLoading ? (
									<div className='d-flex justify-content-center align-items-center py-5'>
										<Spinner />
									</div>
								) : error ? (
									<div className='p-2'>
										<Alert color='danger' icon='ReportProblem' isLight>
											{error}
										</Alert>
										<Button color='info' isLight onClick={() => refresh()}>
											Retry
										</Button>
									</div>
								) : (
									<>
										{dashboardAlerts.length > 0 && (
											<div className='d-flex flex-column gap-3 mb-4'>
												{dashboardAlerts.map((item) => (
													<Alert
														key={item.key}
														color={item.color}
														icon={item.icon}
														isLight
														className='mb-0 rounded-4 border-0'>
														<div className='fw-semibold mb-1'>{item.title}</div>
														<div className='small'>{item.description}</div>
													</Alert>
												))}
											</div>
										)}
										<div className='row g-3 mb-4'>
											{summaryItems.map((item) => (
												<div key={item.label} className='col-sm-6 col-xl-3'>
													<div className='rounded-4 border border-light-subtle bg-l10-light p-3 h-100'>
														<div className='d-flex align-items-start justify-content-between gap-3 mb-3'>
															<div>
																<div className='text-uppercase text-muted fw-semibold small mb-1'>
																	{item.label}
																</div>
																<div className='fs-3 fw-bold lh-sm'>
																	{item.value}
																</div>
															</div>
															<div
																className={`d-flex align-items-center justify-content-center rounded-4 bg-l10-${item.color} text-${item.color}`}
																style={{ width: 48, height: 48 }}>
																<Icon icon={item.icon} size='lg' />
															</div>
														</div>
														<div className='text-muted small'>{item.helper}</div>
													</div>
												</div>
											))}
										</div>

										<div className='rounded-4 border border-light-subtle bg-white overflow-hidden'>
											<div className='d-none d-xl-block border-bottom border-light-subtle bg-l10-light px-4 py-3'>
												<div className='row g-3 align-items-center'>
													<div className='col-xl-4'>
														{renderHeaderCell('User', 'name')}
													</div>
													<div className='col-xl-2'>
														{renderHeaderCell('Role', 'role')}
													</div>
													<div className='col-xl-2'>
														{renderHeaderCell('License')}
													</div>
													<div className='col-xl-2'>
														{renderHeaderCell('Account', 'accountStatus')}
													</div>
													<div className='col-xl-1'>
														{renderHeaderCell('Joined', 'createdAt')}
													</div>
													<div className='col-xl-1'>
														{renderHeaderCell('Actions', undefined, 'end')}
													</div>
												</div>
											</div>

											<div className='p-3 p-xl-4'>
												{items.length === 0 ? (
													<div className='rounded-4 border border-dashed border-light-subtle bg-l10-light p-5 text-center text-muted'>
														No users found
													</div>
												) : (
													<div className='d-flex flex-column gap-3'>
														{paginatedItems.map((u: SerializedUser) => (
															<div
																key={u.id}
																className={`rounded-4 border border-1 border-${accountStatusColor[u.accountStatus]} border-opacity-25 bg-white shadow-sm p-3 p-xl-4`}>
																<div className='row g-3 align-items-center'>
																	<div className='col-12 col-xl-4'>
																		<div className='d-flex align-items-center gap-3'>
																			<Avatar
																				src={getInitialsAvatarUri(u.name)}
																				size={54}
																				userName={u.name}
																			/>
																			<div className='min-w-0'>
																				<div className='d-flex flex-wrap align-items-center gap-2 mb-1'>
																					<div className='fs-5 fw-semibold lh-sm'>
																						{u.name}
																					</div>
																					{u.role === 'Admin' && (
																						<Badge color='dark' isLight>
																							Staff
																						</Badge>
																					)}
																				</div>
																				<div className='text-muted small text-break mb-1'>
																					{u.email}
																				</div>
																				<div className='d-flex flex-wrap gap-3 text-muted small'>
																					<span className='d-flex align-items-center gap-1'>
																						<Icon icon='Phone' />
																						{u.phone || 'No phone'}
																					</span>
																					<span className='d-flex align-items-center gap-1'>
																						<Icon icon='Schedule' />
																						Joined {dayjs(u.createdAt).fromNow()}
																					</span>
																				</div>
																			</div>
																		</div>
																	</div>

																	<div className='col-6 col-md-3 col-xl-2'>
																		<div className='text-uppercase text-muted fw-semibold small mb-2 d-xl-none'>
																			Role
																		</div>
																		<Badge color={roleColor[u.role]} isLight className='mb-2'>
																			{u.role}
																		</Badge>
																		<div className='text-muted small'>
																			{roleDescription[u.role]}
																		</div>
																	</div>

																	<div className='col-6 col-md-3 col-xl-2'>
																		<div className='text-uppercase text-muted fw-semibold small mb-2 d-xl-none'>
																			License
																		</div>
																		{u.license ? (
																			<>
																				<Badge
																					color={licenseStatusColor[u.license.status]}
																					isLight
																					className='mb-2'>
																					{u.license.status}
																				</Badge>
																				<div className='text-muted small'>
																					{u.license.reviewedAt
																						? `Reviewed ${dayjs(
																								u.license.reviewedAt,
																						  ).format('MMM D')}`
																						: 'Awaiting document review'}
																				</div>
																			</>
																		) : (
																			<>
																				<Badge color='light' isLight className='mb-2'>
																					Not submitted
																				</Badge>
																				<div className='text-muted small'>
																					No driver's license on file
																				</div>
																			</>
																		)}
																	</div>

																	<div className='col-6 col-md-3 col-xl-2'>
																		<div className='text-uppercase text-muted fw-semibold small mb-2 d-xl-none'>
																			Account
																		</div>
																		<Badge
																			color={accountStatusColor[u.accountStatus]}
																			isLight
																			className='mb-2'>
																			{u.accountStatus}
																		</Badge>
																		<div className='text-muted small'>
																			{accountStatusDescription[u.accountStatus]}
																		</div>
																	</div>

																	<div className='col-6 col-md-3 col-xl-1'>
																		<div className='text-uppercase text-muted fw-semibold small mb-2 d-xl-none'>
																			Joined
																		</div>
																		<div className='fw-semibold small'>
																			{dayjs(u.createdAt).format('MMM D, YYYY')}
																		</div>
																		<div className='text-muted small'>
																			{dayjs(u.createdAt).fromNow()}
																		</div>
																	</div>

																	<div className='col-12 col-xl-1'>
																		<div className='d-flex justify-content-xl-end'>
																			<Dropdown>
																				<DropdownToggle hasIcon={false}>
																					<Button
																						icon='MoreHoriz'
																						color='dark'
																						isLight
																						shadow='sm'
																						isDisable={pendingUserId === u.id}
																						aria-label='More actions'
																					/>
																				</DropdownToggle>
																				<DropdownMenu isAlignmentEnd>
																					<DropdownItem>
																						<Button
																							icon='Visibility'
																							onClick={() => openDetail(u)}>
																							View
																						</Button>
																					</DropdownItem>
																					{u.accountStatus !== 'active' && (
																						<DropdownItem>
																							<Button
																								icon='CheckCircle'
																								onClick={() =>
																									handleStatusChange(
																										u.id,
																										'active',
																									)
																								}>
																								Reactivate
																							</Button>
																						</DropdownItem>
																					)}
																					{u.accountStatus === 'active' && (
																						<DropdownItem>
																							<Button
																								icon='PauseCircle'
																								onClick={() =>
																									handleStatusChange(
																										u.id,
																										'suspended',
																									)
																								}>
																								Suspend
																							</Button>
																						</DropdownItem>
																					)}
																					{u.accountStatus !== 'banned' && (
																						<DropdownItem>
																							<Button
																								icon='Block'
																								onClick={() =>
																									handleStatusChange(
																										u.id,
																										'banned',
																									)
																								}>
																								Ban
																							</Button>
																						</DropdownItem>
																					)}
																				</DropdownMenu>
																			</Dropdown>
																		</div>
																	</div>
																</div>
															</div>
														))}
													</div>
												)}
											</div>
										</div>
									</>
								)}
							</CardBody>
							<PaginationButtons
								data={filteredData}
								label='users'
								setCurrentPage={setCurrentPage}
								currentPage={currentPage}
								perPage={perPage}
								setPerPage={setPerPage}
							/>
						</Card>
					</div>
				</div>
			</Page>
			<UserDetailModal
				user={selectedUser}
				isOpen={detailModalStatus}
				setIsOpen={setDetailModalStatus}
				onStatusChange={handleStatusChange}
				onLicenseDecision={handleLicenseDecision}
			/>
		</PageWrapper>
	);
};

export default UsersListPage;
