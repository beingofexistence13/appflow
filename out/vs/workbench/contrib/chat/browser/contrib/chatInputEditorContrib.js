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
define(["require", "exports", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/editor/browser/services/codeEditorService", "vs/editor/common/core/range", "vs/editor/common/core/wordHelper", "vs/editor/common/services/languageFeatures", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/registry/common/platform", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/common/contributions", "vs/workbench/contrib/chat/browser/actions/chatExecuteActions", "vs/workbench/contrib/chat/browser/chat", "vs/workbench/contrib/chat/browser/chatInputPart", "vs/workbench/contrib/chat/browser/chatWidget", "vs/workbench/contrib/chat/common/chatAgents", "vs/workbench/contrib/chat/common/chatColors", "vs/workbench/contrib/chat/common/chatService", "vs/workbench/contrib/chat/common/chatVariables", "vs/workbench/contrib/chat/common/chatViewModel"], function (require, exports, iterator_1, lifecycle_1, codeEditorService_1, range_1, wordHelper_1, languageFeatures_1, nls_1, configuration_1, platform_1, colorRegistry_1, themeService_1, contributions_1, chatExecuteActions_1, chat_1, chatInputPart_1, chatWidget_1, chatAgents_1, chatColors_1, chatService_1, chatVariables_1, chatViewModel_1) {
    "use strict";
    var VariableCompletions_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    const decorationDescription = 'chat';
    const placeholderDecorationType = 'chat-session-detail';
    const slashCommandTextDecorationType = 'chat-session-text';
    const variableTextDecorationType = 'chat-variable-text';
    let InputEditorDecorations = class InputEditorDecorations extends lifecycle_1.Disposable {
        constructor(widget, codeEditorService, themeService, chatService, chatVariablesService, chatAgentService) {
            super();
            this.widget = widget;
            this.codeEditorService = codeEditorService;
            this.themeService = themeService;
            this.chatService = chatService;
            this.chatVariablesService = chatVariablesService;
            this.chatAgentService = chatAgentService;
            this._previouslyUsedSlashCommands = new Set();
            this.codeEditorService.registerDecorationType(decorationDescription, placeholderDecorationType, {});
            this._register(this.themeService.onDidColorThemeChange(() => this.updateRegisteredDecorationTypes()));
            this.updateRegisteredDecorationTypes();
            this.updateInputEditorDecorations();
            this._register(this.widget.inputEditor.onDidChangeModelContent(() => this.updateInputEditorDecorations()));
            this._register(this.widget.onDidChangeViewModel(() => {
                this._previouslyUsedSlashCommands.clear();
                this.updateInputEditorDecorations();
            }));
            this._register(this.chatService.onDidSubmitSlashCommand((e) => {
                if (e.sessionId === this.widget.viewModel?.sessionId && !this._previouslyUsedSlashCommands.has(e.slashCommand)) {
                    this._previouslyUsedSlashCommands.add(e.slashCommand);
                }
            }));
        }
        updateRegisteredDecorationTypes() {
            this.codeEditorService.removeDecorationType(variableTextDecorationType);
            this.codeEditorService.removeDecorationType(slashCommandTextDecorationType);
            const theme = this.themeService.getColorTheme();
            this.codeEditorService.registerDecorationType(decorationDescription, slashCommandTextDecorationType, {
                color: theme.getColor(chatColors_1.chatSlashCommandForeground)?.toString(),
                backgroundColor: theme.getColor(chatColors_1.chatSlashCommandBackground)?.toString()
            });
            this.codeEditorService.registerDecorationType(decorationDescription, variableTextDecorationType, {
                color: theme.getColor(chatColors_1.chatSlashCommandForeground)?.toString(),
                backgroundColor: theme.getColor(chatColors_1.chatSlashCommandBackground)?.toString(),
                borderRadius: '3px'
            });
            this.updateInputEditorDecorations();
        }
        getPlaceholderColor() {
            const theme = this.themeService.getColorTheme();
            const transparentForeground = theme.getColor(colorRegistry_1.inputPlaceholderForeground);
            return transparentForeground?.toString();
        }
        async updateInputEditorDecorations() {
            const inputValue = this.widget.inputEditor.getValue();
            const slashCommands = await this.widget.getSlashCommands(); // TODO this async call can lead to a flicker of the placeholder text when switching editor tabs
            const agents = this.chatAgentService.getAgents();
            if (!inputValue) {
                const extensionPlaceholder = this.widget.viewModel?.inputPlaceholder;
                const defaultPlaceholder = slashCommands?.length ?
                    (0, nls_1.localize)('interactive.input.placeholderWithCommands', "Ask a question or type '@' or '/'") :
                    (0, nls_1.localize)('interactive.input.placeholderNoCommands', "Ask a question");
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
                                color: this.getPlaceholderColor()
                            }
                        }
                    }
                ];
                this.widget.inputEditor.setDecorationsByType(decorationDescription, placeholderDecorationType, decoration);
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
                                    color: this.getPlaceholderColor(),
                                }
                            }
                        }];
                }
            }
            const command = !usedAgent && inputValue && slashCommands?.find(c => inputValue.startsWith(`/${c.command} `));
            if (command && inputValue === `/${command.command} `) {
                // Command reference with no other text - show the placeholder
                const isFollowupSlashCommand = this._previouslyUsedSlashCommands.has(command.command);
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
                                    color: this.getPlaceholderColor(),
                                }
                            }
                        }];
                }
            }
            this.widget.inputEditor.setDecorationsByType(decorationDescription, placeholderDecorationType, placeholderDecoration ?? []);
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
            this.widget.inputEditor.setDecorationsByType(decorationDescription, slashCommandTextDecorationType, textDecorations);
            const variables = this.chatVariablesService.getVariables();
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
            this.widget.inputEditor.setDecorationsByType(decorationDescription, variableTextDecorationType, varDecorations);
        }
    };
    InputEditorDecorations = __decorate([
        __param(1, codeEditorService_1.ICodeEditorService),
        __param(2, themeService_1.IThemeService),
        __param(3, chatService_1.IChatService),
        __param(4, chatVariables_1.IChatVariablesService),
        __param(5, chatAgents_1.IChatAgentService)
    ], InputEditorDecorations);
    let InputEditorSlashCommandMode = class InputEditorSlashCommandMode extends lifecycle_1.Disposable {
        constructor(widget, chatService) {
            super();
            this.widget = widget;
            this.chatService = chatService;
            this._register(this.chatService.onDidSubmitSlashCommand(({ slashCommand, sessionId }) => this.repopulateSlashCommand(slashCommand, sessionId)));
        }
        async repopulateSlashCommand(slashCommand, sessionId) {
            if (this.widget.viewModel?.sessionId !== sessionId) {
                return;
            }
            const slashCommands = await this.widget.getSlashCommands();
            if (this.widget.inputEditor.getValue().trim().length !== 0) {
                return;
            }
            if (slashCommands?.find(c => c.command === slashCommand)?.shouldRepopulate) {
                const value = `/${slashCommand} `;
                this.widget.inputEditor.setValue(value);
                this.widget.inputEditor.setPosition({ lineNumber: 1, column: value.length + 1 });
            }
        }
    };
    InputEditorSlashCommandMode = __decorate([
        __param(1, chatService_1.IChatService)
    ], InputEditorSlashCommandMode);
    chatWidget_1.ChatWidget.CONTRIBS.push(InputEditorDecorations, InputEditorSlashCommandMode);
    let SlashCommandCompletions = class SlashCommandCompletions extends lifecycle_1.Disposable {
        constructor(languageFeaturesService, chatWidgetService, chatAgentService) {
            super();
            this.languageFeaturesService = languageFeaturesService;
            this.chatWidgetService = chatWidgetService;
            this.chatAgentService = chatAgentService;
            this._register(this.languageFeaturesService.completionProvider.register({ scheme: chatInputPart_1.ChatInputPart.INPUT_SCHEME, hasAccessToAllModels: true }, {
                _debugDisplayName: 'chatSlashCommand',
                triggerCharacters: ['/'],
                provideCompletionItems: async (model, _position, _context, _token) => {
                    const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
                    if (!widget) {
                        return null;
                    }
                    const firstLine = model.getLineContent(1).trim();
                    const agents = this.chatAgentService.getAgents();
                    const usedAgent = firstLine.startsWith('@') && agents.find(a => firstLine.startsWith(`@${a.id}`));
                    if (usedAgent) {
                        // No (classic) global slash commands when an agent is used
                        return;
                    }
                    if (model.getValueInRange(new range_1.Range(1, 1, 1, 2)) !== '/' && model.getValueLength() > 0) {
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
                                range: new range_1.Range(1, 1, 1, 1),
                                sortText: c.sortText ?? 'a'.repeat(i + 1),
                                kind: 18 /* CompletionItemKind.Text */,
                                command: c.executeImmediately ? { id: chatExecuteActions_1.SubmitAction.ID, title: withSlash, arguments: [{ widget, inputValue: `${withSlash} ` }] } : undefined,
                            };
                        })
                    };
                }
            }));
        }
    };
    SlashCommandCompletions = __decorate([
        __param(0, languageFeatures_1.ILanguageFeaturesService),
        __param(1, chat_1.IChatWidgetService),
        __param(2, chatAgents_1.IChatAgentService)
    ], SlashCommandCompletions);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(SlashCommandCompletions, 4 /* LifecyclePhase.Eventually */);
    let AgentCompletions = class AgentCompletions extends lifecycle_1.Disposable {
        constructor(languageFeaturesService, chatWidgetService, chatAgentService) {
            super();
            this.languageFeaturesService = languageFeaturesService;
            this.chatWidgetService = chatWidgetService;
            this.chatAgentService = chatAgentService;
            this._register(this.languageFeaturesService.completionProvider.register({ scheme: chatInputPart_1.ChatInputPart.INPUT_SCHEME, hasAccessToAllModels: true }, {
                _debugDisplayName: 'chatAgent',
                triggerCharacters: ['@'],
                provideCompletionItems: async (model, _position, _context, _token) => {
                    const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
                    if (!widget) {
                        return null;
                    }
                    if (model.getValueInRange(new range_1.Range(1, 1, 1, 2)) !== '@' && model.getValueLength() > 0) {
                        return null;
                    }
                    const agents = this.chatAgentService.getAgents();
                    return {
                        suggestions: agents.map((c, i) => {
                            const withAt = `@${c.id}`;
                            return {
                                label: withAt,
                                insertText: `${withAt} `,
                                detail: c.metadata.description,
                                range: new range_1.Range(1, 1, 1, 1),
                                // sortText: 'a'.repeat(i + 1),
                                kind: 18 /* CompletionItemKind.Text */, // The icons are disabled here anyway
                                // command: c.executeImmediately ? { id: SubmitAction.ID, title: withAt, arguments: [{ widget, inputValue: `${withAt} ` }] } : undefined,
                            };
                        })
                    };
                }
            }));
            this._register(this.languageFeaturesService.completionProvider.register({ scheme: chatInputPart_1.ChatInputPart.INPUT_SCHEME, hasAccessToAllModels: true }, {
                _debugDisplayName: 'chatAgentSubcommand',
                triggerCharacters: ['/'],
                provideCompletionItems: async (model, position, _context, _token) => {
                    const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
                    if (!widget) {
                        return;
                    }
                    const firstLine = model.getLineContent(1).trim();
                    if (!firstLine.startsWith('@')) {
                        return;
                    }
                    const agents = this.chatAgentService.getAgents();
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
                                range: new range_1.Range(1, position.column - 1, 1, position.column - 1),
                                // sortText: 'a'.repeat(i + 1),
                                kind: 18 /* CompletionItemKind.Text */, // The icons are disabled here anyway
                                // command: c.executeImmediately ? { id: SubmitAction.ID, title: withAt, arguments: [{ widget, inputValue: `${withAt} ` }] } : undefined,
                            };
                        })
                    };
                }
            }));
            // list subcommands when the query is empty, insert agent+subcommand
            this._register(this.languageFeaturesService.completionProvider.register({ scheme: chatInputPart_1.ChatInputPart.INPUT_SCHEME, hasAccessToAllModels: true }, {
                _debugDisplayName: 'chatAgentAndSubcommand',
                triggerCharacters: ['/'],
                provideCompletionItems: async (model, position, _context, _token) => {
                    const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
                    if (!widget) {
                        return;
                    }
                    if (model.getValue().trim() !== '/') {
                        // Only when the input only contains a slash
                        return;
                    }
                    const agents = this.chatAgentService.getAgents();
                    return {
                        suggestions: agents.flatMap(a => a.metadata.subCommands.map((c, i) => {
                            const withSlash = `/${c.name}`;
                            return {
                                label: withSlash,
                                insertText: `@${a.id} ${withSlash} `,
                                detail: `(@${a.id}) ${c.description}`,
                                range: new range_1.Range(1, 1, 1, 1),
                                kind: 18 /* CompletionItemKind.Text */, // The icons are disabled here anyway
                            };
                        }))
                    };
                }
            }));
        }
    };
    AgentCompletions = __decorate([
        __param(0, languageFeatures_1.ILanguageFeaturesService),
        __param(1, chat_1.IChatWidgetService),
        __param(2, chatAgents_1.IChatAgentService)
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
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(AgentCompletions, 4 /* LifecyclePhase.Eventually */);
    let VariableCompletions = class VariableCompletions extends lifecycle_1.Disposable {
        static { VariableCompletions_1 = this; }
        static { this.VariableNameDef = /@\w*/g; } // MUST be using `g`-flag
        constructor(languageFeaturesService, chatWidgetService, chatVariablesService, configurationService) {
            super();
            this.languageFeaturesService = languageFeaturesService;
            this.chatWidgetService = chatWidgetService;
            this.chatVariablesService = chatVariablesService;
            this.configurationService = configurationService;
            this._register(this.languageFeaturesService.completionProvider.register({ scheme: chatInputPart_1.ChatInputPart.INPUT_SCHEME, hasAccessToAllModels: true }, {
                _debugDisplayName: 'chatVariables',
                triggerCharacters: ['@'],
                provideCompletionItems: async (model, position, _context, _token) => {
                    const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
                    if (!widget) {
                        return null;
                    }
                    const varWord = (0, wordHelper_1.getWordAtText)(position.column, VariableCompletions_1.VariableNameDef, model.getLineContent(position.lineNumber), 0);
                    if (!varWord && model.getWordUntilPosition(position).word) {
                        // inside a "normal" word
                        return null;
                    }
                    let insert;
                    let replace;
                    if (!varWord) {
                        insert = replace = range_1.Range.fromPositions(position);
                    }
                    else {
                        insert = new range_1.Range(position.lineNumber, varWord.startColumn, position.lineNumber, position.column);
                        replace = new range_1.Range(position.lineNumber, varWord.startColumn, position.lineNumber, varWord.endColumn);
                    }
                    const history = widget.viewModel.getItems()
                        .filter(chatViewModel_1.isResponseVM);
                    // TODO@roblourens work out a real API for this- maybe it can be part of the two-step flow that @file will probably use
                    const historyVariablesEnabled = this.configurationService.getValue('chat.experimental.historyVariables');
                    const historyItems = historyVariablesEnabled ? history.map((h, i) => ({
                        label: `@response:${i + 1}`,
                        detail: h.response.asString(),
                        insertText: `@response:${String(i + 1).padStart(String(history.length).length, '0')} `,
                        kind: 18 /* CompletionItemKind.Text */,
                        range: { insert, replace },
                    })) : [];
                    const variableItems = Array.from(this.chatVariablesService.getVariables()).map(v => {
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
        __param(0, languageFeatures_1.ILanguageFeaturesService),
        __param(1, chat_1.IChatWidgetService),
        __param(2, chatVariables_1.IChatVariablesService),
        __param(3, configuration_1.IConfigurationService)
    ], VariableCompletions);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(VariableCompletions, 4 /* LifecyclePhase.Eventually */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdElucHV0RWRpdG9yQ29udHJpYi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NoYXQvYnJvd3Nlci9jb250cmliL2NoYXRJbnB1dEVkaXRvckNvbnRyaWIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBOEJoRyxNQUFNLHFCQUFxQixHQUFHLE1BQU0sQ0FBQztJQUNyQyxNQUFNLHlCQUF5QixHQUFHLHFCQUFxQixDQUFDO0lBQ3hELE1BQU0sOEJBQThCLEdBQUcsbUJBQW1CLENBQUM7SUFDM0QsTUFBTSwwQkFBMEIsR0FBRyxvQkFBb0IsQ0FBQztJQUV4RCxJQUFNLHNCQUFzQixHQUE1QixNQUFNLHNCQUF1QixTQUFRLHNCQUFVO1FBSTlDLFlBQ2tCLE1BQW1CLEVBQ2hCLGlCQUFzRCxFQUMzRCxZQUE0QyxFQUM3QyxXQUEwQyxFQUNqQyxvQkFBNEQsRUFDaEUsZ0JBQW9EO1lBRXZFLEtBQUssRUFBRSxDQUFDO1lBUFMsV0FBTSxHQUFOLE1BQU0sQ0FBYTtZQUNDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFDMUMsaUJBQVksR0FBWixZQUFZLENBQWU7WUFDNUIsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFDaEIseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUMvQyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBUmhFLGlDQUE0QixHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7WUFZeEQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLHNCQUFzQixDQUFDLHFCQUFxQixFQUFFLHlCQUF5QixFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBRXBHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsK0JBQStCLEVBQUUs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