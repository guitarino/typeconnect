export function lastArrayItem<T>(array: Array<T>): T {
	return array[array.length - 1];
}

export function addUniqueItemToArray<T>(item: T, array: Array<T>) {
	const index = array.indexOf(item);
	if (index < 0) {
		array.push(item);
	}
}

export function removeItemFromArrayIfExists<T>(item: T, array: Array<T>) {
	const index = array.indexOf(item);
	if (index >= 0) {
		array.splice(index, 1);
	}
}