const generateDataHeatMap = (
	count: number,
	yrange: { min: any; max: any },
): { x: string; y: number }[] => {
	let i = 0;
	const series: { x: string; y: number }[] = [];
	while (i < count) {
		const x = (i + 1).toString();
		const y = Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;

		series.push({
			x,
			y,
		});
		i += 1;
	}
	return series;
};
export default generateDataHeatMap;
