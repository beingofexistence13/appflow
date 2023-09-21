/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/platform/markers/common/markers", "vs/platform/markers/common/markerService"], function (require, exports, assert, uri_1, markers_1, markerService) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function randomMarkerData(severity = markers_1.MarkerSeverity.Error) {
        return {
            severity,
            message: Math.random().toString(16),
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: 1,
            endColumn: 1
        };
    }
    suite('Marker Service', () => {
        test('query', () => {
            const service = new markerService.$MBb();
            service.changeAll('far', [{
                    resource: uri_1.URI.parse('file:///c/test/file.cs'),
                    marker: randomMarkerData(markers_1.MarkerSeverity.Error)
                }]);
            assert.strictEqual(service.read().length, 1);
            assert.strictEqual(service.read({ owner: 'far' }).length, 1);
            assert.strictEqual(service.read({ resource: uri_1.URI.parse('file:///c/test/file.cs') }).length, 1);
            assert.strictEqual(service.read({ owner: 'far', resource: uri_1.URI.parse('file:///c/test/file.cs') }).length, 1);
            service.changeAll('boo', [{
                    resource: uri_1.URI.parse('file:///c/test/file.cs'),
                    marker: randomMarkerData(markers_1.MarkerSeverity.Warning)
                }]);
            assert.strictEqual(service.read().length, 2);
            assert.strictEqual(service.read({ owner: 'far' }).length, 1);
            assert.strictEqual(service.read({ owner: 'boo' }).length, 1);
            assert.strictEqual(service.read({ severities: markers_1.MarkerSeverity.Error }).length, 1);
            assert.strictEqual(service.read({ severities: markers_1.MarkerSeverity.Warning }).length, 1);
            assert.strictEqual(service.read({ severities: markers_1.MarkerSeverity.Hint }).length, 0);
            assert.strictEqual(service.read({ severities: markers_1.MarkerSeverity.Error | markers_1.MarkerSeverity.Warning }).length, 2);
        });
        test('changeOne override', () => {
            const service = new markerService.$MBb();
            service.changeOne('far', uri_1.URI.parse('file:///path/only.cs'), [randomMarkerData()]);
            assert.strictEqual(service.read().length, 1);
            assert.strictEqual(service.read({ owner: 'far' }).length, 1);
            service.changeOne('boo', uri_1.URI.parse('file:///path/only.cs'), [randomMarkerData()]);
            assert.strictEqual(service.read().length, 2);
            assert.strictEqual(service.read({ owner: 'far' }).length, 1);
            assert.strictEqual(service.read({ owner: 'boo' }).length, 1);
            service.changeOne('far', uri_1.URI.parse('file:///path/only.cs'), [randomMarkerData(), randomMarkerData()]);
            assert.strictEqual(service.read({ owner: 'far' }).length, 2);
            assert.strictEqual(service.read({ owner: 'boo' }).length, 1);
        });
        test('changeOne/All clears', () => {
            const service = new markerService.$MBb();
            service.changeOne('far', uri_1.URI.parse('file:///path/only.cs'), [randomMarkerData()]);
            service.changeOne('boo', uri_1.URI.parse('file:///path/only.cs'), [randomMarkerData()]);
            assert.strictEqual(service.read({ owner: 'far' }).length, 1);
            assert.strictEqual(service.read({ owner: 'boo' }).length, 1);
            assert.strictEqual(service.read().length, 2);
            service.changeOne('far', uri_1.URI.parse('file:///path/only.cs'), []);
            assert.strictEqual(service.read({ owner: 'far' }).length, 0);
            assert.strictEqual(service.read({ owner: 'boo' }).length, 1);
            assert.strictEqual(service.read().length, 1);
            service.changeAll('boo', []);
            assert.strictEqual(service.read({ owner: 'far' }).length, 0);
            assert.strictEqual(service.read({ owner: 'boo' }).length, 0);
            assert.strictEqual(service.read().length, 0);
        });
        test('changeAll sends event for cleared', () => {
            const service = new markerService.$MBb();
            service.changeAll('far', [{
                    resource: uri_1.URI.parse('file:///d/path'),
                    marker: randomMarkerData()
                }, {
                    resource: uri_1.URI.parse('file:///d/path'),
                    marker: randomMarkerData()
                }]);
            assert.strictEqual(service.read({ owner: 'far' }).length, 2);
            service.onMarkerChanged(changedResources => {
                assert.strictEqual(changedResources.length, 1);
                changedResources.forEach(u => assert.strictEqual(u.toString(), 'file:///d/path'));
                assert.strictEqual(service.read({ owner: 'far' }).length, 0);
            });
            service.changeAll('far', []);
        });
        test('changeAll merges', () => {
            const service = new markerService.$MBb();
            service.changeAll('far', [{
                    resource: uri_1.URI.parse('file:///c/test/file.cs'),
                    marker: randomMarkerData()
                }, {
                    resource: uri_1.URI.parse('file:///c/test/file.cs'),
                    marker: randomMarkerData()
                }]);
            assert.strictEqual(service.read({ owner: 'far' }).length, 2);
        });
        test('changeAll must not break integrety, issue #12635', () => {
            const service = new markerService.$MBb();
            service.changeAll('far', [{
                    resource: uri_1.URI.parse('scheme:path1'),
                    marker: randomMarkerData()
                }, {
                    resource: uri_1.URI.parse('scheme:path2'),
                    marker: randomMarkerData()
                }]);
            service.changeAll('boo', [{
                    resource: uri_1.URI.parse('scheme:path1'),
                    marker: randomMarkerData()
                }]);
            service.changeAll('far', [{
                    resource: uri_1.URI.parse('scheme:path1'),
                    marker: randomMarkerData()
                }, {
                    resource: uri_1.URI.parse('scheme:path2'),
                    marker: randomMarkerData()
                }]);
            assert.strictEqual(service.read({ owner: 'far' }).length, 2);
            assert.strictEqual(service.read({ resource: uri_1.URI.parse('scheme:path1') }).length, 2);
        });
        test('invalid marker data', () => {
            const data = randomMarkerData();
            const service = new markerService.$MBb();
            data.message = undefined;
            service.changeOne('far', uri_1.URI.parse('some:uri/path'), [data]);
            assert.strictEqual(service.read({ owner: 'far' }).length, 0);
            data.message = null;
            service.changeOne('far', uri_1.URI.parse('some:uri/path'), [data]);
            assert.strictEqual(service.read({ owner: 'far' }).length, 0);
            data.message = 'null';
            service.changeOne('far', uri_1.URI.parse('some:uri/path'), [data]);
            assert.strictEqual(service.read({ owner: 'far' }).length, 1);
        });
        test('MapMap#remove returns bad values, https://github.com/microsoft/vscode/issues/13548', () => {
            const service = new markerService.$MBb();
            service.changeOne('o', uri_1.URI.parse('some:uri/1'), [randomMarkerData()]);
            service.changeOne('o', uri_1.URI.parse('some:uri/2'), []);
        });
        test('Error code of zero in markers get removed, #31275', function () {
            const data = {
                code: '0',
                startLineNumber: 1,
                startColumn: 2,
                endLineNumber: 1,
                endColumn: 5,
                message: 'test',
                severity: 0,
                source: 'me'
            };
            const service = new markerService.$MBb();
            service.changeOne('far', uri_1.URI.parse('some:thing'), [data]);
            const marker = service.read({ resource: uri_1.URI.parse('some:thing') });
            assert.strictEqual(marker.length, 1);
            assert.strictEqual(marker[0].code, '0');
        });
    });
});
//# sourceMappingURL=markerService.test.js.map