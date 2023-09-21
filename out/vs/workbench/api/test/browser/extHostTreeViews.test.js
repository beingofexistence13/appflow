/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "sinon", "vs/base/common/event", "vs/workbench/api/common/extHostTreeViews", "vs/workbench/api/common/extHostCommands", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/test/common/testRPCProtocol", "vs/base/test/common/mock", "vs/workbench/common/views", "vs/platform/log/common/log", "vs/workbench/services/extensions/common/extensions", "vs/base/test/common/timeTravelScheduler", "vs/base/test/common/utils"], function (require, exports, assert, sinon, event_1, extHostTreeViews_1, extHostCommands_1, extHost_protocol_1, testRPCProtocol_1, mock_1, views_1, log_1, extensions_1, timeTravelScheduler_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtHostTreeView', function () {
        const store = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        class RecordingShape extends (0, mock_1.mock)() {
            constructor() {
                super(...arguments);
                this.onRefresh = new event_1.Emitter();
            }
            async $registerTreeViewDataProvider(treeViewId) {
            }
            $refresh(viewId, itemsToRefresh) {
                return Promise.resolve(null).then(() => {
                    this.onRefresh.fire(itemsToRefresh);
                });
            }
            $reveal(treeViewId, itemInfo, options) {
                return Promise.resolve();
            }
            $disposeTree(treeViewId) {
                return Promise.resolve();
            }
        }
        let testObject;
        let target;
        let onDidChangeTreeNode;
        let onDidChangeTreeNodeWithId;
        let tree;
        let labels;
        let nodes;
        setup(() => {
            tree = {
                'a': {
                    'aa': {},
                    'ab': {}
                },
                'b': {
                    'ba': {},
                    'bb': {}
                }
            };
            labels = {};
            nodes = {};
            const rpcProtocol = new testRPCProtocol_1.TestRPCProtocol();
            rpcProtocol.set(extHost_protocol_1.MainContext.MainThreadCommands, new class extends (0, mock_1.mock)() {
                $registerCommand() { }
            });
            target = new RecordingShape();
            testObject = store.add(new extHostTreeViews_1.ExtHostTreeViews(target, new extHostCommands_1.ExtHostCommands(rpcProtocol, new log_1.NullLogService(), new class extends (0, mock_1.mock)() {
                onExtensionError() {
                    return true;
                }
            }), new log_1.NullLogService()));
            onDidChangeTreeNode = new event_1.Emitter();
            onDidChangeTreeNodeWithId = new event_1.Emitter();
            testObject.createTreeView('testNodeTreeProvider', { treeDataProvider: aNodeTreeDataProvider() }, extensions_1.nullExtensionDescription);
            testObject.createTreeView('testNodeWithIdTreeProvider', { treeDataProvider: aNodeWithIdTreeDataProvider() }, extensions_1.nullExtensionDescription);
            testObject.createTreeView('testNodeWithHighlightsTreeProvider', { treeDataProvider: aNodeWithHighlightedLabelTreeDataProvider() }, extensions_1.nullExtensionDescription);
            return loadCompleteTree('testNodeTreeProvider');
        });
        test('construct node tree', () => {
            return testObject.$getChildren('testNodeTreeProvider')
                .then(elements => {
                const actuals = elements?.map(e => e.handle);
                assert.deepStrictEqual(actuals, ['0/0:a', '0/0:b']);
                return Promise.all([
                    testObject.$getChildren('testNodeTreeProvider', '0/0:a')
                        .then(children => {
                        const actuals = children?.map(e => e.handle);
                        assert.deepStrictEqual(actuals, ['0/0:a/0:aa', '0/0:a/0:ab']);
                        return Promise.all([
                            testObject.$getChildren('testNodeTreeProvider', '0/0:a/0:aa').then(children => assert.strictEqual(children?.length, 0)),
                            testObject.$getChildren('testNodeTreeProvider', '0/0:a/0:ab').then(children => assert.strictEqual(children?.length, 0))
                        ]);
                    }),
                    testObject.$getChildren('testNodeTreeProvider', '0/0:b')
                        .then(children => {
                        const actuals = children?.map(e => e.handle);
                        assert.deepStrictEqual(actuals, ['0/0:b/0:ba', '0/0:b/0:bb']);
                        return Promise.all([
                            testObject.$getChildren('testNodeTreeProvider', '0/0:b/0:ba').then(children => assert.strictEqual(children?.length, 0)),
                            testObject.$getChildren('testNodeTreeProvider', '0/0:b/0:bb').then(children => assert.strictEqual(children?.length, 0))
                        ]);
                    })
                ]);
            });
        });
        test('construct id tree', () => {
            return testObject.$getChildren('testNodeWithIdTreeProvider')
                .then(elements => {
                const actuals = elements?.map(e => e.handle);
                assert.deepStrictEqual(actuals, ['1/a', '1/b']);
                return Promise.all([
                    testObject.$getChildren('testNodeWithIdTreeProvider', '1/a')
                        .then(children => {
                        const actuals = children?.map(e => e.handle);
                        assert.deepStrictEqual(actuals, ['1/aa', '1/ab']);
                        return Promise.all([
                            testObject.$getChildren('testNodeWithIdTreeProvider', '1/aa').then(children => assert.strictEqual(children?.length, 0)),
                            testObject.$getChildren('testNodeWithIdTreeProvider', '1/ab').then(children => assert.strictEqual(children?.length, 0))
                        ]);
                    }),
                    testObject.$getChildren('testNodeWithIdTreeProvider', '1/b')
                        .then(children => {
                        const actuals = children?.map(e => e.handle);
                        assert.deepStrictEqual(actuals, ['1/ba', '1/bb']);
                        return Promise.all([
                            testObject.$getChildren('testNodeWithIdTreeProvider', '1/ba').then(children => assert.strictEqual(children?.length, 0)),
                            testObject.$getChildren('testNodeWithIdTreeProvider', '1/bb').then(children => assert.strictEqual(children?.length, 0))
                        ]);
                    })
                ]);
            });
        });
        test('construct highlights tree', () => {
            return testObject.$getChildren('testNodeWithHighlightsTreeProvider')
                .then(elements => {
                assert.deepStrictEqual(removeUnsetKeys(elements), [{
                        handle: '1/a',
                        label: { label: 'a', highlights: [[0, 2], [3, 5]] },
                        collapsibleState: views_1.TreeItemCollapsibleState.Collapsed
                    }, {
                        handle: '1/b',
                        label: { label: 'b', highlights: [[0, 2], [3, 5]] },
                        collapsibleState: views_1.TreeItemCollapsibleState.Collapsed
                    }]);
                return Promise.all([
                    testObject.$getChildren('testNodeWithHighlightsTreeProvider', '1/a')
                        .then(children => {
                        assert.deepStrictEqual(removeUnsetKeys(children), [{
                                handle: '1/aa',
                                parentHandle: '1/a',
                                label: { label: 'aa', highlights: [[0, 2], [3, 5]] },
                                collapsibleState: views_1.TreeItemCollapsibleState.None
                            }, {
                                handle: '1/ab',
                                parentHandle: '1/a',
                                label: { label: 'ab', highlights: [[0, 2], [3, 5]] },
                                collapsibleState: views_1.TreeItemCollapsibleState.None
                            }]);
                    }),
                    testObject.$getChildren('testNodeWithHighlightsTreeProvider', '1/b')
                        .then(children => {
                        assert.deepStrictEqual(removeUnsetKeys(children), [{
                                handle: '1/ba',
                                parentHandle: '1/b',
                                label: { label: 'ba', highlights: [[0, 2], [3, 5]] },
                                collapsibleState: views_1.TreeItemCollapsibleState.None
                            }, {
                                handle: '1/bb',
                                parentHandle: '1/b',
                                label: { label: 'bb', highlights: [[0, 2], [3, 5]] },
                                collapsibleState: views_1.TreeItemCollapsibleState.None
                            }]);
                    })
                ]);
            });
        });
        test('error is thrown if id is not unique', (done) => {
            tree['a'] = {
                'aa': {},
            };
            tree['b'] = {
                'aa': {},
                'ba': {}
            };
            let caughtExpectedError = false;
            store.add(target.onRefresh.event(() => {
                testObject.$getChildren('testNodeWithIdTreeProvider')
                    .then(elements => {
                    const actuals = elements?.map(e => e.handle);
                    assert.deepStrictEqual(actuals, ['1/a', '1/b']);
                    return testObject.$getChildren('testNodeWithIdTreeProvider', '1/a')
                        .then(() => testObject.$getChildren('testNodeWithIdTreeProvider', '1/b'))
                        .then(() => assert.fail('Should fail with duplicate id'))
                        .catch(() => caughtExpectedError = true)
                        .finally(() => caughtExpectedError ? done() : assert.fail('Expected duplicate id error not thrown.'));
                });
            }));
            onDidChangeTreeNode.fire(undefined);
        });
        test('refresh root', function (done) {
            store.add(target.onRefresh.event(actuals => {
                assert.strictEqual(undefined, actuals);
                done();
            }));
            onDidChangeTreeNode.fire(undefined);
        });
        test('refresh a parent node', () => {
            return new Promise((c, e) => {
                store.add(target.onRefresh.event(actuals => {
                    assert.deepStrictEqual(['0/0:b'], Object.keys(actuals));
                    assert.deepStrictEqual(removeUnsetKeys(actuals['0/0:b']), {
                        handle: '0/0:b',
                        label: { label: 'b' },
                        collapsibleState: views_1.TreeItemCollapsibleState.Collapsed
                    });
                    c(undefined);
                }));
                onDidChangeTreeNode.fire(getNode('b'));
            });
        });
        test('refresh a leaf node', function (done) {
            store.add(target.onRefresh.event(actuals => {
                assert.deepStrictEqual(['0/0:b/0:bb'], Object.keys(actuals));
                assert.deepStrictEqual(removeUnsetKeys(actuals['0/0:b/0:bb']), {
                    handle: '0/0:b/0:bb',
                    parentHandle: '0/0:b',
                    label: { label: 'bb' },
                    collapsibleState: views_1.TreeItemCollapsibleState.None
                });
                done();
            }));
            onDidChangeTreeNode.fire(getNode('bb'));
        });
        async function runWithEventMerging(action) {
            await (0, timeTravelScheduler_1.runWithFakedTimers)({}, async () => {
                await new Promise((resolve) => {
                    let subscription = undefined;
                    subscription = target.onRefresh.event(() => {
                        subscription.dispose();
                        resolve();
                    });
                    onDidChangeTreeNode.fire(getNode('b'));
                });
                await new Promise(action);
            });
        }
        test('refresh parent and child node trigger refresh only on parent - scenario 1', async () => {
            return runWithEventMerging((resolve) => {
                store.add(target.onRefresh.event(actuals => {
                    assert.deepStrictEqual(['0/0:b', '0/0:a/0:aa'], Object.keys(actuals));
                    assert.deepStrictEqual(removeUnsetKeys(actuals['0/0:b']), {
                        handle: '0/0:b',
                        label: { label: 'b' },
                        collapsibleState: views_1.TreeItemCollapsibleState.Collapsed
                    });
                    assert.deepStrictEqual(removeUnsetKeys(actuals['0/0:a/0:aa']), {
                        handle: '0/0:a/0:aa',
                        parentHandle: '0/0:a',
                        label: { label: 'aa' },
                        collapsibleState: views_1.TreeItemCollapsibleState.None
                    });
                    resolve();
                }));
                onDidChangeTreeNode.fire(getNode('b'));
                onDidChangeTreeNode.fire(getNode('aa'));
                onDidChangeTreeNode.fire(getNode('bb'));
            });
        });
        test('refresh parent and child node trigger refresh only on parent - scenario 2', async () => {
            return runWithEventMerging((resolve) => {
                store.add(target.onRefresh.event(actuals => {
                    assert.deepStrictEqual(['0/0:a/0:aa', '0/0:b'], Object.keys(actuals));
                    assert.deepStrictEqual(removeUnsetKeys(actuals['0/0:b']), {
                        handle: '0/0:b',
                        label: { label: 'b' },
                        collapsibleState: views_1.TreeItemCollapsibleState.Collapsed
                    });
                    assert.deepStrictEqual(removeUnsetKeys(actuals['0/0:a/0:aa']), {
                        handle: '0/0:a/0:aa',
                        parentHandle: '0/0:a',
                        label: { label: 'aa' },
                        collapsibleState: views_1.TreeItemCollapsibleState.None
                    });
                    resolve();
                }));
                onDidChangeTreeNode.fire(getNode('bb'));
                onDidChangeTreeNode.fire(getNode('aa'));
                onDidChangeTreeNode.fire(getNode('b'));
            });
        });
        test('refresh an element for label change', function (done) {
            labels['a'] = 'aa';
            store.add(target.onRefresh.event(actuals => {
                assert.deepStrictEqual(['0/0:a'], Object.keys(actuals));
                assert.deepStrictEqual(removeUnsetKeys(actuals['0/0:a']), {
                    handle: '0/0:aa',
                    label: { label: 'aa' },
                    collapsibleState: views_1.TreeItemCollapsibleState.Collapsed
                });
                done();
            }));
            onDidChangeTreeNode.fire(getNode('a'));
        });
        test('refresh calls are throttled on roots', () => {
            return runWithEventMerging((resolve) => {
                store.add(target.onRefresh.event(actuals => {
                    assert.strictEqual(undefined, actuals);
                    resolve();
                }));
                onDidChangeTreeNode.fire(undefined);
                onDidChangeTreeNode.fire(undefined);
                onDidChangeTreeNode.fire(undefined);
                onDidChangeTreeNode.fire(undefined);
            });
        });
        test('refresh calls are throttled on elements', () => {
            return runWithEventMerging((resolve) => {
                store.add(target.onRefresh.event(actuals => {
                    assert.deepStrictEqual(['0/0:a', '0/0:b'], Object.keys(actuals));
                    resolve();
                }));
                onDidChangeTreeNode.fire(getNode('a'));
                onDidChangeTreeNode.fire(getNode('b'));
                onDidChangeTreeNode.fire(getNode('b'));
                onDidChangeTreeNode.fire(getNode('a'));
            });
        });
        test('refresh calls are throttled on unknown elements', () => {
            return runWithEventMerging((resolve) => {
                store.add(target.onRefresh.event(actuals => {
                    assert.deepStrictEqual(['0/0:a', '0/0:b'], Object.keys(actuals));
                    resolve();
                }));
                onDidChangeTreeNode.fire(getNode('a'));
                onDidChangeTreeNode.fire(getNode('b'));
                onDidChangeTreeNode.fire(getNode('g'));
                onDidChangeTreeNode.fire(getNode('a'));
            });
        });
        test('refresh calls are throttled on unknown elements and root', () => {
            return runWithEventMerging((resolve) => {
                store.add(target.onRefresh.event(actuals => {
                    assert.strictEqual(undefined, actuals);
                    resolve();
                }));
                onDidChangeTreeNode.fire(getNode('a'));
                onDidChangeTreeNode.fire(getNode('b'));
                onDidChangeTreeNode.fire(getNode('g'));
                onDidChangeTreeNode.fire(undefined);
            });
        });
        test('refresh calls are throttled on elements and root', () => {
            return runWithEventMerging((resolve) => {
                store.add(target.onRefresh.event(actuals => {
                    assert.strictEqual(undefined, actuals);
                    resolve();
                }));
                onDidChangeTreeNode.fire(getNode('a'));
                onDidChangeTreeNode.fire(getNode('b'));
                onDidChangeTreeNode.fire(undefined);
                onDidChangeTreeNode.fire(getNode('a'));
            });
        });
        test('generate unique handles from labels by escaping them', (done) => {
            tree = {
                'a/0:b': {}
            };
            store.add(target.onRefresh.event(() => {
                testObject.$getChildren('testNodeTreeProvider')
                    .then(elements => {
                    assert.deepStrictEqual(elements?.map(e => e.handle), ['0/0:a//0:b']);
                    done();
                });
            }));
            onDidChangeTreeNode.fire(undefined);
        });
        test('tree with duplicate labels', (done) => {
            const dupItems = {
                'adup1': 'c',
                'adup2': 'g',
                'bdup1': 'e',
                'hdup1': 'i',
                'hdup2': 'l',
                'jdup1': 'k'
            };
            labels['c'] = 'a';
            labels['e'] = 'b';
            labels['g'] = 'a';
            labels['i'] = 'h';
            labels['l'] = 'h';
            labels['k'] = 'j';
            tree[dupItems['adup1']] = {};
            tree['d'] = {};
            const bdup1Tree = {};
            bdup1Tree['h'] = {};
            bdup1Tree[dupItems['hdup1']] = {};
            bdup1Tree['j'] = {};
            bdup1Tree[dupItems['jdup1']] = {};
            bdup1Tree[dupItems['hdup2']] = {};
            tree[dupItems['bdup1']] = bdup1Tree;
            tree['f'] = {};
            tree[dupItems['adup2']] = {};
            store.add(target.onRefresh.event(() => {
                testObject.$getChildren('testNodeTreeProvider')
                    .then(elements => {
                    const actuals = elements?.map(e => e.handle);
                    assert.deepStrictEqual(actuals, ['0/0:a', '0/0:b', '0/1:a', '0/0:d', '0/1:b', '0/0:f', '0/2:a']);
                    return testObject.$getChildren('testNodeTreeProvider', '0/1:b')
                        .then(elements => {
                        const actuals = elements?.map(e => e.handle);
                        assert.deepStrictEqual(actuals, ['0/1:b/0:h', '0/1:b/1:h', '0/1:b/0:j', '0/1:b/1:j', '0/1:b/2:h']);
                        done();
                    });
                });
            }));
            onDidChangeTreeNode.fire(undefined);
        });
        test('getChildren is not returned from cache if refreshed', (done) => {
            tree = {
                'c': {}
            };
            store.add(target.onRefresh.event(() => {
                testObject.$getChildren('testNodeTreeProvider')
                    .then(elements => {
                    assert.deepStrictEqual(elements?.map(e => e.handle), ['0/0:c']);
                    done();
                });
            }));
            onDidChangeTreeNode.fire(undefined);
        });
        test('getChildren is returned from cache if not refreshed', () => {
            tree = {
                'c': {}
            };
            return testObject.$getChildren('testNodeTreeProvider')
                .then(elements => {
                assert.deepStrictEqual(elements?.map(e => e.handle), ['0/0:a', '0/0:b']);
            });
        });
        test('reveal will throw an error if getParent is not implemented', () => {
            const treeView = testObject.createTreeView('treeDataProvider', { treeDataProvider: aNodeTreeDataProvider() }, extensions_1.nullExtensionDescription);
            return treeView.reveal({ key: 'a' })
                .then(() => assert.fail('Reveal should throw an error as getParent is not implemented'), () => null);
        });
        test('reveal will return empty array for root element', () => {
            const revealTarget = sinon.spy(target, '$reveal');
            const treeView = testObject.createTreeView('treeDataProvider', { treeDataProvider: aCompleteNodeTreeDataProvider() }, extensions_1.nullExtensionDescription);
            const expected = {
                item: { handle: '0/0:a', label: { label: 'a' }, collapsibleState: views_1.TreeItemCollapsibleState.Collapsed },
                parentChain: []
            };
            return treeView.reveal({ key: 'a' })
                .then(() => {
                assert.ok(revealTarget.calledOnce);
                assert.deepStrictEqual('treeDataProvider', revealTarget.args[0][0]);
                assert.deepStrictEqual(expected, removeUnsetKeys(revealTarget.args[0][1]));
                assert.deepStrictEqual({ select: true, focus: false, expand: false }, revealTarget.args[0][2]);
            });
        });
        test('reveal will return parents array for an element when hierarchy is not loaded', () => {
            const revealTarget = sinon.spy(target, '$reveal');
            const treeView = testObject.createTreeView('treeDataProvider', { treeDataProvider: aCompleteNodeTreeDataProvider() }, extensions_1.nullExtensionDescription);
            const expected = {
                item: { handle: '0/0:a/0:aa', label: { label: 'aa' }, collapsibleState: views_1.TreeItemCollapsibleState.None, parentHandle: '0/0:a' },
                parentChain: [{ handle: '0/0:a', label: { label: 'a' }, collapsibleState: views_1.TreeItemCollapsibleState.Collapsed }]
            };
            return treeView.reveal({ key: 'aa' })
                .then(() => {
                assert.ok(revealTarget.calledOnce);
                assert.deepStrictEqual('treeDataProvider', revealTarget.args[0][0]);
                assert.deepStrictEqual(expected.item, removeUnsetKeys(revealTarget.args[0][1].item));
                assert.deepStrictEqual(expected.parentChain, (revealTarget.args[0][1].parentChain).map(arg => removeUnsetKeys(arg)));
                assert.deepStrictEqual({ select: true, focus: false, expand: false }, revealTarget.args[0][2]);
            });
        });
        test('reveal will return parents array for an element when hierarchy is loaded', () => {
            const revealTarget = sinon.spy(target, '$reveal');
            const treeView = testObject.createTreeView('treeDataProvider', { treeDataProvider: aCompleteNodeTreeDataProvider() }, extensions_1.nullExtensionDescription);
            const expected = {
                item: { handle: '0/0:a/0:aa', label: { label: 'aa' }, collapsibleState: views_1.TreeItemCollapsibleState.None, parentHandle: '0/0:a' },
                parentChain: [{ handle: '0/0:a', label: { label: 'a' }, collapsibleState: views_1.TreeItemCollapsibleState.Collapsed }]
            };
            return testObject.$getChildren('treeDataProvider')
                .then(() => testObject.$getChildren('treeDataProvider', '0/0:a'))
                .then(() => treeView.reveal({ key: 'aa' })
                .then(() => {
                assert.ok(revealTarget.calledOnce);
                assert.deepStrictEqual('treeDataProvider', revealTarget.args[0][0]);
                assert.deepStrictEqual(expected.item, removeUnsetKeys(revealTarget.args[0][1].item));
                assert.deepStrictEqual(expected.parentChain, (revealTarget.args[0][1].parentChain).map(arg => removeUnsetKeys(arg)));
                assert.deepStrictEqual({ select: true, focus: false, expand: false }, revealTarget.args[0][2]);
            }));
        });
        test('reveal will return parents array for deeper element with no selection', () => {
            tree = {
                'b': {
                    'ba': {
                        'bac': {}
                    }
                }
            };
            const revealTarget = sinon.spy(target, '$reveal');
            const treeView = testObject.createTreeView('treeDataProvider', { treeDataProvider: aCompleteNodeTreeDataProvider() }, extensions_1.nullExtensionDescription);
            const expected = {
                item: { handle: '0/0:b/0:ba/0:bac', label: { label: 'bac' }, collapsibleState: views_1.TreeItemCollapsibleState.None, parentHandle: '0/0:b/0:ba' },
                parentChain: [
                    { handle: '0/0:b', label: { label: 'b' }, collapsibleState: views_1.TreeItemCollapsibleState.Collapsed },
                    { handle: '0/0:b/0:ba', label: { label: 'ba' }, collapsibleState: views_1.TreeItemCollapsibleState.Collapsed, parentHandle: '0/0:b' }
                ]
            };
            return treeView.reveal({ key: 'bac' }, { select: false, focus: false, expand: false })
                .then(() => {
                assert.ok(revealTarget.calledOnce);
                assert.deepStrictEqual('treeDataProvider', revealTarget.args[0][0]);
                assert.deepStrictEqual(expected.item, removeUnsetKeys(revealTarget.args[0][1].item));
                assert.deepStrictEqual(expected.parentChain, (revealTarget.args[0][1].parentChain).map(arg => removeUnsetKeys(arg)));
                assert.deepStrictEqual({ select: false, focus: false, expand: false }, revealTarget.args[0][2]);
            });
        });
        test('reveal after first udpate', () => {
            const revealTarget = sinon.spy(target, '$reveal');
            const treeView = testObject.createTreeView('treeDataProvider', { treeDataProvider: aCompleteNodeTreeDataProvider() }, extensions_1.nullExtensionDescription);
            const expected = {
                item: { handle: '0/0:a/0:ac', label: { label: 'ac' }, collapsibleState: views_1.TreeItemCollapsibleState.None, parentHandle: '0/0:a' },
                parentChain: [{ handle: '0/0:a', label: { label: 'a' }, collapsibleState: views_1.TreeItemCollapsibleState.Collapsed }]
            };
            return loadCompleteTree('treeDataProvider')
                .then(() => {
                tree = {
                    'a': {
                        'aa': {},
                        'ac': {}
                    },
                    'b': {
                        'ba': {},
                        'bb': {}
                    }
                };
                onDidChangeTreeNode.fire(getNode('a'));
                return treeView.reveal({ key: 'ac' })
                    .then(() => {
                    assert.ok(revealTarget.calledOnce);
                    assert.deepStrictEqual('treeDataProvider', revealTarget.args[0][0]);
                    assert.deepStrictEqual(expected.item, removeUnsetKeys(revealTarget.args[0][1].item));
                    assert.deepStrictEqual(expected.parentChain, (revealTarget.args[0][1].parentChain).map(arg => removeUnsetKeys(arg)));
                    assert.deepStrictEqual({ select: true, focus: false, expand: false }, revealTarget.args[0][2]);
                });
            });
        });
        test('reveal after second udpate', () => {
            const revealTarget = sinon.spy(target, '$reveal');
            const treeView = testObject.createTreeView('treeDataProvider', { treeDataProvider: aCompleteNodeTreeDataProvider() }, extensions_1.nullExtensionDescription);
            return loadCompleteTree('treeDataProvider')
                .then(() => {
                return runWithEventMerging((resolve) => {
                    tree = {
                        'a': {
                            'aa': {},
                            'ac': {}
                        },
                        'b': {
                            'ba': {},
                            'bb': {}
                        }
                    };
                    onDidChangeTreeNode.fire(getNode('a'));
                    tree = {
                        'a': {
                            'aa': {},
                            'ac': {}
                        },
                        'b': {
                            'ba': {},
                            'bc': {}
                        }
                    };
                    onDidChangeTreeNode.fire(getNode('b'));
                    resolve();
                }).then(() => {
                    return treeView.reveal({ key: 'bc' })
                        .then(() => {
                        assert.ok(revealTarget.calledOnce);
                        assert.deepStrictEqual('treeDataProvider', revealTarget.args[0][0]);
                        assert.deepStrictEqual({ handle: '0/0:b/0:bc', label: { label: 'bc' }, collapsibleState: views_1.TreeItemCollapsibleState.None, parentHandle: '0/0:b' }, removeUnsetKeys(revealTarget.args[0][1].item));
                        assert.deepStrictEqual([{ handle: '0/0:b', label: { label: 'b' }, collapsibleState: views_1.TreeItemCollapsibleState.Collapsed }], revealTarget.args[0][1].parentChain.map(arg => removeUnsetKeys(arg)));
                        assert.deepStrictEqual({ select: true, focus: false, expand: false }, revealTarget.args[0][2]);
                    });
                });
            });
        });
        function loadCompleteTree(treeId, element) {
            return testObject.$getChildren(treeId, element)
                .then(elements => elements?.map(e => loadCompleteTree(treeId, e.handle)))
                .then(() => null);
        }
        function removeUnsetKeys(obj) {
            if (Array.isArray(obj)) {
                return obj.map(o => removeUnsetKeys(o));
            }
            if (typeof obj === 'object') {
                const result = {};
                for (const key of Object.keys(obj)) {
                    if (obj[key] !== undefined) {
                        result[key] = removeUnsetKeys(obj[key]);
                    }
                }
                return result;
            }
            return obj;
        }
        function aNodeTreeDataProvider() {
            return {
                getChildren: (element) => {
                    return getChildren(element ? element.key : undefined).map(key => getNode(key));
                },
                getTreeItem: (element) => {
                    return getTreeItem(element.key);
                },
                onDidChangeTreeData: onDidChangeTreeNode.event
            };
        }
        function aCompleteNodeTreeDataProvider() {
            return {
                getChildren: (element) => {
                    return getChildren(element ? element.key : undefined).map(key => getNode(key));
                },
                getTreeItem: (element) => {
                    return getTreeItem(element.key);
                },
                getParent: ({ key }) => {
                    const parentKey = key.substring(0, key.length - 1);
                    return parentKey ? new Key(parentKey) : undefined;
                },
                onDidChangeTreeData: onDidChangeTreeNode.event
            };
        }
        function aNodeWithIdTreeDataProvider() {
            return {
                getChildren: (element) => {
                    return getChildren(element ? element.key : undefined).map(key => getNode(key));
                },
                getTreeItem: (element) => {
                    const treeItem = getTreeItem(element.key);
                    treeItem.id = element.key;
                    return treeItem;
                },
                onDidChangeTreeData: onDidChangeTreeNodeWithId.event
            };
        }
        function aNodeWithHighlightedLabelTreeDataProvider() {
            return {
                getChildren: (element) => {
                    return getChildren(element ? element.key : undefined).map(key => getNode(key));
                },
                getTreeItem: (element) => {
                    const treeItem = getTreeItem(element.key, [[0, 2], [3, 5]]);
                    treeItem.id = element.key;
                    return treeItem;
                },
                onDidChangeTreeData: onDidChangeTreeNodeWithId.event
            };
        }
        function getTreeElement(element) {
            let parent = tree;
            for (let i = 0; i < element.length; i++) {
                parent = parent[element.substring(0, i + 1)];
                if (!parent) {
                    return null;
                }
            }
            return parent;
        }
        function getChildren(key) {
            if (!key) {
                return Object.keys(tree);
            }
            const treeElement = getTreeElement(key);
            if (treeElement) {
                return Object.keys(treeElement);
            }
            return [];
        }
        function getTreeItem(key, highlights) {
            const treeElement = getTreeElement(key);
            return {
                label: { label: labels[key] || key, highlights },
                collapsibleState: treeElement && Object.keys(treeElement).length ? views_1.TreeItemCollapsibleState.Collapsed : views_1.TreeItemCollapsibleState.None
            };
        }
        function getNode(key) {
            if (!nodes[key]) {
                nodes[key] = new Key(key);
            }
            return nodes[key];
        }
        class Key {
            constructor(key) {
                this.key = key;
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFRyZWVWaWV3cy50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS90ZXN0L2Jyb3dzZXIvZXh0SG9zdFRyZWVWaWV3cy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBbUJoRyxLQUFLLENBQUMsaUJBQWlCLEVBQUU7UUFDeEIsTUFBTSxLQUFLLEdBQUcsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRXhELE1BQU0sY0FBZSxTQUFRLElBQUEsV0FBSSxHQUE0QjtZQUE3RDs7Z0JBRUMsY0FBUyxHQUFHLElBQUksZUFBTyxFQUEyQyxDQUFDO1lBbUJwRSxDQUFDO1lBakJTLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxVQUFrQjtZQUMvRCxDQUFDO1lBRVEsUUFBUSxDQUFDLE1BQWMsRUFBRSxjQUF1RDtnQkFDeEYsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7b0JBQ3RDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUNyQyxDQUFDLENBQUMsQ0FBQztZQUNKLENBQUM7WUFFUSxPQUFPLENBQUMsVUFBa0IsRUFBRSxRQUFtRSxFQUFFLE9BQXVCO2dCQUNoSSxPQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUMxQixDQUFDO1lBRVEsWUFBWSxDQUFDLFVBQWtCO2dCQUN2QyxPQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUMxQixDQUFDO1NBRUQ7UUFFRCxJQUFJLFVBQTRCLENBQUM7UUFDakMsSUFBSSxNQUFzQixDQUFDO1FBQzNCLElBQUksbUJBQXlELENBQUM7UUFDOUQsSUFBSSx5QkFBbUQsQ0FBQztRQUN4RCxJQUFJLElBQTRCLENBQUM7UUFDakMsSUFBSSxNQUFpQyxDQUFDO1FBQ3RDLElB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