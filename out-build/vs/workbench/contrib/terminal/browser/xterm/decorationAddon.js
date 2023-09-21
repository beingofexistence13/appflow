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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/actions", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/themables", "vs/nls!vs/workbench/contrib/terminal/browser/xterm/decorationAddon", "vs/platform/audioCues/browser/audioCueService", "vs/platform/clipboard/common/clipboardService", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/platform/quickinput/common/quickInput", "vs/platform/theme/common/themeService", "vs/workbench/contrib/terminal/browser/terminalIcons", "vs/workbench/contrib/terminal/browser/xterm/decorationStyles", "vs/workbench/contrib/terminal/common/terminalColorRegistry", "vs/workbench/services/lifecycle/common/lifecycle"], function (require, exports, dom, actions_1, event_1, lifecycle_1, themables_1, nls_1, audioCueService_1, clipboardService_1, commands_1, configuration_1, contextView_1, instantiation_1, notification_1, opener_1, quickInput_1, themeService_1, terminalIcons_1, decorationStyles_1, terminalColorRegistry_1, lifecycle_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Cib = void 0;
    let $Cib = class $Cib extends lifecycle_1.$kc {
        constructor(s, t, u, w, y, z, C, lifecycleService, D, instantiationService, F, G) {
            super();
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            this.C = C;
            this.D = D;
            this.F = F;
            this.G = G;
            this.b = new Map();
            this.f = new Map();
            this.n = this.B(new event_1.$fd());
            this.onDidRequestRunCommand = this.n.event;
            this.B((0, lifecycle_1.$ic)(() => this.P()));
            this.B(this.w.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("terminal.integrated.fontSize" /* TerminalSettingId.FontSize */) || e.affectsConfiguration("terminal.integrated.lineHeight" /* TerminalSettingId.LineHeight */)) {
                    this.refreshLayouts();
                }
                else if (e.affectsConfiguration('workbench.colorCustomizations')) {
                    this.O(true);
                }
                else if (e.affectsConfiguration("terminal.integrated.shellIntegration.decorationsEnabled" /* TerminalSettingId.ShellIntegrationDecorationsEnabled */)) {
                    this.H(2 /* TerminalCapability.CommandDetection */);
                    this.J();
                }
            }));
            this.B(this.y.onDidColorThemeChange(() => this.O(true)));
            this.J();
            this.B(this.s.onDidAddCapabilityType(c => this.I(c)));
            this.B(this.s.onDidRemoveCapabilityType(c => this.H(c)));
            this.B(lifecycleService.onWillShutdown(() => this.L()));
            this.m = instantiationService.createInstance(decorationStyles_1.$Aib);
        }
        H(c) {
            const disposables = this.b.get(c);
            if (disposables) {
                (0, lifecycle_1.$fc)(disposables);
            }
            this.b.delete(c);
        }
        I(c) {
            let disposables = [];
            const capability = this.s.get(c);
            if (!capability || this.b.has(c)) {
                return;
            }
            switch (capability.type) {
                case 4 /* TerminalCapability.BufferMarkDetection */:
                    disposables = [capability.onMarkAdded(mark => this.registerMarkDecoration(mark))];
                    break;
                case 2 /* TerminalCapability.CommandDetection */:
                    disposables = this.S(capability);
                    break;
            }
            this.b.set(c, disposables);
        }
        registerMarkDecoration(mark) {
            if (!this.a || (!this.h && !this.j)) {
                return undefined;
            }
            if (mark.hidden) {
                return undefined;
            }
            return this.registerCommandDecoration(undefined, undefined, mark);
        }
        J() {
            const showDecorations = this.w.getValue("terminal.integrated.shellIntegration.decorationsEnabled" /* TerminalSettingId.ShellIntegrationDecorationsEnabled */);
            this.h = (showDecorations === 'both' || showDecorations === 'gutter');
            this.j = (showDecorations === 'both' || showDecorations === 'overviewRuler');
            this.L();
            if (this.h || this.j) {
                this.R();
                this.M();
            }
            const currentCommand = this.s.get(2 /* TerminalCapability.CommandDetection */)?.executingCommandObject;
            if (currentCommand) {
                this.registerCommandDecoration(currentCommand, true);
            }
        }
        L() {
            this.g?.dispose();
            for (const value of this.f.values()) {
                value.decoration.dispose();
                (0, lifecycle_1.$fc)(value.disposables);
            }
        }
        M() {
            const commandDecorationElements = document.querySelectorAll("terminal-command-decoration" /* DecorationSelector.CommandDecoration */);
            for (const commandDecorationElement of commandDecorationElements) {
                this.N(commandDecorationElement);
            }
        }
        N(commandDecorationElement) {
            if (this.h) {
                commandDecorationElement.classList.remove("hide" /* DecorationSelector.Hide */);
            }
            else {
                commandDecorationElement.classList.add("hide" /* DecorationSelector.Hide */);
            }
        }
        refreshLayouts() {
            (0, decorationStyles_1.$Bib)(this.w, this.g?.element);
            for (const decoration of this.f) {
                (0, decorationStyles_1.$Bib)(this.w, decoration[1].decoration.element);
            }
        }
        O(refreshOverviewRulerColors) {
            if (refreshOverviewRulerColors) {
                for (const decoration of this.f.values()) {
                    const color = this.ab(decoration)?.toString() ?? '';
                    if (decoration.decoration.options?.overviewRulerOptions) {
                        decoration.decoration.options.overviewRulerOptions.color = color;
                    }
                    else if (decoration.decoration.options) {
                        decoration.decoration.options.overviewRulerOptions = { color };
                    }
                }
            }
            this.W(this.g?.element);
            for (const decoration of this.f.values()) {
                this.W(decoration.decoration.element, decoration.exitCode, decoration.markProperties);
            }
        }
        P() {
            this.m.dispose();
            for (const disposable of this.b.values()) {
                (0, lifecycle_1.$fc)(disposable);
            }
            this.clearDecorations();
        }
        Q() {
            this.g?.dispose();
            this.g = undefined;
        }
        clearDecorations() {
            this.g?.marker.dispose();
            this.Q();
            this.L();
            this.f.clear();
        }
        R() {
            if (this.s.has(2 /* TerminalCapability.CommandDetection */)) {
                this.S(this.s.get(2 /* TerminalCapability.CommandDetection */));
            }
        }
        S(capability) {
            if (this.b.has(2 /* TerminalCapability.CommandDetection */)) {
                const disposables = this.b.get(2 /* TerminalCapability.CommandDetection */);
                (0, lifecycle_1.$fc)(disposables);
                this.b.delete(capability.type);
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
                    this.F.playAudioCue(audioCueService_1.$wZ.terminalCommandFailed);
                }
            }));
            // Command invalidated
            commandDetectionListeners.push(capability.onCommandInvalidated(commands => {
                for (const command of commands) {
                    const id = command.marker?.id;
                    if (id) {
                        const match = this.f.get(id);
                        if (match) {
                            match.decoration.dispose();
                            (0, lifecycle_1.$fc)(match.disposables);
                        }
                    }
                }
            }));
            // Current command invalidated
            commandDetectionListeners.push(capability.onCurrentCommandInvalidated((request) => {
                if (request.reason === "noProblemsReported" /* CommandInvalidationReason.NoProblemsReported */) {
                    const lastDecoration = Array.from(this.f.entries())[this.f.size - 1];
                    lastDecoration?.[1].decoration.dispose();
                }
                else if (request.reason === "windows" /* CommandInvalidationReason.Windows */) {
                    this.Q();
                }
            }));
            return commandDetectionListeners;
        }
        activate(terminal) {
            this.a = terminal;
            this.R();
        }
        registerCommandDecoration(command, beforeCommandExecution, markProperties) {
            if (!this.a || (beforeCommandExecution && !command) || (!this.h && !this.j)) {
                return undefined;
            }
            const marker = command?.marker || markProperties?.marker;
            if (!marker) {
                throw new Error(`cannot add a decoration for a command ${JSON.stringify(command)} with no marker`);
            }
            this.Q();
            const color = this.ab(command)?.toString() ?? '';
            const decoration = this.a.registerDecoration({
                marker,
                overviewRulerOptions: this.j ? (beforeCommandExecution
                    ? { color, position: 'left' }
                    : { color, position: command?.exitCode ? 'right' : 'left' }) : undefined
            });
            if (!decoration) {
                return undefined;
            }
            if (beforeCommandExecution) {
                this.g = decoration;
            }
            decoration.onRender(element => {
                if (element.classList.contains(".xterm-decoration-overview-ruler" /* DecorationSelector.OverviewRuler */)) {
                    return;
                }
                if (!this.f.get(decoration.marker.id)) {
                    decoration.onDispose(() => this.f.delete(decoration.marker.id));
                    this.f.set(decoration.marker.id, {
                        decoration,
                        disposables: this.U(element, command, markProperties),
                        exitCode: command?.exitCode,
                        markProperties: command?.markProperties
                    });
                }
                if (!element.classList.contains("codicon" /* DecorationSelector.Codicon */) || command?.marker?.line === 0) {
                    // first render or buffer was cleared
                    (0, decorationStyles_1.$Bib)(this.w, element);
                    this.W(element, command?.exitCode, command?.markProperties || markProperties);
                }
            });
            return decoration;
        }
        U(element, command, markProperties) {
            if (command?.exitCode === undefined && !command?.markProperties) {
                return [];
            }
            else if (command?.markProperties || markProperties) {
                return [this.m.createHover(element, command || markProperties, markProperties?.hoverMessage)];
            }
            return [this.X(element, command), this.m.createHover(element, command)];
        }
        W(element, exitCode, markProperties) {
            if (!element) {
                return;
            }
            for (const classes of element.classList) {
                element.classList.remove(classes);
            }
            element.classList.add("terminal-command-decoration" /* DecorationSelector.CommandDecoration */, "codicon" /* DecorationSelector.Codicon */, "xterm-decoration" /* DecorationSelector.XtermDecoration */);
            if (markProperties) {
                element.classList.add("default-color" /* DecorationSelector.DefaultColor */, ...themables_1.ThemeIcon.asClassNameArray(terminalIcons_1.$sib));
                if (!markProperties.hoverMessage) {
                    //disable the mouse pointer
                    element.classList.add("default" /* DecorationSelector.Default */);
                }
            }
            else {
                // command decoration
                this.N(element);
                if (exitCode === undefined) {
                    element.classList.add("default-color" /* DecorationSelector.DefaultColor */, "default" /* DecorationSelector.Default */);
                    element.classList.add(...themables_1.ThemeIcon.asClassNameArray(terminalIcons_1.$tib));
                }
                else if (exitCode) {
                    element.classList.add("error" /* DecorationSelector.ErrorColor */);
                    element.classList.add(...themables_1.ThemeIcon.asClassNameArray(terminalIcons_1.$uib));
                }
                else {
                    element.classList.add(...themables_1.ThemeIcon.asClassNameArray(terminalIcons_1.$vib));
                }
            }
        }
        X(element, command) {
            // When the xterm Decoration gets disposed of, its element gets removed from the dom
            // along with its listeners
            return dom.$nO(element, dom.$3O.CLICK, async () => {
                this.m.hideHover();
                const actions = await this.Y(command);
                this.u.showContextMenu({ getAnchor: () => element, getActions: () => actions });
            });
        }
        async Y(command) {
            const actions = [];
            if (command.command !== '') {
                const labelRun = (0, nls_1.localize)(0, null);
                actions.push({
                    class: undefined, tooltip: labelRun, id: 'terminal.rerunCommand', label: labelRun, enabled: true,
                    run: async () => {
                        if (command.command === '') {
                            return;
                        }
                        if (!command.isTrusted) {
                            const shouldRun = await new Promise(r => {
                                this.G.prompt(notification_1.Severity.Info, (0, nls_1.localize)(1, null, command.command), [{
                                        label: (0, nls_1.localize)(2, null),
                                        run: () => r(true)
                                    }, {
                                        label: (0, nls_1.localize)(3, null),
                                        run: () => r(false)
                                    }]);
                            });
                            if (!shouldRun) {
                                return;
                            }
                        }
                        this.n.fire({ command });
                    }
                });
                // The second section is the clipboard section
                actions.push(new actions_1.$ii());
                const labelCopy = (0, nls_1.localize)(4, null);
                actions.push({
                    class: undefined, tooltip: labelCopy, id: 'terminal.copyCommand', label: labelCopy, enabled: true,
                    run: () => this.t.writeText(command.command)
                });
            }
            if (command.hasOutput()) {
                const labelCopyCommandAndOutput = (0, nls_1.localize)(5, null);
                actions.push({
                    class: undefined, tooltip: labelCopyCommandAndOutput, id: 'terminal.copyCommandAndOutput', label: labelCopyCommandAndOutput, enabled: true,
                    run: () => {
                        const output = command.getOutput();
                        if (typeof output === 'string') {
                            this.t.writeText(`${command.command !== '' ? command.command + '\n' : ''}${output}`);
                        }
                    }
                });
                const labelText = (0, nls_1.localize)(6, null);
                actions.push({
                    class: undefined, tooltip: labelText, id: 'terminal.copyOutput', label: labelText, enabled: true,
                    run: () => {
                        const text = command.getOutput();
                        if (typeof text === 'string') {
                            this.t.writeText(text);
                        }
                    }
                });
                const labelHtml = (0, nls_1.localize)(7, null);
                actions.push({
                    class: undefined, tooltip: labelHtml, id: 'terminal.copyOutputAsHtml', label: labelHtml, enabled: true,
                    run: () => this.n.fire({ command, copyAsHtml: true })
                });
            }
            if (actions.length > 0) {
                actions.push(new actions_1.$ii());
            }
            const labelRunRecent = (0, nls_1.localize)(8, null);
            actions.push({
                class: undefined, tooltip: labelRunRecent, id: 'workbench.action.terminal.runRecentCommand', label: labelRunRecent, enabled: true,
                run: () => this.D.executeCommand('workbench.action.terminal.runRecentCommand')
            });
            const labelGoToRecent = (0, nls_1.localize)(9, null);
            actions.push({
                class: undefined, tooltip: labelRunRecent, id: 'workbench.action.terminal.goToRecentDirectory', label: labelGoToRecent, enabled: true,
                run: () => this.D.executeCommand('workbench.action.terminal.goToRecentDirectory')
            });
            actions.push(new actions_1.$ii());
            const labelConfigure = (0, nls_1.localize)(10, null);
            actions.push({
                class: undefined, tooltip: labelConfigure, id: 'terminal.configureCommandDecorations', label: labelConfigure, enabled: true,
                run: () => this.Z()
            });
            const labelAbout = (0, nls_1.localize)(11, null);
            actions.push({
                class: undefined, tooltip: labelAbout, id: 'terminal.learnShellIntegration', label: labelAbout, enabled: true,
                run: () => this.z.open('https://code.visualstudio.com/docs/terminal/shell-integration')
            });
            return actions;
        }
        async Z() {
            const quickPick = this.C.createQuickPick();
            quickPick.items = [
                { id: 'a', label: (0, nls_1.localize)(12, null) },
            ];
            quickPick.canSelectMany = false;
            quickPick.onDidAccept(async (e) => {
                quickPick.hide();
                const result = quickPick.activeItems[0];
                switch (result.id) {
                    case 'a':
                        this.$();
                        break;
                }
            });
            quickPick.show();
        }
        $() {
            const quickPick = this.C.createQuickPick();
            quickPick.hideInput = true;
            quickPick.hideCheckAll = true;
            quickPick.canSelectMany = true;
            quickPick.title = (0, nls_1.localize)(13, null);
            const configValue = this.w.getValue("terminal.integrated.shellIntegration.decorationsEnabled" /* TerminalSettingId.ShellIntegrationDecorationsEnabled */);
            const gutterIcon = {
                label: (0, nls_1.localize)(14, null),
                picked: configValue !== 'never' && configValue !== 'overviewRuler'
            };
            const overviewRulerIcon = {
                label: (0, nls_1.localize)(15, null),
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
                await this.w.updateValue("terminal.integrated.shellIntegration.decorationsEnabled" /* TerminalSettingId.ShellIntegrationDecorationsEnabled */, newValue);
            });
            quickPick.ok = false;
            quickPick.show();
        }
        ab(decorationOrCommand) {
            let colorId;
            if (decorationOrCommand?.exitCode === undefined) {
                colorId = terminalColorRegistry_1.$vfb;
            }
            else {
                colorId = decorationOrCommand.exitCode ? terminalColorRegistry_1.$xfb : terminalColorRegistry_1.$wfb;
            }
            return this.y.getColorTheme().getColor(colorId)?.toString();
        }
    };
    exports.$Cib = $Cib;
    exports.$Cib = $Cib = __decorate([
        __param(1, clipboardService_1.$UZ),
        __param(2, contextView_1.$WZ),
        __param(3, configuration_1.$8h),
        __param(4, themeService_1.$gv),
        __param(5, opener_1.$NT),
        __param(6, quickInput_1.$Gq),
        __param(7, lifecycle_2.$7y),
        __param(8, commands_1.$Fr),
        __param(9, instantiation_1.$Ah),
        __param(10, audioCueService_1.$sZ),
        __param(11, notification_1.$Yu)
    ], $Cib);
});
//# sourceMappingURL=decorationAddon.js.map