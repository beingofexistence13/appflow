/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/globalPointerMoveMonitor", "vs/base/browser/mouseEvent", "vs/base/common/async", "vs/base/common/lifecycle", "vs/platform/theme/common/colorRegistry"], function (require, exports, dom, globalPointerMoveMonitor_1, mouseEvent_1, async_1, lifecycle_1, colorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DynamicCssRules = exports.GlobalEditorPointerMoveMonitor = exports.EditorPointerEventFactory = exports.EditorMouseEventFactory = exports.EditorMouseEvent = exports.createCoordinatesRelativeToEditor = exports.createEditorPagePosition = exports.CoordinatesRelativeToEditor = exports.EditorPagePosition = exports.ClientCoordinates = exports.PageCoordinates = void 0;
    /**
     * Coordinates relative to the whole document (e.g. mouse event's pageX and pageY)
     */
    class PageCoordinates {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this._pageCoordinatesBrand = undefined;
        }
        toClientCoordinates() {
            return new ClientCoordinates(this.x - window.scrollX, this.y - window.scrollY);
        }
    }
    exports.PageCoordinates = PageCoordinates;
    /**
     * Coordinates within the application's client area (i.e. origin is document's scroll position).
     *
     * For example, clicking in the top-left corner of the client area will
     * always result in a mouse event with a client.x value of 0, regardless
     * of whether the page is scrolled horizontally.
     */
    class ClientCoordinates {
        constructor(clientX, clientY) {
            this.clientX = clientX;
            this.clientY = clientY;
            this._clientCoordinatesBrand = undefined;
        }
        toPageCoordinates() {
            return new PageCoordinates(this.clientX + window.scrollX, this.clientY + window.scrollY);
        }
    }
    exports.ClientCoordinates = ClientCoordinates;
    /**
     * The position of the editor in the page.
     */
    class EditorPagePosition {
        constructor(x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this._editorPagePositionBrand = undefined;
        }
    }
    exports.EditorPagePosition = EditorPagePosition;
    /**
     * Coordinates relative to the the (top;left) of the editor that can be used safely with other internal editor metrics.
     * **NOTE**: This position is obtained by taking page coordinates and transforming them relative to the
     * editor's (top;left) position in a way in which scale transformations are taken into account.
     * **NOTE**: These coordinates could be negative if the mouse position is outside the editor.
     */
    class CoordinatesRelativeToEditor {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this._positionRelativeToEditorBrand = undefined;
        }
    }
    exports.CoordinatesRelativeToEditor = CoordinatesRelativeToEditor;
    function createEditorPagePosition(editorViewDomNode) {
        const editorPos = dom.getDomNodePagePosition(editorViewDomNode);
        return new EditorPagePosition(editorPos.left, editorPos.top, editorPos.width, editorPos.height);
    }
    exports.createEditorPagePosition = createEditorPagePosition;
    function createCoordinatesRelativeToEditor(editorViewDomNode, editorPagePosition, pos) {
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
        return new CoordinatesRelativeToEditor(relativeX, relativeY);
    }
    exports.createCoordinatesRelativeToEditor = createCoordinatesRelativeToEditor;
    class EditorMouseEvent extends mouseEvent_1.StandardMouseEvent {
        constructor(e, isFromPointerCapture, editorViewDomNode) {
            super(e);
            this._editorMouseEventBrand = undefined;
            this.isFromPointerCapture = isFromPointerCapture;
            this.pos = new PageCoordinates(this.posx, this.posy);
            this.editorPos = createEditorPagePosition(editorViewDomNode);
            this.relativePos = createCoordinatesRelativeToEditor(editorViewDomNode, this.editorPos, this.pos);
        }
    }
    exports.EditorMouseEvent = EditorMouseEvent;
    class EditorMouseEventFactory {
        constructor(editorViewDomNode) {
            this._editorViewDomNode = editorViewDomNode;
        }
        _create(e) {
            return new EditorMouseEvent(e, false, this._editorViewDomNode);
        }
        onContextMenu(target, callback) {
            return dom.addDisposableListener(target, 'contextmenu', (e) => {
                callback(this._create(e));
            });
        }
        onMouseUp(target, callback) {
            return dom.addDisposableListener(target, 'mouseup', (e) => {
                callback(this._create(e));
            });
        }
        onMouseDown(target, callback) {
            return dom.addDisposableListener(target, dom.EventType.MOUSE_DOWN, (e) => {
                callback(this._create(e));
            });
        }
        onPointerDown(target, callback) {
            return dom.addDisposableListener(target, dom.EventType.POINTER_DOWN, (e) => {
                callback(this._create(e), e.pointerId);
            });
        }
        onMouseLeave(target, callback) {
            return dom.addDisposableListener(target, dom.EventType.MOUSE_LEAVE, (e) => {
                callback(this._create(e));
            });
        }
        onMouseMove(target, callback) {
            return dom.addDisposableListener(target, 'mousemove', (e) => callback(this._create(e)));
        }
    }
    exports.EditorMouseEventFactory = EditorMouseEventFactory;
    class EditorPointerEventFactory {
        constructor(editorViewDomNode) {
            this._editorViewDomNode = editorViewDomNode;
        }
        _create(e) {
            return new EditorMouseEvent(e, false, this._editorViewDomNode);
        }
        onPointerUp(target, callback) {
            return dom.addDisposableListener(target, 'pointerup', (e) => {
                callback(this._create(e));
            });
        }
        onPointerDown(target, callback) {
            return dom.addDisposableListener(target, dom.EventType.POINTER_DOWN, (e) => {
                callback(this._create(e), e.pointerId);
            });
        }
        onPointerLeave(target, callback) {
            return dom.addDisposableListener(target, dom.EventType.POINTER_LEAVE, (e) => {
                callback(this._create(e));
            });
        }
        onPointerMove(target, callback) {
            return dom.addDisposableListener(target, 'pointermove', (e) => callback(this._create(e)));
        }
    }
    exports.EditorPointerEventFactory = EditorPointerEventFactory;
    class GlobalEditorPointerMoveMonitor extends lifecycle_1.Disposable {
        constructor(editorViewDomNode) {
            super();
            this._editorViewDomNode = editorViewDomNode;
            this._globalPointerMoveMonitor = this._register(new globalPointerMoveMonitor_1.GlobalPointerMoveMonitor());
            this._keydownListener = null;
        }
        startMonitoring(initialElement, pointerId, initialButtons, pointerMoveCallback, onStopCallback) {
            // Add a <<capture>> keydown event listener that will cancel the monitoring
            // if something other than a modifier key is pressed
            this._keydownListener = dom.addStandardDisposableListener(initialElement.ownerDocument, 'keydown', (e) => {
                const chord = e.toKeyCodeChord();
                if (chord.isModifierKey()) {
                    // Allow modifier keys
                    return;
                }
                this._globalPointerMoveMonitor.stopMonitoring(true, e.browserEvent);
            }, true);
            this._globalPointerMoveMonitor.startMonitoring(initialElement, pointerId, initialButtons, (e) => {
                pointerMoveCallback(new EditorMouseEvent(e, true, this._editorViewDomNode));
            }, (e) => {
                this._keydownListener.dispose();
                onStopCallback(e);
            });
        }
        stopMonitoring() {
            this._globalPointerMoveMonitor.stopMonitoring(true);
        }
    }
    exports.GlobalEditorPointerMoveMonitor = GlobalEditorPointerMoveMonitor;
    /**
     * A helper to create dynamic css rules, bound to a class name.
     * Rules are reused.
     * Reference counting and delayed garbage collection ensure that no rules leak.
    */
    class DynamicCssRules {
        static { this._idPool = 0; }
        constructor(_editor) {
            this._editor = _editor;
            this._instanceId = ++DynamicCssRules._idPool;
            this._counter = 0;
            this._rules = new Map();
            // We delay garbage collection so that hanging rules can be reused.
            this._garbageCollectionScheduler = new async_1.RunOnceScheduler(() => this.garbageCollect(), 1000);
        }
        createClassNameRef(options) {
            const rule = this.getOrCreateRule(options);
            rule.increaseRefCount();
            return {
                className: rule.className,
                dispose: () => {
                    rule.decreaseRefCount();
                    this._garbageCollectionScheduler.schedule();
                }
            };
        }
        getOrCreateRule(properties) {
            const key = this.computeUniqueKey(properties);
            let existingRule = this._rules.get(key);
            if (!existingRule) {
                const counter = this._counter++;
                existingRule = new RefCountedCssRule(key, `dyn-rule-${this._instanceId}-${counter}`, dom.isInShadowDOM(this._editor.getContainerDomNode())
                    ? this._editor.getContainerDomNode()
                    : undefined, properties);
                this._rules.set(key, existingRule);
            }
            return existingRule;
        }
        computeUniqueKey(properties) {
            return JSON.stringify(properties);
        }
        garbageCollect() {
            for (const rule of this._rules.values()) {
                if (!rule.hasReferences()) {
                    this._rules.delete(rule.key);
                    rule.dispose();
                }
            }
        }
    }
    exports.DynamicCssRules = DynamicCssRules;
    class RefCountedCssRule {
        constructor(key, className, _containerElement, properties) {
            this.key = key;
            this.className = className;
            this.properties = properties;
            this._referenceCount = 0;
            this._styleElement = dom.createStyleSheet(_containerElement);
            this._styleElement.textContent = this.getCssText(this.className, this.properties);
        }
        getCssText(className, properties) {
            let str = `.${className} {`;
            for (const prop in properties) {
                const value = properties[prop];
                let cssValue;
                if (typeof value === 'object') {
                    cssValue = (0, colorRegistry_1.asCssVariable)(value.id);
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
            this._styleElement.remove();
        }
        increaseRefCount() {
            this._referenceCount++;
        }
        decreaseRefCount() {
            this._referenceCount--;
        }
        hasReferences() {
            return this._referenceCount > 0;
        }
    }
    function camelToDashes(str) {
        return str.replace(/(^[A-Z])/, ([first]) => first.toLowerCase())
            .replace(/([A-Z])/g, ([letter]) => `-${letter.toLowerCase()}`);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yRG9tLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2Jyb3dzZXIvZWRpdG9yRG9tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVdoRzs7T0FFRztJQUNILE1BQWEsZUFBZTtRQUczQixZQUNpQixDQUFTLEVBQ1QsQ0FBUztZQURULE1BQUMsR0FBRCxDQUFDLENBQVE7WUFDVCxNQUFDLEdBQUQsQ0FBQyxDQUFRO1lBSjFCLDBCQUFxQixHQUFTLFNBQVMsQ0FBQztRQUtwQyxDQUFDO1FBRUUsbUJBQW1CO1lBQ3pCLE9BQU8sSUFBSSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDaEYsQ0FBQztLQUNEO0lBWEQsMENBV0M7SUFFRDs7Ozs7O09BTUc7SUFDSCxNQUFhLGlCQUFpQjtRQUc3QixZQUNpQixPQUFlLEVBQ2YsT0FBZTtZQURmLFlBQU8sR0FBUCxPQUFPLENBQVE7WUFDZixZQUFPLEdBQVAsT0FBTyxDQUFRO1lBSmhDLDRCQUF1QixHQUFTLFNBQVMsQ0FBQztRQUt0QyxDQUFDO1FBRUUsaUJBQWlCO1lBQ3ZCLE9BQU8sSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzFGLENBQUM7S0FDRDtJQVhELDhDQVdDO0lBRUQ7O09BRUc7SUFDSCxNQUFhLGtCQUFrQjtRQUc5QixZQUNpQixDQUFTLEVBQ1QsQ0FBUyxFQUNULEtBQWEsRUFDYixNQUFjO1lBSGQsTUFBQyxHQUFELENBQUMsQ0FBUTtZQUNULE1BQUMsR0FBRCxDQUFDLENBQVE7WUFDVCxVQUFLLEdBQUws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