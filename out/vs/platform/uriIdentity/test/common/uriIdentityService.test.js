/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/uriIdentity/common/uriIdentityService", "vs/base/test/common/mock", "vs/base/common/uri", "vs/base/common/event", "vs/base/test/common/utils"], function (require, exports, assert, uriIdentityService_1, mock_1, uri_1, event_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('URI Identity', function () {
        class FakeFileService extends (0, mock_1.mock)() {
            constructor(data) {
                super();
                this.data = data;
                this.onDidChangeFileSystemProviderCapabilities = event_1.Event.None;
                this.onDidChangeFileSystemProviderRegistrations = event_1.Event.None;
            }
            hasProvider(uri) {
                return this.data.has(uri.scheme);
            }
            hasCapability(uri, flag) {
                const mask = this.data.get(uri.scheme) ?? 0;
                return Boolean(mask & flag);
            }
        }
        let _service;
        setup(function () {
            _service = new uriIdentityService_1.UriIdentityService(new FakeFileService(new Map([
                ['bar', 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */],
                ['foo', 0 /* FileSystemProviderCapabilities.None */]
            ])));
        });
        teardown(function () {
            _service.dispose();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        function assertCanonical(input, expected, service = _service) {
            const actual = service.asCanonicalUri(input);
            assert.strictEqual(actual.toString(), expected.toString());
            assert.ok(service.extUri.isEqual(actual, expected));
        }
        test('extUri (isEqual)', function () {
            const a = uri_1.URI.parse('foo://bar/bang');
            const a1 = uri_1.URI.parse('foo://bar/BANG');
            const b = uri_1.URI.parse('bar://bar/bang');
            const b1 = uri_1.URI.parse('bar://bar/BANG');
            assert.strictEqual(_service.extUri.isEqual(a, a1), true);
            assert.strictEqual(_service.extUri.isEqual(a1, a), true);
            assert.strictEqual(_service.extUri.isEqual(b, b1), false);
            assert.strictEqual(_service.extUri.isEqual(b1, b), false);
        });
        test('asCanonicalUri (casing)', function () {
            const a = uri_1.URI.parse('foo://bar/bang');
            const a1 = uri_1.URI.parse('foo://bar/BANG');
            const b = uri_1.URI.parse('bar://bar/bang');
            const b1 = uri_1.URI.parse('bar://bar/BANG');
            assertCanonical(a, a);
            assertCanonical(a1, a);
            assertCanonical(b, b);
            assertCanonical(b1, b1); // case sensitive
        });
        test('asCanonicalUri (normalization)', function () {
            const a = uri_1.URI.parse('foo://bar/bang');
            assertCanonical(a, a);
            assertCanonical(uri_1.URI.parse('foo://bar/./bang'), a);
            assertCanonical(uri_1.URI.parse('foo://bar/./bang'), a);
            assertCanonical(uri_1.URI.parse('foo://bar/./foo/../bang'), a);
        });
        test('asCanonicalUri (keep fragement)', function () {
            const a = uri_1.URI.parse('foo://bar/bang');
            assertCanonical(a, a);
            assertCanonical(uri_1.URI.parse('foo://bar/./bang#frag'), a.with({ fragment: 'frag' }));
            assertCanonical(uri_1.URI.parse('foo://bar/./bang#frag'), a.with({ fragment: 'frag' }));
            assertCanonical(uri_1.URI.parse('foo://bar/./bang#frag'), a.with({ fragment: 'frag' }));
            assertCanonical(uri_1.URI.parse('foo://bar/./foo/../bang#frag'), a.with({ fragment: 'frag' }));
            const b = uri_1.URI.parse('foo://bar/bazz#frag');
            assertCanonical(b, b);
            assertCanonical(uri_1.URI.parse('foo://bar/bazz'), b.with({ fragment: '' }));
            assertCanonical(uri_1.URI.parse('foo://bar/BAZZ#DDD'), b.with({ fragment: 'DDD' })); // lower-case path, but fragment is kept
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJpSWRlbnRpdHlTZXJ2aWNlLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS91cmlJZGVudGl0eS90ZXN0L2NvbW1vbi91cmlJZGVudGl0eVNlcnZpY2UudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQVVoRyxLQUFLLENBQUMsY0FBYyxFQUFFO1FBRXJCLE1BQU0sZUFBZ0IsU0FBUSxJQUFBLFdBQUksR0FBZ0I7WUFLakQsWUFBcUIsSUFBaUQ7Z0JBQ3JFLEtBQUssRUFBRSxDQUFDO2dCQURZLFNBQUksR0FBSixJQUFJLENBQTZDO2dCQUg3RCw4Q0FBeUMsR0FBRyxhQUFLLENBQUMsSUFBSSxDQUFDO2dCQUN2RCwrQ0FBMEMsR0FBRyxhQUFLLENBQUMsSUFBSSxDQUFDO1lBSWpFLENBQUM7WUFDUSxXQUFXLENBQUMsR0FBUTtnQkFDNUIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbEMsQ0FBQztZQUNRLGFBQWEsQ0FBQyxHQUFRLEVBQUUsSUFBb0M7Z0JBQ3BFLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzVDLE9BQU8sT0FBTyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQztZQUM3QixDQUFDO1NBQ0Q7UUFFRCxJQUFJLFFBQTRCLENBQUM7UUFFakMsS0FBSyxDQUFDO1lBQ0wsUUFBUSxHQUFHLElBQUksdUNBQWtCLENBQUMsSUFBSSxlQUFlLENBQUMsSUFBSSxHQUFHLENBQUM7Z0JBQzdELENBQUMsS0FBSyw4REFBbUQ7Z0JBQ3pELENBQUMsS0FBSyw4Q0FBc0M7YUFDNUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNOLENBQUMsQ0FBQyxD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