/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/platform", "vs/base/browser/touch", "vs/base/common/lifecycle", "vs/editor/browser/controller/mouseHandler", "vs/editor/browser/editorDom", "vs/base/browser/canIUse", "vs/editor/browser/controller/textAreaInput"], function (require, exports, dom, platform, touch_1, lifecycle_1, mouseHandler_1, editorDom_1, canIUse_1, textAreaInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$dX = exports.$cX = void 0;
    /**
     * Currently only tested on iOS 13/ iPadOS.
     */
    class $cX extends mouseHandler_1.$6W {
        constructor(context, viewController, viewHelper) {
            super(context, viewController, viewHelper);
            this.B(touch_1.$EP.addTarget(this.c.linesContentDomNode));
            this.B(dom.$nO(this.c.linesContentDomNode, touch_1.EventType.Tap, (e) => this.J(e)));
            this.B(dom.$nO(this.c.linesContentDomNode, touch_1.EventType.Change, (e) => this.L(e)));
            this.B(dom.$nO(this.c.linesContentDomNode, touch_1.EventType.Contextmenu, (e) => this.z(new editorDom_1.$rW(e, false, this.c.viewDomNode), false)));
            this.I = 'mouse';
            this.B(dom.$nO(this.c.linesContentDomNode, 'pointerdown', (e) => {
                const pointerType = e.pointerType;
                if (pointerType === 'mouse') {
                    this.I = 'mouse';
                    return;
                }
                else if (pointerType === 'touch') {
                    this.I = 'touch';
                }
                else {
                    this.I = 'pen';
                }
            }));
            // PonterEvents
            const pointerEvents = new editorDom_1.$tW(this.c.viewDomNode);
            this.B(pointerEvents.onPointerMove(this.c.viewDomNode, (e) => this.C(e)));
            this.B(pointerEvents.onPointerUp(this.c.viewDomNode, (e) => this.F(e)));
            this.B(pointerEvents.onPointerLeave(this.c.viewDomNode, (e) => this.D(e)));
            this.B(pointerEvents.onPointerDown(this.c.viewDomNode, (e, pointerId) => this.G(e, pointerId)));
        }
        J(event) {
            if (!event.initialTarget || !this.c.linesContentDomNode.contains(event.initialTarget)) {
                return;
            }
            event.preventDefault();
            this.c.focusTextArea();
            const target = this.u(new editorDom_1.$rW(event, false, this.c.viewDomNode), false);
            if (target.position) {
                // this.viewController.moveTo(target.position);
                this.b.dispatchMouse({
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
        L(e) {
            if (this.I === 'touch') {
                this.a.viewModel.viewLayout.deltaScrollNow(-e.translationX, -e.translationY);
            }
        }
        G(e, pointerId) {
            if (e.browserEvent.pointerType === 'touch') {
                return;
            }
            super.G(e, pointerId);
        }
    }
    exports.$cX = $cX;
    class TouchHandler extends mouseHandler_1.$6W {
        constructor(context, viewController, viewHelper) {
            super(context, viewController, viewHelper);
            this.B(touch_1.$EP.addTarget(this.c.linesContentDomNode));
            this.B(dom.$nO(this.c.linesContentDomNode, touch_1.EventType.Tap, (e) => this.I(e)));
            this.B(dom.$nO(this.c.linesContentDomNode, touch_1.EventType.Change, (e) => this.J(e)));
            this.B(dom.$nO(this.c.linesContentDomNode, touch_1.EventType.Contextmenu, (e) => this.z(new editorDom_1.$rW(e, false, this.c.viewDomNode), false)));
        }
        I(event) {
            event.preventDefault();
            this.c.focusTextArea();
            const target = this.u(new editorDom_1.$rW(event, false, this.c.viewDomNode), false);
            if (target.position) {
                // Send the tap event also to the <textarea> (for input purposes)
                const event = document.createEvent('CustomEvent');
                event.initEvent(textAreaInput_1.TextAreaSyntethicEvents.Tap, false, true);
                this.c.dispatchTextAreaEvent(event);
                this.b.moveTo(target.position, 1 /* NavigationCommandRevealType.Minimal */);
            }
        }
        J(e) {
            this.a.viewModel.viewLayout.deltaScrollNow(-e.translationX, -e.translationY);
        }
    }
    class $dX extends lifecycle_1.$kc {
        constructor(context, viewController, viewHelper) {
            super();
            if ((platform.$q && canIUse_1.$bO.pointerEvents)) {
                this.a = this.B(new $cX(context, viewController, viewHelper));
            }
            else if (window.TouchEvent) {
                this.a = this.B(new TouchHandler(context, viewController, viewHelper));
            }
            else {
                this.a = this.B(new mouseHandler_1.$6W(context, viewController, viewHelper));
            }
        }
        getTargetAtClientPoint(clientX, clientY) {
            return this.a.getTargetAtClientPoint(clientX, clientY);
        }
    }
    exports.$dX = $dX;
});
//# sourceMappingURL=pointerHandler.js.map