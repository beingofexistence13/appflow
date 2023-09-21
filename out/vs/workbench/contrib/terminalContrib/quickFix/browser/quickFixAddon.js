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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/browser/dom", "vs/base/common/arrays", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/opener/common/opener", "vs/workbench/contrib/terminal/browser/xterm/decorationStyles", "vs/platform/telemetry/common/telemetry", "vs/base/common/cancellation", "vs/workbench/services/extensions/common/extensions", "vs/platform/audioCues/browser/audioCueService", "vs/platform/actionWidget/browser/actionWidget", "vs/platform/terminal/common/capabilities/commandDetectionCapability", "vs/platform/label/common/label", "vs/base/common/network", "vs/workbench/contrib/terminalContrib/quickFix/browser/quickFix", "vs/editor/contrib/codeAction/common/types", "vs/base/common/codicons", "vs/base/common/themables", "vs/platform/commands/common/commands"], function (require, exports, event_1, lifecycle_1, dom, arrays_1, nls_1, configuration_1, opener_1, decorationStyles_1, telemetry_1, cancellation_1, extensions_1, audioCueService_1, actionWidget_1, commandDetectionCapability_1, label_1, network_1, quickFix_1, types_1, codicons_1, themables_1, commands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getQuickFixesForCommand = exports.TerminalQuickFixAddon = void 0;
    const quickFixClasses = [
        "quick-fix" /* DecorationSelector.QuickFix */,
        "codicon" /* DecorationSelector.Codicon */,
        "terminal-command-decoration" /* DecorationSelector.CommandDecoration */,
        "xterm-decoration" /* DecorationSelector.XtermDecoration */
    ];
    let TerminalQuickFixAddon = class TerminalQuickFixAddon extends lifecycle_1.Disposable {
        constructor(_aliases, _capabilities, _quickFixService, _commandService, _configurationService, _audioCueService, _openerService, _telemetryService, _extensionService, _actionWidgetService, _labelService) {
            super();
            this._aliases = _aliases;
            this._capabilities = _capabilities;
            this._quickFixService = _quickFixService;
            this._commandService = _commandService;
            this._configurationService = _configurationService;
            this._audioCueService = _audioCueService;
            this._openerService = _openerService;
            this._telemetryService = _telemetryService;
            this._extensionService = _extensionService;
            this._actionWidgetService = _actionWidgetService;
            this._labelService = _labelService;
            this._onDidRequestRerunCommand = new event_1.Emitter();
            this.onDidRequestRerunCommand = this._onDidRequestRerunCommand.event;
            this._commandListeners = new Map();
            this._registeredSelectors = new Set();
            const commandDetectionCapability = this._capabilities.get(2 /* TerminalCapability.CommandDetection */);
            if (commandDetectionCapability) {
                this._registerCommandHandlers();
            }
            else {
                this._register(this._capabilities.onDidAddCapabilityType(c => {
                    if (c === 2 /* TerminalCapability.CommandDetection */) {
                        this._registerCommandHandlers();
                    }
                }));
            }
            this._register(this._quickFixService.onDidRegisterProvider(result => this.registerCommandFinishedListener(convertToQuickFixOptions(result))));
            this._quickFixService.extensionQuickFixes.then(quickFixSelectors => {
                for (const selector of quickFixSelectors) {
                    this.registerCommandSelector(selector);
                }
            });
            this._register(this._quickFixService.onDidRegisterCommandSelector(selector => this.registerCommandSelector(selector)));
            this._register(this._quickFixService.onDidUnregisterProvider(id => this._commandListeners.delete(id)));
        }
        activate(terminal) {
            this._terminal = terminal;
        }
        showMenu() {
            if (!this._currentRenderContext) {
                return;
            }
            // TODO: What's documentation do? Need a vscode command?
            const actions = this._currentRenderContext.quickFixes.map(f => new TerminalQuickFixItem(f, f.type, f.source, f.label, f.kind));
            const documentation = this._currentRenderContext.quickFixes.map(f => { return { id: f.source, title: f.label, tooltip: f.source }; });
            const actionSet = {
                // TODO: Documentation and actions are separate?
                documentation,
                allActions: actions,
                hasAutoFix: false,
                validActions: actions,
                dispose: () => { }
            };
            const delegate = {
                onSelect: async (fix) => {
                    fix.action?.run();
                    this._actionWidgetService.hide();
                    this._disposeQuickFix(fix.action.id, true);
                },
                onHide: () => {
                    this._terminal?.focus();
                },
            };
            this._actionWidgetService.show('quickFixWidget', false, toActionWidgetItems(actionSet.validActions, true), delegate, this._currentRenderContext.anchor, this._currentRenderContext.parentElement);
        }
        registerCommandSelector(selector) {
            if (this._registeredSelectors.has(selector.id)) {
                return;
            }
            const matcherKey = selector.commandLineMatcher.toString();
            const currentOptions = this._commandListeners.get(matcherKey) || [];
            currentOptions.push({
                id: selector.id,
                type: 'unresolved',
                commandLineMatcher: selector.commandLineMatcher,
                outputMatcher: selector.outputMatcher,
                commandExitResult: selector.commandExitResult,
                kind: selector.kind
            });
            this._registeredSelectors.add(selector.id);
            this._commandListeners.set(matcherKey, currentOptions);
        }
        registerCommandFinishedListener(options) {
            const matcherKey = options.commandLineMatcher.toString();
            let currentOptions = this._commandListeners.get(matcherKey) || [];
            // removes the unresolved options
            currentOptions = currentOptions.filter(o => o.id !== options.id);
            currentOptions.push(options);
            this._commandListeners.set(matcherKey, currentOptions);
        }
        _registerCommandHandlers() {
            const terminal = this._terminal;
            const commandDetection = this._capabilities.get(2 /* TerminalCapability.CommandDetection */);
            if (!terminal || !commandDetection) {
                return;
            }
            this._register(commandDetection.onCommandFinished(async (command) => await this._resolveQuickFixes(command, this._aliases)));
        }
        /**
         * Resolves quick fixes, if any, based on the
         * @param command & its output
         */
        async _resolveQuickFixes(command, aliases) {
            const terminal = this._terminal;
            if (!terminal || command.wasReplayed) {
                return;
            }
            if (command.command !== '' && this._lastQuickFixId) {
                this._disposeQuickFix(this._lastQuickFixId, false);
            }
            const resolver = async (selector, lines) => {
                if (lines === undefined) {
                    return undefined;
                }
                const id = selector.id;
                await this._extensionService.activateByEvent(`onTerminalQuickFixRequest:${id}`);
                return this._quickFixService.providers.get(id)?.provideTerminalQuickFixes(command, lines, {
                    type: 'resolved',
                    commandLineMatcher: selector.commandLineMatcher,
                    outputMatcher: selector.outputMatcher,
                    commandExitResult: selector.commandExitResult,
                    kind: selector.kind,
                    id: selector.id
                }, new cancellation_1.CancellationTokenSource().token);
            };
            const result = await getQuickFixesForCommand(aliases, terminal, command, this._commandListeners, this._commandService, this._openerService, this._labelService, this._onDidRequestRerunCommand, resolver);
            if (!result) {
                return;
            }
            this._quickFixes = result;
            this._lastQuickFixId = this._quickFixes[0].id;
            this._registerQuickFixDecoration();
        }
        _disposeQuickFix(id, ranQuickFix) {
            this._telemetryService?.publicLog2('terminal/quick-fix', {
                quickFixId: id,
                ranQuickFix
            });
            this._decoration?.dispose();
            this._decoration = undefined;
            this._quickFixes = undefined;
            this._lastQuickFixId = undefined;
        }
        /**
         * Registers a decoration with the quick fixes
         */
        _registerQuickFixDecoration() {
            if (!this._terminal) {
                return;
            }
            if (!this._quickFixes) {
                return;
            }
            const marker = this._terminal.registerMarker();
            if (!marker) {
                return;
            }
            const decoration = this._terminal.registerDecoration({ marker, layer: 'top' });
            if (!decoration) {
                return;
            }
            this._decoration = decoration;
            const fixes = this._quickFixes;
            if (!fixes) {
                decoration.dispose();
                return;
            }
            decoration?.onRender((e) => {
                const rect = e.getBoundingClientRect();
                const anchor = {
                    x: rect.x,
                    y: rect.y,
                    width: rect.width,
                    height: rect.height
                };
                if (e.classList.contains("quick-fix" /* DecorationSelector.QuickFix */)) {
                    if (this._currentRenderContext) {
                        this._currentRenderContext.anchor = anchor;
                    }
                    return;
                }
                e.classList.add(...quickFixClasses);
                const isExplainOnly = fixes.every(e => e.kind === 'explain');
                if (isExplainOnly) {
                    e.classList.add('explainOnly');
                }
                e.classList.add(...themables_1.ThemeIcon.asClassNameArray(isExplainOnly ? codicons_1.Codicon.sparkle : codicons_1.Codicon.lightBulb));
                (0, decorationStyles_1.updateLayout)(this._configurationService, e);
                this._audioCueService.playAudioCue(audioCueService_1.AudioCue.terminalQuickFix);
                const parentElement = e.closest('.xterm');
                if (!parentElement) {
                    return;
                }
                this._currentRenderContext = { quickFixes: fixes, anchor, parentElement };
                this._register(dom.addDisposableListener(e, dom.EventType.CLICK, () => this.showMenu()));
            });
            decoration.onDispose(() => this._currentRenderContext = undefined);
            this._quickFixes = undefined;
        }
    };
    exports.TerminalQuickFixAddon = TerminalQuickFixAddon;
    exports.TerminalQuickFixAddon = TerminalQuickFixAddon = __decorate([
        __param(2, quickFix_1.ITerminalQuickFixService),
        __param(3, commands_1.ICommandService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, audioCueService_1.IAudioCueService),
        __param(6, opener_1.IOpenerService),
        __param(7, telemetry_1.ITelemetryService),
        __param(8, extensions_1.IExtensionService),
        __param(9, actionWidget_1.IActionWidgetService),
        __param(10, label_1.ILabelService)
    ], TerminalQuickFixAddon);
    async function getQuickFixesForCommand(aliases, terminal, terminalCommand, quickFixOptions, commandService, openerService, labelService, onDidRequestRerunCommand, getResolvedFixes) {
        // Prevent duplicates by tracking added entries
        const commandQuickFixSet = new Set();
        const openQuickFixSet = new Set();
        const fixes = [];
        const newCommand = terminalCommand.command;
        for (const options of quickFixOptions.values()) {
            for (const option of options) {
                if ((option.commandExitResult === 'success' && terminalCommand.exitCode !== 0) || (option.commandExitResult === 'error' && terminalCommand.exitCode === 0)) {
                    continue;
                }
                let quickFixes;
                if (option.type === 'resolved') {
                    quickFixes = await option.getQuickFixes(terminalCommand, (0, commandDetectionCapability_1.getLinesForCommand)(terminal.buffer.active, terminalCommand, terminal.cols, option.outputMatcher), option, new cancellation_1.CancellationTokenSource().token);
                }
                else if (option.type === 'unresolved') {
                    if (!getResolvedFixes) {
                        throw new Error('No resolved fix provider');
                    }
                    quickFixes = await getResolvedFixes(option, option.outputMatcher ? (0, commandDetectionCapability_1.getLinesForCommand)(terminal.buffer.active, terminalCommand, terminal.cols, option.outputMatcher) : undefined);
                }
                else if (option.type === 'internal') {
                    const commandLineMatch = newCommand.match(option.commandLineMatcher);
                    if (!commandLineMatch) {
                        continue;
                    }
                    const outputMatcher = option.outputMatcher;
                    let outputMatch;
                    if (outputMatcher) {
                        outputMatch = terminalCommand.getOutputMatch(outputMatcher);
                    }
                    if (!outputMatch) {
                        continue;
                    }
                    const matchResult = { commandLineMatch, outputMatch, commandLine: terminalCommand.command };
                    quickFixes = option.getQuickFixes(matchResult);
                }
                if (quickFixes) {
                    for (const quickFix of (0, arrays_1.asArray)(quickFixes)) {
                        let action;
                        if ('type' in quickFix) {
                            switch (quickFix.type) {
                                case quickFix_1.TerminalQuickFixType.TerminalCommand: {
                                    const fix = quickFix;
                                    if (commandQuickFixSet.has(fix.terminalCommand)) {
                                        continue;
                                    }
                                    commandQuickFixSet.add(fix.terminalCommand);
                                    const label = (0, nls_1.localize)('quickFix.command', 'Run: {0}', fix.terminalCommand);
                                    action = {
                                        type: quickFix_1.TerminalQuickFixType.TerminalCommand,
                                        kind: option.kind,
                                        class: undefined,
                                        source: quickFix.source,
                                        id: quickFix.id,
                                        label,
                                        enabled: true,
                                        run: () => {
                                            onDidRequestRerunCommand?.fire({
                                                command: fix.terminalCommand,
                                                addNewLine: fix.addNewLine ?? true
                                            });
                                        },
                                        tooltip: label,
                                        command: fix.terminalCommand
                                    };
                                    break;
                                }
                                case quickFix_1.TerminalQuickFixType.Opener: {
                                    const fix = quickFix;
                                    if (!fix.uri) {
                                        return;
                                    }
                                    if (openQuickFixSet.has(fix.uri.toString())) {
                                        continue;
                                    }
                                    openQuickFixSet.add(fix.uri.toString());
                                    const isUrl = (fix.uri.scheme === network_1.Schemas.http || fix.uri.scheme === network_1.Schemas.https);
                                    const uriLabel = isUrl ? encodeURI(fix.uri.toString(true)) : labelService.getUriLabel(fix.uri);
                                    const label = (0, nls_1.localize)('quickFix.opener', 'Open: {0}', uriLabel);
                                    action = {
                                        source: quickFix.source,
                                        id: quickFix.id,
                                        label,
                                        type: quickFix_1.TerminalQuickFixType.Opener,
                                        kind: option.kind,
                                        class: undefined,
                                        enabled: true,
                                        run: () => openerService.open(fix.uri),
                                        tooltip: label,
                                        uri: fix.uri
                                    };
                                    break;
                                }
                                case quickFix_1.TerminalQuickFixType.Port: {
                                    const fix = quickFix;
                                    action = {
                                        source: 'builtin',
                                        type: fix.type,
                                        kind: option.kind,
                                        id: fix.id,
                                        label: fix.label,
                                        class: fix.class,
                                        enabled: fix.enabled,
                                        run: () => {
                                            fix.run();
                                        },
                                        tooltip: fix.tooltip
                                    };
                                    break;
                                }
                                case quickFix_1.TerminalQuickFixType.VscodeCommand: {
                                    const fix = quickFix;
                                    action = {
                                        source: quickFix.source,
                                        type: fix.type,
                                        kind: option.kind,
                                        id: fix.id,
                                        label: fix.title,
                                        class: undefined,
                                        enabled: true,
                                        run: () => commandService.executeCommand(fix.id),
                                        tooltip: fix.title
                                    };
                                    break;
                                }
                            }
                            if (action) {
                                fixes.push(action);
                            }
                        }
                    }
                }
            }
        }
        return fixes.length > 0 ? fixes : undefined;
    }
    exports.getQuickFixesForCommand = getQuickFixesForCommand;
    function convertToQuickFixOptions(selectorProvider) {
        return {
            id: selectorProvider.selector.id,
            type: 'resolved',
            commandLineMatcher: selectorProvider.selector.commandLineMatcher,
            outputMatcher: selectorProvider.selector.outputMatcher,
            commandExitResult: selectorProvider.selector.commandExitResult,
            kind: selectorProvider.selector.kind,
            getQuickFixes: selectorProvider.provider.provideTerminalQuickFixes
        };
    }
    class TerminalQuickFixItem {
        constructor(action, type, source, title, kind = 'fix') {
            this.action = action;
            this.type = type;
            this.source = source;
            this.title = title;
            this.kind = kind;
            this.disabled = false;
        }
    }
    function toActionWidgetItems(inputQuickFixes, showHeaders) {
        const menuItems = [];
        menuItems.push({
            kind: "header" /* ActionListItemKind.Header */,
            group: {
                kind: types_1.CodeActionKind.QuickFix,
                title: (0, nls_1.localize)('codeAction.widget.id.quickfix', 'Quick Fix')
            }
        });
        for (const quickFix of showHeaders ? inputQuickFixes : inputQuickFixes.filter(i => !!i.action)) {
            if (!quickFix.disabled && quickFix.action) {
                menuItems.push({
                    kind: "action" /* ActionListItemKind.Action */,
                    item: quickFix,
                    group: {
                        kind: types_1.CodeActionKind.QuickFix,
                        icon: getQuickFixIcon(quickFix),
                        title: quickFix.action.label
                    },
                    disabled: false,
                    label: quickFix.title
                });
            }
        }
        return menuItems;
    }
    function getQuickFixIcon(quickFix) {
        if (quickFix.kind === 'explain') {
            return codicons_1.Codicon.sparkle;
        }
        switch (quickFix.type) {
            case quickFix_1.TerminalQuickFixType.Opener:
                if ('uri' in quickFix.action && quickFix.action.uri) {
                    const isUrl = (quickFix.action.uri.scheme === network_1.Schemas.http || quickFix.action.uri.scheme === network_1.Schemas.https);
                    return isUrl ? codicons_1.Codicon.linkExternal : codicons_1.Codicon.goToFile;
                }
            case quickFix_1.TerminalQuickFixType.TerminalCommand:
                return codicons_1.Codicon.run;
            case quickFix_1.TerminalQuickFixType.Port:
                return codicons_1.Codicon.debugDisconnect;
            case quickFix_1.TerminalQuickFixType.VscodeCommand:
                return codicons_1.Codicon.lightbulb;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVpY2tGaXhBZGRvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsQ29udHJpYi9xdWlja0ZpeC9icm93c2VyL3F1aWNrRml4QWRkb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBbUNoRyxNQUFNLGVBQWUsR0FBRzs7Ozs7S0FLdkIsQ0FBQztJQVlLLElBQU0scUJBQXFCLEdBQTNCLE1BQU0scUJBQXNCLFNBQVEsc0JBQVU7UUFrQnBELFlBQ2tCLFFBQWdDLEVBQ2hDLGFBQXVDLEVBQzlCLGdCQUEyRCxFQUNwRSxlQUFpRCxFQUMzQyxxQkFBNkQsRUFDbEUsZ0JBQW1ELEVBQ3JELGNBQStDLEVBQzVDLGlCQUFxRCxFQUNyRCxpQkFBcUQsRUFDbEQsb0JBQTJELEVBQ2xFLGFBQTZDO1lBRTVELEtBQUssRUFBRSxDQUFDO1lBWlMsYUFBUSxHQUFSLFFBQVEsQ0FBd0I7WUFDaEMsa0JBQWEsR0FBYixhQUFhLENBQTBCO1lBQ2IscUJBQWdCLEdBQWhCLGdCQUFnQixDQUEwQjtZQUNuRCxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7WUFDMUIsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQUNqRCxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1lBQ3BDLG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtZQUMzQixzQkFBaUIsR0FBakIsaUJBQWlCLENBQW1CO1lBQ3BDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBbUI7WUFDakMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFzQjtZQUNqRCxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtZQTVCNUMsOEJBQXlCLEdBQUcsSUFBSSxlQUFPLEVBQTZDLENBQUM7WUFDN0YsNkJBQXdCLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLEtBQUssQ0FBQztZQUlqRSxzQkFBaUIs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