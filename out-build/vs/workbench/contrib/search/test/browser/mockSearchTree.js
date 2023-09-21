/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event"], function (require, exports, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Ofc = void 0;
    const someEvent = new event_1.$fd().event;
    /**
     * Add stub methods as needed
     */
    class $Ofc {
        get onDidChangeFocus() { return someEvent; }
        get onDidChangeSelection() { return someEvent; }
        get onDidOpen() { return someEvent; }
        get onMouseClick() { return someEvent; }
        get onMouseDblClick() { return someEvent; }
        get onContextMenu() { return someEvent; }
        get onKeyDown() { return someEvent; }
        get onKeyUp() { return someEvent; }
        get onKeyPress() { return someEvent; }
        get onDidFocus() { return someEvent; }
        get onDidBlur() { return someEvent; }
        get onDidChangeCollapseState() { return someEvent; }
        get onDidChangeRenderNodeCount() { return someEvent; }
        get onDidDispose() { return someEvent; }
        get lastVisibleElement() { return this.a[this.a.length - 1]; }
        constructor(a) {
            this.a = a;
        }
        domFocus() { }
        collapse(location, recursive = false) {
            return true;
        }
        expand(location, recursive = false) {
            return true;
        }
        navigate(start) {
            const startIdx = start ? this.a.indexOf(start) :
                undefined;
            return new ArrayNavigator(this.a, startIdx);
        }
        getParentElement(elem) {
            return elem.parent();
        }
        dispose() {
        }
    }
    exports.$Ofc = $Ofc;
    class ArrayNavigator {
        constructor(a, b = 0) {
            this.a = a;
            this.b = b;
        }
        current() {
            return this.a[this.b];
        }
        previous() {
            return this.a[--this.b];
        }
        first() {
            this.b = 0;
            return this.a[this.b];
        }
        last() {
            this.b = this.a.length - 1;
            return this.a[this.b];
        }
        next() {
            return this.a[++this.b];
        }
    }
});
//# sourceMappingURL=mockSearchTree.js.map