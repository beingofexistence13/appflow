/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/iconLabel/iconLabels", "vs/editor/common/core/range", "vs/editor/common/model/textModel", "vs/css!./codelensWidget"], function (require, exports, dom, iconLabels_1, range_1, textModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$42 = exports.$32 = void 0;
    class CodeLensViewZone {
        constructor(afterLineNumber, heightInPx, onHeight) {
            /**
             * We want that this view zone, which reserves space for a code lens appears
             * as close as possible to the next line, so we use a very large value here.
             */
            this.afterColumn = 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */;
            this.afterLineNumber = afterLineNumber;
            this.heightInPx = heightInPx;
            this.b = onHeight;
            this.suppressMouseDown = true;
            this.domNode = document.createElement('div');
        }
        onComputedHeight(height) {
            if (this.a === undefined) {
                this.a = height;
            }
            else if (this.a !== height) {
                this.a = height;
                this.b();
            }
        }
        isVisible() {
            return this.a !== 0
                && this.domNode.hasAttribute('monaco-visible-view-zone');
        }
    }
    class CodeLensContentWidget {
        static { this.a = 0; }
        constructor(editor, line) {
            // Editor.IContentWidget.allowEditorOverflow
            this.allowEditorOverflow = false;
            this.suppressMouseDown = true;
            this.e = new Map();
            this.g = true;
            this.d = editor;
            this.b = `codelens.widget-${(CodeLensContentWidget.a++)}`;
            this.updatePosition(line);
            this.c = document.createElement('span');
            this.c.className = `codelens-decoration`;
        }
        withCommands(lenses, animate) {
            this.e.clear();
            const children = [];
            let hasSymbol = false;
            for (let i = 0; i < lenses.length; i++) {
                const lens = lenses[i];
                if (!lens) {
                    continue;
                }
                hasSymbol = true;
                if (lens.command) {
                    const title = (0, iconLabels_1.$xQ)(lens.command.title.trim());
                    if (lens.command.id) {
                        children.push(dom.$('a', { id: String(i), title: lens.command.tooltip, role: 'button' }, ...title));
                        this.e.set(String(i), lens.command);
                    }
                    else {
                        children.push(dom.$('span', { title: lens.command.tooltip }, ...title));
                    }
                    if (i + 1 < lenses.length) {
                        children.push(dom.$('span', undefined, '\u00a0|\u00a0'));
                    }
                }
            }
            if (!hasSymbol) {
                // symbols but no commands
                dom.$_O(this.c, dom.$('span', undefined, 'no commands'));
            }
            else {
                // symbols and commands
                dom.$_O(this.c, ...children);
                if (this.g && animate) {
                    this.c.classList.add('fadein');
                }
                this.g = false;
            }
        }
        getCommand(link) {
            return link.parentElement === this.c
                ? this.e.get(link.id)
                : undefined;
        }
        getId() {
            return this.b;
        }
        getDomNode() {
            return this.c;
        }
        updatePosition(line) {
            const column = this.d.getModel().getLineFirstNonWhitespaceColumn(line);
            this.f = {
                position: { lineNumber: line, column: column },
                preference: [1 /* ContentWidgetPositionPreference.ABOVE */]
            };
        }
        getPosition() {
            return this.f || null;
        }
    }
    class $32 {
        constructor() {
            this.a = [];
            this.b = [];
            this.c = [];
        }
        addDecoration(decoration, callback) {
            this.b.push(decoration);
            this.c.push(callback);
        }
        removeDecoration(decorationId) {
            this.a.push(decorationId);
        }
        commit(changeAccessor) {
            const resultingDecorations = changeAccessor.deltaDecorations(this.a, this.b);
            for (let i = 0, len = resultingDecorations.length; i < len; i++) {
                this.c[i](resultingDecorations[i]);
            }
        }
    }
    exports.$32 = $32;
    const codeLensDecorationOptions = textModel_1.$RC.register({
        collapseOnReplaceEdit: true,
        description: 'codelens'
    });
    class $42 {
        constructor(data, editor, helper, viewZoneChangeAccessor, heightInPx, updateCallback) {
            this.g = false;
            this.a = editor;
            this.f = data;
            // create combined range, track all ranges with decorations,
            // check if there is already something to render
            this.e = [];
            let range;
            const lenses = [];
            this.f.forEach((codeLensData, i) => {
                if (codeLensData.symbol.command) {
                    lenses.push(codeLensData.symbol);
                }
                helper.addDecoration({
                    range: codeLensData.symbol.range,
                    options: codeLensDecorationOptions
                }, id => this.e[i] = id);
                // the range contains all lenses on this line
                if (!range) {
                    range = range_1.$ks.lift(codeLensData.symbol.range);
                }
                else {
                    range = range_1.$ks.plusRange(range, codeLensData.symbol.range);
                }
            });
            this.b = new CodeLensViewZone(range.startLineNumber - 1, heightInPx, updateCallback);
            this.c = viewZoneChangeAccessor.addZone(this.b);
            if (lenses.length > 0) {
                this.h();
                this.d.withCommands(lenses, false);
            }
        }
        h() {
            if (!this.d) {
                this.d = new CodeLensContentWidget(this.a, this.b.afterLineNumber + 1);
                this.a.addContentWidget(this.d);
            }
            else {
                this.a.layoutContentWidget(this.d);
            }
        }
        dispose(helper, viewZoneChangeAccessor) {
            this.e.forEach(helper.removeDecoration, helper);
            this.e = [];
            viewZoneChangeAccessor?.removeZone(this.c);
            if (this.d) {
                this.a.removeContentWidget(this.d);
                this.d = undefined;
            }
            this.g = true;
        }
        isDisposed() {
            return this.g;
        }
        isValid() {
            return this.e.some((id, i) => {
                const range = this.a.getModel().getDecorationRange(id);
                const symbol = this.f[i].symbol;
                return !!(range && range_1.$ks.isEmpty(symbol.range) === range.isEmpty());
            });
        }
        updateCodeLensSymbols(data, helper) {
            this.e.forEach(helper.removeDecoration, helper);
            this.e = [];
            this.f = data;
            this.f.forEach((codeLensData, i) => {
                helper.addDecoration({
                    range: codeLensData.symbol.range,
                    options: codeLensDecorationOptions
                }, id => this.e[i] = id);
            });
        }
        updateHeight(height, viewZoneChangeAccessor) {
            this.b.heightInPx = height;
            viewZoneChangeAccessor.layoutZone(this.c);
            if (this.d) {
                this.a.layoutContentWidget(this.d);
            }
        }
        computeIfNecessary(model) {
            if (!this.b.isVisible()) {
                return null;
            }
            // Read editor current state
            for (let i = 0; i < this.e.length; i++) {
                const range = model.getDecorationRange(this.e[i]);
                if (range) {
                    this.f[i].symbol.range = range;
                }
            }
            return this.f;
        }
        updateCommands(symbols) {
            this.h();
            this.d.withCommands(symbols, true);
            for (let i = 0; i < this.f.length; i++) {
                const resolved = symbols[i];
                if (resolved) {
                    const { symbol } = this.f[i];
                    symbol.command = resolved.command || symbol.command;
                }
            }
        }
        getCommand(link) {
            return this.d?.getCommand(link);
        }
        getLineNumber() {
            const range = this.a.getModel().getDecorationRange(this.e[0]);
            if (range) {
                return range.startLineNumber;
            }
            return -1;
        }
        update(viewZoneChangeAccessor) {
            if (this.isValid()) {
                const range = this.a.getModel().getDecorationRange(this.e[0]);
                if (range) {
                    this.b.afterLineNumber = range.startLineNumber - 1;
                    viewZoneChangeAccessor.layoutZone(this.c);
                    if (this.d) {
                        this.d.updatePosition(range.startLineNumber);
                        this.a.layoutContentWidget(this.d);
                    }
                }
            }
        }
        getItems() {
            return this.f;
        }
    }
    exports.$42 = $42;
});
//# sourceMappingURL=codelensWidget.js.map