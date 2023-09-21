/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/platform/workspace/common/workspace", "vs/workbench/browser/parts/editor/breadcrumbsModel", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/files/common/files", "vs/workbench/test/common/workbenchTestServices", "vs/platform/workspace/test/common/testWorkspace", "vs/base/test/common/mock", "vs/base/test/common/utils"], function (require, exports, assert, uri_1, workspace_1, breadcrumbsModel_1, testConfigurationService_1, files_1, workbenchTestServices_1, testWorkspace_1, mock_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Breadcrumb Model', function () {
        let model;
        const workspaceService = new workbenchTestServices_1.$6dc(new testWorkspace_1.$00b('ffff', [new workspace_1.$Vh({ uri: uri_1.URI.parse('foo:/bar/baz/ws'), name: 'ws', index: 0 })]));
        const configService = new class extends testConfigurationService_1.$G0b {
            getValue(...args) {
                if (args[0] === 'breadcrumbs.filePath') {
                    return 'on';
                }
                if (args[0] === 'breadcrumbs.symbolPath') {
                    return 'on';
                }
                return super.getValue(...args);
            }
            updateValue() {
                return Promise.resolve();
            }
        };
        teardown(function () {
            model.dispose();
        });
        (0, utils_1.$bT)();
        test('only uri, inside workspace', function () {
            model = new breadcrumbsModel_1.$Exb(uri_1.URI.parse('foo:/bar/baz/ws/some/path/file.ts'), undefined, configService, workspaceService, new class extends (0, mock_1.$rT)() {
            });
            const elements = model.getElements();
            assert.strictEqual(elements.length, 3);
            const [one, two, three] = elements;
            assert.strictEqual(one.kind, files_1.FileKind.FOLDER);
            assert.strictEqual(two.kind, files_1.FileKind.FOLDER);
            assert.strictEqual(three.kind, files_1.FileKind.FILE);
            assert.strictEqual(one.uri.toString(), 'foo:/bar/baz/ws/some');
            assert.strictEqual(two.uri.toString(), 'foo:/bar/baz/ws/some/path');
            assert.strictEqual(three.uri.toString(), 'foo:/bar/baz/ws/some/path/file.ts');
        });
        test('display uri matters for FileElement', function () {
            model = new breadcrumbsModel_1.$Exb(uri_1.URI.parse('foo:/bar/baz/ws/some/PATH/file.ts'), undefined, configService, workspaceService, new class extends (0, mock_1.$rT)() {
            });
            const elements = model.getElements();
            assert.strictEqual(elements.length, 3);
            const [one, two, three] = elements;
            assert.strictEqual(one.kind, files_1.FileKind.FOLDER);
            assert.strictEqual(two.kind, files_1.FileKind.FOLDER);
            assert.strictEqual(three.kind, files_1.FileKind.FILE);
            assert.strictEqual(one.uri.toString(), 'foo:/bar/baz/ws/some');
            assert.strictEqual(two.uri.toString(), 'foo:/bar/baz/ws/some/PATH');
            assert.strictEqual(three.uri.toString(), 'foo:/bar/baz/ws/some/PATH/file.ts');
        });
        test('only uri, outside workspace', function () {
            model = new breadcrumbsModel_1.$Exb(uri_1.URI.parse('foo:/outside/file.ts'), undefined, configService, workspaceService, new class extends (0, mock_1.$rT)() {
            });
            const elements = model.getElements();
            assert.strictEqual(elements.length, 2);
            const [one, two] = elements;
            assert.strictEqual(one.kind, files_1.FileKind.FOLDER);
            assert.strictEqual(two.kind, files_1.FileKind.FILE);
            assert.strictEqual(one.uri.toString(), 'foo:/outside');
            assert.strictEqual(two.uri.toString(), 'foo:/outside/file.ts');
        });
    });
});
//# sourceMappingURL=breadcrumbModel.test.js.map