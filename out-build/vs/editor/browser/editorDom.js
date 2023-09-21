/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/globalPointerMoveMonitor", "vs/base/browser/mouseEvent", "vs/base/common/async", "vs/base/common/lifecycle", "vs/platform/theme/common/colorRegistry"], function (require, exports, dom, globalPointerMoveMonitor_1, mouseEvent_1, async_1, lifecycle_1, colorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$vW = exports.$uW = exports.$tW = exports.$sW = exports.$rW = exports.$qW = exports.$pW = exports.$oW = exports.$nW = exports.$mW = exports.$lW = void 0;
    /**
     * Coordinates relative to the whole document (e.g. mouse event's pageX and pageY)
     */
    class $lW {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this._pageCoordinatesBrand = undefined;
        }
        toClientCoordinates() {
            return new $mW(this.x - window.scrollX, this.y - window.scrollY);
        }
    }
    exports.$lW = $lW;
    /**
     * Coordinates within the application's client area (i.e. origin is document's scroll position).
     *
     * For example, clicking in the top-left corner of the client area will
     * always result in a mouse event with a client.x value of 0, regardless
     * of whether the page is scrolled horizontally.
     */
    class $mW {
        constructor(clientX, clientY) {
            this.clientX = clientX;
            this.clientY = clientY;
            this._clientCoordinatesBrand = undefined;
        }
        toPageCoordinates() {
            return new $lW(this.clientX + window.scrollX, this.clientY + window.scrollY);
        }
    }
    exports.$mW = $mW;
    /**
     * The position of the editor in the page.
     */
    class $nW {
        constructor(x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this._editorPagePositionBrand = undefined;
        }
    }
    exports.$nW = $nW;
    /**
     * Coordinates relative to the the (top;left) of the editor that can be used safely with other internal editor metrics.
     * **NOTE**: This position is obtained by taking page coordinates and transforming them relative to the
     * editor's (top;left) position in a way in which scale transformations are taken into account.
     * **NOTE**: These coordinates could be negative if the mouse position is outside the editor.
     */
    class $oW {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this._positionRelativeToEditorBrand = undefined;
        }
    }
    exports.$oW = $oW;
    function $pW(editorViewDomNode) {
        const editorPos = dom.$FO(editorViewDomNode);
        return new $nW(editorPos.left, editorPos.top, editorPos.width, editorPos.height);
    }
    exports.$pW = $pW;
    function $qW(editorViewDomNode, editorPagePosition, pos) {
        // The editor's page position is read from the DOM using getBoundingClientRect().
        //
        // getBoundingClientRect() returns the actual dimensions, while offsetWidth and offsetHeight
        // reflect the unscaled size. We can use this difference to detect a transform:scale()
        // and we will apply the transformation in inverse to get mouse coordinates that make sense inside the editor.
        //
        // This could be expanded to cover rotation as well maybe by walking the DOM up from `editorViewDomNode`
        // and computing the effective transformation matrix using getComputedStyle(element).transform.
        //
        const scaleX = editorPagePosition.width / editorViewDomNode.offsetWidth;
        const scaleY = editorPagePosition.height / editorViewDomNode.offsetHeight;
        // Adjust mouse offsets if editor appears to be scaled via transforms
        const relativeX = (pos.x - editorPagePosition.x) / scaleX;
        const relativeY = (pos.y - editorPagePosition.y) / scaleY;
        return new $oW(relativeX, relativeY);
    }
    exports.$qW = $qW;
    class $rW extends mouseEvent_1.$eO {
        constructor(e, isFromPointerCapture, editorViewDomNode) {
            super(e);
            this._editorMouseEventBrand = undefined;
            this.isFromPointerCapture = isFromPointerCapture;
            this.pos = new $lW(this.posx, this.posy);
            this.editorPos = $pW(editorViewDomNode);
            this.relativePos = $qW(editorViewDomNode, this.editorPos, this.pos);
        }
    }
    exports.$rW = $rW;
    class $sW {
        constructor(editorViewDomNode) {
            this.a = editorViewDomNode;
        }
        b(e) {
            return new $rW(e, false, this.a);
        }
        onContextMenu(target, callback) {
            return dom.$nO(target, 'contextmenu', (e) => {
                callback(this.b(e));
            });
        }
        onMouseUp(target, callback) {
            return dom.$nO(target, 'mouseup', (e) => {
                callback(this.b(e));
            });
        }
        onMouseDown(target, callback) {
            return dom.$nO(target, dom.$3O.MOUSE_DOWN, (e) => {
                callback(this.b(e));
            });
        }
        onPointerDown(target, callback) {
            return dom.$nO(target, dom.$3O.POINTER_DOWN, (e) => {
                callback(this.b(e), e.pointerId);
            });
        }
        onMouseLeave(target, callback) {
            return dom.$nO(target, dom.$3O.MOUSE_LEAVE, (e) => {
                callback(this.b(e));
            });
        }
        onMouseMove(target, callback) {
            return dom.$nO(target, 'mousemove', (e) => callback(this.b(e)));
        }
    }
    exports.$sW = $sW;
    class $tW {
        constructor(editorViewDomNode) {
            this.a = editorViewDomNode;
        }
        b(e) {
            return new $rW(e, false, this.a);
        }
        onPointerUp(target, callback) {
            return dom.$nO(target, 'pointerup', (e) => {
                callback(this.b(e));
            });
        }
        onPointerDown(target, callback) {
            return dom.$nO(target, dom.$3O.POINTER_DOWN, (e) => {
                callback(this.b(e), e.pointerId);
            });
        }
        onPointerLeave(target, callback) {
            return dom.$nO(target, dom.$3O.POINTER_LEAVE, (e) => {
                callback(this.b(e));
            });
        }
        onPointerMove(target, callback) {
            return dom.$nO(target, 'pointermove', (e) => callback(this.b(e)));
        }
    }
    exports.$tW = $tW;
    class $uW extends lifecycle_1.$kc {
        constructor(editorViewDomNode) {
            super();
            this.a = editorViewDomNode;
            this.b = this.B(new globalPointerMoveMonitor_1.$HP());
            this.c = null;
        }
        startMonitoring(initialElement, pointerId, initialButtons, pointerMoveCallback, onStopCallback) {
            // Add a <<capture>> keydown event listener that will cancel the monitoring
            // if something other than a modifier key is pressed
            this.c = dom.$oO(initialElement.ownerDocument, 'keydown', (e) => {
                const chord = e.toKeyCodeChord();
                if (chord.isModifierKey()) {
                    // Allow modifier keys
                    return;
                }
                this.b.stopMonitoring(true, e.browserEvent);
            }, true);
            this.b.startMonitoring(initialElement, pointerId, initialButtons, (e) => {
                pointerMoveCallback(new $rW(e, true, this.a));
            }, (e) => {
                this.c.dispose();
                onStopCallback(e);
            });
        }
        stopMonitoring() {
            this.b.stopMonitoring(true);
        }
    }
    exports.$uW = $uW;
    /**
     * A helper to create dynamic css rules, bound to a class name.
     * Rules are reused.
     * Reference counting and delayed garbage collection ensure that no rules leak.
    */
    class $vW {
        static { this.a = 0; }
        constructor(g) {
            this.g = g;
            this.b = ++$vW.a;
            this.c = 0;
            this.d = new Map();
            // We delay garbage collection so that hanging rules can be reused.
            this.f = new async_1.$Sg(() => this.j(), 1000);
        }
        createClassNameRef(options) {
            const rule = this.h(options);
            rule.increaseRefCount();
            return {
                className: rule.className,
                dispose: () => {
                    rule.decreaseRefCount();
                    this.f.schedule();
                }
            };
        }
        h(properties) {
            const key = this.i(properties);
            let existingRule = this.d.get(key);
            if (!existingRule) {
                const counter = this.c++;
                existingRule = new RefCountedCssRule(key, `dyn-rule-${this.b}-${counter}`, dom.$TO(this.g.getContainerDomNode())
                    ? this.g.getContainerDomNode()
                    : undefined, properties);
                this.d.set(key, existingRule);
            }
            return existingRule;
        }
        i(properties) {
            return JSON.stringify(properties);
        }
        j() {
            for (const rule of this.d.values()) {
                if (!rule.hasReferences()) {
                    this.d.delete(rule.key);
                    rule.dispose();
                }
            }
        }
    }
    exports.$vW = $vW;
    class RefCountedCssRule {
        constructor(key, className, _containerElement, properties) {
            this.key = key;
            this.className = className;
            this.properties = properties;
            this.a = 0;
            this.b = dom.$XO(_containerElement);
            this.b.textContent = this.c(this.className, this.properties);
        }
        c(className, properties) {
            let str = `.${className} {`;
            for (const prop in properties) {
                const value = properties[prop];
                let cssValue;
                if (typeof value === 'object') {
                    cssValue = (0, colorRegistry_1.$pv)(value.id);
                }
                else {
                    cssValue = value;
                }
                const cssPropName = camelToDashes(prop);
                str += `\n\t${cssPropName}: ${cssValue};`;
            }
            str += `\n}`;
            return str;
        }
        dispose() {
            this.b.remove();
        }
        increaseRefCount() {
            this.a++;
        }
        decreaseRefCount() {
            this.a--;
        }
        hasReferences() {
            return this.a > 0;
        }
    }
    function camelToDashes(str) {
        return str.replace(/(^[A-Z])/, ([first]) => first.toLowerCase())
            .replace(/([A-Z])/g, ([letter]) => `-${letter.toLowerCase()}`);
    }
});
//# sourceMappingURL=editorDom.js.map