/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/findinput/findInputToggles", "vs/base/browser/ui/widget", "vs/base/common/async", "vs/editor/contrib/find/browser/findModel", "vs/platform/theme/common/colorRegistry", "vs/css!./findOptionsWidget"], function (require, exports, dom, findInputToggles_1, widget_1, async_1, findModel_1, colorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$K7 = void 0;
    class $K7 extends widget_1.$IP {
        static { this.a = 'editor.contrib.findOptionsWidget'; }
        constructor(editor, state, keybindingService) {
            super();
            this.w = this.B(new async_1.$Sg(() => this.O(), 2000));
            this.M = false;
            this.b = editor;
            this.c = state;
            this.g = keybindingService;
            this.h = document.createElement('div');
            this.h.className = 'findOptionsWidget';
            this.h.style.display = 'none';
            this.h.style.top = '10px';
            this.h.style.zIndex = '12';
            this.h.setAttribute('role', 'presentation');
            this.h.setAttribute('aria-hidden', 'true');
            const toggleStyles = {
                inputActiveOptionBorder: (0, colorRegistry_1.$pv)(colorRegistry_1.$Pv),
                inputActiveOptionForeground: (0, colorRegistry_1.$pv)(colorRegistry_1.$Sv),
                inputActiveOptionBackground: (0, colorRegistry_1.$pv)(colorRegistry_1.$Rv),
            };
            this.s = this.B(new findInputToggles_1.$ER({
                appendTitle: this.t(findModel_1.$H7.ToggleCaseSensitiveCommand),
                isChecked: this.c.matchCase,
                ...toggleStyles
            }));
            this.h.appendChild(this.s.domNode);
            this.B(this.s.onChange(() => {
                this.c.change({
                    matchCase: this.s.checked
                }, false);
            }));
            this.r = this.B(new findInputToggles_1.$FR({
                appendTitle: this.t(findModel_1.$H7.ToggleWholeWordCommand),
                isChecked: this.c.wholeWord,
                ...toggleStyles
            }));
            this.h.appendChild(this.r.domNode);
            this.B(this.r.onChange(() => {
                this.c.change({
                    wholeWord: this.r.checked
                }, false);
            }));
            this.n = this.B(new findInputToggles_1.$GR({
                appendTitle: this.t(findModel_1.$H7.ToggleRegexCommand),
                isChecked: this.c.isRegex,
                ...toggleStyles
            }));
            this.h.appendChild(this.n.domNode);
            this.B(this.n.onChange(() => {
                this.c.change({
                    isRegex: this.n.checked
                }, false);
            }));
            this.b.addOverlayWidget(this);
            this.B(this.c.onFindReplaceStateChange((e) => {
                let somethingChanged = false;
                if (e.isRegex) {
                    this.n.checked = this.c.isRegex;
                    somethingChanged = true;
                }
                if (e.wholeWord) {
                    this.r.checked = this.c.wholeWord;
                    somethingChanged = true;
                }
                if (e.matchCase) {
                    this.s.checked = this.c.matchCase;
                    somethingChanged = true;
                }
                if (!this.c.isRevealed && somethingChanged) {
                    this.y();
                }
            }));
            this.B(dom.$nO(this.h, dom.$3O.MOUSE_LEAVE, (e) => this.J()));
            this.B(dom.$nO(this.h, 'mouseover', (e) => this.L()));
        }
        t(actionId) {
            const kb = this.g.lookupKeybinding(actionId);
            if (!kb) {
                return '';
            }
            return ` (${kb.getLabel()})`;
        }
        dispose() {
            this.b.removeOverlayWidget(this);
            super.dispose();
        }
        // ----- IOverlayWidget API
        getId() {
            return $K7.a;
        }
        getDomNode() {
            return this.h;
        }
        getPosition() {
            return {
                preference: 0 /* OverlayWidgetPositionPreference.TOP_RIGHT_CORNER */
            };
        }
        highlightFindOptions() {
            this.y();
        }
        y() {
            this.N();
            this.w.schedule();
        }
        J() {
            this.w.schedule();
        }
        L() {
            this.w.cancel();
        }
        N() {
            if (this.M) {
                return;
            }
            this.M = true;
            this.h.style.display = 'block';
        }
        O() {
            if (!this.M) {
                return;
            }
            this.M = false;
            this.h.style.display = 'none';
        }
    }
    exports.$K7 = $K7;
});
//# sourceMappingURL=findOptionsWidget.js.map