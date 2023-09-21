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
define(["require", "exports", "vs/base/browser/dom", "vs/workbench/services/suggest/browser/simpleCompletionItem", "vs/workbench/services/suggest/browser/simpleCompletionModel", "vs/workbench/services/suggest/browser/simpleSuggestWidget", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/contrib/suggest/browser/suggestWidget", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/browser/defaultStyles"], function (require, exports, dom, simpleCompletionItem_1, simpleCompletionModel_1, simpleSuggestWidget_1, async_1, codicons_1, event_1, lifecycle_1, suggestWidget_1, instantiation_1, storage_1, colorRegistry_1, defaultStyles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SuggestAddon = void 0;
    var ShellIntegrationOscPs;
    (function (ShellIntegrationOscPs) {
        // TODO: Pull from elsewhere
        ShellIntegrationOscPs[ShellIntegrationOscPs["VSCode"] = 633] = "VSCode";
    })(ShellIntegrationOscPs || (ShellIntegrationOscPs = {}));
    var VSCodeOscPt;
    (function (VSCodeOscPt) {
        VSCodeOscPt["Completions"] = "Completions";
        VSCodeOscPt["CompletionsBash"] = "CompletionsBash";
        VSCodeOscPt["CompletionsBashFirstWord"] = "CompletionsBashFirstWord";
    })(VSCodeOscPt || (VSCodeOscPt = {}));
    /**
     * A map of the pwsh result type enum's value to the corresponding icon to use in completions.
     *
     * | Value | Name              | Description
     * |-------|-------------------|------------
     * | 0     | Text              | An unknown result type, kept as text only
     * | 1     | History           | A history result type like the items out of get-history
     * | 2     | Command           | A command result type like the items out of get-command
     * | 3     | ProviderItem      | A provider item
     * | 4     | ProviderContainer | A provider container
     * | 5     | Property          | A property result type like the property items out of get-member
     * | 6     | Method            | A method result type like the method items out of get-member
     * | 7     | ParameterName     | A parameter name result type like the Parameters property out of get-command items
     * | 8     | ParameterValue    | A parameter value result type
     * | 9     | Variable          | A variable result type like the items out of get-childitem variable:
     * | 10    | Namespace         | A namespace
     * | 11    | Type              | A type name
     * | 12    | Keyword           | A keyword
     * | 13    | DynamicKeyword    | A dynamic keyword
     *
     * @see https://docs.microsoft.com/en-us/dotnet/api/system.management.automation.completionresulttype?view=powershellsdk-7.0.0
     */
    const pwshTypeToIconMap = {
        0: codicons_1.Codicon.symbolText,
        1: codicons_1.Codicon.history,
        2: codicons_1.Codicon.symbolMethod,
        3: codicons_1.Codicon.symbolFile,
        4: codicons_1.Codicon.folder,
        5: codicons_1.Codicon.symbolProperty,
        6: codicons_1.Codicon.symbolMethod,
        7: codicons_1.Codicon.symbolVariable,
        8: codicons_1.Codicon.symbolValue,
        9: codicons_1.Codicon.symbolVariable,
        10: codicons_1.Codicon.symbolNamespace,
        11: codicons_1.Codicon.symbolInterface,
        12: codicons_1.Codicon.symbolKeyword,
        13: codicons_1.Codicon.symbolKeyword
    };
    let SuggestAddon = class SuggestAddon extends lifecycle_1.Disposable {
        constructor(_terminalSuggestWidgetVisibleContextKey, _instantiationService) {
            super();
            this._terminalSuggestWidgetVisibleContextKey = _terminalSuggestWidgetVisibleContextKey;
            this._instantiationService = _instantiationService;
            this._enableWidget = true;
            this._cursorIndexStart = 0;
            this._cursorIndexDelta = 0;
            this._onBell = this._register(new event_1.Emitter());
            this.onBell = this._onBell.event;
            this._onAcceptedCompletion = this._register(new event_1.Emitter());
            this.onAcceptedCompletion = this._onAcceptedCompletion.event;
            // TODO: These aren't persisted across reloads
            // TODO: Allow triggering anywhere in the first word based on the cached completions
            this._cachedBashAliases = new Set();
            this._cachedBashBuiltins = new Set();
            this._cachedBashCommands = new Set();
            this._cachedBashKeywords = new Set();
        }
        activate(xterm) {
            this._terminal = xterm;
            this._register(xterm.parser.registerOscHandler(633 /* ShellIntegrationOscPs.VSCode */, data => {
                return this._handleVSCodeSequence(data);
            }));
            this._register(xterm.onData(e => {
                this._handleTerminalInput(e);
            }));
        }
        setContainer(container) {
            this._container = container;
        }
        _handleVSCodeSequence(data) {
            if (!this._terminal) {
                return false;
            }
            // Pass the sequence along to the capability
            const [command, ...args] = data.split(';');
            switch (command) {
                case "Completions" /* VSCodeOscPt.Completions */:
                    this._handleCompletionsSequence(this._terminal, data, command, args);
                    return true;
                case "CompletionsBash" /* VSCodeOscPt.CompletionsBash */:
                    this._handleCompletionsBashSequence(this._terminal, data, command, args);
                    return true;
                case "CompletionsBashFirstWord" /* VSCodeOscPt.CompletionsBashFirstWord */:
                    return this._handleCompletionsBashFirstWordSequence(this._terminal, data, command, args);
            }
            // Unrecognized sequence
            return false;
        }
        _handleCompletionsSequence(terminal, data, command, args) {
            // Nothing to handle if the terminal is not attached
            if (!terminal.element || !this._enableWidget) {
                return;
            }
            const replacementIndex = parseInt(args[0]);
            const replacementLength = parseInt(args[1]);
            this._cursorIndexStart = parseInt(args[2]);
            if (!args[3]) {
                this._onBell.fire();
                return;
            }
            let completionList = JSON.parse(data.slice(command.length + args[0].length + args[1].length + args[2].length + 4 /*semi-colons*/));
            if (!Array.isArray(completionList)) {
                completionList = [completionList];
            }
            const completions = completionList.map((e) => {
                return new simpleCompletionItem_1.SimpleCompletionItem({
                    label: e.CompletionText,
                    icon: pwshTypeToIconMap[e.ResultType],
                    detail: e.ToolTip
                });
            });
            this._leadingLineContent = completions[0].completion.label.slice(0, replacementLength);
            this._cursorIndexDelta = 0;
            const model = new simpleCompletionModel_1.SimpleCompletionModel(completions, new simpleCompletionModel_1.LineContext(this._leadingLineContent, replacementIndex), replacementIndex, replacementLength);
            if (completions.length === 1) {
                const insertText = completions[0].completion.label.substring(replacementLength);
                if (insertText.length === 0) {
                    this._onBell.fire();
                    return;
                }
            }
            this._handleCompletionModel(model);
        }
        _handleCompletionsBashFirstWordSequence(terminal, data, command, args) {
            const type = args[0];
            const completionList = data.slice(command.length + type.length + 2 /*semi-colons*/).split(';');
            let set;
            switch (type) {
                case 'alias':
                    set = this._cachedBashAliases;
                    break;
                case 'builtin':
                    set = this._cachedBashBuiltins;
                    break;
                case 'command':
                    set = this._cachedBashCommands;
                    break;
                case 'keyword':
                    set = this._cachedBashKeywords;
                    break;
                default: return false;
            }
            set.clear();
            const distinctLabels = new Set();
            for (const label of completionList) {
                distinctLabels.add(label);
            }
            for (const label of distinctLabels) {
                set.add(new simpleCompletionItem_1.SimpleCompletionItem({
                    label,
                    icon: codicons_1.Codicon.symbolString,
                    detail: type
                }));
            }
            // Invalidate compound list cache
            this._cachedFirstWord = undefined;
            return true;
        }
        _handleCompletionsBashSequence(terminal, data, command, args) {
            // Nothing to handle if the terminal is not attached
            if (!terminal.element) {
                return;
            }
            let replacementIndex = parseInt(args[0]);
            const replacementLength = parseInt(args[1]);
            if (!args[2]) {
                this._onBell.fire();
                return;
            }
            const completionList = data.slice(command.length + args[0].length + args[1].length + args[2].length + 4 /*semi-colons*/).split(';');
            // TODO: Create a trigger suggest command which encapsulates sendSequence and uses cached if available
            let completions;
            // TODO: This 100 is a hack just for the prototype, this should get it based on some terminal input model
            if (replacementIndex !== 100 && completionList.length > 0) {
                completions = completionList.map(label => {
                    return new simpleCompletionItem_1.SimpleCompletionItem({
                        label: label,
                        icon: codicons_1.Codicon.symbolProperty
                    });
                });
            }
            else {
                replacementIndex = 0;
                if (!this._cachedFirstWord) {
                    this._cachedFirstWord = [
                        ...this._cachedBashAliases,
                        ...this._cachedBashBuiltins,
                        ...this._cachedBashCommands,
                        ...this._cachedBashKeywords
                    ];
                    this._cachedFirstWord.sort((a, b) => {
                        const aCode = a.completion.label.charCodeAt(0);
                        const bCode = b.completion.label.charCodeAt(0);
                        const isANonAlpha = aCode < 65 || aCode > 90 && aCode < 97 || aCode > 122 ? 1 : 0;
                        const isBNonAlpha = bCode < 65 || bCode > 90 && bCode < 97 || bCode > 122 ? 1 : 0;
                        if (isANonAlpha !== isBNonAlpha) {
                            return isANonAlpha - isBNonAlpha;
                        }
                        return a.completion.label.localeCompare(b.completion.label);
                    });
                }
                completions = this._cachedFirstWord;
            }
            if (completions.length === 0) {
                return;
            }
            this._leadingLineContent = completions[0].completion.label.slice(0, replacementLength);
            const model = new simpleCompletionModel_1.SimpleCompletionModel(completions, new simpleCompletionModel_1.LineContext(this._leadingLineContent, replacementIndex), replacementIndex, replacementLength);
            if (completions.length === 1) {
                const insertText = completions[0].completion.label.substring(replacementLength);
                if (insertText.length === 0) {
                    this._onBell.fire();
                    return;
                }
            }
            this._handleCompletionModel(model);
        }
        _handleCompletionModel(model) {
            if (model.items.length === 0 || !this._terminal?.element) {
                return;
            }
            if (model.items.length === 1) {
                this.acceptSelectedSuggestion({
                    item: model.items[0],
                    model: model
                });
                return;
            }
            const suggestWidget = this._ensureSuggestWidget(this._terminal);
            this._additionalInput = undefined;
            const dimensions = {
                width: this._terminal._core._renderService.dimensions.device.cell.width,
                height: this._terminal._core._renderService.dimensions.device.cell.height,
            };
            if (!dimensions.width || !dimensions.height) {
                return;
            }
            // TODO: What do frozen and auto do?
            const xtermBox = this._terminal.element.getBoundingClientRect();
            // TODO: Layer breaker, unsafe and won't work for terminal editors
            const panelElement = dom.findParentWithClass(this._container, 'panel').offsetParent;
            const panelBox = panelElement.getBoundingClientRect();
            suggestWidget.showSuggestions(model, 0, false, false, {
                left: (xtermBox.left - panelBox.left) + this._terminal.buffer.active.cursorX * dimensions.width,
                top: (xtermBox.top - panelBox.top) + this._terminal.buffer.active.cursorY * dimensions.height,
                height: dimensions.height
            });
            // Flush the input queue if any characters were typed after a trigger character
            if (this._inputQueue) {
                const inputQueue = this._inputQueue;
                this._inputQueue = undefined;
                for (const data of inputQueue) {
                    this._handleTerminalInput(data);
                }
            }
        }
        _ensureSuggestWidget(terminal) {
            this._terminalSuggestWidgetVisibleContextKey.set(true);
            if (!this._suggestWidget) {
                this._suggestWidget = this._register(this._instantiationService.createInstance(simpleSuggestWidget_1.SimpleSuggestWidget, dom.findParentWithClass(this._container, 'panel'), this._instantiationService.createInstance(PersistedWidgetSize), {}));
                this._suggestWidget.list.style((0, defaultStyles_1.getListStyles)({
                    listInactiveFocusBackground: suggestWidget_1.editorSuggestWidgetSelectedBackground,
                    listInactiveFocusOutline: colorRegistry_1.activeContrastBorder
                }));
                this._suggestWidget.onDidSelect(async (e) => this.acceptSelectedSuggestion(e));
                this._suggestWidget.onDidHide(() => this._terminalSuggestWidgetVisibleContextKey.set(false));
                this._suggestWidget.onDidShow(() => this._terminalSuggestWidgetVisibleContextKey.set(true));
            }
            return this._suggestWidget;
        }
        selectPreviousSuggestion() {
            this._suggestWidget?.selectPrevious();
        }
        selectPreviousPageSuggestion() {
            this._suggestWidget?.selectPreviousPage();
        }
        selectNextSuggestion() {
            this._suggestWidget?.selectNext();
        }
        selectNextPageSuggestion() {
            this._suggestWidget?.selectNextPage();
        }
        acceptSelectedSuggestion(suggestion) {
            if (!suggestion) {
                suggestion = this._suggestWidget?.getFocusedItem();
            }
            if (suggestion && this._leadingLineContent) {
                this._suggestWidget?.hide();
                // Send the completion
                this._onAcceptedCompletion.fire([
                    // TODO: Right arrow to end of the replacement
                    // Left arrow to end of the replacement
                    '\x1b[D'.repeat(Math.max(suggestion.model.replacementLength - this._cursorIndexStart + this._cursorIndexDelta, 0)),
                    // Delete to remove additional input
                    '\x1b[3~'.repeat(this._additionalInput?.length ?? 0),
                    // Backspace to remove the replacement
                    '\x7F'.repeat(suggestion.model.replacementLength),
                    // Write the completion
                    suggestion.item.completion.label,
                ].join(''));
                // Disable completions triggering the widget temporarily to avoid completion requests
                // caused by the completion itself to show.
                this._enableWidget = false;
                // TODO: Disable the widget in a more sophisticated way
                (0, async_1.timeout)(100).then(e => this._enableWidget = true);
            }
        }
        hideSuggestWidget() {
            this._suggestWidget?.hide();
        }
        handleNonXtermData(data) {
            this._handleTerminalInput(data);
        }
        _handleTerminalInput(data) {
            if (!this._terminal || !this._enableWidget || !this._terminalSuggestWidgetVisibleContextKey.get()) {
                // HACK: Buffer any input to be evaluated when the completions come in, this is needed
                // because conpty may "render" the completion request after input characters that
                // actually come after it. This can happen when typing quickly after a trigger
                // character, especially on a freshly launched session.
                if (data === '-') {
                    this._inputQueue = [];
                }
                else {
                    this._inputQueue?.push(data);
                }
                return;
            }
            let handled = false;
            // Backspace
            if (data === '\x7f') {
                if (this._additionalInput && this._additionalInput.length > 0 && this._cursorIndexDelta > 0) {
                    handled = true;
                    this._additionalInput = this._additionalInput.substring(0, this._cursorIndexDelta-- - 1) + this._additionalInput.substring(this._cursorIndexDelta);
                }
            }
            // Delete
            if (data === '\x1b[3~') {
                if (this._additionalInput && this._additionalInput.length > 0 && this._cursorIndexDelta < this._additionalInput.length - 1) {
                    handled = true;
                    this._additionalInput = this._additionalInput.substring(0, this._cursorIndexDelta) + this._additionalInput.substring(this._cursorIndexDelta + 1);
                }
            }
            // Left
            if (data === '\x1b[D') {
                // If left goes beyond where the completion was requested, hide
                if (this._cursorIndexDelta > 0) {
                    handled = true;
                    this._cursorIndexDelta--;
                }
            }
            // Right
            if (data === '\x1b[C') {
                handled = true;
                this._cursorIndexDelta += 1;
            }
            if (data.match(/^[a-z0-9]$/i)) {
                // TODO: There is a race here where the completions may come through after new character presses because of conpty's rendering!
                handled = true;
                if (this._additionalInput === undefined) {
                    this._additionalInput = '';
                }
                this._additionalInput += data;
                this._cursorIndexDelta++;
            }
            if (handled) {
                // typed -> moved cursor RIGHT -> update UI
                if (this._terminalSuggestWidgetVisibleContextKey.get()) {
                    this._suggestWidget?.setLineContext(new simpleCompletionModel_1.LineContext(this._leadingLineContent + (this._additionalInput ?? ''), this._additionalInput?.length ?? 0));
                }
                // Hide and clear model if there are no more items
                if (this._suggestWidget._completionModel?.items.length === 0) {
                    this._additionalInput = undefined;
                    this.hideSuggestWidget();
                    // TODO: Don't request every time; refine completions
                    // this._onAcceptedCompletion.fire('\x1b[24~e');
                    return;
                }
                // TODO: Share code
                // TODO: Expose on xterm.js
                const dimensions = {
                    width: this._terminal._core._renderService.dimensions.device.cell.width,
                    height: this._terminal._core._renderService.dimensions.device.cell.height,
                };
                if (!dimensions.width || !dimensions.height) {
                    return;
                }
                // TODO: What do frozen and auto do?
                const xtermBox = this._terminal.element.getBoundingClientRect();
                // TODO: Layer breaker, unsafe and won't work for terminal editors
                const panelElement = dom.findParentWithClass(this._container, 'panel').offsetParent;
                const panelBox = panelElement.getBoundingClientRect();
                this._suggestWidget?.showSuggestions(this._suggestWidget._completionModel, 0, false, false, {
                    left: (xtermBox.left - panelBox.left) + this._terminal.buffer.active.cursorX * dimensions.width,
                    top: (xtermBox.top - panelBox.top) + this._terminal.buffer.active.cursorY * dimensions.height,
                    height: dimensions.height
                });
            }
            else {
                this._additionalInput = undefined;
                this.hideSuggestWidget();
                // TODO: Don't request every time; refine completions
                // this._onAcceptedCompletion.fire('\x1b[24~e');
            }
        }
    };
    exports.SuggestAddon = SuggestAddon;
    exports.SuggestAddon = SuggestAddon = __decorate([
        __param(1, instantiation_1.IInstantiationService)
    ], SuggestAddon);
    let PersistedWidgetSize = class PersistedWidgetSize {
        constructor(_storageService) {
            this._storageService = _storageService;
            this._key = "terminal.integrated.suggestSize" /* TerminalStorageKeys.TerminalSuggestSize */;
        }
        restore() {
            const raw = this._storageService.get(this._key, 0 /* StorageScope.PROFILE */) ?? '';
            try {
                const obj = JSON.parse(raw);
                if (dom.Dimension.is(obj)) {
                    return dom.Dimension.lift(obj);
                }
            }
            catch {
                // ignore
            }
            return undefined;
        }
        store(size) {
            this._storageService.store(this._key, JSON.stringify(size), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
        }
        reset() {
            this._storageService.remove(this._key, 0 /* StorageScope.PROFILE */);
        }
    };
    PersistedWidgetSize = __decorate([
        __param(0, storage_1.IStorageService)
    ], PersistedWidgetSize);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VnZ2VzdEFkZG9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWwvYnJvd3Nlci94dGVybS9zdWdnZXN0QWRkb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBcUJoRyxJQUFXLHFCQUdWO0lBSEQsV0FBVyxxQkFBcUI7UUFDL0IsNEJBQTRCO1FBQzVCLHVFQUFZLENBQUE7SUFDYixDQUFDLEVBSFUscUJBQXFCLEtBQXJCLHFCQUFxQixRQUcvQjtJQUVELElBQVcsV0FJVjtJQUpELFdBQVcsV0FBVztRQUNyQiwwQ0FBMkIsQ0FBQTtRQUMzQixrREFBbUMsQ0FBQTtRQUNuQyxvRUFBcUQsQ0FBQTtJQUN0RCxDQUFDLEVBSlUsV0FBVyxLQUFYLFdBQVcsUUFJckI7SUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BcUJHO0lBQ0gsTUFBTSxpQkFBaUIsR0FBOEM7UUFDcEUsQ0FBQyxFQUFFLGtCQUFPLENBQUMsVUFBVTtRQUNyQixDQUFDLEVBQUUsa0JBQU8sQ0FBQyxPQUFPO1FBQ2xCLENBQUMsRUFBRSxrQkFBTyxDQUFDLFlBQVk7UUFDdkIsQ0FBQyxFQUFFLGtCQUFPLENBQUMsVUFBVTtRQUNyQixDQUFDLEVBQUUsa0JBQU8sQ0FBQyxNQUFNO1FBQ2pCLENBQUMsRUFBRSxrQkFBTyxDQUFDLGNBQWM7UUFDekIsQ0FBQyxFQUFFLGtCQUFPLENBQUMsWUFBWTtRQUN2QixDQUFDLEVBQUUsa0JBQU8sQ0FBQyxjQUFjO1FBQ3pCLENBQUMsRUFBRSxrQkFBTyxDQUFDLFdBQVc7UUFDdEIsQ0FBQyxFQUFFLGtCQUFPLENBQUMsY0FBYztRQUN6QixFQUFFLEVBQUUsa0JBQU8sQ0FBQyxlQUFlO1FBQzNCLEVBQUUsRUFBRSxrQkFBTyxDQUFDLGVBQWU7UUFDM0IsRUFBRSxFQUFFLGtCQUFPLENBQUMs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