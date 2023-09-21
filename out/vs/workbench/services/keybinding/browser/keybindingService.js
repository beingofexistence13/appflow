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
define(["require", "exports", "vs/nls", "vs/base/browser/browser", "vs/base/browser/canIUse", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/common/async", "vs/base/common/event", "vs/base/common/json", "vs/base/common/keybindingLabels", "vs/base/common/keybindingParser", "vs/base/common/keybindings", "vs/base/common/keyCodes", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/common/platform", "vs/base/common/resources", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/files/common/files", "vs/platform/instantiation/common/extensions", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/platform/keybinding/common/abstractKeybindingService", "vs/platform/keybinding/common/keybinding", "vs/platform/keybinding/common/keybindingResolver", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/keybinding/common/resolvedKeybindingItem", "vs/platform/keyboardLayout/common/keyboardLayout", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/registry/common/platform", "vs/platform/telemetry/common/telemetry", "vs/workbench/services/actions/common/menusExtensionPoint", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/workbench/services/host/browser/host", "vs/workbench/services/keybinding/browser/unboundCommands", "vs/workbench/services/keybinding/common/keybindingIO", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/platform/uriIdentity/common/uriIdentity"], function (require, exports, nls, browser, canIUse_1, dom, keyboardEvent_1, async_1, event_1, json_1, keybindingLabels_1, keybindingParser_1, keybindings_1, keyCodes_1, lifecycle_1, objects, platform_1, resources_1, actions_1, commands_1, contextkey_1, files_1, extensions_1, jsonContributionRegistry_1, abstractKeybindingService_1, keybinding_1, keybindingResolver_1, keybindingsRegistry_1, resolvedKeybindingItem_1, keyboardLayout_1, log_1, notification_1, platform_2, telemetry_1, menusExtensionPoint_1, extensions_2, extensionsRegistry_1, host_1, unboundCommands_1, keybindingIO_1, userDataProfile_1, uriIdentity_1) {
    "use strict";
    var WorkbenchKeybindingService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkbenchKeybindingService = void 0;
    function isValidContributedKeyBinding(keyBinding, rejects) {
        if (!keyBinding) {
            rejects.push(nls.localize('nonempty', "expected non-empty value."));
            return false;
        }
        if (typeof keyBinding.command !== 'string') {
            rejects.push(nls.localize('requirestring', "property `{0}` is mandatory and must be of type `string`", 'command'));
            return false;
        }
        if (keyBinding.key && typeof keyBinding.key !== 'string') {
            rejects.push(nls.localize('optstring', "property `{0}` can be omitted or must be of type `string`", 'key'));
            return false;
        }
        if (keyBinding.when && typeof keyBinding.when !== 'string') {
            rejects.push(nls.localize('optstring', "property `{0}` can be omitted or must be of type `string`", 'when'));
            return false;
        }
        if (keyBinding.mac && typeof keyBinding.mac !== 'string') {
            rejects.push(nls.localize('optstring', "property `{0}` can be omitted or must be of type `string`", 'mac'));
            return false;
        }
        if (keyBinding.linux && typeof keyBinding.linux !== 'string') {
            rejects.push(nls.localize('optstring', "property `{0}` can be omitted or must be of type `string`", 'linux'));
            return false;
        }
        if (keyBinding.win && typeof keyBinding.win !== 'string') {
            rejects.push(nls.localize('optstring', "property `{0}` can be omitted or must be of type `string`", 'win'));
            return false;
        }
        return true;
    }
    const keybindingType = {
        type: 'object',
        default: { command: '', key: '' },
        properties: {
            command: {
                description: nls.localize('vscode.extension.contributes.keybindings.command', 'Identifier of the command to run when keybinding is triggered.'),
                type: 'string'
            },
            args: {
                description: nls.localize('vscode.extension.contributes.keybindings.args', "Arguments to pass to the command to execute.")
            },
            key: {
                description: nls.localize('vscode.extension.contributes.keybindings.key', 'Key or key sequence (separate keys with plus-sign and sequences with space, e.g. Ctrl+O and Ctrl+L L for a chord).'),
                type: 'string'
            },
            mac: {
                description: nls.localize('vscode.extension.contributes.keybindings.mac', 'Mac specific key or key sequence.'),
                type: 'string'
            },
            linux: {
                description: nls.localize('vscode.extension.contributes.keybindings.linux', 'Linux specific key or key sequence.'),
                type: 'string'
            },
            win: {
                description: nls.localize('vscode.extension.contributes.keybindings.win', 'Windows specific key or key sequence.'),
                type: 'string'
            },
            when: {
                description: nls.localize('vscode.extension.contributes.keybindings.when', 'Condition when the key is active.'),
                type: 'string'
            },
        }
    };
    const keybindingsExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'keybindings',
        deps: [menusExtensionPoint_1.commandsExtensionPoint],
        jsonSchema: {
            description: nls.localize('vscode.extension.contributes.keybindings', "Contributes keybindings."),
            oneOf: [
                keybindingType,
                {
                    type: 'array',
                    items: keybindingType
                }
            ]
        }
    });
    const NUMPAD_PRINTABLE_SCANCODES = [
        90 /* ScanCode.NumpadDivide */,
        91 /* ScanCode.NumpadMultiply */,
        92 /* ScanCode.NumpadSubtract */,
        93 /* ScanCode.NumpadAdd */,
        95 /* ScanCode.Numpad1 */,
        96 /* ScanCode.Numpad2 */,
        97 /* ScanCode.Numpad3 */,
        98 /* ScanCode.Numpad4 */,
        99 /* ScanCode.Numpad5 */,
        100 /* ScanCode.Numpad6 */,
        101 /* ScanCode.Numpad7 */,
        102 /* ScanCode.Numpad8 */,
        103 /* ScanCode.Numpad9 */,
        104 /* ScanCode.Numpad0 */,
        105 /* ScanCode.NumpadDecimal */
    ];
    const otherMacNumpadMapping = new Map();
    otherMacNumpadMapping.set(95 /* ScanCode.Numpad1 */, 22 /* KeyCode.Digit1 */);
    otherMacNumpadMapping.set(96 /* ScanCode.Numpad2 */, 23 /* KeyCode.Digit2 */);
    otherMacNumpadMapping.set(97 /* ScanCode.Numpad3 */, 24 /* KeyCode.Digit3 */);
    otherMacNumpadMapping.set(98 /* ScanCode.Numpad4 */, 25 /* KeyCode.Digit4 */);
    otherMacNumpadMapping.set(99 /* ScanCode.Numpad5 */, 26 /* KeyCode.Digit5 */);
    otherMacNumpadMapping.set(100 /* ScanCode.Numpad6 */, 27 /* KeyCode.Digit6 */);
    otherMacNumpadMapping.set(101 /* ScanCode.Numpad7 */, 28 /* KeyCode.Digit7 */);
    otherMacNumpadMapping.set(102 /* ScanCode.Numpad8 */, 29 /* KeyCode.Digit8 */);
    otherMacNumpadMapping.set(103 /* ScanCode.Numpad9 */, 30 /* KeyCode.Digit9 */);
    otherMacNumpadMapping.set(104 /* ScanCode.Numpad0 */, 21 /* KeyCode.Digit0 */);
    let WorkbenchKeybindingService = WorkbenchKeybindingService_1 = class WorkbenchKeybindingService extends abstractKeybindingService_1.AbstractKeybindingService {
        constructor(contextKeyService, commandService, telemetryService, notificationService, userDataProfileService, hostService, extensionService, fileService, uriIdentityService, logService, keyboardLayoutService) {
            super(contextKeyService, commandService, telemetryService, notificationService, logService);
            this.hostService = hostService;
            this.keyboardLayoutService = keyboardLayoutService;
            this._contributions = [];
            this.isComposingGlobalContextKey = contextKeyService.createKey('isComposing', false);
            this.kbsJsonSchema = new KeybindingsJsonSchema();
            this.updateKeybindingsJsonSchema();
            this._keyboardMapper = this.keyboardLayoutService.getKeyboardMapper();
            this.keyboardLayoutService.onDidChangeKeyboardLayout(() => {
                this._keyboardMapper = this.keyboardLayoutService.getKeyboardMapper();
                this.updateResolver();
            });
            this._cachedResolver = null;
            this.userKeybindings = this._register(new UserKeybindings(userDataProfileService, uriIdentityService, fileService, logService));
            this.userKeybindings.initialize().then(() => {
                if (this.userKeybindings.keybindings.length) {
                    this.updateResolver();
                }
            });
            this._register(this.userKeybindings.onDidChange(() => {
                logService.debug('User keybindings changed');
                this.updateResolver();
            }));
            keybindingsExtPoint.setHandler((extensions) => {
                const keybindings = [];
                for (const extension of extensions) {
                    this._handleKeybindingsExtensionPointUser(extension.description.identifier, extension.description.isBuiltin, extension.value, extension.collector, keybindings);
                }
                keybindingsRegistry_1.KeybindingsRegistry.setExtensionKeybindings(keybindings);
                this.updateResolver();
            });
            this.updateKeybindingsJsonSchema();
            this._register(extensionService.onDidRegisterExtensions(() => this.updateKeybindingsJsonSchema()));
            this._register(this._registerKeyListeners(window));
            this._register(dom.onDidCreateWindow(({ window, disposableStore }) => {
                disposableStore.add(this._registerKeyListeners(window));
            }));
            this._register(browser.onDidChangeFullscreen(() => {
                const keyboard = navigator.keyboard;
                if (canIUse_1.BrowserFeatures.keyboard === 2 /* KeyboardSupport.None */) {
                    return;
                }
                if (browser.isFullscreen()) {
                    keyboard?.lock(['Escape']);
                }
                else {
                    keyboard?.unlock();
                }
                // update resolver which will bring back all unbound keyboard shortcuts
                this._cachedResolver = null;
                this._onDidUpdateKeybindings.fire();
            }));
        }
        _registerKeyListeners(window) {
            const disposables = new lifecycle_1.DisposableStore();
            // for standard keybindings
            disposables.add(dom.addDisposableListener(window, dom.EventType.KEY_DOWN, (e) => {
                this.isComposingGlobalContextKey.set(e.isComposing);
                const keyEvent = new keyboardEvent_1.StandardKeyboardEvent(e);
                this._log(`/ Received  keydown event - ${(0, keyboardEvent_1.printKeyboardEvent)(e)}`);
                this._log(`| Converted keydown event - ${(0, keyboardEvent_1.printStandardKeyboardEvent)(keyEvent)}`);
                const shouldPreventDefault = this._dispatch(keyEvent, keyEvent.target);
                if (shouldPreventDefault) {
                    keyEvent.preventDefault();
                }
                this.isComposingGlobalContextKey.set(false);
            }));
            // for single modifier chord keybindings (e.g. shift shift)
            disposables.add(dom.addDisposableListener(window, dom.EventType.KEY_UP, (e) => {
                this.isComposingGlobalContextKey.set(e.isComposing);
                const keyEvent = new keyboardEvent_1.StandardKeyboardEvent(e);
                const shouldPreventDefault = this._singleModifierDispatch(keyEvent, keyEvent.target);
                if (shouldPreventDefault) {
                    keyEvent.preventDefault();
                }
                this.isComposingGlobalContextKey.set(false);
            }));
            return disposables;
        }
        registerSchemaContribution(contribution) {
            this._contributions.push(contribution);
            if (contribution.onDidChange) {
                this._register(contribution.onDidChange(() => this.updateKeybindingsJsonSchema()));
            }
            this.updateKeybindingsJsonSchema();
        }
        updateKeybindingsJsonSchema() {
            this.kbsJsonSchema.updateSchema(this._contributions.flatMap(x => x.getSchemaAdditions()));
        }
        _printKeybinding(keybinding) {
            return keybindingLabels_1.UserSettingsLabelProvider.toLabel(platform_1.OS, keybinding.chords, (chord) => {
                if (chord instanceof keybindings_1.KeyCodeChord) {
                    return keyCodes_1.KeyCodeUtils.toString(chord.keyCode);
                }
                return keyCodes_1.ScanCodeUtils.toString(chord.scanCode);
            }) || '[null]';
        }
        _printResolvedKeybinding(resolvedKeybinding) {
            return resolvedKeybinding.getDispatchChords().map(x => x || '[null]').join(' ');
        }
        _printResolvedKeybindings(output, input, resolvedKeybindings) {
            const padLength = 35;
            const firstRow = `${input.padStart(padLength, ' ')} => `;
            if (resolvedKeybindings.length === 0) {
                // no binding found
                output.push(`${firstRow}${'[NO BINDING]'.padStart(padLength, ' ')}`);
                return;
            }
            const firstRowIndentation = firstRow.length;
            const isFirst = true;
            for (const resolvedKeybinding of resolvedKeybindings) {
                if (isFirst) {
                    output.push(`${firstRow}${this._printResolvedKeybinding(resolvedKeybinding).padStart(padLength, ' ')}`);
                }
                else {
                    output.push(`${' '.repeat(firstRowIndentation)}${this._printResolvedKeybinding(resolvedKeybinding).padStart(padLength, ' ')}`);
                }
            }
        }
        _dumpResolveKeybindingDebugInfo() {
            const seenBindings = new Set();
            const result = [];
            result.push(`Default Resolved Keybindings (unique only):`);
            for (const item of keybindingsRegistry_1.KeybindingsRegistry.getDefaultKeybindings()) {
                if (!item.keybinding) {
                    continue;
                }
                const input = this._printKeybinding(item.keybinding);
                if (seenBindings.has(input)) {
                    continue;
                }
                seenBindings.add(input);
                const resolvedKeybindings = this._keyboardMapper.resolveKeybinding(item.keybinding);
                this._printResolvedKeybindings(result, input, resolvedKeybindings);
            }
            result.push(`User Resolved Keybindings (unique only):`);
            for (const item of this.userKeybindings.keybindings) {
                if (!item.keybinding) {
                    continue;
                }
                const input = item._sourceKey ?? 'Impossible: missing source key, but has keybinding';
                if (seenBindings.has(input)) {
                    continue;
                }
                seenBindings.add(input);
                const resolvedKeybindings = this._keyboardMapper.resolveKeybinding(item.keybinding);
                this._printResolvedKeybindings(result, input, resolvedKeybindings);
            }
            return result.join('\n');
        }
        _dumpDebugInfo() {
            const layoutInfo = JSON.stringify(this.keyboardLayoutService.getCurrentKeyboardLayout(), null, '\t');
            const mapperInfo = this._keyboardMapper.dumpDebugInfo();
            const resolvedKeybindings = this._dumpResolveKeybindingDebugInfo();
            const rawMapping = JSON.stringify(this.keyboardLayoutService.getRawKeyboardMapping(), null, '\t');
            return `Layout info:\n${layoutInfo}\n\n${resolvedKeybindings}\n\n${mapperInfo}\n\nRaw mapping:\n${rawMapping}`;
        }
        _dumpDebugInfoJSON() {
            const info = {
                layout: this.keyboardLayoutService.getCurrentKeyboardLayout(),
                rawMapping: this.keyboardLayoutService.getRawKeyboardMapping()
            };
            return JSON.stringify(info, null, '\t');
        }
        customKeybindingsCount() {
            return this.userKeybindings.keybindings.length;
        }
        updateResolver() {
            this._cachedResolver = null;
            this._onDidUpdateKeybindings.fire();
        }
        _getResolver() {
            if (!this._cachedResolver) {
                const defaults = this._resolveKeybindingItems(keybindingsRegistry_1.KeybindingsRegistry.getDefaultKeybindings(), true);
                const overrides = this._resolveUserKeybindingItems(this.userKeybindings.keybindings, false);
                this._cachedResolver = new keybindingResolver_1.KeybindingResolver(defaults, overrides, (str) => this._log(str));
            }
            return this._cachedResolver;
        }
        _documentHasFocus() {
            // it is possible that the document has lost focus, but the
            // window is still focused, e.g. when a <webview> element
            // has focus
            return this.hostService.hasFocus;
        }
        _resolveKeybindingItems(items, isDefault) {
            const result = [];
            let resultLen = 0;
            for (const item of items) {
                const when = item.when || undefined;
                const keybinding = item.keybinding;
                if (!keybinding) {
                    // This might be a removal keybinding item in user settings => accept it
                    result[resultLen++] = new resolvedKeybindingItem_1.ResolvedKeybindingItem(undefined, item.command, item.commandArgs, when, isDefault, item.extensionId, item.isBuiltinExtension);
                }
                else {
                    if (this._assertBrowserConflicts(keybinding)) {
                        continue;
                    }
                    const resolvedKeybindings = this._keyboardMapper.resolveKeybinding(keybinding);
                    for (let i = resolvedKeybindings.length - 1; i >= 0; i--) {
                        const resolvedKeybinding = resolvedKeybindings[i];
                        result[resultLen++] = new resolvedKeybindingItem_1.ResolvedKeybindingItem(resolvedKeybinding, item.command, item.commandArgs, when, isDefault, item.extensionId, item.isBuiltinExtension);
                    }
                }
            }
            return result;
        }
        _resolveUserKeybindingItems(items, isDefault) {
            const result = [];
            let resultLen = 0;
            for (const item of items) {
                const when = item.when || undefined;
                if (!item.keybinding) {
                    // This might be a removal keybinding item in user settings => accept it
                    result[resultLen++] = new resolvedKeybindingItem_1.ResolvedKeybindingItem(undefined, item.command, item.commandArgs, when, isDefault, null, false);
                }
                else {
                    const resolvedKeybindings = this._keyboardMapper.resolveKeybinding(item.keybinding);
                    for (const resolvedKeybinding of resolvedKeybindings) {
                        result[resultLen++] = new resolvedKeybindingItem_1.ResolvedKeybindingItem(resolvedKeybinding, item.command, item.commandArgs, when, isDefault, null, false);
                    }
                }
            }
            return result;
        }
        _assertBrowserConflicts(keybinding) {
            if (canIUse_1.BrowserFeatures.keyboard === 0 /* KeyboardSupport.Always */) {
                return false;
            }
            if (canIUse_1.BrowserFeatures.keyboard === 1 /* KeyboardSupport.FullScreen */ && browser.isFullscreen()) {
                return false;
            }
            for (const chord of keybinding.chords) {
                if (!chord.metaKey && !chord.altKey && !chord.ctrlKey && !chord.shiftKey) {
                    continue;
                }
                const modifiersMask = 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */;
                let partModifiersMask = 0;
                if (chord.metaKey) {
                    partModifiersMask |= 2048 /* KeyMod.CtrlCmd */;
                }
                if (chord.shiftKey) {
                    partModifiersMask |= 1024 /* KeyMod.Shift */;
                }
                if (chord.altKey) {
                    partModifiersMask |= 512 /* KeyMod.Alt */;
                }
                if (chord.ctrlKey && platform_1.OS === 2 /* OperatingSystem.Macintosh */) {
                    partModifiersMask |= 256 /* KeyMod.WinCtrl */;
                }
                if ((partModifiersMask & modifiersMask) === (2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */)) {
                    if (chord instanceof keybindings_1.ScanCodeChord && (chord.scanCode === 86 /* ScanCode.ArrowLeft */ || chord.scanCode === 85 /* ScanCode.ArrowRight */)) {
                        // console.warn('Ctrl/Cmd+Arrow keybindings should not be used by default in web. Offender: ', kb.getHashCode(), ' for ', commandId);
                        return true;
                    }
                    if (chord instanceof keybindings_1.KeyCodeChord && (chord.keyCode === 15 /* KeyCode.LeftArrow */ || chord.keyCode === 17 /* KeyCode.RightArrow */)) {
                        // console.warn('Ctrl/Cmd+Arrow keybindings should not be used by default in web. Offender: ', kb.getHashCode(), ' for ', commandId);
                        return true;
                    }
                }
                if ((partModifiersMask & modifiersMask) === 2048 /* KeyMod.CtrlCmd */) {
                    if (chord instanceof keybindings_1.ScanCodeChord && (chord.scanCode >= 36 /* ScanCode.Digit1 */ && chord.scanCode <= 45 /* ScanCode.Digit0 */)) {
                        // console.warn('Ctrl/Cmd+Num keybindings should not be used by default in web. Offender: ', kb.getHashCode(), ' for ', commandId);
                        return true;
                    }
                    if (chord instanceof keybindings_1.KeyCodeChord && (chord.keyCode >= 21 /* KeyCode.Digit0 */ && chord.keyCode <= 30 /* KeyCode.Digit9 */)) {
                        // console.warn('Ctrl/Cmd+Num keybindings should not be used by default in web. Offender: ', kb.getHashCode(), ' for ', commandId);
                        return true;
                    }
                }
            }
            return false;
        }
        resolveKeybinding(kb) {
            return this._keyboardMapper.resolveKeybinding(kb);
        }
        resolveKeyboardEvent(keyboardEvent) {
            this.keyboardLayoutService.validateCurrentKeyboardMapping(keyboardEvent);
            return this._keyboardMapper.resolveKeyboardEvent(keyboardEvent);
        }
        resolveUserBinding(userBinding) {
            const keybinding = keybindingParser_1.KeybindingParser.parseKeybinding(userBinding);
            return (keybinding ? this._keyboardMapper.resolveKeybinding(keybinding) : []);
        }
        _handleKeybindingsExtensionPointUser(extensionId, isBuiltin, keybindings, collector, result) {
            if (Array.isArray(keybindings)) {
                for (let i = 0, len = keybindings.length; i < len; i++) {
                    this._handleKeybinding(extensionId, isBuiltin, i + 1, keybindings[i], collector, result);
                }
            }
            else {
                this._handleKeybinding(extensionId, isBuiltin, 1, keybindings, collector, result);
            }
        }
        _handleKeybinding(extensionId, isBuiltin, idx, keybindings, collector, result) {
            const rejects = [];
            if (isValidContributedKeyBinding(keybindings, rejects)) {
                const rule = this._asCommandRule(extensionId, isBuiltin, idx++, keybindings);
                if (rule) {
                    result.push(rule);
                }
            }
            if (rejects.length > 0) {
                collector.error(nls.localize('invalid.keybindings', "Invalid `contributes.{0}`: {1}", keybindingsExtPoint.name, rejects.join('\n')));
            }
        }
        static bindToCurrentPlatform(key, mac, linux, win) {
            if (platform_1.OS === 1 /* OperatingSystem.Windows */ && win) {
                if (win) {
                    return win;
                }
            }
            else if (platform_1.OS === 2 /* OperatingSystem.Macintosh */) {
                if (mac) {
                    return mac;
                }
            }
            else {
                if (linux) {
                    return linux;
                }
            }
            return key;
        }
        _asCommandRule(extensionId, isBuiltin, idx, binding) {
            const { command, args, when, key, mac, linux, win } = binding;
            const keybinding = WorkbenchKeybindingService_1.bindToCurrentPlatform(key, mac, linux, win);
            if (!keybinding) {
                return undefined;
            }
            let weight;
            if (isBuiltin) {
                weight = 300 /* KeybindingWeight.BuiltinExtension */ + idx;
            }
            else {
                weight = 400 /* KeybindingWeight.ExternalExtension */ + idx;
            }
            const commandAction = actions_1.MenuRegistry.getCommand(command);
            const precondition = commandAction && commandAction.precondition;
            let fullWhen;
            if (when && precondition) {
                fullWhen = contextkey_1.ContextKeyExpr.and(precondition, contextkey_1.ContextKeyExpr.deserialize(when));
            }
            else if (when) {
                fullWhen = contextkey_1.ContextKeyExpr.deserialize(when);
            }
            else if (precondition) {
                fullWhen = precondition;
            }
            const desc = {
                id: command,
                args,
                when: fullWhen,
                weight: weight,
                keybinding: keybindingParser_1.KeybindingParser.parseKeybinding(keybinding),
                extensionId: extensionId.value,
                isBuiltinExtension: isBuiltin
            };
            return desc;
        }
        getDefaultKeybindingsContent() {
            const resolver = this._getResolver();
            const defaultKeybindings = resolver.getDefaultKeybindings();
            const boundCommands = resolver.getDefaultBoundCommands();
            return (WorkbenchKeybindingService_1._getDefaultKeybindings(defaultKeybindings)
                + '\n\n'
                + WorkbenchKeybindingService_1._getAllCommandsAsComment(boundCommands));
        }
        static _getDefaultKeybindings(defaultKeybindings) {
            const out = new keybindingIO_1.OutputBuilder();
            out.writeLine('[');
            const lastIndex = defaultKeybindings.length - 1;
            defaultKeybindings.forEach((k, index) => {
                keybindingIO_1.KeybindingIO.writeKeybindingItem(out, k);
                if (index !== lastIndex) {
                    out.writeLine(',');
                }
                else {
                    out.writeLine();
                }
            });
            out.writeLine(']');
            return out.toString();
        }
        static _getAllCommandsAsComment(boundCommands) {
            const unboundCommands = (0, unboundCommands_1.getAllUnboundCommands)(boundCommands);
            const pretty = unboundCommands.sort().join('\n// - ');
            return '// ' + nls.localize('unboundCommands', "Here are other available commands: ") + '\n// - ' + pretty;
        }
        mightProducePrintableCharacter(event) {
            if (event.ctrlKey || event.metaKey || event.altKey) {
                // ignore ctrl/cmd/alt-combination but not shift-combinatios
                return false;
            }
            const code = keyCodes_1.ScanCodeUtils.toEnum(event.code);
            if (NUMPAD_PRINTABLE_SCANCODES.indexOf(code) !== -1) {
                // This is a numpad key that might produce a printable character based on NumLock.
                // Let's check if NumLock is on or off based on the event's keyCode.
                // e.g.
                // - when NumLock is off, ScanCode.Numpad4 produces KeyCode.LeftArrow
                // - when NumLock is on, ScanCode.Numpad4 produces KeyCode.NUMPAD_4
                // However, ScanCode.NumpadAdd always produces KeyCode.NUMPAD_ADD
                if (event.keyCode === keyCodes_1.IMMUTABLE_CODE_TO_KEY_CODE[code]) {
                    // NumLock is on or this is /, *, -, + on the numpad
                    return true;
                }
                if (platform_1.isMacintosh && event.keyCode === otherMacNumpadMapping.get(code)) {
                    // on macOS, the numpad keys can also map to keys 1 - 0.
                    return true;
                }
                return false;
            }
            const keycode = keyCodes_1.IMMUTABLE_CODE_TO_KEY_CODE[code];
            if (keycode !== -1) {
                // https://github.com/microsoft/vscode/issues/74934
                return false;
            }
            // consult the KeyboardMapperFactory to check the given event for
            // a printable value.
            const mapping = this.keyboardLayoutService.getRawKeyboardMapping();
            if (!mapping) {
                return false;
            }
            const keyInfo = mapping[event.code];
            if (!keyInfo) {
                return false;
            }
            if (!keyInfo.value || /\s/.test(keyInfo.value)) {
                return false;
            }
            return true;
        }
    };
    exports.WorkbenchKeybindingService = WorkbenchKeybindingService;
    exports.WorkbenchKeybindingService = WorkbenchKeybindingService = WorkbenchKeybindingService_1 = __decorate([
        __param(0, contextkey_1.IContextKeyService),
        __param(1, commands_1.ICommandService),
        __param(2, telemetry_1.ITelemetryService),
        __param(3, notification_1.INotificationService),
        __param(4, userDataProfile_1.IUserDataProfileService),
        __param(5, host_1.IHostService),
        __param(6, extensions_2.IExtensionService),
        __param(7, files_1.IFileService),
        __param(8, uriIdentity_1.IUriIdentityService),
        __param(9, log_1.ILogService),
        __param(10, keyboardLayout_1.IKeyboardLayoutService)
    ], WorkbenchKeybindingService);
    class UserKeybindings extends lifecycle_1.Disposable {
        get keybindings() { return this._keybindings; }
        constructor(userDataProfileService, uriIdentityService, fileService, logService) {
            super();
            this.userDataProfileService = userDataProfileService;
            this.uriIdentityService = uriIdentityService;
            this.fileService = fileService;
            this._rawKeybindings = [];
            this._keybindings = [];
            this.watchDisposables = this._register(new lifecycle_1.DisposableStore());
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this.watch();
            this.reloadConfigurationScheduler = this._register(new async_1.RunOnceScheduler(() => this.reload().then(changed => {
                if (changed) {
                    this._onDidChange.fire();
                }
            }), 50));
            this._register(event_1.Event.filter(this.fileService.onDidFilesChange, e => e.contains(this.userDataProfileService.currentProfile.keybindingsResource))(() => {
                logService.debug('Keybindings file changed');
                this.reloadConfigurationScheduler.schedule();
            }));
            this._register(this.fileService.onDidRunOperation((e) => {
                if (e.operation === 4 /* FileOperation.WRITE */ && e.resource.toString() === this.userDataProfileService.currentProfile.keybindingsResource.toString()) {
                    logService.debug('Keybindings file written');
                    this.reloadConfigurationScheduler.schedule();
                }
            }));
            this._register(userDataProfileService.onDidChangeCurrentProfile(e => {
                if (!this.uriIdentityService.extUri.isEqual(e.previous.keybindingsResource, e.profile.keybindingsResource)) {
                    e.join(this.whenCurrentProfileChanged());
                }
            }));
        }
        async whenCurrentProfileChanged() {
            this.watch();
            this.reloadConfigurationScheduler.schedule();
        }
        watch() {
            this.watchDisposables.clear();
            this.watchDisposables.add(this.fileService.watch((0, resources_1.dirname)(this.userDataProfileService.currentProfile.keybindingsResource)));
            // Also listen to the resource incase the resource is a symlink - https://github.com/microsoft/vscode/issues/118134
            this.watchDisposables.add(this.fileService.watch(this.userDataProfileService.currentProfile.keybindingsResource));
        }
        async initialize() {
            await this.reload();
        }
        async reload() {
            const newKeybindings = await this.readUserKeybindings();
            if (objects.equals(this._rawKeybindings, newKeybindings)) {
                // no change
                return false;
            }
            this._rawKeybindings = newKeybindings;
            this._keybindings = this._rawKeybindings.map((k) => keybindingIO_1.KeybindingIO.readUserKeybindingItem(k));
            return true;
        }
        async readUserKeybindings() {
            try {
                const content = await this.fileService.readFile(this.userDataProfileService.currentProfile.keybindingsResource);
                const value = (0, json_1.parse)(content.value.toString());
                return Array.isArray(value)
                    ? value.filter(v => v && typeof v === 'object' /* just typeof === object doesn't catch `null` */)
                    : [];
            }
            catch (e) {
                return [];
            }
        }
    }
    /**
     * Registers the `keybindings.json`'s schema with the JSON schema registry. Allows updating the schema, e.g., when new commands are registered (e.g., by extensions).
     *
     * Lifecycle owned by `WorkbenchKeybindingService`. Must be instantiated only once.
     */
    class KeybindingsJsonSchema {
        static { this.schemaId = 'vscode://schemas/keybindings'; }
        constructor() {
            this.commandsSchemas = [];
            this.commandsEnum = [];
            this.removalCommandsEnum = [];
            this.commandsEnumDescriptions = [];
            this.schema = {
                id: KeybindingsJsonSchema.schemaId,
                type: 'array',
                title: nls.localize('keybindings.json.title', "Keybindings configuration"),
                allowTrailingCommas: true,
                allowComments: true,
                definitions: {
                    'editorGroupsSchema': {
                        'type': 'array',
                        'items': {
                            'type': 'object',
                            'properties': {
                                'groups': {
                                    '$ref': '#/definitions/editorGroupsSchema',
                                    'default': [{}, {}]
                                },
                                'size': {
                                    'type': 'number',
                                    'default': 0.5
                                }
                            }
                        }
                    },
                    'commandNames': {
                        'type': 'string',
                        'enum': this.commandsEnum,
                        'enumDescriptions': this.commandsEnumDescriptions,
                        'description': nls.localize('keybindings.json.command', "Name of the command to execute"),
                    },
                    'commandType': {
                        'anyOf': [
                            {
                                $ref: '#/definitions/commandNames'
                            },
                            {
                                'type': 'string',
                                'enum': this.removalCommandsEnum,
                                'enumDescriptions': this.commandsEnumDescriptions,
                                'description': nls.localize('keybindings.json.removalCommand', "Name of the command to remove keyboard shortcut for"),
                            },
                            {
                                'type': 'string'
                            },
                        ]
                    },
                    'commandsSchemas': {
                        'allOf': this.commandsSchemas
                    }
                },
                items: {
                    'required': ['key'],
                    'type': 'object',
                    'defaultSnippets': [{ 'body': { 'key': '$1', 'command': '$2', 'when': '$3' } }],
                    'properties': {
                        'key': {
                            'type': 'string',
                            'description': nls.localize('keybindings.json.key', "Key or key sequence (separated by space)"),
                        },
                        'command': {
                            'anyOf': [
                                {
                                    'if': {
                                        'type': 'array'
                                    },
                                    'then': {
                                        'not': {
                                            'type': 'array'
                                        },
                                        'errorMessage': nls.localize('keybindings.commandsIsArray', "Incorrect type. Expected \"{0}\". The field 'command' does not support running multiple commands. Use command 'runCommands' to pass it multiple commands to run.", 'string')
                                    },
                                    'else': {
                                        '$ref': '#/definitions/commandType'
                                    }
                                },
                                {
                                    '$ref': '#/definitions/commandType'
                                }
                            ]
                        },
                        'when': {
                            'type': 'string',
                            'description': nls.localize('keybindings.json.when', "Condition when the key is active.")
                        },
                        'args': {
                            'description': nls.localize('keybindings.json.args', "Arguments to pass to the command to execute.")
                        }
                    },
                    '$ref': '#/definitions/commandsSchemas'
                }
            };
            this.schemaRegistry = platform_2.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
            this.schemaRegistry.registerSchema(KeybindingsJsonSchema.schemaId, this.schema);
        }
        // TODO@ulugbekna: can updates happen incrementally rather than rebuilding; concerns:
        // - is just appending additional schemas enough for the registry to pick them up?
        // - can `CommandsRegistry.getCommands` and `MenuRegistry.getCommands` return different values at different times? ie would just pushing new schemas from `additionalContributions` not be enough?
        updateSchema(additionalContributions) {
            this.commandsSchemas.length = 0;
            this.commandsEnum.length = 0;
            this.removalCommandsEnum.length = 0;
            this.commandsEnumDescriptions.length = 0;
            const knownCommands = new Set();
            const addKnownCommand = (commandId, description) => {
                if (!/^_/.test(commandId)) {
                    if (!knownCommands.has(commandId)) {
                        knownCommands.add(commandId);
                        this.commandsEnum.push(commandId);
                        this.commandsEnumDescriptions.push(description);
                        // Also add the negative form for keybinding removal
                        this.removalCommandsEnum.push(`-${commandId}`);
                    }
                }
            };
            const allCommands = commands_1.CommandsRegistry.getCommands();
            for (const [commandId, command] of allCommands) {
                const commandDescription = command.description;
                addKnownCommand(commandId, commandDescription ? commandDescription.description : undefined);
                if (!commandDescription || !commandDescription.args || commandDescription.args.length !== 1 || !commandDescription.args[0].schema) {
                    continue;
                }
                const argsSchema = commandDescription.args[0].schema;
                const argsRequired = ((typeof commandDescription.args[0].isOptional !== 'undefined')
                    ? (!commandDescription.args[0].isOptional)
                    : (Array.isArray(argsSchema.required) && argsSchema.required.length > 0));
                const addition = {
                    'if': {
                        'required': ['command'],
                        'properties': {
                            'command': { 'const': commandId }
                        }
                    },
                    'then': {
                        'required': [].concat(argsRequired ? ['args'] : []),
                        'properties': {
                            'args': argsSchema
                        }
                    }
                };
                this.commandsSchemas.push(addition);
            }
            const menuCommands = actions_1.MenuRegistry.getCommands();
            for (const commandId of menuCommands.keys()) {
                addKnownCommand(commandId);
            }
            this.commandsSchemas.push(...additionalContributions);
            this.schemaRegistry.notifySchemaChanged(KeybindingsJsonSchema.schemaId);
        }
    }
    (0, extensions_1.registerSingleton)(keybinding_1.IKeybindingService, WorkbenchKeybindingService, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5YmluZGluZ1NlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMva2V5YmluZGluZy9icm93c2VyL2tleWJpbmRpbmdTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUErRGhHLFNBQVMsNEJBQTRCLENBQUMsVUFBaUMsRUFBRSxPQUFpQjtRQUN6RixJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsMkJBQTJCLENBQUMsQ0FBQyxDQUFDO1lBQ3BFLE9BQU8sS0FBSyxDQUFDO1NBQ2I7UUFDRCxJQUFJLE9BQU8sVUFBVSxDQUFDLE9BQU8sS0FBSyxRQUFRLEVBQUU7WUFDM0MsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLGVBQWUsRUFBRSwwREFBMEQsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ25ILE9BQU8sS0FBSyxDQUFDO1NBQ2I7UUFDRCxJQUFJLFVBQVUsQ0FBQyxHQUFHLElBQUksT0FBTyxVQUFVLENBQUMsR0FBRyxLQUFLLFFBQVEsRUFBRTtZQUN6RCxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLDJEQUEyRCxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDNUcsT0FBTyxLQUFLLENBQUM7U0FDYjtRQUNELElBQUksVUFBVSxDQUFDLElBQUksSUFBSSxPQUFPLFVBQVUsQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFO1lBQzNELE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsMkRBQTJELEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUM3RyxPQUFPLEtBQUssQ0FBQztT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