/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/arrays", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/editor/contrib/markdownRenderer/browser/markdownRenderer", "vs/editor/contrib/hover/browser/hoverOperation", "vs/base/browser/ui/hover/hoverWidget"], function (require, exports, dom, arrays_1, htmlContent_1, lifecycle_1, markdownRenderer_1, hoverOperation_1, hoverWidget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MarginHoverWidget = void 0;
    const $ = dom.$;
    class MarginHoverWidget extends lifecycle_1.Disposable {
        static { this.ID = 'editor.contrib.modesGlyphHoverWidget'; }
        constructor(editor, languageService, openerService) {
            super();
            this._renderDisposeables = this._register(new lifecycle_1.DisposableStore());
            this._editor = editor;
            this._isVisible = false;
            this._messages = [];
            this._hover = this._register(new hoverWidget_1.HoverWidget());
            this._hover.containerDomNode.classList.toggle('hidden', !this._isVisible);
            this._markdownRenderer = this._register(new markdownRenderer_1.MarkdownRenderer({ editor: this._editor }, languageService, openerService));
            this._computer = new MarginHoverComputer(this._editor);
            this._hoverOperation = this._register(new hoverOperation_1.HoverOperation(this._editor, this._computer));
            this._register(this._hoverOperation.onResult((result) => {
                this._withResult(result.value);
            }));
            this._register(this._editor.onDidChangeModelDecorations(() => this._onModelDecorationsChanged()));
            this._register(this._editor.onDidChangeConfiguration((e) => {
                if (e.hasChanged(50 /* EditorOption.fontInfo */)) {
                    this._updateFont();
                }
            }));
            this._editor.addOverlayWidget(this);
        }
        dispose() {
            this._editor.removeOverlayWidget(this);
            super.dispose();
        }
        getId() {
            return MarginHoverWidget.ID;
        }
        getDomNode() {
            return this._hover.containerDomNode;
        }
        getPosition() {
            return null;
        }
        _updateFont() {
            const codeClasses = Array.prototype.slice.call(this._hover.contentsDomNode.getElementsByClassName('code'));
            codeClasses.forEach(node => this._editor.applyFontInfo(node));
        }
        _onModelDecorationsChanged() {
            if (this._isVisible) {
                // The decorations have changed and the hover is visible,
                // we need to recompute the displayed text
                this._hoverOperation.cancel();
                this._hoverOperation.start(0 /* HoverStartMode.Delayed */);
            }
        }
        startShowingAt(lineNumber) {
            if (this._computer.lineNumber === lineNumber) {
                // We have to show the widget at the exact same line number as before, so no work is needed
                return;
            }
            this._hoverOperation.cancel();
            this.hide();
            this._computer.lineNumber = lineNumber;
            this._hoverOperation.start(0 /* HoverStartMode.Delayed */);
        }
        hide() {
            this._computer.lineNumber = -1;
            this._hoverOperation.cancel();
            if (!this._isVisible) {
                return;
            }
            this._isVisible = false;
            this._hover.containerDomNode.classList.toggle('hidden', !this._isVisible);
        }
        _withResult(result) {
            this._messages = result;
            if (this._messages.length > 0) {
                this._renderMessages(this._computer.lineNumber, this._messages);
            }
            else {
                this.hide();
            }
        }
        _renderMessages(lineNumber, messages) {
            this._renderDisposeables.clear();
            const fragment = document.createDocumentFragment();
            for (const msg of messages) {
                const markdownHoverElement = $('div.hover-row.markdown-hover');
                const hoverContentsElement = dom.append(markdownHoverElement, $('div.hover-contents'));
                const renderedContents = this._renderDisposeables.add(this._markdownRenderer.render(msg.value));
                hoverContentsElement.appendChild(renderedContents.element);
                fragment.appendChild(markdownHoverElement);
            }
            this._updateContents(fragment);
            this._showAt(lineNumber);
        }
        _updateContents(node) {
            this._hover.contentsDomNode.textContent = '';
            this._hover.contentsDomNode.appendChild(node);
            this._updateFont();
        }
        _showAt(lineNumber) {
            if (!this._isVisible) {
                this._isVisible = true;
                this._hover.containerDomNode.classList.toggle('hidden', !this._isVisible);
            }
            const editorLayout = this._editor.getLayoutInfo();
            const topForLineNumber = this._editor.getTopForLineNumber(lineNumber);
            const editorScrollTop = this._editor.getScrollTop();
            const lineHeight = this._editor.getOption(66 /* EditorOption.lineHeight */);
            const nodeHeight = this._hover.containerDomNode.clientHeight;
            const top = topForLineNumber - editorScrollTop - ((nodeHeight - lineHeight) / 2);
            this._hover.containerDomNode.style.left = `${editorLayout.glyphMarginLeft + editorLayout.glyphMarginWidth}px`;
            this._hover.containerDomNode.style.top = `${Math.max(Math.round(top), 0)}px`;
        }
    }
    exports.MarginHoverWidget = MarginHoverWidget;
    class MarginHoverComputer {
        get lineNumber() {
            return this._lineNumber;
        }
        set lineNumber(value) {
            this._lineNumber = value;
        }
        constructor(_editor) {
            this._editor = _editor;
            this._lineNumber = -1;
        }
        computeSync() {
            const toHoverMessage = (contents) => {
                return {
                    value: contents
                };
            };
            const lineDecorations = this._editor.getLineDecorations(this._lineNumber);
            const result = [];
            if (!lineDecorations) {
                return result;
            }
            for (const d of lineDecorations) {
                if (!d.options.glyphMarginClassName) {
                    continue;
                }
                const hoverMessage = d.options.glyphMarginHoverMessage;
                if (!hoverMessage || (0, htmlContent_1.isEmptyMarkdownString)(hoverMessage)) {
                    continue;
                }
                result.push(...(0, arrays_1.asArray)(hoverMessage).map(toHoverMessage));
            }
            return result;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFyZ2luSG92ZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9ob3Zlci9icm93c2VyL21hcmdpbkhvdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWNoRyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBTWhCLE1BQWEsaUJBQWtCLFNBQVEsc0JBQVU7aUJBRXpCLE9BQUUsR0FBRyxzQ0FBc0MsQUFBekMsQ0FBMEM7UUFhbkUsWUFDQyxNQUFtQixFQUNuQixlQUFpQyxFQUNqQyxhQUE2QjtZQUU3QixLQUFLLEVBQUUsQ0FBQztZQVBRLHdCQUFtQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSwyQkFBZSxFQUFFLENBQUMsQ0FBQztZQVE1RSxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztZQUV0QixJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztZQUN4QixJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztZQUVwQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSx5QkFBVyxFQUFFLENBQUMsQ0FBQztZQUNoRCxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBRTFFLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksbUNBQWdCLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLGVBQWUsRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQ3hILElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFD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