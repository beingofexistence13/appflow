/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/keybindings", "vs/base/common/platform", "vs/platform/keybinding/common/keybindingResolver", "vs/platform/keybinding/common/usLayoutResolvedKeybinding"], function (require, exports, event_1, keybindings_1, platform_1, keybindingResolver_1, usLayoutResolvedKeybinding_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MockKeybindingService = exports.MockScopableContextKeyService = exports.MockContextKeyService = void 0;
    class MockKeybindingContextKey {
        constructor(defaultValue) {
            this._defaultValue = defaultValue;
            this._value = this._defaultValue;
        }
        set(value) {
            this._value = value;
        }
        reset() {
            this._value = this._defaultValue;
        }
        get() {
            return this._value;
        }
    }
    class MockContextKeyService {
        constructor() {
            this._keys = new Map();
        }
        dispose() {
            //
        }
        createKey(key, defaultValue) {
            const ret = new MockKeybindingContextKey(defaultValue);
            this._keys.set(key, ret);
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
            const value = this._keys.get(key);
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
    exports.MockContextKeyService = MockContextKeyService;
    class MockScopableContextKeyService extends MockContextKeyService {
        /**
         * Don't implement this for all tests since we rarely depend on this behavior and it isn't implemented fully
         */
        createScoped(domNote) {
            return new MockContextKeyService();
        }
    }
    exports.MockScopableContextKeyService = MockScopableContextKeyService;
    class MockKeybindingService {
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
            return usLayoutResolvedKeybinding_1.USLayoutResolvedKeybinding.resolveKeybinding(keybinding, platform_1.OS);
        }
        resolveKeyboardEvent(keyboardEvent) {
            const chord = new keybindings_1.KeyCodeChord(keyboardEvent.ctrlKey, keyboardEvent.shiftKey, keyboardEvent.altKey, keyboardEvent.metaKey, keyboardEvent.keyCode);
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
            return keybindingResolver_1.NoMatchingKb;
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
    exports.MockKeybindingService = MockKeybindingService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja0tleWJpbmRpbmdTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0va2V5YmluZGluZy90ZXN0L2NvbW1vbi9tb2NrS2V5YmluZGluZ1NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBV2hHLE1BQU0sd0JBQXdCO1FBSTdCLFlBQVksWUFBMkI7WUFDdEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxZQUFZLENBQUM7WUFDbEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO1FBQ2xDLENBQUM7UUFFTSxHQUFHLENBQUMsS0FBb0I7WUFDOUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDckIsQ0FBQztRQUVNLEtBQUs7WUFDWCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDbEMsQ0FBQztRQUVNLEdBQUc7WUFDVCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDcEIsQ0FBQztLQUNEO0lBRUQsTUFBYSxxQkFBcUI7UUFBbEM7WUFHUyxVQUFLLEdBQUcsSUFBSSxHQUFHLEVBQTRCLENBQUM7UUFtQ3JELENBQUM7UUFqQ08sT0FBTztZQUNiLEVBQUU7UUFDSCxDQUFDO1FBQ00sU0FBUyxDQUE4QyxHQUFXLEVBQUUsWUFBMkI7WUFDckcsTUFBTSxHQUFHLEdBQUcsSUFBSSx3QkFBd0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUN2RCxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDekIsT0FBTyxHQUFHLENBQUM7UUFDWixDQUFDO1FBQ00sbUJBQW1CLENBQUMsS0FBMkI7WUFDckQsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBQ0QsSUFBVyxrQkFBa0I7WUFDNUIsT0FBTyxhQUFLLENBQUMsSUFB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