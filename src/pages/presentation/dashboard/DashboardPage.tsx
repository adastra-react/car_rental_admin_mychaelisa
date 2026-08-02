import React, { useState } from 'react';
import dayjs from 'dayjs';
import { carRentalMenu } from '../../../menu';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import SubHeader, { SubHeaderLeft, SubHeaderRight } from '../../../layout/SubHeader/SubHeader';
import Page from '../../../layout/Page/Page';
import Icon from '../../../components/icon/Icon';
import Button, { ButtonGroup } from '../../../components/bootstrap/Button';
import DashboardAlert from './carRental/DashboardAlert';
import DutyReviewerCard from './carRental/DutyReviewerCard';
import VerificationQueueCard from './carRental/VerificationQueueCard';
import PayoutsQueueCard from './carRental/PayoutsQueueCard';
import RevenueOverview from './carRental/RevenueOverview';
import RecentActivity from './carRental/RecentActivity';
import PendingApprovals from './carRental/PendingApprovals';
import BookingsByLocation from './carRental/BookingsByLocation';
import PendingLicenseReviews from './carRental/PendingLicenseReviews';
import { TABS, TTabs } from './common/helper';

const DashboardPage = () => {
	const [activeTab, setActiveTab] = useState<TTabs>(TABS.YEARLY);

	return (
		<PageWrapper title={carRentalMenu.dashboard.text}>
			<SubHeader>
				<SubHeaderLeft>
					<span className='h4 mb-0 fw-bold me-3'>Overview</span>
					<ButtonGroup>
						{Object.values(TABS).map((tab) => (
							<Button
								key={tab}
								color='primary'
								isLight={activeTab !== tab}
								onClick={() => setActiveTab(tab)}>
								{tab}
							</Button>
						))}
					</ButtonGroup>
				</SubHeaderLeft>
				<SubHeaderRight>
					<span className='text-muted'>
						<Icon icon='Today' className='me-2' />
						{dayjs().format('LL')}
					</span>
				</SubHeaderRight>
			</SubHeader>
			<Page container='fluid'>
				<div className='row g-4'>
					<div className='col-12'>
						<DashboardAlert />
					</div>

					<div className='col-xxl-4 col-lg-6'>
						<DutyReviewerCard />
					</div>
					<div className='col-xxl-4 col-lg-6'>
						<VerificationQueueCard />
					</div>
					<div className='col-xxl-4 col-lg-12'>
						<PayoutsQueueCard />
					</div>

					<div className='col-xxl-6'>
						<RevenueOverview activeTab={activeTab} />
					</div>
					<div className='col-xxl-3'>
						<RecentActivity />
					</div>
					<div className='col-xxl-3'>
						<PendingApprovals />
					</div>

					<div className='col-xxl-8'>
						<BookingsByLocation />
					</div>
					<div className='col-xxl-4'>
						<PendingLicenseReviews />
					</div>
				</div>
			</Page>
		</PageWrapper>
	);
};

export default DashboardPage;
