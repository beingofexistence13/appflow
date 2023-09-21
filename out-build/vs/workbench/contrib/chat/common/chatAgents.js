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
define(["require", "exports", "vs/base/common/event", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/nls!vs/workbench/contrib/chat/common/chatAgents", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/common/extensionsRegistry"], function (require, exports, event_1, iterator_1, lifecycle_1, nls_1, instantiation_1, platform_1, contributions_1, extensions_1, extensionsRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$sH = exports.$rH = exports.$qH = void 0;
    //#region extension point
    const agentItem = {
        type: 'object',
        required: ['agent', 'detail'],
        properties: {
            agent: {
                type: 'string',
                markdownDescription: (0, nls_1.localize)(0, null)
            },
            detail: {
                type: 'string',
                markdownDescription: (0, nls_1.localize)(1, null)
            },
        }
    };
    const agentItems = {
        description: (0, nls_1.localize)(2, null),
        oneOf: [
            agentItem,
            {
                type: 'array',
                items: agentItem
            }
        ]
    };
    exports.$qH = extensionsRegistry_1.$2F.registerExtensionPoint({
        extensionPoint: 'agents',
        jsonSchema: agentItems
    });
    function isAgentData(data) {
        return typeof data === 'object' && data &&
            typeof data.id === 'string' &&
            typeof data.detail === 'string';
        // (typeof data.sortText === 'undefined' || typeof data.sortText === 'string') &&
        // (typeof data.executeImmediately === 'undefined' || typeof data.executeImmediately === 'boolean');
    }
    exports.$rH = (0, instantiation_1.$Bh)('chatAgentService');
    let $sH = class $sH extends lifecycle_1.$kc {
        static { this.AGENT_LEADER = '@'; }
        constructor(c) {
            super();
            this.c = c;
            this.a = new Map();
            this.b = this.B(new event_1.$fd());
            this.onDidChangeAgents = this.b.event;
        }
        dispose() {
            super.dispose();
            this.a.clear();
        }
        registerAgentData(data) {
            if (this.a.has(data.id)) {
                throw new Error(`Already registered an agent with id ${data.id}}`);
            }
            this.a.set(data.id, { data });
            this.b.fire();
            return (0, lifecycle_1.$ic)(() => {
                if (this.a.delete(data.id)) {
                    this.b.fire();
                }
            });
        }
        registerAgentCallback(id, agentCallback) {
            const data = this.a.get(id);
            if (!data) {
                throw new Error(`No agent with id ${id} registered`);
            }
            data.callback = agentCallback;
            return (0, lifecycle_1.$ic)(() => data.callback = undefined);
        }
        registerAgent(data, callback) {
            return (0, lifecycle_1.$hc)(this.registerAgentData(data), this.registerAgentCallback(data.id, callback));
        }
        getAgents() {
            return Array.from(this.a.values(), v => v.data);
        }
        hasAgent(id) {
            return this.a.has(id);
        }
        async invokeAgent(id, prompt, progress, history, token) {
            const data = this.a.get(id);
            if (!data) {
                throw new Error('No agent with id ${id} NOT registered');
            }
            if (!data.callback) {
                await this.c.activateByEvent(`onChatAgent:${id}`);
            }
            if (!data.callback) {
                throw new Error(`No agent with id ${id} NOT resolved`);
            }
            return await data.callback(prompt, progress, history, token);
        }
    };
    exports.$sH = $sH;
    exports.$sH = $sH = __decorate([
        __param(0, extensions_1.$MF)
    ], $sH);
    let ChatAgentContribution = class ChatAgentContribution {
        constructor(chatAgentService) {
            const contributions = new lifecycle_1.$jc();
            exports.$qH.setHandler(extensions => {
                contributions.clear();
                for (const entry of extensions) {
                    if (!(0, extensions_1.$PF)(entry.description, 'chatAgents')) {
                        entry.collector.error(`The ${exports.$qH.name} is proposed API`);
                        continue;
                    }
                    const { value } = entry;
                    for (const candidate of iterator_1.Iterable.wrap(value)) {
                        if (!isAgentData(candidate)) {
                            entry.collector.error((0, nls_1.localize)(3, null, exports.$qH.name, JSON.stringify(candidate)));
                            continue;
                        }
                        contributions.add(chatAgentService.registerAgentData({ ...candidate }));
                    }
                }
            });
        }
    };
    ChatAgentContribution = __decorate([
        __param(0, exports.$rH)
    ], ChatAgentContribution);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(ChatAgentContribution, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=chatAgents.js.map