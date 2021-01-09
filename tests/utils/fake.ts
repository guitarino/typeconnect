export type Fake = ((...args: any) => any) & {
	calls: any[],
};

export function fake(): Fake {
	const calls: any[] = [];
	
	function fun (...args) {
		calls.push(args);
	}

	fun.calls = calls;
	return fun;
}