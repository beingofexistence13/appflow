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
define(["require", "exports", "vs/base/common/event", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/nls", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/common/extensionsRegistry"], function (require, exports, event_1, iterator_1, lifecycle_1, nls_1, instantiation_1, platform_1, contributions_1, extensions_1, extensionsRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ChatSlashCommandService = exports.IChatSlashCommandService = exports.slashesExtPoint = void 0;
    //#region extension point
    const slashItem = {
        type: 'object',
        required: ['command', 'detail'],
        properties: {
            command: {
                type: 'string',
                markdownDescription: (0, nls_1.localize)('command', "The name of the slash command which will be used as prefix.")
            },
            detail: {
                type: 'string',
                markdownDescription: (0, nls_1.localize)('details', "The details of the slash command.")
            },
        }
    };
    const slashItems = {
        description: (0, nls_1.localize)('vscode.extension.contributes.slashes', "Contributes slash commands to chat"),
        oneOf: [
            slashItem,
            {
                type: 'array',
                items: slashItem
            }
        ]
    };
    exports.slashesExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'slashes',
        jsonSchema: slashItems
    });
    function isChatSlashData(data) {
        return typeof data === 'object' && data &&
            typeof data.command === 'string' &&
            typeof data.detail === 'string' &&
            (typeof data.sortText === 'undefined' || typeof data.sortText === 'string') &&
            (typeof data.executeImmediately === 'undefined' || typeof data.executeImmediately === 'boolean');
    }
    exports.IChatSlashCommandService = (0, instantiation_1.createDecorator)('chatSlashCommandService');
    let ChatSlashCommandService = class ChatSlashCommandService extends lifecycle_1.Disposable {
        constructor(_extensionService) {
            super();
            this._extensionService = _extensionService;
            this._commands = new Map();
            this._onDidChangeCommands = this._register(new event_1.Emitter());
            this.onDidChangeCommands = this._onDidChangeCommands.event;
        }
        dispose() {
            super.dispose();
            this._commands.clear();
        }
        registerSlashData(data) {
            if (this._commands.has(data.command)) {
                throw new Error(`Already registered a command with id ${data.command}}`);
            }
            this._commands.set(data.command, { data });
            this._onDidChangeCommands.fire();
            return (0, lifecycle_1.toDisposable)(() => {
                if (this._commands.delete(data.command)) {
                    this._onDidChangeCommands.fire();
                }
            });
        }
        registerSlashCallback(id, command) {
            const data = this._commands.get(id);
            if (!data) {
                throw new Error(`No command with id ${id} registered`);
            }
            data.command = command;
            return (0, lifecycle_1.toDisposable)(() => data.command = undefined);
        }
        registerSlashCommand(data, command) {
            return (0, lifecycle_1.combinedDisposable)(this.registerSlashData(data), this.registerSlashCallback(data.command, command));
        }
        getCommands() {
            return Array.from(this._commands.values(), v => v.data);
        }
        hasCommand(id) {
            return this._commands.has(id);
        }
        async executeCommand(id, prompt, progress, history, token) {
            const data = this._commands.get(id);
            if (!data) {
                throw new Error('No command with id ${id} NOT registered');
            }
            if (!data.command) {
                await this._extensionService.activateByEvent(`onSlash:${id}`);
            }
            if (!data.command) {
                throw new Error(`No command with id ${id} NOT resolved`);
            }
            return await data.command(prompt, progress, history, token);
        }
    };
    exports.ChatSlashCommandService = ChatSlashCommandService;
    exports.ChatSlashCommandService = ChatSlashCommandService = __decorate([
        __param(0, extensions_1.IExtensionService)
    ], ChatSlashCommandService);
    let ChatSlashCommandContribution = class ChatSlashCommandContribution {
        constructor(slashCommandService) {
            const contributions = new lifecycle_1.DisposableStore();
            exports.slashesExtPoint.setHandler(extensions => {
                contributions.clear();
                for (const entry of extensions) {
                    if (!(0, extensions_1.isProposedApiEnabled)(entry.description, 'chatSlashCommands')) {
                        entry.collector.error(`The ${exports.slashesExtPoint.name} is proposed API`);
                        continue;
                    }
                    const { value } = entry;
                    for (const candidate of iterator_1.Iterable.wrap(value)) {
                        if (!isChatSlashData(candidate)) {
                            entry.collector.error((0, nls_1.localize)('invalid', "Invalid {0}: {1}", exports.slashesExtPoint.name, JSON.stringify(candidate)));
                            continue;
                        }
                        contributions.add(slashCommandService.registerSlashData({ ...candidate }));
                    }
                }
            });
        }
    };
    ChatSlashCommandContribution = __decorate([
        __param(0, exports.IChatSlashCommandService)
    ], ChatSlashCommandContribution);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(ChatSlashCommandContribution, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdFNsYXNoQ29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jaGF0L2NvbW1vbi9jaGF0U2xhc2hDb21tYW5kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFrQmhHLHlCQUF5QjtJQUV6QixNQUFNLFNBQVMsR0FBZ0I7UUFDOUIsSUFBSSxFQUFFLFFBQVE7UUFDZCxRQUFRLEVBQUUsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDO1FBQy9CLFVBQVUsRUFBRTtZQUNYLE9BQU8sRUFBRTtnQkFDUixJQUFJLEVBQUUsUUFBUTtnQkFDZCxtQkFBbUIsRUFBRSxJQUFBLGNBQVEsRUFBQyxTQUFTLEVBQUUsNkRBQTZELENBQUM7YUFDdkc7WUFDRCxNQUFNLEVBQUU7Z0JBQ1AsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsbUJBQW1CLEVBQUUsSUFBQSxjQUFRLEVBQUMsU0FBUyxFQUFFLG1DQUFtQyxDQUFDO2FBQzdFO1NBQ0Q7S0FDRCxDQUFDO0lBRUYsTUFBTSxVQUFVLEdBQWdCO1FBQy9CLFdBQVcsRUFBRSxJQUFBLGNBQVEsRUFBQyxzQ0FBc0MsRUFBRSxvQ0FBb0MsQ0FBQztRQUNuRyxLQUFLLEVBQUU7WUFDTixTQUFTO1lBQ1Q7Z0JBQ0MsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsS0FBSyxFQUFFLFNBQVM7YUFDaEI7U0FDRDtLQUNELENBQUM7SUFFVyxRQUFBLGVBQWUsR0FBRyx1Q0FBa0IsQ0FBQyxzQkFBc0IsQ0FBb0M7UUFDM0csY0FBYyxFQUFFLFNBQVM7UUFDekIsVUFBVSxFQUFFLFVBQVU7S0FDdEIsQ0FBQyxDQUFDO0lBZ0JILFNBQVMsZUFBZSxDQUFDLElBQVM7UUFDakMsT0FBTyxPQUFPLElBQUksS0FBSyxRQUFRLElBQUksSUFBSTtZQUN0QyxPQUFPLElBQUksQ0FBQyxPQUFPLEtBQUss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