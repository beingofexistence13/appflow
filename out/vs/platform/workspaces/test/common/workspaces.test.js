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
            assert.strictEqual((0, workspace_1.isWorkspaceIdentifier)((0, workspace_1.reviveIdentifier)(serializedWorkspaceIdentifier)), true);
            const serializedSingleFolderWorkspaceIdentifier = { id: 'id', uri: uri_1.URI.file('foo').toJSON() };
            assert.strictEqual((0, workspace_1.isSingleFolderWorkspaceIdentifier)((0, workspace_1.reviveIdentifier)(serializedSingleFolderWorkspaceIdentifier)), true);
            const serializedEmptyWorkspaceIdentifier = { id: 'id' };
            assert.strictEqual((0, workspace_1.reviveIdentifier)(serializedEmptyWorkspaceIdentifier).id, serializedEmptyWorkspaceIdentifier.id);
            assert.strictEqual((0, workspace_1.isWorkspaceIdentifier)(serializedEmptyWorkspaceIdentifier), false);
            assert.strictEqual((0, workspace_1.isSingleFolderWorkspaceIdentifier)(serializedEmptyWorkspaceIdentifier), false);
            assert.strictEqual((0, workspace_1.reviveIdentifier)(undefined), undefined);
        });
        test('hasWorkspaceFileExtension', () => {
            assert.strictEqual((0, workspace_1.hasWorkspaceFileExtension)('something'), false);
            assert.strictEqual((0, workspace_1.hasWorkspaceFileExtension)('something.code-workspace'), true);
        });
        test('toWorkspaceIdentifier', () => {
            let identifier = (0, workspace_1.toWorkspaceIdentifier)({ id: 'id', folders: [] });
            assert.ok(identifier);
            assert.ok((0, workspace_1.isEmptyWorkspaceIdentifier)(identifier));
            assert.ok(!(0, workspace_1.isWorkspaceIdentifier)(identifier));
            assert.ok(!(0, workspace_1.isWorkspaceIdentifier)(identifier));
            identifier = (0, workspace_1.toWorkspaceIdentifier)({ id: 'id', folders: [{ index: 0, name: 'test', toResource: () => uri_1.URI.file('test'), uri: uri_1.URI.file('test') }] });
            assert.ok(identifier);
            assert.ok((0, workspace_1.isSingleFolderWorkspaceIdentifier)(identifier));
            assert.ok(!(0, workspace_1.isWorkspaceIdentifier)(identifier));
            identifier = (0, workspace_1.toWorkspaceIdentifier)({ id: 'id', configuration: uri_1.URI.file('test.code-workspace'), folders: [] });
            assert.ok(identifier);
            assert.ok(!(0, workspace_1.isSingleFolderWorkspaceIdentifier)(identifier));
            assert.ok((0, workspace_1.isWorkspaceIdentifier)(identifier));
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlcy50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vd29ya3NwYWNlcy90ZXN0L2NvbW1vbi93b3Jrc3BhY2VzLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFNaEcsS0FBSyxDQUFDLFlBQVksRUFBRSxHQUFHLEVBQUU7UUFFeEIsSUFBSSxDQUFDLGtCQUFrQixFQUFFLEdBQUcsRUFBRTtZQUM3QixNQUFNLDZCQUE2QixHQUFtQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLFNBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQztZQUN6SCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsaUNBQXFCLEVBQUMsSUFBQSw0QkFBZ0IsRUFBQyw2QkFBNkIsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFakcsTUFBTSx5Q0FBeUMsR0FBK0MsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxTQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUM7WUFDMUksTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLDZDQUFpQyxFQUFDLElBQUEsNEJBQWdCLEVBQUMseUNBQXlDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRXpILE1BQU0sa0NBQWtDLEdBQThCLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDO1lBQ25GLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBQSw0QkFBZ0IsRUFBQyxrQ0FBa0MsQ0FBQyxDQUFDLEVBQUUsRUFBRSxrQ0FBa0MsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNuSCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsaUNBQXFCLEVBQUMsa0NBQWtDLENBQUMsRUFB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