import React, { useContext, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { ApexOptions } from 'apexcharts';
import Card, {
	CardActions,
	CardBody,
	CardHeader,
	CardLabel,
	CardSubTitle,
	CardTitle,
} from '../../../../components/bootstrap/Card';
import Button, { ButtonGroup } from '../../../../components/bootstrap/Button';
import Chart from '../../../../components/extras/Chart';
import useDarkMode from '../../../../hooks/useDarkMode';
import Alert from '../../../../components/bootstrap/Alert';
import Spinner from '../../../../components/bootstrap/Spinner';
import AdminDashboardContext from '../../../../contexts/adminDashboardContext';

const PARISH_LABELS: Record<string, string> = {
	KIN: 'Kingston',
	STA: 'St. Andrew',
	STT: 'St. Thomas',
	POR: 'Portland',
	SMY: 'St. Mary',
	SAN: 'St. Ann / Ocho Rios',
	TRL: 'Trelawny',
	SJM: 'Montego Bay',
	HAN: 'Hanover',
	WES: 'Negril / Westmoreland',
	SEL: 'St. Elizabeth',
	MAN: 'Manchester',
	CLA: 'Clarendon',
	SCA: 'St. Catherine',
};

type TParishSeries = {
	label: string;
	series: ApexOptions['series'];
};

const BookingsByLocation = () => {
	const { themeStatus } = useDarkMode();
	const { bookings, vehicles, isLoading, error } = useContext(AdminDashboardContext);
	const [activeParish, setActiveParish] = useState<string | null>(null);

	const vehicleParishById = useMemo(
		() =>
			Object.fromEntries(
				vehicles.map((vehicle) => [vehicle.id, vehicle.parishCode ?? 'UNSPECIFIED']),
			),
		[vehicles],
	);

	const years = useMemo(() => {
		const bookingYears = bookings
			.map((booking) => dayjs(booking.startDate).year())
			.filter((value, index, all) => all.indexOf(value) === index)
			.sort((a, b) => a - b);
		return bookingYears.length ? bookingYears : [dayjs().year()];
	}, [bookings]);
	const [year, setYear] = useState<number>(years[years.length - 1]);

	useEffect(() => {
		setYear((currentYear) => (years.includes(currentYear) ? currentYear : years[years.length - 1]));
	}, [years]);

	const seriesByParish = useMemo<Record<string, TParishSeries>>(() => {
		const base = bookings
			.filter((booking) => booking.status !== 'Cancelled')
			.filter((booking) => dayjs(booking.startDate).year() === year);

		const bucketMap = new Map<
			string,
			{ bookings: number[]; payouts: number[]; revenue: number[]; totalBookings: number }
		>();

		base.forEach((booking) => {
			const parishCode = vehicleParishById[booking.vehicleId] ?? 'UNSPECIFIED';
			const monthIndex = dayjs(booking.startDate).month();
			const current = bucketMap.get(parishCode) ?? {
				bookings: Array.from({ length: 12 }, () => 0),
				payouts: Array.from({ length: 12 }, () => 0),
				revenue: Array.from({ length: 12 }, () => 0),
				totalBookings: 0,
			};

			current.bookings[monthIndex] += 1;
			current.payouts[monthIndex] += booking.ownerPayout / 1000;
			current.revenue[monthIndex] += booking.totalAmount / 1000;
			current.totalBookings += 1;
			bucketMap.set(parishCode, current);
		});

		return Object.fromEntries(
			Array.from(bucketMap.entries())
				.sort((a, b) => b[1].totalBookings - a[1].totalBookings)
				.map(([parishCode, value]) => [
					parishCode,
					{
						label: PARISH_LABELS[parishCode] ?? parishCode,
						series: [
							{ name: 'Bookings', type: 'column', data: value.bookings },
							{ name: 'Payouts', type: 'column', data: value.payouts },
							{ name: 'Revenue', type: 'line', data: value.revenue },
						],
					},
				]),
		);
	}, [bookings, vehicleParishById, year]);

	const parishCodes = useMemo(() => Object.keys(seriesByParish), [seriesByParish]);

	useEffect(() => {
		if (!parishCodes.length) {
			setActiveParish(null);
			return;
		}

		setActiveParish((current) => (current && parishCodes.includes(current) ? current : parishCodes[0]));
	}, [parishCodes]);

	const chartOptions: ApexOptions = {
		chart: {
			height: 370,
			type: 'line',
			stacked: false,
			toolbar: { show: false },
		},
		colors: [
			process.env.REACT_APP_INFO_COLOR,
			process.env.REACT_APP_WARNING_COLOR,
			process.env.REACT_APP_SUCCESS_COLOR,
		],
		dataLabels: { enabled: false },
		stroke: { width: [1, 1, 4], curve: 'smooth' },
		plotOptions: { bar: { borderRadius: 5, columnWidth: '20px' } },
		xaxis: {
			categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
		},
		yaxis: [
			{
				axisTicks: { show: true },
				axisBorder: { show: true, color: process.env.REACT_APP_INFO_COLOR },
				labels: { style: { colors: process.env.REACT_APP_INFO_COLOR } },
				title: {
					text: 'Bookings (count)',
					style: { color: process.env.REACT_APP_INFO_COLOR },
				},
			},
			{
				seriesName: 'Payouts',
				opposite: true,
				axisTicks: { show: true },
				axisBorder: { show: true, color: process.env.REACT_APP_WARNING_COLOR },
				labels: { style: { colors: process.env.REACT_APP_WARNING_COLOR } },
				title: {
					text: 'Payouts (thousand JMD)',
					style: { color: process.env.REACT_APP_WARNING_COLOR },
				},
			},
			{
				seriesName: 'Revenue',
				opposite: true,
				axisTicks: { show: true },
				axisBorder: { show: true, color: process.env.REACT_APP_SUCCESS_COLOR },
				labels: { style: { colors: process.env.REACT_APP_SUCCESS_COLOR } },
				title: {
					text: 'Revenue (thousand JMD)',
					style: { color: process.env.REACT_APP_SUCCESS_COLOR },
				},
			},
		],
		tooltip: {
			theme: 'dark',
			fixed: {
				enabled: true,
				position: 'topLeft',
				offsetY: 30,
				offsetX: 60,
			},
		},
		legend: { horizontalAlign: 'left', offsetX: 40 },
	};

	return (
		<Card stretch>
			<CardHeader>
				<CardLabel icon='LocationOn'>
					<CardTitle tag='div' className='h5'>
						Bookings by Pickup Point
					</CardTitle>
					<CardSubTitle tag='div' className='h6'>
						Reports
					</CardSubTitle>
				</CardLabel>
				<CardActions>
					<ButtonGroup>
						<Button
							color='primary'
							isLight
							icon='ChevronLeft'
							aria-label='Previous Year'
							isDisable={year <= years[0]}
							onClick={() => setYear((current) => current - 1)}
						/>
						<Button color='primary' isLight isDisable>
							{year}
						</Button>
						<Button
							color='primary'
							isLight
							icon='ChevronRight'
							aria-label='Next Year'
							isDisable={year >= years[years.length - 1]}
							onClick={() => setYear((current) => current + 1)}
						/>
					</ButtonGroup>
				</CardActions>
			</CardHeader>
			<CardBody>
				{error ? (
					<Alert color='danger' icon='ReportProblem' isLight className='mb-0'>
						{error}
					</Alert>
				) : isLoading ? (
					<div className='d-flex justify-content-center py-5'>
						<Spinner />
					</div>
				) : !activeParish ? (
					<div className='text-muted'>
						No booking location data is available for {year} yet.
					</div>
				) : (
					<div className='row'>
						<div className='col-xl-3 col-xxl-2'>
							<div className='row g-3'>
								{parishCodes.map((parishCode) => (
									<div key={parishCode} className='col-xl-12 col-lg-6 col-sm-12'>
										<Button
											isLight={activeParish !== parishCode}
											onClick={() => setActiveParish(parishCode)}
											color={themeStatus}
											className='w-100 py-3'
											shadow='sm'
											hoverShadow='none'>
											{seriesByParish[parishCode].label}
										</Button>
									</div>
								))}
							</div>
						</div>
						<div className='col-xl-9 col-xxl-10'>
							<Chart
								series={seriesByParish[activeParish].series}
								options={chartOptions}
								type={chartOptions.chart?.type}
								height={chartOptions.chart?.height}
							/>
						</div>
					</div>
				)}
			</CardBody>
		</Card>
	);
};

export default BookingsByLocation;
