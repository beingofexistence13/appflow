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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/browser/dom", "vs/base/common/async", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkHelpers", "vs/base/common/platform", "vs/base/common/event", "vs/platform/configuration/common/configuration"], function (require, exports, lifecycle_1, dom, async_1, terminalLinkHelpers_1, platform_1, event_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalLink = void 0;
    let TerminalLink = class TerminalLink extends lifecycle_1.DisposableStore {
        get onInvalidated() { return this._onInvalidated.event; }
        get type() { return this._type; }
        constructor(_xterm, range, text, actions, _viewportY, _activateCallback, _tooltipCallback, _isHighConfidenceLink, label, _type, _configurationService) {
            super();
            this._xterm = _xterm;
            this.range = range;
            this.text = text;
            this.actions = actions;
            this._viewportY = _viewportY;
            this._activateCallback = _activateCallback;
            this._tooltipCallback = _tooltipCallback;
            this._isHighConfidenceLink = _isHighConfidenceLink;
            this.label = label;
            this._type = _type;
            this._configurationService = _configurationService;
            this._onInvalidated = new event_1.Emitter();
            this.decorations = {
                pointerCursor: false,
                underline: this._isHighConfidenceLink
            };
        }
        dispose() {
            super.dispose();
            this._hoverListeners?.dispose();
            this._hoverListeners = undefined;
            this._tooltipScheduler?.dispose();
            this._tooltipScheduler = undefined;
        }
        activate(event, text) {
            // Trigger the xterm.js callback synchronously but track the promise resolution so we can
            // use it in tests
            this.asyncActivate = this._activateCallback(event, text);
        }
        hover(event, text) {
            // Listen for modifier before handing it off to the hover to handle so it gets disposed correctly
            this._hoverListeners = new lifecycle_1.DisposableStore();
            this._hoverListeners.add(dom.addDisposableListener(document, 'keydown', e => {
                if (!e.repeat && this._isModifierDown(e)) {
                    this._enableDecorations();
                }
            }));
            this._hoverListeners.add(dom.addDisposableListener(document, 'keyup', e => {
                if (!e.repeat && !this._isModifierDown(e)) {
                    this._disableDecorations();
                }
            }));
            // Listen for when the terminal renders on the same line as the link
            this._hoverListeners.add(this._xterm.onRender(e => {
                const viewportRangeY = this.range.start.y - this._viewportY;
                if (viewportRangeY >= e.start && viewportRangeY <= e.end) {
                    this._onInvalidated.fire();
                }
            }));
            // Only show the tooltip and highlight for high confidence links (not word/search workspace
            // links). Feedback was that this makes using the terminal overly noisy.
            if (this._isHighConfidenceLink) {
                this._tooltipScheduler = new async_1.RunOnceScheduler(() => {
                    this._tooltipCallback(this, (0, terminalLinkHelpers_1.convertBufferRangeToViewport)(this.range, this._viewportY), this._isHighConfidenceLink ? () => this._enableDecorations() : undefined, this._isHighConfidenceLink ? () => this._disableDecorations() : undefined);
                    // Clear out scheduler until next hover event
                    this._tooltipScheduler?.dispose();
                    this._tooltipScheduler = undefined;
                }, this._configurationService.getValue('workbench.hover.delay'));
                this.add(this._tooltipScheduler);
                this._tooltipScheduler.schedule();
            }
            const origin = { x: event.pageX, y: event.pageY };
            this._hoverListeners.add(dom.addDisposableListener(document, dom.EventType.MOUSE_MOVE, e => {
                // Update decorations
                if (this._isModifierDown(e)) {
                    this._enableDecorations();
                }
                else {
                    this._disableDecorations();
                }
                // Reset the scheduler if the mouse moves too much
                if (Math.abs(e.pageX - origin.x) > window.devicePixelRatio * 2 || Math.abs(e.pageY - origin.y) > window.devicePixelRatio * 2) {
                    origin.x = e.pageX;
                    origin.y = e.pageY;
                    this._tooltipScheduler?.schedule();
                }
            }));
        }
        leave() {
            this._hoverListeners?.dispose();
            this._hoverListeners = undefined;
            this._tooltipScheduler?.dispose();
            this._tooltipScheduler = undefined;
        }
        _enableDecorations() {
            if (!this.decorations.pointerCursor) {
                this.decorations.pointerCursor = true;
            }
            if (!this.decorations.underline) {
                this.decorations.underline = true;
            }
        }
        _disableDecorations() {
            if (this.decorations.pointerCursor) {
                this.decorations.pointerCursor = false;
            }
            if (this.decorations.underline !== this._isHighConfidenceLink) {
                this.decorations.underline = this._isHighConfidenceLink;
            }
        }
        _isModifierDown(event) {
            const multiCursorModifier = this._configurationService.getValue('editor.multiCursorModifier');
            if (multiCursorModifier === 'ctrlCmd') {
                return !!event.altKey;
            }
            return platform_1.isMacintosh ? event.metaKey : event.ctrlKey;
        }
    };
    exports.TerminalLink = TerminalLink;
    exports.TerminalLink = TerminalLink = __decorate([
        __param(10, configuration_1.IConfigurationService)
    ], TerminalLink);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxMaW5rLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWxDb250cmliL2xpbmtzL2Jyb3dzZXIvdGVybWluYWxMaW5rLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWF6RixJQUFNLFlBQVksR0FBbEIsTUFBTSxZQUFhLFNBQVEsMkJBQWU7UUFRaEQsSUFBSSxhQUFhLEtBQWtCLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBRXRFLElBQUksSUFBSSxLQUF1QixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBRW5ELFlBQ2tCLE1BQWdCLEVBQ3hCLEtBQW1CLEVBQ25CLElBQVksRUFDWixPQUFtQyxFQUMzQixVQUFrQixFQUNsQixpQkFBZ0YsRUFDaEYsZ0JBQWlKLEVBQ2pKLHFCQUE4QixFQUN0QyxLQUF5QixFQUNqQixLQUF1QixFQUNqQixxQkFBNkQ7WUFFcEYsS0FBSyxFQUFFLENBQUM7WUFaUyxXQUFNLEdBQU4sTUFBTSxDQUFVO1lBQ3hCLFVBQUssR0FBTCxLQUFLLENBQWM7WUFDbkIsU0FBSSxHQUFKLElBQUksQ0FBUTtZQUNaLFlBQU8sR0FBUCxPQUFPLENBQTRCO1lBQzNCLGVBQVUsR0FBVixVQUFVLENBQVE7WUFDbEIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUErRDtZQUNoRixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWlJO1lBQ2pKLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBUztZQUN0QyxVQUFLLEdBQUwsS0FBSyxDQUFvQjtZQUNqQixVQUFLLEdBQUwsS0FBSyxDQUFrQjtZQUNBLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFoQnBFLG1CQUFjLEdBQUcsSUFBSSxlQUFPLEVBQVEsQ0FBQztZQW1CckQsSUFB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