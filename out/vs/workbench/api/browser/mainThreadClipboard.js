/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/workbench/services/extensions/common/extHostCustomers", "../common/extHost.protocol", "vs/platform/clipboard/common/clipboardService"], function (require, exports, extHostCustomers_1, extHost_protocol_1, clipboardService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadClipboard = void 0;
    let MainThreadClipboard = class MainThreadClipboard {
        constructor(_context, _clipboardService) {
            this._clipboardService = _clipboardService;
        }
        dispose() {
            // nothing
        }
        $readText() {
            return this._clipboardService.readText();
        }
        $writeText(value) {
            return this._clipboardService.writeText(value);
        }
    };
    exports.MainThreadClipboard = MainThreadClipboard;
    exports.MainThreadClipboard = MainThreadClipboard = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadClipboard),
        __param(1, clipboardService_1.IClipboardService)
    ], MainThreadClipboard);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZENsaXBib2FyZC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvYnJvd3Nlci9tYWluVGhyZWFkQ2xpcGJvYXJkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQU96RixJQUFNLG1CQUFtQixHQUF6QixNQUFNLG1CQUFtQjtRQUUvQixZQUNDLFFBQWEsRUFDdUIsaUJBQW9DO1lBQXBDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBbUI7UUFDckUsQ0FBQztRQUVMLE9BQU87WUFDTixVQUFVO1FBQ1gsQ0FBQztRQUVELFNBQVM7WUFDUixPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUMxQyxDQUFDO1FBRUQsVUFBVSxDQUFDLEtBQWE7WUFDdkIsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2hELENBQUM7S0FDRCxDQUFBO0lBbEJZLGtEQUFtQjtrQ0FBbkIsbUJBQW1CO1FBRC9CLElBQUEsdUNBQW9CLEVBQUMsOEJBQVcsQ0FBQyxtQkFBbUIsQ0FBQztRQUtuRCxXQUFBLG9DQUFpQixDQUFBO09BSlAsbUJBQW1CLENBa0IvQiJ9