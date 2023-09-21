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
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/common/core/position", "vs/nls!vs/editor/contrib/rename/browser/renameInputField", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybinding", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/css!./renameInputField"], function (require, exports, lifecycle_1, position_1, nls_1, contextkey_1, keybinding_1, colorRegistry_1, themeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$q0 = exports.$p0 = void 0;
    exports.$p0 = new contextkey_1.$2i('renameInputVisible', false, (0, nls_1.localize)(0, null));
    let $q0 = class $q0 {
        constructor(i, j, k, l, contextKeyService) {
            this.i = i;
            this.j = j;
            this.k = k;
            this.l = l;
            this.h = new lifecycle_1.$jc();
            this.allowEditorOverflow = true;
            this.g = exports.$p0.bindTo(contextKeyService);
            this.i.addContentWidget(this);
            this.h.add(this.i.onDidChangeConfiguration(e => {
                if (e.hasChanged(50 /* EditorOption.fontInfo */)) {
                    this.n();
                }
            }));
            this.h.add(k.onDidColorThemeChange(this.m, this));
        }
        dispose() {
            this.h.dispose();
            this.i.removeContentWidget(this);
        }
        getId() {
            return '__renameInputWidget';
        }
        getDomNode() {
            if (!this.b) {
                this.b = document.createElement('div');
                this.b.className = 'monaco-editor rename-box';
                this.c = document.createElement('input');
                this.c.className = 'rename-input';
                this.c.type = 'text';
                this.c.setAttribute('aria-label', (0, nls_1.localize)(1, null));
                this.b.appendChild(this.c);
                this.d = document.createElement('div');
                this.d.className = 'rename-label';
                this.b.appendChild(this.d);
                this.n();
                this.m(this.k.getColorTheme());
            }
            return this.b;
        }
        m(theme) {
            if (!this.c || !this.b) {
                return;
            }
            const widgetShadowColor = theme.getColor(colorRegistry_1.$Kv);
            const widgetBorderColor = theme.getColor(colorRegistry_1.$Lv);
            this.b.style.backgroundColor = String(theme.getColor(colorRegistry_1.$Aw) ?? '');
            this.b.style.boxShadow = widgetShadowColor ? ` 0 0 8px 2px ${widgetShadowColor}` : '';
            this.b.style.border = widgetBorderColor ? `1px solid ${widgetBorderColor}` : '';
            this.b.style.color = String(theme.getColor(colorRegistry_1.$Nv) ?? '');
            this.c.style.backgroundColor = String(theme.getColor(colorRegistry_1.$Mv) ?? '');
            // this._input.style.color = String(theme.getColor(inputForeground) ?? '');
            const border = theme.getColor(colorRegistry_1.$Ov);
            this.c.style.borderWidth = border ? '1px' : '0px';
            this.c.style.borderStyle = border ? 'solid' : 'none';
            this.c.style.borderColor = border?.toString() ?? 'none';
        }
        n() {
            if (!this.c || !this.d) {
                return;
            }
            const fontInfo = this.i.getOption(50 /* EditorOption.fontInfo */);
            this.c.style.fontFamily = fontInfo.fontFamily;
            this.c.style.fontWeight = fontInfo.fontWeight;
            this.c.style.fontSize = `${fontInfo.fontSize}px`;
            this.d.style.fontSize = `${fontInfo.fontSize * 0.8}px`;
        }
        getPosition() {
            if (!this.f) {
                return null;
            }
            return {
                position: this.a,
                preference: [2 /* ContentWidgetPositionPreference.BELOW */, 1 /* ContentWidgetPositionPreference.ABOVE */]
            };
        }
        beforeRender() {
            const [accept, preview] = this.j;
            this.d.innerText = (0, nls_1.localize)(2, null, this.l.lookupKeybinding(accept)?.getLabel(), this.l.lookupKeybinding(preview)?.getLabel());
            return null;
        }
        afterRender(position) {
            if (!position) {
                // cancel rename when input widget isn't rendered anymore
                this.cancelInput(true);
            }
        }
        acceptInput(wantsPreview) {
            this.o?.(wantsPreview);
        }
        cancelInput(focusEditor) {
            this.p?.(focusEditor);
        }
        getInput(where, value, selectionStart, selectionEnd, supportPreview, token) {
            this.b.classList.toggle('preview', supportPreview);
            this.a = new position_1.$js(where.startLineNumber, where.startColumn);
            this.c.value = value;
            this.c.setAttribute('selectionStart', selectionStart.toString());
            this.c.setAttribute('selectionEnd', selectionEnd.toString());
            this.c.size = Math.max((where.endColumn - where.startColumn) * 1.1, 20);
            const disposeOnDone = new lifecycle_1.$jc();
            return new Promise(resolve => {
                this.p = (focusEditor) => {
                    this.o = undefined;
                    this.p = undefined;
                    resolve(focusEditor);
                    return true;
                };
                this.o = (wantsPreview) => {
                    if (this.c.value.trim().length === 0 || this.c.value === value) {
                        // empty or whitespace only or not changed
                        this.cancelInput(true);
                        return;
                    }
                    this.o = undefined;
                    this.p = undefined;
                    resolve({
                        newName: this.c.value,
                        wantsPreview: supportPreview && wantsPreview
                    });
                };
                disposeOnDone.add(token.onCancellationRequested(() => this.cancelInput(true)));
                disposeOnDone.add(this.i.onDidBlurEditorWidget(() => this.cancelInput(!this.b?.ownerDocument.hasFocus())));
                this.q();
            }).finally(() => {
                disposeOnDone.dispose();
                this.r();
            });
        }
        q() {
            this.i.revealLineInCenterIfOutsideViewport(this.a.lineNumber, 0 /* ScrollType.Smooth */);
            this.f = true;
            this.g.set(true);
            this.i.layoutContentWidget(this);
            setTimeout(() => {
                this.c.focus();
                this.c.setSelectionRange(parseInt(this.c.getAttribute('selectionStart')), parseInt(this.c.getAttribute('selectionEnd')));
            }, 100);
        }
        r() {
            this.f = false;
            this.g.reset();
            this.i.layoutContentWidget(this);
        }
    };
    exports.$q0 = $q0;
    exports.$q0 = $q0 = __decorate([
        __param(2, themeService_1.$gv),
        __param(3, keybinding_1.$2D),
        __param(4, contextkey_1.$3i)
    ], $q0);
});
//# sourceMappingURL=renameInputField.js.map