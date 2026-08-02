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
	maxBookings: number;
	maxPayouts: number;
	maxRevenue: number;
};

const BOOKING_COLOR = process.env.REACT_APP_INFO_COLOR ?? '#4d69fa';
const PAYOUT_COLOR = process.env.REACT_APP_WARNING_COLOR ?? '#ffcf52';
const REVENUE_COLOR = process.env.REACT_APP_SUCCESS_COLOR ?? '#46bcaa';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const getAxisMax = (value: number, minimumCeiling: number) => {
	if (value <= 0) {
		return minimumCeiling;
	}

	if (value <= minimumCeiling) {
		return minimumCeiling;
	}

	const magnitude = 10 ** Math.floor(Math.log10(value));
	return Math.ceil((value * 1.15) / magnitude) * magnitude;
};

const formatThousands = (value: number) =>
	value >= 10 ? value.toFixed(0) : value.toFixed(1).replace(/\.0$/, '');

const BookingsByLocation = () => {
	const { themeStatus } = useDarkMode();
	const { bookings, vehicles, pickupPoints, isLoading, error } = useContext(AdminDashboardContext);
	const [activeParish, setActiveParish] = useState<string | null>(null);

	const vehicleParishById = useMemo(
		() =>
			Object.fromEntries(
				vehicles.map((vehicle) => [vehicle.id, vehicle.parishCode ?? 'UNSPECIFIED']),
			),
		[vehicles],
	);

	const pickupPointById = useMemo(
		() =>
			Object.fromEntries(
				pickupPoints.map((pickupPoint) => [
					pickupPoint.id,
					{
						label: pickupPoint.name,
						parishCode: pickupPoint.parishCode,
					},
				]),
			),
		[pickupPoints],
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
			{
				bookings: number[];
				payouts: number[];
				revenue: number[];
				totalBookings: number;
				label: string;
			}
		>();

		base.forEach((booking) => {
			const fallbackParishCode = vehicleParishById[booking.vehicleId] ?? 'UNSPECIFIED';
			const pickupPoint = pickupPointById[booking.pickupPointId];
			const locationCode = booking.pickupPointId || fallbackParishCode;
			const locationLabel =
				pickupPoint?.label ??
				PARISH_LABELS[pickupPoint?.parishCode ?? fallbackParishCode] ??
				'Other pickup point';
			const monthIndex = dayjs(booking.startDate).month();
			const current = bucketMap.get(locationCode) ?? {
				bookings: Array.from({ length: 12 }, () => 0),
				payouts: Array.from({ length: 12 }, () => 0),
				revenue: Array.from({ length: 12 }, () => 0),
				totalBookings: 0,
				label: locationLabel,
			};

			current.bookings[monthIndex] += 1;
			current.payouts[monthIndex] += booking.ownerPayout / 1000;
			current.revenue[monthIndex] += booking.totalAmount / 1000;
			current.totalBookings += 1;
			bucketMap.set(locationCode, current);
		});

		return Object.fromEntries(
			Array.from(bucketMap.entries())
				.sort((a, b) => b[1].totalBookings - a[1].totalBookings)
				.map(([locationCode, value]) => [
					locationCode,
					{
						label: value.label,
						series: [
							{ name: 'Bookings', type: 'column', data: value.bookings },
							{ name: 'Payouts', type: 'column', data: value.payouts },
							{ name: 'Revenue', type: 'line', data: value.revenue },
						],
						maxBookings: Math.max(...value.bookings, 0),
						maxPayouts: Math.max(...value.payouts, 0),
						maxRevenue: Math.max(...value.revenue, 0),
					},
				]),
		);
	}, [bookings, pickupPointById, vehicleParishById, year]);

	const parishCodes = useMemo(() => Object.keys(seriesByParish), [seriesByParish]);

	useEffect(() => {
		if (!parishCodes.length) {
			setActiveParish(null);
			return;
		}

		setActiveParish((current) => (current && parishCodes.includes(current) ? current : parishCodes[0]));
	}, [parishCodes]);

	const activeSeries = activeParish ? seriesByParish[activeParish] : null;

	const chartOptions: ApexOptions = {
		chart: {
			height: 370,
			type: 'line',
			stacked: false,
			toolbar: { show: false },
		},
		colors: [BOOKING_COLOR, PAYOUT_COLOR, REVENUE_COLOR],
		dataLabels: { enabled: false },
		stroke: { width: [1, 1, 4], curve: 'smooth' },
		fill: { opacity: [0.95, 0.8, 1] },
		plotOptions: { bar: { borderRadius: 5, columnWidth: '36%', dataLabels: { position: 'top' } } },
		xaxis: {
			categories: MONTH_LABELS,
		},
		yaxis: [
			{
				min: 0,
				max: getAxisMax(activeSeries?.maxBookings ?? 0, 4),
				tickAmount: 4,
				axisTicks: { show: true },
				forceNiceScale: true,
				decimalsInFloat: 0,
				axisBorder: { show: true, color: BOOKING_COLOR },
				labels: {
					style: { colors: BOOKING_COLOR },
					formatter: (value) => `${Math.round(value)}`,
				},
				title: {
					text: 'Bookings (count)',
					style: { color: BOOKING_COLOR },
				},
			},
			{
				seriesName: 'Payouts',
				min: 0,
				max: getAxisMax(activeSeries?.maxPayouts ?? 0, 10),
				tickAmount: 5,
				opposite: true,
				axisTicks: { show: true },
				forceNiceScale: true,
				axisBorder: { show: true, color: PAYOUT_COLOR },
				labels: {
					style: { colors: PAYOUT_COLOR },
					formatter: formatThousands,
				},
				title: {
					text: 'Payouts (thousand JMD)',
					style: { color: PAYOUT_COLOR },
				},
			},
			{
				seriesName: 'Revenue',
				min: 0,
				max: getAxisMax(activeSeries?.maxRevenue ?? 0, 10),
				tickAmount: 5,
				opposite: true,
				axisTicks: { show: true },
				forceNiceScale: true,
				axisBorder: { show: true, color: REVENUE_COLOR },
				labels: {
					style: { colors: REVENUE_COLOR },
					formatter: formatThousands,
				},
				title: {
					text: 'Revenue (thousand JMD)',
					style: { color: REVENUE_COLOR },
				},
			},
		],
		tooltip: {
			theme: 'dark',
			shared: true,
			intersect: false,
			y: {
				formatter: (value, context) => {
					const seriesName = ['Bookings', 'Payouts', 'Revenue'][context?.seriesIndex ?? 0];
					if (seriesName === 'Bookings') {
						return `${Math.round(value ?? 0)} bookings`;
					}

					return `${formatThousands(value ?? 0)}k JMD`;
				},
			},
		},
		legend: { horizontalAlign: 'left', offsetX: 12, markers: { fillColors: [BOOKING_COLOR, PAYOUT_COLOR, REVENUE_COLOR] } },
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
