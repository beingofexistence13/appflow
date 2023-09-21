/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/workbench/api/common/extHostDiagnostics", "vs/workbench/api/common/extHostTypes", "vs/platform/markers/common/markers", "vs/base/test/common/mock", "vs/base/common/event", "vs/platform/log/common/log", "vs/workbench/services/extensions/common/extensions", "vs/base/common/resources", "vs/base/test/common/timeTravelScheduler", "vs/base/test/common/utils"], function (require, exports, assert, uri_1, extHostDiagnostics_1, extHostTypes_1, markers_1, mock_1, event_1, log_1, extensions_1, resources_1, timeTravelScheduler_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtHostDiagnostics', () => {
        class DiagnosticsShape extends (0, mock_1.$rT)() {
            $changeMany(owner, entries) {
                //
            }
            $clear(owner) {
                //
            }
        }
        const fileSystemInfoService = new class extends (0, mock_1.$rT)() {
            constructor() {
                super(...arguments);
                this.extUri = resources_1.$$f;
            }
        };
        const versionProvider = (uri) => {
            return undefined;
        };
        const store = (0, utils_1.$bT)();
        test('disposeCheck', () => {
            const collection = new extHostDiagnostics_1.$0ac('test', 'test', 100, 100, versionProvider, resources_1.$$f, new DiagnosticsShape(), new event_1.$fd());
            collection.dispose();
            collection.dispose(); // that's OK
            assert.throws(() => collection.name);
            assert.throws(() => collection.clear());
            assert.throws(() => collection.delete(uri_1.URI.parse('aa:bb')));
            assert.throws(() => collection.forEach(() => { }));
            assert.throws(() => collection.get(uri_1.URI.parse('aa:bb')));
            assert.throws(() => collection.has(uri_1.URI.parse('aa:bb')));
            assert.throws(() => collection.set(uri_1.URI.parse('aa:bb'), []));
            assert.throws(() => collection.set(uri_1.URI.parse('aa:bb'), undefined));
        });
        test('diagnostic collection, forEach, clear, has', function () {
            let collection = new extHostDiagnostics_1.$0ac('test', 'test', 100, 100, versionProvider, resources_1.$$f, new DiagnosticsShape(), new event_1.$fd());
            assert.strictEqual(collection.name, 'test');
            collection.dispose();
            assert.throws(() => collection.name);
            let c = 0;
            collection = new extHostDiagnostics_1.$0ac('test', 'test', 100, 100, versionProvider, resources_1.$$f, new DiagnosticsShape(), new event_1.$fd());
            collection.forEach(() => c++);
            assert.strictEqual(c, 0);
            collection.set(uri_1.URI.parse('foo:bar'), [
                new extHostTypes_1.$eK(new extHostTypes_1.$5J(0, 0, 1, 1), 'message-1'),
                new extHostTypes_1.$eK(new extHostTypes_1.$5J(0, 0, 1, 1), 'message-2')
            ]);
            collection.forEach(() => c++);
            assert.strictEqual(c, 1);
            c = 0;
            collection.clear();
            collection.forEach(() => c++);
            assert.strictEqual(c, 0);
            collection.set(uri_1.URI.parse('foo:bar1'), [
                new extHostTypes_1.$eK(new extHostTypes_1.$5J(0, 0, 1, 1), 'message-1'),
                new extHostTypes_1.$eK(new extHostTypes_1.$5J(0, 0, 1, 1), 'message-2')
            ]);
            collection.set(uri_1.URI.parse('foo:bar2'), [
                new extHostTypes_1.$eK(new extHostTypes_1.$5J(0, 0, 1, 1), 'message-1'),
                new extHostTypes_1.$eK(new extHostTypes_1.$5J(0, 0, 1, 1), 'message-2')
            ]);
            collection.forEach(() => c++);
            assert.strictEqual(c, 2);
            assert.ok(collection.has(uri_1.URI.parse('foo:bar1')));
            assert.ok(collection.has(uri_1.URI.parse('foo:bar2')));
            assert.ok(!collection.has(uri_1.URI.parse('foo:bar3')));
            collection.delete(uri_1.URI.parse('foo:bar1'));
            assert.ok(!collection.has(uri_1.URI.parse('foo:bar1')));
            collection.dispose();
        });
        test('diagnostic collection, immutable read', function () {
            const collection = new extHostDiagnostics_1.$0ac('test', 'test', 100, 100, versionProvider, resources_1.$$f, new DiagnosticsShape(), new event_1.$fd());
            collection.set(uri_1.URI.parse('foo:bar'), [
                new extHostTypes_1.$eK(new extHostTypes_1.$5J(0, 0, 1, 1), 'message-1'),
                new extHostTypes_1.$eK(new extHostTypes_1.$5J(0, 0, 1, 1), 'message-2')
            ]);
            let array = collection.get(uri_1.URI.parse('foo:bar'));
            assert.throws(() => array.length = 0);
            assert.throws(() => array.pop());
            assert.throws(() => array[0] = new extHostTypes_1.$eK(new extHostTypes_1.$5J(0, 0, 0, 0), 'evil'));
            collection.forEach((uri, array) => {
                assert.throws(() => array.length = 0);
                assert.throws(() => array.pop());
                assert.throws(() => array[0] = new extHostTypes_1.$eK(new extHostTypes_1.$5J(0, 0, 0, 0), 'evil'));
            });
            array = collection.get(uri_1.URI.parse('foo:bar'));
            assert.strictEqual(array.length, 2);
            collection.dispose();
        });
        test('diagnostics collection, set with dupliclated tuples', function () {
            const collection = new extHostDiagnostics_1.$0ac('test', 'test', 100, 100, versionProvider, resources_1.$$f, new DiagnosticsShape(), new event_1.$fd());
            const uri = uri_1.URI.parse('sc:hightower');
            collection.set([
                [uri, [new extHostTypes_1.$eK(new extHostTypes_1.$5J(0, 0, 0, 1), 'message-1')]],
                [uri_1.URI.parse('some:thing'), [new extHostTypes_1.$eK(new extHostTypes_1.$5J(0, 0, 1, 1), 'something')]],
                [uri, [new extHostTypes_1.$eK(new extHostTypes_1.$5J(0, 0, 0, 1), 'message-2')]],
            ]);
            let array = collection.get(uri);
            assert.strictEqual(array.length, 2);
            let [first, second] = array;
            assert.strictEqual(first.message, 'message-1');
            assert.strictEqual(second.message, 'message-2');
            // clear
            collection.delete(uri);
            assert.ok(!collection.has(uri));
            // bad tuple clears 1/2
            collection.set([
                [uri, [new extHostTypes_1.$eK(new extHostTypes_1.$5J(0, 0, 0, 1), 'message-1')]],
                [uri_1.URI.parse('some:thing'), [new extHostTypes_1.$eK(new extHostTypes_1.$5J(0, 0, 1, 1), 'something')]],
                [uri, undefined]
            ]);
            assert.ok(!collection.has(uri));
            // clear
            collection.delete(uri);
            assert.ok(!collection.has(uri));
            // bad tuple clears 2/2
            collection.set([
                [uri, [new extHostTypes_1.$eK(new extHostTypes_1.$5J(0, 0, 0, 1), 'message-1')]],
                [uri_1.URI.parse('some:thing'), [new extHostTypes_1.$eK(new extHostTypes_1.$5J(0, 0, 1, 1), 'something')]],
                [uri, undefined],
                [uri, [new extHostTypes_1.$eK(new extHostTypes_1.$5J(0, 0, 0, 1), 'message-2')]],
                [uri, [new extHostTypes_1.$eK(new extHostTypes_1.$5J(0, 0, 0, 1), 'message-3')]],
            ]);
            array = collection.get(uri);
            assert.strictEqual(array.length, 2);
            [first, second] = array;
            assert.strictEqual(first.message, 'message-2');
            assert.strictEqual(second.message, 'message-3');
            collection.dispose();
        });
        test('diagnostics collection, set tuple overrides, #11547', function () {
            let lastEntries;
            const collection = new extHostDiagnostics_1.$0ac('test', 'test', 100, 100, versionProvider, resources_1.$$f, new class extends DiagnosticsShape {
                $changeMany(owner, entries) {
                    lastEntries = entries;
                    return super.$changeMany(owner, entries);
                }
            }, new event_1.$fd());
            const uri = uri_1.URI.parse('sc:hightower');
            collection.set([[uri, [new extHostTypes_1.$eK(new extHostTypes_1.$5J(0, 0, 1, 1), 'error')]]]);
            assert.strictEqual(collection.get(uri).length, 1);
            assert.strictEqual(collection.get(uri)[0].message, 'error');
            assert.strictEqual(lastEntries.length, 1);
            const [[, data1]] = lastEntries;
            assert.strictEqual(data1.length, 1);
            assert.strictEqual(data1[0].message, 'error');
            lastEntries = undefined;
            collection.set([[uri, [new extHostTypes_1.$eK(new extHostTypes_1.$5J(0, 0, 1, 1), 'warning')]]]);
            assert.strictEqual(collection.get(uri).length, 1);
            assert.strictEqual(collection.get(uri)[0].message, 'warning');
            assert.strictEqual(lastEntries.length, 1);
            const [[, data2]] = lastEntries;
            assert.strictEqual(data2.length, 1);
            assert.strictEqual(data2[0].message, 'warning');
            lastEntries = undefined;
        });
        test('do send message when not making a change', function () {
            let changeCount = 0;
            let eventCount = 0;
            const emitter = new event_1.$fd();
            store.add(emitter.event(_ => eventCount += 1));
            const collection = new extHostDiagnostics_1.$0ac('test', 'test', 100, 100, versionProvider, resources_1.$$f, new class extends DiagnosticsShape {
                $changeMany() {
                    changeCount += 1;
                }
            }, emitter);
            const uri = uri_1.URI.parse('sc:hightower');
            const diag = new extHostTypes_1.$eK(new extHostTypes_1.$5J(0, 0, 0, 1), 'ffff');
            collection.set(uri, [diag]);
            assert.strictEqual(changeCount, 1);
            assert.strictEqual(eventCount, 1);
            collection.set(uri, [diag]);
            assert.strictEqual(changeCount, 2);
            assert.strictEqual(eventCount, 2);
        });
        test('diagnostics collection, tuples and undefined (small array), #15585', function () {
            const collection = new extHostDiagnostics_1.$0ac('test', 'test', 100, 100, versionProvider, resources_1.$$f, new DiagnosticsShape(), new event_1.$fd());
            const uri = uri_1.URI.parse('sc:hightower');
            const uri2 = uri_1.URI.parse('sc:nomad');
            const diag = new extHostTypes_1.$eK(new extHostTypes_1.$5J(0, 0, 0, 1), 'ffff');
            collection.set([
                [uri, [diag, diag, diag]],
                [uri, undefined],
                [uri, [diag]],
                [uri2, [diag, diag]],
                [uri2, undefined],
                [uri2, [diag]],
            ]);
            assert.strictEqual(collection.get(uri).length, 1);
            assert.strictEqual(collection.get(uri2).length, 1);
        });
        test('diagnostics collection, tuples and undefined (large array), #15585', function () {
            const collection = new extHostDiagnostics_1.$0ac('test', 'test', 100, 100, versionProvider, resources_1.$$f, new DiagnosticsShape(), new event_1.$fd());
            const tuples = [];
            for (let i = 0; i < 500; i++) {
                const uri = uri_1.URI.parse('sc:hightower#' + i);
                const diag = new extHostTypes_1.$eK(new extHostTypes_1.$5J(0, 0, 0, 1), i.toString());
                tuples.push([uri, [diag, diag, diag]]);
                tuples.push([uri, undefined]);
                tuples.push([uri, [diag]]);
            }
            collection.set(tuples);
            for (let i = 0; i < 500; i++) {
                const uri = uri_1.URI.parse('sc:hightower#' + i);
                assert.strictEqual(collection.has(uri), true);
                assert.strictEqual(collection.get(uri).length, 1);
            }
        });
        test('diagnostic capping (max per file)', function () {
            let lastEntries;
            const collection = new extHostDiagnostics_1.$0ac('test', 'test', 100, 250, versionProvider, resources_1.$$f, new class extends DiagnosticsShape {
                $changeMany(owner, entries) {
                    lastEntries = entries;
                    return super.$changeMany(owner, entries);
                }
            }, new event_1.$fd());
            const uri = uri_1.URI.parse('aa:bb');
            const diagnostics = [];
            for (let i = 0; i < 500; i++) {
                diagnostics.push(new extHostTypes_1.$eK(new extHostTypes_1.$5J(i, 0, i + 1, 0), `error#${i}`, i < 300
                    ? extHostTypes_1.DiagnosticSeverity.Warning
                    : extHostTypes_1.DiagnosticSeverity.Error));
            }
            collection.set(uri, diagnostics);
            assert.strictEqual(collection.get(uri).length, 500);
            assert.strictEqual(lastEntries.length, 1);
            assert.strictEqual(lastEntries[0][1].length, 251);
            assert.strictEqual(lastEntries[0][1][0].severity, markers_1.MarkerSeverity.Error);
            assert.strictEqual(lastEntries[0][1][200].severity, markers_1.MarkerSeverity.Warning);
            assert.strictEqual(lastEntries[0][1][250].severity, markers_1.MarkerSeverity.Info);
        });
        test('diagnostic capping (max files)', function () {
            let lastEntries;
            const collection = new extHostDiagnostics_1.$0ac('test', 'test', 2, 1, versionProvider, resources_1.$$f, new class extends DiagnosticsShape {
                $changeMany(owner, entries) {
                    lastEntries = entries;
                    return super.$changeMany(owner, entries);
                }
            }, new event_1.$fd());
            const diag = new extHostTypes_1.$eK(new extHostTypes_1.$5J(0, 0, 1, 1), 'Hello');
            collection.set([
                [uri_1.URI.parse('aa:bb1'), [diag]],
                [uri_1.URI.parse('aa:bb2'), [diag]],
                [uri_1.URI.parse('aa:bb3'), [diag]],
                [uri_1.URI.parse('aa:bb4'), [diag]],
            ]);
            assert.strictEqual(lastEntries.length, 3); // goes above the limit and then stops
        });
        test('diagnostic eventing', async function () {
            const emitter = new event_1.$fd();
            const collection = new extHostDiagnostics_1.$0ac('ddd', 'test', 100, 100, versionProvider, resources_1.$$f, new DiagnosticsShape(), emitter);
            const diag1 = new extHostTypes_1.$eK(new extHostTypes_1.$5J(1, 1, 2, 3), 'diag1');
            const diag2 = new extHostTypes_1.$eK(new extHostTypes_1.$5J(1, 1, 2, 3), 'diag2');
            const diag3 = new extHostTypes_1.$eK(new extHostTypes_1.$5J(1, 1, 2, 3), 'diag3');
            let p = event_1.Event.toPromise(emitter.event).then(a => {
                assert.strictEqual(a.length, 1);
                assert.strictEqual(a[0].toString(), 'aa:bb');
                assert.ok(uri_1.URI.isUri(a[0]));
            });
            collection.set(uri_1.URI.parse('aa:bb'), []);
            await p;
            p = event_1.Event.toPromise(emitter.event).then(e => {
                assert.strictEqual(e.length, 2);
                assert.ok(uri_1.URI.isUri(e[0]));
                assert.ok(uri_1.URI.isUri(e[1]));
                assert.strictEqual(e[0].toString(), 'aa:bb');
                assert.strictEqual(e[1].toString(), 'aa:cc');
            });
            collection.set([
                [uri_1.URI.parse('aa:bb'), [diag1]],
                [uri_1.URI.parse('aa:cc'), [diag2, diag3]],
            ]);
            await p;
            p = event_1.Event.toPromise(emitter.event).then(e => {
                assert.strictEqual(e.length, 2);
                assert.ok(uri_1.URI.isUri(e[0]));
                assert.ok(uri_1.URI.isUri(e[1]));
            });
            collection.clear();
            await p;
        });
        test('vscode.languages.onDidChangeDiagnostics Does Not Provide Document URI #49582', async function () {
            const emitter = new event_1.$fd();
            const collection = new extHostDiagnostics_1.$0ac('ddd', 'test', 100, 100, versionProvider, resources_1.$$f, new DiagnosticsShape(), emitter);
            const diag1 = new extHostTypes_1.$eK(new extHostTypes_1.$5J(1, 1, 2, 3), 'diag1');
            // delete
            collection.set(uri_1.URI.parse('aa:bb'), [diag1]);
            let p = event_1.Event.toPromise(emitter.event).then(e => {
                assert.strictEqual(e[0].toString(), 'aa:bb');
            });
            collection.delete(uri_1.URI.parse('aa:bb'));
            await p;
            // set->undefined (as delete)
            collection.set(uri_1.URI.parse('aa:bb'), [diag1]);
            p = event_1.Event.toPromise(emitter.event).then(e => {
                assert.strictEqual(e[0].toString(), 'aa:bb');
            });
            collection.set(uri_1.URI.parse('aa:bb'), undefined);
            await p;
        });
        test('diagnostics with related information', function (done) {
            const collection = new extHostDiagnostics_1.$0ac('ddd', 'test', 100, 100, versionProvider, resources_1.$$f, new class extends DiagnosticsShape {
                $changeMany(owner, entries) {
                    const [[, data]] = entries;
                    assert.strictEqual(entries.length, 1);
                    assert.strictEqual(data.length, 1);
                    const [diag] = data;
                    assert.strictEqual(diag.relatedInformation.length, 2);
                    assert.strictEqual(diag.relatedInformation[0].message, 'more1');
                    assert.strictEqual(diag.relatedInformation[1].message, 'more2');
                    done();
                }
            }, new event_1.$fd());
            const diag = new extHostTypes_1.$eK(new extHostTypes_1.$5J(0, 0, 1, 1), 'Foo');
            diag.relatedInformation = [
                new extHostTypes_1.$dK(new extHostTypes_1.$cK(uri_1.URI.parse('cc:dd'), new extHostTypes_1.$5J(0, 0, 0, 0)), 'more1'),
                new extHostTypes_1.$dK(new extHostTypes_1.$cK(uri_1.URI.parse('cc:ee'), new extHostTypes_1.$5J(0, 0, 0, 0)), 'more2')
            ];
            collection.set(uri_1.URI.parse('aa:bb'), [diag]);
        });
        test('vscode.languages.getDiagnostics appears to return old diagnostics in some circumstances #54359', function () {
            const ownerHistory = [];
            const diags = new extHostDiagnostics_1.$$ac(new class {
                getProxy(id) {
                    return new class DiagnosticsShape {
                        $clear(owner) {
                            ownerHistory.push(owner);
                        }
                    };
                }
                set() {
                    return null;
                }
                dispose() { }
                assertRegistered() {
                }
                drain() {
                    return undefined;
                }
            }, new log_1.$fj(), fileSystemInfoService, new class extends (0, mock_1.$rT)() {
                getDocument() {
                    return undefined;
                }
            });
            const collection1 = diags.createDiagnosticCollection(extensions_1.$KF.identifier, 'foo');
            const collection2 = diags.createDiagnosticCollection(extensions_1.$KF.identifier, 'foo'); // warns, uses a different owner
            collection1.clear();
            collection2.clear();
            assert.strictEqual(ownerHistory.length, 2);
            assert.strictEqual(ownerHistory[0], 'foo');
            assert.strictEqual(ownerHistory[1], 'foo0');
        });
        test('Error updating diagnostics from extension #60394', function () {
            let callCount = 0;
            const collection = new extHostDiagnostics_1.$0ac('ddd', 'test', 100, 100, versionProvider, resources_1.$$f, new class extends DiagnosticsShape {
                $changeMany(owner, entries) {
                    callCount += 1;
                }
            }, new event_1.$fd());
            const array = [];
            const diag1 = new extHostTypes_1.$eK(new extHostTypes_1.$5J(0, 0, 1, 1), 'Foo');
            const diag2 = new extHostTypes_1.$eK(new extHostTypes_1.$5J(0, 0, 1, 1), 'Bar');
            array.push(diag1, diag2);
            collection.set(uri_1.URI.parse('test:me'), array);
            assert.strictEqual(callCount, 1);
            collection.set(uri_1.URI.parse('test:me'), array);
            assert.strictEqual(callCount, 2); // equal array
            array.push(diag2);
            collection.set(uri_1.URI.parse('test:me'), array);
            assert.strictEqual(callCount, 3); // same but un-equal array
        });
        test('Version id is set whenever possible', function () {
            const all = [];
            const collection = new extHostDiagnostics_1.$0ac('ddd', 'test', 100, 100, uri => {
                return 7;
            }, resources_1.$$f, new class extends DiagnosticsShape {
                $changeMany(_owner, entries) {
                    all.push(...entries);
                }
            }, new event_1.$fd());
            const array = [];
            const diag1 = new extHostTypes_1.$eK(new extHostTypes_1.$5J(0, 0, 1, 1), 'Foo');
            const diag2 = new extHostTypes_1.$eK(new extHostTypes_1.$5J(0, 0, 1, 1), 'Bar');
            array.push(diag1, diag2);
            collection.set(uri_1.URI.parse('test:one'), array);
            collection.set(uri_1.URI.parse('test:two'), [diag1]);
            collection.set(uri_1.URI.parse('test:three'), [diag2]);
            const allVersions = all.map(tuple => tuple[1].map(t => t.modelVersionId)).flat();
            assert.deepStrictEqual(allVersions, [7, 7, 7, 7]);
        });
        test('Diagnostics created by tasks aren\'t accessible to extensions #47292', async function () {
            return (0, timeTravelScheduler_1.$kT)({}, async function () {
                const diags = new extHostDiagnostics_1.$$ac(new class {
                    getProxy(id) {
                        return {};
                    }
                    set() {
                        return null;
                    }
                    dispose() { }
                    assertRegistered() {
                    }
                    drain() {
                        return undefined;
                    }
                }, new log_1.$fj(), fileSystemInfoService, new class extends (0, mock_1.$rT)() {
                    getDocument() {
                        return undefined;
                    }
                });
                //
                const uri = uri_1.URI.parse('foo:bar');
                const data = [{
                        message: 'message',
                        startLineNumber: 1,
                        startColumn: 1,
                        endLineNumber: 1,
                        endColumn: 1,
                        severity: markers_1.MarkerSeverity.Info
                    }];
                const p1 = event_1.Event.toPromise(diags.onDidChangeDiagnostics);
                diags.$acceptMarkersChange([[uri, data]]);
                await p1;
                assert.strictEqual(diags.getDiagnostics(uri).length, 1);
                const p2 = event_1.Event.toPromise(diags.onDidChangeDiagnostics);
                diags.$acceptMarkersChange([[uri, []]]);
                await p2;
                assert.strictEqual(diags.getDiagnostics(uri).length, 0);
            });
        });
        test('languages.getDiagnostics doesn\'t handle case insensitivity correctly #128198', function () {
            const diags = new extHostDiagnostics_1.$$ac(new class {
                getProxy(id) {
                    return new DiagnosticsShape();
                }
                set() {
                    return null;
                }
                dispose() { }
                assertRegistered() {
                }
                drain() {
                    return undefined;
                }
            }, new log_1.$fj(), new class extends (0, mock_1.$rT)() {
                constructor() {
                    super(...arguments);
                    this.extUri = new resources_1.$0f(uri => uri.scheme === 'insensitive');
                }
            }, new class extends (0, mock_1.$rT)() {
                getDocument() {
                    return undefined;
                }
            });
            const col = diags.createDiagnosticCollection(extensions_1.$KF.identifier);
            const uriSensitive = uri_1.URI.from({ scheme: 'foo', path: '/SOME/path' });
            const uriSensitiveCaseB = uriSensitive.with({ path: uriSensitive.path.toUpperCase() });
            const uriInSensitive = uri_1.URI.from({ scheme: 'insensitive', path: '/SOME/path' });
            const uriInSensitiveUpper = uriInSensitive.with({ path: uriInSensitive.path.toUpperCase() });
            col.set(uriSensitive, [new extHostTypes_1.$eK(new extHostTypes_1.$5J(0, 0, 0, 0), 'sensitive')]);
            col.set(uriInSensitive, [new extHostTypes_1.$eK(new extHostTypes_1.$5J(0, 0, 0, 0), 'insensitive')]);
            // collection itself honours casing
            assert.strictEqual(col.get(uriSensitive)?.length, 1);
            assert.strictEqual(col.get(uriSensitiveCaseB)?.length, 0);
            assert.strictEqual(col.get(uriInSensitive)?.length, 1);
            assert.strictEqual(col.get(uriInSensitiveUpper)?.length, 1);
            // languages.getDiagnostics honours casing
            assert.strictEqual(diags.getDiagnostics(uriSensitive)?.length, 1);
            assert.strictEqual(diags.getDiagnostics(uriSensitiveCaseB)?.length, 0);
            assert.strictEqual(diags.getDiagnostics(uriInSensitive)?.length, 1);
            assert.strictEqual(diags.getDiagnostics(uriInSensitiveUpper)?.length, 1);
            const fromForEach = [];
            col.forEach(uri => fromForEach.push(uri));
            assert.strictEqual(fromForEach.length, 2);
            assert.strictEqual(fromForEach[0].toString(), uriSensitive.toString());
            assert.strictEqual(fromForEach[1].toString(), uriInSensitive.toString());
        });
    });
});
//# sourceMappingURL=extHostDiagnostics.test.js.map