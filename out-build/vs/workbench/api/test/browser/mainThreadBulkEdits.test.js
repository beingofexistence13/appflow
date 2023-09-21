/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/mock", "vs/base/common/event", "vs/base/common/uri", "vs/workbench/api/browser/mainThreadBulkEdits", "vs/platform/uriIdentity/common/uriIdentityService", "vs/base/test/common/utils"], function (require, exports, assert, mock_1, event_1, uri_1, mainThreadBulkEdits_1, uriIdentityService_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('MainThreadBulkEdits', function () {
        (0, utils_1.$bT)();
        test('"Rename failed to apply edits" in monorepo with pnpm #158845', function () {
            const fileService = new class extends (0, mock_1.$rT)() {
                constructor() {
                    super(...arguments);
                    this.onDidChangeFileSystemProviderCapabilities = event_1.Event.None;
                    this.onDidChangeFileSystemProviderRegistrations = event_1.Event.None;
                }
                hasProvider(uri) {
                    return true;
                }
                hasCapability(resource, capability) {
                    // if (resource.scheme === 'case' && capability === FileSystemProviderCapabilities.PathCaseSensitive) {
                    // 	return false;
                    // }
                    // NO capabilities, esp not being case-sensitive
                    return false;
                }
            };
            const uriIdentityService = new uriIdentityService_1.$pr(fileService);
            const edits = [
                { resource: uri_1.URI.from({ scheme: 'case', path: '/hello/WORLD/foo.txt' }), textEdit: { range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 }, text: 'sss' }, versionId: undefined },
                { resource: uri_1.URI.from({ scheme: 'case', path: '/heLLO/world/fOO.txt' }), textEdit: { range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 }, text: 'sss' }, versionId: undefined },
                { resource: uri_1.URI.from({ scheme: 'case', path: '/other/path.txt' }), textEdit: { range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 }, text: 'sss' }, versionId: undefined },
                { resource: uri_1.URI.from({ scheme: 'foo', path: '/other/path.txt' }), textEdit: { range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 }, text: 'sss' }, versionId: undefined },
            ];
            const out = (0, mainThreadBulkEdits_1.$6bb)({ edits }, uriIdentityService);
            assert.strictEqual(out.edits[0].resource.path, '/hello/WORLD/foo.txt');
            assert.strictEqual(out.edits[1].resource.path, '/hello/WORLD/foo.txt'); // the FIRST occurrence defined the shape!
            assert.strictEqual(out.edits[2].resource.path, '/other/path.txt');
            assert.strictEqual(out.edits[3].resource.path, '/other/path.txt');
            uriIdentityService.dispose();
        });
    });
});
//# sourceMappingURL=mainThreadBulkEdits.test.js.map