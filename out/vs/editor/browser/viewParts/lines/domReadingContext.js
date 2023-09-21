/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DomReadingContext = void 0;
    class DomReadingContext {
        get didDomLayout() {
            return this._didDomLayout;
        }
        readClientRect() {
            if (!this._clientRectRead) {
                this._clientRectRead = true;
                const rect = this._domNode.getBoundingClientRect();
                this.markDidDomLayout();
                this._clientRectDeltaLeft = rect.left;
                this._clientRectScale = rect.width / this._domNode.offsetWidth;
            }
        }
        get clientRectDeltaLeft() {
            if (!this._clientRectRead) {
                this.readClientRect();
            }
            return this._clientRectDeltaLeft;
        }
        get clientRectScale() {
            if (!this._clientRectRead) {
                this.readClientRect();
            }
            return this._clientRectScale;
        }
        constructor(_domNode, endNode) {
            this._domNode = _domNode;
            this.endNode = endNode;
            this._didDomLayout = false;
            this._clientRectDeltaLeft = 0;
            this._clientRectScale = 1;
            this._clientRectRead = false;
        }
        markDidDomLayout() {
            this._didDomLayout = true;
        }
    }
    exports.DomReadingContext = DomReadingContext;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tUmVhZGluZ0NvbnRleHQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvYnJvd3Nlci92aWV3UGFydHMvbGluZXMvZG9tUmVhZGluZ0NvbnRleHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBRWhHLE1BQWEsaUJBQWlCO1FBTzdCLElBQVcsWUFBWTtZQUN0QixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDM0IsQ0FBQztRQUVPLGNBQWM7WUFDckIsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUU7Z0JBQzFCLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO2dCQUM1QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLHFCQUFxQixFQUFFLENBQUM7Z0JBQ25ELElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2dCQUN4QixJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDdEMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUM7YUFDL0Q7UUFDRixDQUFDO1FBRUQsSUFBVyxtQkFBbUI7WUFDN0IsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUU7Z0JBQzFCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQzthQUN0QjtZQUNELE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDO1FBQ2xDLENBQUM7UUFFRCxJQUFXLGVBQWU7WUFDekIsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUU7Z0JBQzFCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQzthQUN0QjtZQUNELE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDO1FBQzlCLENBQUM7UUFFRCxZQUNrQixRQUFxQixFQUN0QixPQUFvQjtZQURuQixhQUFRLEdBQVIsUUFBUSxDQUFhO1lBQ3RCLFlBQU8sR0FBUCxPQUFPLENBQWE7WUFuQzdCLGtCQUFhLEdBQVksS0FBSyxDQUFDO1lBQy9CLHlCQUFvQixHQUFXLENBQUMsQ0FBQztZQUNqQyxxQkFBZ0IsR0FBVyxDQUFDLENBQUM7WUFDN0Isb0JBQWUsR0FBWSxLQUFLLENBQUM7UUFrQ3pDLENBQUM7UUFFTSxnQkFBZ0I7WUFDdEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7UUFDM0IsQ0FBQztLQUNEO0lBNUNELDhDQTRDQyJ9