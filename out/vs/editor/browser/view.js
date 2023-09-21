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
    exports.View = void 0;
    let View = class View extends viewEventHandler_1.ViewEventHandler {
        constructor(commandDelegate, configuration, colorTheme, model, userInputEvents, overflowWidgetsDomNode, _instantiationService) {
            super();
            this._instantiationService = _instantiationService;
            // Actual mutable state
            this._shouldRecomputeGlyphMarginLanes = false;
            this._selections = [new selection_1.Selection(1, 1, 1, 1)];
            this._renderAnimationFrame = null;
            const viewController = new viewController_1.ViewController(configuration, model, userInputEvents, commandDelegate);
            // The view context is passed on to most classes (basically to reduce param. counts in ctors)
            this._context = new viewContext_1.ViewContext(configuration, colorTheme, model);
            // Ensure the view is the first event handler in order to update the layout
            this._context.addEventHandler(this);
            this._viewParts = [];
            // Keyboard handler
            this._textAreaHandler = this._instantiationService.createInstance(textAreaHandler_1.TextAreaHandler, this._context, viewController, this._createTextAreaHandlerHelper());
            this._viewParts.push(this._textAreaHandler);
            // These two dom nodes must be constructed up front, since references are needed in the layout provider (scrolling & co.)
            this._linesContent = (0, fastDomNode_1.createFastDomNode)(document.createElement('div'));
            this._linesContent.setClassName('lines-content' + ' monaco-editor-background');
            this._linesContent.setPosition('absolute');
            this.domNode = (0, fastDomNode_1.createFastDomNode)(document.createElement('div'));
            this.domNode.setClassName(this._getEditorClassName());
            // Set role 'code' for better screen reader support https://github.com/microsoft/vscode/issues/93438
            this.domNode.setAttribute('role', 'code');
            this._overflowGuardContainer = (0, fastDomNode_1.createFastDomNode)(document.createElement('div'));
            viewPart_1.PartFingerprints.write(this._overflowGuardContainer, 3 /* PartFingerprint.OverflowGuard */);
            this._overflowGuardContainer.setClassName('overflow-guard');
            this._scrollbar = new editorScrollbar_1.EditorScrollbar(this._context, this._linesContent, this.domNode, this._overflowGuardContainer);
            this._viewParts.push(this._scrollbar);
            // View Lines
            this._viewLines = new viewLines_1.ViewLines(this._context, this._linesContent);
            // View Zones
            this._viewZones = new viewZones_1.ViewZones(this._context);
            this._viewParts.push(this._viewZones);
            // Decorations overview ruler
            const decorationsOverviewRuler = new decorationsOverviewRuler_1.DecorationsOverviewRuler(this._context);
            this._viewParts.push(decorationsOverviewRuler);
            const scrollDecoration = new scrollDecoration_1.ScrollDecorationViewPart(this._context);
            this._viewParts.push(scrollDecoration);
            const contentViewOverlays = new viewOverlays_1.ContentViewOverlays(this._context);
            this._viewParts.push(contentViewOverlays);
            contentViewOverlays.addDynamicOverlay(new currentLineHighlight_1.CurrentLineHighlightOverlay(this._context));
            contentViewOverlays.addDynamicOverlay(new selections_1.SelectionsOverlay(this._context));
            contentViewOverlays.addDynamicOverlay(new indentGuides_1.IndentGuidesOverlay(this._context));
            contentViewOverlays.addDynamicOverlay(new decorations_1.DecorationsOverlay(this._context));
            contentViewOverlays.addDynamicOverlay(new whitespace_1.WhitespaceOverlay(this._context));
            const marginViewOverlays = new viewOverlays_1.MarginViewOverlays(this._context);
            this._viewParts.push(marginViewOverlays);
            marginViewOverlays.addDynamicOverlay(new currentLineHighlight_1.CurrentLineMarginHighlightOverlay(this._context));
            marginViewOverlays.addDynamicOverlay(new marginDecorations_1.MarginViewLineDecorationsOverlay(this._context));
            marginViewOverlays.addDynamicOverlay(new linesDecorations_1.LinesDecorationsOverlay(this._context));
            marginViewOverlays.addDynamicOverlay(new lineNumbers_1.LineNumbersOverlay(this._context));
            // Glyph margin widgets
            this._glyphMarginWidgets = new glyphMargin_1.GlyphMarginWidgets(this._context);
            this._viewParts.push(this._glyphMarginWidgets);
            const margin = new margin_1.Margin(this._context);
            margin.getDomNode().appendChild(this._viewZones.marginDomNode);
            margin.getDomNode().appendChild(marginViewOverlays.getDomNode());
            margin.getDomNode().appendChild(this._glyphMarginWidgets.domNode);
            this._viewParts.push(margin);
            // Content widgets
            this._contentWidgets = new contentWidgets_1.ViewContentWidgets(this._context, this.domNode);
            this._viewParts.push(this._contentWidgets);
            this._viewCursors = new viewCursors_1.ViewCursors(this._context);
            this._viewParts.push(this._viewCursors);
            // Overlay widgets
            this._overlayWidgets = new overlayWidgets_1.ViewOverlayWidgets(this._context);
            this._viewParts.push(this._overlayWidgets);
            const rulers = new rulers_1.Rulers(this._context);
            this._viewParts.push(rulers);
            const blockOutline = new blockDecorations_1.BlockDecorations(this._context);
            this._viewParts.push(blockOutline);
            const minimap = new minimap_1.Minimap(this._context);
            this._viewParts.push(minimap);
            // -------------- Wire dom nodes up
            if (decorationsOverviewRuler) {
                const overviewRulerData = this._scrollbar.getOverviewRulerLayoutInfo();
                overviewRulerData.parent.insertBefore(decorationsOverviewRuler.getDomNode(), overviewRulerData.insertBefore);
            }
            this._linesContent.appendChild(contentViewOverlays.getDomNode());
            this._linesContent.appendChild(rulers.domNode);
            this._linesContent.appendChild(this._viewZones.domNode);
            this._linesContent.appendChild(this._viewLines.getDomNode());
            this._linesContent.appendChild(this._contentWidgets.domNode);
            this._linesContent.appendChild(this._viewCursors.getDomNode());
            this._overflowGuardContainer.appendChild(margin.getDomNode());
            this._overflowGuardContainer.appendChild(this._scrollbar.getDomNode());
            this._overflowGuardContainer.appendChild(scrollDecoration.getDomNode());
            this._overflowGuardContainer.appendChild(this._textAreaHandler.textArea);
            this._overflowGuardContainer.appendChild(this._textAreaHandler.textAreaCover);
            this._overflowGuardContainer.appendChild(this._overlayWidgets.getDomNode());
            this._overflowGuardContainer.appendChild(minimap.getDomNode());
            this._overflowGuardContainer.appendChild(blockOutline.domNode);
            this.domNode.appendChild(this._overflowGuardContainer);
            if (overflowWidgetsDomNode) {
                overflowWidgetsDomNode.appendChild(this._contentWidgets.overflowingContentWidgetsDomNode.domNode);
            }
            else {
                this.domNode.appendChild(this._contentWidgets.overflowingContentWidgetsDomNode);
            }
            this._applyLayout();
            // Pointer handler
            this._pointerHandler = this._register(new pointerHandler_1.PointerHandler(this._context, viewController, this._createPointerHandlerHelper()));
        }
        _flushAccumulatedAndRenderNow() {
            if (this._shouldRecomputeGlyphMarginLanes) {
                this._shouldRecomputeGlyphMarginLanes = false;
                this._context.configuration.setGlyphMarginDecorationLaneCount(this._computeGlyphMarginLaneCount());
            }
            performance_1.inputLatency.onRenderStart();
            this._renderNow();
        }
        _computeGlyphMarginLaneCount() {
            const model = this._context.viewModel.model;
            let glyphs = [];
            // Add all margin decorations
            glyphs = glyphs.concat(model.getAllMarginDecorations().map((decoration) => {
                const lane = decoration.options.glyphMargin?.position ?? model_1.GlyphMarginLane.Left;
                return { range: decoration.range, lane };
            }));
            // Add all glyph margin widgets
            glyphs = glyphs.concat(this._glyphMarginWidgets.getWidgets().map((widget) => {
                const range = model.validateRange(widget.preference.range);
                return { range, lane: widget.preference.lane };
            }));
            // Sorted by their start position
            glyphs.sort((a, b) => range_1.Range.compareRangesUsingStarts(a.range, b.range));
            let leftDecRange = null;
            let rightDecRange = null;
            for (const decoration of glyphs) {
                if (decoration.lane === model_1.GlyphMarginLane.Left && (!leftDecRange || range_1.Range.compareRangesUsingEnds(leftDecRange, decoration.range) < 0)) {
                    // assign only if the range of `decoration` ends after, which means it has a higher chance to overlap with the other lane
                    leftDecRange = decoration.range;
                }
                if (decoration.lane === model_1.GlyphMarginLane.Right && (!rightDecRange || range_1.Range.compareRangesUsingEnds(rightDecRange, decoration.range) < 0)) {
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
        _createPointerHandlerHelper() {
            return {
                viewDomNode: this.domNode.domNode,
                linesContentDomNode: this._linesContent.domNode,
                viewLinesDomNode: this._viewLines.getDomNode().domNode,
                focusTextArea: () => {
                    this.focus();
                },
                dispatchTextAreaEvent: (event) => {
                    this._textAreaHandler.textArea.domNode.dispatchEvent(event);
                },
                getLastRenderData: () => {
                    const lastViewCursorsRenderData = this._viewCursors.getLastRenderData() || [];
                    const lastTextareaPosition = this._textAreaHandler.getLastRenderData();
                    return new mouseTarget_1.PointerHandlerLastRenderData(lastViewCursorsRenderData, lastTextareaPosition);
                },
                renderNow: () => {
                    this.render(true, false);
                },
                shouldSuppressMouseDownOnViewZone: (viewZoneId) => {
                    return this._viewZones.shouldSuppressMouseDownOnViewZone(viewZoneId);
                },
                shouldSuppressMouseDownOnWidget: (widgetId) => {
                    return this._contentWidgets.shouldSuppressMouseDownOnWidget(widgetId);
                },
                getPositionFromDOMInfo: (spanNode, offset) => {
                    this._flushAccumulatedAndRenderNow();
                    return this._viewLines.getPositionFromDOMInfo(spanNode, offset);
                },
                visibleRangeForPosition: (lineNumber, column) => {
                    this._flushAccumulatedAndRenderNow();
                    return this._viewLines.visibleRangeForPosition(new position_1.Position(lineNumber, column));
                },
                getLineWidth: (lineNumber) => {
                    this._flushAccumulatedAndRenderNow();
                    return this._viewLines.getLineWidth(lineNumber);
                }
            };
        }
        _createTextAreaHandlerHelper() {
            return {
                visibleRangeForPosition: (position) => {
                    this._flushAccumulatedAndRenderNow();
                    return this._viewLines.visibleRangeForPosition(position);
                }
            };
        }
        _applyLayout() {
            const options = this._context.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this.domNode.setWidth(layoutInfo.width);
            this.domNode.setHeight(layoutInfo.height);
            this._overflowGuardContainer.setWidth(layoutInfo.width);
            this._overflowGuardContainer.setHeight(layoutInfo.height);
            this._linesContent.setWidth(1000000);
            this._linesContent.setHeight(1000000);
        }
        _getEditorClassName() {
            const focused = this._textAreaHandler.isFocused() ? ' focused' : '';
            return this._context.configuration.options.get(140 /* EditorOption.editorClassName */) + ' ' + (0, themeService_1.getThemeTypeSelector)(this._context.theme.type) + focused;
        }
        // --- begin event handlers
        handleEvents(events) {
            super.handleEvents(events);
            this._scheduleRender();
        }
        onConfigurationChanged(e) {
            this.domNode.setClassName(this._getEditorClassName());
            this._applyLayout();
            return false;
        }
        onCursorStateChanged(e) {
            this._selections = e.selections;
            return false;
        }
        onDecorationsChanged(e) {
            if (e.affectsGlyphMargin) {
                this._shouldRecomputeGlyphMarginLanes = true;
            }
            return false;
        }
        onFocusChanged(e) {
            this.domNode.setClassName(this._getEditorClassName());
            return false;
        }
        onThemeChanged(e) {
            this._context.theme.update(e.theme);
            this.domNode.setClassName(this._getEditorClassName());
            return false;
        }
        // --- end event handlers
        dispose() {
            if (this._renderAnimationFrame !== null) {
                this._renderAnimationFrame.dispose();
                this._renderAnimationFrame = null;
            }
            this._contentWidgets.overflowingContentWidgetsDomNode.domNode.remove();
            this._context.removeEventHandler(this);
            this._viewLines.dispose();
            // Destroy view parts
            for (const viewPart of this._viewParts) {
                viewPart.dispose();
            }
            super.dispose();
        }
        _scheduleRender() {
            if (this._renderAnimationFrame === null) {
                this._renderAnimationFrame = dom.runAtThisOrScheduleAtNextAnimationFrame(this._onRenderScheduled.bind(this), 100);
            }
        }
        _onRenderScheduled() {
            this._renderAnimationFrame = null;
            this._flushAccumulatedAndRenderNow();
        }
        _renderNow() {
            safeInvokeNoArg(() => this._actualRender());
        }
        _getViewPartsToRender() {
            const result = [];
            let resultLen = 0;
            for (const viewPart of this._viewParts) {
                if (viewPart.shouldRender()) {
                    result[resultLen++] = viewPart;
                }
            }
            return result;
        }
        _actualRender() {
            if (!dom.isInDOM(this.domNode.domNode)) {
                return;
            }
            let viewPartsToRender = this._getViewPartsToRender();
            if (!this._viewLines.shouldRender() && viewPartsToRender.length === 0) {
                // Nothing to render
                return;
            }
            const partialViewportData = this._context.viewLayout.getLinesViewportData();
            this._context.viewModel.setViewport(partialViewportData.startLineNumber, partialViewportData.endLineNumber, partialViewportData.centeredLineNumber);
            const viewportData = new viewLinesViewportData_1.ViewportData(this._selections, partialViewportData, this._context.viewLayout.getWhitespaceViewportData(), this._context.viewModel);
            if (this._contentWidgets.shouldRender()) {
                // Give the content widgets a chance to set their max width before a possible synchronous layout
                this._contentWidgets.onBeforeRender(viewportData);
            }
            if (this._viewLines.shouldRender()) {
                this._viewLines.renderText(viewportData);
                this._viewLines.onDidRender();
                // Rendering of viewLines might cause scroll events to occur, so collect view parts to render again
                viewPartsToRender = this._getViewPartsToRender();
            }
            const renderingContext = new renderingContext_1.RenderingContext(this._context.viewLayout, viewportData, this._viewLines);
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
            this._scrollbar.delegateVerticalScrollbarPointerDown(browserEvent);
        }
        delegateScrollFromMouseWheelEvent(browserEvent) {
            this._scrollbar.delegateScrollFromMouseWheelEvent(browserEvent);
        }
        restoreState(scrollPosition) {
            this._context.viewModel.viewLayout.setScrollPosition({
                scrollTop: scrollPosition.scrollTop,
                scrollLeft: scrollPosition.scrollLeft
            }, 1 /* ScrollType.Immediate */);
            this._context.viewModel.visibleLinesStabilized();
        }
        getOffsetForColumn(modelLineNumber, modelColumn) {
            const modelPosition = this._context.viewModel.model.validatePosition({
                lineNumber: modelLineNumber,
                column: modelColumn
            });
            const viewPosition = this._context.viewModel.coordinatesConverter.convertModelPositionToViewPosition(modelPosition);
            this._flushAccumulatedAndRenderNow();
            const visibleRange = this._viewLines.visibleRangeForPosition(new position_1.Position(viewPosition.lineNumber, viewPosition.column));
            if (!visibleRange) {
                return -1;
            }
            return visibleRange.left;
        }
        getTargetAtClientPoint(clientX, clientY) {
            const mouseTarget = this._pointerHandler.getTargetAtClientPoint(clientX, clientY);
            if (!mouseTarget) {
                return null;
            }
            return viewUserInputEvents_1.ViewUserInputEvents.convertViewToModelMouseTarget(mouseTarget, this._context.viewModel.coordinatesConverter);
        }
        createOverviewRuler(cssClassName) {
            return new overviewRuler_1.OverviewRuler(this._context, cssClassName);
        }
        change(callback) {
            this._viewZones.changeViewZones(callback);
            this._scheduleRender();
        }
        render(now, everything) {
            if (everything) {
                // Force everything to render...
                this._viewLines.forceShouldRender();
                for (const viewPart of this._viewParts) {
                    viewPart.forceShouldRender();
                }
            }
            if (now) {
                this._flushAccumulatedAndRenderNow();
            }
            else {
                this._scheduleRender();
            }
        }
        writeScreenReaderContent(reason) {
            this._textAreaHandler.writeScreenReaderContent(reason);
        }
        focus() {
            this._textAreaHandler.focusTextArea();
        }
        isFocused() {
            return this._textAreaHandler.isFocused();
        }
        refreshFocusState() {
            this._textAreaHandler.refreshFocusState();
        }
        setAriaOptions(options) {
            this._textAreaHandler.setAriaOptions(options);
        }
        addContentWidget(widgetData) {
            this._contentWidgets.addWidget(widgetData.widget);
            this.layoutContentWidget(widgetData);
            this._scheduleRender();
        }
        layoutContentWidget(widgetData) {
            this._contentWidgets.setWidgetPosition(widgetData.widget, widgetData.position?.position ?? null, widgetData.position?.secondaryPosition ?? null, widgetData.position?.preference ?? null, widgetData.position?.positionAffinity ?? null);
            this._scheduleRender();
        }
        removeContentWidget(widgetData) {
            this._contentWidgets.removeWidget(widgetData.widget);
            this._scheduleRender();
        }
        addOverlayWidget(widgetData) {
            this._overlayWidgets.addWidget(widgetData.widget);
            this.layoutOverlayWidget(widgetData);
            this._scheduleRender();
        }
        layoutOverlayWidget(widgetData) {
            const newPreference = widgetData.position ? widgetData.position.preference : null;
            const shouldRender = this._overlayWidgets.setWidgetPosition(widgetData.widget, newPreference);
            if (shouldRender) {
                this._scheduleRender();
            }
        }
        removeOverlayWidget(widgetData) {
            this._overlayWidgets.removeWidget(widgetData.widget);
            this._scheduleRender();
        }
        addGlyphMarginWidget(widgetData) {
            this._glyphMarginWidgets.addWidget(widgetData.widget);
            this._shouldRecomputeGlyphMarginLanes = true;
            this._scheduleRender();
        }
        layoutGlyphMarginWidget(widgetData) {
            const newPreference = widgetData.position;
            const shouldRender = this._glyphMarginWidgets.setWidgetPosition(widgetData.widget, newPreference);
            if (shouldRender) {
                this._shouldRecomputeGlyphMarginLanes = true;
                this._scheduleRender();
            }
        }
        removeGlyphMarginWidget(widgetData) {
            this._glyphMarginWidgets.removeWidget(widgetData.widget);
            this._shouldRecomputeGlyphMarginLanes = true;
            this._scheduleRender();
        }
    };
    exports.View = View;
    exports.View = View = __decorate([
        __param(6, instantiation_1.IInstantiationService)
    ], View);
    function safeInvokeNoArg(func) {
        try {
            return func();
        }
        catch (e) {
            (0, errors_1.onUnexpectedError)(e);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlldy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9icm93c2VyL3ZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBdUV6RixJQUFNLElBQUksR0FBVixNQUFNLElBQUssU0FBUSxtQ0FBZ0I7UUE2QnpDLFlBQ0MsZUFBaUMsRUFDakMsYUFBbUMsRUFDbkMsVUFBdUIsRUFDdkIsS0FBaUIsRUFDakIsZUFBb0MsRUFDcEMsc0JBQStDLEVBQ3hCLHFCQUE2RDtZQUVwRixLQUFLLEVBQUUsQ0FBQztZQUZnQywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBWHJGLHVCQUF1QjtZQUNmLHFDQUFnQyxHQUFZLEtBQUssQ0FBQztZQWF6RCxJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsSUFBSSxxQkFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0MsSUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQztZQUVsQyxNQUFNLGNBQWMsR0FBRyxJQUFJLCtCQUFjLENBQUMsYUFBYSxFQUFFLEtBQUssRUFBRSxlQUFlLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFFbEcsNkZBQTZGO1lBQzdGLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSx5QkFBVyxDQUFDLGFBQWEsRUFBRSxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFbEUsMkVBQTJFO1lBQzNFLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXBDLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO1lBRXJCLG1CQUFtQjtZQUNuQixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGNBQWMsQ0FBQyxpQ0FBZSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsY0FBYyxFQUFFLElBQUksQ0FBQyw0QkFBNEIsRUFBRSxDQUFDLENBQUM7WUFDdkosSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFFNUMseUhBQXlIO1lBQ3pILElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBQSwrQkFBaUIsRUFBQyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDdEUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsZUFBZSxHQUFHLDJCQUEyQixDQUFDLENBQUM7WUFDL0UsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7WUFFM0MsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFBLCtCQUFpQixFQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNoRSxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDO1lBQ3RELG9HQUFvRztZQUNwRyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFFMUMsSUFBSSxDQUFDLHVCQUF1QixHQUFHLElBQUEsK0JBQWlCLEVBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ2hGLDJCQUFnQixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsdUJBQXVCLHdDQUFnQyxDQUFDO1lBQ3BGLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUU1RCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksaUNBQWUsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQztZQUNySCxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFFdEMsYUFBYTtZQUNiLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxxQkFBUyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRW5FLGFBQWE7WUFDYixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUkscUJBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDL0MsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBRXRDLDZCQUE2QjtZQUM3QixNQUFNLHdCQUF3QixHQUFHLElBQUksbURBQXdCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzdFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUM7WUFHL0MsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLDJDQUF3QixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNyRSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBRXZDLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxrQ0FBbUIsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDbkUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUMxQyxtQkFBbUIsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLGtEQUEyQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ3RGLG1CQUFtQixDQUFDLGlCQUFpQixDQUFDLElBQUksOEJBQWlCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDNUUsbUJBQW1CLENBQUMsaUJBQWlCLENBQUMsSUFBSSxrQ0FBbUIsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUM5RSxtQkFBbUIsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLGdDQUFrQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQzdFLG1CQUFtQixDQUFDLGlCQUFpQixDQUFDLElBQUksOEJBQWlCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFFNUUsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLGlDQUFrQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNqRSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQ3pDLGtCQUFrQixDQUFDLGlCQUFpQixDQUFDLElBQUksd0RBQWlDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDM0Ysa0JBQWtCLENBQUMsaUJBQWlCLENBQUMsSUFBSSxvREFBZ0MsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUMxRixrQkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLDBDQUF1QixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ2pGLGtCQUFrQixDQUFDLGlCQUFpQixDQUFDLElBQUksZ0NBQWtCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFFNUUsdUJBQXVCO1lBQ3ZCLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLGdDQUFrQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNqRSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUUvQyxNQUFNLE1BQU0sR0FBRyxJQUFJLGVBQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDekMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQy9ELE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxXQUFXLENBQUMsa0JBQWtCLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztZQUNqRSxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNsRSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUU3QixrQkFBa0I7WUFDbEIsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLG1DQUFrQixDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzNFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUUzQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUkseUJBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDbkQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRXhDLGtCQUFrQjtZQUNsQixJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksbUNBQWtCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzdELElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUUzQyxNQUFNLE1BQU0sR0FBRyxJQUFJLGVBQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDekMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFN0IsTUFBTSxZQUFZLEdBQUcsSUFBSSxtQ0FBZ0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDekQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFbkMsTUFBTSxPQUFPLEdBQUcsSUFBSSxpQkFBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMzQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUU5QixtQ0FBbUM7WUFFbkMsSUFBSSx3QkFBd0IsRUFBRTtnQkFDN0IsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLDBCQUEwQixFQUFFLENBQUM7Z0JBQ3ZFLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsd0JBQXdCLENBQUMsVUFBVSxFQUFFLEVBQUUsaUJBQWlCLENBQUMsWUFBWSxDQUFDLENBQUM7YUFDN0c7WUFFRCxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO1lBQ2pFLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMvQyxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3hELElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztZQUM3RCxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzdELElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztZQUMvRCxJQUFJLENBQUMsdUJBQXVCLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO1lBQzlELElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsdUJBQXVCLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN6RSxJQUFJLENBQUMsdUJBQXVCLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUM5RSxJQUFJLENBQUMsdUJBQXVCLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztZQUM1RSxJQUFJLENBQUMsdUJBQXVCLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO1lBQy9ELElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQy9ELElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1lBRXZELElBQUksc0JBQXNCLEVBQUU7Z0JBQzNCLHNCQUFzQixDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLGdDQUFnQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQ2xHO2lCQUFNO2dCQUNOLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsZ0NBQWdDLENBQUMsQ0FBQzthQUNoRjtZQUVELElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUVwQixrQkFBa0I7WUFDbEIsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksK0JBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLGNBQWMsRUFBRSxJQUFJLENBQUMsMkJBQTJCLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDOUgsQ0FBQztRQUVPLDZCQUE2QjtZQUNwQyxJQUFJLElBQUksQ0FBQyxnQ0FBZ0MsRUFBRTtnQkFDMUMsSUFBSSxDQUFDLGdDQUFnQyxHQUFHLEtBQUssQ0FBQztnQkFDOUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsaUNBQWlDLENBQUMsSUFBSSxDQUFDLDRCQUE0QixFQUFFLENBQUMsQ0FBQzthQUNuRztZQUNELDBCQUFZLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDN0IsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ25CLENBQUM7UUFFTyw0QkFBNEI7WUFDbkMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO1lBRTVDLElBQUksTUFBTSxHQUFZLEVBQUUsQ0FBQztZQUV6Qiw2QkFBNkI7WUFDN0IsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLHVCQUF1QixFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsVUFBVSxFQUFFLEVBQUU7Z0JBQ3pFLE1BQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLFFBQVEsSUFBSSx1QkFBZSxDQUFDLElBQUksQ0FBQztnQkFDOUUsT0FBTyxFQUFFLEtBQUssRUFBRSxVQUFVLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDO1lBQzFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSiwrQkFBK0I7WUFDL0IsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFVBQVUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO2dCQUMzRSxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzNELE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDaEQsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLGlDQUFpQztZQUNqQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsYUFBSyxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFFeEUsSUFBSSxZQUFZLEdBQWlCLElBQUksQ0FBQztZQUN0QyxJQUFJLGFBQWEsR0FBaUIsSUFBSSxDQUFDO1lBQ3ZDLEtBQUssTUFBTSxVQUFVLElBQUksTUFBTSxFQUFFO2dCQUVoQyxJQUFJLFVBQVUsQ0FBQyxJQUFJLEtBQUssdUJBQWUsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLFlBQVksSUFBSSxhQUFLLENBQUMsc0JBQXNCLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtvQkFDcEkseUhBQXlIO29CQUN6SCxZQUFZLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQztpQkFDaEM7Z0JBRUQsSUFBSSxVQUFVLENBQUMsSUFBSSxLQUFLLHVCQUFlLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxhQUFhLElBQUksYUFBSyxDQUFDLHNCQUFzQixDQUFDLGFBQWEsRUFBRSxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7b0JBQ3ZJLHlIQUF5SDtvQkFDekgsYUFBYSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUM7aUJBQ2pDO2dCQUVELElBQUksWUFBWSxJQUFJLGFBQWEsRUFBRTtvQkFFbEMsSUFBSSxZQUFZLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQyxlQUFlLEVBQUU7d0JBQy9ELGlGQUFpRjt3QkFDakYsWUFBWSxHQUFHLElBQUksQ0FBQzt3QkFDcEIsU0FBUztxQkFDVDtvQkFFRCxJQUFJLGFBQWEsQ0FBQyxhQUFhLEdBQUcsWUFBWSxDQUFDLGVBQWUsRUFBRTt3QkFDL0Qsa0ZBQWtGO3dCQUNsRixhQUFhLEdBQUcsSUFBSSxDQUFDO3dCQUNyQixTQUFTO3FCQUNUO29CQUVELG1GQUFtRjtvQkFDbkYsT0FBTyxDQUFDLENBQUM7aUJBQ1Q7YUFDRDtZQUVELE9BQU8sQ0FBQyxDQUFDO1FBQ1YsQ0FBQztRQUVPLDJCQUEyQjtZQUNsQyxPQUFPO2dCQUNOLFdBQVcsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU87Z0JBQ2pDLG1CQUFtQixFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTztnQkFDL0MsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxPQUFPO2dCQUV0RCxhQUFhLEVBQUUsR0FBRyxFQUFFO29CQUNuQixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ2QsQ0FBQztnQkFFRCxxQkFBcUIsRUFBRSxDQUFDLEtBQWtCLEVBQUUsRUFBRTtvQkFDN0MsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUM3RCxDQUFDO2dCQUVELGlCQUFpQixFQUFFLEdBQWlDLEVBQUU7b0JBQ3JELE1BQU0seUJBQXlCLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLEVBQUUsQ0FBQztvQkFDOUUsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztvQkFDdkUsT0FBTyxJQUFJLDBDQUE0QixDQUFDLHlCQUF5QixFQUFFLG9CQUFvQixDQUFDLENBQUM7Z0JBQzFGLENBQUM7Z0JBQ0QsU0FBUyxFQUFFLEdBQVMsRUFBRTtvQkFDckIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQzFCLENBQUM7Z0JBQ0QsaUNBQWlDLEVBQUUsQ0FBQyxVQUFrQixFQUFFLEVBQUU7b0JBQ3pELE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxpQ0FBaUMsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDdEUsQ0FBQztnQkFDRCwrQkFBK0IsRUFBRSxDQUFDLFFBQWdCLEVBQUUsRUFBRTtvQkFDckQsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLCtCQUErQixDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUN2RSxDQUFDO2dCQUNELHNCQUFzQixFQUFFLENBQUMsUUFBcUIsRUFBRSxNQUFjLEVBQUUsRUFBRTtvQkFDakUsSUFBSSxDQUFDLDZCQUE2QixFQUFFLENBQUM7b0JBQ3JDLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQ2pFLENBQUM7Z0JBRUQsdUJBQXVCLEVBQUUsQ0FBQyxVQUFrQixFQUFFLE1BQWMsRUFBRSxFQUFFO29CQUMvRCxJQUFJLENBQUMsNkJBQTZCLEVBQUUsQ0FBQztvQkFDckMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLHVCQUF1QixDQUFDLElBQUksbUJBQVEsQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDbEYsQ0FBQztnQkFFRCxZQUFZLEVBQUUsQ0FBQyxVQUFrQixFQUFFLEVBQUU7b0JBQ3BDLElBQUksQ0FBQyw2QkFBNkIsRUFBRSxDQUFDO29CQUNyQyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUNqRCxDQUFDO2FBQ0QsQ0FBQztRQUNILENBQUM7UUFFTyw0QkFBNEI7WUFDbkMsT0FBTztnQkFDTix1QkFBdUIsRUFBRSxDQUFDLFFBQWtCLEVBQUUsRUFBRTtvQkFDL0MsSUFBSSxDQUFDLDZCQUE2QixFQUFFLENBQUM7b0JBQ3JDLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDMUQsQ0FBQzthQUNELENBQUM7UUFDSCxDQUFDO1FBRU8sWUFBWTtZQUNuQixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUM7WUFDcEQsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLEdBQUcsbUNBQXlCLENBQUM7WUFFeEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUUxQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN4RCxJQUFJLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUUxRCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNyQyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN2QyxDQUFDO1FBRU8sbUJBQW1CO1lBQzFCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDcEUsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsR0FBRyx3Q0FBOEIsR0FBRyxHQUFHLEdBQUcsSUFBQSxtQ0FBb0IsRUFBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUM7UUFDL0ksQ0FBQztRQUVELDJCQUEyQjtRQUNYLFlBQVksQ0FBQyxNQUE4QjtZQUMxRCxLQUFLLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzNCLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUN4QixDQUFDO1FBQ2Usc0JBQXNCLENBQUMsQ0FBMkM7WUFDakYsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQztZQUN0RCxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDcEIsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBQ2Usb0JBQW9CLENBQUMsQ0FBeUM7WUFDN0UsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDO1lBQ2hDLE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUNlLG9CQUFvQixDQUFDLENBQXlDO1lBQzdFLElBQUksQ0FBQyxDQUFDLGtCQUFrQixFQUFFO2dCQUN6QixJQUFJLENBQUMsZ0NBQWdDLEdBQUcsSUFBSSxDQUFDO2FBQzdDO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBQ2UsY0FBYyxDQUFDLENBQW1DO1lBQ2pFLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUM7WUFDdEQsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBQ2UsY0FBYyxDQUFDLENBQW1DO1lBQ2pFLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDcEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQztZQUN0RCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFRCx5QkFBeUI7UUFFVCxPQUFPO1lBQ3RCLElBQUksSUFBSSxDQUFDLHFCQUFxQixLQUFLLElBQUksRUFBRTtnQkFDeEMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNyQyxJQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDO2FBQ2xDO1lBRUQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxnQ0FBZ0MsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7WUFFdkUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUV2QyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBRTFCLHFCQUFxQjtZQUNyQixLQUFLLE1BQU0sUUFBUSxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQ3ZDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUNuQjtZQUVELEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNqQixDQUFDO1FBRU8sZUFBZTtZQUN0QixJQUFJLElBQUksQ0FBQyxxQkFBcUIsS0FBSyxJQUFJLEVBQUU7Z0JBQ3hDLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxHQUFHLENBQUMsdUNBQXVDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQzthQUNsSDtRQUNGLENBQUM7UUFFTyxrQkFBa0I7WUFDekIsSUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQztZQUNsQyxJQUFJLENBQUMsNkJBQTZCLEVBQUUsQ0FBQztRQUN0QyxDQUFDO1FBRU8sVUFBVTtZQUNqQixlQUFlLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7UUFDN0MsQ0FBQztRQUVPLHFCQUFxQjtZQUM1QixNQUFNLE1BQU0sR0FBZSxFQUFFLENBQUM7WUFDOUIsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO1lBQ2xCLEtBQUssTUFBTSxRQUFRLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDdkMsSUFBSSxRQUFRLENBQUMsWUFBWSxFQUFFLEVBQUU7b0JBQzVCLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQztpQkFDL0I7YUFDRDtZQUNELE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQztRQUVPLGFBQWE7WUFDcEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDdkMsT0FBTzthQUNQO1lBRUQsSUFBSSxpQkFBaUIsR0FBRyxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUVyRCxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUUsSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN0RSxvQkFBb0I7Z0JBQ3BCLE9BQU87YUFDUDtZQUVELE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUM1RSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsbUJBQW1CLENBQUMsZUFBZSxFQUFFLG1CQUFtQixDQUFDLGFBQWEsRUFBRSxtQkFBbUIsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBRXBKLE1BQU0sWUFBWSxHQUFHLElBQUksb0NBQVksQ0FDcEMsSUFBSSxDQUFDLFdBQVcsRUFDaEIsbUJBQW1CLEVBQ25CLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLHlCQUF5QixFQUFFLEVBQ3BELElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUN2QixDQUFDO1lBRUYsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxFQUFFO2dCQUN4QyxnR0FBZ0c7Z0JBQ2hHLElBQUksQ0FBQyxlQUFlLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxDQUFDO2FBQ2xEO1lBRUQsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxFQUFFO2dCQUNuQyxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDekMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFFOUIsbUdBQW1HO2dCQUNuRyxpQkFBaUIsR0FBRyxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQzthQUNqRDtZQUVELE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxtQ0FBZ0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxZQUFZLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBRXZHLCtCQUErQjtZQUMvQixLQUFLLE1BQU0sUUFBUSxJQUFJLGlCQUFpQixFQUFFO2dCQUN6QyxRQUFRLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLENBQUM7YUFDekM7WUFFRCxLQUFLLE1BQU0sUUFBUSxJQUFJLGlCQUFpQixFQUFFO2dCQUN6QyxRQUFRLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBQ2xDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQzthQUN2QjtRQUNGLENBQUM7UUFFRCwrQkFBK0I7UUFFeEIsb0NBQW9DLENBQUMsWUFBMEI7WUFDckUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxvQ0FBb0MsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNwRSxDQUFDO1FBRU0saUNBQWlDLENBQUMsWUFBOEI7WUFDdEUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxpQ0FBaUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNqRSxDQUFDO1FBRU0sWUFBWSxDQUFDLGNBQXlEO1lBQzVFLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQztnQkFDcEQsU0FBUyxFQUFFLGNBQWMsQ0FBQyxTQUFTO2dCQUNuQyxVQUFVLEVBQUUsY0FBYyxDQUFDLFVBQVU7YUFDckMsK0JBQXVCLENBQUM7WUFDekIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztRQUNsRCxDQUFDO1FBRU0sa0JBQWtCLENBQUMsZUFBdUIsRUFBRSxXQUFtQjtZQUNyRSxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUM7Z0JBQ3BFLFVBQVUsRUFBRSxlQUFlO2dCQUMzQixNQUFNLEVBQUUsV0FBVzthQUNuQixDQUFDLENBQUM7WUFDSCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxrQ0FBa0MsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUNwSCxJQUFJLENBQUMsNkJBQTZCLEVBQUUsQ0FBQztZQUNyQyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLHVCQUF1QixDQUFDLElBQUksbUJBQVEsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3pILElBQUksQ0FBQyxZQUFZLEVBQUU7Z0JBQ2xCLE9BQU8sQ0FBQyxDQUFDLENBQUM7YUFDVjtZQUNELE9BQU8sWUFBWSxDQUFDLElBQUksQ0FBQztRQUMxQixDQUFDO1FBRU0sc0JBQXNCLENBQUMsT0FBZSxFQUFFLE9BQWU7WUFDN0QsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDbEYsSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDakIsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUNELE9BQU8seUNBQW1CLENBQUMsNkJBQTZCLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDckgsQ0FBQztRQUVNLG1CQUFtQixDQUFDLFlBQW9CO1lBQzlDLE9BQU8sSUFBSSw2QkFBYSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDdkQsQ0FBQztRQUVNLE1BQU0sQ0FBQyxRQUEwRDtZQUN2RSxJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMxQyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDeEIsQ0FBQztRQUVNLE1BQU0sQ0FBQyxHQUFZLEVBQUUsVUFBbUI7WUFDOUMsSUFBSSxVQUFVLEVBQUU7Z0JBQ2YsZ0NBQWdDO2dCQUNoQyxJQUFJLENBQUMsVUFBVSxDQUFDLGlCQUFpQixFQUFFLENBQUM7Z0JBQ3BDLEtBQUssTUFBTSxRQUFRLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtvQkFDdkMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLENBQUM7aUJBQzdCO2FBQ0Q7WUFDRCxJQUFJLEdBQUcsRUFBRTtnQkFDUixJQUFJLENBQUMsNkJBQTZCLEVBQUUsQ0FBQzthQUNyQztpQkFBTTtnQkFDTixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7YUFDdkI7UUFDRixDQUFDO1FBRU0sd0JBQXdCLENBQUMsTUFBYztZQUM3QyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsd0JBQXdCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDeEQsQ0FBQztRQUVNLEtBQUs7WUFDWCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDdkMsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUMxQyxDQUFDO1FBRU0saUJBQWlCO1lBQ3ZCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzNDLENBQUM7UUFFTSxjQUFjLENBQUMsT0FBMkI7WUFDaEQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMvQyxDQUFDO1FBRU0sZ0JBQWdCLENBQUMsVUFBOEI7WUFDckQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2xELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNyQyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDeEIsQ0FBQztRQUVNLG1CQUFtQixDQUFDLFVBQThCO1lBQ3hELElBQUksQ0FBQyxlQUFlLENBQUMsaUJBQWlCLENBQ3JDLFVBQVUsQ0FBQyxNQUFNLEVBQ2pCLFVBQVUsQ0FBQyxRQUFRLEVBQUUsUUFBUSxJQUFJLElBQUksRUFDckMsVUFBVSxDQUFDLFFBQVEsRUFBRSxpQkFBaUIsSUFBSSxJQUFJLEVBQzlDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsVUFBVSxJQUFJLElBQUksRUFDdkMsVUFBVSxDQUFDLFFBQVEsRUFBRSxnQkFBZ0IsSUFBSSxJQUFJLENBQzdDLENBQUM7WUFDRixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDeEIsQ0FBQztRQUVNLG1CQUFtQixDQUFDLFVBQThCO1lBQ3hELElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNyRCxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDeEIsQ0FBQztRQUVNLGdCQUFnQixDQUFDLFVBQThCO1lBQ3JELElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNsRCxJQUFJLENBQUMsbUJBQW1CLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDckMsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3hCLENBQUM7UUFFTSxtQkFBbUIsQ0FBQyxVQUE4QjtZQUN4RCxNQUFNLGFBQWEsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ2xGLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxhQUFhLENBQUMsQ0FBQztZQUM5RixJQUFJLFlBQVksRUFBRTtnQkFDakIsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO2FBQ3ZCO1FBQ0YsQ0FBQztRQUVNLG1CQUFtQixDQUFDLFVBQThCO1lBQ3hELElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNyRCxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDeEIsQ0FBQztRQUVNLG9CQUFvQixDQUFDLFVBQWtDO1lBQzdELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3RELElBQUksQ0FBQyxnQ0FBZ0MsR0FBRyxJQUFJLENBQUM7WUFDN0MsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3hCLENBQUM7UUFFTSx1QkFBdUIsQ0FBQyxVQUFrQztZQUNoRSxNQUFNLGFBQWEsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDO1lBQzFDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQ2xHLElBQUksWUFBWSxFQUFFO2dCQUNqQixJQUFJLENBQUMsZ0NBQWdDLEdBQUcsSUFBSSxDQUFDO2dCQUM3QyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7YUFDdkI7UUFDRixDQUFDO1FBRU0sdUJBQXVCLENBQUMsVUFBa0M7WUFDaEUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDekQsSUFBSSxDQUFDLGdDQUFnQyxHQUFHLElBQUksQ0FBQztZQUM3QyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDeEIsQ0FBQztLQUlELENBQUE7SUFwa0JZLG9CQUFJO21CQUFKLElBQUk7UUFvQ2QsV0FBQSxxQ0FBcUIsQ0FBQTtPQXBDWCxJQUFJLENBb2tCaEI7SUFFRCxTQUFTLGVBQWUsQ0FBQyxJQUFjO1FBQ3RDLElBQUk7WUFDSCxPQUFPLElBQUksRUFBRSxDQUFDO1NBQ2Q7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNYLElBQUEsMEJBQWlCLEVBQUMsQ0FBQyxDQUFDLENBQUM7U0FDckI7SUFDRixDQUFDIn0=