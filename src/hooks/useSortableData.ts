import { useMemo, useState } from 'react';

interface ISortConfig {
	key: any;
	direction: 'ascending' | 'descending';
}

const useSortableData = (items: any[], config: ISortConfig | null = null) => {
	const [sortConfig, setSortConfig] = useState<ISortConfig | null>(config);

	const sortedItems = useMemo(() => {
		const sortableItems = [...items];
		if (sortConfig !== null) {
			sortableItems.sort((a, b) => {
				if (a[sortConfig.key] < b[sortConfig.key]) {
					return sortConfig.direction === 'ascending' ? -1 : 1;
				}
				if (a[sortConfig.key] > b[sortConfig.key]) {
					return sortConfig.direction === 'ascending' ? 1 : -1;
				}
				return 0;
			});
		}
		return sortableItems;
	}, [items, sortConfig]);

	const requestSort = (key: any) => {
		let direction: ISortConfig['direction'] = 'ascending';
		if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
			direction = 'descending';
		}
		setSortConfig({ key, direction });
	};

	const getClassNamesFor = (key: any) => {
		if (!sortConfig) {
			return 'd-none';
		}

		return sortConfig.key === key ? sortConfig.direction : 'd-none';
	};

	return { items: sortedItems, requestSort, getClassNamesFor, sortConfig };
};

export default useSortableData;
