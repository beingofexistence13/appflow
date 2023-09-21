/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostTypes", "vs/workbench/api/common/extHostTypeConverters", "vs/platform/progress/common/progress", "vs/base/common/async"], function (require, exports, lifecycle_1, extHost_protocol_1, extHostTypes_1, typeConvert, progress_1, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$8cc = void 0;
    class $8cc {
        static { this.a = 0; }
        constructor(mainContext, d, e) {
            this.d = d;
            this.e = e;
            this.b = new Map();
            this.c = mainContext.getProxy(extHost_protocol_1.$1J.MainThreadChatSlashCommands);
        }
        registerCommand(extension, name, command, metadata) {
            const handle = $8cc.a++;
            this.b.set(handle, { extension, command });
            this.c.$registerCommand(handle, name, metadata.description);
            return (0, lifecycle_1.$ic)(() => {
                this.c.$unregisterCommand(handle);
                this.b.delete(handle);
            });
        }
        async $executeCommand(handle, requestId, prompt, context, token) {
            const data = this.b.get(handle);
            if (!data) {
                this.e.warn(`[CHAT](${handle}) CANNOT execute command because the command is not registered`);
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
            const task = data.command({ role: extHostTypes_1.ChatMessageRole.User, content: prompt }, { history: context.history.map(typeConvert.ChatMessage.to) }, new progress_1.$4u(p => {
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
    exports.$8cc = $8cc;
    function isInteractiveProgressFileTree(thing) {
        return !!thing && typeof thing === 'object' && 'treeData' in thing;
    }
});
//# sourceMappingURL=extHostChatSlashCommand.js.map