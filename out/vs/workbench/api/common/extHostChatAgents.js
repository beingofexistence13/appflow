/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/lifecycle", "vs/platform/progress/common/progress", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes"], function (require, exports, async_1, lifecycle_1, progress_1, extHost_protocol_1, typeConvert, extHostTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostChatAgents = void 0;
    class ExtHostChatAgents {
        static { this._idPool = 0; }
        constructor(mainContext, _extHostChatProvider, _logService) {
            this._extHostChatProvider = _extHostChatProvider;
            this._logService = _logService;
            this._agents = new Map();
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadChatAgents);
        }
        registerAgent(extension, name, agent, metadata) {
            const handle = ExtHostChatAgents._idPool++;
            this._agents.set(handle, { extension, agent });
            this._proxy.$registerAgent(handle, name, metadata);
            return (0, lifecycle_1.toDisposable)(() => {
                this._proxy.$unregisterAgent(handle);
                this._agents.delete(handle);
            });
        }
        async $invokeAgent(handle, requestId, prompt, context, token) {
            const data = this._agents.get(handle);
            if (!data) {
                this._logService.warn(`[CHAT](${handle}) CANNOT invoke agent because the agent is not registered`);
                return;
            }
            let done = false;
            function throwIfDone() {
                if (done) {
                    throw new Error('Only valid while executing the command');
                }
            }
            const commandExecution = new async_1.DeferredPromise();
            token.onCancellationRequested(() => commandExecution.complete());
            setTimeout(() => commandExecution.complete(), 3 * 1000);
            this._extHostChatProvider.allowListExtensionWhile(data.extension, commandExecution.p);
            const task = data.agent({ role: extHostTypes_1.ChatMessageRole.User, content: prompt }, { history: context.history.map(typeConvert.ChatMessage.to) }, new progress_1.Progress(p => {
                throwIfDone();
                this._proxy.$handleProgressChunk(requestId, { content: isInteractiveProgressFileTree(p.message) ? p.message : p.message.value });
            }), token);
            try {
                return await (0, async_1.raceCancellation)(Promise.resolve(task).then((v) => {
                    if (v && 'followUp' in v) {
                        const convertedFollowup = v?.followUp?.map(f => typeConvert.ChatFollowup.from(f));
                        return { followUp: convertedFollowup };
                    }
                    return undefined;
                }), token);
            }
            finally {
                done = true;
                commandExecution.complete();
            }
        }
    }
    exports.ExtHostChatAgents = ExtHostChatAgents;
    function isInteractiveProgressFileTree(thing) {
        return !!thing && typeof thing === 'object' && 'treeData' in thing;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdENoYXRBZ2VudHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2NvbW1vbi9leHRIb3N0Q2hhdEFnZW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFlaEcsTUFBYSxpQkFBaUI7aUJBRWQsWUFBTyxHQUFHLENBQUMsQUFBSixDQUFLO1FBSzNCLFlBQ0MsV0FBeUIsRUFDUixvQkFBeUMsRUFDekMsV0FBd0I7WUFEeEIseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFxQjtZQUN6QyxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtZQU56QixZQUFPLEdBQUcsSUFBSSxHQUFHLEVBQXVFLENBQUM7WUFRekcsSUFBSSxDQUFDLE1BQU0sR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDLDhCQUFXLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUN0RSxDQUFDO1FBRUQsYUFBYSxDQUFDLFNBQThCLEVBQUUsSUFBWSxFQUFFLEtBQXVCLEVBQUUsUUFBa0M7WUFDdEgsTUFBTSxNQUFNLEdBQUcsaUJBQWlCLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDM0MsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDL0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztZQUVuRCxPQUFPLElBQUEsd0JBQVksRUFBQyxHQUFHLEVBQUU7Z0JBQ3hCLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3JDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzdCLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELEtBQUssQ0FB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