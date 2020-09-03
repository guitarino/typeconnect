import { connect, configureConnect } from "../build";
import assert from 'assert';

class TemplateClass {
	a: number = 1;
	
	b: number = 2;

	get c(): number {
		return this.a + this.b;
	}
	
	d(): number {
		return this.c + 4;
	}
}

describe(`Node lookup and node names`, () => {
	const A = connect(TemplateClass);
	const a = new A();

	configureConnect({
		addNodeLookupToClass: true,
	});
	
	const B = connect(TemplateClass);
	const b = new B();

	configureConnect({
		addPropertyNamesToNodes: true,
	});
	
	const C = connect(TemplateClass);
	const c = new C();

	it(`Does not return nodes unless configured`, () => {
		const aInDebug = a as any;
		assert(aInDebug._nodeLookup === undefined);
	});

	it(`Returns nodes correctly if configured`, () => {
		const bInDebug = b as any;
		assert(bInDebug._nodeLookup !== undefined);

		assert(bInDebug._nodeLookup.a !== undefined);
		assert(bInDebug._nodeLookup.b !== undefined);
		assert(bInDebug._nodeLookup.c !== undefined);
		assert(bInDebug._nodeLookup.d !== undefined);

		assert(bInDebug._nodeLookup.a.getValue() === 1);
		assert(bInDebug._nodeLookup.b.getValue() === 2);
		assert(bInDebug._nodeLookup.c.getValue() === 3);
	});

	it(`Does not have node names unless configured`, () => {
		const bInDebug = b as any;
		assert(bInDebug._nodeLookup.a._nodeName === undefined);
		assert(bInDebug._nodeLookup.b._nodeName === undefined);
		assert(bInDebug._nodeLookup.c._nodeName === undefined);
		assert(bInDebug._nodeLookup.d._nodeName === undefined);
	});

	it(`Has correct node names if configured`, () => {
		const cInDebug = c as any;
		assert(cInDebug._nodeLookup.a._nodeName === 'a');
		assert(cInDebug._nodeLookup.b._nodeName === 'b');
		assert(cInDebug._nodeLookup.c._nodeName === 'c');
		assert(cInDebug._nodeLookup.d._nodeName === 'd');
	});
});