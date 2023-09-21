/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybinding", "vs/platform/quickinput/common/quickInput"], function (require, exports, nls_1, contextkey_1, keybinding_1, quickInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getQuickNavigateHandler = exports.defaultQuickAccessContext = exports.defaultQuickAccessContextKeyValue = exports.inQuickPickContext = exports.InQuickPickContextKey = exports.inQuickPickContextKeyValue = void 0;
    exports.inQuickPickContextKeyValue = 'inQuickOpen';
    exports.InQuickPickContextKey = new contextkey_1.RawContextKey(exports.inQuickPickContextKeyValue, false, (0, nls_1.localize)('inQuickOpen', "Whether keyboard focus is inside the quick open control"));
    exports.inQuickPickContext = contextkey_1.ContextKeyExpr.has(exports.inQuickPickContextKeyValue);
    exports.defaultQuickAccessContextKeyValue = 'inFilesPicker';
    exports.defaultQuickAccessContext = contextkey_1.ContextKeyExpr.and(exports.inQuickPickContext, contextkey_1.ContextKeyExpr.has(exports.defaultQuickAccessContextKeyValue));
    function getQuickNavigateHandler(id, next) {
        return accessor => {
            const keybindingService = accessor.get(keybinding_1.IKeybindingService);
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const keys = keybindingService.lookupKeybindings(id);
            const quickNavigate = { keybindings: keys };
            quickInputService.navigate(!!next, quickNavigate);
        };
    }
    exports.getQuickNavigateHandler = getQuickNavigateHandler;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVpY2thY2Nlc3MuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci9xdWlja2FjY2Vzcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFRbkYsUUFBQSwwQkFBMEIsR0FBRyxhQUFhLENBQUM7SUFDM0MsUUFBQSxxQkFBcUIsR0FBRyxJQUFJLDBCQUFhLENBQVUsa0NBQTBCLEVBQUUsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLGFBQWEsRUFBRSx5REFBeUQsQ0FBQyxDQUFDLENBQUM7SUFDMUssUUFBQSxrQkFBa0IsR0FBRywyQkFBYyxDQUFDLEdBQUcsQ0FBQyxrQ0FBMEIsQ0FBQyxDQUFDO0lBRXBFLFFBQUEsaUNBQWlDLEdBQUcsZUFBZSxDQUFDO0lBQ3BELFFBQUEseUJBQXlCLEdBQUcsMkJBQWMsQ0FBQyxHQUFHLENBQUMsMEJBQWtCLEVBQUUsMkJBQWMsQ0FBQyxHQUFHLENBQUMseUNBQWlDLENBQUMsQ0FBQyxDQUFDO0lBb0J2SSxTQUFnQix1QkFBdUIsQ0FBQyxFQUFVLEVBQUUsSUFBYztRQUNqRSxPQUFPLFFBQVEsQ0FBQyxFQUFFO1lBQ2pCLE1BQU0saUJBQWlCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywrQkFBa0IsQ0FBQyxDQUFDO1lBQzNELE1BQU0saUJBQWlCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywrQkFBa0IsQ0FBQyxDQUFDO1lBRTNELE1BQU0sSUFBSSxHQUFHLGlCQUFpQixDQUFDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3JELE1BQU0sYUFBYSxHQUFHLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxDQUFDO1lBRTVDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQ25ELENBQUMsQ0FBQztJQUNILENBQUM7SUFWRCwwREFVQyJ9