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
define(["require", "exports", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/editor/browser/services/codeEditorService", "vs/editor/common/core/range", "vs/editor/common/core/wordHelper", "vs/editor/common/services/languageFeatures", "vs/nls!vs/workbench/contrib/chat/browser/contrib/chatInputEditorContrib", "vs/platform/configuration/common/configuration", "vs/platform/registry/common/platform", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/common/contributions", "vs/workbench/contrib/chat/browser/actions/chatExecuteActions", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/browser/chatInputPart", "vs/workbench/contrib/chat/browser/chatWidget", "vs/workbench/contrib/chat/common/chatAgents", "vs/workbench/contrib/chat/common/chatColors", "vs/workbench/contrib/chat/common/chatService", "vs/workbench/contrib/chat/common/chatVariables", "vs/workbench/contrib/chat/common/chatViewModel"], function (require, exports, iterator_1, lifecycle_1, codeEditorService_1, range_1, wordHelper_1, languageFeatures_1, nls_1, configuration_1, platform_1, colorRegistry_1, themeService_1, contributions_1, chatExecuteActions_1, chat_1, chatInputPart_1, chatWidget_1, chatAgents_1, chatColors_1, chatService_1, chatVariables_1, chatViewModel_1) {
    "use strict";
    var VariableCompletions_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    const decorationDescription = 'chat';
    const placeholderDecorationType = 'chat-session-detail';
    const slashCommandTextDecorationType = 'chat-session-text';
    const variableTextDecorationType = 'chat-variable-text';
    let InputEditorDecorations = class InputEditorDecorations extends lifecycle_1.$kc {
        constructor(f, g, j, m, n, r) {
            super();
            this.f = f;
            this.g = g;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.b = new Set();
            this.g.registerDecorationType(decorationDescription, placeholderDecorationType, {});
            this.B(this.j.onDidColorThemeChange(() => this.s()));
            this.s();
            this.u();
            this.B(this.f.inputEditor.onDidChangeModelContent(() => this.u()));
            this.B(this.f.onDidChangeViewModel(() => {
                this.b.clear();
                this.u();
            }));
            this.B(this.m.onDidSubmitSlashCommand((e) => {
                if (e.sessionId === this.f.viewModel?.sessionId && !this.b.has(e.slashCommand)) {
                    this.b.add(e.slashCommand);
                }
            }));
        }
        s() {
            this.g.removeDecorationType(variableTextDecorationType);
            this.g.removeDecorationType(slashCommandTextDecorationType);
            const theme = this.j.getColorTheme();
            this.g.registerDecorationType(decorationDescription, slashCommandTextDecorationType, {
                color: theme.getColor(chatColors_1.$XIb)?.toString(),
                backgroundColor: theme.getColor(chatColors_1.$WIb)?.toString()
            });
            this.g.registerDecorationType(decorationDescription, variableTextDecorationType, {
                color: theme.getColor(chatColors_1.$XIb)?.toString(),
                backgroundColor: theme.getColor(chatColors_1.$WIb)?.toString(),
                borderRadius: '3px'
            });
            this.u();
        }
        t() {
            const theme = this.j.getColorTheme();
            const transparentForeground = theme.getColor(colorRegistry_1.$Tv);
            return transparentForeground?.toString();
        }
        async u() {
            const inputValue = this.f.inputEditor.getValue();
            const slashCommands = await this.f.getSlashCommands(); // TODO this async call can lead to a flicker of the placeholder text when switching editor tabs
            const agents = this.r.getAgents();
            if (!inputValue) {
                const extensionPlaceholder = this.f.viewModel?.inputPlaceholder;
                const defaultPlaceholder = slashCommands?.length ?
                    (0, nls_1.localize)(0, null) :
                    (0, nls_1.localize)(1, null);
                const placeholder = extensionPlaceholder ?? defaultPlaceholder;
                const decoration = [
                    {
                        range: {
                            startLineNumber: 1,
                            endLineNumber: 1,
                            startColumn: 1,
                            endColumn: 1000
                        },
                        renderOptions: {
                            after: {
                                contentText: placeholder,
                                color: this.t()
                            }
                        }
                    }
                ];
                this.f.inputEditor.setDecorationsByType(decorationDescription, placeholderDecorationType, decoration);
                return;
            }
            // TODO@roblourens need some kind of parser for queries
            let placeholderDecoration;
            const usedAgent = inputValue && agents.find(a => inputValue.startsWith(`@${a.id} `));
            let usedSubcommand;
            let subCommandPosition;
            if (usedAgent) {
                const subCommandReg = /\/(\w+)(\s|$)/g;
                let subCommandMatch;
                while (subCommandMatch = subCommandReg.exec(inputValue)) {
                    const maybeCommand = subCommandMatch[1];
                    usedSubcommand = usedAgent.metadata.subCommands.find(agentCommand => maybeCommand === agentCommand.name)?.name;
                    if (usedSubcommand) {
                        subCommandPosition = subCommandMatch.index;
                        break;
                    }
                }
            }
            if (usedAgent && inputValue === `@${usedAgent.id} `) {
                // Agent reference with no other text - show the placeholder
                if (usedAgent.metadata.description) {
                    placeholderDecoration = [{
                            range: {
                                startLineNumber: 1,
                                endLineNumber: 1,
                                startColumn: usedAgent.id.length,
                                endColumn: 1000
                            },
                            renderOptions: {
                                after: {
                                    contentText: usedAgent.metadata.description,
                                    color: this.t(),
                                }
                            }
                        }];
                }
            }
            const command = !usedAgent && inputValue && slashCommands?.find(c => inputValue.startsWith(`/${c.command} `));
            if (command && inputValue === `/${command.command} `) {
                // Command reference with no other text - show the placeholder
                const isFollowupSlashCommand = this.b.has(command.command);
                const shouldRenderFollowupPlaceholder = command.followupPlaceholder && isFollowupSlashCommand;
                if (shouldRenderFollowupPlaceholder || command.detail) {
                    placeholderDecoration = [{
                            range: {
                                startLineNumber: 1,
                                endLineNumber: 1,
                                startColumn: command ? command.command.length : 1,
                                endColumn: 1000
                            },
                            renderOptions: {
                                after: {
                                    contentText: shouldRenderFollowupPlaceholder ? command.followupPlaceholder : command.detail,
                                    color: this.t(),
                                }
                            }
                        }];
                }
            }
            this.f.inputEditor.setDecorationsByType(decorationDescription, placeholderDecorationType, placeholderDecoration ?? []);
            // TODO@roblourens The way these numbers are computed aren't totally correct...
            const textDecorations = [];
            if (usedAgent) {
                textDecorations.push({
                    range: {
                        startLineNumber: 1,
                        endLineNumber: 1,
                        startColumn: 1,
                        endColumn: usedAgent.id.length + 2
                    }
                });
                if (usedSubcommand) {
                    textDecorations.push({
                        range: {
                            startLineNumber: 1,
                            endLineNumber: 1,
                            startColumn: subCommandPosition + 1,
                            endColumn: subCommandPosition + usedSubcommand.length + 2
                        }
                    });
                }
            }
            if (command) {
                textDecorations.push({
                    range: {
                        startLineNumber: 1,
                        endLineNumber: 1,
                        startColumn: 1,
                        endColumn: command.command.length + 2
                    }
                });
            }
            this.f.inputEditor.setDecorationsByType(decorationDescription, slashCommandTextDecorationType, textDecorations);
            const variables = this.n.getVariables();
            const variableReg = /(^|\s)@(\w+)(:\d+)?(?=(\s|$))/ig;
            let match;
            const varDecorations = [];
            while (match = variableReg.exec(inputValue)) {
                const varName = match[2];
                if (iterator_1.Iterable.find(variables, v => v.name === varName)) {
                    varDecorations.push({
                        range: {
                            startLineNumber: 1,
                            endLineNumber: 1,
                            startColumn: match.index + match[1].length + 1,
                            endColumn: match.index + match[0].length + 1
                        }
                    });
                }
            }
            this.f.inputEditor.setDecorationsByType(decorationDescription, variableTextDecorationType, varDecorations);
        }
    };
    InputEditorDecorations = __decorate([
        __param(1, codeEditorService_1.$nV),
        __param(2, themeService_1.$gv),
        __param(3, chatService_1.$FH),
        __param(4, chatVariables_1.$DH),
        __param(5, chatAgents_1.$rH)
    ], InputEditorDecorations);
    let InputEditorSlashCommandMode = class InputEditorSlashCommandMode extends lifecycle_1.$kc {
        constructor(b, f) {
            super();
            this.b = b;
            this.f = f;
            this.B(this.f.onDidSubmitSlashCommand(({ slashCommand, sessionId }) => this.g(slashCommand, sessionId)));
        }
        async g(slashCommand, sessionId) {
            if (this.b.viewModel?.sessionId !== sessionId) {
                return;
            }
            const slashCommands = await this.b.getSlashCommands();
            if (this.b.inputEditor.getValue().trim().length !== 0) {
                return;
            }
            if (slashCommands?.find(c => c.command === slashCommand)?.shouldRepopulate) {
                const value = `/${slashCommand} `;
                this.b.inputEditor.setValue(value);
                this.b.inputEditor.setPosition({ lineNumber: 1, column: value.length + 1 });
            }
        }
    };
    InputEditorSlashCommandMode = __decorate([
        __param(1, chatService_1.$FH)
    ], InputEditorSlashCommandMode);
    chatWidget_1.$zIb.CONTRIBS.push(InputEditorDecorations, InputEditorSlashCommandMode);
    let SlashCommandCompletions = class SlashCommandCompletions extends lifecycle_1.$kc {
        constructor(b, f, g) {
            super();
            this.b = b;
            this.f = f;
            this.g = g;
            this.B(this.b.completionProvider.register({ scheme: chatInputPart_1.$SGb.INPUT_SCHEME, hasAccessToAllModels: true }, {
                _debugDisplayName: 'chatSlashCommand',
                triggerCharacters: ['/'],
                provideCompletionItems: async (model, _position, _context, _token) => {
                    const widget = this.f.getWidgetByInputUri(model.uri);
                    if (!widget) {
                        return null;
                    }
                    const firstLine = model.getLineContent(1).trim();
                    const agents = this.g.getAgents();
                    const usedAgent = firstLine.startsWith('@') && agents.find(a => firstLine.startsWith(`@${a.id}`));
                    if (usedAgent) {
                        // No (classic) global slash commands when an agent is used
                        return;
                    }
                    if (model.getValueInRange(new range_1.$ks(1, 1, 1, 2)) !== '/' && model.getValueLength() > 0) {
                        return null;
                    }
                    const slashCommands = await widget.getSlashCommands();
                    if (!slashCommands) {
                        return null;
                    }
                    return {
                        suggestions: sortSlashCommandsByYieldTo(slashCommands).map((c, i) => {
                            const withSlash = `/${c.command}`;
                            return {
                                label: withSlash,
                                insertText: c.executeImmediately ? '' : `${withSlash} `,
                                detail: c.detail,
                                range: new range_1.$ks(1, 1, 1, 1),
                                sortText: c.sortText ?? 'a'.repeat(i + 1),
                                kind: 18 /* CompletionItemKind.Text */,
                                command: c.executeImmediately ? { id: chatExecuteActions_1.$NGb.ID, title: withSlash, arguments: [{ widget, inputValue: `${withSlash} ` }] } : undefined,
                            };
                        })
                    };
                }
            }));
        }
    };
    SlashCommandCompletions = __decorate([
        __param(0, languageFeatures_1.$hF),
        __param(1, chat_1.$Nqb),
        __param(2, chatAgents_1.$rH)
    ], SlashCommandCompletions);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(SlashCommandCompletions, 4 /* LifecyclePhase.Eventually */);
    let AgentCompletions = class AgentCompletions extends lifecycle_1.$kc {
        constructor(b, f, g) {
            super();
            this.b = b;
            this.f = f;
            this.g = g;
            this.B(this.b.completionProvider.register({ scheme: chatInputPart_1.$SGb.INPUT_SCHEME, hasAccessToAllModels: true }, {
                _debugDisplayName: 'chatAgent',
                triggerCharacters: ['@'],
                provideCompletionItems: async (model, _position, _context, _token) => {
                    const widget = this.f.getWidgetByInputUri(model.uri);
                    if (!widget) {
                        return null;
                    }
                    if (model.getValueInRange(new range_1.$ks(1, 1, 1, 2)) !== '@' && model.getValueLength() > 0) {
                        return null;
                    }
                    const agents = this.g.getAgents();
                    return {
                        suggestions: agents.map((c, i) => {
                            const withAt = `@${c.id}`;
                            return {
                                label: withAt,
                                insertText: `${withAt} `,
                                detail: c.metadata.description,
                                range: new range_1.$ks(1, 1, 1, 1),
                                // sortText: 'a'.repeat(i + 1),
                                kind: 18 /* CompletionItemKind.Text */, // The icons are disabled here anyway
                                // command: c.executeImmediately ? { id: SubmitAction.ID, title: withAt, arguments: [{ widget, inputValue: `${withAt} ` }] } : undefined,
                            };
                        })
                    };
                }
            }));
            this.B(this.b.completionProvider.register({ scheme: chatInputPart_1.$SGb.INPUT_SCHEME, hasAccessToAllModels: true }, {
                _debugDisplayName: 'chatAgentSubcommand',
                triggerCharacters: ['/'],
                provideCompletionItems: async (model, position, _context, _token) => {
                    const widget = this.f.getWidgetByInputUri(model.uri);
                    if (!widget) {
                        return;
                    }
                    const firstLine = model.getLineContent(1).trim();
                    if (!firstLine.startsWith('@')) {
                        return;
                    }
                    const agents = this.g.getAgents();
                    const usedAgent = agents.find(a => firstLine.startsWith(`@${a.id}`));
                    if (!usedAgent) {
                        return;
                    }
                    const maybeCommands = model.getValue().split(/\s+/).filter(w => w.startsWith('/'));
                    const usedSubcommand = usedAgent.metadata.subCommands.find(agentCommand => maybeCommands.some(c => c === `/${agentCommand.name}`));
                    if (usedSubcommand) {
                        // Only one allowed
                        return;
                    }
                    return {
                        suggestions: usedAgent.metadata.subCommands.map((c, i) => {
                            const withSlash = `/${c.name}`;
                            return {
                                label: withSlash,
                                insertText: `${withSlash} `,
                                detail: c.description,
                                range: new range_1.$ks(1, position.column - 1, 1, position.column - 1),
                                // sortText: 'a'.repeat(i + 1),
                                kind: 18 /* CompletionItemKind.Text */, // The icons are disabled here anyway
                                // command: c.executeImmediately ? { id: SubmitAction.ID, title: withAt, arguments: [{ widget, inputValue: `${withAt} ` }] } : undefined,
                            };
                        })
                    };
                }
            }));
            // list subcommands when the query is empty, insert agent+subcommand
            this.B(this.b.completionProvider.register({ scheme: chatInputPart_1.$SGb.INPUT_SCHEME, hasAccessToAllModels: true }, {
                _debugDisplayName: 'chatAgentAndSubcommand',
                triggerCharacters: ['/'],
                provideCompletionItems: async (model, position, _context, _token) => {
                    const widget = this.f.getWidgetByInputUri(model.uri);
                    if (!widget) {
                        return;
                    }
                    if (model.getValue().trim() !== '/') {
                        // Only when the input only contains a slash
                        return;
                    }
                    const agents = this.g.getAgents();
                    return {
                        suggestions: agents.flatMap(a => a.metadata.subCommands.map((c, i) => {
                            const withSlash = `/${c.name}`;
                            return {
                                label: withSlash,
                                insertText: `@${a.id} ${withSlash} `,
                                detail: `(@${a.id}) ${c.description}`,
                                range: new range_1.$ks(1, 1, 1, 1),
                                kind: 18 /* CompletionItemKind.Text */, // The icons are disabled here anyway
                            };
                        }))
                    };
                }
            }));
        }
    };
    AgentCompletions = __decorate([
        __param(0, languageFeatures_1.$hF),
        __param(1, chat_1.$Nqb),
        __param(2, chatAgents_1.$rH)
    ], AgentCompletions);
    // Adapted from https://github.com/microsoft/vscode/blob/ca2c1636f87ea4705f32345c2e348e815996e129/src/vs/editor/contrib/dropOrPasteInto/browser/edit.ts#L31-L99
    function sortSlashCommandsByYieldTo(slashCommands) {
        function yieldsTo(yTo, other) {
            return 'command' in yTo && other.command === yTo.command;
        }
        // Build list of nodes each node yields to
        const yieldsToMap = new Map();
        for (const slashCommand of slashCommands) {
            for (const yTo of slashCommand.yieldsTo ?? []) {
                for (const other of slashCommands) {
                    if (other.command === slashCommand.command) {
                        continue;
                    }
                    if (yieldsTo(yTo, other)) {
                        let arr = yieldsToMap.get(slashCommand);
                        if (!arr) {
                            arr = [];
                            yieldsToMap.set(slashCommand, arr);
                        }
                        arr.push(other);
                    }
                }
            }
        }
        if (!yieldsToMap.size) {
            return Array.from(slashCommands);
        }
        // Topological sort
        const visited = new Set();
        const tempStack = [];
        function visit(nodes) {
            if (!nodes.length) {
                return [];
            }
            const node = nodes[0];
            if (tempStack.includes(node)) {
                console.warn(`Yield to cycle detected for ${node.command}`);
                return nodes;
            }
            if (visited.has(node)) {
                return visit(nodes.slice(1));
            }
            let pre = [];
            const yTo = yieldsToMap.get(node);
            if (yTo) {
                tempStack.push(node);
                pre = visit(yTo);
                tempStack.pop();
            }
            visited.add(node);
            return [...pre, node, ...visit(nodes.slice(1))];
        }
        return visit(Array.from(slashCommands));
    }
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(AgentCompletions, 4 /* LifecyclePhase.Eventually */);
    let VariableCompletions = class VariableCompletions extends lifecycle_1.$kc {
        static { VariableCompletions_1 = this; }
        static { this.b = /@\w*/g; } // MUST be using `g`-flag
        constructor(f, g, j, m) {
            super();
            this.f = f;
            this.g = g;
            this.j = j;
            this.m = m;
            this.B(this.f.completionProvider.register({ scheme: chatInputPart_1.$SGb.INPUT_SCHEME, hasAccessToAllModels: true }, {
                _debugDisplayName: 'chatVariables',
                triggerCharacters: ['@'],
                provideCompletionItems: async (model, position, _context, _token) => {
                    const widget = this.g.getWidgetByInputUri(model.uri);
                    if (!widget) {
                        return null;
                    }
                    const varWord = (0, wordHelper_1.$Zr)(position.column, VariableCompletions_1.b, model.getLineContent(position.lineNumber), 0);
                    if (!varWord && model.getWordUntilPosition(position).word) {
                        // inside a "normal" word
                        return null;
                    }
                    let insert;
                    let replace;
                    if (!varWord) {
                        insert = replace = range_1.$ks.fromPositions(position);
                    }
                    else {
                        insert = new range_1.$ks(position.lineNumber, varWord.startColumn, position.lineNumber, position.column);
                        replace = new range_1.$ks(position.lineNumber, varWord.startColumn, position.lineNumber, varWord.endColumn);
                    }
                    const history = widget.viewModel.getItems()
                        .filter(chatViewModel_1.$Iqb);
                    // TODO@roblourens work out a real API for this- maybe it can be part of the two-step flow that @file will probably use
                    const historyVariablesEnabled = this.m.getValue('chat.experimental.historyVariables');
                    const historyItems = historyVariablesEnabled ? history.map((h, i) => ({
                        label: `@response:${i + 1}`,
                        detail: h.response.asString(),
                        insertText: `@response:${String(i + 1).padStart(String(history.length).length, '0')} `,
                        kind: 18 /* CompletionItemKind.Text */,
                        range: { insert, replace },
                    })) : [];
                    const variableItems = Array.from(this.j.getVariables()).map(v => {
                        const withAt = `@${v.name}`;
                        return {
                            label: withAt,
                            range: { insert, replace },
                            insertText: withAt + ' ',
                            detail: v.description,
                            kind: 18 /* CompletionItemKind.Text */, // The icons are disabled here anyway,
                        };
                    });
                    return {
                        suggestions: [...variableItems, ...historyItems]
                    };
                }
            }));
        }
    };
    VariableCompletions = VariableCompletions_1 = __decorate([
        __param(0, languageFeatures_1.$hF),
        __param(1, chat_1.$Nqb),
        __param(2, chatVariables_1.$DH),
        __param(3, configuration_1.$8h)
    ], VariableCompletions);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(VariableCompletions, 4 /* LifecyclePhase.Eventually */);
});
//# sourceMappingURL=chatInputEditorContrib.js.map