/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/async", "vs/base/common/uri", "vs/base/test/common/timeTravelScheduler", "vs/base/test/common/utils", "vs/platform/markers/common/markerService", "vs/workbench/api/browser/mainThreadDiagnostics", "vs/workbench/test/common/workbenchTestServices"], function (require, exports, assert, async_1, uri_1, timeTravelScheduler_1, utils_1, markerService_1, mainThreadDiagnostics_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('MainThreadDiagnostics', function () {
        let markerService;
        setup(function () {
            markerService = new markerService_1.MarkerService();
        });
        teardown(function () {
            markerService.dispose();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('clear markers on dispose', function () {
            const diag = new mainThreadDiagnostics_1.MainThreadDiagnostics(new class {
                constructor() {
                    this.remoteAuthority = '';
                    this.extensionHostKind = 1 /* ExtensionHostKind.LocalProcess */;
                }
                dispose() { }
                assertRegistered() { }
                set(v) { return null; }
                getProxy() {
                    return {
                        $acceptMarkersChange() { }
                    };
                }
                drain() { return null; }
            }, markerService, new class extends (0, workbenchTestServices_1.mock)() {
                asCanonicalUri(uri) { return uri; }
            });
            diag.$changeMany('foo', [[uri_1.URI.file('a'), [{
                            code: '666',
                            startLineNumber: 1,
                            startColumn: 1,
                            endLineNumber: 1,
                            endColumn: 1,
                            message: 'fffff',
                            severity: 1,
                            source: 'me'
                        }]]]);
            assert.strictEqual(markerService.read().length, 1);
            diag.dispose();
            assert.strictEqual(markerService.read().length, 0);
        });
        test('OnDidChangeDiagnostics triggers twice on same diagnostics #136434', function () {
            return (0, timeTravelScheduler_1.runWithFakedTimers)({}, async () => {
                const changedData = [];
                const diag = new mainThreadDiagnostics_1.MainThreadDiagnostics(new class {
                    constructor() {
                        this.remoteAuthority = '';
                        this.extensionHostKind = 1 /* ExtensionHostKind.LocalProcess */;
                    }
                    dispose() { }
                    assertRegistered() { }
                    set(v) { return null; }
                    getProxy() {
                        return {
                            $acceptMarkersChange(data) {
                                changedData.push(data);
                            }
                        };
                    }
                    drain() { return null; }
                }, markerService, new class extends (0, workbenchTestServices_1.mock)() {
                    asCanonicalUri(uri) { return uri; }
                });
                const markerDataStub = {
                    code: '666',
                    startLineNumber: 1,
                    startColumn: 1,
                    endLineNumber: 1,
                    endColumn: 1,
                    severity: 1,
                    source: 'me'
                };
                const target = uri_1.URI.file('a');
                diag.$changeMany('foo', [[target, [{ ...markerDataStub, message: 'same_owner' }]]]);
                markerService.changeOne('bar', target, [{ ...markerDataStub, message: 'forgein_owner' }]);
                // added one marker via the API and one via the ext host. the latter must not
                // trigger an event to the extension host
                await (0, async_1.timeout)(0);
                assert.strictEqual(markerService.read().length, 2);
                assert.strictEqual(changedData.length, 1);
                assert.strictEqual(changedData[0].length, 1);
                assert.strictEqual(changedData[0][0][1][0].message, 'forgein_owner');
                diag.dispose();
            });
        });
        test('onDidChangeDiagnostics different behavior when "extensionKind" ui running on remote workspace #136955', function () {
            return (0, timeTravelScheduler_1.runWithFakedTimers)({}, async () => {
                const markerData = {
                    code: '666',
                    startLineNumber: 1,
                    startColumn: 1,
                    endLineNumber: 1,
                    endColumn: 1,
                    severity: 1,
                    source: 'me',
                    message: 'message'
                };
                const target = uri_1.URI.file('a');
                markerService.changeOne('bar', target, [markerData]);
                const changedData = [];
                const diag = new mainThreadDiagnostics_1.MainThreadDiagnostics(new class {
                    constructor() {
                        this.remoteAuthority = '';
                        this.extensionHostKind = 1 /* ExtensionHostKind.LocalProcess */;
                    }
                    dispose() { }
                    assertRegistered() { }
                    set(v) { return null; }
                    getProxy() {
                        return {
                            $acceptMarkersChange(data) {
                                changedData.push(data);
                            }
                        };
                    }
                    drain() { return null; }
                }, markerService, new class extends (0, workbenchTestServices_1.mock)() {
                    asCanonicalUri(uri) { return uri; }
                });
                diag.$clear('bar');
                await (0, async_1.timeout)(0);
                assert.strictEqual(markerService.read().length, 0);
                assert.strictEqual(changedData.length, 1);
                diag.dispose();
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZERpYWdub3N0aWNzLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL3Rlc3QvYnJvd3Nlci9tYWluVGhyZWFkRGlhZ25vc3RpY3MudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQWdCaEcsS0FBSyxDQUFDLHVCQUF1QixFQUFFO1FBRTlCLElBQUksYUFBNEIsQ0FBQztRQUVqQyxLQUFLLENBQUM7WUFDTCxhQUFhLEdBQUcsSUFBSSw2QkFBYSxFQUFFLENBQUM7UUFDckMsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUM7WUFDUixhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDekIsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFMUMsSUFBSSxDQUFDLDBCQUEwQixFQUFFO1lBRWhDLE1BQU0sSUFBSSxHQUFHLElBQUksNkNBQXFCLENBQ3JDLElBQUk7Z0JBQUE7b0JBQ0gsb0JBQWUsR0FBRyxFQUFFLENBQUM7b0JBQ3JCLHNCQUFpQiwwQ0FBa0M7Z0JBVXBELENBQUM7Z0JBVEEsT0FBTyxLQUFLLENBQUM7Z0JBQ2IsZ0JBQWdCLEtBQUssQ0FBQztnQkFDdEIsR0FBRyxDQUFDLENBQU0sSUFBUyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ2pDLFFBQVE7b0JBQ1AsT0FBTzt3QkFDTixvQkFBb0IsS0FBSyxDQUFDO3FCQUMxQixDQUFDO2dCQUNILENBQUM7Z0JBQ0QsS0FBSyxLQUFVLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQzthQUM3QixFQUNELGFBQWEsRUFDYixJQUFJLEtBQU0sU0FBUSxJQUFBLDRCQUFJLEdBQXVCO2dCQUNuQyxjQUFjLENBQUMsR0FBUSxJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQzthQUNqRCxDQUNELENBQUM7WUFFRixJ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