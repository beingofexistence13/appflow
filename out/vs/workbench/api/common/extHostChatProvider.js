/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostTypeConverters", "vs/platform/progress/common/progress", "vs/platform/extensions/common/extensions"], function (require, exports, lifecycle_1, extHost_protocol_1, typeConvert, progress_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostChatProvider = void 0;
    class ExtHostChatProvider {
        static { this._idPool = 1; }
        constructor(mainContext, _logService) {
            this._logService = _logService;
            this._providers = new Map();
            //#region --- making request
            this._pendingRequest = new Map();
            this._chatAccessAllowList = new extensions_1.ExtensionIdentifierMap();
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadChatProvider);
        }
        registerProvider(extension, identifier, provider, metadata) {
            const handle = ExtHostChatProvider._idPool++;
            this._providers.set(handle, { extension, provider });
            this._proxy.$registerProvider(handle, identifier, { extension, displayName: metadata.name ?? extension.value });
            return (0, lifecycle_1.toDisposable)(() => {
                this._proxy.$unregisterProvider(handle);
                this._providers.delete(handle);
            });
        }
        async $provideChatResponse(handle, requestId, messages, options, token) {
            const data = this._providers.get(handle);
            if (!data) {
                return;
            }
            const progress = new progress_1.Progress(async (fragment) => {
                if (token.isCancellationRequested) {
                    this._logService.warn(`[CHAT](${data.extension.value}) CANNOT send progress because the REQUEST IS CANCELLED`);
                    return;
                }
                await this._proxy.$handleProgressChunk(requestId, { index: fragment.index, part: fragment.part });
            }, { async: true });
            return data.provider.provideChatResponse(messages.map(typeConvert.ChatMessage.to), options, progress, token);
        }
        allowListExtensionWhile(extension, promise) {
            this._chatAccessAllowList.set(extension, promise);
            promise.finally(() => this._chatAccessAllowList.delete(extension));
        }
        async requestChatResponseProvider(from, identifier) {
            // check if a UI command is running/active
            if (!this._chatAccessAllowList.has(from)) {
                throw new Error('Extension is NOT allowed to make chat requests');
            }
            const that = this;
            return {
                get isRevoked() {
                    return !that._chatAccessAllowList.has(from);
                },
                async makeRequest(messages, options, progress, token) {
                    if (!that._chatAccessAllowList.has(from)) {
                        throw new Error('Access to chat has been revoked');
                    }
                    const requestId = (Math.random() * 1e6) | 0;
                    that._pendingRequest.set(requestId, progress);
                    try {
                        await that._proxy.$fetchResponse(from, identifier, requestId, messages.map(typeConvert.ChatMessage.from), options, token);
                    }
                    finally {
                        that._pendingRequest.delete(requestId);
                    }
                },
            };
        }
        async $handleResponseFragment(requestId, chunk) {
            this._pendingRequest.get(requestId)?.report(chunk);
        }
    }
    exports.ExtHostChatProvider = ExtHostChatProvider;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdENoYXRQcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvY29tbW9uL2V4dEhvc3RDaGF0UHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBaUJoRyxNQUFhLG1CQUFtQjtpQkFFaEIsWUFBTyxHQUFHLENBQUMsQUFBSixDQUFLO1FBSzNCLFlBQ0MsV0FBeUIsRUFDUixXQUF3QjtZQUF4QixnQkFBVyxHQUFYLFdBQVcsQ0FBYTtZQUp6QixlQUFVLEdBQUcsSUFBSSxHQUFHLEVBQXdCLENBQUM7WUFxQzlELDRCQUE0QjtZQUVYLG9CQUFlLEdBQUcsSUFBSSxHQUFHLEVBQXdELENBQUM7WUFFbEYseUJBQW9CLEdBQUcsSUFBSSxtQ0FBc0IsRUFBb0IsQ0FBQztZQW5DdEYsSUFBSSxDQUFDLE1BQU0sR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDLDhCQUFXLENBQUMsc0JBQXNCLENBQUMsQ0FBQztRQUN4RSxDQUFDO1FBRUQsZ0JBQWdCLENBQUMsU0FBOEIsRUFBRSxVQUFrQixFQUFFLFFBQXFDLEVBQUUsUUFBNkM7WUFFeEosTUFBTSxNQUFNLEdBQUcsbUJBQW1CLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDN0MsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDckQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxRQUFRLENBQUMsSUFBSSxJQUFJLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBRWhILE9BQU8sSUFBQSx3QkFBWSxFQUFDLEdBQUcsRUFBRTtnQkFDeEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxtQkFB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