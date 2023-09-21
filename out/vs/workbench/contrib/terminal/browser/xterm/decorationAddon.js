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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/actions", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/themables", "vs/nls", "vs/platform/audioCues/browser/audioCueService", "vs/platform/clipboard/common/clipboardService", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/platform/quickinput/common/quickInput", "vs/platform/theme/common/themeService", "vs/workbench/contrib/terminal/browser/terminalIcons", "vs/workbench/contrib/terminal/browser/xterm/decorationStyles", "vs/workbench/contrib/terminal/common/terminalColorRegistry", "vs/workbench/services/lifecycle/common/lifecycle"], function (require, exports, dom, actions_1, event_1, lifecycle_1, themables_1, nls_1, audioCueService_1, clipboardService_1, commands_1, configuration_1, contextView_1, instantiation_1, notification_1, opener_1, quickInput_1, themeService_1, terminalIcons_1, decorationStyles_1, terminalColorRegistry_1, lifecycle_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DecorationAddon = void 0;
    let DecorationAddon = class DecorationAddon extends lifecycle_1.Disposable {
        constructor(_capabilities, _clipboardService, _contextMenuService, _configurationService, _themeService, _openerService, _quickInputService, lifecycleService, _commandService, instantiationService, _audioCueService, _notificationService) {
            super();
            this._capabilities = _capabilities;
            this._clipboardService = _clipboardService;
            this._contextMenuService = _contextMenuService;
            this._configurationService = _configurationService;
            this._themeService = _themeService;
            this._openerService = _openerService;
            this._quickInputService = _quickInputService;
            this._commandService = _commandService;
            this._audioCueService = _audioCueService;
            this._notificationService = _notificationService;
            this._capabilityDisposables = new Map();
            this._decorations = new Map();
            this._onDidRequestRunCommand = this._register(new event_1.Emitter());
            this.onDidRequestRunCommand = this._onDidRequestRunCommand.event;
            this._register((0, lifecycle_1.toDisposable)(() => this._dispose()));
            this._register(this._configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("terminal.integrated.fontSize" /* TerminalSettingId.FontSize */) || e.affectsConfiguration("terminal.integrated.lineHeight" /* TerminalSettingId.LineHeight */)) {
                    this.refreshLayouts();
                }
                else if (e.affectsConfiguration('workbench.colorCustomizations')) {
                    this._refreshStyles(true);
                }
                else if (e.affectsConfiguration("terminal.integrated.shellIntegration.decorationsEnabled" /* TerminalSettingId.ShellIntegrationDecorationsEnabled */)) {
                    this._removeCapabilityDisposables(2 /* TerminalCapability.CommandDetection */);
                    this._updateDecorationVisibility();
                }
            }));
            this._register(this._themeService.onDidColorThemeChange(() => this._refreshStyles(true)));
            this._updateDecorationVisibility();
            this._register(this._capabilities.onDidAddCapabilityType(c => this._createCapabilityDisposables(c)));
            this._register(this._capabilities.onDidRemoveCapabilityType(c => this._removeCapabilityDisposables(c)));
            this._register(lifecycleService.onWillShutdown(() => this._disposeAllDecorations()));
            this._terminalDecorationHoverService = instantiationService.createInstance(decorationStyles_1.TerminalDecorationHoverManager);
        }
        _removeCapabilityDisposables(c) {
            const disposables = this._capabilityDisposables.get(c);
            if (disposables) {
                (0, lifecycle_1.dispose)(disposables);
            }
            this._capabilityDisposables.delete(c);
        }
        _createCapabilityDisposables(c) {
            let disposables = [];
            const capability = this._capabilities.get(c);
            if (!capability || this._capabilityDisposables.has(c)) {
                return;
            }
            switch (capability.type) {
                case 4 /* TerminalCapability.BufferMarkDetection */:
                    disposables = [capability.onMarkAdded(mark => this.registerMarkDecoration(mark))];
                    break;
                case 2 /* TerminalCapability.CommandDetection */:
                    disposables = this._getCommandDetectionListeners(capability);
                    break;
            }
            this._capabilityDisposables.set(c, disposables);
        }
        registerMarkDecoration(mark) {
            if (!this._terminal || (!this._showGutterDecorations && !this._showOverviewRulerDecorations)) {
                return undefined;
            }
            if (mark.hidden) {
                return undefined;
            }
            return this.registerCommandDecoration(undefined, undefined, mark);
        }
        _updateDecorationVisibility() {
            const showDecorations = this._configurationService.getValue("terminal.integrated.shellIntegration.decorationsEnabled" /* TerminalSettingId.ShellIntegrationDecorationsEnabled */);
            this._showGutterDecorations = (showDecorations === 'both' || showDecorations === 'gutter');
            this._showOverviewRulerDecorations = (showDecorations === 'both' || showDecorations === 'overviewRuler');
            this._disposeAllDecorations();
            if (this._showGutterDecorations || this._showOverviewRulerDecorations) {
                this._attachToCommandCapability();
                this._updateGutterDecorationVisibility();
            }
            const currentCommand = this._capabilities.get(2 /* TerminalCapability.CommandDetection */)?.executingCommandObject;
            if (currentCommand) {
                this.registerCommandDecoration(currentCommand, true);
            }
        }
        _disposeAllDecorations() {
            this._placeholderDecoration?.dispose();
            for (const value of this._decorations.values()) {
                value.decoration.dispose();
                (0, lifecycle_1.dispose)(value.disposables);
            }
        }
        _updateGutterDecorationVisibility() {
            const commandDecorationElements = document.querySelectorAll("terminal-command-decoration" /* DecorationSelector.CommandDecoration */);
            for (const commandDecorationElement of commandDecorationElements) {
                this._updateCommandDecorationVisibility(commandDecorationElement);
            }
        }
        _updateCommandDecorationVisibility(commandDecorationElement) {
            if (this._showGutterDecorations) {
                commandDecorationElement.classList.remove("hide" /* DecorationSelector.Hide */);
            }
            else {
                commandDecorationElement.classList.add("hide" /* DecorationSelector.Hide */);
            }
        }
        refreshLayouts() {
            (0, decorationStyles_1.updateLayout)(this._configurationService, this._placeholderDecoration?.element);
            for (const decoration of this._decorations) {
                (0, decorationStyles_1.updateLayout)(this._configurationService, decoration[1].decoration.element);
            }
        }
        _refreshStyles(refreshOverviewRulerColors) {
            if (refreshOverviewRulerColors) {
                for (const decoration of this._decorations.values()) {
                    const color = this._getDecorationCssColor(decoration)?.toString() ?? '';
                    if (decoration.decoration.options?.overviewRulerOptions) {
                        decoration.decoration.options.overviewRulerOptions.color = color;
                    }
                    else if (decoration.decoration.options) {
                        decoration.decoration.options.overviewRulerOptions = { color };
                    }
                }
            }
            this._updateClasses(this._placeholderDecoration?.element);
            for (const decoration of this._decorations.values()) {
                this._updateClasses(decoration.decoration.element, decoration.exitCode, decoration.markProperties);
            }
        }
        _dispose() {
            this._terminalDecorationHoverService.dispose();
            for (const disposable of this._capabilityDisposables.values()) {
                (0, lifecycle_1.dispose)(disposable);
            }
            this.clearDecorations();
        }
        _clearPlaceholder() {
            this._placeholderDecoration?.dispose();
            this._placeholderDecoration = undefined;
        }
        clearDecorations() {
            this._placeholderDecoration?.marker.dispose();
            this._clearPlaceholder();
            this._disposeAllDecorations();
            this._decorations.clear();
        }
        _attachToCommandCapability() {
            if (this._capabilities.has(2 /* TerminalCapability.CommandDetection */)) {
                this._getCommandDetectionListeners(this._capabilities.get(2 /* TerminalCapability.CommandDetection */));
            }
        }
        _getCommandDetectionListeners(capability) {
            if (this._capabilityDisposables.has(2 /* TerminalCapability.CommandDetection */)) {
                const disposables = this._capabilityDisposables.get(2 /* TerminalCapability.CommandDetection */);
                (0, lifecycle_1.dispose)(disposables);
                this._capabilityDisposables.delete(capability.type);
            }
            const commandDetectionListeners = [];
            // Command started
            if (capability.executingCommandObject?.marker) {
                this.registerCommandDecoration(capability.executingCommandObject, true);
            }
            commandDetectionListeners.push(capability.onCommandStarted(command => this.registerCommandDecoration(command, true)));
            // Command finished
            for (const command of capability.commands) {
                this.registerCommandDecoration(command);
            }
            commandDetectionListeners.push(capability.onCommandFinished(command => {
                this.registerCommandDecoration(command);
                if (command.exitCode) {
                    this._audioCueService.playAudioCue(audioCueService_1.AudioCue.terminalCommandFailed);
                }
            }));
            // Command invalidated
            commandDetectionListeners.push(capability.onCommandInvalidated(commands => {
                for (const command of commands) {
                    const id = command.marker?.id;
                    if (id) {
                        const match = this._decorations.get(id);
                        if (match) {
                            match.decoration.dispose();
                            (0, lifecycle_1.dispose)(match.disposables);
                        }
                    }
                }
            }));
            // Current command invalidated
            commandDetectionListeners.push(capability.onCurrentCommandInvalidated((request) => {
                if (request.reason === "noProblemsReported" /* CommandInvalidationReason.NoProblemsReported */) {
                    const lastDecoration = Array.from(this._decorations.entries())[this._decorations.size - 1];
                    lastDecoration?.[1].decoration.dispose();
                }
                else if (request.reason === "windows" /* CommandInvalidationReason.Windows */) {
                    this._clearPlaceholder();
                }
            }));
            return commandDetectionListeners;
        }
        activate(terminal) {
            this._terminal = terminal;
            this._attachToCommandCapability();
        }
        registerCommandDecoration(command, beforeCommandExecution, markProperties) {
            if (!this._terminal || (beforeCommandExecution && !command) || (!this._showGutterDecorations && !this._showOverviewRulerDecorations)) {
                return undefined;
            }
            const marker = command?.marker || markProperties?.marker;
            if (!marker) {
                throw new Error(`cannot add a decoration for a command ${JSON.stringify(command)} with no marker`);
            }
            this._clearPlaceholder();
            const color = this._getDecorationCssColor(command)?.toString() ?? '';
            const decoration = this._terminal.registerDecoration({
                marker,
                overviewRulerOptions: this._showOverviewRulerDecorations ? (beforeCommandExecution
                    ? { color, position: 'left' }
                    : { color, position: command?.exitCode ? 'right' : 'left' }) : undefined
            });
            if (!decoration) {
                return undefined;
            }
            if (beforeCommandExecution) {
                this._placeholderDecoration = decoration;
            }
            decoration.onRender(element => {
                if (element.classList.contains(".xterm-decoration-overview-ruler" /* DecorationSelector.OverviewRuler */)) {
                    return;
                }
                if (!this._decorations.get(decoration.marker.id)) {
                    decoration.onDispose(() => this._decorations.delete(decoration.marker.id));
                    this._decorations.set(decoration.marker.id, {
                        decoration,
                        disposables: this._createDisposables(element, command, markProperties),
                        exitCode: command?.exitCode,
                        markProperties: command?.markProperties
                    });
                }
                if (!element.classList.contains("codicon" /* DecorationSelector.Codicon */) || command?.marker?.line === 0) {
                    // first render or buffer was cleared
                    (0, decorationStyles_1.updateLayout)(this._configurationService, element);
                    this._updateClasses(element, command?.exitCode, command?.markProperties || markProperties);
                }
            });
            return decoration;
        }
        _createDisposables(element, command, markProperties) {
            if (command?.exitCode === undefined && !command?.markProperties) {
                return [];
            }
            else if (command?.markProperties || markProperties) {
                return [this._terminalDecorationHoverService.createHover(element, command || markProperties, markProperties?.hoverMessage)];
            }
            return [this._createContextMenu(element, command), this._terminalDecorationHoverService.createHover(element, command)];
        }
        _updateClasses(element, exitCode, markProperties) {
            if (!element) {
                return;
            }
            for (const classes of element.classList) {
                element.classList.remove(classes);
            }
            element.classList.add("terminal-command-decoration" /* DecorationSelector.CommandDecoration */, "codicon" /* DecorationSelector.Codicon */, "xterm-decoration" /* DecorationSelector.XtermDecoration */);
            if (markProperties) {
                element.classList.add("default-color" /* DecorationSelector.DefaultColor */, ...themables_1.ThemeIcon.asClassNameArray(terminalIcons_1.terminalDecorationMark));
                if (!markProperties.hoverMessage) {
                    //disable the mouse pointer
                    element.classList.add("default" /* DecorationSelector.Default */);
                }
            }
            else {
                // command decoration
                this._updateCommandDecorationVisibility(element);
                if (exitCode === undefined) {
                    element.classList.add("default-color" /* DecorationSelector.DefaultColor */, "default" /* DecorationSelector.Default */);
                    element.classList.add(...themables_1.ThemeIcon.asClassNameArray(terminalIcons_1.terminalDecorationIncomplete));
                }
                else if (exitCode) {
                    element.classList.add("error" /* DecorationSelector.ErrorColor */);
                    element.classList.add(...themables_1.ThemeIcon.asClassNameArray(terminalIcons_1.terminalDecorationError));
                }
                else {
                    element.classList.add(...themables_1.ThemeIcon.asClassNameArray(terminalIcons_1.terminalDecorationSuccess));
                }
            }
        }
        _createContextMenu(element, command) {
            // When the xterm Decoration gets disposed of, its element gets removed from the dom
            // along with its listeners
            return dom.addDisposableListener(element, dom.EventType.CLICK, async () => {
                this._terminalDecorationHoverService.hideHover();
                const actions = await this._getCommandActions(command);
                this._contextMenuService.showContextMenu({ getAnchor: () => element, getActions: () => actions });
            });
        }
        async _getCommandActions(command) {
            const actions = [];
            if (command.command !== '') {
                const labelRun = (0, nls_1.localize)("terminal.rerunCommand", 'Rerun Command');
                actions.push({
                    class: undefined, tooltip: labelRun, id: 'terminal.rerunCommand', label: labelRun, enabled: true,
                    run: async () => {
                        if (command.command === '') {
                            return;
                        }
                        if (!command.isTrusted) {
                            const shouldRun = await new Promise(r => {
                                this._notificationService.prompt(notification_1.Severity.Info, (0, nls_1.localize)('rerun', 'Do you want to run the command: {0}', command.command), [{
                                        label: (0, nls_1.localize)('yes', 'Yes'),
                                        run: () => r(true)
                                    }, {
                                        label: (0, nls_1.localize)('no', 'No'),
                                        run: () => r(false)
                                    }]);
                            });
                            if (!shouldRun) {
                                return;
                            }
                        }
                        this._onDidRequestRunCommand.fire({ command });
                    }
                });
                // The second section is the clipboard section
                actions.push(new actions_1.Separator());
                const labelCopy = (0, nls_1.localize)("terminal.copyCommand", 'Copy Command');
                actions.push({
                    class: undefined, tooltip: labelCopy, id: 'terminal.copyCommand', label: labelCopy, enabled: true,
                    run: () => this._clipboardService.writeText(command.command)
                });
            }
            if (command.hasOutput()) {
                const labelCopyCommandAndOutput = (0, nls_1.localize)("terminal.copyCommandAndOutput", 'Copy Command and Output');
                actions.push({
                    class: undefined, tooltip: labelCopyCommandAndOutput, id: 'terminal.copyCommandAndOutput', label: labelCopyCommandAndOutput, enabled: true,
                    run: () => {
                        const output = command.getOutput();
                        if (typeof output === 'string') {
                            this._clipboardService.writeText(`${command.command !== '' ? command.command + '\n' : ''}${output}`);
                        }
                    }
                });
                const labelText = (0, nls_1.localize)("terminal.copyOutput", 'Copy Output');
                actions.push({
                    class: undefined, tooltip: labelText, id: 'terminal.copyOutput', label: labelText, enabled: true,
                    run: () => {
                        const text = command.getOutput();
                        if (typeof text === 'string') {
                            this._clipboardService.writeText(text);
                        }
                    }
                });
                const labelHtml = (0, nls_1.localize)("terminal.copyOutputAsHtml", 'Copy Output as HTML');
                actions.push({
                    class: undefined, tooltip: labelHtml, id: 'terminal.copyOutputAsHtml', label: labelHtml, enabled: true,
                    run: () => this._onDidRequestRunCommand.fire({ command, copyAsHtml: true })
                });
            }
            if (actions.length > 0) {
                actions.push(new actions_1.Separator());
            }
            const labelRunRecent = (0, nls_1.localize)('workbench.action.terminal.runRecentCommand', "Run Recent Command");
            actions.push({
                class: undefined, tooltip: labelRunRecent, id: 'workbench.action.terminal.runRecentCommand', label: labelRunRecent, enabled: true,
                run: () => this._commandService.executeCommand('workbench.action.terminal.runRecentCommand')
            });
            const labelGoToRecent = (0, nls_1.localize)('workbench.action.terminal.goToRecentDirectory', "Go To Recent Directory");
            actions.push({
                class: undefined, tooltip: labelRunRecent, id: 'workbench.action.terminal.goToRecentDirectory', label: labelGoToRecent, enabled: true,
                run: () => this._commandService.executeCommand('workbench.action.terminal.goToRecentDirectory')
            });
            actions.push(new actions_1.Separator());
            const labelConfigure = (0, nls_1.localize)("terminal.configureCommandDecorations", 'Configure Command Decorations');
            actions.push({
                class: undefined, tooltip: labelConfigure, id: 'terminal.configureCommandDecorations', label: labelConfigure, enabled: true,
                run: () => this._showConfigureCommandDecorationsQuickPick()
            });
            const labelAbout = (0, nls_1.localize)("terminal.learnShellIntegration", 'Learn About Shell Integration');
            actions.push({
                class: undefined, tooltip: labelAbout, id: 'terminal.learnShellIntegration', label: labelAbout, enabled: true,
                run: () => this._openerService.open('https://code.visualstudio.com/docs/terminal/shell-integration')
            });
            return actions;
        }
        async _showConfigureCommandDecorationsQuickPick() {
            const quickPick = this._quickInputService.createQuickPick();
            quickPick.items = [
                { id: 'a', label: (0, nls_1.localize)('toggleVisibility', 'Toggle visibility') },
            ];
            quickPick.canSelectMany = false;
            quickPick.onDidAccept(async (e) => {
                quickPick.hide();
                const result = quickPick.activeItems[0];
                switch (result.id) {
                    case 'a':
                        this._showToggleVisibilityQuickPick();
                        break;
                }
            });
            quickPick.show();
        }
        _showToggleVisibilityQuickPick() {
            const quickPick = this._quickInputService.createQuickPick();
            quickPick.hideInput = true;
            quickPick.hideCheckAll = true;
            quickPick.canSelectMany = true;
            quickPick.title = (0, nls_1.localize)('toggleVisibility', 'Toggle visibility');
            const configValue = this._configurationService.getValue("terminal.integrated.shellIntegration.decorationsEnabled" /* TerminalSettingId.ShellIntegrationDecorationsEnabled */);
            const gutterIcon = {
                label: (0, nls_1.localize)('gutter', 'Gutter command decorations'),
                picked: configValue !== 'never' && configValue !== 'overviewRuler'
            };
            const overviewRulerIcon = {
                label: (0, nls_1.localize)('overviewRuler', 'Overview ruler command decorations'),
                picked: configValue !== 'never' && configValue !== 'gutter'
            };
            quickPick.items = [gutterIcon, overviewRulerIcon];
            const selectedItems = [];
            if (configValue !== 'never') {
                if (configValue !== 'gutter') {
                    selectedItems.push(gutterIcon);
                }
                if (configValue !== 'overviewRuler') {
                    selectedItems.push(overviewRulerIcon);
                }
            }
            quickPick.selectedItems = selectedItems;
            quickPick.onDidChangeSelection(async (e) => {
                let newValue = 'never';
                if (e.includes(gutterIcon)) {
                    if (e.includes(overviewRulerIcon)) {
                        newValue = 'both';
                    }
                    else {
                        newValue = 'gutter';
                    }
                }
                else if (e.includes(overviewRulerIcon)) {
                    newValue = 'overviewRuler';
                }
                await this._configurationService.updateValue("terminal.integrated.shellIntegration.decorationsEnabled" /* TerminalSettingId.ShellIntegrationDecorationsEnabled */, newValue);
            });
            quickPick.ok = false;
            quickPick.show();
        }
        _getDecorationCssColor(decorationOrCommand) {
            let colorId;
            if (decorationOrCommand?.exitCode === undefined) {
                colorId = terminalColorRegistry_1.TERMINAL_COMMAND_DECORATION_DEFAULT_BACKGROUND_COLOR;
            }
            else {
                colorId = decorationOrCommand.exitCode ? terminalColorRegistry_1.TERMINAL_COMMAND_DECORATION_ERROR_BACKGROUND_COLOR : terminalColorRegistry_1.TERMINAL_COMMAND_DECORATION_SUCCESS_BACKGROUND_COLOR;
            }
            return this._themeService.getColorTheme().getColor(colorId)?.toString();
        }
    };
    exports.DecorationAddon = DecorationAddon;
    exports.DecorationAddon = DecorationAddon = __decorate([
        __param(1, clipboardService_1.IClipboardService),
        __param(2, contextView_1.IContextMenuService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, themeService_1.IThemeService),
        __param(5, opener_1.IOpenerService),
        __param(6, quickInput_1.IQuickInputService),
        __param(7, lifecycle_2.ILifecycleService),
        __param(8, commands_1.ICommandService),
        __param(9, instantiation_1.IInstantiationService),
        __param(10, audioCueService_1.IAudioCueService),
        __param(11, notification_1.INotificationService)
    ], DecorationAddon);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVjb3JhdGlvbkFkZG9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWwvYnJvd3Nlci94dGVybS9kZWNvcmF0aW9uQWRkb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBNEJ6RixJQUFNLGVBQWUsR0FBckIsTUFBTSxlQUFnQixTQUFRLHNCQUFVO1FBWTlDLFlBQ2tCLGFBQXVDLEVBQ3JDLGlCQUFxRCxFQUNuRCxtQkFBeUQsRUFDdkQscUJBQTZELEVBQ3JFLGFBQTZDLEVBQzVDLGNBQStDLEVBQzNDLGtCQUF1RCxFQUN4RCxnQkFBbUMsRUFDckMsZUFBaUQsRUFDM0Msb0JBQTJDLEVBQ2hELGdCQUFtRCxFQUMvQyxvQkFBMkQ7WUFFakYsS0FBSyxFQUFFLENBQUM7WUFiUyxrQkFBYSxHQUFiLGFBQWEsQ0FBMEI7WUFDcEIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFtQjtZQUNsQyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1lBQ3RDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFDcEQsa0JBQWEsR0FBYixhQUFhLENBQWU7WUFDM0IsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1lBQzFCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7WUFFekMsb0JBQWUsR0FBZixlQUFlLENBQWlCO1lBRS9CLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7WUFDOUIseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFzQjtZQXRCMUUsMkJBQXNCLEdBQTJDLElBQUksR0FBRyxFQUFFLENBQUM7WUFDM0UsaUJBQVksR0FBdUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQU1wRCw0QkFBdUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUF1RCxDQUFDLENBQUM7WUFDckgsMkJBQXNCLEdBQUcs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