/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/findinput/findInputToggles", "vs/base/browser/ui/widget", "vs/base/common/async", "vs/editor/contrib/find/browser/findModel", "vs/platform/theme/common/colorRegistry", "vs/css!./findOptionsWidget"], function (require, exports, dom, findInputToggles_1, widget_1, async_1, findModel_1, colorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FindOptionsWidget = void 0;
    class FindOptionsWidget extends widget_1.Widget {
        static { this.ID = 'editor.contrib.findOptionsWidget'; }
        constructor(editor, state, keybindingService) {
            super();
            this._hideSoon = this._register(new async_1.RunOnceScheduler(() => this._hide(), 2000));
            this._isVisible = false;
            this._editor = editor;
            this._state = state;
            this._keybindingService = keybindingService;
            this._domNode = document.createElement('div');
            this._domNode.className = 'findOptionsWidget';
            this._domNode.style.display = 'none';
            this._domNode.style.top = '10px';
            this._domNode.style.zIndex = '12';
            this._domNode.setAttribute('role', 'presentation');
            this._domNode.setAttribute('aria-hidden', 'true');
            const toggleStyles = {
                inputActiveOptionBorder: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.inputActiveOptionBorder),
                inputActiveOptionForeground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.inputActiveOptionForeground),
                inputActiveOptionBackground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.inputActiveOptionBackground),
            };
            this.caseSensitive = this._register(new findInputToggles_1.CaseSensitiveToggle({
                appendTitle: this._keybindingLabelFor(findModel_1.FIND_IDS.ToggleCaseSensitiveCommand),
                isChecked: this._state.matchCase,
                ...toggleStyles
            }));
            this._domNode.appendChild(this.caseSensitive.domNode);
            this._register(this.caseSensitive.onChange(() => {
                this._state.change({
                    matchCase: this.caseSensitive.checked
                }, false);
            }));
            this.wholeWords = this._register(new findInputToggles_1.WholeWordsToggle({
                appendTitle: this._keybindingLabelFor(findModel_1.FIND_IDS.ToggleWholeWordCommand),
                isChecked: this._state.wholeWord,
                ...toggleStyles
            }));
            this._domNode.appendChild(this.wholeWords.domNode);
            this._register(this.wholeWords.onChange(() => {
                this._state.change({
                    wholeWord: this.wholeWords.checked
                }, false);
            }));
            this.regex = this._register(new findInputToggles_1.RegexToggle({
                appendTitle: this._keybindingLabelFor(findModel_1.FIND_IDS.ToggleRegexCommand),
                isChecked: this._state.isRegex,
                ...toggleStyles
            }));
            this._domNode.appendChild(this.regex.domNode);
            this._register(this.regex.onChange(() => {
                this._state.change({
                    isRegex: this.regex.checked
                }, false);
            }));
            this._editor.addOverlayWidget(this);
            this._register(this._state.onFindReplaceStateChange((e) => {
                let somethingChanged = false;
                if (e.isRegex) {
                    this.regex.checked = this._state.isRegex;
                    somethingChanged = true;
                }
                if (e.wholeWord) {
                    this.wholeWords.checked = this._state.wholeWord;
                    somethingChanged = true;
                }
                if (e.matchCase) {
                    this.caseSensitive.checked = this._state.matchCase;
                    somethingChanged = true;
                }
                if (!this._state.isRevealed && somethingChanged) {
                    this._revealTemporarily();
                }
            }));
            this._register(dom.addDisposableListener(this._domNode, dom.EventType.MOUSE_LEAVE, (e) => this._onMouseLeave()));
            this._register(dom.addDisposableListener(this._domNode, 'mouseover', (e) => this._onMouseOver()));
        }
        _keybindingLabelFor(actionId) {
            const kb = this._keybindingService.lookupKeybinding(actionId);
            if (!kb) {
                return '';
            }
            return ` (${kb.getLabel()})`;
        }
        dispose() {
            this._editor.removeOverlayWidget(this);
            super.dispose();
        }
        // ----- IOverlayWidget API
        getId() {
            return FindOptionsWidget.ID;
        }
        getDomNode() {
            return this._domNode;
        }
        getPosition() {
            return {
                preference: 0 /* OverlayWidgetPositionPreference.TOP_RIGHT_CORNER */
            };
        }
        highlightFindOptions() {
            this._revealTemporarily();
        }
        _revealTemporarily() {
            this._show();
            this._hideSoon.schedule();
        }
        _onMouseLeave() {
            this._hideSoon.schedule();
        }
        _onMouseOver() {
            this._hideSoon.cancel();
        }
        _show() {
            if (this._isVisible) {
                return;
            }
            this._isVisible = true;
            this._domNode.style.display = 'block';
        }
        _hide() {
            if (!this._isVisible) {
                return;
            }
            this._isVisible = false;
            this._domNode.style.display = 'none';
        }
    }
    exports.FindOptionsWidget = FindOptionsWidget;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZE9wdGlvbnNXaWRnZXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9maW5kL2Jyb3dzZXIvZmluZE9wdGlvbnNXaWRnZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBYWhHLE1BQWEsaUJBQWtCLFNBQVEsZUFBTTtpQkFFcEIsT0FBRSxHQUFHLGtDQUFrQyxBQUFyQyxDQUFzQztRQVdoRSxZQUNDLE1BQW1CLEVBQ25CLEtBQXVCLEVBQ3ZCLGlCQUFxQztZQUVyQyxLQUFLLEVBQUUsQ0FBQztZQWtIRCxjQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLHdCQUFnQixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBZTNFLGVBQVUsR0FBWSxLQUFLLENBQUM7WUEvSG5DLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1lBQ3BCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxpQkFBaUIsQ0FBQztZQUU1QyxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDOUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEdBQUcsbUJBQW1CLENBQUM7WUFDOUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztZQUNyQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDO1lBQ2pDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7WUFDbEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLGNB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