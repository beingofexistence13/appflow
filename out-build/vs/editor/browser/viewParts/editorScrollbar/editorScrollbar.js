/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/fastDomNode", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/editor/browser/view/viewPart", "vs/platform/theme/common/themeService"], function (require, exports, dom, fastDomNode_1, scrollableElement_1, viewPart_1, themeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$rX = void 0;
    class $rX extends viewPart_1.$FW {
        constructor(context, linesContent, viewDomNode, overflowGuardDomNode) {
            super(context);
            const options = this._context.configuration.options;
            const scrollbar = options.get(102 /* EditorOption.scrollbar */);
            const mouseWheelScrollSensitivity = options.get(74 /* EditorOption.mouseWheelScrollSensitivity */);
            const fastScrollSensitivity = options.get(40 /* EditorOption.fastScrollSensitivity */);
            const scrollPredominantAxis = options.get(105 /* EditorOption.scrollPredominantAxis */);
            const scrollbarOptions = {
                listenOnDomNode: viewDomNode.domNode,
                className: 'editor-scrollable' + ' ' + (0, themeService_1.$kv)(context.theme.type),
                useShadows: false,
                lazyRender: true,
                vertical: scrollbar.vertical,
                horizontal: scrollbar.horizontal,
                verticalHasArrows: scrollbar.verticalHasArrows,
                horizontalHasArrows: scrollbar.horizontalHasArrows,
                verticalScrollbarSize: scrollbar.verticalScrollbarSize,
                verticalSliderSize: scrollbar.verticalSliderSize,
                horizontalScrollbarSize: scrollbar.horizontalScrollbarSize,
                horizontalSliderSize: scrollbar.horizontalSliderSize,
                handleMouseWheel: scrollbar.handleMouseWheel,
                alwaysConsumeMouseWheel: scrollbar.alwaysConsumeMouseWheel,
                arrowSize: scrollbar.arrowSize,
                mouseWheelScrollSensitivity: mouseWheelScrollSensitivity,
                fastScrollSensitivity: fastScrollSensitivity,
                scrollPredominantAxis: scrollPredominantAxis,
                scrollByPage: scrollbar.scrollByPage,
            };
            this.a = this.B(new scrollableElement_1.$TP(linesContent.domNode, scrollbarOptions, this._context.viewLayout.getScrollable()));
            viewPart_1.$GW.write(this.a.getDomNode(), 5 /* PartFingerprint.ScrollableElement */);
            this.b = (0, fastDomNode_1.$GP)(this.a.getDomNode());
            this.b.setPosition('absolute');
            this.c();
            // When having a zone widget that calls .focus() on one of its dom elements,
            // the browser will try desperately to reveal that dom node, unexpectedly
            // changing the .scrollTop of this.linesContent
            const onBrowserDesperateReveal = (domNode, lookAtScrollTop, lookAtScrollLeft) => {
                const newScrollPosition = {};
                if (lookAtScrollTop) {
                    const deltaTop = domNode.scrollTop;
                    if (deltaTop) {
                        newScrollPosition.scrollTop = this._context.viewLayout.getCurrentScrollTop() + deltaTop;
                        domNode.scrollTop = 0;
                    }
                }
                if (lookAtScrollLeft) {
                    const deltaLeft = domNode.scrollLeft;
                    if (deltaLeft) {
                        newScrollPosition.scrollLeft = this._context.viewLayout.getCurrentScrollLeft() + deltaLeft;
                        domNode.scrollLeft = 0;
                    }
                }
                this._context.viewModel.viewLayout.setScrollPosition(newScrollPosition, 1 /* ScrollType.Immediate */);
            };
            // I've seen this happen both on the view dom node & on the lines content dom node.
            this.B(dom.$nO(viewDomNode.domNode, 'scroll', (e) => onBrowserDesperateReveal(viewDomNode.domNode, true, true)));
            this.B(dom.$nO(linesContent.domNode, 'scroll', (e) => onBrowserDesperateReveal(linesContent.domNode, true, false)));
            this.B(dom.$nO(overflowGuardDomNode.domNode, 'scroll', (e) => onBrowserDesperateReveal(overflowGuardDomNode.domNode, true, false)));
            this.B(dom.$nO(this.b.domNode, 'scroll', (e) => onBrowserDesperateReveal(this.b.domNode, true, false)));
        }
        dispose() {
            super.dispose();
        }
        c() {
            const options = this._context.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this.b.setLeft(layoutInfo.contentLeft);
            const minimap = options.get(72 /* EditorOption.minimap */);
            const side = minimap.side;
            if (side === 'right') {
                this.b.setWidth(layoutInfo.contentWidth + layoutInfo.minimap.minimapWidth);
            }
            else {
                this.b.setWidth(layoutInfo.contentWidth);
            }
            this.b.setHeight(layoutInfo.height);
        }
        getOverviewRulerLayoutInfo() {
            return this.a.getOverviewRulerLayoutInfo();
        }
        getDomNode() {
            return this.b;
        }
        delegateVerticalScrollbarPointerDown(browserEvent) {
            this.a.delegateVerticalScrollbarPointerDown(browserEvent);
        }
        delegateScrollFromMouseWheelEvent(browserEvent) {
            this.a.delegateScrollFromMouseWheelEvent(browserEvent);
        }
        // --- begin event handlers
        onConfigurationChanged(e) {
            if (e.hasChanged(102 /* EditorOption.scrollbar */)
                || e.hasChanged(74 /* EditorOption.mouseWheelScrollSensitivity */)
                || e.hasChanged(40 /* EditorOption.fastScrollSensitivity */)) {
                const options = this._context.configuration.options;
                const scrollbar = options.get(102 /* EditorOption.scrollbar */);
                const mouseWheelScrollSensitivity = options.get(74 /* EditorOption.mouseWheelScrollSensitivity */);
                const fastScrollSensitivity = options.get(40 /* EditorOption.fastScrollSensitivity */);
                const scrollPredominantAxis = options.get(105 /* EditorOption.scrollPredominantAxis */);
                const newOpts = {
                    vertical: scrollbar.vertical,
                    horizontal: scrollbar.horizontal,
                    verticalScrollbarSize: scrollbar.verticalScrollbarSize,
                    horizontalScrollbarSize: scrollbar.horizontalScrollbarSize,
                    scrollByPage: scrollbar.scrollByPage,
                    handleMouseWheel: scrollbar.handleMouseWheel,
                    mouseWheelScrollSensitivity: mouseWheelScrollSensitivity,
                    fastScrollSensitivity: fastScrollSensitivity,
                    scrollPredominantAxis: scrollPredominantAxis
                };
                this.a.updateOptions(newOpts);
            }
            if (e.hasChanged(143 /* EditorOption.layoutInfo */)) {
                this.c();
            }
            return true;
        }
        onScrollChanged(e) {
            return true;
        }
        onThemeChanged(e) {
            this.a.updateClassName('editor-scrollable' + ' ' + (0, themeService_1.$kv)(this._context.theme.type));
            return true;
        }
        // --- end event handlers
        prepareRender(ctx) {
            // Nothing to do
        }
        render(ctx) {
            this.a.renderNow();
        }
    }
    exports.$rX = $rX;
});
//# sourceMappingURL=editorScrollbar.js.map