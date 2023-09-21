/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/workbench/api/common/extHostDiagnostics", "vs/workbench/api/common/extHostTypes", "vs/platform/markers/common/markers", "vs/base/test/common/mock", "vs/base/common/event", "vs/platform/log/common/log", "vs/workbench/services/extensions/common/extensions", "vs/base/common/resources", "vs/base/test/common/timeTravelScheduler", "vs/base/test/common/utils"], function (require, exports, assert, uri_1, extHostDiagnostics_1, extHostTypes_1, markers_1, mock_1, event_1, log_1, extensions_1, resources_1, timeTravelScheduler_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtHostDiagnostics', () => {
        class DiagnosticsShape extends (0, mock_1.mock)() {
            $changeMany(owner, entries) {
                //
            }
            $clear(owner) {
                //
            }
        }
        const fileSystemInfoService = new class extends (0, mock_1.mock)() {
            constructor() {
                super(...arguments);
                this.extUri = resources_1.extUri;
            }
        };
        const versionProvider = (uri) => {
            return undefined;
        };
        const store = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('disposeCheck', () => {
            const collection = new extHostDiagnostics_1.DiagnosticCollection('test', 'test', 100, 100, versionProvider, resources_1.extUri, new DiagnosticsShape(), new event_1.Emitter());
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
            let collection = new extHostDiagnostics_1.DiagnosticCollection('test', 'test', 100, 100, versionProvider, resources_1.extUri, new DiagnosticsShape(), new event_1.Emitter());
            assert.strictEqual(collection.name, 'test');
            collection.dispose();
            assert.throws(() => collection.name);
            let c = 0;
            collection = new extHostDiagnostics_1.DiagnosticCollection('test', 'test', 100, 100, versionProvider, resources_1.extUri, new DiagnosticsShape(), new event_1.Emitter());
            collection.forEach(() => c++);
            assert.strictEqual(c, 0);
            collection.set(uri_1.URI.parse('foo:bar'), [
                new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'message-1'),
                new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'message-2')
            ]);
            collection.forEach(() => c++);
            assert.strictEqual(c, 1);
            c = 0;
            collection.clear();
            collection.forEach(() => c++);
            assert.strictEqual(c, 0);
            collection.set(uri_1.URI.parse('foo:bar1'), [
                new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'message-1'),
                new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'message-2')
            ]);
            collection.set(uri_1.URI.parse('foo:bar2'), [
                new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'message-1'),
                new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'message-2')
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
            const collection = new extHostDiagnostics_1.DiagnosticCollection('test', 'test', 100, 100, versionProvider, resources_1.extUri, new DiagnosticsShape(), new event_1.Emitter());
            collection.set(uri_1.URI.parse('foo:bar'), [
                new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'message-1'),
                new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'message-2')
            ]);
            let array = collection.get(uri_1.URI.parse('foo:bar'));
            assert.throws(() => array.length = 0);
            assert.throws(() => array.pop());
            assert.throws(() => array[0] = new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 0, 0), 'evil'));
            collection.forEach((uri, array) => {
                assert.throws(() => array.length = 0);
                assert.throws(() => array.pop());
                assert.throws(() => array[0] = new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 0, 0), 'evil'));
            });
            array = collection.get(uri_1.URI.parse('foo:bar'));
            assert.strictEqual(array.length, 2);
            collection.dispose();
        });
        test('diagnostics collection, set with dupliclated tuples', function () {
            const collection = new extHostDiagnostics_1.DiagnosticCollection('test', 'test', 100, 100, versionProvider, resources_1.extUri, new DiagnosticsShape(), new event_1.Emitter());
            const uri = uri_1.URI.parse('sc:hightower');
            collection.set([
                [uri, [new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 0, 1), 'message-1')]],
                [uri_1.URI.parse('some:thing'), [new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'something')]],
                [uri, [new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 0, 1), 'message-2')]],
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
                [uri, [new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 0, 1), 'message-1')]],
                [uri_1.URI.parse('some:thing'), [new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'something')]],
                [uri, undefined]
            ]);
            assert.ok(!collection.has(uri));
            // clear
            collection.delete(uri);
            assert.ok(!collection.has(uri));
            // bad tuple clears 2/2
            collection.set([
                [uri, [new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 0, 1), 'message-1')]],
                [uri_1.URI.parse('some:thing'), [new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'something')]],
                [uri, undefined],
                [uri, [new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 0, 1), 'message-2')]],
                [uri, [new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 0, 1), 'message-3')]],
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
            const collection = new extHostDiagnostics_1.DiagnosticCollection('test', 'test', 100, 100, versionProvider, resources_1.extUri, new class extends DiagnosticsShape {
                $changeMany(owner, entries) {
                    lastEntries = entries;
                    return super.$changeMany(owner, entries);
                }
            }, new event_1.Emitter());
            const uri = uri_1.URI.parse('sc:hightower');
            collection.set([[uri, [new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'error')]]]);
            assert.strictEqual(collection.get(uri).length, 1);
            assert.strictEqual(collection.get(uri)[0].message, 'error');
            assert.strictEqual(lastEntries.length, 1);
            const [[, data1]] = lastEntries;
            assert.strictEqual(data1.length, 1);
            assert.strictEqual(data1[0].message, 'error');
            lastEntries = undefined;
            collection.set([[uri, [new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'warning')]]]);
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
            const emitter = new event_1.Emitter();
            store.add(emitter.event(_ => eventCount += 1));
            const collection = new extHostDiagnostics_1.DiagnosticCollection('test', 'test', 100, 100, versionProvider, resources_1.extUri, new class extends DiagnosticsShape {
                $changeMany() {
                    changeCount += 1;
                }
            }, emitter);
            const uri = uri_1.URI.parse('sc:hightower');
            const diag = new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 0, 1), 'ffff');
            collection.set(uri, [diag]);
            assert.strictEqual(changeCount, 1);
            assert.strictEqual(eventCount, 1);
            collection.set(uri, [diag]);
            assert.strictEqual(changeCount, 2);
            assert.strictEqual(eventCount, 2);
        });
        test('diagnostics collection, tuples and undefined (small array), #15585', function () {
            const collection = new extHostDiagnostics_1.DiagnosticCollection('test', 'test', 100, 100, versionProvider, resources_1.extUri, new DiagnosticsShape(), new event_1.Emitter());
            const uri = uri_1.URI.parse('sc:hightower');
            const uri2 = uri_1.URI.parse('sc:nomad');
            const diag = new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 0, 1), 'ffff');
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
            const collection = new extHostDiagnostics_1.DiagnosticCollection('test', 'test', 100, 100, versionProvider, resources_1.extUri, new DiagnosticsShape(), new event_1.Emitter());
            const tuples = [];
            for (let i = 0; i < 500; i++) {
                const uri = uri_1.URI.parse('sc:hightower#' + i);
                const diag = new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 0, 1), i.toString());
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
            const collection = new extHostDiagnostics_1.DiagnosticCollection('test', 'test', 100, 250, versionProvider, resources_1.extUri, new class extends DiagnosticsShape {
                $changeMany(owner, entries) {
                    lastEntries = entries;
                    return super.$changeMany(owner, entries);
                }
            }, new event_1.Emitter());
            const uri = uri_1.URI.parse('aa:bb');
            const diagnostics = [];
            for (let i = 0; i < 500; i++) {
                diagnostics.push(new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(i, 0, i + 1, 0), `error#${i}`, i < 300
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
            const collection = new extHostDiagnostics_1.DiagnosticCollection('test', 'test', 2, 1, versionProvider, resources_1.extUri, new class extends DiagnosticsShape {
                $changeMany(owner, entries) {
                    lastEntries = entries;
                    return super.$changeMany(owner, entries);
                }
            }, new event_1.Emitter());
            const diag = new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'Hello');
            collection.set([
                [uri_1.URI.parse('aa:bb1'), [diag]],
                [uri_1.URI.parse('aa:bb2'), [diag]],
                [uri_1.URI.parse('aa:bb3'), [diag]],
                [uri_1.URI.parse('aa:bb4'), [diag]],
            ]);
            assert.strictEqual(lastEntries.length, 3); // goes above the limit and then stops
        });
        test('diagnostic eventing', async function () {
            const emitter = new event_1.Emitter();
            const collection = new extHostDiagnostics_1.DiagnosticCollection('ddd', 'test', 100, 100, versionProvider, resources_1.extUri, new DiagnosticsShape(), emitter);
            const diag1 = new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(1, 1, 2, 3), 'diag1');
            const diag2 = new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(1, 1, 2, 3), 'diag2');
            const diag3 = new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(1, 1, 2, 3), 'diag3');
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
            const emitter = new event_1.Emitter();
            const collection = new extHostDiagnostics_1.DiagnosticCollection('ddd', 'test', 100, 100, versionProvider, resources_1.extUri, new DiagnosticsShape(), emitter);
            const diag1 = new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(1, 1, 2, 3), 'diag1');
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
            const collection = new extHostDiagnostics_1.DiagnosticCollection('ddd', 'test', 100, 100, versionProvider, resources_1.extUri, new class extends DiagnosticsShape {
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
            }, new event_1.Emitter());
            const diag = new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'Foo');
            diag.relatedInformation = [
                new extHostTypes_1.DiagnosticRelatedInformation(new extHostTypes_1.Location(uri_1.URI.parse('cc:dd'), new extHostTypes_1.Range(0, 0, 0, 0)), 'more1'),
                new extHostTypes_1.DiagnosticRelatedInformation(new extHostTypes_1.Location(uri_1.URI.parse('cc:ee'), new extHostTypes_1.Range(0, 0, 0, 0)), 'more2')
            ];
            collection.set(uri_1.URI.parse('aa:bb'), [diag]);
        });
        test('vscode.languages.getDiagnostics appears to return old diagnostics in some circumstances #54359', function () {
            const ownerHistory = [];
            const diags = new extHostDiagnostics_1.ExtHostDiagnostics(new class {
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
            }, new log_1.NullLogService(), fileSystemInfoService, new class extends (0, mock_1.mock)() {
                getDocument() {
                    return undefined;
                }
            });
            const collection1 = diags.createDiagnosticCollection(extensions_1.nullExtensionDescription.identifier, 'foo');
            const collection2 = diags.createDiagnosticCollection(extensions_1.nullExtensionDescription.identifier, 'foo'); // warns, uses a different owner
            collection1.clear();
            collection2.clear();
            assert.strictEqual(ownerHistory.length, 2);
            assert.strictEqual(ownerHistory[0], 'foo');
            assert.strictEqual(ownerHistory[1], 'foo0');
        });
        test('Error updating diagnostics from extension #60394', function () {
            let callCount = 0;
            const collection = new extHostDiagnostics_1.DiagnosticCollection('ddd', 'test', 100, 100, versionProvider, resources_1.extUri, new class extends DiagnosticsShape {
                $changeMany(owner, entries) {
                    callCount += 1;
                }
            }, new event_1.Emitter());
            const array = [];
            const diag1 = new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'Foo');
            const diag2 = new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'Bar');
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
            const collection = new extHostDiagnostics_1.DiagnosticCollection('ddd', 'test', 100, 100, uri => {
                return 7;
            }, resources_1.extUri, new class extends DiagnosticsShape {
                $changeMany(_owner, entries) {
                    all.push(...entries);
                }
            }, new event_1.Emitter());
            const array = [];
            const diag1 = new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'Foo');
            const diag2 = new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 1, 1), 'Bar');
            array.push(diag1, diag2);
            collection.set(uri_1.URI.parse('test:one'), array);
            collection.set(uri_1.URI.parse('test:two'), [diag1]);
            collection.set(uri_1.URI.parse('test:three'), [diag2]);
            const allVersions = all.map(tuple => tuple[1].map(t => t.modelVersionId)).flat();
            assert.deepStrictEqual(allVersions, [7, 7, 7, 7]);
        });
        test('Diagnostics created by tasks aren\'t accessible to extensions #47292', async function () {
            return (0, timeTravelScheduler_1.runWithFakedTimers)({}, async function () {
                const diags = new extHostDiagnostics_1.ExtHostDiagnostics(new class {
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
                }, new log_1.NullLogService(), fileSystemInfoService, new class extends (0, mock_1.mock)() {
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
            const diags = new extHostDiagnostics_1.ExtHostDiagnostics(new class {
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
            }, new log_1.NullLogService(), new class extends (0, mock_1.mock)() {
                constructor() {
                    super(...arguments);
                    this.extUri = new resources_1.ExtUri(uri => uri.scheme === 'insensitive');
                }
            }, new class extends (0, mock_1.mock)() {
                getDocument() {
                    return undefined;
                }
            });
            const col = diags.createDiagnosticCollection(extensions_1.nullExtensionDescription.identifier);
            const uriSensitive = uri_1.URI.from({ scheme: 'foo', path: '/SOME/path' });
            const uriSensitiveCaseB = uriSensitive.with({ path: uriSensitive.path.toUpperCase() });
            const uriInSensitive = uri_1.URI.from({ scheme: 'insensitive', path: '/SOME/path' });
            const uriInSensitiveUpper = uriInSensitive.with({ path: uriInSensitive.path.toUpperCase() });
            col.set(uriSensitive, [new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 0, 0), 'sensitive')]);
            col.set(uriInSensitive, [new extHostTypes_1.Diagnostic(new extHostTypes_1.Range(0, 0, 0, 0), 'insensitive')]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdERpYWdub3N0aWNzLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL3Rlc3QvYnJvd3Nlci9leHRIb3N0RGlhZ25vc3RpY3MudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQW1CaEcsS0FBSyxDQUFDLG9CQUFvQixFQUFFLEdBQUcsRUFBRTtRQUVoQyxNQUFNLGdCQUFpQixTQUFRLElBQUEsV0FBSSxHQUE4QjtZQUN2RCxXQUFXLENBQUMsS0FBYSxFQUFFLE9BQXlDO2dCQUM1RSxFQUFFO1lBQ0gsQ0FBQztZQUNRLE1BQU0sQ0FBQyxLQUFhO2dCQUM1QixFQUFFO1lBQ0gsQ0FBQztTQUNEO1FBRUQsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLEtBQU0sU0FBUSxJQUFBLFdBQUksR0FBMEI7WUFBNUM7O2dCQUNmLFdBQU0sR0FBRyxrQkFBTSxDQUFDO1lBQ25DLENBQUM7U0FBQSxDQUFDO1FBRUYsTUFBTSxlQUFlLEdBQUcsQ0FBQyxHQUFRLEVBQXNCLEVBQUU7WUFDeEQsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQyxDQUFDO1FBRUYsTUFBTSxLQUFLLEdBQUcsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRXhELElBQUksQ0FBQyxjQUFjLEVBQUUsR0FBRyxFQUFFO1lBRXpCLE1BQU0sVUFBVSxHQUFHLElBQUkseUNBQW9CLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLGVBQWUsRUFBRSxrQkFBTSxFQUFFLElBQUksZ0JBQWdCLEVBQUUsRUFBRSxJQUFJLGVBQU8sRUFBRSxDQUFDLENBQUM7WUFFdEksVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3JCLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLFlBQVk7WUFDbEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVB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