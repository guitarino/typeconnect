import { connect, configureConnect } from "../build";
import expect from "expect.js";

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
		expect(aInDebug._nodeLookup === undefined).to.equal(true);
	});

	it(`Returns nodes correctly if configured`, () => {
		const bInDebug = b as any;
		expect(bInDebug._nodeLookup !== undefined).to.equal(true);

		expect(bInDebug._nodeLookup.a !== undefined).to.equal(true);
		expect(bInDebug._nodeLookup.b !== undefined).to.equal(true);
		expect(bInDebug._nodeLookup.c !== undefined).to.equal(true);
		expect(bInDebug._nodeLookup.d !== undefined).to.equal(true);

		expect(bInDebug._nodeLookup.a.getValue()).to.equal(1);
		expect(bInDebug._nodeLookup.b.getValue()).to.equal(2);
		expect(bInDebug._nodeLookup.c.getValue()).to.equal(3);
	});

	it(`Does not have node names unless configured`, () => {
		const bInDebug = b as any;
		expect(bInDebug._nodeLookup.a._nodeName === undefined).to.equal(true);
		expect(bInDebug._nodeLookup.b._nodeName === undefined).to.equal(true);
		expect(bInDebug._nodeLookup.c._nodeName === undefined).to.equal(true);
		expect(bInDebug._nodeLookup.d._nodeName === undefined).to.equal(true);
	});

	it(`Has correct node names if configured`, () => {
		const cInDebug = c as any;
		expect(cInDebug._nodeLookup.a._nodeName).to.equal('a');
		expect(cInDebug._nodeLookup.b._nodeName).to.equal('b');
		expect(cInDebug._nodeLookup.c._nodeName).to.equal('c');
		expect(cInDebug._nodeLookup.d._nodeName).to.equal('d');
	});
});