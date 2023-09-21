/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/viewEventHandler"], function (require, exports, viewEventHandler_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PartFingerprints = exports.PartFingerprint = exports.ViewPart = void 0;
    class ViewPart extends viewEventHandler_1.ViewEventHandler {
        constructor(context) {
            super();
            this._context = context;
            this._context.addEventHandler(this);
        }
        dispose() {
            this._context.removeEventHandler(this);
            super.dispose();
        }
    }
    exports.ViewPart = ViewPart;
    var PartFingerprint;
    (function (PartFingerprint) {
        PartFingerprint[PartFingerprint["None"] = 0] = "None";
        PartFingerprint[PartFingerprint["ContentWidgets"] = 1] = "ContentWidgets";
        PartFingerprint[PartFingerprint["OverflowingContentWidgets"] = 2] = "OverflowingContentWidgets";
        PartFingerprint[PartFingerprint["OverflowGuard"] = 3] = "OverflowGuard";
        PartFingerprint[PartFingerprint["OverlayWidgets"] = 4] = "OverlayWidgets";
        PartFingerprint[PartFingerprint["ScrollableElement"] = 5] = "ScrollableElement";
        PartFingerprint[PartFingerprint["TextArea"] = 6] = "TextArea";
        PartFingerprint[PartFingerprint["ViewLines"] = 7] = "ViewLines";
        PartFingerprint[PartFingerprint["Minimap"] = 8] = "Minimap";
    })(PartFingerprint || (exports.PartFingerprint = PartFingerprint = {}));
    class PartFingerprints {
        static write(target, partId) {
            target.setAttribute('data-mprt', String(partId));
        }
        static read(target) {
            const r = target.getAttribute('data-mprt');
            if (r === null) {
                return 0 /* PartFingerprint.None */;
            }
            return parseInt(r, 10);
        }
        static collect(child, stopAt) {
            const result = [];
            let resultLen = 0;
            while (child && child !== child.ownerDocument.body) {
                if (child === stopAt) {
                    break;
                }
                if (child.nodeType === child.ELEMENT_NODE) {
                    result[resultLen++] = this.read(child);
                }
                child = child.parentElement;
            }
            const r = new Uint8Array(resultLen);
            for (let i = 0; i < resultLen; i++) {
                r[i] = result[resultLen - i - 1];
            }
            return r;
        }
    }
    exports.PartFingerprints = PartFingerprints;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld1BhcnQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvYnJvd3Nlci92aWV3L3ZpZXdQYXJ0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU9oRyxNQUFzQixRQUFTLFNBQVEsbUNBQWdCO1FBSXRELFlBQVksT0FBb0I7WUFDL0IsS0FBSyxFQUFFLENBQUM7WUFDUixJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztZQUN4QixJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyQyxDQUFDO1FBRWUsT0FBTztZQUN0QixJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3ZDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNqQixDQUFDO0tBSUQ7SUFqQkQsNEJBaUJDO0lBRUQsSUFBa0IsZUFVakI7SUFWRCxXQUFrQixlQUFlO1FBQ2hDLHFEQUFJLENBQUE7UUFDSix5RUFBYyxDQUFBO1FBQ2QsK0ZBQXlCLENBQUE7UUFDekIsdUVBQWEsQ0FBQTtRQUNiLHlFQUFjLENBQUE7UUFDZCwrRUFBaUIsQ0FBQTtRQUNqQiw2REFBUSxDQUFBO1FBQ1IsK0RBQVMsQ0FBQTtRQUNULDJEQUFPLENBQUE7SUFDUixDQUFDLEVBVmlCLGVBQWUsK0JBQWYsZUFBZSxRQVVoQztJQUVELE1BQWEsZ0JBQWdCO1FBRXJCLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBMEMsRUFBRSxNQUF1QjtZQUN0RixNQUFNLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNsRCxDQUFDO1FBRU0sTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFlO1lBQ2pDLE1BQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDM0MsSUFBSSxDQUFDLEtBQUssSUFBSSxFQUFFO2dCQUNmLG9DQUE0QjthQUM1QjtZQUNELE9BQU8sUUFBUSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN4QixDQUFDO1FBRU0sTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFxQixFQUFFLE1BQWU7WUFDM0QsTUFBTSxNQUFNLEdBQXNCLEVBQUUsQ0FBQztZQUNyQyxJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7WUFFbEIsT0FBTyxLQUFLLElBQUksS0FBSyxLQUFLLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFO2dCQUNuRCxJQUFJLEtBQUssS0FBSyxNQUFNLEVBQUU7b0JBQ3JCLE1BQU07aUJBQ047Z0JBQ0QsSUFBSSxLQUFLLENBQUMsUUFBUSxLQUFLLEtBQUssQ0FBQyxZQUFZLEVBQUU7b0JBQzFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQ3ZDO2dCQUNELEtBQUssR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFDO2FBQzVCO1lBRUQsTUFBTSxDQUFDLEdBQUcsSUFBSSxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDcEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDbkMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxTQUFTLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2FBQ2pDO1lBQ0QsT0FBTyxDQUFDLENBQUM7UUFDVixDQUFDO0tBQ0Q7SUFsQ0QsNENBa0NDIn0=