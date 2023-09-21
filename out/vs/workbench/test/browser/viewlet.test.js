/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/registry/common/platform", "vs/workbench/browser/panecomposite", "vs/base/common/types", "vs/base/test/common/utils"], function (require, exports, assert, platform_1, panecomposite_1, types_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Viewlets', () => {
        class TestViewlet extends panecomposite_1.PaneComposite {
            constructor() {
                super('id', null, null, null, null, null, null, null);
            }
            layout(dimension) {
                throw new Error('Method not implemented.');
            }
            setBoundarySashes(sashes) {
                throw new Error('Method not implemented.');
            }
            createViewPaneContainer() { return null; }
        }
        test('ViewletDescriptor API', function () {
            const d = panecomposite_1.PaneCompositeDescriptor.create(TestViewlet, 'id', 'name', 'class', 5);
            assert.strictEqual(d.id, 'id');
            assert.strictEqual(d.name, 'name');
            assert.strictEqual(d.cssClass, 'class');
            assert.strictEqual(d.order, 5);
        });
        test('Editor Aware ViewletDescriptor API', function () {
            let d = panecomposite_1.PaneCompositeDescriptor.create(TestViewlet, 'id', 'name', 'class', 5);
            assert.strictEqual(d.id, 'id');
            assert.strictEqual(d.name, 'name');
            d = panecomposite_1.PaneCompositeDescriptor.create(TestViewlet, 'id', 'name', 'class', 5);
            assert.strictEqual(d.id, 'id');
            assert.strictEqual(d.name, 'name');
        });
        test('Viewlet extension point and registration', function () {
            assert((0, types_1.isFunction)(platform_1.Registry.as(panecomposite_1.Extensions.Viewlets).registerPaneComposite));
            assert((0, types_1.isFunction)(platform_1.Registry.as(panecomposite_1.Extensions.Viewlets).getPaneComposite));
            assert((0, types_1.isFunction)(platform_1.Registry.as(panecomposite_1.Extensions.Viewlets).getPaneComposites));
            const oldCount = platform_1.Registry.as(panecomposite_1.Extensions.Viewlets).getPaneComposites().length;
            const d = panecomposite_1.PaneCompositeDescriptor.create(TestViewlet, 'reg-test-id', 'name');
            platform_1.Registry.as(panecomposite_1.Extensions.Viewlets).registerPaneComposite(d);
            assert(d === platform_1.Registry.as(panecomposite_1.Extensions.Viewlets).getPaneComposite('reg-test-id'));
            assert.strictEqual(oldCount + 1, platform_1.Registry.as(panecomposite_1.Extensions.Viewlets).getPaneComposites().length);
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld2xldC50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3Rlc3QvYnJvd3Nlci92aWV3bGV0LnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFTaEcsS0FBSyxDQUFDLFVBQVUsRUFBRSxHQUFHLEVBQUU7UUFFdEIsTUFBTSxXQUFZLFNBQVEsNkJBQWE7WUFFdEM7Z0JBQ0MsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFLLEVBQUUsSUFBSyxFQUFFLElBQUssRUFBRSxJQUFLLEVBQUUsSUFBSyxFQUFFLElBQUssRUFBRSxJQUFLLENBQUMsQ0FBQztZQUM5RCxDQUFDO1lBRVEsTUFBTSxDQUFDLFNBQWM7Z0JBQzdCLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztZQUM1QyxDQUFDO1lBRVEsaUJBQWlCLENBQUMsTUFBdUI7Z0JBQ2pELE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztZQUM1QyxDQUFDO1lBRWtCLHVCQUF1QixLQUFLLE9BQU8sSUFBSyxDQUFDLENBQUMsQ0FBQztTQUM5RDtRQUVELElBQUksQ0FBQyx1QkFBdUIsRUFBRTtZQUM3QixNQUFNLENBQUMsR0FBRyx1Q0FBdUIsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2hGLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUMvQixNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDbkMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3hDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNoQyxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxvQ0FBb0MsRUFBRTtZQUMxQyxJQUFJLENBQUMsR0FBRyx1Q0FBdUIsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzlFLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUMvQixNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFFbkMsQ0FBQyxHQUFHLHVDQUF1QixDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDMUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQy9CLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNwQyxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQywwQ0FBMEMsRUFBRTtZQUNoRCxNQUFNLENBQUMsSUFBQSxrQkFBVSxFQUFDLG1CQUFRLENBQUMsRUFBRSxDQUF3QiwwQkFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQztZQUNsRyxNQUFNLENBQUMsSUFBQSxrQkFBVSxFQUFDLG1CQUFRLENBQUMsRUFBRSxDQUF3QiwwQkFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztZQUM3RixNQUFNLENBQUMsSUFBQSxrQkFBVSxFQUFDLG1CQUFRLENBQUMsRUFBRSxDQUF3QiwwQkFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztZQUU5RixNQUFNLFFBQVEsR0FBRyxtQkFBUSxDQUFDLEVBQUUsQ0FBd0IsMEJBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLE1BQU0sQ0FBQztZQUNwRyxNQUFNLENBQUMsR0FBRyx1Q0FBdUIsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUM3RSxtQkFBUSxDQUFDLEVBQUUsQ0FBd0IsMEJBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVqRixNQUFNLENBQUMsQ0FBQyxLQUFLLG1CQUFRLENBQUMsRUFBRSxDQUF3QiwwQkFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7WUFDdEcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxFQUFFLG1CQUFRLENBQUMsRUFBRSxDQUF3QiwwQkFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLGlCQUFpQixFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdEgsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFBLCtDQUF1QyxHQUFFLENBQUM7SUFDM0MsQ0FBQyxDQUFDLENBQUMifQ==