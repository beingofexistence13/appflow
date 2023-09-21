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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/marshalling", "vs/workbench/api/common/extHost.protocol", "vs/workbench/contrib/chat/common/chatAgents", "vs/workbench/services/extensions/common/extHostCustomers"], function (require, exports, lifecycle_1, marshalling_1, extHost_protocol_1, chatAgents_1, extHostCustomers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadChatAgents = void 0;
    let MainThreadChatAgents = class MainThreadChatAgents {
        constructor(extHostContext, _chatAgentService) {
            this._chatAgentService = _chatAgentService;
            this._agents = new lifecycle_1.DisposableMap;
            this._pendingProgress = new Map();
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostChatAgents);
        }
        $unregisterAgent(handle) {
            this._agents.deleteAndDispose(handle);
        }
        dispose() {
            this._agents.clearAndDisposeAll();
        }
        $registerAgent(handle, name, metadata) {
            if (!this._chatAgentService.hasAgent(name)) {
                // dynamic!
                this._chatAgentService.registerAgentData({
                    id: name,
                    metadata: (0, marshalling_1.revive)(metadata)
                });
            }
            const d = this._chatAgentService.registerAgentCallback(name, async (prompt, progress, history, token) => {
                const requestId = Math.random();
                this._pendingProgress.set(requestId, progress);
                try {
                    return await this._proxy.$invokeAgent(handle, requestId, prompt, { history }, token);
                }
                finally {
                    this._pendingProgress.delete(requestId);
                }
            });
            this._agents.set(handle, d);
        }
        async $handleProgressChunk(requestId, chunk) {
            this._pendingProgress.get(requestId)?.report((0, marshalling_1.revive)(chunk));
        }
        $unregisterCommand(handle) {
            this._agents.deleteAndDispose(handle);
        }
    };
    exports.MainThreadChatAgents = MainThreadChatAgents;
    exports.MainThreadChatAgents = MainThreadChatAgents = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadChatAgents),
        __param(1, chatAgents_1.IChatAgentService)
    ], MainThreadChatAgents);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZENoYXRBZ2VudHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2Jyb3dzZXIvbWFpblRocmVhZENoYXRBZ2VudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBWXpGLElBQU0sb0JBQW9CLEdBQTFCLE1BQU0sb0JBQW9CO1FBTWhDLFlBQ0MsY0FBK0IsRUFDWixpQkFBcUQ7WUFBcEMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFtQjtZQU54RCxZQUFPLEdBQUcsSUFBSSx5QkFBcUIsQ0FBQztZQUNwQyxxQkFBZ0IsR0FBRyxJQUFJLEdBQUcsRUFBeUMsQ0FBQztZQU9wRixJQUFJLENBQUMsTUFBTSxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsaUNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3pFLENBQUM7UUFFRCxnQkFBZ0IsQ0FBQyxNQUFjO1lBQzlCLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdkMsQ0FBQztRQUVELE9BQU87WUFDTixJQUFJLENBQUMsT0FBTyxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDbkMsQ0FBQztRQUVELGNBQWMsQ0FBQyxNQUFjLEVBQUUsSUFBWSxFQUFFLFFBQTRCO1lBQ3hFLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUMzQyxXQUFXO2dCQUNYLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQztvQkFDeEMsRUFBRSxFQUFFLElBQUk7b0JBQ1IsUUFBUSxFQUFFLElBQUEsb0JBQU0sRUFBQyxRQUFRLENBQUM7aUJBQzFCLENBQUMsQ0FBQzthQUNIO1lBRUQsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUU7Z0JBQ3ZHLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDaEMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQy9DLElBQUk7b0JBQ0gsT0FBTyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLEVBQUUsT0FBTyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7aUJBQ3JGO3dCQUFTO29CQUNULElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7aUJBQ3hDO1lBQ0YsQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDN0IsQ0FBQztRQUVELEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxTQUFpQixFQUFFLEtBQXlCO1lBQ3RFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUEsb0JBQU0sRUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQzdELENBQUM7UUFFRCxrQkFBa0IsQ0FBQyxNQUFjO1lBQ2hDLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdkMsQ0FBQztLQUNELENBQUE7SUFqRFksb0RBQW9CO21DQUFwQixvQkFBb0I7UUFEaEMsSUFBQSx1Q0FBb0IsRUFBQyw4QkFBVyxDQUFDLG9CQUFvQixDQUFDO1FBU3BELFdBQUEsOEJBQWlCLENBQUE7T0FSUCxvQkFBb0IsQ0FpRGhDIn0=