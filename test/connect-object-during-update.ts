import { connectObject } from "../build";
import assert from 'assert';

describe('Connecting object during update', () => {
	let counter = 0;

	const obj = connectObject({
		a: 0,
		get isAvailable() { return this.a > 0; },
		get b() {
			counter++;
			if (!this.isAvailable) {
				return null;
			}
			const self = this;
			return connectObject({
				a: 0,
				get b() {
					return this.a + 100;
				},
				get c() {
					return self.a;
				}
			});
		},
	});

	it('Parent does not connect to child', () => {
		assert(obj.b === null);
		
		obj.a = 1;
		assert(counter === 2);

		obj.b!.a = 1;
		assert(counter === 2);
		assert(obj.b!.b === 101);

		obj.b!.a = 2;
		assert(counter === 2);
		assert(obj.b!.b === 102);
	});

	it('Connections of a child do not become connections of a parent', () => {
		obj.a = 300;
		assert(counter === 2);
		assert(obj.b!.c === 300);
	});
})