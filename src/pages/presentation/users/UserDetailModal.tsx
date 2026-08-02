import React, { FC } from 'react';
import dayjs from 'dayjs';
import Modal, {
	ModalBody,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from '../../../components/bootstrap/Modal';
import Button from '../../../components/bootstrap/Button';
import Badge from '../../../components/bootstrap/Badge';
import Icon from '../../../components/icon/Icon';
import Avatar from '../../../components/Avatar';
import { getInitialsAvatarUri } from '../../../helpers/helpers';
import { AccountStatus, SerializedUser } from '../../../services/authApi';
import LicenseReviewPanel from './LicenseReviewPanel';

const accountStatusColor: Record<AccountStatus, 'success' | 'warning' | 'danger'> = {
	active: 'success',
	suspended: 'warning',
	banned: 'danger',
};
const roleColor = { Owner: 'info', Renter: 'primary', Admin: 'dark' } as const;
const accountStatusDescription: Record<AccountStatus, string> = {
	active: 'This account can access the platform normally.',
	suspended: 'This account is temporarily restricted.',
	banned: 'This account has been blocked from the platform.',
};

interface IUserDetailModalProps {
	user: SerializedUser | null;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
	onStatusChange(userId: string, status: AccountStatus): void;
	onLicenseDecision(updatedUser: SerializedUser): void;
}
const UserDetailModal: FC<IUserDetailModalProps> = ({
	user,
	isOpen,
	setIsOpen,
	onStatusChange,
	onLicenseDecision,
}) => {
	if (!user) {
		return null;
	}

	return (
		<Modal isOpen={isOpen} setIsOpen={setIsOpen} titleId={user.id} isCentered size='xl'>
			<ModalHeader setIsOpen={setIsOpen} className='border-0 px-4 px-xl-5 pt-4 pt-xl-5 pb-0'>
				<ModalTitle id={user.id} className='fs-4 fw-semibold'>
					User Profile
				</ModalTitle>
			</ModalHeader>
			<ModalBody className='px-4 px-xl-5 pb-4'>
				<div className='rounded-4 border border-light-subtle bg-l10-light p-4 p-xl-5 mb-4'>
					<div className='d-flex flex-column flex-xl-row align-items-xl-center justify-content-between gap-4'>
						<div className='d-flex align-items-center gap-3 gap-xl-4'>
							<Avatar src={getInitialsAvatarUri(user.name)} size={84} userName={user.name} />
							<div>
								<div className='d-flex flex-wrap align-items-center gap-2 mb-2'>
									<div className='fs-3 fw-bold lh-sm'>{user.name}</div>
									<Badge color={roleColor[user.role]} isLight>
										{user.role}
									</Badge>
									<Badge color={accountStatusColor[user.accountStatus]} isLight>
										{user.accountStatus}
									</Badge>
								</div>
								<div className='text-muted mb-2'>{user.email}</div>
								<div className='d-flex flex-wrap gap-3 text-muted small'>
									<span className='d-flex align-items-center gap-1'>
										<Icon icon='Schedule' />
										Joined {dayjs(user.createdAt).format('MMM D, YYYY')}
									</span>
									<span className='d-flex align-items-center gap-1'>
										<Icon icon='Update' />
										Updated {dayjs(user.updatedAt).fromNow()}
									</span>
								</div>
							</div>
						</div>
						<div className='rounded-4 bg-white border border-light-subtle p-3 p-xl-4' style={{ maxWidth: 320 }}>
							<div className='text-uppercase text-muted fw-semibold small mb-2'>
								Account Health
							</div>
							<div className='fw-semibold mb-1'>{user.accountStatus}</div>
							<div className='text-muted small'>{accountStatusDescription[user.accountStatus]}</div>
						</div>
					</div>
				</div>

				<div className='row g-4'>
					<div className='col-lg-5'>
						<div className='rounded-4 border border-light-subtle bg-white p-4 h-100'>
							<div className='text-uppercase text-muted fw-semibold small mb-3'>
								Contact Details
							</div>
							<div className='d-flex flex-column gap-3'>
								<div className='d-flex align-items-start gap-3'>
									<div
										className='d-flex align-items-center justify-content-center rounded-4 bg-l10-primary text-primary'
										style={{ width: 44, height: 44 }}>
										<Icon icon='Email' />
									</div>
									<div>
										<div className='fw-semibold'>Email</div>
										<a href={`mailto:${user.email}`} className='text-decoration-none'>
											{user.email}
										</a>
									</div>
								</div>
								<div className='d-flex align-items-start gap-3'>
									<div
										className='d-flex align-items-center justify-content-center rounded-4 bg-l10-info text-info'
										style={{ width: 44, height: 44 }}>
										<Icon icon='Phone' />
									</div>
									<div>
										<div className='fw-semibold'>Phone</div>
										<div className='text-muted'>{user.phone || 'No phone number added yet'}</div>
									</div>
								</div>
								<div className='d-flex align-items-start gap-3'>
									<div
										className='d-flex align-items-center justify-content-center rounded-4 bg-l10-warning text-warning'
										style={{ width: 44, height: 44 }}>
										<Icon icon='Info' />
									</div>
									<div>
										<div className='fw-semibold'>Bio</div>
										<div className='text-muted'>
											{user.bio || 'This user has not added a profile bio yet.'}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className='col-lg-7'>
						<LicenseReviewPanel user={user} onDecision={onLicenseDecision} />
					</div>
				</div>
			</ModalBody>
			<ModalFooter className='border-0 px-4 px-xl-5 pb-4 pb-xl-5 pt-0 d-flex justify-content-between gap-3 flex-wrap'>
				<div className='text-muted small'>
					Opened for {user.role.toLowerCase()} account review
				</div>
				<div className='d-flex gap-2 flex-wrap'>
				{user.accountStatus !== 'active' && (
					<Button
						color='success'
						icon='CheckCircle'
						onClick={() => onStatusChange(user.id, 'active')}>
						Reactivate
					</Button>
				)}
				{user.accountStatus !== 'suspended' && user.accountStatus !== 'banned' && (
					<Button
						color='warning'
						icon='PauseCircle'
						onClick={() => onStatusChange(user.id, 'suspended')}>
						Suspend
					</Button>
				)}
				{user.accountStatus !== 'banned' && (
					<Button
						color='danger'
						icon='Block'
						onClick={() => onStatusChange(user.id, 'banned')}>
						Ban
					</Button>
				)}
				<Button color='light' onClick={() => setIsOpen(false)}>
					Close
				</Button>
				</div>
			</ModalFooter>
		</Modal>
	);
};

export default UserDetailModal;
