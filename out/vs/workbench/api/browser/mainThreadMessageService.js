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
define(["require", "exports", "vs/nls", "vs/base/common/actions", "../common/extHost.protocol", "vs/workbench/services/extensions/common/extHostCustomers", "vs/platform/dialogs/common/dialogs", "vs/platform/notification/common/notification", "vs/base/common/event", "vs/platform/commands/common/commands"], function (require, exports, nls, actions_1, extHost_protocol_1, extHostCustomers_1, dialogs_1, notification_1, event_1, commands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadMessageService = void 0;
    let MainThreadMessageService = class MainThreadMessageService {
        constructor(extHostContext, _notificationService, _commandService, _dialogService) {
            this._notificationService = _notificationService;
            this._commandService = _commandService;
            this._dialogService = _dialogService;
            //
        }
        dispose() {
            //
        }
        $showMessage(severity, message, options, commands) {
            if (options.modal) {
                return this._showModalMessage(severity, message, options.detail, commands, options.useCustom);
            }
            else {
                return this._showMessage(severity, message, commands, options);
            }
        }
        _showMessage(severity, message, commands, options) {
            return new Promise(resolve => {
                const primaryActions = commands.map(command => (0, actions_1.toAction)({
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
                        label: nls.localize('extensionSource', "{0} (Extension)", options.source.label),
                        id: options.source.identifier.value
                    };
                }
                if (!source) {
                    source = nls.localize('defaultSource', "Extension");
                }
                const secondaryActions = [];
                if (options.source) {
                    secondaryActions.push((0, actions_1.toAction)({
                        id: options.source.identifier.value,
                        label: nls.localize('manageExtension', "Manage Extension"),
                        run: () => {
                            return this._commandService.executeCommand('_extensions.manage', options.source.identifier.value);
                        }
                    }));
                }
                const messageHandle = this._notificationService.notify({
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
        async _showModalMessage(severity, message, detail, commands, useCustom) {
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
                        label: nls.localize('cancel', "Cancel"),
                        run: () => undefined
                    };
                }
                else {
                    cancelButton = {
                        label: nls.localize({ key: 'ok', comment: ['&& denotes a mnemonic'] }, "&&OK"),
                        run: () => undefined
                    };
                }
            }
            const { result } = await this._dialogService.prompt({
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
    exports.MainThreadMessageService = MainThreadMessageService;
    exports.MainThreadMessageService = MainThreadMessageService = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadMessageService),
        __param(1, notification_1.INotificationService),
        __param(2, commands_1.ICommandService),
        __param(3, dialogs_1.IDialogService)
    ], MainThreadMessageService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZE1lc3NhZ2VTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9icm93c2VyL21haW5UaHJlYWRNZXNzYWdlU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFhekYsSUFBTSx3QkFBd0IsR0FBOUIsTUFBTSx3QkFBd0I7UUFFcEMsWUFDQyxjQUErQixFQUNRLG9CQUEwQyxFQUMvQyxlQUFnQyxFQUNqQyxjQUE4QjtZQUZ4Qix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1lBQy9DLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtZQUNqQyxtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7WUFFL0QsRUFBRTtRQUNILENBQUM7UUFFRCxPQUFPO1lBQ04sRUFBRTtRQUNILENBQUM7UUFFRCxZQUFZLENBQUMsUUFBa0IsRUFBRSxPQUFlLEVBQUUsT0FBaUMsRUFBRSxRQUF5RTtZQUM3SixJQUFJLE9BQU8sQ0FBQyxLQUFLLEVBQUU7Z0JBQ2xCLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBQzlGO2lCQUFNO2dCQUNOLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQzthQUMvRDtRQUNGLENBQUM7UUFFTyxZQUFZLENBQUMsUUFBa0IsRUFBRSxPQUFlLEVBQUUsUUFBeUUsRUFBRSxPQUFpQztZQUVySyxPQUFPLElBQUksT0FBTyxDQUFxQixPQUFPLENBQUMsRUFBRTtnQkFFaEQsTUFBTSxjQUFjLEdBQWMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLElBQUEs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