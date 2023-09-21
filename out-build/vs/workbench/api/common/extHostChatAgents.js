/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/lifecycle", "vs/platform/progress/common/progress", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes"], function (require, exports, async_1, lifecycle_1, progress_1, extHost_protocol_1, typeConvert, extHostTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$_cc = void 0;
    class $_cc {
        static { this.a = 0; }
        constructor(mainContext, d, e) {
            this.d = d;
            this.e = e;
            this.b = new Map();
            this.c = mainContext.getProxy(extHost_protocol_1.$1J.MainThreadChatAgents);
        }
        registerAgent(extension, name, agent, metadata) {
            const handle = $_cc.a++;
            this.b.set(handle, { extension, agent });
            this.c.$registerAgent(handle, name, metadata);
            return (0, lifecycle_1.$ic)(() => {
                this.c.$unregisterAgent(handle);
                this.b.delete(handle);
            });
        }
        async $invokeAgent(handle, requestId, prompt, context, token) {
            const data = this.b.get(handle);
            if (!data) {
                this.e.warn(`[CHAT](${handle}) CANNOT invoke agent because the agent is not registered`);
                return;
            }
            let done = false;
            function throwIfDone() {
                if (done) {
                    throw new Error('Only valid while executing the command');
                }
            }
            const commandExecution = new async_1.$2g();
            token.onCancellationRequested(() => commandExecution.complete());
            setTimeout(() => commandExecution.complete(), 3 * 1000);
            this.d.allowListExtensionWhile(data.extension, commandExecution.p);
            const task = data.agent({ role: extHostTypes_1.ChatMessageRole.User, content: prompt }, { history: context.history.map(typeConvert.ChatMessage.to) }, new progress_1.$4u(p => {
                throwIfDone();
                this.c.$handleProgressChunk(requestId, { content: isInteractiveProgressFileTree(p.message) ? p.message : p.message.value });
            }), token);
            try {
                return await (0, async_1.$vg)(Promise.resolve(task).then((v) => {
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
    exports.$_cc = $_cc;
    function isInteractiveProgressFileTree(thing) {
        return !!thing && typeof thing === 'object' && 'treeData' in thing;
    }
});
//# sourceMappingURL=extHostChatAgents.js.map