/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/fastDomNode", "vs/editor/common/viewModel/overviewZoneManager", "vs/editor/common/viewEventHandler"], function (require, exports, fastDomNode_1, overviewZoneManager_1, viewEventHandler_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OverviewRuler = void 0;
    class OverviewRuler extends viewEventHandler_1.ViewEventHandler {
        constructor(context, cssClassName) {
            super();
            this._context = context;
            const options = this._context.configuration.options;
            this._domNode = (0, fastDomNode_1.createFastDomNode)(document.createElement('canvas'));
            this._domNode.setClassName(cssClassName);
            this._domNode.setPosition('absolute');
            this._domNode.setLayerHinting(true);
            this._domNode.setContain('strict');
            this._zoneManager = new overviewZoneManager_1.OverviewZoneManager((lineNumber) => this._context.viewLayout.getVerticalOffsetForLineNumber(lineNumber));
            this._zoneManager.setDOMWidth(0);
            this._zoneManager.setDOMHeight(0);
            this._zoneManager.setOuterHeight(this._context.viewLayout.getScrollHeight());
            this._zoneManager.setLineHeight(options.get(66 /* EditorOption.lineHeight */));
            this._zoneManager.setPixelRatio(options.get(141 /* EditorOption.pixelRatio */));
            this._context.addEventHandler(this);
        }
        dispose() {
            this._context.removeEventHandler(this);
            super.dispose();
        }
        // ---- begin view event handlers
        onConfigurationChanged(e) {
            const options = this._context.configuration.options;
            if (e.hasChanged(66 /* EditorOption.lineHeight */)) {
                this._zoneManager.setLineHeight(options.get(66 /* EditorOption.lineHeight */));
                this._render();
            }
            if (e.hasChanged(141 /* EditorOption.pixelRatio */)) {
                this._zoneManager.setPixelRatio(options.get(141 /* EditorOption.pixelRatio */));
                this._domNode.setWidth(this._zoneManager.getDOMWidth());
                this._domNode.setHeight(this._zoneManager.getDOMHeight());
                this._domNode.domNode.width = this._zoneManager.getCanvasWidth();
                this._domNode.domNode.height = this._zoneManager.getCanvasHeight();
                this._render();
            }
            return true;
        }
        onFlushed(e) {
            this._render();
            return true;
        }
        onScrollChanged(e) {
            if (e.scrollHeightChanged) {
                this._zoneManager.setOuterHeight(e.scrollHeight);
                this._render();
            }
            return true;
        }
        onZonesChanged(e) {
            this._render();
            return true;
        }
        // ---- end view event handlers
        getDomNode() {
            return this._domNode.domNode;
        }
        setLayout(position) {
            this._domNode.setTop(position.top);
            this._domNode.setRight(position.right);
            let hasChanged = false;
            hasChanged = this._zoneManager.setDOMWidth(position.width) || hasChanged;
            hasChanged = this._zoneManager.setDOMHeight(position.height) || hasChanged;
            if (hasChanged) {
                this._domNode.setWidth(this._zoneManager.getDOMWidth());
                this._domNode.setHeight(this._zoneManager.getDOMHeight());
                this._domNode.domNode.width = this._zoneManager.getCanvasWidth();
                this._domNode.domNode.height = this._zoneManager.getCanvasHeight();
                this._render();
            }
        }
        setZones(zones) {
            this._zoneManager.setZones(zones);
            this._render();
        }
        _render() {
            if (this._zoneManager.getOuterHeight() === 0) {
                return false;
            }
            const width = this._zoneManager.getCanvasWidth();
            const height = this._zoneManager.getCanvasHeight();
            const colorZones = this._zoneManager.resolveColorZones();
            const id2Color = this._zoneManager.getId2Color();
            const ctx = this._domNode.domNode.getContext('2d');
            ctx.clearRect(0, 0, width, height);
            if (colorZones.length > 0) {
                this._renderOneLane(ctx, colorZones, id2Color, width);
            }
            return true;
        }
        _renderOneLane(ctx, colorZones, id2Color, width) {
            let currentColorId = 0;
            let currentFrom = 0;
            let currentTo = 0;
            for (const zone of colorZones) {
                const zoneColorId = zone.colorId;
                const zoneFrom = zone.from;
                const zoneTo = zone.to;
                if (zoneColorId !== currentColorId) {
                    ctx.fillRect(0, currentFrom, width, currentTo - currentFrom);
                    currentColorId = zoneColorId;
                    ctx.fillStyle = id2Color[currentColorId];
                    currentFrom = zoneFrom;
                    currentTo = zoneTo;
                }
                else {
                    if (currentTo >= zoneFrom) {
                        currentTo = Math.max(currentTo, zoneTo);
                    }
                    else {
                        ctx.fillRect(0, currentFrom, width, currentTo - currentFrom);
                        currentFrom = zoneFrom;
                        currentTo = zoneTo;
                    }
                }
            }
            ctx.fillRect(0, currentFrom, width, currentTo - currentFrom);
        }
    }
    exports.OverviewRuler = OverviewRuler;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3ZlcnZpZXdSdWxlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9icm93c2VyL3ZpZXdQYXJ0cy9vdmVydmlld1J1bGVyL292ZXJ2aWV3UnVsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBVWhHLE1BQWEsYUFBYyxTQUFRLG1DQUFnQjtRQU1sRCxZQUFZLE9BQW9CLEVBQUUsWUFBb0I7WUFDckQsS0FBSyxFQUFFLENBQUM7WUFDUixJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztZQUN4QixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUM7WUFFcEQsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFBLCtCQUFpQixFQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNwRSxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUN6QyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN0QyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNwQyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUVuQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUkseUNBQW1CLENBQUMsQ0FBQyxVQUFrQixFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyw4QkFBOEIsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ3pJLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pDLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLElBQUksQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUM7WUFDN0UsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEdBQUcsa0NBQXlCLENBQUMsQ0FBQztZQUV0RSxJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsR0FBRyxtQ0FBeUIsQ0FBQyxDQUFDO1lBRXRFLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFFZSxPQUFPO1lBQ3RCLElBQUksQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdkMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2pCLENBQUM7UUFFRCxpQ0FBaUM7UUFFakIsc0JBQXNCLENBQUMsQ0FBMkM7WUFDakYsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDO1lBRXBELElBQUksQ0FBQyxDQUFDLFVBQVUsa0NBQXlCLEVBQUU7Z0JBQzFDLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxHQUFHLGtDQUF5QixDQUFDLENBQUM7Z0JBQ3RFLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUNmO1lBRUQsSUFBSSxDQUFDLENBQUMsVUFBVSxtQ0FBeUIsRUFBRTtnQkFDMUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEdBQUcsbUNBQXlCLENBQUMsQ0FBQztnQkFDdEUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO2dCQUN4RCxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7Z0JBQzFELElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUNqRSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLEVBQUUsQ0FBQztnQkFDbkUsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQ2Y7WUFFRCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFDZSxTQUFTLENBQUMsQ0FBOEI7WUFDdkQsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2YsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBQ2UsZUFBZSxDQUFDLENBQW9DO1lBQ25FLElBQUksQ0FBQyxDQUFDLG1CQUFtQixFQUFFO2dCQUMxQixJQUFJLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQ2pELElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUNmO1lBQ0QsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBQ2UsY0FBYyxDQUFDLENBQW1DO1lBQ2pFLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNmLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVELCtCQUErQjtRQUV4QixVQUFVO1lBQ2hCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUM7UUFDOUIsQ0FBQztRQUVNLFNBQVMsQ0FBQyxRQUErQjtZQUMvQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRXZDLElBQUksVUFBVSxHQUFHLEtBQUssQ0FBQztZQUN2QixVQUFVLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLFVBQVUsQ0FBQztZQUN6RSxVQUFVLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLFVBQVUsQ0FBQztZQUUzRSxJQUFJLFVBQVUsRUFBRTtnQkFDZixJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7Z0JBQ3hELElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztnQkFDMUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ2pFLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUVuRSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7YUFDZjtRQUNGLENBQUM7UUFFTSxRQUFRLENBQUMsS0FBMEI7WUFDekMsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbEMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2hCLENBQUM7UUFFTyxPQUFPO1lBQ2QsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLGNBQWMsRUFBRSxLQUFLLENBQUMsRUFBRTtnQkFDN0MsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDakQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUVuRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDekQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUVqRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFFLENBQUM7WUFDcEQsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNuQyxJQUFJLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUMxQixJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ3REO1lBRUQsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU8sY0FBYyxDQUFDLEdBQTZCLEVBQUUsVUFBdUIsRUFBRSxRQUFrQixFQUFFLEtBQWE7WUFFL0csSUFBSSxjQUFjLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZCLElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQztZQUNwQixJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7WUFFbEIsS0FBSyxNQUFNLElBQUksSUFBSSxVQUFVLEVBQUU7Z0JBRTlCLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7Z0JBQ2pDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQzNCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBRXZCLElBQUksV0FBVyxLQUFLLGNBQWMsRUFBRTtvQkFDbkMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxTQUFTLEdBQUcsV0FBVyxDQUFDLENBQUM7b0JBRTdELGNBQWMsR0FBRyxXQUFXLENBQUM7b0JBQzdCLEdBQUcsQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDO29CQUN6QyxXQUFXLEdBQUcsUUFBUSxDQUFDO29CQUN2QixTQUFTLEdBQUcsTUFBTSxDQUFDO2lCQUNuQjtxQkFBTTtvQkFDTixJQUFJLFNBQVMsSUFBSSxRQUFRLEVBQUU7d0JBQzFCLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztxQkFDeEM7eUJBQU07d0JBQ04sR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxTQUFTLEdBQUcsV0FBVyxDQUFDLENBQUM7d0JBQzdELFdBQVcsR0FBRyxRQUFRLENBQUM7d0JBQ3ZCLFNBQVMsR0FBRyxNQUFNLENBQUM7cUJBQ25CO2lCQUNEO2FBQ0Q7WUFFRCxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLFNBQVMsR0FBRyxXQUFXLENBQUMsQ0FBQztRQUU5RCxDQUFDO0tBQ0Q7SUF4SkQsc0NBd0pDIn0=