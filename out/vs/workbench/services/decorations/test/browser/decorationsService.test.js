/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/services/decorations/browser/decorationsService", "vs/base/common/uri", "vs/base/common/event", "vs/base/common/resources", "vs/base/test/common/mock", "vs/platform/theme/test/common/testThemeService", "vs/base/test/common/timeTravelScheduler", "vs/base/test/common/utils"], function (require, exports, assert, decorationsService_1, uri_1, event_1, resources, mock_1, testThemeService_1, timeTravelScheduler_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('DecorationsService', function () {
        let service;
        setup(function () {
            service = new decorationsService_1.DecorationsService(new class extends (0, mock_1.mock)() {
                constructor() {
                    super(...arguments);
                    this.extUri = resources.extUri;
                }
            }, new testThemeService_1.TestThemeService());
        });
        teardown(function () {
            service.dispose();
        });
        const store = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('Async provider, async/evented result', function () {
            return (0, timeTravelScheduler_1.runWithFakedTimers)({}, async function () {
                const uri = uri_1.URI.parse('foo:bar');
                let callCounter = 0;
                const reg = service.registerDecorationsProvider(new class {
                    constructor() {
                        this.label = 'Test';
                        this.onDidChange = event_1.Event.None;
                    }
                    provideDecorations(uri) {
                        callCounter += 1;
                        return new Promise(resolve => {
                            setTimeout(() => resolve({
                                color: 'someBlue',
                                tooltip: 'T',
                                strikethrough: true
                            }));
                        });
                    }
                });
                // trigger -> async
                assert.strictEqual(service.getDecoration(uri, false), undefined);
                assert.strictEqual(callCounter, 1);
                // event when result is computed
                const e = await event_1.Event.toPromise(service.onDidChangeDecorations);
                assert.strictEqual(e.affectsResource(uri), true);
                // sync result
                assert.deepStrictEqual(service.getDecoration(uri, false).tooltip, 'T');
                assert.deepStrictEqual(service.getDecoration(uri, false).strikethrough, true);
                assert.strictEqual(callCounter, 1);
                reg.dispose();
            });
        });
        test('Sync provider, sync result', function () {
            const uri = uri_1.URI.parse('foo:bar');
            let callCounter = 0;
            const reg = service.registerDecorationsProvider(new class {
                constructor() {
                    this.label = 'Test';
                    this.onDidChange = event_1.Event.None;
                }
                provideDecorations(uri) {
                    callCounter += 1;
                    return { color: 'someBlue', tooltip: 'Z' };
                }
            });
            // trigger -> sync
            assert.deepStrictEqual(service.getDecoration(uri, false).tooltip, 'Z');
            assert.deepStrictEqual(service.getDecoration(uri, false).strikethrough, false);
            assert.strictEqual(callCounter, 1);
            reg.dispose();
        });
        test('Clear decorations on provider dispose', async function () {
            return (0, timeTravelScheduler_1.runWithFakedTimers)({}, async function () {
                const uri = uri_1.URI.parse('foo:bar');
                let callCounter = 0;
                const reg = service.registerDecorationsProvider(new class {
                    constructor() {
                        this.label = 'Test';
                        this.onDidChange = event_1.Event.None;
                    }
                    provideDecorations(uri) {
                        callCounter += 1;
                        return { color: 'someBlue', tooltip: 'J' };
                    }
                });
                // trigger -> sync
                assert.deepStrictEqual(service.getDecoration(uri, false).tooltip, 'J');
                assert.strictEqual(callCounter, 1);
                // un-register -> ensure good event
                let didSeeEvent = false;
                const p = new Promise(resolve => {
                    const l = service.onDidChangeDecorations(e => {
                        assert.strictEqual(e.affectsResource(uri), true);
                        assert.deepStrictEqual(service.getDecoration(uri, false), undefined);
                        assert.strictEqual(callCounter, 1);
                        didSeeEvent = true;
                        l.dispose();
                        resolve();
                    });
                });
                reg.dispose(); // will clear all data
                await p;
                assert.strictEqual(didSeeEvent, true);
            });
        });
        test('No default bubbling', function () {
            let reg = service.registerDecorationsProvider({
                label: 'Test',
                onDidChange: event_1.Event.None,
                provideDecorations(uri) {
                    return uri.path.match(/\.txt/)
                        ? { tooltip: '.txt', weight: 17 }
                        : undefined;
                }
            });
            const childUri = uri_1.URI.parse('file:///some/path/some/file.txt');
            let deco = service.getDecoration(childUri, false);
            assert.strictEqual(deco.tooltip, '.txt');
            deco = service.getDecoration(childUri.with({ path: 'some/path/' }), true);
            assert.strictEqual(deco, undefined);
            reg.dispose();
            // bubble
            reg = service.registerDecorationsProvider({
                label: 'Test',
                onDidChange: event_1.Event.None,
                provideDecorations(uri) {
                    return uri.path.match(/\.txt/)
                        ? { tooltip: '.txt.bubble', weight: 71, bubble: true }
                        : undefined;
                }
            });
            deco = service.getDecoration(childUri, false);
            assert.strictEqual(deco.tooltip, '.txt.bubble');
            deco = service.getDecoration(childUri.with({ path: 'some/path/' }), true);
            assert.strictEqual(typeof deco.tooltip, 'string');
            reg.dispose();
        });
        test('Decorations not showing up for second root folder #48502', async function () {
            let cancelCount = 0;
            let callCount = 0;
            const provider = new class {
                constructor() {
                    this._onDidChange = new event_1.Emitter();
                    this.onDidChange = this._onDidChange.event;
                    this.label = 'foo';
                }
                provideDecorations(uri, token) {
                    store.add(token.onCancellationRequested(() => {
                        cancelCount += 1;
                    }));
                    return new Promise(resolve => {
                        callCount += 1;
                        setTimeout(() => {
                            resolve({ letter: 'foo' });
                        }, 10);
                    });
                }
            };
            const reg = service.registerDecorationsProvider(provider);
            const uri = uri_1.URI.parse('foo://bar');
            const d1 = service.getDecoration(uri, false);
            provider._onDidChange.fire([uri]);
            const d2 = service.getDecoration(uri, false);
            assert.strictEqual(cancelCount, 1);
            assert.strictEqual(callCount, 2);
            d1?.dispose();
            d2?.dispose();
            reg.dispose();
        });
        test('Decorations not bubbling... #48745', function () {
            const reg = service.registerDecorationsProvider({
                label: 'Test',
                onDidChange: event_1.Event.None,
                provideDecorations(uri) {
                    if (uri.path.match(/hello$/)) {
                        return { tooltip: 'FOO', weight: 17, bubble: true };
                    }
                    else {
                        return new Promise(_resolve => { });
                    }
                }
            });
            const data1 = service.getDecoration(uri_1.URI.parse('a:b/'), true);
            assert.ok(!data1);
            const data2 = service.getDecoration(uri_1.URI.parse('a:b/c.hello'), false);
            assert.ok(data2.tooltip);
            const data3 = service.getDecoration(uri_1.URI.parse('a:b/'), true);
            assert.ok(data3);
            reg.dispose();
        });
        test('Folder decorations don\'t go away when file with problems is deleted #61919 (part1)', function () {
            const emitter = new event_1.Emitter();
            let gone = false;
            const reg = service.registerDecorationsProvider({
                label: 'Test',
                onDidChange: emitter.event,
                provideDecorations(uri) {
                    if (!gone && uri.path.match(/file.ts$/)) {
                        return { tooltip: 'FOO', weight: 17, bubble: true };
                    }
                    return undefined;
                }
            });
            const uri = uri_1.URI.parse('foo:/folder/file.ts');
            const uri2 = uri_1.URI.parse('foo:/folder/');
            let data = service.getDecoration(uri, true);
            assert.strictEqual(data.tooltip, 'FOO');
            data = service.getDecoration(uri2, true);
            assert.ok(data.tooltip); // emphazied items...
            gone = true;
            emitter.fire([uri]);
            data = service.getDecoration(uri, true);
            assert.strictEqual(data, undefined);
            data = service.getDecoration(uri2, true);
            assert.strictEqual(data, undefined);
            reg.dispose();
        });
        test('Folder decorations don\'t go away when file with problems is deleted #61919 (part2)', function () {
            return (0, timeTravelScheduler_1.runWithFakedTimers)({}, async function () {
                const emitter = new event_1.Emitter();
                let gone = false;
                const reg = service.registerDecorationsProvider({
                    label: 'Test',
                    onDidChange: emitter.event,
                    provideDecorations(uri) {
                        if (!gone && uri.path.match(/file.ts$/)) {
                            return { tooltip: 'FOO', weight: 17, bubble: true };
                        }
                        return undefined;
                    }
                });
                const uri = uri_1.URI.parse('foo:/folder/file.ts');
                const uri2 = uri_1.URI.parse('foo:/folder/');
                let data = service.getDecoration(uri, true);
                assert.strictEqual(data.tooltip, 'FOO');
                data = service.getDecoration(uri2, true);
                assert.ok(data.tooltip); // emphazied items...
                return new Promise((resolve, reject) => {
                    const l = service.onDidChangeDecorations(e => {
                        l.dispose();
                        try {
                            assert.ok(e.affectsResource(uri));
                            assert.ok(e.affectsResource(uri2));
                            resolve();
                            reg.dispose();
                        }
                        catch (err) {
                            reject(err);
                            reg.dispose();
                        }
                    });
                    gone = true;
                    emitter.fire([uri]);
                });
            });
        });
        test('FileDecorationProvider intermittently fails #133210', async function () {
            const invokeOrder = [];
            store.add(service.registerDecorationsProvider(new class {
                constructor() {
                    this.label = 'Provider-1';
                    this.onDidChange = event_1.Event.None;
                }
                provideDecorations() {
                    invokeOrder.push(this.label);
                    return undefined;
                }
            }));
            store.add(service.registerDecorationsProvider(new class {
                constructor() {
                    this.label = 'Provider-2';
                    this.onDidChange = event_1.Event.None;
                }
                provideDecorations() {
                    invokeOrder.push(this.label);
                    return undefined;
                }
            }));
            service.getDecoration(uri_1.URI.parse('test://me/path'), false);
            assert.deepStrictEqual(invokeOrder, ['Provider-2', 'Provider-1']);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVjb3JhdGlvbnNTZXJ2aWNlLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvZGVjb3JhdGlvbnMvdGVzdC9icm93c2VyL2RlY29yYXRpb25zU2VydmljZS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBZWhHLEtBQUssQ0FBQyxvQkFBb0IsRUFBRTtRQUUzQixJQUFJLE9BQTJCLENBQUM7UUFFaEMsS0FBSyxDQUFDO1lBQ0wsT0FBTyxHQUFHLElBQUksdUNBQWtCLENBQy9CLElBQUksS0FBTSxTQUFRLElBQUEsV0FBSSxHQUF1QjtnQkFBekM7O29CQUNNLFdBQU0sR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDO2dCQUNwQyxDQUFDO2FBQUEsRUFDRCxJQUFJLG1DQUFnQixFQUFFLENBQ3RCLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQztZQUNSLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNuQixDQUFDLENBQUMsQ0FBQztRQUVILE1BQU0sS0FBSyxHQUFHLElBQUEsK0NBQXVDLEdBQUUsQ0FBQztRQUd4RCxJQUFJLENBQUMsc0NBQXNDLEVBQUU7WUFFNUMsT0FBTyxJQUFBLHdDQUFrQixFQUFDLEVBQUUsRUFBRSxLQUFLO2dCQUVsQyxNQUFNLEdBQUcsR0FBRyxTQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUNqQyxJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUM7Z0JBRXBCLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQywyQkFBMkIsQ0FBQyxJQUFJO29CQUFBO3dCQUMxQyxVQUFLLEdBQVcsTUFBTSxDQUFDO3dCQUN2QixnQkFBVyxHQUEwQixhQUFLLENBQUMsSUFBSSxDQUFDO29CQVcxRCxDQUFDO29CQVZBLGtCQUFrQixDQUFDLEdBQVE7d0JBQzFCLFdB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