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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/marshalling", "vs/platform/commands/common/commands", "vs/workbench/services/extensions/common/extHostCustomers", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/common/proxyIdentifier", "../common/extHost.protocol"], function (require, exports, lifecycle_1, marshalling_1, commands_1, extHostCustomers_1, extensions_1, proxyIdentifier_1, extHost_protocol_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ycb = void 0;
    let $ycb = class $ycb {
        constructor(extHostContext, d, e) {
            this.d = d;
            this.e = e;
            this.a = new lifecycle_1.$sc();
            this.c = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostCommands);
            this.b = commands_1.$Gr.registerCommand('_generateCommandsDocumentation', () => this.f());
        }
        dispose() {
            this.a.dispose();
            this.b.dispose();
        }
        async f() {
            const result = await this.c.$getContributedCommandHandlerDescriptions();
            // add local commands
            const commands = commands_1.$Gr.getCommands();
            for (const [id, command] of commands) {
                if (command.description) {
                    result[id] = command.description;
                }
            }
            // print all as markdown
            const all = [];
            for (const id in result) {
                all.push('`' + id + '` - ' + _generateMarkdown(result[id]));
            }
            console.log(all.join('\n'));
        }
        $registerCommand(id) {
            this.a.set(id, commands_1.$Gr.registerCommand(id, (accessor, ...args) => {
                return this.c.$executeContributedCommand(id, ...args).then(result => {
                    return (0, marshalling_1.$$g)(result);
                });
            }));
        }
        $unregisterCommand(id) {
            this.a.deleteAndDispose(id);
        }
        $fireCommandActivationEvent(id) {
            const activationEvent = `onCommand:${id}`;
            if (!this.e.activationEventIsDone(activationEvent)) {
                // this is NOT awaited because we only use it as drive-by-activation
                // for commands that are already known inside the extension host
                this.e.activateByEvent(activationEvent);
            }
        }
        async $executeCommand(id, args, retry) {
            if (args instanceof proxyIdentifier_1.$dA) {
                args = args.value;
            }
            for (let i = 0; i < args.length; i++) {
                args[i] = (0, marshalling_1.$$g)(args[i]);
            }
            if (retry && args.length > 0 && !commands_1.$Gr.getCommand(id)) {
                await this.e.activateByEvent(`onCommand:${id}`);
                throw new Error('$executeCommand:retry');
            }
            return this.d.executeCommand(id, ...args);
        }
        $getCommands() {
            return Promise.resolve([...commands_1.$Gr.getCommands().keys()]);
        }
    };
    exports.$ycb = $ycb;
    exports.$ycb = $ycb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadCommands),
        __param(1, commands_1.$Fr),
        __param(2, extensions_1.$MF)
    ], $ycb);
    // --- command doc
    function _generateMarkdown(description) {
        if (typeof description === 'string') {
            return description;
        }
        else {
            const parts = [description.description];
            parts.push('\n\n');
            if (description.args) {
                for (const arg of description.args) {
                    parts.push(`* _${arg.name}_ - ${arg.description || ''}\n`);
                }
            }
            if (description.returns) {
                parts.push(`* _(returns)_ - ${description.returns}`);
            }
            parts.push('\n\n');
            return parts.join('');
        }
    }
});
//# sourceMappingURL=mainThreadCommands.js.map