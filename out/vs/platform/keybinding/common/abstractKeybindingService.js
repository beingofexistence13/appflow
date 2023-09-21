/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/ime", "vs/base/common/lifecycle", "vs/nls", "vs/platform/keybinding/common/keybindingResolver"], function (require, exports, arrays, async_1, errors_1, event_1, ime_1, lifecycle_1, nls, keybindingResolver_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractKeybindingService = void 0;
    const HIGH_FREQ_COMMANDS = /^(cursor|delete|undo|redo|tab|editor\.action\.clipboard)/;
    class AbstractKeybindingService extends lifecycle_1.Disposable {
        get onDidUpdateKeybindings() {
            return this._onDidUpdateKeybindings ? this._onDidUpdateKeybindings.event : event_1.Event.None; // Sinon stubbing walks properties on prototype
        }
        get inChordMode() {
            return this._currentChords.length > 0;
        }
        constructor(_contextKeyService, _commandService, _telemetryService, _notificationService, _logService) {
            super();
            this._contextKeyService = _contextKeyService;
            this._commandService = _commandService;
            this._telemetryService = _telemetryService;
            this._notificationService = _notificationService;
            this._logService = _logService;
            this._onDidUpdateKeybindings = this._register(new event_1.Emitter());
            this._currentChords = [];
            this._currentChordChecker = new async_1.IntervalTimer();
            this._currentChordStatusMessage = null;
            this._ignoreSingleModifiers = KeybindingModifierSet.EMPTY;
            this._currentSingleModifier = null;
            this._currentSingleModifierClearTimeout = new async_1.TimeoutTimer();
            this._logging = false;
        }
        dispose() {
            super.dispose();
        }
        getDefaultKeybindingsContent() {
            return '';
        }
        toggleLogging() {
            this._logging = !this._logging;
            return this._logging;
        }
        _log(str) {
            if (this._logging) {
                this._logService.info(`[KeybindingService]: ${str}`);
            }
        }
        getDefaultKeybindings() {
            return this._getResolver().getDefaultKeybindings();
        }
        getKeybindings() {
            return this._getResolver().getKeybindings();
        }
        customKeybindingsCount() {
            return 0;
        }
        lookupKeybindings(commandId) {
            return arrays.coalesce(this._getResolver().lookupKeybindings(commandId).map(item => item.resolvedKeybinding));
        }
        lookupKeybinding(commandId, context) {
            const result = this._getResolver().lookupPrimaryKeybinding(commandId, context || this._contextKeyService);
            if (!result) {
                return undefined;
            }
            return result.resolvedKeybinding;
        }
        dispatchEvent(e, target) {
            return this._dispatch(e, target);
        }
        // TODO@ulugbekna: update namings to align with `_doDispatch`
        // TODO@ulugbekna: this fn doesn't seem to take into account single-modifier keybindings, eg `shift shift`
        softDispatch(e, target) {
            this._log(`/ Soft dispatching keyboard event`);
            const keybinding = this.resolveKeyboardEvent(e);
            if (keybinding.hasMultipleChords()) {
                console.warn('keyboard event should not be mapped to multiple chords');
                return keybindingResolver_1.NoMatchingKb;
            }
            const [firstChord,] = keybinding.getDispatchChords();
            if (firstChord === null) {
                // cannot be dispatched, probably only modifier keys
                this._log(`\\ Keyboard event cannot be dispatched`);
                return keybindingResolver_1.NoMatchingKb;
            }
            const contextValue = this._contextKeyService.getContext(target);
            const currentChords = this._currentChords.map((({ keypress }) => keypress));
            return this._getResolver().resolve(contextValue, currentChords, firstChord);
        }
        _scheduleLeaveChordMode() {
            const chordLastInteractedTime = Date.now();
            this._currentChordChecker.cancelAndSet(() => {
                if (!this._documentHasFocus()) {
                    // Focus has been lost => leave chord mode
                    this._leaveChordMode();
                    return;
                }
                if (Date.now() - chordLastInteractedTime > 5000) {
                    // 5 seconds elapsed => leave chord mode
                    this._leaveChordMode();
                }
            }, 500);
        }
        _expectAnotherChord(firstChord, keypressLabel) {
            this._currentChords.push({ keypress: firstChord, label: keypressLabel });
            switch (this._currentChords.length) {
                case 0:
                    throw (0, errors_1.illegalState)('impossible');
                case 1:
                    // TODO@ulugbekna: revise this message and the one below (at least, fix terminology)
                    this._currentChordStatusMessage = this._notificationService.status(nls.localize('first.chord', "({0}) was pressed. Waiting for second key of chord...", keypressLabel));
                    break;
                default: {
                    const fullKeypressLabel = this._currentChords.map(({ label }) => label).join(', ');
                    this._currentChordStatusMessage = this._notificationService.status(nls.localize('next.chord', "({0}) was pressed. Waiting for next key of chord...", fullKeypressLabel));
                }
            }
            this._scheduleLeaveChordMode();
            if (ime_1.IME.enabled) {
                ime_1.IME.disable();
            }
        }
        _leaveChordMode() {
            if (this._currentChordStatusMessage) {
                this._currentChordStatusMessage.dispose();
                this._currentChordStatusMessage = null;
            }
            this._currentChordChecker.cancel();
            this._currentChords = [];
            ime_1.IME.enable();
        }
        dispatchByUserSettingsLabel(userSettingsLabel, target) {
            this._log(`/ Dispatching keybinding triggered via menu entry accelerator - ${userSettingsLabel}`);
            const keybindings = this.resolveUserBinding(userSettingsLabel);
            if (keybindings.length === 0) {
                this._log(`\\ Could not resolve - ${userSettingsLabel}`);
            }
            else {
                this._doDispatch(keybindings[0], target, /*isSingleModiferChord*/ false);
            }
        }
        _dispatch(e, target) {
            return this._doDispatch(this.resolveKeyboardEvent(e), target, /*isSingleModiferChord*/ false);
        }
        _singleModifierDispatch(e, target) {
            const keybinding = this.resolveKeyboardEvent(e);
            const [singleModifier,] = keybinding.getSingleModifierDispatchChords();
            if (singleModifier) {
                if (this._ignoreSingleModifiers.has(singleModifier)) {
                    this._log(`+ Ignoring single modifier ${singleModifier} due to it being pressed together with other keys.`);
                    this._ignoreSingleModifiers = KeybindingModifierSet.EMPTY;
                    this._currentSingleModifierClearTimeout.cancel();
                    this._currentSingleModifier = null;
                    return false;
                }
                this._ignoreSingleModifiers = KeybindingModifierSet.EMPTY;
                if (this._currentSingleModifier === null) {
                    // we have a valid `singleModifier`, store it for the next keyup, but clear it in 300ms
                    this._log(`+ Storing single modifier for possible chord ${singleModifier}.`);
                    this._currentSingleModifier = singleModifier;
                    this._currentSingleModifierClearTimeout.cancelAndSet(() => {
                        this._log(`+ Clearing single modifier due to 300ms elapsed.`);
                        this._currentSingleModifier = null;
                    }, 300);
                    return false;
                }
                if (singleModifier === this._currentSingleModifier) {
                    // bingo!
                    this._log(`/ Dispatching single modifier chord ${singleModifier} ${singleModifier}`);
                    this._currentSingleModifierClearTimeout.cancel();
                    this._currentSingleModifier = null;
                    return this._doDispatch(keybinding, target, /*isSingleModiferChord*/ true);
                }
                this._log(`+ Clearing single modifier due to modifier mismatch: ${this._currentSingleModifier} ${singleModifier}`);
                this._currentSingleModifierClearTimeout.cancel();
                this._currentSingleModifier = null;
                return false;
            }
            // When pressing a modifier and holding it pressed with any other modifier or key combination,
            // the pressed modifiers should no longer be considered for single modifier dispatch.
            const [firstChord,] = keybinding.getChords();
            this._ignoreSingleModifiers = new KeybindingModifierSet(firstChord);
            if (this._currentSingleModifier !== null) {
                this._log(`+ Clearing single modifier due to other key up.`);
            }
            this._currentSingleModifierClearTimeout.cancel();
            this._currentSingleModifier = null;
            return false;
        }
        _doDispatch(userKeypress, target, isSingleModiferChord = false) {
            let shouldPreventDefault = false;
            if (userKeypress.hasMultipleChords()) { // warn - because user can press a single chord at a time
                console.warn('Unexpected keyboard event mapped to multiple chords');
                return false;
            }
            let userPressedChord = null;
            let currentChords = null;
            if (isSingleModiferChord) {
                // The keybinding is the second keypress of a single modifier chord, e.g. "shift shift".
                // A single modifier can only occur when the same modifier is pressed in short sequence,
                // hence we disregard `_currentChord` and use the same modifier instead.
                const [dispatchKeyname,] = userKeypress.getSingleModifierDispatchChords();
                userPressedChord = dispatchKeyname;
                currentChords = dispatchKeyname ? [dispatchKeyname] : []; // TODO@ulugbekna: in the `else` case we assign an empty array - make sure `resolve` can handle an empty array well
            }
            else {
                [userPressedChord,] = userKeypress.getDispatchChords();
                currentChords = this._currentChords.map(({ keypress }) => keypress);
            }
            if (userPressedChord === null) {
                this._log(`\\ Keyboard event cannot be dispatched in keydown phase.`);
                // cannot be dispatched, probably only modifier keys
                return shouldPreventDefault;
            }
            const contextValue = this._contextKeyService.getContext(target);
            const keypressLabel = userKeypress.getLabel();
            const resolveResult = this._getResolver().resolve(contextValue, currentChords, userPressedChord);
            switch (resolveResult.kind) {
                case 0 /* ResultKind.NoMatchingKb */: {
                    this._logService.trace('KeybindingService#dispatch', keypressLabel, `[ No matching keybinding ]`);
                    if (this.inChordMode) {
                        const currentChordsLabel = this._currentChords.map(({ label }) => label).join(', ');
                        this._log(`+ Leaving multi-chord mode: Nothing bound to "${currentChordsLabel}, ${keypressLabel}".`);
                        this._notificationService.status(nls.localize('missing.chord', "The key combination ({0}, {1}) is not a command.", currentChordsLabel, keypressLabel), { hideAfter: 10 * 1000 /* 10s */ });
                        this._leaveChordMode();
                        shouldPreventDefault = true;
                    }
                    return shouldPreventDefault;
                }
                case 1 /* ResultKind.MoreChordsNeeded */: {
                    this._logService.trace('KeybindingService#dispatch', keypressLabel, `[ Several keybindings match - more chords needed ]`);
                    shouldPreventDefault = true;
                    this._expectAnotherChord(userPressedChord, keypressLabel);
                    this._log(this._currentChords.length === 1 ? `+ Entering multi-chord mode...` : `+ Continuing multi-chord mode...`);
                    return shouldPreventDefault;
                }
                case 2 /* ResultKind.KbFound */: {
                    this._logService.trace('KeybindingService#dispatch', keypressLabel, `[ Will dispatch command ${resolveResult.commandId} ]`);
                    if (resolveResult.commandId === null || resolveResult.commandId === '') {
                        if (this.inChordMode) {
                            const currentChordsLabel = this._currentChords.map(({ label }) => label).join(', ');
                            this._log(`+ Leaving chord mode: Nothing bound to "${currentChordsLabel}, ${keypressLabel}".`);
                            this._notificationService.status(nls.localize('missing.chord', "The key combination ({0}, {1}) is not a command.", currentChordsLabel, keypressLabel), { hideAfter: 10 * 1000 /* 10s */ });
                            this._leaveChordMode();
                            shouldPreventDefault = true;
                        }
                    }
                    else {
                        if (this.inChordMode) {
                            this._leaveChordMode();
                        }
                        if (!resolveResult.isBubble) {
                            shouldPreventDefault = true;
                        }
                        this._log(`+ Invoking command ${resolveResult.commandId}.`);
                        if (typeof resolveResult.commandArgs === 'undefined') {
                            this._commandService.executeCommand(resolveResult.commandId).then(undefined, err => this._notificationService.warn(err));
                        }
                        else {
                            this._commandService.executeCommand(resolveResult.commandId, resolveResult.commandArgs).then(undefined, err => this._notificationService.warn(err));
                        }
                        if (!HIGH_FREQ_COMMANDS.test(resolveResult.commandId)) {
                            this._telemetryService.publicLog2('workbenchActionExecuted', { id: resolveResult.commandId, from: 'keybinding', detail: userKeypress.getUserSettingsLabel() ?? undefined });
                        }
                    }
                    return shouldPreventDefault;
                }
            }
        }
        mightProducePrintableCharacter(event) {
            if (event.ctrlKey || event.metaKey) {
                // ignore ctrl/cmd-combination but not shift/alt-combinatios
                return false;
            }
            // weak check for certain ranges. this is properly implemented in a subclass
            // with access to the KeyboardMapperFactory.
            if ((event.keyCode >= 31 /* KeyCode.KeyA */ && event.keyCode <= 56 /* KeyCode.KeyZ */)
                || (event.keyCode >= 21 /* KeyCode.Digit0 */ && event.keyCode <= 30 /* KeyCode.Digit9 */)) {
                return true;
            }
            return false;
        }
    }
    exports.AbstractKeybindingService = AbstractKeybindingService;
    class KeybindingModifierSet {
        static { this.EMPTY = new KeybindingModifierSet(null); }
        constructor(source) {
            this._ctrlKey = source ? source.ctrlKey : false;
            this._shiftKey = source ? source.shiftKey : false;
            this._altKey = source ? source.altKey : false;
            this._metaKey = source ? source.metaKey : false;
        }
        has(modifier) {
            switch (modifier) {
                case 'ctrl': return this._ctrlKey;
                case 'shift': return this._shiftKey;
                case 'alt': return this._altKey;
                case 'meta': return this._metaKey;
            }
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJzdHJhY3RLZXliaW5kaW5nU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2tleWJpbmRpbmcvY29tbW9uL2Fic3RyYWN0S2V5YmluZGluZ1NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBMkJoRyxNQUFNLGtCQUFrQixHQUFHLDBEQUEwRCxDQUFDO0lBRXRGLE1BQXNCLHlCQUEwQixTQUFRLHNCQUFVO1FBS2pFLElBQUksc0JBQXNCO1lBQ3pCLE9BQU8sSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxhQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsK0NBQStDO1FBQ3ZJLENBQUM7UUFtQkQsSUFBVyxXQUFXO1lBQ3JCLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7UUFFRCxZQUNTLGtCQUFzQyxFQUNwQyxlQUFnQyxFQUNoQyxpQkFBb0MsRUFDdEMsb0JBQTBDLEVBQ3hDLFdBQXdCO1lBRWxDLEtBQUssRUFBRSxDQUFDO1lBTkEsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtZQUNwQyxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7WUFDaEMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFtQjtZQUN0Qyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1lBQ3hDLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1lBL0JoQiw0QkFBdUIsR0FBa0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBUSxDQUFDLENBQUM7WUFtQy9GLElBQUksQ0FBQyxjQUFjLEdBQUcsRUFBRSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLHFCQUFhLEVBQUUsQ0FBQztZQUNoRCxJQUFJLENBQUMsMEJBQTBCLEdBQUcsSUFBSSxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxxQkFBcUIsQ0FBQyxLQUFLLENBQUM7WUFDMUQsSUFBSSxDQUFDLHNCQUFzQixHQUFHLElBQUksQ0FBQztZQUNuQyxJQUFJLENBQUMsa0NBQWtDLEdBQUcsSUFBSSxvQkFBWSxFQUFFLENBQUM7WUFDN0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFDdkIsQ0FBQztRQUVlLE9BQU87WUFDdEIsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2pCLENBQUM7UUFXTSw0QkFBNEI7WUFDbEMsT0FBTyxFQUFFLENBQUM7UUFDWCxDQUFDO1FBRU0sYUFBYTtZQUNuQixJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUMvQixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDdEIsQ0FBQztRQUVTLElBQUksQ0FBQyxHQUFXO1lBQ3pCLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDbEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLEdBQUcsRUFBRSxDQUFDLENBQUM7YUFDckQ7UUFDRixDQUFDO1FBRU0scUJBQXFCO1lBQzNCLE9BQU8sSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDcEQsQ0FBQztRQUVNLGNBQWM7WUFDcEIsT0FBTyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDN0MsQ0FBQztRQUVNLHNCQUFzQjtZQUM1QixPQUFPLENBQUMsQ0FBQztRQUNWLENBQUM7UUFFTSxpQkFBaUIsQ0FBQyxTQUFpQjtZQUN6QyxPQUFPLE1BQU0sQ0FBQyxRQUFRLENBQ3JCLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FDckYsQ0FBQztRQUNILENBQUM7UUFFTSxnQkFBZ0IsQ0FBQyxTQUFpQixFQUFFLE9BQTRCO1lBQ3RFLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLEVBQUUsT0FBTyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQzFHLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ1osT0FBTyxTQUFTLENBQUM7YUFDakI7WUFDRCxPQUFPLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQztRQUNsQyxDQUFDO1FBRU0sYUFBYSxDQUFDLENBQWlCLEVBQUUsTUFBZ0M7WUFDdkUsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNsQyxDQUFDO1FBRUQsNkRBQTZEO1FBQzdELDBHQUEwRztRQUNuRyxZQUFZLENBQUMsQ0FBaUIsRUFBRSxNQUFnQztZQUN0RSxJQUFJLENBQUMsSUFBSSxDQUFDLG1DQUFtQyxDQUFDLENBQUM7WUFDL0MsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hELElBQUksVUFBVSxDQUFDLGlCQUFpQixFQUFFLEVBQUU7Z0JBQ25DLE9BQU8sQ0FBQyxJQUFJLENBQUMsd0RBQXdELENBQUMsQ0FBQztnQkFDdkUsT0FBTyxpQ0FBWSxDQUFDO2FBQ3BCO1lBQ0QsTUFBTSxDQUFDLFVBQVUsRUFBRSxHQUFHLFVBQVUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQ3JELElBQUksVUFBVSxLQUFLLElBQUksRUFBRTtnQkFDeEIsb0RBQW9EO2dCQUNwRCxJQUFJLENBQUMsSUFBSSxDQUFDLHdDQUF3QyxDQUFDLENBQUM7Z0JBQ3BELE9BQU8saUNBQVksQ0FBQzthQUNwQjtZQUVELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDaEUsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDNUUsT0FBTyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxhQUFhLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDN0UsQ0FBQztRQUVPLHVCQUF1QjtZQUM5QixNQUFNLHVCQUF1QixHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUMzQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRTtnQkFFM0MsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxFQUFFO29CQUM5QiwwQ0FBMEM7b0JBQzFDLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztvQkFDdkIsT0FBTztpQkFDUDtnQkFFRCxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyx1QkFBdUIsR0FBRyxJQUFJLEVBQUU7b0JBQ2hELHdDQUF3QztvQkFDeEMsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO2lCQUN2QjtZQUVGLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNULENBQUM7UUFFTyxtQkFBbUIsQ0FBQyxVQUFrQixFQUFFLGFBQTRCO1lBRTNFLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsYUFBYSxFQUFFLENBQUMsQ0FBQztZQUV6RSxRQUFRLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFO2dCQUNuQyxLQUFLLENBQUM7b0JBQ0wsTUFBTSxJQUFBLHFCQUFZLEVBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQ2xDLEtBQUssQ0FBQztvQkFDTCxvRkFBb0Y7b0JBQ3BGLElBQUksQ0FBQywwQkFBMEIsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLHVEQUF1RCxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUM7b0JBQ3hLLE1BQU07Z0JBQ1AsT0FBTyxDQUFDLENBQUM7b0JBQ1IsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDbkYsSUFBSSxDQUFDLDBCQUEwQixHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUscURBQXFELEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO2lCQUN6SzthQUNEO1lBRUQsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7WUFFL0IsSUFBSSxTQUFHLENBQUMsT0FBTyxFQUFFO2dCQUNoQixTQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7YUFDZDtRQUNGLENBQUM7UUFFTyxlQUFlO1lBQ3RCLElBQUksSUFBSSxDQUFDLDBCQUEwQixFQUFFO2dCQUNwQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQzFDLElBQUksQ0FBQywwQkFBMEIsR0FBRyxJQUFJLENBQUM7YUFDdkM7WUFDRCxJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDbkMsSUFBSSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUM7WUFDekIsU0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2QsQ0FBQztRQUVNLDJCQUEyQixDQUFDLGlCQUF5QixFQUFFLE1BQWdDO1lBQzdGLElBQUksQ0FBQyxJQUFJLENBQUMsbUVBQW1FLGlCQUFpQixFQUFFLENBQUMsQ0FBQztZQUNsRyxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUMvRCxJQUFJLFdBQVcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUM3QixJQUFJLENBQUMsSUFBSSxDQUFDLDBCQUEwQixpQkFBaUIsRUFBRSxDQUFDLENBQUM7YUFDekQ7aUJBQU07Z0JBQ04sSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLHdCQUF3QixDQUFBLEtBQUssQ0FBQyxDQUFDO2FBQ3hFO1FBQ0YsQ0FBQztRQUVTLFNBQVMsQ0FBQyxDQUFpQixFQUFFLE1BQWdDO1lBQ3RFLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLHdCQUF3QixDQUFBLEtBQUssQ0FBQyxDQUFDO1FBQzlGLENBQUM7UUFFUyx1QkFBdUIsQ0FBQyxDQUFpQixFQUFFLE1BQWdDO1lBQ3BGLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoRCxNQUFNLENBQUMsY0FBYyxFQUFFLEdBQUcsVUFBVSxDQUFDLCtCQUErQixFQUFFLENBQUM7WUFFdkUsSUFBSSxjQUFjLEVBQUU7Z0JBRW5CLElBQUksSUFBSSxDQUFDLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsRUFBRTtvQkFDcEQsSUFBSSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsY0FBYyxvREFBb0QsQ0FBQyxDQUFDO29CQUM1RyxJQUFJLENBQUMsc0JBQXNCLEdBQUcscUJBQXFCLENBQUMsS0FBSyxDQUFDO29CQUMxRCxJQUFJLENBQUMsa0NBQWtDLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBQ2pELElBQUksQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLENBQUM7b0JBQ25DLE9BQU8sS0FBSyxDQUFDO2lCQUNiO2dCQUVELElBQUksQ0FBQyxzQkFBc0IsR0FBRyxxQkFBcUIsQ0FBQyxLQUFLLENBQUM7Z0JBRTFELElBQUksSUFBSSxDQUFDLHNCQUFzQixLQUFLLElBQUksRUFBRTtvQkFDekMsdUZBQXVGO29CQUN2RixJQUFJLENBQUMsSUFBSSxDQUFDLGdEQUFnRCxjQUFjLEdBQUcsQ0FBQyxDQUFDO29CQUM3RSxJQUFJLENBQUMsc0JBQXNCLEdBQUcsY0FBYyxDQUFDO29CQUM3QyxJQUFJLENBQUMsa0NBQWtDLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRTt3QkFDekQsSUFBSSxDQUFDLElBQUksQ0FBQyxrREFBa0QsQ0FBQyxDQUFDO3dCQUM5RCxJQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDO29CQUNwQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7b0JBQ1IsT0FBTyxLQUFLLENBQUM7aUJBQ2I7Z0JBRUQsSUFBSSxjQUFjLEtBQUssSUFBSSxDQUFDLHNCQUFzQixFQUFFO29CQUNuRCxTQUFTO29CQUNULElBQUksQ0FBQyxJQUFJLENBQUMsdUNBQXVDLGNBQWMsSUFBSSxjQUFjLEVBQUUsQ0FBQyxDQUFDO29CQUNyRixJQUFJLENBQUMsa0NBQWtDLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBQ2pELElBQUksQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLENBQUM7b0JBQ25DLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEVBQUUsTUFBTSxFQUFFLHdCQUF3QixDQUFBLElBQUksQ0FBQyxDQUFDO2lCQUMxRTtnQkFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLHdEQUF3RCxJQUFJLENBQUMsc0JBQXNCLElBQUksY0FBYyxFQUFFLENBQUMsQ0FBQztnQkFDbkgsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNqRCxJQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDO2dCQUNuQyxPQUFPLEtBQUssQ0FBQzthQUNiO1lBRUQsOEZBQThGO1lBQzlGLHFGQUFxRjtZQUNyRixNQUFNLENBQUMsVUFBVSxFQUFFLEdBQUcsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQzdDLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLHFCQUFxQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBRXBFLElBQUksSUFBSSxDQUFDLHNCQUFzQixLQUFLLElBQUksRUFBRTtnQkFDekMsSUFBSSxDQUFDLElBQUksQ0FBQyxpREFBaUQsQ0FBQyxDQUFDO2FBQzdEO1lBQ0QsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2pELElBQUksQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLENBQUM7WUFDbkMsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRU8sV0FBVyxDQUFDLFlBQWdDLEVBQUUsTUFBZ0MsRUFBRSxvQkFBb0IsR0FBRyxLQUFLO1lBQ25ILElBQUksb0JBQW9CLEdBQUcsS0FBSyxDQUFDO1lBRWpDLElBQUksWUFBWSxDQUFDLGlCQUFpQixFQUFFLEVBQUUsRUFBRSx5REFBeUQ7Z0JBQ2hHLE9BQU8sQ0FBQyxJQUFJLENBQUMscURBQXFELENBQUMsQ0FBQztnQkFDcEUsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELElBQUksZ0JBQWdCLEdBQWtCLElBQUksQ0FBQztZQUMzQyxJQUFJLGFBQWEsR0FBb0IsSUFBSSxDQUFDO1lBRTFDLElBQUksb0JBQW9CLEVBQUU7Z0JBQ3pCLHdGQUF3RjtnQkFDeEYsd0ZBQXdGO2dCQUN4Rix3RUFBd0U7Z0JBQ3hFLE1BQU0sQ0FBQyxlQUFlLEVBQUUsR0FBRyxZQUFZLENBQUMsK0JBQStCLEVBQUUsQ0FBQztnQkFDMUUsZ0JBQWdCLEdBQUcsZUFBZSxDQUFDO2dCQUNuQyxhQUFhLEdBQUcsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxtSEFBbUg7YUFDN0s7aUJBQU07Z0JBQ04sQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLFlBQVksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2dCQUN2RCxhQUFhLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUNwRTtZQUVELElBQUksZ0JBQWdCLEtBQUssSUFBSSxFQUFFO2dCQUM5QixJQUFJLENBQUMsSUFBSSxDQUFDLDBEQUEwRCxDQUFDLENBQUM7Z0JBQ3RFLG9EQUFvRDtnQkFDcEQsT0FBTyxvQkFBb0IsQ0FBQzthQUM1QjtZQUVELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDaEUsTUFBTSxhQUFhLEdBQUcsWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBRTlDLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLGFBQWEsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1lBRWpHLFFBQVEsYUFBYSxDQUFDLElBQUksRUFBRTtnQkFFM0Isb0NBQTRCLENBQUMsQ0FBQztvQkFFN0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsNEJBQTRCLEVBQUUsYUFBYSxFQUFFLDRCQUE0QixDQUFDLENBQUM7b0JBRWxHLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTt3QkFDckIsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDcEYsSUFBSSxDQUFDLElBQUksQ0FBQyxpREFBaUQsa0JBQWtCLEtBQUssYUFBYSxJQUFJLENBQUMsQ0FBQzt3QkFDckcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLGVBQWUsRUFBRSxrREFBa0QsRUFBRSxrQkFBa0IsRUFBRSxhQUFhLENBQUMsRUFBRSxFQUFFLFNBQVMsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7d0JBQzNMLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQzt3QkFFdkIsb0JBQW9CLEdBQUcsSUFBSSxDQUFDO3FCQUM1QjtvQkFDRCxPQUFPLG9CQUFvQixDQUFDO2lCQUM1QjtnQkFFRCx3Q0FBZ0MsQ0FBQyxDQUFDO29CQUVqQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsRUFBRSxhQUFhLEVBQUUsb0RBQW9ELENBQUMsQ0FBQztvQkFFMUgsb0JBQW9CLEdBQUcsSUFBSSxDQUFDO29CQUM1QixJQUFJLENBQUMsbUJBQW1CLENBQUMsZ0JBQWdCLEVBQUUsYUFBYSxDQUFDLENBQUM7b0JBQzFELElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDLENBQUMsa0NBQWtDLENBQUMsQ0FBQztvQkFDcEgsT0FBTyxvQkFBb0IsQ0FBQztpQkFDNUI7Z0JBRUQsK0JBQXVCLENBQUMsQ0FBQztvQkFFeEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsNEJBQTRCLEVBQUUsYUFBYSxFQUFFLDJCQUEyQixhQUFhLENBQUMsU0FBUyxJQUFJLENBQUMsQ0FBQztvQkFFNUgsSUFBSSxhQUFhLENBQUMsU0FBUyxLQUFLLElBQUksSUFBSSxhQUFhLENBQUMsU0FBUyxLQUFLLEVBQUUsRUFBRTt3QkFFdkUsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFOzRCQUNyQixNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDOzRCQUNwRixJQUFJLENBQUMsSUFBSSxDQUFDLDJDQUEyQyxrQkFBa0IsS0FBSyxhQUFhLElBQUksQ0FBQyxDQUFDOzRCQUMvRixJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsZUFBZSxFQUFFLGtEQUFrRCxFQUFFLGtCQUFrQixFQUFFLGFBQWEsQ0FBQyxFQUFFLEVBQUUsU0FBUyxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQzs0QkFDM0wsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDOzRCQUN2QixvQkFBb0IsR0FBRyxJQUFJLENBQUM7eUJBQzVCO3FCQUVEO3lCQUFNO3dCQUNOLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTs0QkFDckIsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO3lCQUN2Qjt3QkFFRCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRTs0QkFDNUIsb0JBQW9CLEdBQUcsSUFBSSxDQUFDO3lCQUM1Qjt3QkFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLHNCQUFzQixhQUFhLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQzt3QkFDNUQsSUFBSSxPQUFPLGFBQWEsQ0FBQyxXQUFXLEtBQUssV0FBVyxFQUFFOzRCQUNyRCxJQUFJLENBQUMsZUFBZSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzt5QkFDekg7NkJBQU07NEJBQ04sSUFBSSxDQUFDLGVBQWUsQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzt5QkFDcEo7d0JBRUQsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLEVBQUU7NEJBQ3RELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQXNFLHlCQUF5QixFQUFFLEVBQUUsRUFBRSxFQUFFLGFBQWEsQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUsWUFBWSxDQUFDLG9CQUFvQixFQUFFLElBQUksU0FBUyxFQUFFLENBQUMsQ0FBQzt5QkFDalA7cUJBQ0Q7b0JBRUQsT0FBTyxvQkFBb0IsQ0FBQztpQkFDNUI7YUFDRDtRQUNGLENBQUM7UUFFRCw4QkFBOEIsQ0FBQyxLQUFxQjtZQUNuRCxJQUFJLEtBQUssQ0FBQyxPQUFPLElBQUksS0FBSyxDQUFDLE9BQU8sRUFBRTtnQkFDbkMsNERBQTREO2dCQUM1RCxPQUFPLEtBQUssQ0FBQzthQUNiO1lBQ0QsNEVBQTRFO1lBQzVFLDRDQUE0QztZQUM1QyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8seUJBQWdCLElBQUksS0FBSyxDQUFDLE9BQU8seUJBQWdCLENBQUM7bUJBQ2hFLENBQUMsS0FBSyxDQUFDLE9BQU8sMkJBQWtCLElBQUksS0FBSyxDQUFDLE9BQU8sMkJBQWtCLENBQUMsRUFBRTtnQkFDekUsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUNELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztLQUNEO0lBeldELDhEQXlXQztJQUVELE1BQU0scUJBQXFCO2lCQUVaLFVBQUssR0FBRyxJQUFJLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBT3RELFlBQVksTUFBNEI7WUFDdkMsSUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUNoRCxJQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQ2xELElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7WUFDOUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUNqRCxDQUFDO1FBRUQsR0FBRyxDQUFDLFFBQTZCO1lBQ2hDLFFBQVEsUUFBUSxFQUFFO2dCQUNqQixLQUFLLE1BQU0sQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztnQkFDbEMsS0FBSyxPQUFPLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBQ3BDLEtBQUssS0FBSyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO2dCQUNoQyxLQUFLLE1BQU0sQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQzthQUNsQztRQUNGLENBQUMifQ==