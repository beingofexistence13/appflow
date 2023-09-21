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
define(["require", "exports", "vs/nls!vs/workbench/api/browser/mainThreadMessageService", "vs/base/common/actions", "../common/extHost.protocol", "vs/workbench/services/extensions/common/extHostCustomers", "vs/platform/dialogs/common/dialogs", "vs/platform/notification/common/notification", "vs/base/common/event", "vs/platform/commands/common/commands"], function (require, exports, nls, actions_1, extHost_protocol_1, extHostCustomers_1, dialogs_1, notification_1, event_1, commands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ykb = void 0;
    let $ykb = class $ykb {
        constructor(extHostContext, a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
            //
        }
        dispose() {
            //
        }
        $showMessage(severity, message, options, commands) {
            if (options.modal) {
                return this.e(severity, message, options.detail, commands, options.useCustom);
            }
            else {
                return this.d(severity, message, commands, options);
            }
        }
        d(severity, message, commands, options) {
            return new Promise(resolve => {
                const primaryActions = commands.map(command => (0, actions_1.$li)({
                    id: `_extension_message_handle_${command.handle}`,
                    label: command.title,
                    enabled: true,
                    run: () => {
                        resolve(command.handle);
                        return Promise.resolve();
                    }
                }));
                let source;
                if (options.source) {
                    source = {
                        label: nls.localize(0, null, options.source.label),
                        id: options.source.identifier.value
                    };
                }
                if (!source) {
                    source = nls.localize(1, null);
                }
                const secondaryActions = [];
                if (options.source) {
                    secondaryActions.push((0, actions_1.$li)({
                        id: options.source.identifier.value,
                        label: nls.localize(2, null),
                        run: () => {
                            return this.b.executeCommand('_extensions.manage', options.source.identifier.value);
                        }
                    }));
                }
                const messageHandle = this.a.notify({
                    severity,
                    message,
                    actions: { primary: primaryActions, secondary: secondaryActions },
                    source
                });
                // if promise has not been resolved yet, now is the time to ensure a return value
                // otherwise if already resolved it means the user clicked one of the buttons
                event_1.Event.once(messageHandle.onDidClose)(() => {
                    resolve(undefined);
                });
            });
        }
        async e(severity, message, detail, commands, useCustom) {
            const buttons = [];
            let cancelButton = undefined;
            for (const command of commands) {
                const button = {
                    label: command.title,
                    run: () => command.handle
                };
                if (command.isCloseAffordance) {
                    cancelButton = button;
                }
                else {
                    buttons.push(button);
                }
            }
            if (!cancelButton) {
                if (buttons.length > 0) {
                    cancelButton = {
                        label: nls.localize(3, null),
                        run: () => undefined
                    };
                }
                else {
                    cancelButton = {
                        label: nls.localize(4, null),
                        run: () => undefined
                    };
                }
            }
            const { result } = await this.c.prompt({
                type: severity,
                message,
                detail,
                buttons,
                cancelButton,
                custom: useCustom
            });
            return result;
        }
    };
    exports.$ykb = $ykb;
    exports.$ykb = $ykb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadMessageService),
        __param(1, notification_1.$Yu),
        __param(2, commands_1.$Fr),
        __param(3, dialogs_1.$oA)
    ], $ykb);
});
//# sourceMappingURL=mainThreadMessageService.js.map