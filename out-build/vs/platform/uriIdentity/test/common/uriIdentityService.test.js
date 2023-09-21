/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/uriIdentity/common/uriIdentityService", "vs/base/test/common/mock", "vs/base/common/uri", "vs/base/common/event", "vs/base/test/common/utils"], function (require, exports, assert, uriIdentityService_1, mock_1, uri_1, event_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('URI Identity', function () {
        class FakeFileService extends (0, mock_1.$rT)() {
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
            _service = new uriIdentityService_1.$pr(new FakeFileService(new Map([
                ['bar', 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */],
                ['foo', 0 /* FileSystemProviderCapabilities.None */]
            ])));
        });
        teardown(function () {
            _service.dispose();
        });
        (0, utils_1.$bT)();
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
//# sourceMappingURL=uriIdentityService.test.js.map