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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/browser/dom", "vs/base/common/arrays", "vs/nls!vs/workbench/contrib/terminalContrib/quickFix/browser/quickFixAddon", "vs/platform/configuration/common/configuration", "vs/platform/opener/common/opener", "vs/workbench/contrib/terminal/browser/xterm/decorationStyles", "vs/platform/telemetry/common/telemetry", "vs/base/common/cancellation", "vs/workbench/services/extensions/common/extensions", "vs/platform/audioCues/browser/audioCueService", "vs/platform/actionWidget/browser/actionWidget", "vs/platform/terminal/common/capabilities/commandDetectionCapability", "vs/platform/label/common/label", "vs/base/common/network", "vs/workbench/contrib/terminalContrib/quickFix/browser/quickFix", "vs/editor/contrib/codeAction/common/types", "vs/base/common/codicons", "vs/base/common/themables", "vs/platform/commands/common/commands"], function (require, exports, event_1, lifecycle_1, dom, arrays_1, nls_1, configuration_1, opener_1, decorationStyles_1, telemetry_1, cancellation_1, extensions_1, audioCueService_1, actionWidget_1, commandDetectionCapability_1, label_1, network_1, quickFix_1, types_1, codicons_1, themables_1, commands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$1Wb = exports.$ZWb = void 0;
    const quickFixClasses = [
        "quick-fix" /* DecorationSelector.QuickFix */,
        "codicon" /* DecorationSelector.Codicon */,
        "terminal-command-decoration" /* DecorationSelector.CommandDecoration */,
        "xterm-decoration" /* DecorationSelector.XtermDecoration */
    ];
    let $ZWb = class $ZWb extends lifecycle_1.$kc {
        constructor(s, t, u, w, z, C, D, F, G, H, I) {
            super();
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.z = z;
            this.C = C;
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.a = new event_1.$fd();
            this.onDidRequestRerunCommand = this.a.event;
            this.g = new Map();
            this.r = new Set();
            const commandDetectionCapability = this.t.get(2 /* TerminalCapability.CommandDetection */);
            if (commandDetectionCapability) {
                this.J();
            }
            else {
                this.B(this.t.onDidAddCapabilityType(c => {
                    if (c === 2 /* TerminalCapability.CommandDetection */) {
                        this.J();
                    }
                }));
            }
            this.B(this.u.onDidRegisterProvider(result => this.registerCommandFinishedListener(convertToQuickFixOptions(result))));
            this.u.extensionQuickFixes.then(quickFixSelectors => {
                for (const selector of quickFixSelectors) {
                    this.registerCommandSelector(selector);
                }
            });
            this.B(this.u.onDidRegisterCommandSelector(selector => this.registerCommandSelector(selector)));
            this.B(this.u.onDidUnregisterProvider(id => this.g.delete(id)));
        }
        activate(terminal) {
            this.b = terminal;
        }
        showMenu() {
            if (!this.m) {
                return;
            }
            // TODO: What's documentation do? Need a vscode command?
            const actions = this.m.quickFixes.map(f => new TerminalQuickFixItem(f, f.type, f.source, f.label, f.kind));
            const documentation = this.m.quickFixes.map(f => { return { id: f.source, title: f.label, tooltip: f.source }; });
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
                    this.H.hide();
                    this.M(fix.action.id, true);
                },
                onHide: () => {
                    this.b?.focus();
                },
            };
            this.H.show('quickFixWidget', false, toActionWidgetItems(actionSet.validActions, true), delegate, this.m.anchor, this.m.parentElement);
        }
        registerCommandSelector(selector) {
            if (this.r.has(selector.id)) {
                return;
            }
            const matcherKey = selector.commandLineMatcher.toString();
            const currentOptions = this.g.get(matcherKey) || [];
            currentOptions.push({
                id: selector.id,
                type: 'unresolved',
                commandLineMatcher: selector.commandLineMatcher,
                outputMatcher: selector.outputMatcher,
                commandExitResult: selector.commandExitResult,
                kind: selector.kind
            });
            this.r.add(selector.id);
            this.g.set(matcherKey, currentOptions);
        }
        registerCommandFinishedListener(options) {
            const matcherKey = options.commandLineMatcher.toString();
            let currentOptions = this.g.get(matcherKey) || [];
            // removes the unresolved options
            currentOptions = currentOptions.filter(o => o.id !== options.id);
            currentOptions.push(options);
            this.g.set(matcherKey, currentOptions);
        }
        J() {
            const terminal = this.b;
            const commandDetection = this.t.get(2 /* TerminalCapability.CommandDetection */);
            if (!terminal || !commandDetection) {
                return;
            }
            this.B(commandDetection.onCommandFinished(async (command) => await this.L(command, this.s)));
        }
        /**
         * Resolves quick fixes, if any, based on the
         * @param command & its output
         */
        async L(command, aliases) {
            const terminal = this.b;
            if (!terminal || command.wasReplayed) {
                return;
            }
            if (command.command !== '' && this.n) {
                this.M(this.n, false);
            }
            const resolver = async (selector, lines) => {
                if (lines === undefined) {
                    return undefined;
                }
                const id = selector.id;
                await this.G.activateByEvent(`onTerminalQuickFixRequest:${id}`);
                return this.u.providers.get(id)?.provideTerminalQuickFixes(command, lines, {
                    type: 'resolved',
                    commandLineMatcher: selector.commandLineMatcher,
                    outputMatcher: selector.outputMatcher,
                    commandExitResult: selector.commandExitResult,
                    kind: selector.kind,
                    id: selector.id
                }, new cancellation_1.$pd().token);
            };
            const result = await $1Wb(aliases, terminal, command, this.g, this.w, this.D, this.I, this.a, resolver);
            if (!result) {
                return;
            }
            this.h = result;
            this.n = this.h[0].id;
            this.N();
        }
        M(id, ranQuickFix) {
            this.F?.publicLog2('terminal/quick-fix', {
                quickFixId: id,
                ranQuickFix
            });
            this.j?.dispose();
            this.j = undefined;
            this.h = undefined;
            this.n = undefined;
        }
        /**
         * Registers a decoration with the quick fixes
         */
        N() {
            if (!this.b) {
                return;
            }
            if (!this.h) {
                return;
            }
            const marker = this.b.registerMarker();
            if (!marker) {
                return;
            }
            const decoration = this.b.registerDecoration({ marker, layer: 'top' });
            if (!decoration) {
                return;
            }
            this.j = decoration;
            const fixes = this.h;
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
                    if (this.m) {
                        this.m.anchor = anchor;
                    }
                    return;
                }
                e.classList.add(...quickFixClasses);
                const isExplainOnly = fixes.every(e => e.kind === 'explain');
                if (isExplainOnly) {
                    e.classList.add('explainOnly');
                }
                e.classList.add(...themables_1.ThemeIcon.asClassNameArray(isExplainOnly ? codicons_1.$Pj.sparkle : codicons_1.$Pj.lightBulb));
                (0, decorationStyles_1.$Bib)(this.z, e);
                this.C.playAudioCue(audioCueService_1.$wZ.terminalQuickFix);
                const parentElement = e.closest('.xterm');
                if (!parentElement) {
                    return;
                }
                this.m = { quickFixes: fixes, anchor, parentElement };
                this.B(dom.$nO(e, dom.$3O.CLICK, () => this.showMenu()));
            });
            decoration.onDispose(() => this.m = undefined);
            this.h = undefined;
        }
    };
    exports.$ZWb = $ZWb;
    exports.$ZWb = $ZWb = __decorate([
        __param(2, quickFix_1.$3kb),
        __param(3, commands_1.$Fr),
        __param(4, configuration_1.$8h),
        __param(5, audioCueService_1.$sZ),
        __param(6, opener_1.$NT),
        __param(7, telemetry_1.$9k),
        __param(8, extensions_1.$MF),
        __param(9, actionWidget_1.$N2),
        __param(10, label_1.$Vz)
    ], $ZWb);
    async function $1Wb(aliases, terminal, terminalCommand, quickFixOptions, commandService, openerService, labelService, onDidRequestRerunCommand, getResolvedFixes) {
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
                    quickFixes = await option.getQuickFixes(terminalCommand, (0, commandDetectionCapability_1.$Uq)(terminal.buffer.active, terminalCommand, terminal.cols, option.outputMatcher), option, new cancellation_1.$pd().token);
                }
                else if (option.type === 'unresolved') {
                    if (!getResolvedFixes) {
                        throw new Error('No resolved fix provider');
                    }
                    quickFixes = await getResolvedFixes(option, option.outputMatcher ? (0, commandDetectionCapability_1.$Uq)(terminal.buffer.active, terminalCommand, terminal.cols, option.outputMatcher) : undefined);
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
                    for (const quickFix of (0, arrays_1.$1b)(quickFixes)) {
                        let action;
                        if ('type' in quickFix) {
                            switch (quickFix.type) {
                                case quickFix_1.TerminalQuickFixType.TerminalCommand: {
                                    const fix = quickFix;
                                    if (commandQuickFixSet.has(fix.terminalCommand)) {
                                        continue;
                                    }
                                    commandQuickFixSet.add(fix.terminalCommand);
                                    const label = (0, nls_1.localize)(0, null, fix.terminalCommand);
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
                                    const label = (0, nls_1.localize)(1, null, uriLabel);
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
    exports.$1Wb = $1Wb;
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
                kind: types_1.$v1.QuickFix,
                title: (0, nls_1.localize)(2, null)
            }
        });
        for (const quickFix of showHeaders ? inputQuickFixes : inputQuickFixes.filter(i => !!i.action)) {
            if (!quickFix.disabled && quickFix.action) {
                menuItems.push({
                    kind: "action" /* ActionListItemKind.Action */,
                    item: quickFix,
                    group: {
                        kind: types_1.$v1.QuickFix,
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
            return codicons_1.$Pj.sparkle;
        }
        switch (quickFix.type) {
            case quickFix_1.TerminalQuickFixType.Opener:
                if ('uri' in quickFix.action && quickFix.action.uri) {
                    const isUrl = (quickFix.action.uri.scheme === network_1.Schemas.http || quickFix.action.uri.scheme === network_1.Schemas.https);
                    return isUrl ? codicons_1.$Pj.linkExternal : codicons_1.$Pj.goToFile;
                }
            case quickFix_1.TerminalQuickFixType.TerminalCommand:
                return codicons_1.$Pj.run;
            case quickFix_1.TerminalQuickFixType.Port:
                return codicons_1.$Pj.debugDisconnect;
            case quickFix_1.TerminalQuickFixType.VscodeCommand:
                return codicons_1.$Pj.lightbulb;
        }
    }
});
//# sourceMappingURL=quickFixAddon.js.map