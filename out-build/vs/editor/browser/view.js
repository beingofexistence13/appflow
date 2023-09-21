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
define(["require", "exports", "vs/base/browser/dom", "vs/editor/common/core/selection", "vs/editor/common/core/range", "vs/base/browser/fastDomNode", "vs/base/common/errors", "vs/editor/browser/controller/pointerHandler", "vs/editor/browser/controller/textAreaHandler", "vs/editor/browser/view/viewController", "vs/editor/browser/view/viewUserInputEvents", "vs/editor/browser/view/viewOverlays", "vs/editor/browser/view/viewPart", "vs/editor/browser/viewParts/contentWidgets/contentWidgets", "vs/editor/browser/viewParts/currentLineHighlight/currentLineHighlight", "vs/editor/browser/viewParts/decorations/decorations", "vs/editor/browser/viewParts/editorScrollbar/editorScrollbar", "vs/editor/browser/viewParts/indentGuides/indentGuides", "vs/editor/browser/viewParts/lineNumbers/lineNumbers", "vs/editor/browser/viewParts/lines/viewLines", "vs/editor/browser/viewParts/linesDecorations/linesDecorations", "vs/editor/browser/viewParts/margin/margin", "vs/editor/browser/viewParts/marginDecorations/marginDecorations", "vs/editor/browser/viewParts/minimap/minimap", "vs/editor/browser/viewParts/overlayWidgets/overlayWidgets", "vs/editor/browser/viewParts/overviewRuler/decorationsOverviewRuler", "vs/editor/browser/viewParts/overviewRuler/overviewRuler", "vs/editor/browser/viewParts/rulers/rulers", "vs/editor/browser/viewParts/scrollDecoration/scrollDecoration", "vs/editor/browser/viewParts/selections/selections", "vs/editor/browser/viewParts/viewCursors/viewCursors", "vs/editor/browser/viewParts/viewZones/viewZones", "vs/editor/common/core/position", "vs/editor/browser/view/renderingContext", "vs/editor/common/viewModel/viewContext", "vs/editor/common/viewLayout/viewLinesViewportData", "vs/editor/common/viewEventHandler", "vs/platform/theme/common/themeService", "vs/editor/browser/controller/mouseTarget", "vs/editor/browser/viewParts/blockDecorations/blockDecorations", "vs/base/browser/performance", "vs/editor/browser/viewParts/whitespace/whitespace", "vs/editor/browser/viewParts/glyphMargin/glyphMargin", "vs/editor/common/model", "vs/platform/instantiation/common/instantiation"], function (require, exports, dom, selection_1, range_1, fastDomNode_1, errors_1, pointerHandler_1, textAreaHandler_1, viewController_1, viewUserInputEvents_1, viewOverlays_1, viewPart_1, contentWidgets_1, currentLineHighlight_1, decorations_1, editorScrollbar_1, indentGuides_1, lineNumbers_1, viewLines_1, linesDecorations_1, margin_1, marginDecorations_1, minimap_1, overlayWidgets_1, decorationsOverviewRuler_1, overviewRuler_1, rulers_1, scrollDecoration_1, selections_1, viewCursors_1, viewZones_1, position_1, renderingContext_1, viewContext_1, viewLinesViewportData_1, viewEventHandler_1, themeService_1, mouseTarget_1, blockDecorations_1, performance_1, whitespace_1, glyphMargin_1, model_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$TX = void 0;
    let $TX = class $TX extends viewEventHandler_1.$9U {
        constructor(commandDelegate, configuration, colorTheme, model, userInputEvents, overflowWidgetsDomNode, H) {
            super();
            this.H = H;
            // Actual mutable state
            this.F = false;
            this.j = [new selection_1.$ms(1, 1, 1, 1)];
            this.G = null;
            const viewController = new viewController_1.$kW(configuration, model, userInputEvents, commandDelegate);
            // The view context is passed on to most classes (basically to reduce param. counts in ctors)
            this.g = new viewContext_1.$EW(configuration, colorTheme, model);
            // Ensure the view is the first event handler in order to update the layout
            this.g.addEventHandler(this);
            this.w = [];
            // Keyboard handler
            this.y = this.H.createInstance(textAreaHandler_1.$hX, this.g, viewController, this.M());
            this.w.push(this.y);
            // These two dom nodes must be constructed up front, since references are needed in the layout provider (scrolling & co.)
            this.C = (0, fastDomNode_1.$GP)(document.createElement('div'));
            this.C.setClassName('lines-content' + ' monaco-editor-background');
            this.C.setPosition('absolute');
            this.domNode = (0, fastDomNode_1.$GP)(document.createElement('div'));
            this.domNode.setClassName(this.O());
            // Set role 'code' for better screen reader support https://github.com/microsoft/vscode/issues/93438
            this.domNode.setAttribute('role', 'code');
            this.D = (0, fastDomNode_1.$GP)(document.createElement('div'));
            viewPart_1.$GW.write(this.D, 3 /* PartFingerprint.OverflowGuard */);
            this.D.setClassName('overflow-guard');
            this.c = new editorScrollbar_1.$rX(this.g, this.C, this.domNode, this.D);
            this.w.push(this.c);
            // View Lines
            this.m = new viewLines_1.$tX(this.g, this.C);
            // View Zones
            this.n = new viewZones_1.$QX(this.g);
            this.w.push(this.n);
            // Decorations overview ruler
            const decorationsOverviewRuler = new decorationsOverviewRuler_1.$KX(this.g);
            this.w.push(decorationsOverviewRuler);
            const scrollDecoration = new scrollDecoration_1.$NX(this.g);
            this.w.push(scrollDecoration);
            const contentViewOverlays = new viewOverlays_1.$kX(this.g);
            this.w.push(contentViewOverlays);
            contentViewOverlays.addDynamicOverlay(new currentLineHighlight_1.$oX(this.g));
            contentViewOverlays.addDynamicOverlay(new selections_1.$OX(this.g));
            contentViewOverlays.addDynamicOverlay(new indentGuides_1.$sX(this.g));
            contentViewOverlays.addDynamicOverlay(new decorations_1.$qX(this.g));
            contentViewOverlays.addDynamicOverlay(new whitespace_1.$SX(this.g));
            const marginViewOverlays = new viewOverlays_1.$lX(this.g);
            this.w.push(marginViewOverlays);
            marginViewOverlays.addDynamicOverlay(new currentLineHighlight_1.$pX(this.g));
            marginViewOverlays.addDynamicOverlay(new marginDecorations_1.$AX(this.g));
            marginViewOverlays.addDynamicOverlay(new linesDecorations_1.$zX(this.g));
            marginViewOverlays.addDynamicOverlay(new lineNumbers_1.$fX(this.g));
            // Glyph margin widgets
            this.t = new glyphMargin_1.$yX(this.g);
            this.w.push(this.t);
            const margin = new margin_1.$gX(this.g);
            margin.getDomNode().appendChild(this.n.marginDomNode);
            margin.getDomNode().appendChild(marginViewOverlays.getDomNode());
            margin.getDomNode().appendChild(this.t.domNode);
            this.w.push(margin);
            // Content widgets
            this.r = new contentWidgets_1.$mX(this.g, this.domNode);
            this.w.push(this.r);
            this.u = new viewCursors_1.$PX(this.g);
            this.w.push(this.u);
            // Overlay widgets
            this.s = new overlayWidgets_1.$JX(this.g);
            this.w.push(this.s);
            const rulers = new rulers_1.$MX(this.g);
            this.w.push(rulers);
            const blockOutline = new blockDecorations_1.$RX(this.g);
            this.w.push(blockOutline);
            const minimap = new minimap_1.$IX(this.g);
            this.w.push(minimap);
            // -------------- Wire dom nodes up
            if (decorationsOverviewRuler) {
                const overviewRulerData = this.c.getOverviewRulerLayoutInfo();
                overviewRulerData.parent.insertBefore(decorationsOverviewRuler.getDomNode(), overviewRulerData.insertBefore);
            }
            this.C.appendChild(contentViewOverlays.getDomNode());
            this.C.appendChild(rulers.domNode);
            this.C.appendChild(this.n.domNode);
            this.C.appendChild(this.m.getDomNode());
            this.C.appendChild(this.r.domNode);
            this.C.appendChild(this.u.getDomNode());
            this.D.appendChild(margin.getDomNode());
            this.D.appendChild(this.c.getDomNode());
            this.D.appendChild(scrollDecoration.getDomNode());
            this.D.appendChild(this.y.textArea);
            this.D.appendChild(this.y.textAreaCover);
            this.D.appendChild(this.s.getDomNode());
            this.D.appendChild(minimap.getDomNode());
            this.D.appendChild(blockOutline.domNode);
            this.domNode.appendChild(this.D);
            if (overflowWidgetsDomNode) {
                overflowWidgetsDomNode.appendChild(this.r.overflowingContentWidgetsDomNode.domNode);
            }
            else {
                this.domNode.appendChild(this.r.overflowingContentWidgetsDomNode);
            }
            this.N();
            // Pointer handler
            this.z = this.B(new pointerHandler_1.$dX(this.g, viewController, this.L()));
        }
        I() {
            if (this.F) {
                this.F = false;
                this.g.configuration.setGlyphMarginDecorationLaneCount(this.J());
            }
            performance_1.inputLatency.onRenderStart();
            this.R();
        }
        J() {
            const model = this.g.viewModel.model;
            let glyphs = [];
            // Add all margin decorations
            glyphs = glyphs.concat(model.getAllMarginDecorations().map((decoration) => {
                const lane = decoration.options.glyphMargin?.position ?? model_1.GlyphMarginLane.Left;
                return { range: decoration.range, lane };
            }));
            // Add all glyph margin widgets
            glyphs = glyphs.concat(this.t.getWidgets().map((widget) => {
                const range = model.validateRange(widget.preference.range);
                return { range, lane: widget.preference.lane };
            }));
            // Sorted by their start position
            glyphs.sort((a, b) => range_1.$ks.compareRangesUsingStarts(a.range, b.range));
            let leftDecRange = null;
            let rightDecRange = null;
            for (const decoration of glyphs) {
                if (decoration.lane === model_1.GlyphMarginLane.Left && (!leftDecRange || range_1.$ks.compareRangesUsingEnds(leftDecRange, decoration.range) < 0)) {
                    // assign only if the range of `decoration` ends after, which means it has a higher chance to overlap with the other lane
                    leftDecRange = decoration.range;
                }
                if (decoration.lane === model_1.GlyphMarginLane.Right && (!rightDecRange || range_1.$ks.compareRangesUsingEnds(rightDecRange, decoration.range) < 0)) {
                    // assign only if the range of `decoration` ends after, which means it has a higher chance to overlap with the other lane
                    rightDecRange = decoration.range;
                }
                if (leftDecRange && rightDecRange) {
                    if (leftDecRange.endLineNumber < rightDecRange.startLineNumber) {
                        // there's no chance for `leftDecRange` to ever intersect something going further
                        leftDecRange = null;
                        continue;
                    }
                    if (rightDecRange.endLineNumber < leftDecRange.startLineNumber) {
                        // there's no chance for `rightDecRange` to ever intersect something going further
                        rightDecRange = null;
                        continue;
                    }
                    // leftDecRange and rightDecRange are intersecting or touching => we need two lanes
                    return 2;
                }
            }
            return 1;
        }
        L() {
            return {
                viewDomNode: this.domNode.domNode,
                linesContentDomNode: this.C.domNode,
                viewLinesDomNode: this.m.getDomNode().domNode,
                focusTextArea: () => {
                    this.focus();
                },
                dispatchTextAreaEvent: (event) => {
                    this.y.textArea.domNode.dispatchEvent(event);
                },
                getLastRenderData: () => {
                    const lastViewCursorsRenderData = this.u.getLastRenderData() || [];
                    const lastTextareaPosition = this.y.getLastRenderData();
                    return new mouseTarget_1.$2W(lastViewCursorsRenderData, lastTextareaPosition);
                },
                renderNow: () => {
                    this.render(true, false);
                },
                shouldSuppressMouseDownOnViewZone: (viewZoneId) => {
                    return this.n.shouldSuppressMouseDownOnViewZone(viewZoneId);
                },
                shouldSuppressMouseDownOnWidget: (widgetId) => {
                    return this.r.shouldSuppressMouseDownOnWidget(widgetId);
                },
                getPositionFromDOMInfo: (spanNode, offset) => {
                    this.I();
                    return this.m.getPositionFromDOMInfo(spanNode, offset);
                },
                visibleRangeForPosition: (lineNumber, column) => {
                    this.I();
                    return this.m.visibleRangeForPosition(new position_1.$js(lineNumber, column));
                },
                getLineWidth: (lineNumber) => {
                    this.I();
                    return this.m.getLineWidth(lineNumber);
                }
            };
        }
        M() {
            return {
                visibleRangeForPosition: (position) => {
                    this.I();
                    return this.m.visibleRangeForPosition(position);
                }
            };
        }
        N() {
            const options = this.g.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this.domNode.setWidth(layoutInfo.width);
            this.domNode.setHeight(layoutInfo.height);
            this.D.setWidth(layoutInfo.width);
            this.D.setHeight(layoutInfo.height);
            this.C.setWidth(1000000);
            this.C.setHeight(1000000);
        }
        O() {
            const focused = this.y.isFocused() ? ' focused' : '';
            return this.g.configuration.options.get(140 /* EditorOption.editorClassName */) + ' ' + (0, themeService_1.$kv)(this.g.theme.type) + focused;
        }
        // --- begin event handlers
        handleEvents(events) {
            super.handleEvents(events);
            this.P();
        }
        onConfigurationChanged(e) {
            this.domNode.setClassName(this.O());
            this.N();
            return false;
        }
        onCursorStateChanged(e) {
            this.j = e.selections;
            return false;
        }
        onDecorationsChanged(e) {
            if (e.affectsGlyphMargin) {
                this.F = true;
            }
            return false;
        }
        onFocusChanged(e) {
            this.domNode.setClassName(this.O());
            return false;
        }
        onThemeChanged(e) {
            this.g.theme.update(e.theme);
            this.domNode.setClassName(this.O());
            return false;
        }
        // --- end event handlers
        dispose() {
            if (this.G !== null) {
                this.G.dispose();
                this.G = null;
            }
            this.r.overflowingContentWidgetsDomNode.domNode.remove();
            this.g.removeEventHandler(this);
            this.m.dispose();
            // Destroy view parts
            for (const viewPart of this.w) {
                viewPart.dispose();
            }
            super.dispose();
        }
        P() {
            if (this.G === null) {
                this.G = dom.$uO(this.Q.bind(this), 100);
            }
        }
        Q() {
            this.G = null;
            this.I();
        }
        R() {
            safeInvokeNoArg(() => this.U());
        }
        S() {
            const result = [];
            let resultLen = 0;
            for (const viewPart of this.w) {
                if (viewPart.shouldRender()) {
                    result[resultLen++] = viewPart;
                }
            }
            return result;
        }
        U() {
            if (!dom.$mO(this.domNode.domNode)) {
                return;
            }
            let viewPartsToRender = this.S();
            if (!this.m.shouldRender() && viewPartsToRender.length === 0) {
                // Nothing to render
                return;
            }
            const partialViewportData = this.g.viewLayout.getLinesViewportData();
            this.g.viewModel.setViewport(partialViewportData.startLineNumber, partialViewportData.endLineNumber, partialViewportData.centeredLineNumber);
            const viewportData = new viewLinesViewportData_1.$wW(this.j, partialViewportData, this.g.viewLayout.getWhitespaceViewportData(), this.g.viewModel);
            if (this.r.shouldRender()) {
                // Give the content widgets a chance to set their max width before a possible synchronous layout
                this.r.onBeforeRender(viewportData);
            }
            if (this.m.shouldRender()) {
                this.m.renderText(viewportData);
                this.m.onDidRender();
                // Rendering of viewLines might cause scroll events to occur, so collect view parts to render again
                viewPartsToRender = this.S();
            }
            const renderingContext = new renderingContext_1.$yW(this.g.viewLayout, viewportData, this.m);
            // Render the rest of the parts
            for (const viewPart of viewPartsToRender) {
                viewPart.prepareRender(renderingContext);
            }
            for (const viewPart of viewPartsToRender) {
                viewPart.render(renderingContext);
                viewPart.onDidRender();
            }
        }
        // --- BEGIN CodeEditor helpers
        delegateVerticalScrollbarPointerDown(browserEvent) {
            this.c.delegateVerticalScrollbarPointerDown(browserEvent);
        }
        delegateScrollFromMouseWheelEvent(browserEvent) {
            this.c.delegateScrollFromMouseWheelEvent(browserEvent);
        }
        restoreState(scrollPosition) {
            this.g.viewModel.viewLayout.setScrollPosition({
                scrollTop: scrollPosition.scrollTop,
                scrollLeft: scrollPosition.scrollLeft
            }, 1 /* ScrollType.Immediate */);
            this.g.viewModel.visibleLinesStabilized();
        }
        getOffsetForColumn(modelLineNumber, modelColumn) {
            const modelPosition = this.g.viewModel.model.validatePosition({
                lineNumber: modelLineNumber,
                column: modelColumn
            });
            const viewPosition = this.g.viewModel.coordinatesConverter.convertModelPositionToViewPosition(modelPosition);
            this.I();
            const visibleRange = this.m.visibleRangeForPosition(new position_1.$js(viewPosition.lineNumber, viewPosition.column));
            if (!visibleRange) {
                return -1;
            }
            return visibleRange.left;
        }
        getTargetAtClientPoint(clientX, clientY) {
            const mouseTarget = this.z.getTargetAtClientPoint(clientX, clientY);
            if (!mouseTarget) {
                return null;
            }
            return viewUserInputEvents_1.$jW.convertViewToModelMouseTarget(mouseTarget, this.g.viewModel.coordinatesConverter);
        }
        createOverviewRuler(cssClassName) {
            return new overviewRuler_1.$LX(this.g, cssClassName);
        }
        change(callback) {
            this.n.changeViewZones(callback);
            this.P();
        }
        render(now, everything) {
            if (everything) {
                // Force everything to render...
                this.m.forceShouldRender();
                for (const viewPart of this.w) {
                    viewPart.forceShouldRender();
                }
            }
            if (now) {
                this.I();
            }
            else {
                this.P();
            }
        }
        writeScreenReaderContent(reason) {
            this.y.writeScreenReaderContent(reason);
        }
        focus() {
            this.y.focusTextArea();
        }
        isFocused() {
            return this.y.isFocused();
        }
        refreshFocusState() {
            this.y.refreshFocusState();
        }
        setAriaOptions(options) {
            this.y.setAriaOptions(options);
        }
        addContentWidget(widgetData) {
            this.r.addWidget(widgetData.widget);
            this.layoutContentWidget(widgetData);
            this.P();
        }
        layoutContentWidget(widgetData) {
            this.r.setWidgetPosition(widgetData.widget, widgetData.position?.position ?? null, widgetData.position?.secondaryPosition ?? null, widgetData.position?.preference ?? null, widgetData.position?.positionAffinity ?? null);
            this.P();
        }
        removeContentWidget(widgetData) {
            this.r.removeWidget(widgetData.widget);
            this.P();
        }
        addOverlayWidget(widgetData) {
            this.s.addWidget(widgetData.widget);
            this.layoutOverlayWidget(widgetData);
            this.P();
        }
        layoutOverlayWidget(widgetData) {
            const newPreference = widgetData.position ? widgetData.position.preference : null;
            const shouldRender = this.s.setWidgetPosition(widgetData.widget, newPreference);
            if (shouldRender) {
                this.P();
            }
        }
        removeOverlayWidget(widgetData) {
            this.s.removeWidget(widgetData.widget);
            this.P();
        }
        addGlyphMarginWidget(widgetData) {
            this.t.addWidget(widgetData.widget);
            this.F = true;
            this.P();
        }
        layoutGlyphMarginWidget(widgetData) {
            const newPreference = widgetData.position;
            const shouldRender = this.t.setWidgetPosition(widgetData.widget, newPreference);
            if (shouldRender) {
                this.F = true;
                this.P();
            }
        }
        removeGlyphMarginWidget(widgetData) {
            this.t.removeWidget(widgetData.widget);
            this.F = true;
            this.P();
        }
    };
    exports.$TX = $TX;
    exports.$TX = $TX = __decorate([
        __param(6, instantiation_1.$Ah)
    ], $TX);
    function safeInvokeNoArg(func) {
        try {
            return func();
        }
        catch (e) {
            (0, errors_1.$Y)(e);
        }
    }
});
//# sourceMappingURL=view.js.map