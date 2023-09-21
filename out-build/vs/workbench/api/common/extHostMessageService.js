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
define(["require", "exports", "./extHost.protocol", "vs/platform/log/common/log", "vs/workbench/services/extensions/common/extensions"], function (require, exports, extHost_protocol_1, log_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Xbc = void 0;
    function isMessageItem(item) {
        return item && item.title;
    }
    let $Xbc = class $Xbc {
        constructor(mainContext, b) {
            this.b = b;
            this.a = mainContext.getProxy(extHost_protocol_1.$1J.MainThreadMessageService);
        }
        showMessage(extension, severity, message, optionsOrFirstItem, rest) {
            const options = {
                source: { identifier: extension.identifier, label: extension.displayName || extension.name }
            };
            let items;
            if (typeof optionsOrFirstItem === 'string' || isMessageItem(optionsOrFirstItem)) {
                items = [optionsOrFirstItem, ...rest];
            }
            else {
                options.modal = optionsOrFirstItem?.modal;
                options.useCustom = optionsOrFirstItem?.useCustom;
                options.detail = optionsOrFirstItem?.detail;
                items = rest;
            }
            if (options.useCustom) {
                (0, extensions_1.$QF)(extension, 'resolvers');
            }
            const commands = [];
            for (let handle = 0; handle < items.length; handle++) {
                const command = items[handle];
                if (typeof command === 'string') {
                    commands.push({ title: command, handle, isCloseAffordance: false });
                }
                else if (typeof command === 'object') {
                    const { title, isCloseAffordance } = command;
                    commands.push({ title, isCloseAffordance: !!isCloseAffordance, handle });
                }
                else {
                    this.b.warn('Invalid message item:', command);
                }
            }
            return this.a.$showMessage(severity, message, options, commands).then(handle => {
                if (typeof handle === 'number') {
                    return items[handle];
                }
                return undefined;
            });
        }
    };
    exports.$Xbc = $Xbc;
    exports.$Xbc = $Xbc = __decorate([
        __param(1, log_1.$5i)
    ], $Xbc);
});
//# sourceMappingURL=extHostMessageService.js.map