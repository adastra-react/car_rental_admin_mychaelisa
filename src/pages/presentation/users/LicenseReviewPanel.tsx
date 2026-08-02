import React, { FC, useState } from 'react';
import dayjs from 'dayjs';
import Button from '../../../components/bootstrap/Button';
import Badge from '../../../components/bootstrap/Badge';
import Alert from '../../../components/bootstrap/Alert';
import Spinner from '../../../components/bootstrap/Spinner';
import Icon from '../../../components/icon/Icon';
import Textarea from '../../../components/bootstrap/forms/Textarea';
import { getApiErrorMessage, resolveAssetUrl } from '../../../services/apiClient';
import { SerializedUser, updateLicenseStatus } from '../../../services/authApi';

const licenseStatusColor = {
	verified: 'success',
	pending: 'warning',
	rejected: 'danger',
} as const;

interface ILicenseReviewPanelProps {
	user: SerializedUser;
	onDecision(updatedUser: SerializedUser): void;
}

const LicenseReviewPanel: FC<ILicenseReviewPanelProps> = ({ user, onDecision }) => {
	const [isRejecting, setIsRejecting] = useState(false);
	const [rejectionReason, setRejectionReason] = useState('');
	const [submitting, setSubmitting] = useState<'verified' | 'rejected' | null>(null);
	const [decisionError, setDecisionError] = useState<string | null>(null);

	const { license } = user;

	const decide = async (status: 'verified' | 'rejected') => {
		setSubmitting(status);
		setDecisionError(null);
		try {
			const updated = await updateLicenseStatus(
				user.id,
				status,
				status === 'rejected' ? rejectionReason : undefined,
			);
			onDecision(updated);
			setIsRejecting(false);
			setRejectionReason('');
		} catch (err) {
			setDecisionError(getApiErrorMessage(err));
		} finally {
			setSubmitting(null);
		}
	};

	if (!license) {
		return (
			<div className='rounded-4 border border-light-subtle bg-white p-4 h-100'>
				<div className='text-uppercase text-muted fw-semibold small mb-3'>
					License Review
				</div>
				<div className='d-flex align-items-start gap-3'>
					<div
						className='d-flex align-items-center justify-content-center rounded-4 bg-l10-dark text-dark'
						style={{ width: 48, height: 48 }}>
						<Icon icon='Badge' />
					</div>
					<div>
						<div className='d-flex align-items-center gap-2 mb-2'>
							<div className='fw-semibold'>No license submitted</div>
							<Badge color='light' isLight>
								Not submitted
							</Badge>
						</div>
						<div className='text-muted'>
							This person has not uploaded a driver&apos;s license yet.
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='rounded-4 border border-light-subtle bg-white p-4 h-100'>
			<div className='d-flex flex-column flex-xl-row align-items-xl-start justify-content-between gap-3 mb-4'>
				<div>
					<div className='text-uppercase text-muted fw-semibold small mb-2'>
						License Review
					</div>
					<div className='d-flex align-items-center gap-2 flex-wrap'>
						<div className='fw-semibold'>Driver&apos;s license status</div>
						<Badge color={licenseStatusColor[license.status]} isLight>
							{license.status}
						</Badge>
						{license.reviewedAt && (
							<span className='text-muted small'>
								Reviewed {dayjs(license.reviewedAt).format('MMM D, YYYY h:mm A')}
							</span>
						)}
					</div>
				</div>
				<div className='text-muted small'>
					Manual review for uploaded license document
				</div>
			</div>

			<div className='rounded-4 border border-light-subtle bg-l10-light p-3 mb-3 text-center'>
				<img
					src={resolveAssetUrl(license.url)}
					alt="Driver's license"
					className='img-fluid rounded-4'
					style={{ maxHeight: 400, objectFit: 'contain' }}
				/>
			</div>

			{license.status === 'rejected' && license.rejectionReason && (
				<div className='rounded-4 border border-danger border-opacity-25 bg-l10-danger p-3 mb-3'>
					<div className='text-uppercase text-danger fw-semibold small mb-1'>
						Rejection Reason
					</div>
					<div className='text-muted small'>{license.rejectionReason}</div>
				</div>
			)}

			{decisionError && (
				<Alert color='danger' icon='ReportProblem' isLight className='mb-3'>
					{decisionError}
				</Alert>
			)}

			{isRejecting ? (
				<div className='mb-3'>
					<div className='text-uppercase text-muted fw-semibold small mb-2'>
						Provide feedback
					</div>
					<Textarea
						placeholder="Reason (optional — defaults to 'License did not pass manual review')"
						rows={3}
						value={rejectionReason}
						onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
							setRejectionReason(e.target.value)
						}
					/>
						<div className='d-flex gap-2 mt-2'>
							<Button
								color='danger'
							isDisable={submitting !== null}
							onClick={() => decide('rejected')}>
							{submitting === 'rejected' && <Spinner isSmall inButton isGrow />}
							Confirm reject
						</Button>
						<Button
							color='light'
							isDisable={submitting !== null}
							onClick={() => setIsRejecting(false)}>
							Cancel
						</Button>
					</div>
				</div>
			) : (
				<div className='d-flex gap-2 flex-wrap'>
					<Button
						color='success'
						icon='CheckCircle'
						isDisable={submitting !== null}
						onClick={() => decide('verified')}>
						{submitting === 'verified' && <Spinner isSmall inButton isGrow />}
						Approve
					</Button>
					<Button
						color='danger'
						icon='Block'
						isDisable={submitting !== null}
						onClick={() => setIsRejecting(true)}>
						Reject
					</Button>
				</div>
			)}
		</div>
	);
};

export default LicenseReviewPanel;
