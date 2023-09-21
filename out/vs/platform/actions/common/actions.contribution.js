/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/actions/common/actions", "vs/platform/actions/common/menuResetAction", "vs/platform/actions/common/menuService", "vs/platform/instantiation/common/extensions"], function (require, exports, actions_1, menuResetAction_1, menuService_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, extensions_1.registerSingleton)(actions_1.IMenuService, menuService_1.MenuService, 1 /* InstantiationType.Delayed */);
    (0, actions_1.registerAction2)(menuResetAction_1.MenuHiddenStatesReset);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9ucy5jb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9hY3Rpb25zL2NvbW1vbi9hY3Rpb25zLmNvbnRyaWJ1dGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQU9oRyxJQUFBLDhCQUFpQixFQUFDLHNCQUFZLEVBQUUseUJBQVcsb0NBQTRCLENBQUM7SUFFeEUsSUFBQSx5QkFBZSxFQUFDLHVDQUFxQixDQUFDLENBQUMifQ==