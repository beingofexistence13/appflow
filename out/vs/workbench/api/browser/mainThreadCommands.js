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
    exports.MainThreadCommands = void 0;
    let MainThreadCommands = class MainThreadCommands {
        constructor(extHostContext, _commandService, _extensionService) {
            this._commandService = _commandService;
            this._extensionService = _extensionService;
            this._commandRegistrations = new lifecycle_1.DisposableMap();
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostCommands);
            this._generateCommandsDocumentationRegistration = commands_1.CommandsRegistry.registerCommand('_generateCommandsDocumentation', () => this._generateCommandsDocumentation());
        }
        dispose() {
            this._commandRegistrations.dispose();
            this._generateCommandsDocumentationRegistration.dispose();
        }
        async _generateCommandsDocumentation() {
            const result = await this._proxy.$getContributedCommandHandlerDescriptions();
            // add local commands
            const commands = commands_1.CommandsRegistry.getCommands();
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
            this._commandRegistrations.set(id, commands_1.CommandsRegistry.registerCommand(id, (accessor, ...args) => {
                return this._proxy.$executeContributedCommand(id, ...args).then(result => {
                    return (0, marshalling_1.revive)(result);
                });
            }));
        }
        $unregisterCommand(id) {
            this._commandRegistrations.deleteAndDispose(id);
        }
        $fireCommandActivationEvent(id) {
            const activationEvent = `onCommand:${id}`;
            if (!this._extensionService.activationEventIsDone(activationEvent)) {
                // this is NOT awaited because we only use it as drive-by-activation
                // for commands that are already known inside the extension host
                this._extensionService.activateByEvent(activationEvent);
            }
        }
        async $executeCommand(id, args, retry) {
            if (args instanceof proxyIdentifier_1.SerializableObjectWithBuffers) {
                args = args.value;
            }
            for (let i = 0; i < args.length; i++) {
                args[i] = (0, marshalling_1.revive)(args[i]);
            }
            if (retry && args.length > 0 && !commands_1.CommandsRegistry.getCommand(id)) {
                await this._extensionService.activateByEvent(`onCommand:${id}`);
                throw new Error('$executeCommand:retry');
            }
            return this._commandService.executeCommand(id, ...args);
        }
        $getCommands() {
            return Promise.resolve([...commands_1.CommandsRegistry.getCommands().keys()]);
        }
    };
    exports.MainThreadCommands = MainThreadCommands;
    exports.MainThreadCommands = MainThreadCommands = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadCommands),
        __param(1, commands_1.ICommandService),
        __param(2, extensions_1.IExtensionService)
    ], MainThreadCommands);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZENvbW1hbmRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9icm93c2VyL21haW5UaHJlYWRDb21tYW5kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFZekYsSUFBTSxrQkFBa0IsR0FBeEIsTUFBTSxrQkFBa0I7UUFNOUIsWUFDQyxjQUErQixFQUNkLGVBQWlELEVBQy9DLGlCQUFxRDtZQUR0QyxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7WUFDOUIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFtQjtZQVB4RCwwQkFBcUIsR0FBRyxJQUFJLHlCQUFhLEVBQVUsQ0FBQztZQVNwRSxJQUFJLENBQUMsTUFBTSxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsaUNBQWMsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUV0RSxJQUFJLENBQUMsMENBQTBDLEdBQUcsMkJBQWdCLENBQUMsZUFBZSxDQUFDLGdDQUFnQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsRUFBRSxDQUFDLENBQUM7UUFDbkssQ0FBQztRQUVELE9BQU87WUFDTixJQUFJLENBQUMscUJBQXFCLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDckMsSUFBSSxDQUFDLDBDQUEwQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzNELENBQUM7UUFFTyxLQUFLLENBQUMsOEJBQThCO1lBQzNDLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyx5Q0FBeUMsRUFBRSxDQUFDO1lBRTdFLHFCQUFxQjtZQUNyQixNQUFNLFFBQVEsR0FBRywyQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNoRCxLQUFLLE1BQU0sQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLElBQUksUUFBUSxFQUFFO2dCQUNyQyxJQUFJLE9BQU8sQ0FBQyxX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