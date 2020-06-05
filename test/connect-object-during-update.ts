import { connectObject } from "../build";
import expect from "expect.js";

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
		expect(obj.b).to.equal(null);
		
		obj.a = 1;
		expect(counter).to.equal(2);

		obj.b!.a = 1;
		expect(counter).to.equal(2);
		expect(obj.b!.b).to.equal(101);

		obj.b!.a = 2;
		expect(counter).to.equal(2);
		expect(obj.b!.b).to.equal(102);
	});

	it('Connections of a child do not become connections of a parent', () => {
		obj.a = 300;
		expect(counter).to.equal(2);
		expect(obj.b!.c).to.equal(300);
	});
})