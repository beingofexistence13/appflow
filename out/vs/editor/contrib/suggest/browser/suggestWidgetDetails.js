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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/event", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/editor/contrib/markdownRenderer/browser/markdownRenderer", "vs/base/browser/ui/resizable/resizable", "vs/nls", "vs/platform/instantiation/common/instantiation"], function (require, exports, dom, scrollableElement_1, codicons_1, themables_1, event_1, htmlContent_1, lifecycle_1, markdownRenderer_1, resizable_1, nls, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SuggestDetailsOverlay = exports.SuggestDetailsWidget = exports.canExpandCompletionItem = void 0;
    function canExpandCompletionItem(item) {
        return !!item && Boolean(item.completion.documentation || item.completion.detail && item.completion.detail !== item.completion.label);
    }
    exports.canExpandCompletionItem = canExpandCompletionItem;
    let SuggestDetailsWidget = class SuggestDetailsWidget {
        constructor(_editor, instaService) {
            this._editor = _editor;
            this._onDidClose = new event_1.Emitter();
            this.onDidClose = this._onDidClose.event;
            this._onDidChangeContents = new event_1.Emitter();
            this.onDidChangeContents = this._onDidChangeContents.event;
            this._disposables = new lifecycle_1.DisposableStore();
            this._renderDisposeable = new lifecycle_1.DisposableStore();
            this._borderWidth = 1;
            this._size = new dom.Dimension(330, 0);
            this.domNode = dom.$('.suggest-details');
            this.domNode.classList.add('no-docs');
            this._markdownRenderer = instaService.createInstance(markdownRenderer_1.MarkdownRenderer, { editor: _editor });
            this._body = dom.$('.body');
            this._scrollbar = new scrollableElement_1.DomScrollableElement(this._body, {
                alwaysConsumeMouseWheel: true,
            });
            dom.append(this.domNode, this._scrollbar.getDomNode());
            this._disposables.add(this._scrollbar);
            this._header = dom.append(this._body, dom.$('.header'));
            this._close = dom.append(this._header, dom.$('span' + themables_1.ThemeIcon.asCSSSelector(codicons_1.Codicon.close)));
            this._close.title = nls.localize('details.close', "Close");
            this._type = dom.append(this._header, dom.$('p.type'));
            this._docs = dom.append(this._body, dom.$('p.docs'));
            this._configureFont();
            this._disposables.add(this._editor.onDidChangeConfiguration(e => {
                if (e.hasChanged(50 /* EditorOption.fontInfo */)) {
                    this._configureFont();
                }
            }));
        }
        dispose() {
            this._disposables.dispose();
            this._renderDisposeable.dispose();
        }
        _configureFont() {
            const options = this._editor.getOptions();
            const fontInfo = options.get(50 /* EditorOption.fontInfo */);
            const fontFamily = fontInfo.getMassagedFontFamily();
            const fontSize = options.get(118 /* EditorOption.suggestFontSize */) || fontInfo.fontSize;
            const lineHeight = options.get(119 /* EditorOption.suggestLineHeight */) || fontInfo.lineHeight;
            const fontWeight = fontInfo.fontWeight;
            const fontSizePx = `${fontSize}px`;
            const lineHeightPx = `${lineHeight}px`;
            this.domNode.style.fontSize = fontSizePx;
            this.domNode.style.lineHeight = `${lineHeight / fontSize}`;
            this.domNode.style.fontWeight = fontWeight;
            this.domNode.style.fontFeatureSettings = fontInfo.fontFeatureSettings;
            this._type.style.fontFamily = fontFamily;
            this._close.style.height = lineHeightPx;
            this._close.style.width = lineHeightPx;
        }
        getLayoutInfo() {
            const lineHeight = this._editor.getOption(119 /* EditorOption.suggestLineHeight */) || this._editor.getOption(50 /* EditorOption.fontInfo */).lineHeight;
            const borderWidth = this._borderWidth;
            const borderHeight = borderWidth * 2;
            return {
                lineHeight,
                borderWidth,
                borderHeight,
                verticalPadding: 22,
                horizontalPadding: 14
            };
        }
        renderLoading() {
            this._type.textContent = nls.localize('loading', "Loading...");
            this._docs.textContent = '';
            this.domNode.classList.remove('no-docs', 'no-type');
            this.layout(this.size.width, this.getLayoutInfo().lineHeight * 2);
            this._onDidChangeContents.fire(this);
        }
        renderItem(item, explainMode) {
            this._renderDisposeable.clear();
            let { detail, documentation } = item.completion;
            if (explainMode) {
                let md = '';
                md += `score: ${item.score[0]}\n`;
                md += `prefix: ${item.word ?? '(no prefix)'}\n`;
                md += `word: ${item.completion.filterText ? item.completion.filterText + ' (filterText)' : item.textLabel}\n`;
                md += `distance: ${item.distance} (localityBonus-setting)\n`;
                md += `index: ${item.idx}, based on ${item.completion.sortText && `sortText: "${item.completion.sortText}"` || 'label'}\n`;
                md += `commit_chars: ${item.completion.commitCharacters?.join('')}\n`;
                documentation = new htmlContent_1.MarkdownString().appendCodeblock('empty', md);
                detail = `Provider: ${item.provider._debugDisplayName}`;
            }
            if (!explainMode && !canExpandCompletionItem(item)) {
                this.clearContents();
                return;
            }
            this.domNode.classList.remove('no-docs', 'no-type');
            // --- details
            if (detail) {
                const cappedDetail = detail.length > 100000 ? `${detail.substr(0, 100000)}…` : detail;
                this._type.textContent = cappedDetail;
                this._type.title = cappedDetail;
                dom.show(this._type);
                this._type.classList.toggle('auto-wrap', !/\r?\n^\s+/gmi.test(cappedDetail));
            }
            else {
                dom.clearNode(this._type);
                this._type.title = '';
                dom.hide(this._type);
                this.domNode.classList.add('no-type');
            }
            // --- documentation
            dom.clearNode(this._docs);
            if (typeof documentation === 'string') {
                this._docs.classList.remove('markdown-docs');
                this._docs.textContent = documentation;
            }
            else if (documentation) {
                this._docs.classList.add('markdown-docs');
                dom.clearNode(this._docs);
                const renderedContents = this._markdownRenderer.render(documentation);
                this._docs.appendChild(renderedContents.element);
                this._renderDisposeable.add(renderedContents);
                this._renderDisposeable.add(this._markdownRenderer.onDidRenderAsync(() => {
                    this.layout(this._size.width, this._type.clientHeight + this._docs.clientHeight);
                    this._onDidChangeContents.fire(this);
                }));
            }
            this.domNode.style.userSelect = 'text';
            this.domNode.tabIndex = -1;
            this._close.onmousedown = e => {
                e.preventDefault();
                e.stopPropagation();
            };
            this._close.onclick = e => {
                e.preventDefault();
                e.stopPropagation();
                this._onDidClose.fire();
            };
            this._body.scrollTop = 0;
            this.layout(this._size.width, this._type.clientHeight + this._docs.clientHeight);
            this._onDidChangeContents.fire(this);
        }
        clearContents() {
            this.domNode.classList.add('no-docs');
            this._type.textContent = '';
            this._docs.textContent = '';
        }
        get size() {
            return this._size;
        }
        layout(width, height) {
            const newSize = new dom.Dimension(width, height);
            if (!dom.Dimension.equals(newSize, this._size)) {
                this._size = newSize;
                dom.size(this.domNode, width, height);
            }
            this._scrollbar.scanDomNode();
        }
        scrollDown(much = 8) {
            this._body.scrollTop += much;
        }
        scrollUp(much = 8) {
            this._body.scrollTop -= much;
        }
        scrollTop() {
            this._body.scrollTop = 0;
        }
        scrollBottom() {
            this._body.scrollTop = this._body.scrollHeight;
        }
        pageDown() {
            this.scrollDown(80);
        }
        pageUp() {
            this.scrollUp(80);
        }
        set borderWidth(width) {
            this._borderWidth = width;
        }
        get borderWidth() {
            return this._borderWidth;
        }
    };
    exports.SuggestDetailsWidget = SuggestDetailsWidget;
    exports.SuggestDetailsWidget = SuggestDetailsWidget = __decorate([
        __param(1, instantiation_1.IInstantiationService)
    ], SuggestDetailsWidget);
    class SuggestDetailsOverlay {
        constructor(widget, _editor) {
            this.widget = widget;
            this._editor = _editor;
            this._disposables = new lifecycle_1.DisposableStore();
            this._added = false;
            this._preferAlignAtTop = true;
            this._resizable = new resizable_1.ResizableHTMLElement();
            this._resizable.domNode.classList.add('suggest-details-container');
            this._resizable.domNode.appendChild(widget.domNode);
            this._resizable.enableSashes(false, true, true, false);
            let topLeftNow;
            let sizeNow;
            let deltaTop = 0;
            let deltaLeft = 0;
            this._disposables.add(this._resizable.onDidWillResize(() => {
                topLeftNow = this._topLeft;
                sizeNow = this._resizable.size;
            }));
            this._disposables.add(this._resizable.onDidResize(e => {
                if (topLeftNow && sizeNow) {
                    this.widget.layout(e.dimension.width, e.dimension.height);
                    let updateTopLeft = false;
                    if (e.west) {
                        deltaLeft = sizeNow.width - e.dimension.width;
                        updateTopLeft = true;
                    }
                    if (e.north) {
                        deltaTop = sizeNow.height - e.dimension.height;
                        updateTopLeft = true;
                    }
                    if (updateTopLeft) {
                        this._applyTopLeft({
                            top: topLeftNow.top + deltaTop,
                            left: topLeftNow.left + deltaLeft,
                        });
                    }
                }
                if (e.done) {
                    topLeftNow = undefined;
                    sizeNow = undefined;
                    deltaTop = 0;
                    deltaLeft = 0;
                    this._userSize = e.dimension;
                }
            }));
            this._disposables.add(this.widget.onDidChangeContents(() => {
                if (this._anchorBox) {
                    this._placeAtAnchor(this._anchorBox, this._userSize ?? this.widget.size, this._preferAlignAtTop);
                }
            }));
        }
        dispose() {
            this._resizable.dispose();
            this._disposables.dispose();
            this.hide();
        }
        getId() {
            return 'suggest.details';
        }
        getDomNode() {
            return this._resizable.domNode;
        }
        getPosition() {
            return null;
        }
        show() {
            if (!this._added) {
                this._editor.addOverlayWidget(this);
                this.getDomNode().style.position = 'fixed';
                this._added = true;
            }
        }
        hide(sessionEnded = false) {
            this._resizable.clearSashHoverState();
            if (this._added) {
                this._editor.removeOverlayWidget(this);
                this._added = false;
                this._anchorBox = undefined;
                this._topLeft = undefined;
            }
            if (sessionEnded) {
                this._userSize = undefined;
                this.widget.clearContents();
            }
        }
        placeAtAnchor(anchor, preferAlignAtTop) {
            const anchorBox = anchor.getBoundingClientRect();
            this._anchorBox = anchorBox;
            this._preferAlignAtTop = preferAlignAtTop;
            this._placeAtAnchor(this._anchorBox, this._userSize ?? this.widget.size, preferAlignAtTop);
        }
        _placeAtAnchor(anchorBox, size, preferAlignAtTop) {
            const bodyBox = dom.getClientArea(this.getDomNode().ownerDocument.body);
            const info = this.widget.getLayoutInfo();
            const defaultMinSize = new dom.Dimension(220, 2 * info.lineHeight);
            const defaultTop = anchorBox.top;
            // EAST
            const eastPlacement = (function () {
                const width = bodyBox.width - (anchorBox.left + anchorBox.width + info.borderWidth + info.horizontalPadding);
                const left = -info.borderWidth + anchorBox.left + anchorBox.width;
                const maxSizeTop = new dom.Dimension(width, bodyBox.height - anchorBox.top - info.borderHeight - info.verticalPadding);
                const maxSizeBottom = maxSizeTop.with(undefined, anchorBox.top + anchorBox.height - info.borderHeight - info.verticalPadding);
                return { top: defaultTop, left, fit: width - size.width, maxSizeTop, maxSizeBottom, minSize: defaultMinSize.with(Math.min(width, defaultMinSize.width)) };
            })();
            // WEST
            const westPlacement = (function () {
                const width = anchorBox.left - info.borderWidth - info.horizontalPadding;
                const left = Math.max(info.horizontalPadding, anchorBox.left - size.width - info.borderWidth);
                const maxSizeTop = new dom.Dimension(width, bodyBox.height - anchorBox.top - info.borderHeight - info.verticalPadding);
                const maxSizeBottom = maxSizeTop.with(undefined, anchorBox.top + anchorBox.height - info.borderHeight - info.verticalPadding);
                return { top: defaultTop, left, fit: width - size.width, maxSizeTop, maxSizeBottom, minSize: defaultMinSize.with(Math.min(width, defaultMinSize.width)) };
            })();
            // SOUTH
            const southPacement = (function () {
                const left = anchorBox.left;
                const top = -info.borderWidth + anchorBox.top + anchorBox.height;
                const maxSizeBottom = new dom.Dimension(anchorBox.width - info.borderHeight, bodyBox.height - anchorBox.top - anchorBox.height - info.verticalPadding);
                return { top, left, fit: maxSizeBottom.height - size.height, maxSizeBottom, maxSizeTop: maxSizeBottom, minSize: defaultMinSize.with(maxSizeBottom.width) };
            })();
            // take first placement that fits or the first with "least bad" fit
            const placements = [eastPlacement, westPlacement, southPacement];
            const placement = placements.find(p => p.fit >= 0) ?? placements.sort((a, b) => b.fit - a.fit)[0];
            // top/bottom placement
            const bottom = anchorBox.top + anchorBox.height - info.borderHeight;
            let alignAtTop;
            let height = size.height;
            const maxHeight = Math.max(placement.maxSizeTop.height, placement.maxSizeBottom.height);
            if (height > maxHeight) {
                height = maxHeight;
            }
            let maxSize;
            if (preferAlignAtTop) {
                if (height <= placement.maxSizeTop.height) {
                    alignAtTop = true;
                    maxSize = placement.maxSizeTop;
                }
                else {
                    alignAtTop = false;
                    maxSize = placement.maxSizeBottom;
                }
            }
            else {
                if (height <= placement.maxSizeBottom.height) {
                    alignAtTop = false;
                    maxSize = placement.maxSizeBottom;
                }
                else {
                    alignAtTop = true;
                    maxSize = placement.maxSizeTop;
                }
            }
            this._applyTopLeft({ left: placement.left, top: alignAtTop ? placement.top : bottom - height });
            this.getDomNode().style.position = 'fixed';
            this._resizable.enableSashes(!alignAtTop, placement === eastPlacement, alignAtTop, placement !== eastPlacement);
            this._resizable.minSize = placement.minSize;
            this._resizable.maxSize = maxSize;
            this._resizable.layout(height, Math.min(maxSize.width, size.width));
            this.widget.layout(this._resizable.size.width, this._resizable.size.height);
        }
        _applyTopLeft(topLeft) {
            this._topLeft = topLeft;
            this.getDomNode().style.left = `${this._topLeft.left}px`;
            this.getDomNode().style.top = `${this._topLeft.top}px`;
        }
    }
    exports.SuggestDetailsOverlay = SuggestDetailsOverlay;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VnZ2VzdFdpZGdldERldGFpbHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9zdWdnZXN0L2Jyb3dzZXIvc3VnZ2VzdFdpZGdldERldGFpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBaUJoRyxTQUFnQix1QkFBdUIsQ0FBQyxJQUFnQztRQUN2RSxPQUFPLENBQUMsQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxLQUFLLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDdkksQ0FBQztJQUZELDBEQUVDO0lBRU0sSUFBTSxvQkFBb0IsR0FBMUIsTUFBTSxvQkFBb0I7UUF1QmhDLFlBQ2tCLE9BQW9CLEVBQ2QsWUFBbUM7WUFEekMsWUFBTyxHQUFQLE9BQU8sQ0FBYTtZQXBCckIsZ0JBQVcsR0FBRyxJQUFJLGVBQU8sRUFBUSxDQUFDO1lBQzFDLGVBQVUsR0FBZ0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUM7WUFFekMseUJBQW9CLEdBQUcsSUFBSSxlQUFPLEVBQVEsQ0FBQztZQUNuRCx3QkFBbUIsR0FBZ0IsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQztZQVEzRCxpQkFBWSxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBR3JDLHVCQUFrQixHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBQ3BELGlCQUFZLEdBQVcsQ0FBQyxDQUFDO1lBQ3pCLFVBQUssR0FBRyxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBTXpDLElBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxD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