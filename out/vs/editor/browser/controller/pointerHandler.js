/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/platform", "vs/base/browser/touch", "vs/base/common/lifecycle", "vs/editor/browser/controller/mouseHandler", "vs/editor/browser/editorDom", "vs/base/browser/canIUse", "vs/editor/browser/controller/textAreaInput"], function (require, exports, dom, platform, touch_1, lifecycle_1, mouseHandler_1, editorDom_1, canIUse_1, textAreaInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PointerHandler = exports.PointerEventHandler = void 0;
    /**
     * Currently only tested on iOS 13/ iPadOS.
     */
    class PointerEventHandler extends mouseHandler_1.MouseHandler {
        constructor(context, viewController, viewHelper) {
            super(context, viewController, viewHelper);
            this._register(touch_1.Gesture.addTarget(this.viewHelper.linesContentDomNode));
            this._register(dom.addDisposableListener(this.viewHelper.linesContentDomNode, touch_1.EventType.Tap, (e) => this.onTap(e)));
            this._register(dom.addDisposableListener(this.viewHelper.linesContentDomNode, touch_1.EventType.Change, (e) => this.onChange(e)));
            this._register(dom.addDisposableListener(this.viewHelper.linesContentDomNode, touch_1.EventType.Contextmenu, (e) => this._onContextMenu(new editorDom_1.EditorMouseEvent(e, false, this.viewHelper.viewDomNode), false)));
            this._lastPointerType = 'mouse';
            this._register(dom.addDisposableListener(this.viewHelper.linesContentDomNode, 'pointerdown', (e) => {
                const pointerType = e.pointerType;
                if (pointerType === 'mouse') {
                    this._lastPointerType = 'mouse';
                    return;
                }
                else if (pointerType === 'touch') {
                    this._lastPointerType = 'touch';
                }
                else {
                    this._lastPointerType = 'pen';
                }
            }));
            // PonterEvents
            const pointerEvents = new editorDom_1.EditorPointerEventFactory(this.viewHelper.viewDomNode);
            this._register(pointerEvents.onPointerMove(this.viewHelper.viewDomNode, (e) => this._onMouseMove(e)));
            this._register(pointerEvents.onPointerUp(this.viewHelper.viewDomNode, (e) => this._onMouseUp(e)));
            this._register(pointerEvents.onPointerLeave(this.viewHelper.viewDomNode, (e) => this._onMouseLeave(e)));
            this._register(pointerEvents.onPointerDown(this.viewHelper.viewDomNode, (e, pointerId) => this._onMouseDown(e, pointerId)));
        }
        onTap(event) {
            if (!event.initialTarget || !this.viewHelper.linesContentDomNode.contains(event.initialTarget)) {
                return;
            }
            event.preventDefault();
            this.viewHelper.focusTextArea();
            const target = this._createMouseTarget(new editorDom_1.EditorMouseEvent(event, false, this.viewHelper.viewDomNode), false);
            if (target.position) {
                // this.viewController.moveTo(target.position);
                this.viewController.dispatchMouse({
                    position: target.position,
                    mouseColumn: target.position.column,
                    startedOnLineNumbers: false,
                    revealType: 1 /* NavigationCommandRevealType.Minimal */,
                    mouseDownCount: event.tapCount,
                    inSelectionMode: false,
                    altKey: false,
                    ctrlKey: false,
                    metaKey: false,
                    shiftKey: false,
                    leftButton: false,
                    middleButton: false,
                    onInjectedText: target.type === 6 /* MouseTargetType.CONTENT_TEXT */ && target.detail.injectedText !== null
                });
            }
        }
        onChange(e) {
            if (this._lastPointerType === 'touch') {
                this._context.viewModel.viewLayout.deltaScrollNow(-e.translationX, -e.translationY);
            }
        }
        _onMouseDown(e, pointerId) {
            if (e.browserEvent.pointerType === 'touch') {
                return;
            }
            super._onMouseDown(e, pointerId);
        }
    }
    exports.PointerEventHandler = PointerEventHandler;
    class TouchHandler extends mouseHandler_1.MouseHandler {
        constructor(context, viewController, viewHelper) {
            super(context, viewController, viewHelper);
            this._register(touch_1.Gesture.addTarget(this.viewHelper.linesContentDomNode));
            this._register(dom.addDisposableListener(this.viewHelper.linesContentDomNode, touch_1.EventType.Tap, (e) => this.onTap(e)));
            this._register(dom.addDisposableListener(this.viewHelper.linesContentDomNode, touch_1.EventType.Change, (e) => this.onChange(e)));
            this._register(dom.addDisposableListener(this.viewHelper.linesContentDomNode, touch_1.EventType.Contextmenu, (e) => this._onContextMenu(new editorDom_1.EditorMouseEvent(e, false, this.viewHelper.viewDomNode), false)));
        }
        onTap(event) {
            event.preventDefault();
            this.viewHelper.focusTextArea();
            const target = this._createMouseTarget(new editorDom_1.EditorMouseEvent(event, false, this.viewHelper.viewDomNode), false);
            if (target.position) {
                // Send the tap event also to the <textarea> (for input purposes)
                const event = document.createEvent('CustomEvent');
                event.initEvent(textAreaInput_1.TextAreaSyntethicEvents.Tap, false, true);
                this.viewHelper.dispatchTextAreaEvent(event);
                this.viewController.moveTo(target.position, 1 /* NavigationCommandRevealType.Minimal */);
            }
        }
        onChange(e) {
            this._context.viewModel.viewLayout.deltaScrollNow(-e.translationX, -e.translationY);
        }
    }
    class PointerHandler extends lifecycle_1.Disposable {
        constructor(context, viewController, viewHelper) {
            super();
            if ((platform.isIOS && canIUse_1.BrowserFeatures.pointerEvents)) {
                this.handler = this._register(new PointerEventHandler(context, viewController, viewHelper));
            }
            else if (window.TouchEvent) {
                this.handler = this._register(new TouchHandler(context, viewController, viewHelper));
            }
            else {
                this.handler = this._register(new mouseHandler_1.MouseHandler(context, viewController, viewHelper));
            }
        }
        getTargetAtClientPoint(clientX, clientY) {
            return this.handler.getTargetAtClientPoint(clientX, clientY);
        }
    }
    exports.PointerHandler = PointerHandler;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9pbnRlckhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvYnJvd3Nlci9jb250cm9sbGVyL3BvaW50ZXJIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWVoRzs7T0FFRztJQUNILE1BQWEsbUJBQW9CLFNBQVEsMkJBQVk7UUFFcEQsWUFBWSxPQUFvQixFQUFFLGNBQThCLEVBQUUsVUFBaUM7WUFDbEcsS0FBSyxDQUFDLE9BQU8sRUFBRSxjQUFjLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFFM0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO1lBQ3ZFLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsbUJBQW1CLEVBQUUsaUJBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BILElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsbUJBQW1CLEVBQUUsaUJBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFILElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsbUJBQW1CLEVBQUUsaUJBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFhLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSw0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