/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/sash/sash", "vs/base/common/color", "vs/base/common/idGenerator", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/editor/common/core/range", "vs/editor/common/model/textModel", "vs/css!./zoneWidget"], function (require, exports, dom, sash_1, color_1, idGenerator_1, lifecycle_1, objects, range_1, textModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$z3 = exports.$y3 = void 0;
    const defaultColor = new color_1.$Os(new color_1.$Ls(0, 122, 204));
    const defaultOptions = {
        showArrow: true,
        showFrame: true,
        className: '',
        frameColor: defaultColor,
        arrowColor: defaultColor,
        keepEditorSelection: false
    };
    const WIDGET_ID = 'vs.editor.contrib.zoneWidget';
    class ViewZoneDelegate {
        constructor(domNode, afterLineNumber, afterColumn, heightInLines, onDomNodeTop, onComputedHeight, showInHiddenAreas, ordinal) {
            this.id = ''; // A valid zone id should be greater than 0
            this.domNode = domNode;
            this.afterLineNumber = afterLineNumber;
            this.afterColumn = afterColumn;
            this.heightInLines = heightInLines;
            this.showInHiddenAreas = showInHiddenAreas;
            this.ordinal = ordinal;
            this.a = onDomNodeTop;
            this.b = onComputedHeight;
        }
        onDomNodeTop(top) {
            this.a(top);
        }
        onComputedHeight(height) {
            this.b(height);
        }
    }
    class $y3 {
        constructor(id, domNode) {
            this.a = id;
            this.b = domNode;
        }
        getId() {
            return this.a;
        }
        getDomNode() {
            return this.b;
        }
        getPosition() {
            return null;
        }
    }
    exports.$y3 = $y3;
    class Arrow {
        static { this.a = new idGenerator_1.$7L('.arrow-decoration-'); }
        constructor(g) {
            this.g = g;
            this.b = Arrow.a.nextId();
            this.c = this.g.createDecorationsCollection();
            this.d = null;
            this.f = -1;
        }
        dispose() {
            this.hide();
            dom.$1O(this.b);
        }
        set color(value) {
            if (this.d !== value) {
                this.d = value;
                this.h();
            }
        }
        set height(value) {
            if (this.f !== value) {
                this.f = value;
                this.h();
            }
        }
        h() {
            dom.$1O(this.b);
            dom.$ZO(`.monaco-editor ${this.b}`, `border-style: solid; border-color: transparent; border-bottom-color: ${this.d}; border-width: ${this.f}px; bottom: -${this.f}px; margin-left: -${this.f}px; `);
        }
        show(where) {
            if (where.column === 1) {
                // the arrow isn't pretty at column 1 and we need to push it out a little
                where = { lineNumber: where.lineNumber, column: 2 };
            }
            this.c.set([{
                    range: range_1.$ks.fromPositions(where),
                    options: {
                        description: 'zone-widget-arrow',
                        className: this.b,
                        stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */
                    }
                }]);
        }
        hide() {
            this.c.clear();
        }
    }
    class $z3 {
        constructor(editor, options = {}) {
            this.f = null;
            this.g = null;
            this.j = null;
            this.n = null;
            this.o = new lifecycle_1.$jc();
            this.container = null;
            this.z = false;
            this.editor = editor;
            this.k = this.editor.createDecorationsCollection();
            this.options = objects.$Vm(options);
            objects.$Ym(this.options, defaultOptions, false);
            this.domNode = document.createElement('div');
            if (!this.options.isAccessible) {
                this.domNode.setAttribute('aria-hidden', 'true');
                this.domNode.setAttribute('role', 'presentation');
            }
            this.o.add(this.editor.onDidLayoutChange((info) => {
                const width = this.u(info);
                this.domNode.style.width = width + 'px';
                this.domNode.style.left = this.w(info) + 'px';
                this.F(width);
            }));
        }
        dispose() {
            if (this.g) {
                this.editor.removeOverlayWidget(this.g);
                this.g = null;
            }
            if (this.n) {
                this.editor.changeViewZones(accessor => {
                    if (this.n) {
                        accessor.removeZone(this.n.id);
                    }
                    this.n = null;
                });
            }
            this.k.clear();
            this.o.dispose();
        }
        create() {
            this.domNode.classList.add('zone-widget');
            if (this.options.className) {
                this.domNode.classList.add(this.options.className);
            }
            this.container = document.createElement('div');
            this.container.classList.add('zone-widget-container');
            this.domNode.appendChild(this.container);
            if (this.options.showArrow) {
                this.f = new Arrow(this.editor);
                this.o.add(this.f);
            }
            this.E(this.container);
            this.I();
            this.q();
        }
        style(styles) {
            if (styles.frameColor) {
                this.options.frameColor = styles.frameColor;
            }
            if (styles.arrowColor) {
                this.options.arrowColor = styles.arrowColor;
            }
            this.q();
        }
        q() {
            if (this.container && this.options.frameColor) {
                const frameColor = this.options.frameColor.toString();
                this.container.style.borderTopColor = frameColor;
                this.container.style.borderBottomColor = frameColor;
            }
            if (this.f && this.options.arrowColor) {
                const arrowColor = this.options.arrowColor.toString();
                this.f.color = arrowColor;
            }
        }
        u(info) {
            return info.width - info.minimap.minimapWidth - info.verticalScrollbarWidth;
        }
        w(info) {
            // If minimap is to the left, we move beyond it
            if (info.minimap.minimapWidth > 0 && info.minimap.minimapLeft === 0) {
                return info.minimap.minimapWidth;
            }
            return 0;
        }
        x(top) {
            this.domNode.style.top = top + 'px';
        }
        y(height) {
            this.domNode.style.height = `${height}px`;
            if (this.container) {
                const containerHeight = height - this.A();
                this.container.style.height = `${containerHeight}px`;
                const layoutInfo = this.editor.getLayoutInfo();
                this.G(containerHeight, this.u(layoutInfo));
            }
            this.j?.layout();
        }
        get position() {
            const range = this.k.getRange(0);
            if (!range) {
                return undefined;
            }
            return range.getStartPosition();
        }
        hasFocus() {
            return this.domNode.contains(dom.$VO());
        }
        show(rangeOrPos, heightInLines) {
            const range = range_1.$ks.isIRange(rangeOrPos) ? range_1.$ks.lift(rangeOrPos) : range_1.$ks.fromPositions(rangeOrPos);
            this.z = true;
            this.B(range, heightInLines);
            this.z = false;
            this.k.set([{ range, options: textModel_1.$RC.EMPTY }]);
        }
        hide() {
            if (this.n) {
                this.editor.changeViewZones(accessor => {
                    if (this.n) {
                        accessor.removeZone(this.n.id);
                    }
                });
                this.n = null;
            }
            if (this.g) {
                this.editor.removeOverlayWidget(this.g);
                this.g = null;
            }
            this.f?.hide();
            this.k.clear();
        }
        A() {
            const lineHeight = this.editor.getOption(66 /* EditorOption.lineHeight */);
            let result = 0;
            if (this.options.showArrow) {
                const arrowHeight = Math.round(lineHeight / 3);
                result += 2 * arrowHeight;
            }
            if (this.options.showFrame) {
                const frameThickness = Math.round(lineHeight / 9);
                result += 2 * frameThickness;
            }
            return result;
        }
        B(where, heightInLines) {
            const position = where.getStartPosition();
            const layoutInfo = this.editor.getLayoutInfo();
            const width = this.u(layoutInfo);
            this.domNode.style.width = `${width}px`;
            this.domNode.style.left = this.w(layoutInfo) + 'px';
            // Render the widget as zone (rendering) and widget (lifecycle)
            const viewZoneDomNode = document.createElement('div');
            viewZoneDomNode.style.overflow = 'hidden';
            const lineHeight = this.editor.getOption(66 /* EditorOption.lineHeight */);
            // adjust heightInLines to viewport
            if (!this.options.allowUnlimitedHeight) {
                const maxHeightInLines = Math.max(12, (this.editor.getLayoutInfo().height / lineHeight) * 0.8);
                heightInLines = Math.min(heightInLines, maxHeightInLines);
            }
            let arrowHeight = 0;
            let frameThickness = 0;
            // Render the arrow one 1/3 of an editor line height
            if (this.f && this.options.showArrow) {
                arrowHeight = Math.round(lineHeight / 3);
                this.f.height = arrowHeight;
                this.f.show(position);
            }
            // Render the frame as 1/9 of an editor line height
            if (this.options.showFrame) {
                frameThickness = Math.round(lineHeight / 9);
            }
            // insert zone widget
            this.editor.changeViewZones((accessor) => {
                if (this.n) {
                    accessor.removeZone(this.n.id);
                }
                if (this.g) {
                    this.editor.removeOverlayWidget(this.g);
                    this.g = null;
                }
                this.domNode.style.top = '-1000px';
                this.n = new ViewZoneDelegate(viewZoneDomNode, position.lineNumber, position.column, heightInLines, (top) => this.x(top), (height) => this.y(height), this.options.showInHiddenAreas, this.options.ordinal);
                this.n.id = accessor.addZone(this.n);
                this.g = new $y3(WIDGET_ID + this.n.id, this.domNode);
                this.editor.addOverlayWidget(this.g);
            });
            if (this.container && this.options.showFrame) {
                const width = this.options.frameWidth ? this.options.frameWidth : frameThickness;
                this.container.style.borderTopWidth = width + 'px';
                this.container.style.borderBottomWidth = width + 'px';
            }
            const containerHeight = heightInLines * lineHeight - this.A();
            if (this.container) {
                this.container.style.top = arrowHeight + 'px';
                this.container.style.height = containerHeight + 'px';
                this.container.style.overflow = 'hidden';
            }
            this.G(containerHeight, width);
            if (!this.options.keepEditorSelection) {
                this.editor.setSelection(where);
            }
            const model = this.editor.getModel();
            if (model) {
                const range = model.validateRange(new range_1.$ks(where.startLineNumber, 1, where.endLineNumber + 1, 1));
                this.C(range, range.startLineNumber === model.getLineCount());
            }
        }
        C(range, isLastLine) {
            if (isLastLine) {
                this.editor.revealLineNearTop(range.endLineNumber, 0 /* ScrollType.Smooth */);
            }
            else {
                this.editor.revealRange(range, 0 /* ScrollType.Smooth */);
            }
        }
        D(className, classToReplace) {
            if (!this.container) {
                return;
            }
            if (classToReplace) {
                this.container.classList.remove(classToReplace);
            }
            this.container.classList.add(className);
        }
        F(widthInPixel) {
            // implement in subclass
        }
        G(heightInPixel, widthInPixel) {
            // implement in subclass
        }
        H(newHeightInLines) {
            if (this.n && this.n.heightInLines !== newHeightInLines) {
                this.editor.changeViewZones(accessor => {
                    if (this.n) {
                        this.n.heightInLines = newHeightInLines;
                        accessor.layoutZone(this.n.id);
                    }
                });
            }
        }
        // --- sash
        I() {
            if (this.j) {
                return;
            }
            this.j = this.o.add(new sash_1.$aR(this.domNode, this, { orientation: 1 /* Orientation.HORIZONTAL */ }));
            if (!this.options.isResizeable) {
                this.j.state = 0 /* SashState.Disabled */;
            }
            let data;
            this.o.add(this.j.onDidStart((e) => {
                if (this.n) {
                    data = {
                        startY: e.startY,
                        heightInLines: this.n.heightInLines,
                    };
                }
            }));
            this.o.add(this.j.onDidEnd(() => {
                data = undefined;
            }));
            this.o.add(this.j.onDidChange((evt) => {
                if (data) {
                    const lineDelta = (evt.currentY - data.startY) / this.editor.getOption(66 /* EditorOption.lineHeight */);
                    const roundedLineDelta = lineDelta < 0 ? Math.ceil(lineDelta) : Math.floor(lineDelta);
                    const newHeightInLines = data.heightInLines + roundedLineDelta;
                    if (newHeightInLines > 5 && newHeightInLines < 35) {
                        this.H(newHeightInLines);
                    }
                }
            }));
        }
        getHorizontalSashLeft() {
            return 0;
        }
        getHorizontalSashTop() {
            return (this.domNode.style.height === null ? 0 : parseInt(this.domNode.style.height)) - (this.A() / 2);
        }
        getHorizontalSashWidth() {
            const layoutInfo = this.editor.getLayoutInfo();
            return layoutInfo.width - layoutInfo.minimap.minimapWidth;
        }
    }
    exports.$z3 = $z3;
});
//# sourceMappingURL=zoneWidget.js.map