import test from "ava";
import { connectObject } from "./utils/api";

test(`Connecting object during update`, t => {
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

	t.assert(obj.b === null, `Parent does not connect to child`);
	
	obj.a = 1;
	t.assert(obj.isAvailable, `Parent does not connect to child`);
	t.assert(counter === 2, `Parent does not connect to child`);

	obj.b.a = 1;
	t.assert(obj.isAvailable, `Parent does not connect to child`);
	t.assert(counter === 2, `Parent does not connect to child`);
	t.assert(obj.b!.b === 101, `Parent does not connect to child`);

	obj.b.a = 2;
	t.assert(obj.isAvailable, `Parent does not connect to child`);
	t.assert(counter === 2, `Parent does not connect to child`);
	t.assert(obj.b!.b === 102, `Parent does not connect to child`);

	obj.a = 300;
	t.assert(obj.isAvailable, `Connections of a child do not become connections of a parent`);
	t.assert(counter === 2, `Connections of a child do not become connections of a parent`);
	t.assert(obj.b!.c === 300, `Connections of a child do not become connections of a parent`);
});