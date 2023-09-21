/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/fastDomNode", "vs/base/common/color", "vs/editor/browser/view/viewPart", "vs/editor/common/core/position", "vs/editor/common/languages", "vs/editor/common/core/editorColorRegistry", "vs/editor/common/viewModel", "vs/base/common/arrays"], function (require, exports, fastDomNode_1, color_1, viewPart_1, position_1, languages_1, editorColorRegistry_1, viewModel_1, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DecorationsOverviewRuler = void 0;
    class Settings {
        constructor(config, theme) {
            const options = config.options;
            this.lineHeight = options.get(66 /* EditorOption.lineHeight */);
            this.pixelRatio = options.get(141 /* EditorOption.pixelRatio */);
            this.overviewRulerLanes = options.get(82 /* EditorOption.overviewRulerLanes */);
            this.renderBorder = options.get(81 /* EditorOption.overviewRulerBorder */);
            const borderColor = theme.getColor(editorColorRegistry_1.editorOverviewRulerBorder);
            this.borderColor = borderColor ? borderColor.toString() : null;
            this.hideCursor = options.get(59 /* EditorOption.hideCursorInOverviewRuler */);
            const cursorColor = theme.getColor(editorColorRegistry_1.editorCursorForeground);
            this.cursorColor = cursorColor ? cursorColor.transparent(0.7).toString() : null;
            this.themeType = theme.type;
            const minimapOpts = options.get(72 /* EditorOption.minimap */);
            const minimapEnabled = minimapOpts.enabled;
            const minimapSide = minimapOpts.side;
            const themeColor = theme.getColor(editorColorRegistry_1.editorOverviewRulerBackground);
            const defaultBackground = languages_1.TokenizationRegistry.getDefaultBackground();
            if (themeColor) {
                this.backgroundColor = themeColor;
            }
            else if (minimapEnabled && minimapSide === 'right') {
                this.backgroundColor = defaultBackground;
            }
            else {
                this.backgroundColor = null;
            }
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            const position = layoutInfo.overviewRuler;
            this.top = position.top;
            this.right = position.right;
            this.domWidth = position.width;
            this.domHeight = position.height;
            if (this.overviewRulerLanes === 0) {
                // overview ruler is off
                this.canvasWidth = 0;
                this.canvasHeight = 0;
            }
            else {
                this.canvasWidth = (this.domWidth * this.pixelRatio) | 0;
                this.canvasHeight = (this.domHeight * this.pixelRatio) | 0;
            }
            const [x, w] = this._initLanes(1, this.canvasWidth, this.overviewRulerLanes);
            this.x = x;
            this.w = w;
        }
        _initLanes(canvasLeftOffset, canvasWidth, laneCount) {
            const remainingWidth = canvasWidth - canvasLeftOffset;
            if (laneCount >= 3) {
                const leftWidth = Math.floor(remainingWidth / 3);
                const rightWidth = Math.floor(remainingWidth / 3);
                const centerWidth = remainingWidth - leftWidth - rightWidth;
                const leftOffset = canvasLeftOffset;
                const centerOffset = leftOffset + leftWidth;
                const rightOffset = leftOffset + leftWidth + centerWidth;
                return [
                    [
                        0,
                        leftOffset,
                        centerOffset,
                        leftOffset,
                        rightOffset,
                        leftOffset,
                        centerOffset,
                        leftOffset, // Left | Center | Right
                    ], [
                        0,
                        leftWidth,
                        centerWidth,
                        leftWidth + centerWidth,
                        rightWidth,
                        leftWidth + centerWidth + rightWidth,
                        centerWidth + rightWidth,
                        leftWidth + centerWidth + rightWidth, // Left | Center | Right
                    ]
                ];
            }
            else if (laneCount === 2) {
                const leftWidth = Math.floor(remainingWidth / 2);
                const rightWidth = remainingWidth - leftWidth;
                const leftOffset = canvasLeftOffset;
                const rightOffset = leftOffset + leftWidth;
                return [
                    [
                        0,
                        leftOffset,
                        leftOffset,
                        leftOffset,
                        rightOffset,
                        leftOffset,
                        leftOffset,
                        leftOffset, // Left | Center | Right
                    ], [
                        0,
                        leftWidth,
                        leftWidth,
                        leftWidth,
                        rightWidth,
                        leftWidth + rightWidth,
                        leftWidth + rightWidth,
                        leftWidth + rightWidth, // Left | Center | Right
                    ]
                ];
            }
            else {
                const offset = canvasLeftOffset;
                const width = remainingWidth;
                return [
                    [
                        0,
                        offset,
                        offset,
                        offset,
                        offset,
                        offset,
                        offset,
                        offset, // Left | Center | Right
                    ], [
                        0,
                        width,
                        width,
                        width,
                        width,
                        width,
                        width,
                        width, // Left | Center | Right
                    ]
                ];
            }
        }
        equals(other) {
            return (this.lineHeight === other.lineHeight
                && this.pixelRatio === other.pixelRatio
                && this.overviewRulerLanes === other.overviewRulerLanes
                && this.renderBorder === other.renderBorder
                && this.borderColor === other.borderColor
                && this.hideCursor === other.hideCursor
                && this.cursorColor === other.cursorColor
                && this.themeType === other.themeType
                && color_1.Color.equals(this.backgroundColor, other.backgroundColor)
                && this.top === other.top
                && this.right === other.right
                && this.domWidth === other.domWidth
                && this.domHeight === other.domHeight
                && this.canvasWidth === other.canvasWidth
                && this.canvasHeight === other.canvasHeight);
        }
    }
    var Constants;
    (function (Constants) {
        Constants[Constants["MIN_DECORATION_HEIGHT"] = 6] = "MIN_DECORATION_HEIGHT";
    })(Constants || (Constants = {}));
    var OverviewRulerLane;
    (function (OverviewRulerLane) {
        OverviewRulerLane[OverviewRulerLane["Left"] = 1] = "Left";
        OverviewRulerLane[OverviewRulerLane["Center"] = 2] = "Center";
        OverviewRulerLane[OverviewRulerLane["Right"] = 4] = "Right";
        OverviewRulerLane[OverviewRulerLane["Full"] = 7] = "Full";
    })(OverviewRulerLane || (OverviewRulerLane = {}));
    var ShouldRenderValue;
    (function (ShouldRenderValue) {
        ShouldRenderValue[ShouldRenderValue["NotNeeded"] = 0] = "NotNeeded";
        ShouldRenderValue[ShouldRenderValue["Maybe"] = 1] = "Maybe";
        ShouldRenderValue[ShouldRenderValue["Needed"] = 2] = "Needed";
    })(ShouldRenderValue || (ShouldRenderValue = {}));
    class DecorationsOverviewRuler extends viewPart_1.ViewPart {
        constructor(context) {
            super(context);
            this._actualShouldRender = 0 /* ShouldRenderValue.NotNeeded */;
            this._renderedDecorations = [];
            this._renderedCursorPositions = [];
            this._domNode = (0, fastDomNode_1.createFastDomNode)(document.createElement('canvas'));
            this._domNode.setClassName('decorationsOverviewRuler');
            this._domNode.setPosition('absolute');
            this._domNode.setLayerHinting(true);
            this._domNode.setContain('strict');
            this._domNode.setAttribute('aria-hidden', 'true');
            this._updateSettings(false);
            this._tokensColorTrackerListener = languages_1.TokenizationRegistry.onDidChange((e) => {
                if (e.changedColorMap) {
                    this._updateSettings(true);
                }
            });
            this._cursorPositions = [];
        }
        dispose() {
            super.dispose();
            this._tokensColorTrackerListener.dispose();
        }
        _updateSettings(renderNow) {
            const newSettings = new Settings(this._context.configuration, this._context.theme);
            if (this._settings && this._settings.equals(newSettings)) {
                // nothing to do
                return false;
            }
            this._settings = newSettings;
            this._domNode.setTop(this._settings.top);
            this._domNode.setRight(this._settings.right);
            this._domNode.setWidth(this._settings.domWidth);
            this._domNode.setHeight(this._settings.domHeight);
            this._domNode.domNode.width = this._settings.canvasWidth;
            this._domNode.domNode.height = this._settings.canvasHeight;
            if (renderNow) {
                this._render();
            }
            return true;
        }
        // ---- begin view event handlers
        _markRenderingIsNeeded() {
            this._actualShouldRender = 2 /* ShouldRenderValue.Needed */;
            return true;
        }
        _markRenderingIsMaybeNeeded() {
            this._actualShouldRender = 1 /* ShouldRenderValue.Maybe */;
            return true;
        }
        onConfigurationChanged(e) {
            return this._updateSettings(false) ? this._markRenderingIsNeeded() : false;
        }
        onCursorStateChanged(e) {
            this._cursorPositions = [];
            for (let i = 0, len = e.selections.length; i < len; i++) {
                this._cursorPositions[i] = e.selections[i].getPosition();
            }
            this._cursorPositions.sort(position_1.Position.compare);
            return this._markRenderingIsMaybeNeeded();
        }
        onDecorationsChanged(e) {
            if (e.affectsOverviewRuler) {
                return this._markRenderingIsMaybeNeeded();
            }
            return false;
        }
        onFlushed(e) {
            return this._markRenderingIsNeeded();
        }
        onScrollChanged(e) {
            return e.scrollHeightChanged ? this._markRenderingIsNeeded() : false;
        }
        onZonesChanged(e) {
            return this._markRenderingIsNeeded();
        }
        onThemeChanged(e) {
            return this._updateSettings(false) ? this._markRenderingIsNeeded() : false;
        }
        // ---- end view event handlers
        getDomNode() {
            return this._domNode.domNode;
        }
        prepareRender(ctx) {
            // Nothing to read
        }
        render(editorCtx) {
            this._render();
            this._actualShouldRender = 0 /* ShouldRenderValue.NotNeeded */;
        }
        _render() {
            const backgroundColor = this._settings.backgroundColor;
            if (this._settings.overviewRulerLanes === 0) {
                // overview ruler is off
                this._domNode.setBackgroundColor(backgroundColor ? color_1.Color.Format.CSS.formatHexA(backgroundColor) : '');
                this._domNode.setDisplay('none');
                return;
            }
            const decorations = this._context.viewModel.getAllOverviewRulerDecorations(this._context.theme);
            decorations.sort(viewModel_1.OverviewRulerDecorationsGroup.compareByRenderingProps);
            if (this._actualShouldRender === 1 /* ShouldRenderValue.Maybe */ && !viewModel_1.OverviewRulerDecorationsGroup.equalsArr(this._renderedDecorations, decorations)) {
                this._actualShouldRender = 2 /* ShouldRenderValue.Needed */;
            }
            if (this._actualShouldRender === 1 /* ShouldRenderValue.Maybe */ && !(0, arrays_1.equals)(this._renderedCursorPositions, this._cursorPositions, (a, b) => a.lineNumber === b.lineNumber)) {
                this._actualShouldRender = 2 /* ShouldRenderValue.Needed */;
            }
            if (this._actualShouldRender === 1 /* ShouldRenderValue.Maybe */) {
                // both decorations and cursor positions are unchanged, nothing to do
                return;
            }
            this._renderedDecorations = decorations;
            this._renderedCursorPositions = this._cursorPositions;
            this._domNode.setDisplay('block');
            const canvasWidth = this._settings.canvasWidth;
            const canvasHeight = this._settings.canvasHeight;
            const lineHeight = this._settings.lineHeight;
            const viewLayout = this._context.viewLayout;
            const outerHeight = this._context.viewLayout.getScrollHeight();
            const heightRatio = canvasHeight / outerHeight;
            const minDecorationHeight = (6 /* Constants.MIN_DECORATION_HEIGHT */ * this._settings.pixelRatio) | 0;
            const halfMinDecorationHeight = (minDecorationHeight / 2) | 0;
            const canvasCtx = this._domNode.domNode.getContext('2d');
            if (backgroundColor) {
                if (backgroundColor.isOpaque()) {
                    // We have a background color which is opaque, we can just paint the entire surface with it
                    canvasCtx.fillStyle = color_1.Color.Format.CSS.formatHexA(backgroundColor);
                    canvasCtx.fillRect(0, 0, canvasWidth, canvasHeight);
                }
                else {
                    // We have a background color which is transparent, we need to first clear the surface and
                    // then fill it
                    canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
                    canvasCtx.fillStyle = color_1.Color.Format.CSS.formatHexA(backgroundColor);
                    canvasCtx.fillRect(0, 0, canvasWidth, canvasHeight);
                }
            }
            else {
                // We don't have a background color
                canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
            }
            const x = this._settings.x;
            const w = this._settings.w;
            for (const decorationGroup of decorations) {
                const color = decorationGroup.color;
                const decorationGroupData = decorationGroup.data;
                canvasCtx.fillStyle = color;
                let prevLane = 0;
                let prevY1 = 0;
                let prevY2 = 0;
                for (let i = 0, len = decorationGroupData.length / 3; i < len; i++) {
                    const lane = decorationGroupData[3 * i];
                    const startLineNumber = decorationGroupData[3 * i + 1];
                    const endLineNumber = decorationGroupData[3 * i + 2];
                    let y1 = (viewLayout.getVerticalOffsetForLineNumber(startLineNumber) * heightRatio) | 0;
                    let y2 = ((viewLayout.getVerticalOffsetForLineNumber(endLineNumber) + lineHeight) * heightRatio) | 0;
                    const height = y2 - y1;
                    if (height < minDecorationHeight) {
                        let yCenter = ((y1 + y2) / 2) | 0;
                        if (yCenter < halfMinDecorationHeight) {
                            yCenter = halfMinDecorationHeight;
                        }
                        else if (yCenter + halfMinDecorationHeight > canvasHeight) {
                            yCenter = canvasHeight - halfMinDecorationHeight;
                        }
                        y1 = yCenter - halfMinDecorationHeight;
                        y2 = yCenter + halfMinDecorationHeight;
                    }
                    if (y1 > prevY2 + 1 || lane !== prevLane) {
                        // flush prev
                        if (i !== 0) {
                            canvasCtx.fillRect(x[prevLane], prevY1, w[prevLane], prevY2 - prevY1);
                        }
                        prevLane = lane;
                        prevY1 = y1;
                        prevY2 = y2;
                    }
                    else {
                        // merge into prev
                        if (y2 > prevY2) {
                            prevY2 = y2;
                        }
                    }
                }
                canvasCtx.fillRect(x[prevLane], prevY1, w[prevLane], prevY2 - prevY1);
            }
            // Draw cursors
            if (!this._settings.hideCursor && this._settings.cursorColor) {
                const cursorHeight = (2 * this._settings.pixelRatio) | 0;
                const halfCursorHeight = (cursorHeight / 2) | 0;
                const cursorX = this._settings.x[7 /* OverviewRulerLane.Full */];
                const cursorW = this._settings.w[7 /* OverviewRulerLane.Full */];
                canvasCtx.fillStyle = this._settings.cursorColor;
                let prevY1 = -100;
                let prevY2 = -100;
                for (let i = 0, len = this._cursorPositions.length; i < len; i++) {
                    const cursor = this._cursorPositions[i];
                    let yCenter = (viewLayout.getVerticalOffsetForLineNumber(cursor.lineNumber) * heightRatio) | 0;
                    if (yCenter < halfCursorHeight) {
                        yCenter = halfCursorHeight;
                    }
                    else if (yCenter + halfCursorHeight > canvasHeight) {
                        yCenter = canvasHeight - halfCursorHeight;
                    }
                    const y1 = yCenter - halfCursorHeight;
                    const y2 = y1 + cursorHeight;
                    if (y1 > prevY2 + 1) {
                        // flush prev
                        if (i !== 0) {
                            canvasCtx.fillRect(cursorX, prevY1, cursorW, prevY2 - prevY1);
                        }
                        prevY1 = y1;
                        prevY2 = y2;
                    }
                    else {
                        // merge into prev
                        if (y2 > prevY2) {
                            prevY2 = y2;
                        }
                    }
                }
                canvasCtx.fillRect(cursorX, prevY1, cursorW, prevY2 - prevY1);
            }
            if (this._settings.renderBorder && this._settings.borderColor && this._settings.overviewRulerLanes > 0) {
                canvasCtx.beginPath();
                canvasCtx.lineWidth = 1;
                canvasCtx.strokeStyle = this._settings.borderColor;
                canvasCtx.moveTo(0, 0);
                canvasCtx.lineTo(0, canvasHeight);
                canvasCtx.stroke();
                canvasCtx.moveTo(0, 0);
                canvasCtx.lineTo(canvasWidth, 0);
                canvasCtx.stroke();
            }
        }
    }
    exports.DecorationsOverviewRuler = DecorationsOverviewRuler;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVjb3JhdGlvbnNPdmVydmlld1J1bGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2Jyb3dzZXIvdmlld1BhcnRzL292ZXJ2aWV3UnVsZXIvZGVjb3JhdGlvbnNPdmVydmlld1J1bGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWtCaEcsTUFBTSxRQUFRO1FBeUJiLFlBQVksTUFBNEIsRUFBRSxLQUFrQjtZQUMzRCxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDO1lBQy9CLElBQUksQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDLEdBQUcsa0NBQXlCLENBQUM7WUFDdkQsSUFBSSxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUMsR0FBRyxtQ0FBeUIsQ0FBQztZQUN2RCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsT0FBTyxDQUFDLEdBQUcsMENBQWlDLENBQUM7WUFFdkUsSUFBSSxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUMsR0FBRywyQ0FBa0MsQ0FBQztZQUNsRSxNQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLCtDQUF5QixDQUFDLENBQUM7WUFDOUQsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBRS9ELElBQUksQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDLEdBQUcsaURBQXdDLENBQUM7WUFDdEUsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyw0Q0FBc0IsQ0FBQyxDQUFDO1lBQzNELElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFF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