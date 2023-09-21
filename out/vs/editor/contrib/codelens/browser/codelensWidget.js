/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/iconLabel/iconLabels", "vs/editor/common/core/range", "vs/editor/common/model/textModel", "vs/css!./codelensWidget"], function (require, exports, dom, iconLabels_1, range_1, textModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CodeLensWidget = exports.CodeLensHelper = void 0;
    class CodeLensViewZone {
        constructor(afterLineNumber, heightInPx, onHeight) {
            /**
             * We want that this view zone, which reserves space for a code lens appears
             * as close as possible to the next line, so we use a very large value here.
             */
            this.afterColumn = 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */;
            this.afterLineNumber = afterLineNumber;
            this.heightInPx = heightInPx;
            this._onHeight = onHeight;
            this.suppressMouseDown = true;
            this.domNode = document.createElement('div');
        }
        onComputedHeight(height) {
            if (this._lastHeight === undefined) {
                this._lastHeight = height;
            }
            else if (this._lastHeight !== height) {
                this._lastHeight = height;
                this._onHeight();
            }
        }
        isVisible() {
            return this._lastHeight !== 0
                && this.domNode.hasAttribute('monaco-visible-view-zone');
        }
    }
    class CodeLensContentWidget {
        static { this._idPool = 0; }
        constructor(editor, line) {
            // Editor.IContentWidget.allowEditorOverflow
            this.allowEditorOverflow = false;
            this.suppressMouseDown = true;
            this._commands = new Map();
            this._isEmpty = true;
            this._editor = editor;
            this._id = `codelens.widget-${(CodeLensContentWidget._idPool++)}`;
            this.updatePosition(line);
            this._domNode = document.createElement('span');
            this._domNode.className = `codelens-decoration`;
        }
        withCommands(lenses, animate) {
            this._commands.clear();
            const children = [];
            let hasSymbol = false;
            for (let i = 0; i < lenses.length; i++) {
                const lens = lenses[i];
                if (!lens) {
                    continue;
                }
                hasSymbol = true;
                if (lens.command) {
                    const title = (0, iconLabels_1.renderLabelWithIcons)(lens.command.title.trim());
                    if (lens.command.id) {
                        children.push(dom.$('a', { id: String(i), title: lens.command.tooltip, role: 'button' }, ...title));
                        this._commands.set(String(i), lens.command);
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
                dom.reset(this._domNode, dom.$('span', undefined, 'no commands'));
            }
            else {
                // symbols and commands
                dom.reset(this._domNode, ...children);
                if (this._isEmpty && animate) {
                    this._domNode.classList.add('fadein');
                }
                this._isEmpty = false;
            }
        }
        getCommand(link) {
            return link.parentElement === this._domNode
                ? this._commands.get(link.id)
                : undefined;
        }
        getId() {
            return this._id;
        }
        getDomNode() {
            return this._domNode;
        }
        updatePosition(line) {
            const column = this._editor.getModel().getLineFirstNonWhitespaceColumn(line);
            this._widgetPosition = {
                position: { lineNumber: line, column: column },
                preference: [1 /* ContentWidgetPositionPreference.ABOVE */]
            };
        }
        getPosition() {
            return this._widgetPosition || null;
        }
    }
    class CodeLensHelper {
        constructor() {
            this._removeDecorations = [];
            this._addDecorations = [];
            this._addDecorationsCallbacks = [];
        }
        addDecoration(decoration, callback) {
            this._addDecorations.push(decoration);
            this._addDecorationsCallbacks.push(callback);
        }
        removeDecoration(decorationId) {
            this._removeDecorations.push(decorationId);
        }
        commit(changeAccessor) {
            const resultingDecorations = changeAccessor.deltaDecorations(this._removeDecorations, this._addDecorations);
            for (let i = 0, len = resultingDecorations.length; i < len; i++) {
                this._addDecorationsCallbacks[i](resultingDecorations[i]);
            }
        }
    }
    exports.CodeLensHelper = CodeLensHelper;
    const codeLensDecorationOptions = textModel_1.ModelDecorationOptions.register({
        collapseOnReplaceEdit: true,
        description: 'codelens'
    });
    class CodeLensWidget {
        constructor(data, editor, helper, viewZoneChangeAccessor, heightInPx, updateCallback) {
            this._isDisposed = false;
            this._editor = editor;
            this._data = data;
            // create combined range, track all ranges with decorations,
            // check if there is already something to render
            this._decorationIds = [];
            let range;
            const lenses = [];
            this._data.forEach((codeLensData, i) => {
                if (codeLensData.symbol.command) {
                    lenses.push(codeLensData.symbol);
                }
                helper.addDecoration({
                    range: codeLensData.symbol.range,
                    options: codeLensDecorationOptions
                }, id => this._decorationIds[i] = id);
                // the range contains all lenses on this line
                if (!range) {
                    range = range_1.Range.lift(codeLensData.symbol.range);
                }
                else {
                    range = range_1.Range.plusRange(range, codeLensData.symbol.range);
                }
            });
            this._viewZone = new CodeLensViewZone(range.startLineNumber - 1, heightInPx, updateCallback);
            this._viewZoneId = viewZoneChangeAccessor.addZone(this._viewZone);
            if (lenses.length > 0) {
                this._createContentWidgetIfNecessary();
                this._contentWidget.withCommands(lenses, false);
            }
        }
        _createContentWidgetIfNecessary() {
            if (!this._contentWidget) {
                this._contentWidget = new CodeLensContentWidget(this._editor, this._viewZone.afterLineNumber + 1);
                this._editor.addContentWidget(this._contentWidget);
            }
            else {
                this._editor.layoutContentWidget(this._contentWidget);
            }
        }
        dispose(helper, viewZoneChangeAccessor) {
            this._decorationIds.forEach(helper.removeDecoration, helper);
            this._decorationIds = [];
            viewZoneChangeAccessor?.removeZone(this._viewZoneId);
            if (this._contentWidget) {
                this._editor.removeContentWidget(this._contentWidget);
                this._contentWidget = undefined;
            }
            this._isDisposed = true;
        }
        isDisposed() {
            return this._isDisposed;
        }
        isValid() {
            return this._decorationIds.some((id, i) => {
                const range = this._editor.getModel().getDecorationRange(id);
                const symbol = this._data[i].symbol;
                return !!(range && range_1.Range.isEmpty(symbol.range) === range.isEmpty());
            });
        }
        updateCodeLensSymbols(data, helper) {
            this._decorationIds.forEach(helper.removeDecoration, helper);
            this._decorationIds = [];
            this._data = data;
            this._data.forEach((codeLensData, i) => {
                helper.addDecoration({
                    range: codeLensData.symbol.range,
                    options: codeLensDecorationOptions
                }, id => this._decorationIds[i] = id);
            });
        }
        updateHeight(height, viewZoneChangeAccessor) {
            this._viewZone.heightInPx = height;
            viewZoneChangeAccessor.layoutZone(this._viewZoneId);
            if (this._contentWidget) {
                this._editor.layoutContentWidget(this._contentWidget);
            }
        }
        computeIfNecessary(model) {
            if (!this._viewZone.isVisible()) {
                return null;
            }
            // Read editor current state
            for (let i = 0; i < this._decorationIds.length; i++) {
                const range = model.getDecorationRange(this._decorationIds[i]);
                if (range) {
                    this._data[i].symbol.range = range;
                }
            }
            return this._data;
        }
        updateCommands(symbols) {
            this._createContentWidgetIfNecessary();
            this._contentWidget.withCommands(symbols, true);
            for (let i = 0; i < this._data.length; i++) {
                const resolved = symbols[i];
                if (resolved) {
                    const { symbol } = this._data[i];
                    symbol.command = resolved.command || symbol.command;
                }
            }
        }
        getCommand(link) {
            return this._contentWidget?.getCommand(link);
        }
        getLineNumber() {
            const range = this._editor.getModel().getDecorationRange(this._decorationIds[0]);
            if (range) {
                return range.startLineNumber;
            }
            return -1;
        }
        update(viewZoneChangeAccessor) {
            if (this.isValid()) {
                const range = this._editor.getModel().getDecorationRange(this._decorationIds[0]);
                if (range) {
                    this._viewZone.afterLineNumber = range.startLineNumber - 1;
                    viewZoneChangeAccessor.layoutZone(this._viewZoneId);
                    if (this._contentWidget) {
                        this._contentWidget.updatePosition(range.startLineNumber);
                        this._editor.layoutContentWidget(this._contentWidget);
                    }
                }
            }
        }
        getItems() {
            return this._data;
        }
    }
    exports.CodeLensWidget = CodeLensWidget;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZWxlbnNXaWRnZXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9jb2RlbGVucy9icm93c2VyL2NvZGVsZW5zV2lkZ2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWFoRyxNQUFNLGdCQUFnQjtRQWdCckIsWUFBWSxlQUF1QixFQUFFLFVBQWtCLEVBQUUsUUFBb0I7WUFWN0U7OztlQUdHO1lBQ00sZ0JBQVcscURBQW9DO1lBT3ZELElBQUksQ0FBQyxlQUFlLEdBQUcsZUFBZSxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1lBRTdCLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1lBQzFCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7WUFDOUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzlDLENBQUM7UUFFRCxnQkFBZ0IsQ0FBQyxNQUFjO1lBQzlCLElBQUksSUFBSSxDQUFDLFdBQVcsS0FBSyxTQUFTLEVBQUU7Z0JBQ25DLElBQUksQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDO2FBQzFCO2lCQUFNLElBQUksSUFBSSxDQUFDLFdBQVcsS0FBSyxNQUFNLEVBQUU7Z0JBQ3ZDLElBQUksQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDO2dCQUMxQixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7YUFDakI7UUFDRixDQUFDO1FBRUQsU0FBUztZQUNSLE9BQU8sSUFBSSxDQUFDLFdBQVcsS0FBSyxDQUFDO21CQUN6QixJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1FBQzNELENBQUM7S0FDRDtJQUVELE1BQU0scUJBQXFCO2lCQUVYLFlBQU8sR0FBVyxDQUFDLEFBQVosQ0FBYTtRQWNu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