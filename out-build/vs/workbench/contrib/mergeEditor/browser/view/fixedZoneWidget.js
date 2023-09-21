/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/base/common/event"], function (require, exports, dom_1, lifecycle_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$RSb = void 0;
    class $RSb extends lifecycle_1.$kc {
        static { this.a = 0; }
        constructor(j, viewZoneAccessor, afterLineNumber, height, viewZoneIdsToCleanUp) {
            super();
            this.j = j;
            this.b = `fixedZoneWidget-${$RSb.a++}`;
            this.f = (0, dom_1.h)('div.fixed-zone-widget').root;
            this.g = {
                getId: () => this.b,
                getDomNode: () => this.f,
                getPosition: () => null
            };
            this.c = viewZoneAccessor.addZone({
                domNode: document.createElement('div'),
                afterLineNumber: afterLineNumber,
                heightInPx: height,
                onComputedHeight: (height) => {
                    this.f.style.height = `${height}px`;
                },
                onDomNodeTop: (top) => {
                    this.f.style.top = `${top}px`;
                }
            });
            viewZoneIdsToCleanUp.push(this.c);
            this.B(event_1.Event.runAndSubscribe(this.j.onDidLayoutChange, () => {
                this.f.style.left = this.j.getLayoutInfo().contentLeft + 'px';
            }));
            this.j.addOverlayWidget(this.g);
            this.B({
                dispose: () => {
                    this.j.removeOverlayWidget(this.g);
                },
            });
        }
    }
    exports.$RSb = $RSb;
});
//# sourceMappingURL=fixedZoneWidget.js.map