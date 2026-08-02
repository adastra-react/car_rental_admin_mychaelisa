import React, { FC, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import Card, {
	CardActions,
	CardBody,
	CardHeader,
	CardLabel,
	CardSubTitle,
	CardTitle,
} from '../../../../components/bootstrap/Card';
import Button from '../../../../components/bootstrap/Button';
import Popovers from '../../../../components/bootstrap/Popovers';
import Avatar from '../../../../components/Avatar';
import Chart, { IChartOptions } from '../../../../components/extras/Chart';
import { getInitialsAvatarUri } from '../../../../helpers/helpers';
import { SerializedUser } from '../../../../services/authApi';
import AdminUsersContext from '../../../../contexts/adminUsersContext';

const REVIEW_TARGET_DAYS = 14;

interface IPendingReviewRowProps {
	user: SerializedUser;
}
const PendingReviewRow: FC<IPendingReviewRowProps> = ({ user }) => {
	const daysWaiting = dayjs().diff(dayjs(user.createdAt), 'day');
	const percentElapsed = Math.min(100, Math.round((daysWaiting / REVIEW_TARGET_DAYS) * 100));
	const color = percentElapsed >= 100 ? 'danger' : 'warning';

	const [state] = useState<IChartOptions>({
		series: [percentElapsed],
		options: {
			chart: {
				type: 'radialBar',
				width: 50,
				height: 50,
				sparkline: { enabled: true },
			},
			dataLabels: { enabled: false },
			plotOptions: {
				radialBar: {
					hollow: { margin: 0, size: '50%' },
					track: { margin: 0 },
					dataLabels: { show: false },
				},
			},
			stroke: { lineCap: 'round' },
			colors: [
				color === 'danger'
					? process.env.REACT_APP_DANGER_COLOR
					: process.env.REACT_APP_WARNING_COLOR,
			],
		},
	});

	return (
		<div className='col-12'>
			<div className='row g-2'>
				<div className='col d-flex'>
					<div className='flex-shrink-0'>
						<Avatar
							src={getInitialsAvatarUri(user.name)}
							size={54}
							userName={user.name}
						/>
					</div>
					<div className='flex-grow-1 ms-3 d-flex justify-content-between align-items-center'>
						<div>
							<div className='fw-bold fs-6 mb-0'>{user.name}</div>
							<div className='text-muted mt-n1'>
								<small>
									{user.role} &middot; waiting {daysWaiting} day
									{daysWaiting === 1 ? '' : 's'}
								</small>
							</div>
						</div>
					</div>
				</div>
				<div className='col-auto'>
					<div className='d-flex align-items-center'>
						<Popovers
							desc={`% of ${REVIEW_TARGET_DAYS}-day review target elapsed`}
							trigger='hover'>
							<span className='me-3'>%{percentElapsed}</span>
						</Popovers>
						<Chart
							series={state.series}
							options={state.options}
							type={state.options.chart?.type}
							height={state.options.chart?.height}
							width={state.options.chart?.width}
							className='me-3'
						/>
						<Button
							color='info'
							isLight
							icon='Email'
							className='text-nowrap'
							tag='a'
							href={`mailto:${user.email}`}>
							Email
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

const PendingLicenseReviews = () => {
	const navigate = useNavigate();
	const { users } = useContext(AdminUsersContext);
	const pendingReviews = users.filter((u) => u.license?.status === 'pending');

	return (
		<Card stretch>
			<CardHeader>
				<CardLabel icon='Badge' iconColor='secondary'>
					<CardTitle tag='div' className='h5'>
						Pending License Reviews
					</CardTitle>
					<CardSubTitle tag='div' className='h6'>
						Owners &amp; renters
					</CardSubTitle>
				</CardLabel>
				<CardActions>
					<Button icon='ArrowForward' isLight onClick={() => navigate('/users')}>
						View all
					</Button>
				</CardActions>
			</CardHeader>
			<CardBody>
				<div className='row g-3'>
					{pendingReviews.map((user) => (
						<PendingReviewRow key={user.id} user={user} />
					))}
				</div>
			</CardBody>
		</Card>
	);
};

export default PendingLicenseReviews;
