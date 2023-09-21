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
    exports.$Jib = void 0;
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
        0: codicons_1.$Pj.symbolText,
        1: codicons_1.$Pj.history,
        2: codicons_1.$Pj.symbolMethod,
        3: codicons_1.$Pj.symbolFile,
        4: codicons_1.$Pj.folder,
        5: codicons_1.$Pj.symbolProperty,
        6: codicons_1.$Pj.symbolMethod,
        7: codicons_1.$Pj.symbolVariable,
        8: codicons_1.$Pj.symbolValue,
        9: codicons_1.$Pj.symbolVariable,
        10: codicons_1.$Pj.symbolNamespace,
        11: codicons_1.$Pj.symbolInterface,
        12: codicons_1.$Pj.symbolKeyword,
        13: codicons_1.$Pj.symbolKeyword
    };
    let $Jib = class $Jib extends lifecycle_1.$kc {
        constructor(w, y) {
            super();
            this.w = w;
            this.y = y;
            this.h = true;
            this.n = 0;
            this.r = 0;
            this.t = this.B(new event_1.$fd());
            this.onBell = this.t.event;
            this.u = this.B(new event_1.$fd());
            this.onAcceptedCompletion = this.u.event;
            // TODO: These aren't persisted across reloads
            // TODO: Allow triggering anywhere in the first word based on the cached completions
            this.D = new Set();
            this.F = new Set();
            this.G = new Set();
            this.H = new Set();
        }
        activate(xterm) {
            this.c = xterm;
            this.B(xterm.parser.registerOscHandler(633 /* ShellIntegrationOscPs.VSCode */, data => {
                return this.z(data);
            }));
            this.B(xterm.onData(e => {
                this.O(e);
            }));
        }
        setContainer(container) {
            this.f = container;
        }
        z(data) {
            if (!this.c) {
                return false;
            }
            // Pass the sequence along to the capability
            const [command, ...args] = data.split(';');
            switch (command) {
                case "Completions" /* VSCodeOscPt.Completions */:
                    this.C(this.c, data, command, args);
                    return true;
                case "CompletionsBash" /* VSCodeOscPt.CompletionsBash */:
                    this.L(this.c, data, command, args);
                    return true;
                case "CompletionsBashFirstWord" /* VSCodeOscPt.CompletionsBashFirstWord */:
                    return this.J(this.c, data, command, args);
            }
            // Unrecognized sequence
            return false;
        }
        C(terminal, data, command, args) {
            // Nothing to handle if the terminal is not attached
            if (!terminal.element || !this.h) {
                return;
            }
            const replacementIndex = parseInt(args[0]);
            const replacementLength = parseInt(args[1]);
            this.n = parseInt(args[2]);
            if (!args[3]) {
                this.t.fire();
                return;
            }
            let completionList = JSON.parse(data.slice(command.length + args[0].length + args[1].length + args[2].length + 4 /*semi-colons*/));
            if (!Array.isArray(completionList)) {
                completionList = [completionList];
            }
            const completions = completionList.map((e) => {
                return new simpleCompletionItem_1.$Dib({
                    label: e.CompletionText,
                    icon: pwshTypeToIconMap[e.ResultType],
                    detail: e.ToolTip
                });
            });
            this.j = completions[0].completion.label.slice(0, replacementLength);
            this.r = 0;
            const model = new simpleCompletionModel_1.$Fib(completions, new simpleCompletionModel_1.$Eib(this.j, replacementIndex), replacementIndex, replacementLength);
            if (completions.length === 1) {
                const insertText = completions[0].completion.label.substring(replacementLength);
                if (insertText.length === 0) {
                    this.t.fire();
                    return;
                }
            }
            this.M(model);
        }
        J(terminal, data, command, args) {
            const type = args[0];
            const completionList = data.slice(command.length + type.length + 2 /*semi-colons*/).split(';');
            let set;
            switch (type) {
                case 'alias':
                    set = this.D;
                    break;
                case 'builtin':
                    set = this.F;
                    break;
                case 'command':
                    set = this.G;
                    break;
                case 'keyword':
                    set = this.H;
                    break;
                default: return false;
            }
            set.clear();
            const distinctLabels = new Set();
            for (const label of completionList) {
                distinctLabels.add(label);
            }
            for (const label of distinctLabels) {
                set.add(new simpleCompletionItem_1.$Dib({
                    label,
                    icon: codicons_1.$Pj.symbolString,
                    detail: type
                }));
            }
            // Invalidate compound list cache
            this.I = undefined;
            return true;
        }
        L(terminal, data, command, args) {
            // Nothing to handle if the terminal is not attached
            if (!terminal.element) {
                return;
            }
            let replacementIndex = parseInt(args[0]);
            const replacementLength = parseInt(args[1]);
            if (!args[2]) {
                this.t.fire();
                return;
            }
            const completionList = data.slice(command.length + args[0].length + args[1].length + args[2].length + 4 /*semi-colons*/).split(';');
            // TODO: Create a trigger suggest command which encapsulates sendSequence and uses cached if available
            let completions;
            // TODO: This 100 is a hack just for the prototype, this should get it based on some terminal input model
            if (replacementIndex !== 100 && completionList.length > 0) {
                completions = completionList.map(label => {
                    return new simpleCompletionItem_1.$Dib({
                        label: label,
                        icon: codicons_1.$Pj.symbolProperty
                    });
                });
            }
            else {
                replacementIndex = 0;
                if (!this.I) {
                    this.I = [
                        ...this.D,
                        ...this.F,
                        ...this.G,
                        ...this.H
                    ];
                    this.I.sort((a, b) => {
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
                completions = this.I;
            }
            if (completions.length === 0) {
                return;
            }
            this.j = completions[0].completion.label.slice(0, replacementLength);
            const model = new simpleCompletionModel_1.$Fib(completions, new simpleCompletionModel_1.$Eib(this.j, replacementIndex), replacementIndex, replacementLength);
            if (completions.length === 1) {
                const insertText = completions[0].completion.label.substring(replacementLength);
                if (insertText.length === 0) {
                    this.t.fire();
                    return;
                }
            }
            this.M(model);
        }
        M(model) {
            if (model.items.length === 0 || !this.c?.element) {
                return;
            }
            if (model.items.length === 1) {
                this.acceptSelectedSuggestion({
                    item: model.items[0],
                    model: model
                });
                return;
            }
            const suggestWidget = this.N(this.c);
            this.m = undefined;
            const dimensions = {
                width: this.c._core._renderService.dimensions.device.cell.width,
                height: this.c._core._renderService.dimensions.device.cell.height,
            };
            if (!dimensions.width || !dimensions.height) {
                return;
            }
            // TODO: What do frozen and auto do?
            const xtermBox = this.c.element.getBoundingClientRect();
            // TODO: Layer breaker, unsafe and won't work for terminal editors
            const panelElement = dom.$QO(this.f, 'panel').offsetParent;
            const panelBox = panelElement.getBoundingClientRect();
            suggestWidget.showSuggestions(model, 0, false, false, {
                left: (xtermBox.left - panelBox.left) + this.c.buffer.active.cursorX * dimensions.width,
                top: (xtermBox.top - panelBox.top) + this.c.buffer.active.cursorY * dimensions.height,
                height: dimensions.height
            });
            // Flush the input queue if any characters were typed after a trigger character
            if (this.s) {
                const inputQueue = this.s;
                this.s = undefined;
                for (const data of inputQueue) {
                    this.O(data);
                }
            }
        }
        N(terminal) {
            this.w.set(true);
            if (!this.g) {
                this.g = this.B(this.y.createInstance(simpleSuggestWidget_1.$Iib, dom.$QO(this.f, 'panel'), this.y.createInstance(PersistedWidgetSize), {}));
                this.g.list.style((0, defaultStyles_1.$A2)({
                    listInactiveFocusBackground: suggestWidget_1.$B6,
                    listInactiveFocusOutline: colorRegistry_1.$Bv
                }));
                this.g.onDidSelect(async (e) => this.acceptSelectedSuggestion(e));
                this.g.onDidHide(() => this.w.set(false));
                this.g.onDidShow(() => this.w.set(true));
            }
            return this.g;
        }
        selectPreviousSuggestion() {
            this.g?.selectPrevious();
        }
        selectPreviousPageSuggestion() {
            this.g?.selectPreviousPage();
        }
        selectNextSuggestion() {
            this.g?.selectNext();
        }
        selectNextPageSuggestion() {
            this.g?.selectNextPage();
        }
        acceptSelectedSuggestion(suggestion) {
            if (!suggestion) {
                suggestion = this.g?.getFocusedItem();
            }
            if (suggestion && this.j) {
                this.g?.hide();
                // Send the completion
                this.u.fire([
                    // TODO: Right arrow to end of the replacement
                    // Left arrow to end of the replacement
                    '\x1b[D'.repeat(Math.max(suggestion.model.replacementLength - this.n + this.r, 0)),
                    // Delete to remove additional input
                    '\x1b[3~'.repeat(this.m?.length ?? 0),
                    // Backspace to remove the replacement
                    '\x7F'.repeat(suggestion.model.replacementLength),
                    // Write the completion
                    suggestion.item.completion.label,
                ].join(''));
                // Disable completions triggering the widget temporarily to avoid completion requests
                // caused by the completion itself to show.
                this.h = false;
                // TODO: Disable the widget in a more sophisticated way
                (0, async_1.$Hg)(100).then(e => this.h = true);
            }
        }
        hideSuggestWidget() {
            this.g?.hide();
        }
        handleNonXtermData(data) {
            this.O(data);
        }
        O(data) {
            if (!this.c || !this.h || !this.w.get()) {
                // HACK: Buffer any input to be evaluated when the completions come in, this is needed
                // because conpty may "render" the completion request after input characters that
                // actually come after it. This can happen when typing quickly after a trigger
                // character, especially on a freshly launched session.
                if (data === '-') {
                    this.s = [];
                }
                else {
                    this.s?.push(data);
                }
                return;
            }
            let handled = false;
            // Backspace
            if (data === '\x7f') {
                if (this.m && this.m.length > 0 && this.r > 0) {
                    handled = true;
                    this.m = this.m.substring(0, this.r-- - 1) + this.m.substring(this.r);
                }
            }
            // Delete
            if (data === '\x1b[3~') {
                if (this.m && this.m.length > 0 && this.r < this.m.length - 1) {
                    handled = true;
                    this.m = this.m.substring(0, this.r) + this.m.substring(this.r + 1);
                }
            }
            // Left
            if (data === '\x1b[D') {
                // If left goes beyond where the completion was requested, hide
                if (this.r > 0) {
                    handled = true;
                    this.r--;
                }
            }
            // Right
            if (data === '\x1b[C') {
                handled = true;
                this.r += 1;
            }
            if (data.match(/^[a-z0-9]$/i)) {
                // TODO: There is a race here where the completions may come through after new character presses because of conpty's rendering!
                handled = true;
                if (this.m === undefined) {
                    this.m = '';
                }
                this.m += data;
                this.r++;
            }
            if (handled) {
                // typed -> moved cursor RIGHT -> update UI
                if (this.w.get()) {
                    this.g?.setLineContext(new simpleCompletionModel_1.$Eib(this.j + (this.m ?? ''), this.m?.length ?? 0));
                }
                // Hide and clear model if there are no more items
                if (this.g._completionModel?.items.length === 0) {
                    this.m = undefined;
                    this.hideSuggestWidget();
                    // TODO: Don't request every time; refine completions
                    // this._onAcceptedCompletion.fire('\x1b[24~e');
                    return;
                }
                // TODO: Share code
                // TODO: Expose on xterm.js
                const dimensions = {
                    width: this.c._core._renderService.dimensions.device.cell.width,
                    height: this.c._core._renderService.dimensions.device.cell.height,
                };
                if (!dimensions.width || !dimensions.height) {
                    return;
                }
                // TODO: What do frozen and auto do?
                const xtermBox = this.c.element.getBoundingClientRect();
                // TODO: Layer breaker, unsafe and won't work for terminal editors
                const panelElement = dom.$QO(this.f, 'panel').offsetParent;
                const panelBox = panelElement.getBoundingClientRect();
                this.g?.showSuggestions(this.g._completionModel, 0, false, false, {
                    left: (xtermBox.left - panelBox.left) + this.c.buffer.active.cursorX * dimensions.width,
                    top: (xtermBox.top - panelBox.top) + this.c.buffer.active.cursorY * dimensions.height,
                    height: dimensions.height
                });
            }
            else {
                this.m = undefined;
                this.hideSuggestWidget();
                // TODO: Don't request every time; refine completions
                // this._onAcceptedCompletion.fire('\x1b[24~e');
            }
        }
    };
    exports.$Jib = $Jib;
    exports.$Jib = $Jib = __decorate([
        __param(1, instantiation_1.$Ah)
    ], $Jib);
    let PersistedWidgetSize = class PersistedWidgetSize {
        constructor(d) {
            this.d = d;
            this.c = "terminal.integrated.suggestSize" /* TerminalStorageKeys.TerminalSuggestSize */;
        }
        restore() {
            const raw = this.d.get(this.c, 0 /* StorageScope.PROFILE */) ?? '';
            try {
                const obj = JSON.parse(raw);
                if (dom.$BO.is(obj)) {
                    return dom.$BO.lift(obj);
                }
            }
            catch {
                // ignore
            }
            return undefined;
        }
        store(size) {
            this.d.store(this.c, JSON.stringify(size), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
        }
        reset() {
            this.d.remove(this.c, 0 /* StorageScope.PROFILE */);
        }
    };
    PersistedWidgetSize = __decorate([
        __param(0, storage_1.$Vo)
    ], PersistedWidgetSize);
});
//# sourceMappingURL=suggestAddon.js.map