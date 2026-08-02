import React, { FC, useContext, useMemo } from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import Card, {
	CardBody,
	CardHeader,
	CardLabel,
	CardSubTitle,
	CardTitle,
} from '../../../../components/bootstrap/Card';
import Chart, { IChartOptions } from '../../../../components/extras/Chart';
import Icon from '../../../../components/icon/Icon';
import PercentComparison from '../../../../components/extras/PercentComparison';
import { jmdFormat } from '../../../../helpers/helpers';
import useDarkMode from '../../../../hooks/useDarkMode';
import Alert from '../../../../components/bootstrap/Alert';
import Spinner from '../../../../components/bootstrap/Spinner';
import AdminDashboardContext from '../../../../contexts/adminDashboardContext';
import { SerializedAdminBooking } from '../../../../services/adminDashboardApi';
import { TTabs } from '../common/helper';

interface IRevenueOverviewProps {
	activeTab: TTabs;
}

const isNonCancelledBooking = (booking: SerializedAdminBooking) => booking.status !== 'Cancelled';

const countOpenBookingsAt = (bookings: SerializedAdminBooking[], snapshot: dayjs.Dayjs) =>
	bookings.filter(
		(booking) =>
			isNonCancelledBooking(booking) &&
			dayjs(booking.createdAt).isBefore(snapshot.endOf('day')) &&
			dayjs(booking.endDate).isAfter(snapshot.startOf('day')),
	).length;

const RevenueOverview: FC<IRevenueOverviewProps> = ({ activeTab }) => {
	const { darkModeStatus } = useDarkMode();
	const { bookings, payouts, isLoading, error } = useContext(AdminDashboardContext);

	const {
		revenueThisMonthJmd,
		revenueLastMonthJmd,
		activeBookings,
		activeBookingsLastWeek,
		pendingPayoutsCount,
		pendingPayoutsTotalJmd,
		seriesData,
	} = useMemo(() => {
		const now = dayjs();
		const currentMonthStart = now.startOf('month');
		const lastMonthStart = currentMonthStart.subtract(1, 'month');
		const lastMonthEnd = currentMonthStart.subtract(1, 'day').endOf('day');
		const liveBookings = bookings.filter(isNonCancelledBooking);

		const revenueThisMonth = liveBookings
			.filter((booking) => dayjs(booking.startDate).isSame(currentMonthStart, 'month'))
			.reduce((sum, booking) => sum + booking.totalAmount, 0);
		const revenueLastMonth = liveBookings
			.filter(
				(booking) =>
					dayjs(booking.startDate).isSame(lastMonthStart, 'month') &&
					dayjs(booking.startDate).isBefore(lastMonthEnd),
			)
			.reduce((sum, booking) => sum + booking.totalAmount, 0);

		const currentActiveBookings = countOpenBookingsAt(liveBookings, now);
		const previousActiveBookings = countOpenBookingsAt(liveBookings, now.subtract(7, 'day'));
		const pendingPayoutRequests = payouts.filter((payout) => payout.status === 'Pending');

		const seriesByTab: Record<TTabs, number[]> = {
			Weekly: Array.from({ length: 7 }, (_unused, index) => {
				const day = now.subtract(6 - index, 'day');
				return liveBookings
					.filter((booking) => dayjs(booking.startDate).isSame(day, 'day'))
					.reduce((sum, booking) => sum + booking.totalAmount, 0);
			}),
			Monthly: Array.from({ length: 6 }, (_unused, index) => {
				const month = now.subtract(5 - index, 'month');
				return liveBookings
					.filter((booking) => dayjs(booking.startDate).isSame(month, 'month'))
					.reduce((sum, booking) => sum + booking.totalAmount, 0);
			}),
			Yearly: Array.from({ length: 12 }, (_unused, index) => {
				const month = now.startOf('year').add(index, 'month');
				return liveBookings
					.filter((booking) => dayjs(booking.startDate).isSame(month, 'month'))
					.reduce((sum, booking) => sum + booking.totalAmount, 0);
			}),
		};

		return {
			revenueThisMonthJmd: revenueThisMonth,
			revenueLastMonthJmd: revenueLastMonth,
			activeBookings: currentActiveBookings,
			activeBookingsLastWeek: previousActiveBookings,
			pendingPayoutsCount: pendingPayoutRequests.length,
			pendingPayoutsTotalJmd: pendingPayoutRequests.reduce(
				(sum, payout) => sum + payout.amount,
				0,
			),
			seriesData: seriesByTab[activeTab],
		};
	}, [activeTab, bookings, payouts]);

	const chartOptions: IChartOptions['options'] = {
		colors: [process.env.REACT_APP_SUCCESS_COLOR],
		chart: {
			type: 'line',
			width: '100%',
			height: 150,
			sparkline: { enabled: true },
		},
		tooltip: {
			theme: 'dark',
			fixed: { enabled: false },
			x: { show: false },
			y: {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				title: { formatter: (seriesName: any) => '' },
			},
		},
		stroke: { curve: 'smooth', width: 2 },
	};

	return (
		<Card stretch>
			<CardHeader>
				<CardLabel icon='PointOfSale' iconColor='success'>
					<CardTitle tag='div' className='h5'>
						Revenue
					</CardTitle>
					<CardSubTitle tag='div' className='h6'>
						{activeTab}
					</CardSubTitle>
				</CardLabel>
			</CardHeader>
			<CardBody>
				<div className='row g-4'>
					<div className='col-md-6'>
						<Card
							className={classNames('transition-base rounded-2 mb-0 text-dark', {
								'bg-l25-success bg-l10-success-hover': !darkModeStatus,
								'bg-lo50-success bg-lo25-success-hover': darkModeStatus,
							})}
							stretch
							shadow='sm'>
							<CardHeader className='bg-transparent'>
								<CardLabel>
									<CardTitle tag='div' className='h5'>
										Revenue This Month
									</CardTitle>
								</CardLabel>
							</CardHeader>
							<CardBody>
								{error ? (
									<Alert color='danger' icon='ReportProblem' isLight>
										{error}
									</Alert>
								) : isLoading ? (
									<div className='d-flex justify-content-center py-5'>
										<Spinner />
									</div>
								) : (
									<>
										<Chart
											className='mx-n4'
											series={[{ data: seriesData }]}
											options={chartOptions}
											type={chartOptions.chart?.type}
											height={chartOptions.chart?.height}
											width={chartOptions.chart?.width}
										/>
										<div className='d-flex align-items-center pb-3'>
											<div className='flex-shrink-0'>
												<Icon icon='AttachMoney' size='4x' color='success' />
											</div>
											<div className='flex-grow-1 ms-3'>
												<div className='fw-bold fs-3 mb-0'>
													{jmdFormat(revenueThisMonthJmd)}
													{revenueLastMonthJmd > 0 && (
														<PercentComparison
															valueOne={revenueThisMonthJmd}
															valueTwo={revenueLastMonthJmd}
														/>
													)}
												</div>
												<div
													className={classNames({
														'text-muted': !darkModeStatus,
														'text-light': darkModeStatus,
													})}>
													Compared to ({jmdFormat(revenueLastMonthJmd)} last
													month)
												</div>
											</div>
										</div>
									</>
								)}
							</CardBody>
						</Card>
					</div>
					<div className='col-md-6'>
						<Card
							className={classNames('transition-base rounded-2 mb-4 text-dark', {
								'bg-l25-primary bg-l10-primary-hover': !darkModeStatus,
								'bg-lo50-primary bg-lo25-primary-hover': darkModeStatus,
							})}
							shadow='sm'>
							<CardHeader className='bg-transparent'>
								<CardLabel>
									<CardTitle tag='div' className='h5'>
										Active Bookings
									</CardTitle>
								</CardLabel>
							</CardHeader>
							<CardBody>
								{error ? (
									<Alert color='danger' icon='ReportProblem' isLight>
										{error}
									</Alert>
								) : isLoading ? (
									<div className='d-flex justify-content-center py-5'>
										<Spinner />
									</div>
								) : (
									<div className='d-flex align-items-center pb-3'>
										<div className='flex-shrink-0'>
											<Icon
												icon='emoji_transportation'
												size='4x'
												color='primary'
											/>
										</div>
										<div className='flex-grow-1 ms-3'>
											<div className='fw-bold fs-3 mb-0'>
												{activeBookings}
												{activeBookingsLastWeek > 0 && (
													<PercentComparison
														valueOne={activeBookings}
														valueTwo={activeBookingsLastWeek}
													/>
												)}
											</div>
											<div
												className={classNames({
													'text-muted': !darkModeStatus,
													'text-light': darkModeStatus,
												})}>
												Compared to ({activeBookingsLastWeek} open booking
												{activeBookingsLastWeek === 1 ? '' : 's'} one week
												ago)
											</div>
										</div>
									</div>
								)}
							</CardBody>
						</Card>
						<Card
							className={classNames('transition-base rounded-2 mb-0 text-dark', {
								'bg-l25-warning bg-l10-warning-hover': !darkModeStatus,
								'bg-lo50-warning bg-lo25-warning-hover': darkModeStatus,
							})}
							shadow='sm'>
							<CardHeader className='bg-transparent'>
								<CardLabel>
									<CardTitle tag='div' className='h5'>
										Pending Payouts
									</CardTitle>
								</CardLabel>
							</CardHeader>
							<CardBody>
								{error ? (
									<Alert color='danger' icon='ReportProblem' isLight>
										{error}
									</Alert>
								) : isLoading ? (
									<div className='d-flex justify-content-center py-5'>
										<Spinner />
									</div>
								) : (
									<div className='d-flex align-items-center pb-3'>
										<div className='flex-shrink-0'>
											<Icon
												icon='AccountBalanceWallet'
												size='4x'
												color='warning'
											/>
										</div>
										<div className='flex-grow-1 ms-3'>
											<div className='fw-bold fs-3 mb-0'>
												{pendingPayoutsCount}
											</div>
											<div
												className={classNames({
													'text-muted': !darkModeStatus,
													'text-light': darkModeStatus,
												})}>
												{jmdFormat(pendingPayoutsTotalJmd)} waiting to be
												processed
											</div>
										</div>
									</div>
								)}
							</CardBody>
						</Card>
					</div>
				</div>
			</CardBody>
		</Card>
	);
};

export default RevenueOverview;
