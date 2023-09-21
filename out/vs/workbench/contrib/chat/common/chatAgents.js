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
    exports.ChatAgentService = exports.IChatAgentService = exports.agentsExtPoint = void 0;
    //#region extension point
    const agentItem = {
        type: 'object',
        required: ['agent', 'detail'],
        properties: {
            agent: {
                type: 'string',
                markdownDescription: (0, nls_1.localize)('agent', "The name of the agent which will be used as prefix.")
            },
            detail: {
                type: 'string',
                markdownDescription: (0, nls_1.localize)('details', "The details of the agent.")
            },
        }
    };
    const agentItems = {
        description: (0, nls_1.localize)('vscode.extension.contributes.slashes', "Contributes agents to chat"),
        oneOf: [
            agentItem,
            {
                type: 'array',
                items: agentItem
            }
        ]
    };
    exports.agentsExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
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
    exports.IChatAgentService = (0, instantiation_1.createDecorator)('chatAgentService');
    let ChatAgentService = class ChatAgentService extends lifecycle_1.Disposable {
        static { this.AGENT_LEADER = '@'; }
        constructor(_extensionService) {
            super();
            this._extensionService = _extensionService;
            this._agents = new Map();
            this._onDidChangeAgents = this._register(new event_1.Emitter());
            this.onDidChangeAgents = this._onDidChangeAgents.event;
        }
        dispose() {
            super.dispose();
            this._agents.clear();
        }
        registerAgentData(data) {
            if (this._agents.has(data.id)) {
                throw new Error(`Already registered an agent with id ${data.id}}`);
            }
            this._agents.set(data.id, { data });
            this._onDidChangeAgents.fire();
            return (0, lifecycle_1.toDisposable)(() => {
                if (this._agents.delete(data.id)) {
                    this._onDidChangeAgents.fire();
                }
            });
        }
        registerAgentCallback(id, agentCallback) {
            const data = this._agents.get(id);
            if (!data) {
                throw new Error(`No agent with id ${id} registered`);
            }
            data.callback = agentCallback;
            return (0, lifecycle_1.toDisposable)(() => data.callback = undefined);
        }
        registerAgent(data, callback) {
            return (0, lifecycle_1.combinedDisposable)(this.registerAgentData(data), this.registerAgentCallback(data.id, callback));
        }
        getAgents() {
            return Array.from(this._agents.values(), v => v.data);
        }
        hasAgent(id) {
            return this._agents.has(id);
        }
        async invokeAgent(id, prompt, progress, history, token) {
            const data = this._agents.get(id);
            if (!data) {
                throw new Error('No agent with id ${id} NOT registered');
            }
            if (!data.callback) {
                await this._extensionService.activateByEvent(`onChatAgent:${id}`);
            }
            if (!data.callback) {
                throw new Error(`No agent with id ${id} NOT resolved`);
            }
            return await data.callback(prompt, progress, history, token);
        }
    };
    exports.ChatAgentService = ChatAgentService;
    exports.ChatAgentService = ChatAgentService = __decorate([
        __param(0, extensions_1.IExtensionService)
    ], ChatAgentService);
    let ChatAgentContribution = class ChatAgentContribution {
        constructor(chatAgentService) {
            const contributions = new lifecycle_1.DisposableStore();
            exports.agentsExtPoint.setHandler(extensions => {
                contributions.clear();
                for (const entry of extensions) {
                    if (!(0, extensions_1.isProposedApiEnabled)(entry.description, 'chatAgents')) {
                        entry.collector.error(`The ${exports.agentsExtPoint.name} is proposed API`);
                        continue;
                    }
                    const { value } = entry;
                    for (const candidate of iterator_1.Iterable.wrap(value)) {
                        if (!isAgentData(candidate)) {
                            entry.collector.error((0, nls_1.localize)('invalid', "Invalid {0}: {1}", exports.agentsExtPoint.name, JSON.stringify(candidate)));
                            continue;
                        }
                        contributions.add(chatAgentService.registerAgentData({ ...candidate }));
                    }
                }
            });
        }
    };
    ChatAgentContribution = __decorate([
        __param(0, exports.IChatAgentService)
    ], ChatAgentContribution);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(ChatAgentContribution, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdEFnZW50cy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NoYXQvY29tbW9uL2NoYXRBZ2VudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBbUJoRyx5QkFBeUI7SUFFekIsTUFBTSxTQUFTLEdBQWdCO1FBQzlCLElBQUksRUFBRSxRQUFRO1FBQ2QsUUFBUSxFQUFFLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQztRQUM3QixVQUFVLEVBQUU7WUFDWCxLQUFLLEVBQUU7Z0JBQ04sSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsbUJBQW1CLEVBQUUsSUFBQSxjQUFRLEVBQUMsT0FBTyxFQUFFLHFEQUFxRCxDQUFDO2FBQzdGO1lBQ0QsTUFBTSxFQUFFO2dCQUNQLElBQUksRUFBRSxRQUFRO2dCQUNkLG1CQUFtQixFQUFFLElBQUEsY0FBUSxFQUFDLFNBQVMsRUFBRSwyQkFBMkIsQ0FBQzthQUNyRTtTQUNEO0tBQ0QsQ0FBQztJQUVGLE1BQU0sVUFBVSxHQUFnQjtRQUMvQixXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsc0NBQXNDLEVBQUUsNEJBQTRCLENBQUM7UUFDM0YsS0FBSyxFQUFFO1lBQ04sU0FBUztZQUNUO2dCQUNDLElBQUksRUFBRSxPQUFPO2dCQUNiLEtBQUssRUFBRSxTQUFTO2FBQ2hCO1NBQ0Q7S0FDRCxDQUFDO0lBRVcsUUFBQSxjQUFjLEdBQUcsdUNBQWtCLENBQUMsc0JBQXNCLENBQW9DO1FBQzFHLGNBQWMsRUFBRSxRQUFRO1FBQ3hCLFVBQVUsRUFBRSxVQUFVO0tBQ3RCLENBQUMsQ0FBQztJQVNILFNBQVMsV0FBVyxDQUFDLElBQVM7UUFDN0IsT0FBTyxPQUFPLElBQUksS0FBSyxRQUFRLElBQUksSUFBSTtZQUN0QyxPQUFPLElBQUksQ0FBQyxFQUFFLEtBQUssUUFBUTtZQUMzQixPQUFP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