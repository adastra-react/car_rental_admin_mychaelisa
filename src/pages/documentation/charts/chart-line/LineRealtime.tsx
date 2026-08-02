import React, { useEffect, useRef, useState } from 'react';
import Card, {
	CardBody,
	CardHeader,
	CardLabel,
	CardSubTitle,
	CardTitle,
} from '../../../../components/bootstrap/Card';
import Chart, { IChartOptions } from '../../../../components/extras/Chart';

const LineRealtime = () => {
	const lastDateRef = useRef(0);
	const dataRef = useRef<any[]>([]);
	const TICK_INTERVAL = 86400000;
	const X_AXIS_RANGE = 777600000;

	const chartOptions: IChartOptions['options'] = {
		chart: {
			id: 'realtime',
			height: 350,
			type: 'line',
			animations: {
				enabled: true,
				dynamicAnimation: {
					speed: 1000,
				},
			},
			toolbar: {
				show: false,
			},
			zoom: {
				enabled: false,
			},
		},
		dataLabels: {
			enabled: false,
		},
		stroke: {
			curve: 'smooth',
		},
		title: {
			text: 'Dynamic Updating Chart',
			align: 'left',
		},
		markers: {
			size: 0,
		},
		xaxis: {
			type: 'datetime',
			range: X_AXIS_RANGE,
		},
		yaxis: {
			max: 100,
		},
		legend: {
			show: false,
		},
	};
	const [state, setState] = useState<IChartOptions>({
		series: [
			{
				data: [],
			},
		],
		options: chartOptions,
	});

	useEffect(() => {
		function getDayWiseTimeSeries(
			baseval: number,
			count: number,
			yrange: { min: any; max: any },
		) {
			const seeded: any[] = [];
			let value = baseval;
			let i = 0;
			while (i < count) {
				const y = Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;
				seeded.push({ x: value, y });
				lastDateRef.current = value;
				value += TICK_INTERVAL;
				i += 1;
			}
			return seeded;
		}
		function getNewSeries(baseval: number, yrange: { min: any; max: any }) {
			const data = dataRef.current;
			const newDate = baseval + TICK_INTERVAL;
			lastDateRef.current = newDate;

			for (let i = 0; i < data.length - 10; i += 1) {
				// IMPORTANT
				// we reset the x and y of the data which is out of drawing area
				// to prevent memory leaks
				data[i].x = newDate - X_AXIS_RANGE - TICK_INTERVAL;
				data[i].y = 0;
			}

			data.push({
				x: newDate,
				y: Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min,
			});
		}

		dataRef.current = getDayWiseTimeSeries(new Date('11 Feb 2017 GMT').getTime(), 10, {
			min: 10,
			max: 90,
		});
		setState((prev) => ({
			series: [{ data: dataRef.current.slice() }],
			options: prev.options,
		}));

		const interval = window.setInterval(() => {
			getNewSeries(lastDateRef.current, {
				min: 10,
				max: 90,
			});
			setState((prev) => ({
				series: [
					{
						data: dataRef.current.slice(),
					},
				],
				options: prev.options,
			}));
		}, 1000);
		return () => {
			window.clearInterval(interval);
		};
	}, []);
	return (
		<div className='col-lg-6'>
			<Card stretch>
				<CardHeader>
					<CardLabel icon='ShowChart' iconColor='secondary'>
						<CardTitle>
							type <small>line</small>
						</CardTitle>
						<CardSubTitle>Chart</CardSubTitle>
					</CardLabel>
				</CardHeader>
				<CardBody>
					<Chart options={state.options} series={state.series} type='line' height={350} />
				</CardBody>
			</Card>
		</div>
	);
};

export default LineRealtime;
