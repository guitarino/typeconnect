export function next() {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve(0);
		}, 0);
	})
}