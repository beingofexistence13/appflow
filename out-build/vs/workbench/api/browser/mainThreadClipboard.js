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
    exports.$xcb = void 0;
    let $xcb = class $xcb {
        constructor(_context, a) {
            this.a = a;
        }
        dispose() {
            // nothing
        }
        $readText() {
            return this.a.readText();
        }
        $writeText(value) {
            return this.a.writeText(value);
        }
    };
    exports.$xcb = $xcb;
    exports.$xcb = $xcb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadClipboard),
        __param(1, clipboardService_1.$UZ)
    ], $xcb);
});
//# sourceMappingURL=mainThreadClipboard.js.map