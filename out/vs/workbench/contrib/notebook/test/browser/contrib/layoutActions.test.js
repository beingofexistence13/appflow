/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/contrib/notebook/browser/contrib/layout/layoutActions"], function (require, exports, assert, layoutActions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Notebook Layout Actions', () => {
        test('Toggle Cell Toolbar Position', async function () {
            const action = new layoutActions_1.ToggleCellToolbarPositionAction();
            // "notebook.cellToolbarLocation": "right"
            assert.deepStrictEqual(action.togglePosition('test-nb', 'right'), {
                default: 'right',
                'test-nb': 'left'
            });
            // "notebook.cellToolbarLocation": "left"
            assert.deepStrictEqual(action.togglePosition('test-nb', 'left'), {
                default: 'left',
                'test-nb': 'right'
            });
            // "notebook.cellToolbarLocation": "hidden"
            assert.deepStrictEqual(action.togglePosition('test-nb', 'hidden'), {
                default: 'hidden',
                'test-nb': 'right'
            });
            // invalid
            assert.deepStrictEqual(action.togglePosition('test-nb', ''), {
                default: 'right',
                'test-nb': 'left'
            });
            // no user config, default value
            assert.deepStrictEqual(action.togglePosition('test-nb', {
                default: 'right'
            }), {
                default: 'right',
                'test-nb': 'left'
            });
            // user config, default to left
            assert.deepStrictEqual(action.togglePosition('test-nb', {
                default: 'left'
            }), {
                default: 'left',
                'test-nb': 'right'
            });
            // user config, default to hidden
            assert.deepStrictEqual(action.togglePosition('test-nb', {
                default: 'hidden'
            }), {
                default: 'hidden',
                'test-nb': 'right'
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5b3V0QWN0aW9ucy50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svdGVzdC9icm93c2VyL2NvbnRyaWIvbGF5b3V0QWN0aW9ucy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBS2hHLEtBQUssQ0FBQyx5QkFBeUIsRUFBRSxHQUFHLEVBQUU7UUFDckMsSUFBSSxDQUFDLDhCQUE4QixFQUFFLEtBQUs7WUFDekMsTUFBTSxNQUFNLEdBQUcsSUFBSSwrQ0FBK0IsRUFBRSxDQUFDO1lBRXJELDBDQUEwQztZQUMxQyxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxFQUFFO2dCQUNqRSxPQUFPLEVBQUUsT0FBTztnQkFDaEIsU0FBUyxFQUFFLE1BQU07YUFDakIsQ0FBQyxDQUFDO1lBRUgseUNBQXlDO1lBQ3pDLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLEVBQUU7Z0JBQ2hFLE9BQU8sRUFBRSxNQUFNO2dCQUNmLFNBQVMsRUFBRSxPQUFPO2FBQ2xCLENBQUMsQ0FBQztZQUVILDJDQUEyQztZQUMzQyxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxFQUFFO2dCQUNsRSxPQUFPLEVBQUUsUUFBUTtnQkFDakIsU0FBUyxFQUFFLE9BQU87YUFDbEIsQ0FBQyxDQUFDO1lBRUgsVUFBVTtZQUNWLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLEVBQUU7Z0JBQzVELE9BQU8sRUFBRSxPQUFPO2dCQUNoQixTQUFTLEVBQUUsTUFBTTthQUNqQixDQUFDLENBQUM7WUFFSCxnQ0FBZ0M7WUFDaEMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRTtnQkFDdkQsT0FBTyxFQUFFLE9BQU87YUFDaEIsQ0FBQyxFQUFFO2dCQUNILE9BQU8sRUFBRSxPQUFPO2dCQUNoQixTQUFTLEVBQUUsTUFBTTthQUNqQixDQUFDLENBQUM7WUFFSCwrQkFBK0I7WUFDL0IsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRTtnQkFDdkQsT0FBTyxFQUFFLE1BQU07YUFDZixDQUFDLEVBQUU7Z0JBQ0gsT0FBTyxFQUFFLE1BQU07Z0JBQ2YsU0FBUyxFQUFFLE9BQU87YUFDbEIsQ0FBQyxDQUFDO1lBRUgsaUNBQWlDO1lBQ2pDLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUU7Z0JBQ3ZELE9BQU8sRUFBRSxRQUFRO2FBQ2pCLENBQUMsRUFBRTtnQkFDSCxPQUFPLEVBQUUsUUFBUTtnQkFDakIsU0FBUyxFQUFFLE9BQU87YUFDbEIsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQyJ9