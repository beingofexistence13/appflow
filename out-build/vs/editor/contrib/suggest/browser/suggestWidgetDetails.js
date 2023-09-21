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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/event", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/editor/contrib/markdownRenderer/browser/markdownRenderer", "vs/base/browser/ui/resizable/resizable", "vs/nls!vs/editor/contrib/suggest/browser/suggestWidgetDetails", "vs/platform/instantiation/common/instantiation"], function (require, exports, dom, scrollableElement_1, codicons_1, themables_1, event_1, htmlContent_1, lifecycle_1, markdownRenderer_1, resizable_1, nls, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$w6 = exports.$v6 = exports.$u6 = void 0;
    function $u6(item) {
        return !!item && Boolean(item.completion.documentation || item.completion.detail && item.completion.detail !== item.completion.label);
    }
    exports.$u6 = $u6;
    let $v6 = class $v6 {
        constructor(r, instaService) {
            this.r = r;
            this.c = new event_1.$fd();
            this.onDidClose = this.c.event;
            this.d = new event_1.$fd();
            this.onDidChangeContents = this.d.event;
            this.l = new lifecycle_1.$jc();
            this.n = new lifecycle_1.$jc();
            this.o = 1;
            this.q = new dom.$BO(330, 0);
            this.domNode = dom.$('.suggest-details');
            this.domNode.classList.add('no-docs');
            this.m = instaService.createInstance(markdownRenderer_1.$K2, { editor: r });
            this.h = dom.$('.body');
            this.g = new scrollableElement_1.$UP(this.h, {
                alwaysConsumeMouseWheel: true,
            });
            dom.$0O(this.domNode, this.g.getDomNode());
            this.l.add(this.g);
            this.i = dom.$0O(this.h, dom.$('.header'));
            this.f = dom.$0O(this.i, dom.$('span' + themables_1.ThemeIcon.asCSSSelector(codicons_1.$Pj.close)));
            this.f.title = nls.localize(0, null);
            this.j = dom.$0O(this.i, dom.$('p.type'));
            this.k = dom.$0O(this.h, dom.$('p.docs'));
            this.s();
            this.l.add(this.r.onDidChangeConfiguration(e => {
                if (e.hasChanged(50 /* EditorOption.fontInfo */)) {
                    this.s();
                }
            }));
        }
        dispose() {
            this.l.dispose();
            this.n.dispose();
        }
        s() {
            const options = this.r.getOptions();
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
            this.j.style.fontFamily = fontFamily;
            this.f.style.height = lineHeightPx;
            this.f.style.width = lineHeightPx;
        }
        getLayoutInfo() {
            const lineHeight = this.r.getOption(119 /* EditorOption.suggestLineHeight */) || this.r.getOption(50 /* EditorOption.fontInfo */).lineHeight;
            const borderWidth = this.o;
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
            this.j.textContent = nls.localize(1, null);
            this.k.textContent = '';
            this.domNode.classList.remove('no-docs', 'no-type');
            this.layout(this.size.width, this.getLayoutInfo().lineHeight * 2);
            this.d.fire(this);
        }
        renderItem(item, explainMode) {
            this.n.clear();
            let { detail, documentation } = item.completion;
            if (explainMode) {
                let md = '';
                md += `score: ${item.score[0]}\n`;
                md += `prefix: ${item.word ?? '(no prefix)'}\n`;
                md += `word: ${item.completion.filterText ? item.completion.filterText + ' (filterText)' : item.textLabel}\n`;
                md += `distance: ${item.distance} (localityBonus-setting)\n`;
                md += `index: ${item.idx}, based on ${item.completion.sortText && `sortText: "${item.completion.sortText}"` || 'label'}\n`;
                md += `commit_chars: ${item.completion.commitCharacters?.join('')}\n`;
                documentation = new htmlContent_1.$Xj().appendCodeblock('empty', md);
                detail = `Provider: ${item.provider._debugDisplayName}`;
            }
            if (!explainMode && !$u6(item)) {
                this.clearContents();
                return;
            }
            this.domNode.classList.remove('no-docs', 'no-type');
            // --- details
            if (detail) {
                const cappedDetail = detail.length > 100000 ? `${detail.substr(0, 100000)}…` : detail;
                this.j.textContent = cappedDetail;
                this.j.title = cappedDetail;
                dom.$dP(this.j);
                this.j.classList.toggle('auto-wrap', !/\r?\n^\s+/gmi.test(cappedDetail));
            }
            else {
                dom.$lO(this.j);
                this.j.title = '';
                dom.$eP(this.j);
                this.domNode.classList.add('no-type');
            }
            // --- documentation
            dom.$lO(this.k);
            if (typeof documentation === 'string') {
                this.k.classList.remove('markdown-docs');
                this.k.textContent = documentation;
            }
            else if (documentation) {
                this.k.classList.add('markdown-docs');
                dom.$lO(this.k);
                const renderedContents = this.m.render(documentation);
                this.k.appendChild(renderedContents.element);
                this.n.add(renderedContents);
                this.n.add(this.m.onDidRenderAsync(() => {
                    this.layout(this.q.width, this.j.clientHeight + this.k.clientHeight);
                    this.d.fire(this);
                }));
            }
            this.domNode.style.userSelect = 'text';
            this.domNode.tabIndex = -1;
            this.f.onmousedown = e => {
                e.preventDefault();
                e.stopPropagation();
            };
            this.f.onclick = e => {
                e.preventDefault();
                e.stopPropagation();
                this.c.fire();
            };
            this.h.scrollTop = 0;
            this.layout(this.q.width, this.j.clientHeight + this.k.clientHeight);
            this.d.fire(this);
        }
        clearContents() {
            this.domNode.classList.add('no-docs');
            this.j.textContent = '';
            this.k.textContent = '';
        }
        get size() {
            return this.q;
        }
        layout(width, height) {
            const newSize = new dom.$BO(width, height);
            if (!dom.$BO.equals(newSize, this.q)) {
                this.q = newSize;
                dom.$DO(this.domNode, width, height);
            }
            this.g.scanDomNode();
        }
        scrollDown(much = 8) {
            this.h.scrollTop += much;
        }
        scrollUp(much = 8) {
            this.h.scrollTop -= much;
        }
        scrollTop() {
            this.h.scrollTop = 0;
        }
        scrollBottom() {
            this.h.scrollTop = this.h.scrollHeight;
        }
        pageDown() {
            this.scrollDown(80);
        }
        pageUp() {
            this.scrollUp(80);
        }
        set borderWidth(width) {
            this.o = width;
        }
        get borderWidth() {
            return this.o;
        }
    };
    exports.$v6 = $v6;
    exports.$v6 = $v6 = __decorate([
        __param(1, instantiation_1.$Ah)
    ], $v6);
    class $w6 {
        constructor(widget, k) {
            this.widget = widget;
            this.k = k;
            this.c = new lifecycle_1.$jc();
            this.f = false;
            this.h = true;
            this.d = new resizable_1.$ZR();
            this.d.domNode.classList.add('suggest-details-container');
            this.d.domNode.appendChild(widget.domNode);
            this.d.enableSashes(false, true, true, false);
            let topLeftNow;
            let sizeNow;
            let deltaTop = 0;
            let deltaLeft = 0;
            this.c.add(this.d.onDidWillResize(() => {
                topLeftNow = this.j;
                sizeNow = this.d.size;
            }));
            this.c.add(this.d.onDidResize(e => {
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
                        this.l({
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
                    this.i = e.dimension;
                }
            }));
            this.c.add(this.widget.onDidChangeContents(() => {
                if (this.g) {
                    this._placeAtAnchor(this.g, this.i ?? this.widget.size, this.h);
                }
            }));
        }
        dispose() {
            this.d.dispose();
            this.c.dispose();
            this.hide();
        }
        getId() {
            return 'suggest.details';
        }
        getDomNode() {
            return this.d.domNode;
        }
        getPosition() {
            return null;
        }
        show() {
            if (!this.f) {
                this.k.addOverlayWidget(this);
                this.getDomNode().style.position = 'fixed';
                this.f = true;
            }
        }
        hide(sessionEnded = false) {
            this.d.clearSashHoverState();
            if (this.f) {
                this.k.removeOverlayWidget(this);
                this.f = false;
                this.g = undefined;
                this.j = undefined;
            }
            if (sessionEnded) {
                this.i = undefined;
                this.widget.clearContents();
            }
        }
        placeAtAnchor(anchor, preferAlignAtTop) {
            const anchorBox = anchor.getBoundingClientRect();
            this.g = anchorBox;
            this.h = preferAlignAtTop;
            this._placeAtAnchor(this.g, this.i ?? this.widget.size, preferAlignAtTop);
        }
        _placeAtAnchor(anchorBox, size, preferAlignAtTop) {
            const bodyBox = dom.$AO(this.getDomNode().ownerDocument.body);
            const info = this.widget.getLayoutInfo();
            const defaultMinSize = new dom.$BO(220, 2 * info.lineHeight);
            const defaultTop = anchorBox.top;
            // EAST
            const eastPlacement = (function () {
                const width = bodyBox.width - (anchorBox.left + anchorBox.width + info.borderWidth + info.horizontalPadding);
                const left = -info.borderWidth + anchorBox.left + anchorBox.width;
                const maxSizeTop = new dom.$BO(width, bodyBox.height - anchorBox.top - info.borderHeight - info.verticalPadding);
                const maxSizeBottom = maxSizeTop.with(undefined, anchorBox.top + anchorBox.height - info.borderHeight - info.verticalPadding);
                return { top: defaultTop, left, fit: width - size.width, maxSizeTop, maxSizeBottom, minSize: defaultMinSize.with(Math.min(width, defaultMinSize.width)) };
            })();
            // WEST
            const westPlacement = (function () {
                const width = anchorBox.left - info.borderWidth - info.horizontalPadding;
                const left = Math.max(info.horizontalPadding, anchorBox.left - size.width - info.borderWidth);
                const maxSizeTop = new dom.$BO(width, bodyBox.height - anchorBox.top - info.borderHeight - info.verticalPadding);
                const maxSizeBottom = maxSizeTop.with(undefined, anchorBox.top + anchorBox.height - info.borderHeight - info.verticalPadding);
                return { top: defaultTop, left, fit: width - size.width, maxSizeTop, maxSizeBottom, minSize: defaultMinSize.with(Math.min(width, defaultMinSize.width)) };
            })();
            // SOUTH
            const southPacement = (function () {
                const left = anchorBox.left;
                const top = -info.borderWidth + anchorBox.top + anchorBox.height;
                const maxSizeBottom = new dom.$BO(anchorBox.width - info.borderHeight, bodyBox.height - anchorBox.top - anchorBox.height - info.verticalPadding);
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
            this.l({ left: placement.left, top: alignAtTop ? placement.top : bottom - height });
            this.getDomNode().style.position = 'fixed';
            this.d.enableSashes(!alignAtTop, placement === eastPlacement, alignAtTop, placement !== eastPlacement);
            this.d.minSize = placement.minSize;
            this.d.maxSize = maxSize;
            this.d.layout(height, Math.min(maxSize.width, size.width));
            this.widget.layout(this.d.size.width, this.d.size.height);
        }
        l(topLeft) {
            this.j = topLeft;
            this.getDomNode().style.left = `${this.j.left}px`;
            this.getDomNode().style.top = `${this.j.top}px`;
        }
    }
    exports.$w6 = $w6;
});
//# sourceMappingURL=suggestWidgetDetails.js.map