/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "sinon", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/iterator", "vs/base/common/uri", "vs/base/test/common/mock", "vs/base/test/common/utils", "vs/editor/common/core/range", "vs/workbench/api/common/extHostTesting", "vs/workbench/api/common/extHostTestItem", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes", "vs/workbench/contrib/testing/common/testId"], function (require, exports, assert, sinon, buffer_1, cancellation_1, iterator_1, uri_1, mock_1, utils_1, editorRange, extHostTesting_1, extHostTestItem_1, convert, extHostTypes_1, testId_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const simplify = (item) => ({
        id: item.id,
        label: item.label,
        uri: item.uri,
        range: item.range,
    });
    const assertTreesEqual = (a, b) => {
        if (!a) {
            throw new assert.AssertionError({ message: 'Expected a to be defined', actual: a });
        }
        if (!b) {
            throw new assert.AssertionError({ message: 'Expected b to be defined', actual: b });
        }
        assert.deepStrictEqual(simplify(a), simplify(b));
        const aChildren = [...a.children].map(([_, c]) => c.id).sort();
        const bChildren = [...b.children].map(([_, c]) => c.id).sort();
        assert.strictEqual(aChildren.length, bChildren.length, `expected ${a.label}.children.length == ${b.label}.children.length`);
        aChildren.forEach(key => assertTreesEqual(a.children.get(key), b.children.get(key)));
    };
    // const assertTreeListEqual = (a: ReadonlyArray<TestItem>, b: ReadonlyArray<TestItem>) => {
    // 	assert.strictEqual(a.length, b.length, `expected a.length == n.length`);
    // 	a.forEach((_, i) => assertTreesEqual(a[i], b[i]));
    // };
    // class TestMirroredCollection extends MirroredTestCollection {
    // 	public changeEvent!: TestChangeEvent;
    // 	constructor() {
    // 		super();
    // 		this.onDidChangeTests(evt => this.changeEvent = evt);
    // 	}
    // 	public get length() {
    // 		return this.items.size;
    // 	}
    // }
    suite('ExtHost Testing', () => {
        class TestExtHostTestItemCollection extends extHostTestItem_1.$eM {
            setDiff(diff) {
                this.m = diff;
            }
        }
        teardown(() => {
            sinon.restore();
        });
        const ds = (0, utils_1.$bT)();
        let single;
        setup(() => {
            single = ds.add(new TestExtHostTestItemCollection('ctrlId', 'root', {
                getDocument: () => undefined,
            }));
            single.resolveHandler = item => {
                if (item === undefined) {
                    const a = new extHostTestItem_1.$cM('ctrlId', 'id-a', 'a', uri_1.URI.file('/'));
                    a.canResolveChildren = true;
                    const b = new extHostTestItem_1.$cM('ctrlId', 'id-b', 'b', uri_1.URI.file('/'));
                    single.root.children.add(a);
                    single.root.children.add(b);
                }
                else if (item.id === 'id-a') {
                    item.children.add(new extHostTestItem_1.$cM('ctrlId', 'id-aa', 'aa', uri_1.URI.file('/')));
                    item.children.add(new extHostTestItem_1.$cM('ctrlId', 'id-ab', 'ab', uri_1.URI.file('/')));
                }
            };
            ds.add(single.onDidGenerateDiff(d => single.setDiff(d /* don't clear during testing */)));
        });
        suite('OwnedTestCollection', () => {
            test('adds a root recursively', async () => {
                await single.expand(single.root.id, Infinity);
                const a = single.root.children.get('id-a');
                const b = single.root.children.get('id-b');
                assert.deepStrictEqual(single.collectDiff(), [
                    {
                        op: 0 /* TestDiffOpType.Add */,
                        item: { controllerId: 'ctrlId', expand: 2 /* TestItemExpandState.BusyExpanding */, item: { ...convert.TestItem.from(single.root) } }
                    },
                    {
                        op: 0 /* TestDiffOpType.Add */,
                        item: { controllerId: 'ctrlId', expand: 2 /* TestItemExpandState.BusyExpanding */, item: { ...convert.TestItem.from(a) } }
                    },
                    {
                        op: 0 /* TestDiffOpType.Add */,
                        item: { controllerId: 'ctrlId', expand: 0 /* TestItemExpandState.NotExpandable */, item: convert.TestItem.from(a.children.get('id-aa')) }
                    },
                    {
                        op: 0 /* TestDiffOpType.Add */,
                        item: { controllerId: 'ctrlId', expand: 0 /* TestItemExpandState.NotExpandable */, item: convert.TestItem.from(a.children.get('id-ab')) }
                    },
                    {
                        op: 1 /* TestDiffOpType.Update */,
                        item: { extId: new testId_1.$PI(['ctrlId', 'id-a']).toString(), expand: 3 /* TestItemExpandState.Expanded */ }
                    },
                    {
                        op: 0 /* TestDiffOpType.Add */,
                        item: { controllerId: 'ctrlId', expand: 0 /* TestItemExpandState.NotExpandable */, item: convert.TestItem.from(b) }
                    },
                    {
                        op: 1 /* TestDiffOpType.Update */,
                        item: { extId: single.root.id, expand: 3 /* TestItemExpandState.Expanded */ }
                    },
                ]);
            });
            test('parents are set correctly', () => {
                single.expand(single.root.id, Infinity);
                single.collectDiff();
                const a = single.root.children.get('id-a');
                const ab = a.children.get('id-ab');
                assert.strictEqual(a.parent, undefined);
                assert.strictEqual(ab.parent, a);
            });
            test('can add an item with same ID as root', () => {
                single.collectDiff();
                const child = new extHostTestItem_1.$cM('ctrlId', 'ctrlId', 'c', undefined);
                single.root.children.add(child);
                assert.deepStrictEqual(single.collectDiff(), [
                    {
                        op: 0 /* TestDiffOpType.Add */,
                        item: { controllerId: 'ctrlId', expand: 0 /* TestItemExpandState.NotExpandable */, item: convert.TestItem.from(child) },
                    }
                ]);
            });
            test('no-ops if items not changed', () => {
                single.collectDiff();
                assert.deepStrictEqual(single.collectDiff(), []);
            });
            test('watches property mutations', () => {
                single.expand(single.root.id, Infinity);
                single.collectDiff();
                single.root.children.get('id-a').description = 'Hello world'; /* item a */
                assert.deepStrictEqual(single.collectDiff(), [
                    {
                        op: 1 /* TestDiffOpType.Update */,
                        item: { extId: new testId_1.$PI(['ctrlId', 'id-a']).toString(), item: { description: 'Hello world' } },
                    }
                ]);
            });
            test('removes children', () => {
                single.expand(single.root.id, Infinity);
                single.collectDiff();
                single.root.children.delete('id-a');
                assert.deepStrictEqual(single.collectDiff(), [
                    { op: 3 /* TestDiffOpType.Remove */, itemId: new testId_1.$PI(['ctrlId', 'id-a']).toString() },
                ]);
                assert.deepStrictEqual([...single.tree.keys()].sort(), [single.root.id, new testId_1.$PI(['ctrlId', 'id-b']).toString()]);
                assert.strictEqual(single.tree.size, 2);
            });
            test('adds new children', () => {
                single.expand(single.root.id, Infinity);
                single.collectDiff();
                const child = new extHostTestItem_1.$cM('ctrlId', 'id-ac', 'c', undefined);
                single.root.children.get('id-a').children.add(child);
                assert.deepStrictEqual(single.collectDiff(), [
                    {
                        op: 0 /* TestDiffOpType.Add */, item: {
                            controllerId: 'ctrlId',
                            expand: 0 /* TestItemExpandState.NotExpandable */,
                            item: convert.TestItem.from(child),
                        }
                    },
                ]);
                assert.deepStrictEqual([...single.tree.values()].map(n => n.actual.id).sort(), [single.root.id, 'id-a', 'id-aa', 'id-ab', 'id-ac', 'id-b']);
                assert.strictEqual(single.tree.size, 6);
            });
            test('manages tags correctly', () => {
                single.expand(single.root.id, Infinity);
                single.collectDiff();
                const tag1 = new extHostTypes_1.$AL('tag1');
                const tag2 = new extHostTypes_1.$AL('tag2');
                const tag3 = new extHostTypes_1.$AL('tag3');
                const child = new extHostTestItem_1.$cM('ctrlId', 'id-ac', 'c', undefined);
                child.tags = [tag1, tag2];
                single.root.children.get('id-a').children.add(child);
                assert.deepStrictEqual(single.collectDiff(), [
                    { op: 6 /* TestDiffOpType.AddTag */, tag: { id: 'ctrlId\0tag1' } },
                    { op: 6 /* TestDiffOpType.AddTag */, tag: { id: 'ctrlId\0tag2' } },
                    {
                        op: 0 /* TestDiffOpType.Add */, item: {
                            controllerId: 'ctrlId',
                            expand: 0 /* TestItemExpandState.NotExpandable */,
                            item: convert.TestItem.from(child),
                        }
                    },
                ]);
                child.tags = [tag2, tag3];
                assert.deepStrictEqual(single.collectDiff(), [
                    { op: 6 /* TestDiffOpType.AddTag */, tag: { id: 'ctrlId\0tag3' } },
                    {
                        op: 1 /* TestDiffOpType.Update */, item: {
                            extId: new testId_1.$PI(['ctrlId', 'id-a', 'id-ac']).toString(),
                            item: { tags: ['ctrlId\0tag2', 'ctrlId\0tag3'] }
                        }
                    },
                    { op: 7 /* TestDiffOpType.RemoveTag */, id: 'ctrlId\0tag1' },
                ]);
                const a = single.root.children.get('id-a');
                a.tags = [tag2];
                a.children.replace([]);
                assert.deepStrictEqual(single.collectDiff().filter(t => t.op === 7 /* TestDiffOpType.RemoveTag */), [
                    { op: 7 /* TestDiffOpType.RemoveTag */, id: 'ctrlId\0tag3' },
                ]);
            });
            test('replaces on uri change', () => {
                single.expand(single.root.id, Infinity);
                single.collectDiff();
                const oldA = single.root.children.get('id-a');
                const uri = single.root.children.get('id-a').uri?.with({ path: '/different' });
                const newA = new extHostTestItem_1.$cM('ctrlId', 'id-a', 'Hello world', uri);
                newA.children.replace([...oldA.children].map(([_, item]) => item));
                single.root.children.replace([...single.root.children].map(([id, i]) => id === 'id-a' ? newA : i));
                assert.deepStrictEqual(single.collectDiff(), [
                    { op: 3 /* TestDiffOpType.Remove */, itemId: new testId_1.$PI(['ctrlId', 'id-a']).toString() },
                    {
                        op: 0 /* TestDiffOpType.Add */,
                        item: { controllerId: 'ctrlId', expand: 0 /* TestItemExpandState.NotExpandable */, item: { ...convert.TestItem.from(newA) } }
                    },
                    {
                        op: 0 /* TestDiffOpType.Add */,
                        item: { controllerId: 'ctrlId', expand: 0 /* TestItemExpandState.NotExpandable */, item: convert.TestItem.from(newA.children.get('id-aa')) }
                    },
                    {
                        op: 0 /* TestDiffOpType.Add */,
                        item: { controllerId: 'ctrlId', expand: 0 /* TestItemExpandState.NotExpandable */, item: convert.TestItem.from(newA.children.get('id-ab')) }
                    },
                ]);
            });
            test('treats in-place replacement as mutation', () => {
                single.expand(single.root.id, Infinity);
                single.collectDiff();
                const oldA = single.root.children.get('id-a');
                const uri = single.root.children.get('id-a').uri;
                const newA = new extHostTestItem_1.$cM('ctrlId', 'id-a', 'Hello world', uri);
                newA.children.replace([...oldA.children].map(([_, item]) => item));
                single.root.children.replace([
                    newA,
                    new extHostTestItem_1.$cM('ctrlId', 'id-b', single.root.children.get('id-b').label, uri),
                ]);
                assert.deepStrictEqual(single.collectDiff(), [
                    {
                        op: 1 /* TestDiffOpType.Update */,
                        item: { extId: new testId_1.$PI(['ctrlId', 'id-a']).toString(), expand: 3 /* TestItemExpandState.Expanded */, item: { label: 'Hello world' } },
                    },
                    {
                        op: 2 /* TestDiffOpType.DocumentSynced */,
                        docv: undefined,
                        uri: uri
                    }
                ]);
                newA.label = 'still connected';
                assert.deepStrictEqual(single.collectDiff(), [
                    {
                        op: 1 /* TestDiffOpType.Update */,
                        item: { extId: new testId_1.$PI(['ctrlId', 'id-a']).toString(), item: { label: 'still connected' } }
                    },
                ]);
                oldA.label = 'no longer connected';
                assert.deepStrictEqual(single.collectDiff(), []);
            });
            test('treats in-place replacement as mutation deeply', () => {
                single.expand(single.root.id, Infinity);
                single.collectDiff();
                const oldA = single.root.children.get('id-a');
                const uri = oldA.uri;
                const newA = new extHostTestItem_1.$cM('ctrlId', 'id-a', single.root.children.get('id-a').label, uri);
                const oldAA = oldA.children.get('id-aa');
                const oldAB = oldA.children.get('id-ab');
                const newAB = new extHostTestItem_1.$cM('ctrlId', 'id-ab', 'Hello world', uri);
                newA.children.replace([oldAA, newAB]);
                single.root.children.replace([newA, single.root.children.get('id-b')]);
                assert.deepStrictEqual(single.collectDiff(), [
                    {
                        op: 1 /* TestDiffOpType.Update */,
                        item: { extId: new testId_1.$PI(['ctrlId', 'id-a']).toString(), expand: 3 /* TestItemExpandState.Expanded */ },
                    },
                    {
                        op: 1 /* TestDiffOpType.Update */,
                        item: { extId: testId_1.$PI.fromExtHostTestItem(oldAB, 'ctrlId').toString(), item: { label: 'Hello world' } },
                    },
                    {
                        op: 2 /* TestDiffOpType.DocumentSynced */,
                        docv: undefined,
                        uri: uri
                    }
                ]);
                oldAA.label = 'still connected1';
                newAB.label = 'still connected2';
                oldAB.label = 'not connected3';
                assert.deepStrictEqual(single.collectDiff(), [
                    {
                        op: 1 /* TestDiffOpType.Update */,
                        item: { extId: new testId_1.$PI(['ctrlId', 'id-a', 'id-aa']).toString(), item: { label: 'still connected1' } }
                    },
                    {
                        op: 1 /* TestDiffOpType.Update */,
                        item: { extId: new testId_1.$PI(['ctrlId', 'id-a', 'id-ab']).toString(), item: { label: 'still connected2' } }
                    },
                ]);
                assert.strictEqual(newAB.parent, newA);
                assert.strictEqual(oldAA.parent, newA);
                assert.deepStrictEqual(newA.parent, undefined);
            });
            test('moves an item to be a new child', async () => {
                await single.expand(single.root.id, 0);
                single.collectDiff();
                const b = single.root.children.get('id-b');
                const a = single.root.children.get('id-a');
                a.children.add(b);
                assert.deepStrictEqual(single.collectDiff(), [
                    {
                        op: 3 /* TestDiffOpType.Remove */,
                        itemId: new testId_1.$PI(['ctrlId', 'id-b']).toString(),
                    },
                    {
                        op: 0 /* TestDiffOpType.Add */,
                        item: { controllerId: 'ctrlId', expand: 0 /* TestItemExpandState.NotExpandable */, item: convert.TestItem.from(b) }
                    },
                ]);
                b.label = 'still connected';
                assert.deepStrictEqual(single.collectDiff(), [
                    {
                        op: 1 /* TestDiffOpType.Update */,
                        item: { extId: new testId_1.$PI(['ctrlId', 'id-a', 'id-b']).toString(), item: { label: 'still connected' } }
                    },
                ]);
                assert.deepStrictEqual([...single.root.children].map(([_, item]) => item), [single.root.children.get('id-a')]);
                assert.deepStrictEqual(b.parent, a);
            });
            test('sends document sync events', async () => {
                await single.expand(single.root.id, 0);
                single.collectDiff();
                const a = single.root.children.get('id-a');
                a.range = new extHostTypes_1.$5J(new extHostTypes_1.$4J(0, 0), new extHostTypes_1.$4J(1, 0));
                assert.deepStrictEqual(single.collectDiff(), [
                    {
                        op: 2 /* TestDiffOpType.DocumentSynced */,
                        docv: undefined,
                        uri: uri_1.URI.file('/')
                    },
                    {
                        op: 1 /* TestDiffOpType.Update */,
                        item: {
                            extId: new testId_1.$PI(['ctrlId', 'id-a']).toString(),
                            item: {
                                range: editorRange.$ks.lift({
                                    endColumn: 1,
                                    endLineNumber: 2,
                                    startColumn: 1,
                                    startLineNumber: 1
                                })
                            }
                        },
                    },
                ]);
                // sends on replace even if it's a no-op
                a.range = a.range;
                assert.deepStrictEqual(single.collectDiff(), [
                    {
                        op: 2 /* TestDiffOpType.DocumentSynced */,
                        docv: undefined,
                        uri: uri_1.URI.file('/')
                    },
                ]);
                // sends on a child replacement
                const uri = uri_1.URI.file('/');
                const a2 = new extHostTestItem_1.$cM('ctrlId', 'id-a', 'a', uri);
                a2.range = a.range;
                single.root.children.replace([a2, single.root.children.get('id-b')]);
                assert.deepStrictEqual(single.collectDiff(), [
                    {
                        op: 2 /* TestDiffOpType.DocumentSynced */,
                        docv: undefined,
                        uri
                    },
                ]);
            });
        });
        suite('MirroredTestCollection', () => {
            // todo@connor4312: re-renable when we figure out what observing looks like we async children
            // 	let m: TestMirroredCollection;
            // 	setup(() => m = new TestMirroredCollection());
            // 	test('mirrors creation of the root', () => {
            // 		const tests = testStubs.nested();
            // 		single.addRoot(tests, 'pid');
            // 		single.expand(single.root.id, Infinity);
            // 		m.apply(single.collectDiff());
            // 		assertTreesEqual(m.rootTestItems[0], owned.getTestById(single.root.id)![1].actual);
            // 		assert.strictEqual(m.length, single.itemToInternal.size);
            // 	});
            // 	test('mirrors node deletion', () => {
            // 		const tests = testStubs.nested();
            // 		single.addRoot(tests, 'pid');
            // 		m.apply(single.collectDiff());
            // 		single.expand(single.root.id, Infinity);
            // 		tests.children!.splice(0, 1);
            // 		single.onItemChange(tests, 'pid');
            // 		single.expand(single.root.id, Infinity);
            // 		m.apply(single.collectDiff());
            // 		assertTreesEqual(m.rootTestItems[0], owned.getTestById(single.root.id)![1].actual);
            // 		assert.strictEqual(m.length, single.itemToInternal.size);
            // 	});
            // 	test('mirrors node addition', () => {
            // 		const tests = testStubs.nested();
            // 		single.addRoot(tests, 'pid');
            // 		m.apply(single.collectDiff());
            // 		tests.children![0].children!.push(stubTest('ac'));
            // 		single.onItemChange(tests, 'pid');
            // 		m.apply(single.collectDiff());
            // 		assertTreesEqual(m.rootTestItems[0], owned.getTestById(single.root.id)![1].actual);
            // 		assert.strictEqual(m.length, single.itemToInternal.size);
            // 	});
            // 	test('mirrors node update', () => {
            // 		const tests = testStubs.nested();
            // 		single.addRoot(tests, 'pid');
            // 		m.apply(single.collectDiff());
            // 		tests.children![0].description = 'Hello world'; /* item a */
            // 		single.onItemChange(tests, 'pid');
            // 		m.apply(single.collectDiff());
            // 		assertTreesEqual(m.rootTestItems[0], owned.getTestById(single.root.id)![1].actual);
            // 	});
            // 	suite('MirroredChangeCollector', () => {
            // 		let tests = testStubs.nested();
            // 		setup(() => {
            // 			tests = testStubs.nested();
            // 			single.addRoot(tests, 'pid');
            // 			m.apply(single.collectDiff());
            // 		});
            // 		test('creates change for root', () => {
            // 			assertTreeListEqual(m.changeEvent.added, [
            // 				tests,
            // 				tests.children[0],
            // 				tests.children![0].children![0],
            // 				tests.children![0].children![1],
            // 				tests.children[1],
            // 			]);
            // 			assertTreeListEqual(m.changeEvent.removed, []);
            // 			assertTreeListEqual(m.changeEvent.updated, []);
            // 		});
            // 		test('creates change for delete', () => {
            // 			const rm = tests.children.shift()!;
            // 			single.onItemChange(tests, 'pid');
            // 			m.apply(single.collectDiff());
            // 			assertTreeListEqual(m.changeEvent.added, []);
            // 			assertTreeListEqual(m.changeEvent.removed, [
            // 				{ ...rm },
            // 				{ ...rm.children![0] },
            // 				{ ...rm.children![1] },
            // 			]);
            // 			assertTreeListEqual(m.changeEvent.updated, []);
            // 		});
            // 		test('creates change for update', () => {
            // 			tests.children[0].label = 'updated!';
            // 			single.onItemChange(tests, 'pid');
            // 			m.apply(single.collectDiff());
            // 			assertTreeListEqual(m.changeEvent.added, []);
            // 			assertTreeListEqual(m.changeEvent.removed, []);
            // 			assertTreeListEqual(m.changeEvent.updated, [tests.children[0]]);
            // 		});
            // 		test('is a no-op if a node is added and removed', () => {
            // 			const nested = testStubs.nested('id2-');
            // 			tests.children.push(nested);
            // 			single.onItemChange(tests, 'pid');
            // 			tests.children.pop();
            // 			single.onItemChange(tests, 'pid');
            // 			const previousEvent = m.changeEvent;
            // 			m.apply(single.collectDiff());
            // 			assert.strictEqual(m.changeEvent, previousEvent);
            // 		});
            // 		test('is a single-op if a node is added and changed', () => {
            // 			const child = stubTest('c');
            // 			tests.children.push(child);
            // 			single.onItemChange(tests, 'pid');
            // 			child.label = 'd';
            // 			single.onItemChange(tests, 'pid');
            // 			m.apply(single.collectDiff());
            // 			assertTreeListEqual(m.changeEvent.added, [child]);
            // 			assertTreeListEqual(m.changeEvent.removed, []);
            // 			assertTreeListEqual(m.changeEvent.updated, []);
            // 		});
            // 		test('gets the common ancestor (1)', () => {
            // 			tests.children![0].children![0].label = 'za';
            // 			tests.children![0].children![1].label = 'zb';
            // 			single.onItemChange(tests, 'pid');
            // 			m.apply(single.collectDiff());
            // 		});
            // 		test('gets the common ancestor (2)', () => {
            // 			tests.children![0].children![0].label = 'za';
            // 			tests.children![1].label = 'ab';
            // 			single.onItemChange(tests, 'pid');
            // 			m.apply(single.collectDiff());
            // 		});
            // 	});
        });
        suite('TestRunTracker', () => {
            let proxy;
            let c;
            let cts;
            let configuration;
            let req;
            let dto;
            const ext = {};
            setup(async () => {
                proxy = (0, mock_1.$sT)()();
                cts = new cancellation_1.$pd();
                c = new extHostTesting_1.$Pcc(proxy);
                configuration = new extHostTesting_1.$Rcc((0, mock_1.$sT)()(), new Map(), 'ctrlId', 42, 'Do Run', extHostTypes_1.TestRunProfileKind.Run, () => { }, false);
                await single.expand(single.root.id, Infinity);
                single.collectDiff();
                req = {
                    include: undefined,
                    exclude: [single.root.children.get('id-b')],
                    profile: configuration,
                };
                dto = extHostTesting_1.$Qcc.fromInternal({
                    controllerId: 'ctrl',
                    profileId: configuration.profileId,
                    excludeExtIds: ['id-b'],
                    runId: 'run-id',
                    testIds: [single.root.id],
                }, single);
            });
            test('tracks a run started from a main thread request', () => {
                const tracker = ds.add(c.prepareForMainThreadTestRun(req, dto, ext, cts.token));
                assert.strictEqual(tracker.hasRunningTasks, false);
                const task1 = c.createTestRun(ext, 'ctrl', single, req, 'run1', true);
                const task2 = c.createTestRun(ext, 'ctrl', single, req, 'run2', true);
                assert.strictEqual(proxy.$startedExtensionTestRun.called, false);
                assert.strictEqual(tracker.hasRunningTasks, true);
                task1.appendOutput('hello');
                const taskId = proxy.$appendOutputToRun.args[0]?.[1];
                assert.deepStrictEqual([['run-id', taskId, buffer_1.$Fd.fromString('hello'), undefined, undefined]], proxy.$appendOutputToRun.args);
                task1.end();
                assert.strictEqual(proxy.$finishedExtensionTestRun.called, false);
                assert.strictEqual(tracker.hasRunningTasks, true);
                task2.end();
                assert.strictEqual(proxy.$finishedExtensionTestRun.called, false);
                assert.strictEqual(tracker.hasRunningTasks, false);
            });
            test('run cancel force ends after a timeout', () => {
                const clock = sinon.useFakeTimers();
                try {
                    const tracker = ds.add(c.prepareForMainThreadTestRun(req, dto, ext, cts.token));
                    const task = c.createTestRun(ext, 'ctrl', single, req, 'run1', true);
                    const onEnded = sinon.stub();
                    ds.add(tracker.onEnd(onEnded));
                    assert.strictEqual(task.token.isCancellationRequested, false);
                    assert.strictEqual(tracker.hasRunningTasks, true);
                    tracker.cancel();
                    assert.strictEqual(task.token.isCancellationRequested, true);
                    assert.strictEqual(tracker.hasRunningTasks, true);
                    clock.tick(9999);
                    assert.strictEqual(tracker.hasRunningTasks, true);
                    assert.strictEqual(onEnded.called, false);
                    clock.tick(1);
                    assert.strictEqual(onEnded.called, true);
                    assert.strictEqual(tracker.hasRunningTasks, false);
                }
                finally {
                    clock.restore();
                }
            });
            test('run cancel force ends on second cancellation request', () => {
                const tracker = ds.add(c.prepareForMainThreadTestRun(req, dto, ext, cts.token));
                const task = c.createTestRun(ext, 'ctrl', single, req, 'run1', true);
                const onEnded = sinon.stub();
                ds.add(tracker.onEnd(onEnded));
                assert.strictEqual(task.token.isCancellationRequested, false);
                assert.strictEqual(tracker.hasRunningTasks, true);
                tracker.cancel();
                assert.strictEqual(task.token.isCancellationRequested, true);
                assert.strictEqual(tracker.hasRunningTasks, true);
                assert.strictEqual(onEnded.called, false);
                tracker.cancel();
                assert.strictEqual(tracker.hasRunningTasks, false);
                assert.strictEqual(onEnded.called, true);
            });
            test('tracks a run started from an extension request', () => {
                const task1 = c.createTestRun(ext, 'ctrl', single, req, 'hello world', false);
                const tracker = iterator_1.Iterable.first(c.trackers);
                assert.strictEqual(tracker.hasRunningTasks, true);
                assert.deepStrictEqual(proxy.$startedExtensionTestRun.args, [
                    [{
                            profile: { group: 2, id: 42 },
                            controllerId: 'ctrl',
                            id: tracker.id,
                            include: [single.root.id],
                            exclude: [new testId_1.$PI(['ctrlId', 'id-b']).toString()],
                            persist: false,
                            continuous: false,
                        }]
                ]);
                const task2 = c.createTestRun(ext, 'ctrl', single, req, 'run2', true);
                const task3Detached = c.createTestRun(ext, 'ctrl', single, { ...req }, 'task3Detached', true);
                task1.end();
                assert.strictEqual(proxy.$finishedExtensionTestRun.called, false);
                assert.strictEqual(tracker.hasRunningTasks, true);
                task2.end();
                assert.deepStrictEqual(proxy.$finishedExtensionTestRun.args, [[tracker.id]]);
                assert.strictEqual(tracker.hasRunningTasks, false);
                task3Detached.end();
            });
            test('adds tests to run smartly', () => {
                const task1 = c.createTestRun(ext, 'ctrlId', single, req, 'hello world', false);
                const tracker = iterator_1.Iterable.first(c.trackers);
                const expectedArgs = [];
                assert.deepStrictEqual(proxy.$addTestsToRun.args, expectedArgs);
                task1.passed(single.root.children.get('id-a').children.get('id-aa'));
                expectedArgs.push([
                    'ctrlId',
                    tracker.id,
                    [
                        convert.TestItem.from(single.root),
                        convert.TestItem.from(single.root.children.get('id-a')),
                        convert.TestItem.from(single.root.children.get('id-a').children.get('id-aa')),
                    ]
                ]);
                assert.deepStrictEqual(proxy.$addTestsToRun.args, expectedArgs);
                task1.enqueued(single.root.children.get('id-a').children.get('id-ab'));
                expectedArgs.push([
                    'ctrlId',
                    tracker.id,
                    [
                        convert.TestItem.from(single.root.children.get('id-a')),
                        convert.TestItem.from(single.root.children.get('id-a').children.get('id-ab')),
                    ],
                ]);
                assert.deepStrictEqual(proxy.$addTestsToRun.args, expectedArgs);
                task1.passed(single.root.children.get('id-a').children.get('id-ab'));
                assert.deepStrictEqual(proxy.$addTestsToRun.args, expectedArgs);
                task1.end();
            });
            test('adds test messages to run', () => {
                const test1 = new extHostTestItem_1.$cM('ctrlId', 'id-c', 'test c', uri_1.URI.file('/testc.txt'));
                const test2 = new extHostTestItem_1.$cM('ctrlId', 'id-d', 'test d', uri_1.URI.file('/testd.txt'));
                test1.range = test2.range = new extHostTypes_1.$5J(new extHostTypes_1.$4J(0, 0), new extHostTypes_1.$4J(1, 0));
                single.root.children.replace([test1, test2]);
                const task = c.createTestRun(ext, 'ctrlId', single, req, 'hello world', false);
                const message1 = new extHostTypes_1.$zL('some message');
                message1.location = new extHostTypes_1.$cK(uri_1.URI.file('/a.txt'), new extHostTypes_1.$4J(0, 0));
                task.failed(test1, message1);
                const args = proxy.$appendTestMessagesInRun.args[0];
                assert.deepStrictEqual(proxy.$appendTestMessagesInRun.args[0], [
                    args[0],
                    args[1],
                    new testId_1.$PI(['ctrlId', 'id-c']).toString(),
                    [{
                            message: 'some message',
                            type: 0 /* TestMessageType.Error */,
                            expected: undefined,
                            contextValue: undefined,
                            actual: undefined,
                            location: convert.location.from(message1.location)
                        }]
                ]);
                // should use test location as default
                task.failed(test2, new extHostTypes_1.$zL('some message'));
                assert.deepStrictEqual(proxy.$appendTestMessagesInRun.args[1], [
                    args[0],
                    args[1],
                    new testId_1.$PI(['ctrlId', 'id-d']).toString(),
                    [{
                            message: 'some message',
                            type: 0 /* TestMessageType.Error */,
                            contextValue: undefined,
                            expected: undefined,
                            actual: undefined,
                            location: convert.location.from({ uri: test2.uri, range: test2.range }),
                        }]
                ]);
                task.end();
            });
            test('guards calls after runs are ended', () => {
                const task = c.createTestRun(ext, 'ctrl', single, req, 'hello world', false);
                task.end();
                task.failed(single.root, new extHostTypes_1.$zL('some message'));
                task.appendOutput('output');
                assert.strictEqual(proxy.$addTestsToRun.called, false);
                assert.strictEqual(proxy.$appendOutputToRun.called, false);
                assert.strictEqual(proxy.$appendTestMessagesInRun.called, false);
            });
            test('excludes tests outside tree or explicitly excluded', () => {
                const task = c.createTestRun(ext, 'ctrlId', single, {
                    profile: configuration,
                    include: [single.root.children.get('id-a')],
                    exclude: [single.root.children.get('id-a').children.get('id-aa')],
                }, 'hello world', false);
                task.passed(single.root.children.get('id-a').children.get('id-aa'));
                task.passed(single.root.children.get('id-a').children.get('id-ab'));
                assert.deepStrictEqual(proxy.$updateTestStateInRun.args.length, 1);
                const args = proxy.$updateTestStateInRun.args[0];
                assert.deepStrictEqual(proxy.$updateTestStateInRun.args, [[
                        args[0],
                        args[1],
                        new testId_1.$PI(['ctrlId', 'id-a', 'id-ab']).toString(),
                        extHostTypes_1.TestResultState.Passed,
                        undefined,
                    ]]);
                task.end();
            });
            test('sets state of test with identical local IDs (#131827)', () => {
                const testA = single.root.children.get('id-a');
                const testB = single.root.children.get('id-b');
                const childA = new extHostTestItem_1.$cM('ctrlId', 'id-child', 'child', undefined);
                testA.children.replace([childA]);
                const childB = new extHostTestItem_1.$cM('ctrlId', 'id-child', 'child', undefined);
                testB.children.replace([childB]);
                const task1 = c.createTestRun(ext, 'ctrl', single, new extHostTypes_1.$yL(), 'hello world', false);
                const tracker = iterator_1.Iterable.first(c.trackers);
                task1.passed(childA);
                task1.passed(childB);
                assert.deepStrictEqual(proxy.$addTestsToRun.args, [
                    [
                        'ctrl',
                        tracker.id,
                        [single.root, testA, childA].map(t => convert.TestItem.from(t)),
                    ],
                    [
                        'ctrl',
                        tracker.id,
                        [single.root, testB, childB].map(t => convert.TestItem.from(t)),
                    ],
                ]);
                task1.end();
            });
        });
    });
});
//# sourceMappingURL=extHostTesting.test.js.map