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
define(["require", "exports", "vs/nls!vs/workbench/services/keybinding/browser/keybindingService", "vs/base/browser/browser", "vs/base/browser/canIUse", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/common/async", "vs/base/common/event", "vs/base/common/json", "vs/base/common/keybindingLabels", "vs/base/common/keybindingParser", "vs/base/common/keybindings", "vs/base/common/keyCodes", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/common/platform", "vs/base/common/resources", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/files/common/files", "vs/platform/instantiation/common/extensions", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/platform/keybinding/common/abstractKeybindingService", "vs/platform/keybinding/common/keybinding", "vs/platform/keybinding/common/keybindingResolver", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/keybinding/common/resolvedKeybindingItem", "vs/platform/keyboardLayout/common/keyboardLayout", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/registry/common/platform", "vs/platform/telemetry/common/telemetry", "vs/workbench/services/actions/common/menusExtensionPoint", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/workbench/services/host/browser/host", "vs/workbench/services/keybinding/browser/unboundCommands", "vs/workbench/services/keybinding/common/keybindingIO", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/platform/uriIdentity/common/uriIdentity"], function (require, exports, nls, browser, canIUse_1, dom, keyboardEvent_1, async_1, event_1, json_1, keybindingLabels_1, keybindingParser_1, keybindings_1, keyCodes_1, lifecycle_1, objects, platform_1, resources_1, actions_1, commands_1, contextkey_1, files_1, extensions_1, jsonContributionRegistry_1, abstractKeybindingService_1, keybinding_1, keybindingResolver_1, keybindingsRegistry_1, resolvedKeybindingItem_1, keyboardLayout_1, log_1, notification_1, platform_2, telemetry_1, menusExtensionPoint_1, extensions_2, extensionsRegistry_1, host_1, unboundCommands_1, keybindingIO_1, userDataProfile_1, uriIdentity_1) {
    "use strict";
    var $2yb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$2yb = void 0;
    function isValidContributedKeyBinding(keyBinding, rejects) {
        if (!keyBinding) {
            rejects.push(nls.localize(0, null));
            return false;
        }
        if (typeof keyBinding.command !== 'string') {
            rejects.push(nls.localize(1, null, 'command'));
            return false;
        }
        if (keyBinding.key && typeof keyBinding.key !== 'string') {
            rejects.push(nls.localize(2, null, 'key'));
            return false;
        }
        if (keyBinding.when && typeof keyBinding.when !== 'string') {
            rejects.push(nls.localize(3, null, 'when'));
            return false;
        }
        if (keyBinding.mac && typeof keyBinding.mac !== 'string') {
            rejects.push(nls.localize(4, null, 'mac'));
            return false;
        }
        if (keyBinding.linux && typeof keyBinding.linux !== 'string') {
            rejects.push(nls.localize(5, null, 'linux'));
            return false;
        }
        if (keyBinding.win && typeof keyBinding.win !== 'string') {
            rejects.push(nls.localize(6, null, 'win'));
            return false;
        }
        return true;
    }
    const keybindingType = {
        type: 'object',
        default: { command: '', key: '' },
        properties: {
            command: {
                description: nls.localize(7, null),
                type: 'string'
            },
            args: {
                description: nls.localize(8, null)
            },
            key: {
                description: nls.localize(9, null),
                type: 'string'
            },
            mac: {
                description: nls.localize(10, null),
                type: 'string'
            },
            linux: {
                description: nls.localize(11, null),
                type: 'string'
            },
            win: {
                description: nls.localize(12, null),
                type: 'string'
            },
            when: {
                description: nls.localize(13, null),
                type: 'string'
            },
        }
    };
    const keybindingsExtPoint = extensionsRegistry_1.$2F.registerExtensionPoint({
        extensionPoint: 'keybindings',
        deps: [menusExtensionPoint_1.$9tb],
        jsonSchema: {
            description: nls.localize(14, null),
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
    let $2yb = $2yb_1 = class $2yb extends abstractKeybindingService_1.$Ryb {
        constructor(contextKeyService, commandService, telemetryService, notificationService, userDataProfileService, Q, extensionService, fileService, uriIdentityService, logService, R) {
            super(contextKeyService, commandService, telemetryService, notificationService, logService);
            this.Q = Q;
            this.R = R;
            this.O = [];
            this.N = contextKeyService.createKey('isComposing', false);
            this.P = new KeybindingsJsonSchema();
            this.U();
            this.r = this.R.getKeyboardMapper();
            this.R.onDidChangeKeyboardLayout(() => {
                this.r = this.R.getKeyboardMapper();
                this.$();
            });
            this.C = null;
            this.M = this.B(new UserKeybindings(userDataProfileService, uriIdentityService, fileService, logService));
            this.M.initialize().then(() => {
                if (this.M.keybindings.length) {
                    this.$();
                }
            });
            this.B(this.M.onDidChange(() => {
                logService.debug('User keybindings changed');
                this.$();
            }));
            keybindingsExtPoint.setHandler((extensions) => {
                const keybindings = [];
                for (const extension of extensions) {
                    this.fb(extension.description.identifier, extension.description.isBuiltin, extension.value, extension.collector, keybindings);
                }
                keybindingsRegistry_1.$Nu.setExtensionKeybindings(keybindings);
                this.$();
            });
            this.U();
            this.B(extensionService.onDidRegisterExtensions(() => this.U()));
            this.B(this.S(window));
            this.B(dom.onDidCreateWindow(({ window, disposableStore }) => {
                disposableStore.add(this.S(window));
            }));
            this.B(browser.$4N(() => {
                const keyboard = navigator.keyboard;
                if (canIUse_1.$bO.keyboard === 2 /* KeyboardSupport.None */) {
                    return;
                }
                if (browser.$3N()) {
                    keyboard?.lock(['Escape']);
                }
                else {
                    keyboard?.unlock();
                }
                // update resolver which will bring back all unbound keyboard shortcuts
                this.C = null;
                this.a.fire();
            }));
        }
        S(window) {
            const disposables = new lifecycle_1.$jc();
            // for standard keybindings
            disposables.add(dom.$nO(window, dom.$3O.KEY_DOWN, (e) => {
                this.N.set(e.isComposing);
                const keyEvent = new keyboardEvent_1.$jO(e);
                this.D(`/ Received  keydown event - ${(0, keyboardEvent_1.$hO)(e)}`);
                this.D(`| Converted keydown event - ${(0, keyboardEvent_1.$iO)(keyEvent)}`);
                const shouldPreventDefault = this.I(keyEvent, keyEvent.target);
                if (shouldPreventDefault) {
                    keyEvent.preventDefault();
                }
                this.N.set(false);
            }));
            // for single modifier chord keybindings (e.g. shift shift)
            disposables.add(dom.$nO(window, dom.$3O.KEY_UP, (e) => {
                this.N.set(e.isComposing);
                const keyEvent = new keyboardEvent_1.$jO(e);
                const shouldPreventDefault = this.J(keyEvent, keyEvent.target);
                if (shouldPreventDefault) {
                    keyEvent.preventDefault();
                }
                this.N.set(false);
            }));
            return disposables;
        }
        registerSchemaContribution(contribution) {
            this.O.push(contribution);
            if (contribution.onDidChange) {
                this.B(contribution.onDidChange(() => this.U()));
            }
            this.U();
        }
        U() {
            this.P.updateSchema(this.O.flatMap(x => x.getSchemaAdditions()));
        }
        W(keybinding) {
            return keybindingLabels_1.$RR.toLabel(platform_1.OS, keybinding.chords, (chord) => {
                if (chord instanceof keybindings_1.$yq) {
                    return keyCodes_1.KeyCodeUtils.toString(chord.keyCode);
                }
                return keyCodes_1.$sq.toString(chord.scanCode);
            }) || '[null]';
        }
        X(resolvedKeybinding) {
            return resolvedKeybinding.getDispatchChords().map(x => x || '[null]').join(' ');
        }
        Y(output, input, resolvedKeybindings) {
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
                    output.push(`${firstRow}${this.X(resolvedKeybinding).padStart(padLength, ' ')}`);
                }
                else {
                    output.push(`${' '.repeat(firstRowIndentation)}${this.X(resolvedKeybinding).padStart(padLength, ' ')}`);
                }
            }
        }
        Z() {
            const seenBindings = new Set();
            const result = [];
            result.push(`Default Resolved Keybindings (unique only):`);
            for (const item of keybindingsRegistry_1.$Nu.getDefaultKeybindings()) {
                if (!item.keybinding) {
                    continue;
                }
                const input = this.W(item.keybinding);
                if (seenBindings.has(input)) {
                    continue;
                }
                seenBindings.add(input);
                const resolvedKeybindings = this.r.resolveKeybinding(item.keybinding);
                this.Y(result, input, resolvedKeybindings);
            }
            result.push(`User Resolved Keybindings (unique only):`);
            for (const item of this.M.keybindings) {
                if (!item.keybinding) {
                    continue;
                }
                const input = item._sourceKey ?? 'Impossible: missing source key, but has keybinding';
                if (seenBindings.has(input)) {
                    continue;
                }
                seenBindings.add(input);
                const resolvedKeybindings = this.r.resolveKeybinding(item.keybinding);
                this.Y(result, input, resolvedKeybindings);
            }
            return result.join('\n');
        }
        _dumpDebugInfo() {
            const layoutInfo = JSON.stringify(this.R.getCurrentKeyboardLayout(), null, '\t');
            const mapperInfo = this.r.dumpDebugInfo();
            const resolvedKeybindings = this.Z();
            const rawMapping = JSON.stringify(this.R.getRawKeyboardMapping(), null, '\t');
            return `Layout info:\n${layoutInfo}\n\n${resolvedKeybindings}\n\n${mapperInfo}\n\nRaw mapping:\n${rawMapping}`;
        }
        _dumpDebugInfoJSON() {
            const info = {
                layout: this.R.getCurrentKeyboardLayout(),
                rawMapping: this.R.getRawKeyboardMapping()
            };
            return JSON.stringify(info, null, '\t');
        }
        customKeybindingsCount() {
            return this.M.keybindings.length;
        }
        $() {
            this.C = null;
            this.a.fire();
        }
        y() {
            if (!this.C) {
                const defaults = this.cb(keybindingsRegistry_1.$Nu.getDefaultKeybindings(), true);
                const overrides = this.db(this.M.keybindings, false);
                this.C = new keybindingResolver_1.$1D(defaults, overrides, (str) => this.D(str));
            }
            return this.C;
        }
        z() {
            // it is possible that the document has lost focus, but the
            // window is still focused, e.g. when a <webview> element
            // has focus
            return this.Q.hasFocus;
        }
        cb(items, isDefault) {
            const result = [];
            let resultLen = 0;
            for (const item of items) {
                const when = item.when || undefined;
                const keybinding = item.keybinding;
                if (!keybinding) {
                    // This might be a removal keybinding item in user settings => accept it
                    result[resultLen++] = new resolvedKeybindingItem_1.$XD(undefined, item.command, item.commandArgs, when, isDefault, item.extensionId, item.isBuiltinExtension);
                }
                else {
                    if (this.eb(keybinding)) {
                        continue;
                    }
                    const resolvedKeybindings = this.r.resolveKeybinding(keybinding);
                    for (let i = resolvedKeybindings.length - 1; i >= 0; i--) {
                        const resolvedKeybinding = resolvedKeybindings[i];
                        result[resultLen++] = new resolvedKeybindingItem_1.$XD(resolvedKeybinding, item.command, item.commandArgs, when, isDefault, item.extensionId, item.isBuiltinExtension);
                    }
                }
            }
            return result;
        }
        db(items, isDefault) {
            const result = [];
            let resultLen = 0;
            for (const item of items) {
                const when = item.when || undefined;
                if (!item.keybinding) {
                    // This might be a removal keybinding item in user settings => accept it
                    result[resultLen++] = new resolvedKeybindingItem_1.$XD(undefined, item.command, item.commandArgs, when, isDefault, null, false);
                }
                else {
                    const resolvedKeybindings = this.r.resolveKeybinding(item.keybinding);
                    for (const resolvedKeybinding of resolvedKeybindings) {
                        result[resultLen++] = new resolvedKeybindingItem_1.$XD(resolvedKeybinding, item.command, item.commandArgs, when, isDefault, null, false);
                    }
                }
            }
            return result;
        }
        eb(keybinding) {
            if (canIUse_1.$bO.keyboard === 0 /* KeyboardSupport.Always */) {
                return false;
            }
            if (canIUse_1.$bO.keyboard === 1 /* KeyboardSupport.FullScreen */ && browser.$3N()) {
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
                    if (chord instanceof keybindings_1.$zq && (chord.scanCode === 86 /* ScanCode.ArrowLeft */ || chord.scanCode === 85 /* ScanCode.ArrowRight */)) {
                        // console.warn('Ctrl/Cmd+Arrow keybindings should not be used by default in web. Offender: ', kb.getHashCode(), ' for ', commandId);
                        return true;
                    }
                    if (chord instanceof keybindings_1.$yq && (chord.keyCode === 15 /* KeyCode.LeftArrow */ || chord.keyCode === 17 /* KeyCode.RightArrow */)) {
                        // console.warn('Ctrl/Cmd+Arrow keybindings should not be used by default in web. Offender: ', kb.getHashCode(), ' for ', commandId);
                        return true;
                    }
                }
                if ((partModifiersMask & modifiersMask) === 2048 /* KeyMod.CtrlCmd */) {
                    if (chord instanceof keybindings_1.$zq && (chord.scanCode >= 36 /* ScanCode.Digit1 */ && chord.scanCode <= 45 /* ScanCode.Digit0 */)) {
                        // console.warn('Ctrl/Cmd+Num keybindings should not be used by default in web. Offender: ', kb.getHashCode(), ' for ', commandId);
                        return true;
                    }
                    if (chord instanceof keybindings_1.$yq && (chord.keyCode >= 21 /* KeyCode.Digit0 */ && chord.keyCode <= 30 /* KeyCode.Digit9 */)) {
                        // console.warn('Ctrl/Cmd+Num keybindings should not be used by default in web. Offender: ', kb.getHashCode(), ' for ', commandId);
                        return true;
                    }
                }
            }
            return false;
        }
        resolveKeybinding(kb) {
            return this.r.resolveKeybinding(kb);
        }
        resolveKeyboardEvent(keyboardEvent) {
            this.R.validateCurrentKeyboardMapping(keyboardEvent);
            return this.r.resolveKeyboardEvent(keyboardEvent);
        }
        resolveUserBinding(userBinding) {
            const keybinding = keybindingParser_1.$GS.parseKeybinding(userBinding);
            return (keybinding ? this.r.resolveKeybinding(keybinding) : []);
        }
        fb(extensionId, isBuiltin, keybindings, collector, result) {
            if (Array.isArray(keybindings)) {
                for (let i = 0, len = keybindings.length; i < len; i++) {
                    this.gb(extensionId, isBuiltin, i + 1, keybindings[i], collector, result);
                }
            }
            else {
                this.gb(extensionId, isBuiltin, 1, keybindings, collector, result);
            }
        }
        gb(extensionId, isBuiltin, idx, keybindings, collector, result) {
            const rejects = [];
            if (isValidContributedKeyBinding(keybindings, rejects)) {
                const rule = this.ib(extensionId, isBuiltin, idx++, keybindings);
                if (rule) {
                    result.push(rule);
                }
            }
            if (rejects.length > 0) {
                collector.error(nls.localize(15, null, keybindingsExtPoint.name, rejects.join('\n')));
            }
        }
        static hb(key, mac, linux, win) {
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
        ib(extensionId, isBuiltin, idx, binding) {
            const { command, args, when, key, mac, linux, win } = binding;
            const keybinding = $2yb_1.hb(key, mac, linux, win);
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
            const commandAction = actions_1.$Tu.getCommand(command);
            const precondition = commandAction && commandAction.precondition;
            let fullWhen;
            if (when && precondition) {
                fullWhen = contextkey_1.$Ii.and(precondition, contextkey_1.$Ii.deserialize(when));
            }
            else if (when) {
                fullWhen = contextkey_1.$Ii.deserialize(when);
            }
            else if (precondition) {
                fullWhen = precondition;
            }
            const desc = {
                id: command,
                args,
                when: fullWhen,
                weight: weight,
                keybinding: keybindingParser_1.$GS.parseKeybinding(keybinding),
                extensionId: extensionId.value,
                isBuiltinExtension: isBuiltin
            };
            return desc;
        }
        getDefaultKeybindingsContent() {
            const resolver = this.y();
            const defaultKeybindings = resolver.getDefaultKeybindings();
            const boundCommands = resolver.getDefaultBoundCommands();
            return ($2yb_1.jb(defaultKeybindings)
                + '\n\n'
                + $2yb_1.lb(boundCommands));
        }
        static jb(defaultKeybindings) {
            const out = new keybindingIO_1.$1yb();
            out.writeLine('[');
            const lastIndex = defaultKeybindings.length - 1;
            defaultKeybindings.forEach((k, index) => {
                keybindingIO_1.$Zyb.writeKeybindingItem(out, k);
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
        static lb(boundCommands) {
            const unboundCommands = (0, unboundCommands_1.$Ayb)(boundCommands);
            const pretty = unboundCommands.sort().join('\n// - ');
            return '// ' + nls.localize(16, null) + '\n// - ' + pretty;
        }
        mightProducePrintableCharacter(event) {
            if (event.ctrlKey || event.metaKey || event.altKey) {
                // ignore ctrl/cmd/alt-combination but not shift-combinatios
                return false;
            }
            const code = keyCodes_1.$sq.toEnum(event.code);
            if (NUMPAD_PRINTABLE_SCANCODES.indexOf(code) !== -1) {
                // This is a numpad key that might produce a printable character based on NumLock.
                // Let's check if NumLock is on or off based on the event's keyCode.
                // e.g.
                // - when NumLock is off, ScanCode.Numpad4 produces KeyCode.LeftArrow
                // - when NumLock is on, ScanCode.Numpad4 produces KeyCode.NUMPAD_4
                // However, ScanCode.NumpadAdd always produces KeyCode.NUMPAD_ADD
                if (event.keyCode === keyCodes_1.$tq[code]) {
                    // NumLock is on or this is /, *, -, + on the numpad
                    return true;
                }
                if (platform_1.$j && event.keyCode === otherMacNumpadMapping.get(code)) {
                    // on macOS, the numpad keys can also map to keys 1 - 0.
                    return true;
                }
                return false;
            }
            const keycode = keyCodes_1.$tq[code];
            if (keycode !== -1) {
                // https://github.com/microsoft/vscode/issues/74934
                return false;
            }
            // consult the KeyboardMapperFactory to check the given event for
            // a printable value.
            const mapping = this.R.getRawKeyboardMapping();
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
    exports.$2yb = $2yb;
    exports.$2yb = $2yb = $2yb_1 = __decorate([
        __param(0, contextkey_1.$3i),
        __param(1, commands_1.$Fr),
        __param(2, telemetry_1.$9k),
        __param(3, notification_1.$Yu),
        __param(4, userDataProfile_1.$CJ),
        __param(5, host_1.$VT),
        __param(6, extensions_2.$MF),
        __param(7, files_1.$6j),
        __param(8, uriIdentity_1.$Ck),
        __param(9, log_1.$5i),
        __param(10, keyboardLayout_1.$Tyb)
    ], $2yb);
    class UserKeybindings extends lifecycle_1.$kc {
        get keybindings() { return this.b; }
        constructor(h, j, m, logService) {
            super();
            this.h = h;
            this.j = j;
            this.m = m;
            this.a = [];
            this.b = [];
            this.f = this.B(new lifecycle_1.$jc());
            this.g = this.B(new event_1.$fd());
            this.onDidChange = this.g.event;
            this.r();
            this.c = this.B(new async_1.$Sg(() => this.s().then(changed => {
                if (changed) {
                    this.g.fire();
                }
            }), 50));
            this.B(event_1.Event.filter(this.m.onDidFilesChange, e => e.contains(this.h.currentProfile.keybindingsResource))(() => {
                logService.debug('Keybindings file changed');
                this.c.schedule();
            }));
            this.B(this.m.onDidRunOperation((e) => {
                if (e.operation === 4 /* FileOperation.WRITE */ && e.resource.toString() === this.h.currentProfile.keybindingsResource.toString()) {
                    logService.debug('Keybindings file written');
                    this.c.schedule();
                }
            }));
            this.B(h.onDidChangeCurrentProfile(e => {
                if (!this.j.extUri.isEqual(e.previous.keybindingsResource, e.profile.keybindingsResource)) {
                    e.join(this.n());
                }
            }));
        }
        async n() {
            this.r();
            this.c.schedule();
        }
        r() {
            this.f.clear();
            this.f.add(this.m.watch((0, resources_1.$hg)(this.h.currentProfile.keybindingsResource)));
            // Also listen to the resource incase the resource is a symlink - https://github.com/microsoft/vscode/issues/118134
            this.f.add(this.m.watch(this.h.currentProfile.keybindingsResource));
        }
        async initialize() {
            await this.s();
        }
        async s() {
            const newKeybindings = await this.t();
            if (objects.$Zm(this.a, newKeybindings)) {
                // no change
                return false;
            }
            this.a = newKeybindings;
            this.b = this.a.map((k) => keybindingIO_1.$Zyb.readUserKeybindingItem(k));
            return true;
        }
        async t() {
            try {
                const content = await this.m.readFile(this.h.currentProfile.keybindingsResource);
                const value = (0, json_1.$Lm)(content.value.toString());
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
        static { this.a = 'vscode://schemas/keybindings'; }
        constructor() {
            this.b = [];
            this.c = [];
            this.d = [];
            this.f = [];
            this.g = {
                id: KeybindingsJsonSchema.a,
                type: 'array',
                title: nls.localize(17, null),
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
                        'enum': this.c,
                        'enumDescriptions': this.f,
                        'description': nls.localize(18, null),
                    },
                    'commandType': {
                        'anyOf': [
                            {
                                $ref: '#/definitions/commandNames'
                            },
                            {
                                'type': 'string',
                                'enum': this.d,
                                'enumDescriptions': this.f,
                                'description': nls.localize(19, null),
                            },
                            {
                                'type': 'string'
                            },
                        ]
                    },
                    'commandsSchemas': {
                        'allOf': this.b
                    }
                },
                items: {
                    'required': ['key'],
                    'type': 'object',
                    'defaultSnippets': [{ 'body': { 'key': '$1', 'command': '$2', 'when': '$3' } }],
                    'properties': {
                        'key': {
                            'type': 'string',
                            'description': nls.localize(20, null),
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
                                        'errorMessage': nls.localize(21, null, 'string')
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
                            'description': nls.localize(22, null)
                        },
                        'args': {
                            'description': nls.localize(23, null)
                        }
                    },
                    '$ref': '#/definitions/commandsSchemas'
                }
            };
            this.h = platform_2.$8m.as(jsonContributionRegistry_1.$9m.JSONContribution);
            this.h.registerSchema(KeybindingsJsonSchema.a, this.g);
        }
        // TODO@ulugbekna: can updates happen incrementally rather than rebuilding; concerns:
        // - is just appending additional schemas enough for the registry to pick them up?
        // - can `CommandsRegistry.getCommands` and `MenuRegistry.getCommands` return different values at different times? ie would just pushing new schemas from `additionalContributions` not be enough?
        updateSchema(additionalContributions) {
            this.b.length = 0;
            this.c.length = 0;
            this.d.length = 0;
            this.f.length = 0;
            const knownCommands = new Set();
            const addKnownCommand = (commandId, description) => {
                if (!/^_/.test(commandId)) {
                    if (!knownCommands.has(commandId)) {
                        knownCommands.add(commandId);
                        this.c.push(commandId);
                        this.f.push(description);
                        // Also add the negative form for keybinding removal
                        this.d.push(`-${commandId}`);
                    }
                }
            };
            const allCommands = commands_1.$Gr.getCommands();
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
                this.b.push(addition);
            }
            const menuCommands = actions_1.$Tu.getCommands();
            for (const commandId of menuCommands.keys()) {
                addKnownCommand(commandId);
            }
            this.b.push(...additionalContributions);
            this.h.notifySchemaChanged(KeybindingsJsonSchema.a);
        }
    }
    (0, extensions_1.$mr)(keybinding_1.$2D, $2yb, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=keybindingService.js.map