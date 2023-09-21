/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/action/common/actionCommonCategories", "vs/platform/actions/common/actions", "vs/platform/log/common/log"], function (require, exports, nls_1, actionCommonCategories_1, actions_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MenuHiddenStatesReset = void 0;
    class MenuHiddenStatesReset extends actions_1.Action2 {
        constructor() {
            super({
                id: 'menu.resetHiddenStates',
                title: {
                    value: (0, nls_1.localize)('title', 'Reset All Menus'),
                    original: 'Reset All Menus'
                },
                category: actionCommonCategories_1.Categories.View,
                f1: true
            });
        }
        run(accessor) {
            accessor.get(actions_1.IMenuService).resetHiddenStates();
            accessor.get(log_1.ILogService).info('did RESET all menu hidden states');
        }
    }
    exports.MenuHiddenStatesReset = MenuHiddenStatesReset;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudVJlc2V0QWN0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vYWN0aW9ucy9jb21tb24vbWVudVJlc2V0QWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVFoRyxNQUFhLHFCQUFzQixTQUFRLGlCQUFPO1FBRWpEO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSx3QkFBd0I7Z0JBQzVCLEtBQUssRUFBRTtvQkFDTixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsT0FBTyxFQUFFLGlCQUFpQixDQUFDO29CQUMzQyxRQUFRLEVBQUUsaUJBQWlCO2lCQUMzQjtnQkFDRCxRQUFRLEVBQUUsbUNBQVUsQ0FBQyxJQUFJO2dCQUN6QixFQUFFLEVBQUUsSUFBSTthQUNSLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxHQUFHLENBQUMsUUFBMEI7WUFDN0IsUUFBUSxDQUFDLEdBQUcsQ0FBQyxzQkFBWSxDQUFDLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUMvQyxRQUFRLENBQUMsR0FBRyxDQUFDLGlCQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsa0NBQWtDLENBQUMsQ0FBQztRQUNwRSxDQUFDO0tBQ0Q7SUFsQkQsc0RBa0JDIn0=