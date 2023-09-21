/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/base/common/event"], function (require, exports, dom_1, lifecycle_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FixedZoneWidget = void 0;
    class FixedZoneWidget extends lifecycle_1.Disposable {
        static { this.counter = 0; }
        constructor(editor, viewZoneAccessor, afterLineNumber, height, viewZoneIdsToCleanUp) {
            super();
            this.editor = editor;
            this.overlayWidgetId = `fixedZoneWidget-${FixedZoneWidget.counter++}`;
            this.widgetDomNode = (0, dom_1.h)('div.fixed-zone-widget').root;
            this.overlayWidget = {
                getId: () => this.overlayWidgetId,
                getDomNode: () => this.widgetDomNode,
                getPosition: () => null
            };
            this.viewZoneId = viewZoneAccessor.addZone({
                domNode: document.createElement('div'),
                afterLineNumber: afterLineNumber,
                heightInPx: height,
                onComputedHeight: (height) => {
                    this.widgetDomNode.style.height = `${height}px`;
                },
                onDomNodeTop: (top) => {
                    this.widgetDomNode.style.top = `${top}px`;
                }
            });
            viewZoneIdsToCleanUp.push(this.viewZoneId);
            this._register(event_1.Event.runAndSubscribe(this.editor.onDidLayoutChange, () => {
                this.widgetDomNode.style.left = this.editor.getLayoutInfo().contentLeft + 'px';
            }));
            this.editor.addOverlayWidget(this.overlayWidget);
            this._register({
                dispose: () => {
                    this.editor.removeOverlayWidget(this.overlayWidget);
                },
            });
        }
    }
    exports.FixedZoneWidget = FixedZoneWidget;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZml4ZWRab25lV2lkZ2V0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbWVyZ2VFZGl0b3IvYnJvd3Nlci92aWV3L2ZpeGVkWm9uZVdpZGdldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFPaEcsTUFBc0IsZUFBZ0IsU0FBUSxzQkFBVTtpQkFDeEMsWUFBTyxHQUFHLENBQUMsQUFBSixDQUFLO1FBVzNCLFlBQ2tCLE1BQW1CLEVBQ3BDLGdCQUF5QyxFQUN6QyxlQUF1QixFQUN2QixNQUFjLEVBQ2Qsb0JBQThCO1lBRTlCLEtBQUssRUFBRSxDQUFDO1lBTlMsV0FBTSxHQUFOLE1BQU0sQ0FBYTtZQVhwQixvQkFBZSxHQUFHLG1CQUFtQixlQUFlLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQztZQUcvRCxrQkFBYSxHQUFHLElBQUEsT0FBQyxFQUFDLHVCQUF1QixDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ2xELGtCQUFhLEdBQW1CO2dCQUNoRCxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWU7Z0JBQ2pDLFVBQVUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYTtnQkFDcEMsV0FBVyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUk7YUFDdkIsQ0FBQztZQVdELElBQUksQ0FBQyxVQUFVLEdBQUcsZ0JBQWdCLENBQUMsT0FBTyxDQUFDO2dCQUMxQyxPQUFPLEVBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUM7Z0JBQ3RDLGVBQWUsRUFBRSxlQUFlO2dCQUNoQyxVQUFVLEVBQUUsTUFBTTtnQkFDbEIsZ0JBQWdCLEVBQUUsQ0FBQyxNQUFNLEVBQUUsRUFBRTtvQkFDNUIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUM7Z0JBQ2pELENBQUM7Z0JBQ0QsWUFBWSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUU7b0JBQ3JCLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDO2dCQUMzQyxDQUFDO2FBQ0QsQ0FBQyxDQUFDO1lBQ0gsb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUUzQyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLEVBQUU7Z0JBQ3hFLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7WUFDaEYsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRWpELElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBQ2QsT0FBTyxFQUFFLEdBQUcsRUFBRTtvQkFDYixJQUFJLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDckQsQ0FBQzthQUNELENBQUMsQ0FBQztRQUNKLENBQUM7O0lBN0NGLDBDQThDQyJ9