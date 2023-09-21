/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/base/test/common/utils", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/contrib/files/common/explorerModel", "vs/workbench/contrib/files/browser/views/explorerView", "vs/platform/theme/common/colorRegistry", "vs/workbench/contrib/files/browser/views/explorerViewer", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/workbench/contrib/files/browser/views/explorerDecorationsProvider", "vs/platform/configuration/test/common/testConfigurationService", "vs/workbench/test/common/workbenchTestServices"], function (require, exports, assert, event_1, utils_1, workbenchTestServices_1, explorerModel_1, explorerView_1, colorRegistry_1, explorerViewer_1, dom, lifecycle_1, explorerDecorationsProvider_1, testConfigurationService_1, workbenchTestServices_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Files - ExplorerView', () => {
        const $ = dom.$;
        const fileService = new workbenchTestServices_1.TestFileService();
        const configService = new testConfigurationService_1.TestConfigurationService();
        function createStat(path, name, isFolder, hasChildren, size, mtime, isSymLink = false, isUnknown = false) {
            return new explorerModel_1.ExplorerItem(utils_1.toResource.call(this, path), fileService, configService, workbenchTestServices_2.NullFilesConfigurationService, undefined, isFolder, isSymLink, false, false, name, mtime, isUnknown);
        }
        test('getContext', async function () {
            const d = new Date().getTime();
            const s1 = createStat.call(this, '/', '/', true, false, 8096, d);
            const s2 = createStat.call(this, '/path', 'path', true, false, 8096, d);
            const s3 = createStat.call(this, '/path/to', 'to', true, false, 8096, d);
            const s4 = createStat.call(this, '/path/to/stat', 'stat', false, false, 8096, d);
            const noNavigationController = { getCompressedNavigationController: (stat) => undefined };
            assert.deepStrictEqual((0, explorerView_1.getContext)([s1], [s2, s3, s4], true, noNavigationController), [s2, s3, s4]);
            assert.deepStrictEqual((0, explorerView_1.getContext)([s1], [s1, s3, s4], true, noNavigationController), [s1, s3, s4]);
            assert.deepStrictEqual((0, explorerView_1.getContext)([s1], [s3, s1, s4], false, noNavigationController), [s1]);
            assert.deepStrictEqual((0, explorerView_1.getContext)([], [s3, s1, s4], false, noNavigationController), []);
            assert.deepStrictEqual((0, explorerView_1.getContext)([], [s3, s1, s4], true, noNavigationController), [s3, s1, s4]);
        });
        test('decoration provider', async function () {
            const d = new Date().getTime();
            const s1 = createStat.call(this, '/path', 'path', true, false, 8096, d);
            s1.error = new Error('A test error');
            const s2 = createStat.call(this, '/path/to', 'to', true, false, 8096, d, true);
            const s3 = createStat.call(this, '/path/to/stat', 'stat', false, false, 8096, d);
            assert.strictEqual((0, explorerDecorationsProvider_1.provideDecorations)(s3), undefined);
            assert.deepStrictEqual((0, explorerDecorationsProvider_1.provideDecorations)(s2), {
                tooltip: 'Symbolic Link',
                letter: '\u2937'
            });
            assert.deepStrictEqual((0, explorerDecorationsProvider_1.provideDecorations)(s1), {
                tooltip: 'Unable to resolve workspace folder (A test error)',
                letter: '!',
                color: colorRegistry_1.listInvalidItemForeground
            });
            const unknown = createStat.call(this, '/path/to/stat', 'stat', false, false, 8096, d, false, true);
            assert.deepStrictEqual((0, explorerDecorationsProvider_1.provideDecorations)(unknown), {
                tooltip: 'Unknown File Type',
                letter: '?'
            });
        });
        test('compressed navigation controller', async function () {
            const container = $('.file');
            const label = $('.label');
            const labelName1 = $('.label-name');
            const labelName2 = $('.label-name');
            const labelName3 = $('.label-name');
            const d = new Date().getTime();
            const s1 = createStat.call(this, '/path', 'path', true, false, 8096, d);
            const s2 = createStat.call(this, '/path/to', 'to', true, false, 8096, d);
            const s3 = createStat.call(this, '/path/to/stat', 'stat', false, false, 8096, d);
            dom.append(container, label);
            dom.append(label, labelName1);
            dom.append(label, labelName2);
            dom.append(label, labelName3);
            const emitter = new event_1.Emitter();
            const navigationController = new explorerViewer_1.CompressedNavigationController('id', [s1, s2, s3], {
                container,
                templateDisposables: new lifecycle_1.DisposableStore(),
                elementDisposables: new lifecycle_1.DisposableStore(),
                label: {
                    container: label,
                    onDidRender: emitter.event
                }
            }, 1, false);
            assert.strictEqual(navigationController.count, 3);
            assert.strictEqual(navigationController.index, 2);
            assert.strictEqual(navigationController.current, s3);
            navigationController.next();
            assert.strictEqual(navigationController.current, s3);
            navigationController.previous();
            assert.strictEqual(navigationController.current, s2);
            navigationController.previous();
            assert.strictEqual(navigationController.current, s1);
            navigationController.previous();
            assert.strictEqual(navigationController.current, s1);
            navigationController.last();
            assert.strictEqual(navigationController.current, s3);
            navigationController.first();
            assert.strictEqual(navigationController.current, s1);
            navigationController.setIndex(1);
            assert.strictEqual(navigationController.current, s2);
            navigationController.setIndex(44);
            assert.strictEqual(navigationController.current, s2);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwbG9yZXJWaWV3LnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9maWxlcy90ZXN0L2Jyb3dzZXIvZXhwbG9yZXJWaWV3LnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFnQmhHLEtBQUssQ0FBQyxzQkFBc0IsRUFBRSxHQUFHLEVBQUU7UUFFbEMsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUVoQixNQUFNLFdBQVcsR0FBRyxJQUFJLHVDQUFlLEVBQUUsQ0FBQztRQUMxQyxNQUFNLGFBQWEsR0FBRyxJQUFJLG1EQUF3QixFQUFFLENBQUM7UUFHckQsU0FBUyxVQUFVLENBQVksSUFBWSxFQUFFLElBQVksRUFBRSxRQUFpQixFQUFFLFdBQW9CLEVBQUUsSUFBWSxFQUFFLEtBQWEsRUFBRSxTQUFTLEdBQUcsS0FBSyxFQUFFLFNBQVMsR0FBRyxLQUFLO1lBQ3BLLE9BQU8sSUFBSSw0QkFBWSxDQUFDLGtCQUFVLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLEVBQUUsYUFBYSxFQUFFLHFEQUE2QixFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztRQUN2TCxDQUFDO1FBRUQsSUFBSSxDQUFDLFlBQVksRUFBRSxLQUFLO1lBQ3ZCLE1BQU0sQ0FBQyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDL0IsTUFBTSxFQUFFLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNqRSxNQUFNLEVBQUUsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hFLE1BQU0sRUFBRSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDekUsTUFBTSxFQUFFLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNqRixNQUFNLHNCQUFzQixHQUFHLEVBQUUsaUNBQWlDLEVBQUUsQ0FBQyxJQUFrQixFQUFFLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUV4RyxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUEseUJBQVUsRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsc0JBQXNCLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNuRyxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUEseUJBQVUsRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsc0JBQXNCLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNuRyxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUEseUJBQVUsRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsc0JBQXNCLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDNUYsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFBLHlCQUFVLEVBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsc0JBQXNCLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN4RixNQUFNLENBQUMsZUFBZSxDQUFDLElBQUEseUJBQVUsRUFBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxzQkFBc0IsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2xHLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHFCQUFxQixFQUFFLEtBQUs7WUFDaEMsTUFBTSxDQUFDLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUMvQixNQUFNLEVBQUUsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hFLEVBQUUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDckMsTUFBTSxFQUFFLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDL0UsTUFBTSxFQUFFLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNqRixNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsZ0RBQWtCLEVBQUMsRUFBRSxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDdEQsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFBLGdEQUFrQixFQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUM5QyxPQUFPLEVBQUUsZUFBZTtnQkFDeEIsTUFBTSxFQUFFLFFBQVE7YUFDaEIsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFBLGdEQUFrQixFQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUM5QyxPQUFPLEVBQUUsbURBQW1EO2dCQUM1RCxNQUFNLEVBQUUsR0FBRztnQkFDWCxLQUFLLEVBQUUseUNBQXlCO2FBQ2hDLENBQUMsQ0FBQztZQUVILE1BQU0sT0FBTyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNuRyxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUEsZ0RBQWtCLEVBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ25ELE9BQU8sRUFBRSxtQkFBbUI7Z0JBQzVCLE1BQU0sRUFBRSxHQUFHO2FBQ1gsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsa0NBQWtDLEVBQUUsS0FBSztZQUM3QyxNQUFNLFNBQVMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDN0IsTUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzFCLE1BQU0sVUFBVSxHQUFHLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUNwQyxNQUFNLFVBQVUsR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDcEMsTUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sQ0FBQyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDL0IsTUFBTSxFQUFFLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RSxNQUFNLEVBQUUsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3pFLE1BQU0sRUFBRSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFakYsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDN0IsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDOUIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDOUIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDOUIsTUFBTSxPQUFPLEdBQUcsSUFBSSxlQUFPLEVBQVEsQ0FBQztZQUVwQyxNQUFNLG9CQUFvQixHQUFHLElBQUksK0NBQThCLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRTtnQkFDbkYsU0FBUztnQkFDVCxtQkFBbUIsRUFBRSxJQUFJLDJCQUFlLEVBQUU7Z0JBQzFDLGtCQUFrQixFQUFFLElBQUksMkJBQWUsRUFBRTtnQkFDekMsS0FBSyxFQUFPO29CQUNYLFNBQVMsRUFBRSxLQUFLO29CQUNoQixXQUFXLEVBQUUsT0FBTyxDQUFDLEtBQUs7aUJBQzFCO2FBQ0QsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFYixNQUFNLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNsRCxNQUFNLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNsRCxNQUFNLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNyRCxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUM1QixNQUFNLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNyRCxvQkFBb0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNoQyxNQUFNLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNyRCxvQkFBb0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNoQyxNQUFNLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNyRCxvQkFBb0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNoQyxNQUFNLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNyRCxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUM1QixNQUFNLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNyRCxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUM3QixNQUFNLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNyRCxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDckQsb0JBQW9CLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2xDLE1BQU0sQ0FBQyxXQUFXLENBQUMsb0JBQW9CLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3RELENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUMifQ==