/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/fastDomNode", "vs/editor/browser/view/viewPart", "vs/css!./overlayWidgets"], function (require, exports, fastDomNode_1, viewPart_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ViewOverlayWidgets = void 0;
    class ViewOverlayWidgets extends viewPart_1.ViewPart {
        constructor(context) {
            super(context);
            const options = this._context.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this._widgets = {};
            this._verticalScrollbarWidth = layoutInfo.verticalScrollbarWidth;
            this._minimapWidth = layoutInfo.minimap.minimapWidth;
            this._horizontalScrollbarHeight = layoutInfo.horizontalScrollbarHeight;
            this._editorHeight = layoutInfo.height;
            this._editorWidth = layoutInfo.width;
            this._domNode = (0, fastDomNode_1.createFastDomNode)(document.createElement('div'));
            viewPart_1.PartFingerprints.write(this._domNode, 4 /* PartFingerprint.OverlayWidgets */);
            this._domNode.setClassName('overlayWidgets');
        }
        dispose() {
            super.dispose();
            this._widgets = {};
        }
        getDomNode() {
            return this._domNode;
        }
        // ---- begin view event handlers
        onConfigurationChanged(e) {
            const options = this._context.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            this._verticalScrollbarWidth = layoutInfo.verticalScrollbarWidth;
            this._minimapWidth = layoutInfo.minimap.minimapWidth;
            this._horizontalScrollbarHeight = layoutInfo.horizontalScrollbarHeight;
            this._editorHeight = layoutInfo.height;
            this._editorWidth = layoutInfo.width;
            return true;
        }
        // ---- end view event handlers
        addWidget(widget) {
            const domNode = (0, fastDomNode_1.createFastDomNode)(widget.getDomNode());
            this._widgets[widget.getId()] = {
                widget: widget,
                preference: null,
                domNode: domNode
            };
            // This is sync because a widget wants to be in the dom
            domNode.setPosition('absolute');
            domNode.setAttribute('widgetId', widget.getId());
            this._domNode.appendChild(domNode);
            this.setShouldRender();
            this._updateMaxMinWidth();
        }
        setWidgetPosition(widget, preference) {
            const widgetData = this._widgets[widget.getId()];
            if (widgetData.preference === preference) {
                this._updateMaxMinWidth();
                return false;
            }
            widgetData.preference = preference;
            this.setShouldRender();
            this._updateMaxMinWidth();
            return true;
        }
        removeWidget(widget) {
            const widgetId = widget.getId();
            if (this._widgets.hasOwnProperty(widgetId)) {
                const widgetData = this._widgets[widgetId];
                const domNode = widgetData.domNode.domNode;
                delete this._widgets[widgetId];
                domNode.parentNode.removeChild(domNode);
                this.setShouldRender();
                this._updateMaxMinWidth();
            }
        }
        _updateMaxMinWidth() {
            let maxMinWidth = 0;
            const keys = Object.keys(this._widgets);
            for (let i = 0, len = keys.length; i < len; i++) {
                const widgetId = keys[i];
                const widget = this._widgets[widgetId];
                const widgetMinWidthInPx = widget.widget.getMinContentWidthInPx?.();
                if (typeof widgetMinWidthInPx !== 'undefined') {
                    maxMinWidth = Math.max(maxMinWidth, widgetMinWidthInPx);
                }
            }
            this._context.viewLayout.setOverlayWidgetsMinWidth(maxMinWidth);
        }
        _renderWidget(widgetData) {
            const domNode = widgetData.domNode;
            if (widgetData.preference === null) {
                domNode.setTop('');
                return;
            }
            if (widgetData.preference === 0 /* OverlayWidgetPositionPreference.TOP_RIGHT_CORNER */) {
                domNode.setTop(0);
                domNode.setRight((2 * this._verticalScrollbarWidth) + this._minimapWidth);
            }
            else if (widgetData.preference === 1 /* OverlayWidgetPositionPreference.BOTTOM_RIGHT_CORNER */) {
                const widgetHeight = domNode.domNode.clientHeight;
                domNode.setTop((this._editorHeight - widgetHeight - 2 * this._horizontalScrollbarHeight));
                domNode.setRight((2 * this._verticalScrollbarWidth) + this._minimapWidth);
            }
            else if (widgetData.preference === 2 /* OverlayWidgetPositionPreference.TOP_CENTER */) {
                domNode.setTop(0);
                domNode.domNode.style.right = '50%';
            }
        }
        prepareRender(ctx) {
            // Nothing to read
        }
        render(ctx) {
            this._domNode.setWidth(this._editorWidth);
            const keys = Object.keys(this._widgets);
            for (let i = 0, len = keys.length; i < len; i++) {
                const widgetId = keys[i];
                this._renderWidget(this._widgets[widgetId]);
            }
        }
    }
    exports.ViewOverlayWidgets = ViewOverlayWidgets;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3ZlcmxheVdpZGdldHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvYnJvd3Nlci92aWV3UGFydHMvb3ZlcmxheVdpZGdldHMvb3ZlcmxheVdpZGdldHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBc0JoRyxNQUFhLGtCQUFtQixTQUFRLG1CQUFRO1FBVy9DLFlBQVksT0FBb0I7WUFDL0IsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRWYsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDO1lBQ3BELE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxHQUFHLG1DQUF5QixDQUFDO1lBRXhELElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1lBQ25CLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxVQUFVLENBQUMsc0JBQXNCLENBQUM7WUFDakUsSUFBSSxDQUFDLGFBQWEsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQztZQUNyRCxJQUFJLENBQUMsMEJBQTBCLEdBQUcsVUFBVSxDQUFDLHlCQUF5QixDQUFDO1lBQ3ZFLElBQUksQ0FBQyxhQUFhLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQztZQUN2QyxJQUFJLENBQUMsWUFBWSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUM7WUFFckMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFBLCtCQUFpQixFQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNqRSwyQkFBZ0IsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEseUNBQWlDLENBQUM7WUFDdEUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUM5QyxDQUFDO1FBRWUsT0FBTztZQUN0QixLQUFLLENBQUMs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