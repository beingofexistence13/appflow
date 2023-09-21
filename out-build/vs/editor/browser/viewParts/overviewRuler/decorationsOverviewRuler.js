/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/fastDomNode", "vs/base/common/color", "vs/editor/browser/view/viewPart", "vs/editor/common/core/position", "vs/editor/common/languages", "vs/editor/common/core/editorColorRegistry", "vs/editor/common/viewModel", "vs/base/common/arrays"], function (require, exports, fastDomNode_1, color_1, viewPart_1, position_1, languages_1, editorColorRegistry_1, viewModel_1, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$KX = void 0;
    class Settings {
        constructor(config, theme) {
            const options = config.options;
            this.lineHeight = options.get(66 /* EditorOption.lineHeight */);
            this.pixelRatio = options.get(141 /* EditorOption.pixelRatio */);
            this.overviewRulerLanes = options.get(82 /* EditorOption.overviewRulerLanes */);
            this.renderBorder = options.get(81 /* EditorOption.overviewRulerBorder */);
            const borderColor = theme.getColor(editorColorRegistry_1.$jB);
            this.borderColor = borderColor ? borderColor.toString() : null;
            this.hideCursor = options.get(59 /* EditorOption.hideCursorInOverviewRuler */);
            const cursorColor = theme.getColor(editorColorRegistry_1.$XA);
            this.cursorColor = cursorColor ? cursorColor.transparent(0.7).toString() : null;
            this.themeType = theme.type;
            const minimapOpts = options.get(72 /* EditorOption.minimap */);
            const minimapEnabled = minimapOpts.enabled;
            const minimapSide = minimapOpts.side;
            const themeColor = theme.getColor(editorColorRegistry_1.$kB);
            const defaultBackground = languages_1.$bt.getDefaultBackground();
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
            const [x, w] = this.c(1, this.canvasWidth, this.overviewRulerLanes);
            this.x = x;
            this.w = w;
        }
        c(canvasLeftOffset, canvasWidth, laneCount) {
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
                && color_1.$Os.equals(this.backgroundColor, other.backgroundColor)
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
    class $KX extends viewPart_1.$FW {
        constructor(context) {
            super(context);
            this.c = 0 /* ShouldRenderValue.NotNeeded */;
            this.s = [];
            this.t = [];
            this.j = (0, fastDomNode_1.$GP)(document.createElement('canvas'));
            this.j.setClassName('decorationsOverviewRuler');
            this.j.setPosition('absolute');
            this.j.setLayerHinting(true);
            this.j.setContain('strict');
            this.j.setAttribute('aria-hidden', 'true');
            this.u(false);
            this.g = languages_1.$bt.onDidChange((e) => {
                if (e.changedColorMap) {
                    this.u(true);
                }
            });
            this.n = [];
        }
        dispose() {
            super.dispose();
            this.g.dispose();
        }
        u(renderNow) {
            const newSettings = new Settings(this._context.configuration, this._context.theme);
            if (this.m && this.m.equals(newSettings)) {
                // nothing to do
                return false;
            }
            this.m = newSettings;
            this.j.setTop(this.m.top);
            this.j.setRight(this.m.right);
            this.j.setWidth(this.m.domWidth);
            this.j.setHeight(this.m.domHeight);
            this.j.domNode.width = this.m.canvasWidth;
            this.j.domNode.height = this.m.canvasHeight;
            if (renderNow) {
                this.C();
            }
            return true;
        }
        // ---- begin view event handlers
        y() {
            this.c = 2 /* ShouldRenderValue.Needed */;
            return true;
        }
        z() {
            this.c = 1 /* ShouldRenderValue.Maybe */;
            return true;
        }
        onConfigurationChanged(e) {
            return this.u(false) ? this.y() : false;
        }
        onCursorStateChanged(e) {
            this.n = [];
            for (let i = 0, len = e.selections.length; i < len; i++) {
                this.n[i] = e.selections[i].getPosition();
            }
            this.n.sort(position_1.$js.compare);
            return this.z();
        }
        onDecorationsChanged(e) {
            if (e.affectsOverviewRuler) {
                return this.z();
            }
            return false;
        }
        onFlushed(e) {
            return this.y();
        }
        onScrollChanged(e) {
            return e.scrollHeightChanged ? this.y() : false;
        }
        onZonesChanged(e) {
            return this.y();
        }
        onThemeChanged(e) {
            return this.u(false) ? this.y() : false;
        }
        // ---- end view event handlers
        getDomNode() {
            return this.j.domNode;
        }
        prepareRender(ctx) {
            // Nothing to read
        }
        render(editorCtx) {
            this.C();
            this.c = 0 /* ShouldRenderValue.NotNeeded */;
        }
        C() {
            const backgroundColor = this.m.backgroundColor;
            if (this.m.overviewRulerLanes === 0) {
                // overview ruler is off
                this.j.setBackgroundColor(backgroundColor ? color_1.$Os.Format.CSS.formatHexA(backgroundColor) : '');
                this.j.setDisplay('none');
                return;
            }
            const decorations = this._context.viewModel.getAllOverviewRulerDecorations(this._context.theme);
            decorations.sort(viewModel_1.$eV.compareByRenderingProps);
            if (this.c === 1 /* ShouldRenderValue.Maybe */ && !viewModel_1.$eV.equalsArr(this.s, decorations)) {
                this.c = 2 /* ShouldRenderValue.Needed */;
            }
            if (this.c === 1 /* ShouldRenderValue.Maybe */ && !(0, arrays_1.$sb)(this.t, this.n, (a, b) => a.lineNumber === b.lineNumber)) {
                this.c = 2 /* ShouldRenderValue.Needed */;
            }
            if (this.c === 1 /* ShouldRenderValue.Maybe */) {
                // both decorations and cursor positions are unchanged, nothing to do
                return;
            }
            this.s = decorations;
            this.t = this.n;
            this.j.setDisplay('block');
            const canvasWidth = this.m.canvasWidth;
            const canvasHeight = this.m.canvasHeight;
            const lineHeight = this.m.lineHeight;
            const viewLayout = this._context.viewLayout;
            const outerHeight = this._context.viewLayout.getScrollHeight();
            const heightRatio = canvasHeight / outerHeight;
            const minDecorationHeight = (6 /* Constants.MIN_DECORATION_HEIGHT */ * this.m.pixelRatio) | 0;
            const halfMinDecorationHeight = (minDecorationHeight / 2) | 0;
            const canvasCtx = this.j.domNode.getContext('2d');
            if (backgroundColor) {
                if (backgroundColor.isOpaque()) {
                    // We have a background color which is opaque, we can just paint the entire surface with it
                    canvasCtx.fillStyle = color_1.$Os.Format.CSS.formatHexA(backgroundColor);
                    canvasCtx.fillRect(0, 0, canvasWidth, canvasHeight);
                }
                else {
                    // We have a background color which is transparent, we need to first clear the surface and
                    // then fill it
                    canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
                    canvasCtx.fillStyle = color_1.$Os.Format.CSS.formatHexA(backgroundColor);
                    canvasCtx.fillRect(0, 0, canvasWidth, canvasHeight);
                }
            }
            else {
                // We don't have a background color
                canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
            }
            const x = this.m.x;
            const w = this.m.w;
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
            if (!this.m.hideCursor && this.m.cursorColor) {
                const cursorHeight = (2 * this.m.pixelRatio) | 0;
                const halfCursorHeight = (cursorHeight / 2) | 0;
                const cursorX = this.m.x[7 /* OverviewRulerLane.Full */];
                const cursorW = this.m.w[7 /* OverviewRulerLane.Full */];
                canvasCtx.fillStyle = this.m.cursorColor;
                let prevY1 = -100;
                let prevY2 = -100;
                for (let i = 0, len = this.n.length; i < len; i++) {
                    const cursor = this.n[i];
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
            if (this.m.renderBorder && this.m.borderColor && this.m.overviewRulerLanes > 0) {
                canvasCtx.beginPath();
                canvasCtx.lineWidth = 1;
                canvasCtx.strokeStyle = this.m.borderColor;
                canvasCtx.moveTo(0, 0);
                canvasCtx.lineTo(0, canvasHeight);
                canvasCtx.stroke();
                canvasCtx.moveTo(0, 0);
                canvasCtx.lineTo(canvasWidth, 0);
                canvasCtx.stroke();
            }
        }
    }
    exports.$KX = $KX;
});
//# sourceMappingURL=decorationsOverviewRuler.js.map