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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/marshalling", "vs/workbench/api/common/extHost.protocol", "vs/workbench/contrib/chat/common/chatSlashCommands", "vs/workbench/services/extensions/common/extHostCustomers"], function (require, exports, lifecycle_1, marshalling_1, extHost_protocol_1, chatSlashCommands_1, extHostCustomers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadChatSlashCommands = void 0;
    let MainThreadChatSlashCommands = class MainThreadChatSlashCommands {
        constructor(extHostContext, _chatSlashCommandService) {
            this._chatSlashCommandService = _chatSlashCommandService;
            this._commands = new lifecycle_1.DisposableMap;
            this._pendingProgress = new Map();
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostChatSlashCommands);
        }
        dispose() {
            this._commands.clearAndDisposeAll();
        }
        $registerCommand(handle, name, detail) {
            if (!this._chatSlashCommandService.hasCommand(name)) {
                // dynamic slash commands!
                this._chatSlashCommandService.registerSlashData({
                    command: name,
                    detail
                });
            }
            const d = this._chatSlashCommandService.registerSlashCallback(name, async (prompt, progress, history, token) => {
                const requestId = Math.random();
                this._pendingProgress.set(requestId, progress);
                try {
                    return await this._proxy.$executeCommand(handle, requestId, prompt, { history }, token);
                }
                finally {
                    this._pendingProgress.delete(requestId);
                }
            });
            this._commands.set(handle, d);
        }
        async $handleProgressChunk(requestId, chunk) {
            this._pendingProgress.get(requestId)?.report((0, marshalling_1.revive)(chunk));
        }
        $unregisterCommand(handle) {
            this._commands.deleteAndDispose(handle);
        }
    };
    exports.MainThreadChatSlashCommands = MainThreadChatSlashCommands;
    exports.MainThreadChatSlashCommands = MainThreadChatSlashCommands = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadChatSlashCommands),
        __param(1, chatSlashCommands_1.IChatSlashCommandService)
    ], MainThreadChatSlashCommands);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZENoYXRTbGFzaENvbW1hbmRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9icm93c2VyL21haW5UaHJlYWRDaGF0U2xhc2hDb21tYW5kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFXekYsSUFBTSwyQkFBMkIsR0FBakMsTUFBTSwyQkFBMkI7UUFNdkMsWUFDQyxjQUErQixFQUNMLHdCQUFtRTtZQUFsRCw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1lBTjdFLGNBQVMsR0FBRyxJQUFJLHlCQUFxQixDQUFDO1lBQ3RDLHFCQUFnQixHQUFHLElBQUksR0FBRyxFQUF5QyxDQUFDO1lBT3BGLElBQUksQ0FBQyxNQUFNLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxpQ0FBYyxDQUFDLHdCQUF3QixDQUFDLENBQUM7UUFDaEYsQ0FBQztRQUVELE9BQU87WUFDTixJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDckMsQ0FBQztRQUVELGdCQUFnQixDQUFDLE1BQWMsRUFBRSxJQUFZLEVBQUUsTUFBYztZQUU1RCxJQUFJLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDcEQsMEJBQTBCO2dCQUMxQixJQUFJLENBQUMsd0JBQXdCLENBQUMsaUJBQWlCLENBQUM7b0JBQy9DLE9BQU8sRUFBRSxJQUFJO29CQUNiLE1BQU07aUJBQ04sQ0FBQyxDQUFDO2FBQ0g7WUFFRCxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMscUJBQXFCLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsRUFBRTtnQkFDOUcsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNoQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDL0MsSUFBSTtvQkFDSCxPQUFPLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztpQkFDeEY7d0JBQVM7b0JBQ1QsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztpQkFDeEM7WUFDRixDQUFDLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMvQixDQUFDO1FBRUQsS0FBSyxDQUFDLG9CQUFvQixDQUFDLFNBQWlCLEVBQUUsS0FBeUI7WUFDdEUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxNQUFNLENBQUMsSUFBQSxvQkFBTSxFQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDN0QsQ0FBQztRQUVELGtCQUFrQixDQUFDLE1BQWM7WUFDaEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN6QyxDQUFDO0tBQ0QsQ0FBQTtJQTlDWSxrRUFBMkI7MENBQTNCLDJCQUEyQjtRQUR2QyxJQUFBLHVDQUFvQixFQUFDLDhCQUFXLENBQUMsMkJBQTJCLENBQUM7UUFTM0QsV0FBQSw0Q0FBd0IsQ0FBQTtPQVJkLDJCQUEyQixDQThDdkMifQ==