/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/mouseEvent", "vs/base/browser/touch", "vs/base/common/lifecycle"], function (require, exports, dom, keyboardEvent_1, mouseEvent_1, touch_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Widget = void 0;
    class Widget extends lifecycle_1.Disposable {
        onclick(domNode, listener) {
            this._register(dom.addDisposableListener(domNode, dom.EventType.CLICK, (e) => listener(new mouseEvent_1.StandardMouseEvent(e))));
        }
        onmousedown(domNode, listener) {
            this._register(dom.addDisposableListener(domNode, dom.EventType.MOUSE_DOWN, (e) => listener(new mouseEvent_1.StandardMouseEvent(e))));
        }
        onmouseover(domNode, listener) {
            this._register(dom.addDisposableListener(domNode, dom.EventType.MOUSE_OVER, (e) => listener(new mouseEvent_1.StandardMouseEvent(e))));
        }
        onmouseleave(domNode, listener) {
            this._register(dom.addDisposableListener(domNode, dom.EventType.MOUSE_LEAVE, (e) => listener(new mouseEvent_1.StandardMouseEvent(e))));
        }
        onkeydown(domNode, listener) {
            this._register(dom.addDisposableListener(domNode, dom.EventType.KEY_DOWN, (e) => listener(new keyboardEvent_1.StandardKeyboardEvent(e))));
        }
        onkeyup(domNode, listener) {
            this._register(dom.addDisposableListener(domNode, dom.EventType.KEY_UP, (e) => listener(new keyboardEvent_1.StandardKeyboardEvent(e))));
        }
        oninput(domNode, listener) {
            this._register(dom.addDisposableListener(domNode, dom.EventType.INPUT, listener));
        }
        onblur(domNode, listener) {
            this._register(dom.addDisposableListener(domNode, dom.EventType.BLUR, listener));
        }
        onfocus(domNode, listener) {
            this._register(dom.addDisposableListener(domNode, dom.EventType.FOCUS, listener));
        }
        onchange(domNode, listener) {
            this._register(dom.addDisposableListener(domNode, dom.EventType.CHANGE, listener));
        }
        ignoreGesture(domNode) {
            return touch_1.Gesture.ignoreTarget(domNode);
        }
    }
    exports.Widget = Widget;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9icm93c2VyL3VpL3dpZGdldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFRaEcsTUFBc0IsTUFBTyxTQUFRLHNCQUFVO1FBRXBDLE9BQU8sQ0FBQyxPQUFvQixFQUFFLFFBQWtDO1lBQ3pFLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQWEsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksK0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakksQ0FBQztRQUVTLFdBQVcsQ0FBQyxPQUFvQixFQUFFLFFBQWtDO1lBQzdFLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQWEsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksK0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEksQ0FBQztRQUVTLFdBQVcsQ0FBQyxPQUFvQixFQUFFLFFBQWtDO1lBQzdFLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQWEsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksK0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEksQ0FBQztRQUVTLFlBQVksQ0FBQyxPQUFvQixFQUFFLFFBQWtDO1lBQzlFLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQWEsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksK0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkksQ0FBQztRQUVTLFNBQVMsQ0FBQyxPQUFvQixFQUFFLFFBQXFDO1lBQzlFLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQWdCLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLHFDQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFJLENBQUM7UUFFUyxPQUFPLENBQUMsT0FBb0IsRUFBRSxRQUFxQztZQUM1RSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFnQixFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxxQ0FBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4SSxDQUFDO1FBRVMsT0FBTyxDQUFDLE9BQW9CLEVBQUUsUUFBNEI7WUFDbkUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDbkYsQ0FBQztRQUVTLE1BQU0sQ0FBQyxPQUFvQixFQUFFLFFBQTRCO1lBQ2xFLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ2xGLENBQUM7UUFFUyxPQUFPLENBQUMsT0FBb0IsRUFBRSxRQUE0QjtZQUNuRSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUNuRixDQUFDO1FBRVMsUUFBUSxDQUFDLE9BQW9CLEVBQUUsUUFBNEI7WUFDcEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDcEYsQ0FBQztRQUVTLGFBQWEsQ0FBQyxPQUFvQjtZQUMzQyxPQUFPLGVBQU8sQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdEMsQ0FBQztLQUNEO0lBN0NELHdCQTZDQyJ9