/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/sash/sash", "vs/base/common/color", "vs/base/common/idGenerator", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/editor/common/core/range", "vs/editor/common/model/textModel", "vs/css!./zoneWidget"], function (require, exports, dom, sash_1, color_1, idGenerator_1, lifecycle_1, objects, range_1, textModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ZoneWidget = exports.OverlayWidgetDelegate = void 0;
    const defaultColor = new color_1.Color(new color_1.RGBA(0, 122, 204));
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
            this._onDomNodeTop = onDomNodeTop;
            this._onComputedHeight = onComputedHeight;
        }
        onDomNodeTop(top) {
            this._onDomNodeTop(top);
        }
        onComputedHeight(height) {
            this._onComputedHeight(height);
        }
    }
    class OverlayWidgetDelegate {
        constructor(id, domNode) {
            this._id = id;
            this._domNode = domNode;
        }
        getId() {
            return this._id;
        }
        getDomNode() {
            return this._domNode;
        }
        getPosition() {
            return null;
        }
    }
    exports.OverlayWidgetDelegate = OverlayWidgetDelegate;
    class Arrow {
        static { this._IdGenerator = new idGenerator_1.IdGenerator('.arrow-decoration-'); }
        constructor(_editor) {
            this._editor = _editor;
            this._ruleName = Arrow._IdGenerator.nextId();
            this._decorations = this._editor.createDecorationsCollection();
            this._color = null;
            this._height = -1;
        }
        dispose() {
            this.hide();
            dom.removeCSSRulesContainingSelector(this._ruleName);
        }
        set color(value) {
            if (this._color !== value) {
                this._color = value;
                this._updateStyle();
            }
        }
        set height(value) {
            if (this._height !== value) {
                this._height = value;
                this._updateStyle();
            }
        }
        _updateStyle() {
            dom.removeCSSRulesContainingSelector(this._ruleName);
            dom.createCSSRule(`.monaco-editor ${this._ruleName}`, `border-style: solid; border-color: transparent; border-bottom-color: ${this._color}; border-width: ${this._height}px; bottom: -${this._height}px; margin-left: -${this._height}px; `);
        }
        show(where) {
            if (where.column === 1) {
                // the arrow isn't pretty at column 1 and we need to push it out a little
                where = { lineNumber: where.lineNumber, column: 2 };
            }
            this._decorations.set([{
                    range: range_1.Range.fromPositions(where),
                    options: {
                        description: 'zone-widget-arrow',
                        className: this._ruleName,
                        stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */
                    }
                }]);
        }
        hide() {
            this._decorations.clear();
        }
    }
    class ZoneWidget {
        constructor(editor, options = {}) {
            this._arrow = null;
            this._overlayWidget = null;
            this._resizeSash = null;
            this._viewZone = null;
            this._disposables = new lifecycle_1.DisposableStore();
            this.container = null;
            this._isShowing = false;
            this.editor = editor;
            this._positionMarkerId = this.editor.createDecorationsCollection();
            this.options = objects.deepClone(options);
            objects.mixin(this.options, defaultOptions, false);
            this.domNode = document.createElement('div');
            if (!this.options.isAccessible) {
                this.domNode.setAttribute('aria-hidden', 'true');
                this.domNode.setAttribute('role', 'presentation');
            }
            this._disposables.add(this.editor.onDidLayoutChange((info) => {
                const width = this._getWidth(info);
                this.domNode.style.width = width + 'px';
                this.domNode.style.left = this._getLeft(info) + 'px';
                this._onWidth(width);
            }));
        }
        dispose() {
            if (this._overlayWidget) {
                this.editor.removeOverlayWidget(this._overlayWidget);
                this._overlayWidget = null;
            }
            if (this._viewZone) {
                this.editor.changeViewZones(accessor => {
                    if (this._viewZone) {
                        accessor.removeZone(this._viewZone.id);
                    }
                    this._viewZone = null;
                });
            }
            this._positionMarkerId.clear();
            this._disposables.dispose();
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
                this._arrow = new Arrow(this.editor);
                this._disposables.add(this._arrow);
            }
            this._fillContainer(this.container);
            this._initSash();
            this._applyStyles();
        }
        style(styles) {
            if (styles.frameColor) {
                this.options.frameColor = styles.frameColor;
            }
            if (styles.arrowColor) {
                this.options.arrowColor = styles.arrowColor;
            }
            this._applyStyles();
        }
        _applyStyles() {
            if (this.container && this.options.frameColor) {
                const frameColor = this.options.frameColor.toString();
                this.container.style.borderTopColor = frameColor;
                this.container.style.borderBottomColor = frameColor;
            }
            if (this._arrow && this.options.arrowColor) {
                const arrowColor = this.options.arrowColor.toString();
                this._arrow.color = arrowColor;
            }
        }
        _getWidth(info) {
            return info.width - info.minimap.minimapWidth - info.verticalScrollbarWidth;
        }
        _getLeft(info) {
            // If minimap is to the left, we move beyond it
            if (info.minimap.minimapWidth > 0 && info.minimap.minimapLeft === 0) {
                return info.minimap.minimapWidth;
            }
            return 0;
        }
        _onViewZoneTop(top) {
            this.domNode.style.top = top + 'px';
        }
        _onViewZoneHeight(height) {
            this.domNode.style.height = `${height}px`;
            if (this.container) {
                const containerHeight = height - this._decoratingElementsHeight();
                this.container.style.height = `${containerHeight}px`;
                const layoutInfo = this.editor.getLayoutInfo();
                this._doLayout(containerHeight, this._getWidth(layoutInfo));
            }
            this._resizeSash?.layout();
        }
        get position() {
            const range = this._positionMarkerId.getRange(0);
            if (!range) {
                return undefined;
            }
            return range.getStartPosition();
        }
        hasFocus() {
            return this.domNode.contains(dom.getActiveElement());
        }
        show(rangeOrPos, heightInLines) {
            const range = range_1.Range.isIRange(rangeOrPos) ? range_1.Range.lift(rangeOrPos) : range_1.Range.fromPositions(rangeOrPos);
            this._isShowing = true;
            this._showImpl(range, heightInLines);
            this._isShowing = false;
            this._positionMarkerId.set([{ range, options: textModel_1.ModelDecorationOptions.EMPTY }]);
        }
        hide() {
            if (this._viewZone) {
                this.editor.changeViewZones(accessor => {
                    if (this._viewZone) {
                        accessor.removeZone(this._viewZone.id);
                    }
                });
                this._viewZone = null;
            }
            if (this._overlayWidget) {
                this.editor.removeOverlayWidget(this._overlayWidget);
                this._overlayWidget = null;
            }
            this._arrow?.hide();
            this._positionMarkerId.clear();
        }
        _decoratingElementsHeight() {
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
        _showImpl(where, heightInLines) {
            const position = where.getStartPosition();
            const layoutInfo = this.editor.getLayoutInfo();
            const width = this._getWidth(layoutInfo);
            this.domNode.style.width = `${width}px`;
            this.domNode.style.left = this._getLeft(layoutInfo) + 'px';
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
            if (this._arrow && this.options.showArrow) {
                arrowHeight = Math.round(lineHeight / 3);
                this._arrow.height = arrowHeight;
                this._arrow.show(position);
            }
            // Render the frame as 1/9 of an editor line height
            if (this.options.showFrame) {
                frameThickness = Math.round(lineHeight / 9);
            }
            // insert zone widget
            this.editor.changeViewZones((accessor) => {
                if (this._viewZone) {
                    accessor.removeZone(this._viewZone.id);
                }
                if (this._overlayWidget) {
                    this.editor.removeOverlayWidget(this._overlayWidget);
                    this._overlayWidget = null;
                }
                this.domNode.style.top = '-1000px';
                this._viewZone = new ViewZoneDelegate(viewZoneDomNode, position.lineNumber, position.column, heightInLines, (top) => this._onViewZoneTop(top), (height) => this._onViewZoneHeight(height), this.options.showInHiddenAreas, this.options.ordinal);
                this._viewZone.id = accessor.addZone(this._viewZone);
                this._overlayWidget = new OverlayWidgetDelegate(WIDGET_ID + this._viewZone.id, this.domNode);
                this.editor.addOverlayWidget(this._overlayWidget);
            });
            if (this.container && this.options.showFrame) {
                const width = this.options.frameWidth ? this.options.frameWidth : frameThickness;
                this.container.style.borderTopWidth = width + 'px';
                this.container.style.borderBottomWidth = width + 'px';
            }
            const containerHeight = heightInLines * lineHeight - this._decoratingElementsHeight();
            if (this.container) {
                this.container.style.top = arrowHeight + 'px';
                this.container.style.height = containerHeight + 'px';
                this.container.style.overflow = 'hidden';
            }
            this._doLayout(containerHeight, width);
            if (!this.options.keepEditorSelection) {
                this.editor.setSelection(where);
            }
            const model = this.editor.getModel();
            if (model) {
                const range = model.validateRange(new range_1.Range(where.startLineNumber, 1, where.endLineNumber + 1, 1));
                this.revealRange(range, range.startLineNumber === model.getLineCount());
            }
        }
        revealRange(range, isLastLine) {
            if (isLastLine) {
                this.editor.revealLineNearTop(range.endLineNumber, 0 /* ScrollType.Smooth */);
            }
            else {
                this.editor.revealRange(range, 0 /* ScrollType.Smooth */);
            }
        }
        setCssClass(className, classToReplace) {
            if (!this.container) {
                return;
            }
            if (classToReplace) {
                this.container.classList.remove(classToReplace);
            }
            this.container.classList.add(className);
        }
        _onWidth(widthInPixel) {
            // implement in subclass
        }
        _doLayout(heightInPixel, widthInPixel) {
            // implement in subclass
        }
        _relayout(newHeightInLines) {
            if (this._viewZone && this._viewZone.heightInLines !== newHeightInLines) {
                this.editor.changeViewZones(accessor => {
                    if (this._viewZone) {
                        this._viewZone.heightInLines = newHeightInLines;
                        accessor.layoutZone(this._viewZone.id);
                    }
                });
            }
        }
        // --- sash
        _initSash() {
            if (this._resizeSash) {
                return;
            }
            this._resizeSash = this._disposables.add(new sash_1.Sash(this.domNode, this, { orientation: 1 /* Orientation.HORIZONTAL */ }));
            if (!this.options.isResizeable) {
                this._resizeSash.state = 0 /* SashState.Disabled */;
            }
            let data;
            this._disposables.add(this._resizeSash.onDidStart((e) => {
                if (this._viewZone) {
                    data = {
                        startY: e.startY,
                        heightInLines: this._viewZone.heightInLines,
                    };
                }
            }));
            this._disposables.add(this._resizeSash.onDidEnd(() => {
                data = undefined;
            }));
            this._disposables.add(this._resizeSash.onDidChange((evt) => {
                if (data) {
                    const lineDelta = (evt.currentY - data.startY) / this.editor.getOption(66 /* EditorOption.lineHeight */);
                    const roundedLineDelta = lineDelta < 0 ? Math.ceil(lineDelta) : Math.floor(lineDelta);
                    const newHeightInLines = data.heightInLines + roundedLineDelta;
                    if (newHeightInLines > 5 && newHeightInLines < 35) {
                        this._relayout(newHeightInLines);
                    }
                }
            }));
        }
        getHorizontalSashLeft() {
            return 0;
        }
        getHorizontalSashTop() {
            return (this.domNode.style.height === null ? 0 : parseInt(this.domNode.style.height)) - (this._decoratingElementsHeight() / 2);
        }
        getHorizontalSashWidth() {
            const layoutInfo = this.editor.getLayoutInfo();
            return layoutInfo.width - layoutInfo.minimap.minimapWidth;
        }
    }
    exports.ZoneWidget = ZoneWidget;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiem9uZVdpZGdldC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL3pvbmVXaWRnZXQvYnJvd3Nlci96b25lV2lkZ2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXFDaEcsTUFBTSxZQUFZLEdBQUcsSUFBSSxhQUFLLENBQUMsSUFBSSxZQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRXRELE1BQU0sY0FBYyxHQUFhO1FBQ2hDLFNBQVMsRUFBRSxJQUFJO1FBQ2YsU0FBUyxFQUFFLElBQUk7UUFDZixTQUFTLEVBQUUsRUFBRTtRQUNiLFVBQVUsRUFBRSxZQUFZO1FBQ3hCLFVBQVUsRUFBRSxZQUFZO1FBQ3hCLG1CQUFtQixFQUFFLEtBQUs7S0FDMUIsQ0FBQztJQUVGLE1BQU0sU0FBUyxHQUFHLDhCQUE4QixDQUFDO0lBRWpELE1BQU0sZ0JBQWdCO1FBYXJCLFlBQVksT0FBb0IsRUFBRSxlQUF1QixFQUFFLFdBQW1CLEVBQUUsYUFBcUIsRUFDcEcsWUFBbUMsRUFDbkMsZ0JBQTBDLEVBQzFDLGlCQUFzQyxFQUN0QyxPQUEyQjtZQWQ1QixPQUFFLEdBQVcsRUFBRSxDQUFDLENBQUMsMkNBQTJDO1lBZ0IzRCxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztZQUN2QixJQUFJLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQztZQUN2QyxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztZQUMvQixJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQztZQUNuQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsaUJBQWlCLENBQUM7WUFDM0MsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7WUFDdkIsSUFBSSxDQUFDLGFBQWEsR0FBRyxZQUFZLENBQUM7WUFDbEMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLGdCQUFnQixDQUFDO1FBQzNDLENBQUM7UUFFRCxZQUFZLENBQUMsR0FBVztZQUN2QixJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3pCLENBQUM7UUFFRCxnQkFBZ0IsQ0FBQyxNQUFjO1lBQzlCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNoQyxDQUFDO0tBQ0Q7SUFFRCxNQUFhLHFCQUFxQjtRQUtqQyxZQUFZLEVBQVUsRUFBRSxPQUFvQjtZQUMzQyxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztZQUNkLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1FBQ3pCLENBQUM7UUFFRCxLQUFLO1lBQ0osT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDO1FBQ2pCLENBQUM7UUFFRCxVQUFVO1lBQ1QsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3RCLENBQUM7UUFFRCxXQUFXO1lBQ1YsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO0tBQ0Q7SUFyQkQsc0RBcUJDO0lBRUQsTUFBTSxLQUFLO2lCQUVjLGlCQUFZLEdBQUcsSUFBSSx5QkFBVyxDQUFDLG9CQUFvQixDQUFDLEFBQXhDLENBQXlDO1FBTzdFLFlBQ2tCLE9BQW9CO1lBQXBCLFlBQU8sR0FBUCxPQUFPLENBQWE7WUFOckIsY0FBUyxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDeEMsaUJBQVksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLDJCQUEyQixFQUFFLENBQUM7WUFDbkUsV0FBTSxHQUFrQixJQUFJLENBQUM7WUFDN0IsWUFBTyxHQUFXLENBQUMsQ0FBQyxDQUFDO1FBSXpCLENBQUM7UUFFTCxPQUFPO1lBQ04sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ1osR0FBRyxDQUFDLGdDQUFnQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBRUQsSUFBSSxLQUFLLENBQUMsS0FBYTtZQUN0QixJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssS0FBSyxFQUFFO2dCQUMxQixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztnQkFDcEIsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO2FBQ3BCO1FBQ0YsQ0FBQztRQUVELElBQUksTUFBTSxDQUFDLEtBQWE7WUFDdkIsSUFBSSxJQUFJLENBQUMsT0FBTyxLQUFLLEtBQUssRUFBRTtnQkFDM0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7Z0JBQ3JCLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQzthQUNwQjtRQUNGLENBQUM7UUFFTyxZQUFZO1lBQ25CLEdBQUcsQ0FBQyxnQ0FBZ0MsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDckQsR0FBRyxDQUFDLGFBQWEsQ0FDaEIsa0JBQWtCLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFDbEMsd0VBQXdFLElBQUksQ0FBQyxNQUFNLG1CQUFtQixJQUFJLENBQUMsT0FBTyxnQkFBZ0IsSUFBSSxDQUFDLE9BQU8scUJBQXFCLElBQUksQ0FBQyxPQUFPLE1BQU0sQ0FDckwsQ0FBQztRQUNILENBQUM7UUFFRCxJQUFJLENBQUMsS0FBZ0I7WUFFcEIsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDdkIseUVBQXlFO2dCQUN6RSxLQUFLLEdBQUcsRUFBRSxVQUFVLEVBQUUsS0FBSyxDQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUM7YUFDcEQ7WUFFRCxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUN0QixLQUFLLEVBQUUsYUFBSyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUM7b0JBQ2pDLE9BQU8sRUFBRTt3QkFDUixXQUFXLEVBQUUsbUJBQW1CO3dCQUNoQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVM7d0JBQ3pCLFVBQVUsNERBQW9EO3FCQUM5RDtpQkFDRCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFRCxJQUFJO1lBQ0gsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUMzQixDQUFDOztJQUdGLE1BQXNCLFVBQVU7UUFnQi9CLFlBQVksTUFBbUIsRUFBRSxVQUFvQixFQUFFO1lBZC9DLFdBQU0sR0FBaUIsSUFBSSxDQUFDO1lBQzVCLG1CQUFjLEdBQWlDLElBQUksQ0FBQztZQUNwRCxnQkFBVyxHQUFnQixJQUFJLENBQUM7WUFHOUIsY0FBUyxHQUE0QixJQUFJLENBQUM7WUFDakMsaUJBQVksR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUV4RCxjQUFTLEdBQXVCLElBQUksQ0FBQztZQStIM0IsZUFBVSxHQUFZLEtBQUssQ0FBQztZQXhIckMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7WUFDckIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsMkJBQTJCLEVBQUUsQ0FBQztZQUNuRSxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDMUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLGNBQWMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNuRCxJQUFJLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDN0MsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFO2dCQUMvQixJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQ2pELElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxjQUFjLENBQUMsQ0FBQzthQUNsRDtZQUVELElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxJQUFzQixFQUFFLEVBQUU7Z0JBQzlFLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ25DLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDO2dCQUN4QyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7Z0JBQ3JELElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdEIsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFRCxPQUFPO1lBQ04sSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO2dCQUN4QixJQUFJLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDckQsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7YUFDM0I7WUFFRCxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQ25CLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxFQUFFO29CQUN0QyxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7d0JBQ25CLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztxQkFDdkM7b0JBQ0QsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7Z0JBQ3ZCLENBQUMsQ0FBQyxDQUFDO2FBQ0g7WUFFRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLENBQUM7WUFFL0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUM3QixDQUFDO1FBRUQsTUFBTTtZQUVMLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUMxQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFO2dCQUMzQixJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUNuRDtZQUVELElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMvQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQztZQUN0RCxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDekMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRTtnQkFDM0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3JDLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUNuQztZQUNELElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3BDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNqQixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDckIsQ0FBQztRQUVELEtBQUssQ0FBQyxNQUFlO1lBQ3BCLElBQUksTUFBTSxDQUFDLFVBQVUsRUFBRTtnQkFDdEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQzthQUM1QztZQUNELElBQUksTUFBTSxDQUFDLFVBQVUsRUFBRTtnQkFDdEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQzthQUM1QztZQUNELElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNyQixDQUFDO1FBRVMsWUFBWTtZQUNyQixJQUFJLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUU7Z0JBQzlDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUN0RCxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxjQUFjLEdBQUcsVUFBVSxDQUFDO2dCQUNqRCxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsR0FBRyxVQUFVLENBQUM7YUFDcEQ7WUFDRCxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUU7Z0JBQzNDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUN0RCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUM7YUFDL0I7UUFDRixDQUFDO1FBRVMsU0FBUyxDQUFDLElBQXNCO1lBQ3pDLE9BQU8sSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUM7UUFDN0UsQ0FBQztRQUVPLFFBQVEsQ0FBQyxJQUFzQjtZQUN0QywrQ0FBK0M7WUFDL0MsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEtBQUssQ0FBQyxFQUFFO2dCQUNwRSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDO2FBQ2pDO1lBQ0QsT0FBTyxDQUFDLENBQUM7UUFDVixDQUFDO1FBRU8sY0FBYyxDQUFDLEdBQVc7WUFDakMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUM7UUFDckMsQ0FBQztRQUVPLGlCQUFpQixDQUFDLE1BQWM7WUFDdkMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUM7WUFFMUMsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNuQixNQUFNLGVBQWUsR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQUM7Z0JBQ2xFLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxHQUFHLGVBQWUsSUFBSSxDQUFDO2dCQUNyRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDO2dCQUMvQyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7YUFDNUQ7WUFFRCxJQUFJLENBQUMsV0FBVyxFQUFFLE1BQU0sRUFBRSxDQUFDO1FBQzVCLENBQUM7UUFFRCxJQUFJLFFBQVE7WUFDWCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pELElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ1gsT0FBTyxTQUFTLENBQUM7YUFDakI7WUFDRCxPQUFPLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ2pDLENBQUM7UUFFRCxRQUFRO1lBQ1AsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO1FBQ3RELENBQUM7UUFJRCxJQUFJLENBQUMsVUFBOEIsRUFBRSxhQUFxQjtZQUN6RCxNQUFNLEtBQUssR0FBRyxhQUFLLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFLLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3BHLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsa0NBQXNCLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2hGLENBQUM7UUFFRCxJQUFJO1lBQ0gsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNuQixJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsRUFBRTtvQkFDdEMsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO3dCQUNuQixRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7cUJBQ3ZDO2dCQUNGLENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO2FBQ3RCO1lBQ0QsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO2dCQUN4QixJQUFJLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDckQsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7YUFDM0I7WUFDRCxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDO1lBQ3BCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNoQyxDQUFDO1FBRU8seUJBQXlCO1lBQ2hDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxrQ0FBeUIsQ0FBQztZQUNsRSxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7WUFFZixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFO2dCQUMzQixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDL0MsTUFBTSxJQUFJLENBQUMsR0FBRyxXQUFXLENBQUM7YUFDMUI7WUFFRCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFO2dCQUMzQixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDbEQsTUFBTSxJQUFJLENBQUMsR0FBRyxjQUFjLENBQUM7YUFDN0I7WUFFRCxPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7UUFFTyxTQUFTLENBQUMsS0FBWSxFQUFFLGFBQXFCO1lBQ3BELE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQzFDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDL0MsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN6QyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsR0FBRyxLQUFLLElBQUksQ0FBQztZQUN4QyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFJLENBQUM7WUFFM0QsK0RBQStEO1lBQy9ELE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdEQsZUFBZSxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1lBQzFDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxrQ0FBeUIsQ0FBQztZQUVsRSxtQ0FBbUM7WUFDbkMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsb0JBQW9CLEVBQUU7Z0JBQ3ZDLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDL0YsYUFBYSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLGdCQUFnQixDQUFDLENBQUM7YUFDMUQ7WUFFRCxJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUM7WUFDcEIsSUFBSSxjQUFjLEdBQUcsQ0FBQyxDQUFDO1lBRXZCLG9EQUFvRDtZQUNwRCxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUU7Z0JBQzFDLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDekMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsV0FBVyxDQUFDO2dCQUNqQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUMzQjtZQUVELG1EQUFtRDtZQUNuRCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFO2dCQUMzQixjQUFjLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUM7YUFDNUM7WUFFRCxxQkFBcUI7WUFDckIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxRQUFpQyxFQUFFLEVBQUU7Z0JBQ2pFLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtvQkFDbkIsUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUN2QztnQkFDRCxJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUU7b0JBQ3hCLElBQUksQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO29CQUNyRCxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztpQkFDM0I7Z0JBQ0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLFNBQVMsQ0FBQztnQkFDbkMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLGdCQUFnQixDQUNwQyxlQUFlLEVBQ2YsUUFBUSxDQUFDLFVBQVUsRUFDbkIsUUFBUSxDQUFDLE1BQU0sRUFDZixhQUFhLEVBQ2IsQ0FBQyxHQUFXLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEVBQ3pDLENBQUMsTUFBYyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLEVBQ2xELElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQzlCLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUNwQixDQUFDO2dCQUNGLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUNyRCxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUkscUJBQXFCLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDN0YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDbkQsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUU7Z0JBQzdDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDO2dCQUNqRixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxjQUFjLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQztnQkFDbkQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQzthQUN0RDtZQUVELE1BQU0sZUFBZSxHQUFHLGFBQWEsR0FBRyxVQUFVLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQUM7WUFFdEYsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNuQixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsV0FBVyxHQUFHLElBQUksQ0FBQztnQkFDOUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLGVBQWUsR0FBRyxJQUFJLENBQUM7Z0JBQ3JELElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7YUFDekM7WUFFRCxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUV2QyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRTtnQkFDdEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDaEM7WUFFRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3JDLElBQUksS0FBSyxFQUFFO2dCQUNWLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxhQUFLLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLGFBQWEsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbkcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLGVBQWUsS0FBSyxLQUFLLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQzthQUN4RTtRQUNGLENBQUM7UUFFUyxXQUFXLENBQUMsS0FBWSxFQUFFLFVBQW1CO1lBQ3RELElBQUksVUFBVSxFQUFFO2dCQUNmLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLGFBQWEsNEJBQW9CLENBQUM7YUFDdEU7aUJBQU07Z0JBQ04sSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyw0QkFBb0IsQ0FBQzthQUNsRDtRQUNGLENBQUM7UUFFUyxXQUFXLENBQUMsU0FBaUIsRUFBRSxjQUF1QjtZQUMvRCxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDcEIsT0FBTzthQUNQO1lBRUQsSUFBSSxjQUFjLEVBQUU7Z0JBQ25CLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQzthQUNoRDtZQUVELElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUV6QyxDQUFDO1FBSVMsUUFBUSxDQUFDLFlBQW9CO1lBQ3RDLHdCQUF3QjtRQUN6QixDQUFDO1FBRVMsU0FBUyxDQUFDLGFBQXFCLEVBQUUsWUFBb0I7WUFDOUQsd0JBQXdCO1FBQ3pCLENBQUM7UUFFUyxTQUFTLENBQUMsZ0JBQXdCO1lBQzNDLElBQUksSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsS0FBSyxnQkFBZ0IsRUFBRTtnQkFDeEUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLEVBQUU7b0JBQ3RDLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTt3QkFDbkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEdBQUcsZ0JBQWdCLENBQUM7d0JBQ2hELFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztxQkFDdkM7Z0JBQ0YsQ0FBQyxDQUFDLENBQUM7YUFDSDtRQUNGLENBQUM7UUFFRCxXQUFXO1FBRUgsU0FBUztZQUNoQixJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBQ3JCLE9BQU87YUFDUDtZQUNELElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxXQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsRUFBRSxXQUFXLGdDQUF3QixFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRWhILElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRTtnQkFDL0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLDZCQUFxQixDQUFDO2FBQzVDO1lBRUQsSUFBSSxJQUEyRCxDQUFDO1lBQ2hFLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBYSxFQUFFLEVBQUU7Z0JBQ25FLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtvQkFDbkIsSUFBSSxHQUFHO3dCQUNOLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTTt3QkFDaEIsYUFBYSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYTtxQkFDM0MsQ0FBQztpQkFDRjtZQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUU7Z0JBQ3BELElBQUksR0FBRyxTQUFTLENBQUM7WUFDbEIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBZSxFQUFFLEVBQUU7Z0JBQ3RFLElBQUksSUFBSSxFQUFFO29CQUNULE1BQU0sU0FBUyxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLGtDQUF5QixDQUFDO29CQUNoRyxNQUFNLGdCQUFnQixHQUFHLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQ3RGLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGFBQWEsR0FBRyxnQkFBZ0IsQ0FBQztvQkFFL0QsSUFBSSxnQkFBZ0IsR0FBRyxDQUFDLElBQUksZ0JBQWdCLEdBQUcsRUFBRSxFQUFFO3dCQUNsRCxJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLENBQUM7cUJBQ2pDO2lCQUNEO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFRCxxQkFBcUI7WUFDcEIsT0FBTyxDQUFDLENBQUM7UUFDVixDQUFDO1FBRUQsb0JBQW9CO1lBQ25CLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHlCQUF5QixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDaEksQ0FBQztRQUVELHNCQUFzQjtZQUNyQixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQy9DLE9BQU8sVUFBVSxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQztRQUMzRCxDQUFDO0tBQ0Q7SUF2V0QsZ0NBdVdDIn0=