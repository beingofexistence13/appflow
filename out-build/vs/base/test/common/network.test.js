/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/uri"], function (require, exports, assert, network_1, platform_1, resources_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('network', () => {
        (platform_1.$o ? test.skip : test)('FileAccess: URI (native)', () => {
            // asCodeUri() & asFileUri(): simple, without authority
            let originalFileUri = uri_1.URI.file('network.test.ts');
            let browserUri = network_1.$2f.uriToBrowserUri(originalFileUri);
            assert.ok(browserUri.authority.length > 0);
            let fileUri = network_1.$2f.uriToFileUri(browserUri);
            assert.strictEqual(fileUri.authority.length, 0);
            assert((0, resources_1.$bg)(originalFileUri, fileUri));
            // asCodeUri() & asFileUri(): with authority
            originalFileUri = uri_1.URI.file('network.test.ts').with({ authority: 'test-authority' });
            browserUri = network_1.$2f.uriToBrowserUri(originalFileUri);
            assert.strictEqual(browserUri.authority, originalFileUri.authority);
            fileUri = network_1.$2f.uriToFileUri(browserUri);
            assert((0, resources_1.$bg)(originalFileUri, fileUri));
        });
        (platform_1.$o ? test.skip : test)('FileAccess: moduleId (native)', () => {
            const browserUri = network_1.$2f.asBrowserUri('vs/base/test/node/network.test');
            assert.strictEqual(browserUri.scheme, network_1.Schemas.vscodeFileResource);
            const fileUri = network_1.$2f.asFileUri('vs/base/test/node/network.test');
            assert.strictEqual(fileUri.scheme, network_1.Schemas.file);
        });
        (platform_1.$o ? test.skip : test)('FileAccess: query and fragment is dropped (native)', () => {
            const originalFileUri = uri_1.URI.file('network.test.ts').with({ query: 'foo=bar', fragment: 'something' });
            const browserUri = network_1.$2f.uriToBrowserUri(originalFileUri);
            assert.strictEqual(browserUri.query, '');
            assert.strictEqual(browserUri.fragment, '');
        });
        (platform_1.$o ? test.skip : test)('FileAccess: query and fragment is kept if URI is already of same scheme (native)', () => {
            const originalFileUri = uri_1.URI.file('network.test.ts').with({ query: 'foo=bar', fragment: 'something' });
            const browserUri = network_1.$2f.uriToBrowserUri(originalFileUri.with({ scheme: network_1.Schemas.vscodeFileResource }));
            assert.strictEqual(browserUri.query, 'foo=bar');
            assert.strictEqual(browserUri.fragment, 'something');
            const fileUri = network_1.$2f.uriToFileUri(originalFileUri);
            assert.strictEqual(fileUri.query, 'foo=bar');
            assert.strictEqual(fileUri.fragment, 'something');
        });
        (platform_1.$o ? test.skip : test)('FileAccess: web', () => {
            const originalHttpsUri = uri_1.URI.file('network.test.ts').with({ scheme: 'https' });
            const browserUri = network_1.$2f.uriToBrowserUri(originalHttpsUri);
            assert.strictEqual(originalHttpsUri.toString(), browserUri.toString());
        });
        test('FileAccess: remote URIs', () => {
            const originalRemoteUri = uri_1.URI.file('network.test.ts').with({ scheme: network_1.Schemas.vscodeRemote });
            const browserUri = network_1.$2f.uriToBrowserUri(originalRemoteUri);
            assert.notStrictEqual(originalRemoteUri.scheme, browserUri.scheme);
        });
    });
});
//# sourceMappingURL=network.test.js.map