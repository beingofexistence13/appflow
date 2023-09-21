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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/log/common/log", "vs/platform/progress/common/progress", "vs/workbench/api/common/extHost.protocol", "vs/workbench/contrib/chat/common/chatProvider", "vs/workbench/services/extensions/common/extHostCustomers"], function (require, exports, lifecycle_1, log_1, progress_1, extHost_protocol_1, chatProvider_1, extHostCustomers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadChatProvider = void 0;
    let MainThreadChatProvider = class MainThreadChatProvider {
        constructor(extHostContext, _chatProviderService, _logService) {
            this._chatProviderService = _chatProviderService;
            this._logService = _logService;
            this._providerRegistrations = new lifecycle_1.DisposableMap();
            this._pendingProgress = new Map();
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostChatProvider);
        }
        dispose() {
            this._providerRegistrations.dispose();
        }
        $registerProvider(handle, identifier, metadata) {
            const registration = this._chatProviderService.registerChatResponseProvider(identifier, {
                metadata,
                provideChatResponse: async (messages, options, progress, token) => {
                    const requestId = (Math.random() * 1e6) | 0;
                    this._pendingProgress.set(requestId, progress);
                    try {
                        await this._proxy.$provideChatResponse(handle, requestId, messages, options, token);
                    }
                    finally {
                        this._pendingProgress.delete(requestId);
                    }
                }
            });
            this._providerRegistrations.set(handle, registration);
        }
        async $handleProgressChunk(requestId, chunk) {
            this._pendingProgress.get(requestId)?.report(chunk);
        }
        $unregisterProvider(handle) {
            this._providerRegistrations.deleteAndDispose(handle);
        }
        async $fetchResponse(extension, providerId, requestId, messages, options, token) {
            this._logService.debug('[CHAT] extension request STARTED', extension.value, requestId);
            const task = this._chatProviderService.fetchChatResponse(providerId, messages, options, new progress_1.Progress(value => {
                this._proxy.$handleResponseFragment(requestId, value);
            }), token);
            task.catch(err => {
                this._logService.error('[CHAT] extension request ERRORED', err, extension.value, requestId);
            }).finally(() => {
                this._logService.debug('[CHAT] extension request DONE', extension.value, requestId);
            });
            return task;
        }
    };
    exports.MainThreadChatProvider = MainThreadChatProvider;
    exports.MainThreadChatProvider = MainThreadChatProvider = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadChatProvider),
        __param(1, chatProvider_1.IChatProviderService),
        __param(2, log_1.ILogService)
    ], MainThreadChatProvider);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZENoYXRQcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvYnJvd3Nlci9tYWluVGhyZWFkQ2hhdFByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVl6RixJQUFNLHNCQUFzQixHQUE1QixNQUFNLHNCQUFzQjtRQU1sQyxZQUNDLGNBQStCLEVBQ1Qsb0JBQTJELEVBQ3BFLFdBQXlDO1lBRGYseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFzQjtZQUNuRCxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtZQU50QywyQkFBc0IsR0FBRyxJQUFJLHlCQUFhLEVBQVUsQ0FBQztZQUNyRCxxQkFBZ0IsR0FBRyxJQUFJLEdBQUcsRUFBNEMsQ0FBQztZQU92RixJQUFJLENBQUMsTUFBTSxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsaUNBQWMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBQzNFLENBQUM7UUFFRCxPQUFPO1lBQ04sSUFBSSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3ZDLENBQUM7UUFFRCxpQkFBaUIsQ0FBQyxNQUFjLEVBQUUsVUFBa0IsRUFBRSxRQUF1QztZQUM1RixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsNEJBQTRCLENBQUMsVUFBVSxFQUFFO2dCQUN2RixRQUFRO2dCQUNSLG1CQUFtQixFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsRUFBRTtvQkFDakUsTUFBTSxTQUFTLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUM1QyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztvQkFDL0MsSUFBSTt3QkFDSCxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO3FCQUNwRjs0QkFBUzt3QkFDVCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO3FCQUN4QztnQkFDRixDQUFDO2FBQ0QsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDdkQsQ0FBQztRQUVELEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxTQUFpQixFQUFFLEtBQTRCO1lBQ3pFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JELENBQUM7UUFFRCxtQkFBbUIsQ0FBQyxNQUFjO1lBQ2pDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBRUQsS0FBSyxDQUFDLGNBQWMsQ0FBQyxTQUE4QixFQUFFLFVBQWtCLEVBQUUsU0FBaUIsRUFBRSxRQUF3QixFQUFFLE9BQVcsRUFBRSxLQUF3QjtZQUMxSixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxrQ0FBa0MsRUFBRSxTQUFTLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBRXZGLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxJQUFJLG1CQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQzVHLElBQUksQ0FBQyxNQUFNLENBQUMsdUJBQXVCLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3ZELENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRVgsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDaEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsa0NBQWtDLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDN0YsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRTtnQkFDZixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQywrQkFBK0IsRUFBRSxTQUFTLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3JGLENBQUMsQ0FBQyxDQUFDO1lBRUgsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO0tBQ0QsQ0FBQTtJQXpEWSx3REFBc0I7cUNBQXRCLHNCQUFzQjtRQURsQyxJQUFBLHVDQUFvQixFQUFDLDhCQUFXLENBQUMsc0JBQXNCLENBQUM7UUFTdEQsV0FBQSxtQ0FBb0IsQ0FBQTtRQUNwQixXQUFBLGlCQUFXLENBQUE7T0FURCxzQkFBc0IsQ0F5RGxDIn0=