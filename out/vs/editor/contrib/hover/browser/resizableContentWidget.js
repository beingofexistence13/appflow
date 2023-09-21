/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/resizable/resizable", "vs/base/common/lifecycle", "vs/editor/common/core/position", "vs/base/browser/dom"], function (require, exports, resizable_1, lifecycle_1, position_1, dom) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ResizableContentWidget = void 0;
    const TOP_HEIGHT = 30;
    const BOTTOM_HEIGHT = 24;
    class ResizableContentWidget extends lifecycle_1.Disposable {
        constructor(_editor, minimumSize = new dom.Dimension(10, 10)) {
            super();
            this._editor = _editor;
            this.allowEditorOverflow = true;
            this.suppressMouseDown = false;
            this._resizableNode = this._register(new resizable_1.ResizableHTMLElement());
            this._contentPosition = null;
            this._isResizing = false;
            this._resizableNode.domNode.style.position = 'absolute';
            this._resizableNode.minSize = dom.Dimension.lift(minimumSize);
            this._resizableNode.layout(minimumSize.height, minimumSize.width);
            this._resizableNode.enableSashes(true, true, true, true);
            this._register(this._resizableNode.onDidResize(e => {
                this._resize(new dom.Dimension(e.dimension.width, e.dimension.height));
                if (e.done) {
                    this._isResizing = false;
                }
            }));
            this._register(this._resizableNode.onDidWillResize(() => {
                this._isResizing = true;
            }));
        }
        get isResizing() {
            return this._isResizing;
        }
        getDomNode() {
            return this._resizableNode.domNode;
        }
        getPosition() {
            return this._contentPosition;
        }
        get position() {
            return this._contentPosition?.position ? position_1.Position.lift(this._contentPosition.position) : undefined;
        }
        _availableVerticalSpaceAbove(position) {
            const editorDomNode = this._editor.getDomNode();
            const mouseBox = this._editor.getScrolledVisiblePosition(position);
            if (!editorDomNode || !mouseBox) {
                return;
            }
            const editorBox = dom.getDomNodePagePosition(editorDomNode);
            return editorBox.top + mouseBox.top - TOP_HEIGHT;
        }
        _availableVerticalSpaceBelow(position) {
            const editorDomNode = this._editor.getDomNode();
            const mouseBox = this._editor.getScrolledVisiblePosition(position);
            if (!editorDomNode || !mouseBox) {
                return;
            }
            const editorBox = dom.getDomNodePagePosition(editorDomNode);
            const bodyBox = dom.getClientArea(editorDomNode.ownerDocument.body);
            const mouseBottom = editorBox.top + mouseBox.top + mouseBox.height;
            return bodyBox.height - mouseBottom - BOTTOM_HEIGHT;
        }
        _findPositionPreference(widgetHeight, showAtPosition) {
            const maxHeightBelow = Math.min(this._availableVerticalSpaceBelow(showAtPosition) ?? Infinity, widgetHeight);
            const maxHeightAbove = Math.min(this._availableVerticalSpaceAbove(showAtPosition) ?? Infinity, widgetHeight);
            const maxHeight = Math.min(Math.max(maxHeightAbove, maxHeightBelow), widgetHeight);
            const height = Math.min(widgetHeight, maxHeight);
            let renderingAbove;
            if (this._editor.getOption(60 /* EditorOption.hover */).above) {
                renderingAbove = height <= maxHeightAbove ? 1 /* ContentWidgetPositionPreference.ABOVE */ : 2 /* ContentWidgetPositionPreference.BELOW */;
            }
            else {
                renderingAbove = height <= maxHeightBelow ? 2 /* ContentWidgetPositionPreference.BELOW */ : 1 /* ContentWidgetPositionPreference.ABOVE */;
            }
            if (renderingAbove === 1 /* ContentWidgetPositionPreference.ABOVE */) {
                this._resizableNode.enableSashes(true, true, false, false);
            }
            else {
                this._resizableNode.enableSashes(false, true, true, false);
            }
            return renderingAbove;
        }
        _resize(dimension) {
            this._resizableNode.layout(dimension.height, dimension.width);
        }
    }
    exports.ResizableContentWidget = ResizableContentWidget;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzaXphYmxlQ29udGVudFdpZGdldC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2hvdmVyL2Jyb3dzZXIvcmVzaXphYmxlQ29udGVudFdpZGdldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFTaEcsTUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFDO0lBQ3RCLE1BQU0sYUFBYSxHQUFHLEVBQUUsQ0FBQztJQUV6QixNQUFzQixzQkFBdUIsU0FBUSxzQkFBVTtRQVU5RCxZQUNvQixPQUFvQixFQUN2QyxjQUE4QixJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQztZQUV2RCxLQUFLLEVBQUUsQ0FBQztZQUhXLFlBQU8sR0FBUCxPQUFPLENBQWE7WUFUL0Isd0JBQW1CLEdBQVksSUFBSSxDQUFDO1lBQ3BDLHNCQUFpQixHQUFZLEtBQUssQ0FBQztZQUV6QixtQkFBYyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxnQ0FBb0IsRUFBRSxDQUFDLENBQUM7WUFDckUscUJBQWdCLEdBQWtDLElBQUksQ0FBQztZQUV6RCxnQkFBVyxHQUFZLEtBQUssQ0FBQztZQU9wQyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQztZQUN4RCxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUM5RCxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNsRSxJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMs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