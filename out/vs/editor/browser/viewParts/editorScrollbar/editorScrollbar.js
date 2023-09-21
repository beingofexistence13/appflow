/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/fastDomNode", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/editor/browser/view/viewPart", "vs/platform/theme/common/themeService"], function (require, exports, dom, fastDomNode_1, scrollableElement_1, viewPart_1, themeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditorScrollbar = void 0;
    class EditorScrollbar extends viewPart_1.ViewPart {
        constructor(context, linesContent, viewDomNode, overflowGuardDomNode) {
            super(context);
            const options = this._context.configuration.options;
            const scrollbar = options.get(102 /* EditorOption.scrollbar */);
            const mouseWheelScrollSensitivity = options.get(74 /* EditorOption.mouseWheelScrollSensitivity */);
            const fastScrollSensitivity = options.get(40 /* EditorOption.fastScrollSensitivity */);
            const scrollPredominantAxis = options.get(105 /* EditorOption.scrollPredominantAxis */);
            const scrollbarOptions = {
                listenOnDomNode: viewDomNode.domNode,
                className: 'editor-scrollable' + ' ' + (0, themeService_1.getThemeTypeSelector)(context.theme.type),
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
            this.scrollbar = this._register(new scrollableElement_1.SmoothScrollableElement(linesContent.domNode, scrollbarOptions, this._context.viewLayout.getScrollable()));
            viewPart_1.PartFingerprints.write(this.scrollbar.getDomNode(), 5 /* PartFingerprint.ScrollableElement */);
            this.scrollbarDomNode = (0, fastDomNode_1.createFastDomNode)(this.scrollbar.getDomNode());
            this.scrollbarDomNode.setPosition('absolute');
            this._setLayout();
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
            this._register(dom.addDisposableListener(viewDomNode.domNode, 'scroll', (e) => onBrowserDesperateReveal(viewDomNode.domNode, true, true)));
            this._register(dom.addDisposableListener(linesContent.domNode, 'scroll', (e) => onBrowserDesperateReveal(linesContent.domNode, true, false)));
            this._register(dom.addDisposableListener(overflowGuardDomNode.domNode, 'scroll', (e) => onBrowserDesperateReveal(overflowGuardDomNode.domNode, true, false)));
            this._register(dom.addDisposableListener(this.scrollbarDomNode.domNode, 'scroll', (e) => onBrowserDesperateReveal(this.scrollbarDomNode.domNode, true, false)));
        }
        dispose() {
            super.dispose();
        }
        _setLayout() {
            const options = this._context.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this.scrollbarDomNode.setLeft(layoutInfo.contentLeft);
            const minimap = options.get(72 /* EditorOption.minimap */);
            const side = minimap.side;
            if (side === 'right') {
                this.scrollbarDomNode.setWidth(layoutInfo.contentWidth + layoutInfo.minimap.minimapWidth);
            }
            else {
                this.scrollbarDomNode.setWidth(layoutInfo.contentWidth);
            }
            this.scrollbarDomNode.setHeight(layoutInfo.height);
        }
        getOverviewRulerLayoutInfo() {
            return this.scrollbar.getOverviewRulerLayoutInfo();
        }
        getDomNode() {
            return this.scrollbarDomNode;
        }
        delegateVerticalScrollbarPointerDown(browserEvent) {
            this.scrollbar.delegateVerticalScrollbarPointerDown(browserEvent);
        }
        delegateScrollFromMouseWheelEvent(browserEvent) {
            this.scrollbar.delegateScrollFromMouseWheelEvent(browserEvent);
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
                this.scrollbar.updateOptions(newOpts);
            }
            if (e.hasChanged(143 /* EditorOption.layoutInfo */)) {
                this._setLayout();
            }
            return true;
        }
        onScrollChanged(e) {
            return true;
        }
        onThemeChanged(e) {
            this.scrollbar.updateClassName('editor-scrollable' + ' ' + (0, themeService_1.getThemeTypeSelector)(this._context.theme.type));
            return true;
        }
        // --- end event handlers
        prepareRender(ctx) {
            // Nothing to do
        }
        render(ctx) {
            this.scrollbar.renderNow();
        }
    }
    exports.EditorScrollbar = EditorScrollbar;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yU2Nyb2xsYmFyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2Jyb3dzZXIvdmlld1BhcnRzL2VkaXRvclNjcm9sbGJhci9lZGl0b3JTY3JvbGxiYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBZWhHLE1BQWEsZUFBZ0IsU0FBUSxtQkFBUTtRQUs1QyxZQUNDLE9BQW9CLEVBQ3BCLFlBQXNDLEVBQ3RDLFdBQXFDLEVBQ3JDLG9CQUE4QztZQUU5QyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7WUFHZixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUM7WUFDcEQsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLEdBQUcsa0NBQXdCLENBQUM7WUFDdEQsTUFBTSwyQkFBMkIsR0FBRyxPQUFPLENBQUMsR0FBRyxtREFBMEMsQ0FBQztZQUMxRixNQUFNLHFCQUFxQixHQUFHLE9BQU8sQ0FBQyxHQUFHLDZDQUFvQyxDQUFDO1lBQzlFLE1BQU0scUJBQXFCLEdBQUcsT0FBTyxDQUFDLEdBQUcsOENBQW9DLENBQUM7WUFFOUUsTUFBTSxnQkFBZ0IsR0FBcUM7Z0JBQzFELGVBQWUsRUFBRSxXQUFXLENBQUMsT0FBTztnQkFDcEMsU0FBUyxFQUFFLG1CQUFtQixHQUFHLEdBQUcsR0FBRyxJQUFBLG1DQUFvQixFQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO2dCQUMvRSxVQUFVLEVBQUUsS0FBSztnQkFDakIsVUFBVSxFQUFFLElBQUk7Z0JBRWhCLFFBQVEsRUFBRSxTQUFTLENBQUMsUUFBUTtnQkFDNUIsVUFBVSxFQUFFLFNBQVMsQ0FBQyxVQUFVO2dCQUNoQyxpQkFBaUIsRUFBRSxTQUFTLENBQUMsaUJBQWlCO2dCQUM5QyxtQkFBbUIsRUFBRSxTQUFTLENBQUMsbUJBQW1CO2dC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