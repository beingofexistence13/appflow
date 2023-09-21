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
define(["require", "exports", "vs/base/common/event", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/nls!vs/workbench/contrib/chat/common/chatSlashCommands", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/common/extensionsRegistry"], function (require, exports, event_1, iterator_1, lifecycle_1, nls_1, instantiation_1, platform_1, contributions_1, extensions_1, extensionsRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$XJ = exports.$WJ = exports.$VJ = void 0;
    //#region extension point
    const slashItem = {
        type: 'object',
        required: ['command', 'detail'],
        properties: {
            command: {
                type: 'string',
                markdownDescription: (0, nls_1.localize)(0, null)
            },
            detail: {
                type: 'string',
                markdownDescription: (0, nls_1.localize)(1, null)
            },
        }
    };
    const slashItems = {
        description: (0, nls_1.localize)(2, null),
        oneOf: [
            slashItem,
            {
                type: 'array',
                items: slashItem
            }
        ]
    };
    exports.$VJ = extensionsRegistry_1.$2F.registerExtensionPoint({
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
    exports.$WJ = (0, instantiation_1.$Bh)('chatSlashCommandService');
    let $XJ = class $XJ extends lifecycle_1.$kc {
        constructor(c) {
            super();
            this.c = c;
            this.a = new Map();
            this.b = this.B(new event_1.$fd());
            this.onDidChangeCommands = this.b.event;
        }
        dispose() {
            super.dispose();
            this.a.clear();
        }
        registerSlashData(data) {
            if (this.a.has(data.command)) {
                throw new Error(`Already registered a command with id ${data.command}}`);
            }
            this.a.set(data.command, { data });
            this.b.fire();
            return (0, lifecycle_1.$ic)(() => {
                if (this.a.delete(data.command)) {
                    this.b.fire();
                }
            });
        }
        registerSlashCallback(id, command) {
            const data = this.a.get(id);
            if (!data) {
                throw new Error(`No command with id ${id} registered`);
            }
            data.command = command;
            return (0, lifecycle_1.$ic)(() => data.command = undefined);
        }
        registerSlashCommand(data, command) {
            return (0, lifecycle_1.$hc)(this.registerSlashData(data), this.registerSlashCallback(data.command, command));
        }
        getCommands() {
            return Array.from(this.a.values(), v => v.data);
        }
        hasCommand(id) {
            return this.a.has(id);
        }
        async executeCommand(id, prompt, progress, history, token) {
            const data = this.a.get(id);
            if (!data) {
                throw new Error('No command with id ${id} NOT registered');
            }
            if (!data.command) {
                await this.c.activateByEvent(`onSlash:${id}`);
            }
            if (!data.command) {
                throw new Error(`No command with id ${id} NOT resolved`);
            }
            return await data.command(prompt, progress, history, token);
        }
    };
    exports.$XJ = $XJ;
    exports.$XJ = $XJ = __decorate([
        __param(0, extensions_1.$MF)
    ], $XJ);
    let ChatSlashCommandContribution = class ChatSlashCommandContribution {
        constructor(slashCommandService) {
            const contributions = new lifecycle_1.$jc();
            exports.$VJ.setHandler(extensions => {
                contributions.clear();
                for (const entry of extensions) {
                    if (!(0, extensions_1.$PF)(entry.description, 'chatSlashCommands')) {
                        entry.collector.error(`The ${exports.$VJ.name} is proposed API`);
                        continue;
                    }
                    const { value } = entry;
                    for (const candidate of iterator_1.Iterable.wrap(value)) {
                        if (!isChatSlashData(candidate)) {
                            entry.collector.error((0, nls_1.localize)(3, null, exports.$VJ.name, JSON.stringify(candidate)));
                            continue;
                        }
                        contributions.add(slashCommandService.registerSlashData({ ...candidate }));
                    }
                }
            });
        }
    };
    ChatSlashCommandContribution = __decorate([
        __param(0, exports.$WJ)
    ], ChatSlashCommandContribution);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(ChatSlashCommandContribution, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=chatSlashCommands.js.map