/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/uri"], function (require, exports, assert, network_1, platform_1, resources_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('network', () => {
        (platform_1.isWeb ? test.skip : test)('FileAccess: URI (native)', () => {
            // asCodeUri() & asFileUri(): simple, without authority
            let originalFileUri = uri_1.URI.file('network.test.ts');
            let browserUri = network_1.FileAccess.uriToBrowserUri(originalFileUri);
            assert.ok(browserUri.authority.length > 0);
            let fileUri = network_1.FileAccess.uriToFileUri(browserUri);
            assert.strictEqual(fileUri.authority.length, 0);
            assert((0, resources_1.isEqual)(originalFileUri, fileUri));
            // asCodeUri() & asFileUri(): with authority
            originalFileUri = uri_1.URI.file('network.test.ts').with({ authority: 'test-authority' });
            browserUri = network_1.FileAccess.uriToBrowserUri(originalFileUri);
            assert.strictEqual(browserUri.authority, originalFileUri.authority);
            fileUri = network_1.FileAccess.uriToFileUri(browserUri);
            assert((0, resources_1.isEqual)(originalFileUri, fileUri));
        });
        (platform_1.isWeb ? test.skip : test)('FileAccess: moduleId (native)', () => {
            const browserUri = network_1.FileAccess.asBrowserUri('vs/base/test/node/network.test');
            assert.strictEqual(browserUri.scheme, network_1.Schemas.vscodeFileResource);
            const fileUri = network_1.FileAccess.asFileUri('vs/base/test/node/network.test');
            assert.strictEqual(fileUri.scheme, network_1.Schemas.file);
        });
        (platform_1.isWeb ? test.skip : test)('FileAccess: query and fragment is dropped (native)', () => {
            const originalFileUri = uri_1.URI.file('network.test.ts').with({ query: 'foo=bar', fragment: 'something' });
            const browserUri = network_1.FileAccess.uriToBrowserUri(originalFileUri);
            assert.strictEqual(browserUri.query, '');
            assert.strictEqual(browserUri.fragment, '');
        });
        (platform_1.isWeb ? test.skip : test)('FileAccess: query and fragment is kept if URI is already of same scheme (native)', () => {
            const originalFileUri = uri_1.URI.file('network.test.ts').with({ query: 'foo=bar', fragment: 'something' });
            const browserUri = network_1.FileAccess.uriToBrowserUri(originalFileUri.with({ scheme: network_1.Schemas.vscodeFileResource }));
            assert.strictEqual(browserUri.query, 'foo=bar');
            assert.strictEqual(browserUri.fragment, 'something');
            const fileUri = network_1.FileAccess.uriToFileUri(originalFileUri);
            assert.strictEqual(fileUri.query, 'foo=bar');
            assert.strictEqual(fileUri.fragment, 'something');
        });
        (platform_1.isWeb ? test.skip : test)('FileAccess: web', () => {
            const originalHttpsUri = uri_1.URI.file('network.test.ts').with({ scheme: 'https' });
            const browserUri = network_1.FileAccess.uriToBrowserUri(originalHttpsUri);
            assert.strictEqual(originalHttpsUri.toString(), browserUri.toString());
        });
        test('FileAccess: remote URIs', () => {
            const originalRemoteUri = uri_1.URI.file('network.test.ts').with({ scheme: network_1.Schemas.vscodeRemote });
            const browserUri = network_1.FileAccess.uriToBrowserUri(originalRemoteUri);
            assert.notStrictEqual(originalRemoteUri.scheme, browserUri.scheme);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV0d29yay50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS90ZXN0L2NvbW1vbi9uZXR3b3JrLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFRaEcsS0FBSyxDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUU7UUFFckIsQ0FBQyxnQkFBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQywwQkFBMEIsRUFBRSxHQUFHLEVBQUU7WUFFM0QsdURBQXVEO1lBQ3ZELElBQUksZUFBZSxHQUFHLFNBQUcsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUNsRCxJQUFJLFVBQVUsR0FBRyxvQkFBVSxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUM3RCxNQUFNLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzNDLElBQUksT0FBTyxHQUFHLG9CQUFVLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ2xELE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDaEQsTUFBTSxDQUFDLElBQUEsbUJBQU8sRUFBQyxlQUFlLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUUxQyw0Q0FBNEM7WUFDNUMsZUFBZSxHQUFHLFNBQUcsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxTQUFTLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO1lBQ3BGLFVBQVUsR0FBRyxvQkFBVSxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUN6RCxNQUFNLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxT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