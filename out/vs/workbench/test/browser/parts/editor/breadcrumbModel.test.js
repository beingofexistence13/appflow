/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/platform/workspace/common/workspace", "vs/workbench/browser/parts/editor/breadcrumbsModel", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/files/common/files", "vs/workbench/test/common/workbenchTestServices", "vs/platform/workspace/test/common/testWorkspace", "vs/base/test/common/mock", "vs/base/test/common/utils"], function (require, exports, assert, uri_1, workspace_1, breadcrumbsModel_1, testConfigurationService_1, files_1, workbenchTestServices_1, testWorkspace_1, mock_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Breadcrumb Model', function () {
        let model;
        const workspaceService = new workbenchTestServices_1.TestContextService(new testWorkspace_1.Workspace('ffff', [new workspace_1.WorkspaceFolder({ uri: uri_1.URI.parse('foo:/bar/baz/ws'), name: 'ws', index: 0 })]));
        const configService = new class extends testConfigurationService_1.TestConfigurationService {
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
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('only uri, inside workspace', function () {
            model = new breadcrumbsModel_1.BreadcrumbsModel(uri_1.URI.parse('foo:/bar/baz/ws/some/path/file.ts'), undefined, configService, workspaceService, new class extends (0, mock_1.mock)() {
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
            model = new breadcrumbsModel_1.BreadcrumbsModel(uri_1.URI.parse('foo:/bar/baz/ws/some/PATH/file.ts'), undefined, configService, workspaceService, new class extends (0, mock_1.mock)() {
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
            model = new breadcrumbsModel_1.BreadcrumbsModel(uri_1.URI.parse('foo:/outside/file.ts'), undefined, configService, workspaceService, new class extends (0, mock_1.mock)() {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJlYWRjcnVtYk1vZGVsLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvdGVzdC9icm93c2VyL3BhcnRzL2VkaXRvci9icmVhZGNydW1iTW9kZWwudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQWNoRyxLQUFLLENBQUMsa0JBQWtCLEVBQUU7UUFFekIsSUFBSSxLQUF1QixDQUFDO1FBQzVCLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSwwQ0FBa0IsQ0FBQyxJQUFJLHlCQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSwyQkFBZSxDQUFDLEVBQUUsR0FBRyxFQUFFLFNBQUcsQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNKLE1BQU0sYUFBYSxHQUFHLElBQUksS0FBTSxTQUFRLG1EQUF3QjtZQUN0RCxRQUFRLENBQUMsR0FBRyxJQUFXO2dCQUMvQixJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxzQkFBc0IsRUFBRTtvQkFDdkMsT0FBTyxJQUFJLENBQUM7aUJBQ1o7Z0JBQ0QsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssd0JBQXdCLEVBQUU7b0JBQ3pDLE9BQU8sSUFBSSxDQUFDO2lCQUNaO2dCQUNELE9BQU8sS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1lBQ2hDLENBQUM7WUFDUSxXQUFXO2dCQUNuQixPQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUMxQixDQUFDO1NBQ0QsQ0FBQztRQUVGLFFBQVEsQ0FBQztZQUNSLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNqQixDQUFDLENBQUMsQ0FBQztRQUVILElBQUEsK0NBQXVDLEdB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QUFJLENBQUMsQ0FBQztZQUMzSixNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7WUFFckMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsUUFBeUIsQ0FBQztZQUM3QyxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsZ0JBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM5QyxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsZ0JBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM1QyxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDdkQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLHNCQUFzQixDQUFDLENBQUM7UUFDaEUsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQyJ9