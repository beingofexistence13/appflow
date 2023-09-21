/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/registry/common/platform", "vs/platform/quickinput/common/quickAccess", "vs/editor/common/standaloneStrings", "vs/platform/quickinput/browser/helpQuickAccess"], function (require, exports, platform_1, quickAccess_1, standaloneStrings_1, helpQuickAccess_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    platform_1.Registry.as(quickAccess_1.Extensions.Quickaccess).registerQuickAccessProvider({
        ctor: helpQuickAccess_1.HelpQuickAccessProvider,
        prefix: '',
        helpEntries: [{ description: standaloneStrings_1.QuickHelpNLS.helpQuickAccessActionLabel }]
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhbmRhbG9uZUhlbHBRdWlja0FjY2Vzcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9zdGFuZGFsb25lL2Jyb3dzZXIvcXVpY2tBY2Nlc3Mvc3RhbmRhbG9uZUhlbHBRdWlja0FjY2Vzcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQU9oRyxtQkFBUSxDQUFDLEVBQUUsQ0FBdUIsd0JBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQywyQkFBMkIsQ0FBQztRQUNyRixJQUFJLEVBQUUseUNBQXVCO1FBQzdCLE1BQU0sRUFBRSxFQUFFO1FBQ1YsV0FBVyxFQUFFLENBQUMsRUFBRSxXQUFXLEVBQUUsZ0NBQVksQ0FBQywwQkFBMEIsRUFBRSxDQUFDO0tBQ3ZFLENBQUMsQ0FBQyJ9