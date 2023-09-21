/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/keybindings", "vs/base/common/platform", "vs/platform/keybinding/common/keybindingResolver", "vs/platform/keybinding/common/usLayoutResolvedKeybinding"], function (require, exports, event_1, keybindings_1, platform_1, keybindingResolver_1, usLayoutResolvedKeybinding_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$U0b = exports.$T0b = exports.$S0b = void 0;
    class MockKeybindingContextKey {
        constructor(defaultValue) {
            this.a = defaultValue;
            this.b = this.a;
        }
        set(value) {
            this.b = value;
        }
        reset() {
            this.b = this.a;
        }
        get() {
            return this.b;
        }
    }
    class $S0b {
        constructor() {
            this.a = new Map();
        }
        dispose() {
            //
        }
        createKey(key, defaultValue) {
            const ret = new MockKeybindingContextKey(defaultValue);
            this.a.set(key, ret);
            return ret;
        }
        contextMatchesRules(rules) {
            return false;
        }
        get onDidChangeContext() {
            return event_1.Event.None;
        }
        bufferChangeEvents(callback) { callback(); }
        getContextKeyValue(key) {
            const value = this.a.get(key);
            if (value) {
                return value.get();
            }
        }
        getContext(domNode) {
            return null;
        }
        createScoped(domNode) {
            return this;
        }
        createOverlay() {
            return this;
        }
        updateParent(_parentContextKeyService) {
            // no-op
        }
    }
    exports.$S0b = $S0b;
    class $T0b extends $S0b {
        /**
         * Don't implement this for all tests since we rarely depend on this behavior and it isn't implemented fully
         */
        createScoped(domNote) {
            return new $S0b();
        }
    }
    exports.$T0b = $T0b;
    class $U0b {
        constructor() {
            this.inChordMode = false;
        }
        get onDidUpdateKeybindings() {
            return event_1.Event.None;
        }
        getDefaultKeybindingsContent() {
            return '';
        }
        getDefaultKeybindings() {
            return [];
        }
        getKeybindings() {
            return [];
        }
        resolveKeybinding(keybinding) {
            return usLayoutResolvedKeybinding_1.$n3b.resolveKeybinding(keybinding, platform_1.OS);
        }
        resolveKeyboardEvent(keyboardEvent) {
            const chord = new keybindings_1.$yq(keyboardEvent.ctrlKey, keyboardEvent.shiftKey, keyboardEvent.altKey, keyboardEvent.metaKey, keyboardEvent.keyCode);
            return this.resolveKeybinding(chord.toKeybinding())[0];
        }
        resolveUserBinding(userBinding) {
            return [];
        }
        lookupKeybindings(commandId) {
            return [];
        }
        lookupKeybinding(commandId) {
            return undefined;
        }
        customKeybindingsCount() {
            return 0;
        }
        softDispatch(keybinding, target) {
            return keybindingResolver_1.$ZD;
        }
        dispatchByUserSettingsLabel(userSettingsLabel, target) {
        }
        dispatchEvent(e, target) {
            return false;
        }
        mightProducePrintableCharacter(e) {
            return false;
        }
        toggleLogging() {
            return false;
        }
        _dumpDebugInfo() {
            return '';
        }
        _dumpDebugInfoJSON() {
            return '';
        }
        registerSchemaContribution() {
            // noop
        }
    }
    exports.$U0b = $U0b;
});
//# sourceMappingURL=mockKeybindingService.js.map