/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostTypes", "vs/workbench/api/common/extHostTypeConverters", "vs/platform/progress/common/progress", "vs/base/common/async"], function (require, exports, lifecycle_1, extHost_protocol_1, extHostTypes_1, typeConvert, progress_1, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostChatSlashCommands = void 0;
    class ExtHostChatSlashCommands {
        static { this._idPool = 0; }
        constructor(mainContext, _extHostChatProvider, _logService) {
            this._extHostChatProvider = _extHostChatProvider;
            this._logService = _logService;
            this._commands = new Map();
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadChatSlashCommands);
        }
        registerCommand(extension, name, command, metadata) {
            const handle = ExtHostChatSlashCommands._idPool++;
            this._commands.set(handle, { extension, command });
            this._proxy.$registerCommand(handle, name, metadata.description);
            return (0, lifecycle_1.toDisposable)(() => {
                this._proxy.$unregisterCommand(handle);
                this._commands.delete(handle);
            });
        }
        async $executeCommand(handle, requestId, prompt, context, token) {
            const data = this._commands.get(handle);
            if (!data) {
                this._logService.warn(`[CHAT](${handle}) CANNOT execute command because the command is not registered`);
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
            const task = data.command({ role: extHostTypes_1.ChatMessageRole.User, content: prompt }, { history: context.history.map(typeConvert.ChatMessage.to) }, new progress_1.Progress(p => {
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
    exports.ExtHostChatSlashCommands = ExtHostChatSlashCommands;
    function isInteractiveProgressFileTree(thing) {
        return !!thing && typeof thing === 'object' && 'treeData' in thing;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdENoYXRTbGFzaENvbW1hbmQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2NvbW1vbi9leHRIb3N0Q2hhdFNsYXNoQ29tbWFuZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFlaEcsTUFBYSx3QkFBd0I7aUJBRXJCLFlBQU8sR0FBRyxDQUFDLEFBQUosQ0FBSztRQUszQixZQUNDLFdBQXlCLEVBQ1Isb0JBQXlDLEVBQ3pDLFdBQXdCO1lBRHhCLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBcUI7WUFDekMsZ0JBQVcsR0FBWCxXQUFXLENBQWE7WUFOekIsY0FBUyxHQUFHLElBQUksR0FBRyxFQUE0RSxDQUFDO1lBUWhILElBQUksQ0FBQyxNQUFNLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyw4QkFBVyxDQUFDLDJCQUEyQixDQUFDLENBQUM7UUFDN0UsQ0FBQztRQUVELGVBQWUsQ0FBQyxTQUE4QixFQUFFLElBQVksRUFBRSxPQUE0QixFQUFFLFFBQXFDO1lBRWhJLE1BQU0sTUFBTSxHQUFHLHdCQUF3QixDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2xELElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ25ELElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7WUFFakUsT0FBTyxJQUFBLHdCQUFZLEVBQUMsR0FBRyxFQUFFO2dCQUN4QixJQUFJLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUN2QyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMvQixDQUFDLENBQUMsQ0FB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