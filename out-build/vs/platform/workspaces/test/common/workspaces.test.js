/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/platform/workspace/common/workspace"], function (require, exports, assert, uri_1, workspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Workspaces', () => {
        test('reviveIdentifier', () => {
            const serializedWorkspaceIdentifier = { id: 'id', configPath: uri_1.URI.file('foo').toJSON() };
            assert.strictEqual((0, workspace_1.$Qh)((0, workspace_1.$Rh)(serializedWorkspaceIdentifier)), true);
            const serializedSingleFolderWorkspaceIdentifier = { id: 'id', uri: uri_1.URI.file('foo').toJSON() };
            assert.strictEqual((0, workspace_1.$Lh)((0, workspace_1.$Rh)(serializedSingleFolderWorkspaceIdentifier)), true);
            const serializedEmptyWorkspaceIdentifier = { id: 'id' };
            assert.strictEqual((0, workspace_1.$Rh)(serializedEmptyWorkspaceIdentifier).id, serializedEmptyWorkspaceIdentifier.id);
            assert.strictEqual((0, workspace_1.$Qh)(serializedEmptyWorkspaceIdentifier), false);
            assert.strictEqual((0, workspace_1.$Lh)(serializedEmptyWorkspaceIdentifier), false);
            assert.strictEqual((0, workspace_1.$Rh)(undefined), undefined);
        });
        test('hasWorkspaceFileExtension', () => {
            assert.strictEqual((0, workspace_1.$7h)('something'), false);
            assert.strictEqual((0, workspace_1.$7h)('something.code-workspace'), true);
        });
        test('toWorkspaceIdentifier', () => {
            let identifier = (0, workspace_1.$Ph)({ id: 'id', folders: [] });
            assert.ok(identifier);
            assert.ok((0, workspace_1.$Mh)(identifier));
            assert.ok(!(0, workspace_1.$Qh)(identifier));
            assert.ok(!(0, workspace_1.$Qh)(identifier));
            identifier = (0, workspace_1.$Ph)({ id: 'id', folders: [{ index: 0, name: 'test', toResource: () => uri_1.URI.file('test'), uri: uri_1.URI.file('test') }] });
            assert.ok(identifier);
            assert.ok((0, workspace_1.$Lh)(identifier));
            assert.ok(!(0, workspace_1.$Qh)(identifier));
            identifier = (0, workspace_1.$Ph)({ id: 'id', configuration: uri_1.URI.file('test.code-workspace'), folders: [] });
            assert.ok(identifier);
            assert.ok(!(0, workspace_1.$Lh)(identifier));
            assert.ok((0, workspace_1.$Qh)(identifier));
        });
    });
});
//# sourceMappingURL=workspaces.test.js.map