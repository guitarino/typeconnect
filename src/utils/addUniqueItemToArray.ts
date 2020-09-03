export function addUniqueItemToArray<T>(item: T, array: Array<T>) {
	const index = array.indexOf(item);
	if (index < 0) {
		array.push(item);
	}
}