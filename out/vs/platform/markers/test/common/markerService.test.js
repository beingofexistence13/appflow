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
            const service = new markerService.MarkerService();
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
            const service = new markerService.MarkerService();
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
            const service = new markerService.MarkerService();
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
            const service = new markerService.MarkerService();
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
            const service = new markerService.MarkerService();
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
            const service = new markerService.MarkerService();
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
            const service = new markerService.MarkerService();
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
            const service = new markerService.MarkerService();
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
            const service = new markerService.MarkerService();
            service.changeOne('far', uri_1.URI.parse('some:thing'), [data]);
            const marker = service.read({ resource: uri_1.URI.parse('some:thing') });
            assert.strictEqual(marker.length, 1);
            assert.strictEqual(marker[0].code, '0');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2VyU2VydmljZS50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vbWFya2Vycy90ZXN0L2NvbW1vbi9tYXJrZXJTZXJ2aWNlLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFPaEcsU0FBUyxnQkFBZ0IsQ0FBQyxRQUFRLEdBQUcsd0JBQWMsQ0FBQyxLQUFLO1FBQ3hELE9BQU87WUFDTixRQUFRO1lBQ1IsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1lBQ25DLGVBQWUsRUFBRSxDQUFDO1lBQ2xCLFdBQVcsRUFBRSxDQUFDO1lBQ2QsYUFBYSxFQUFFLENBQUM7WUFDaEIsU0FBUyxFQUFFLENBQUM7U0FDWixDQUFDO0lBQ0gsQ0FBQztJQUVELEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLEVBQUU7UUFFNUIsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7WUFFbEIsTUFBTSxPQUFPLEdBQUcsSUFBSSxhQUFhLENBQUMsYUFBYSxFQUFFLENBQUM7WUFFbEQsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFDekIsUUFBUSxFQUFFLFNBQUcsQ0FBQyxLQUFLLENBQUMsd0JBQXdCLENBQUM7b0JBQzdDLE1BQU0sRUFBRSxnQkFBZ0IsQ0FBQyx3QkFBYyxDQUFDLEtBQUssQ0FBQztpQkFDOUMsQ0FBQyxDQUFDLENBQUM7WUFFSixNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0MsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lB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SUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzdELE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3RCxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFN0MsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsU0FBRyxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ2hFLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3RCxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRTdDLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzdCLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3RCxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFB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