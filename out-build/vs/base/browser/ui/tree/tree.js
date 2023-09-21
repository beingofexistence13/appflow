/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$0R = exports.$9R = exports.$8R = exports.TreeDragOverBubble = exports.TreeMouseEventTarget = exports.ObjectTreeElementCollapseState = exports.TreeVisibility = void 0;
    var TreeVisibility;
    (function (TreeVisibility) {
        /**
         * The tree node should be hidden.
         */
        TreeVisibility[TreeVisibility["Hidden"] = 0] = "Hidden";
        /**
         * The tree node should be visible.
         */
        TreeVisibility[TreeVisibility["Visible"] = 1] = "Visible";
        /**
         * The tree node should be visible if any of its descendants is visible.
         */
        TreeVisibility[TreeVisibility["Recurse"] = 2] = "Recurse";
    })(TreeVisibility || (exports.TreeVisibility = TreeVisibility = {}));
    var ObjectTreeElementCollapseState;
    (function (ObjectTreeElementCollapseState) {
        ObjectTreeElementCollapseState[ObjectTreeElementCollapseState["Expanded"] = 0] = "Expanded";
        ObjectTreeElementCollapseState[ObjectTreeElementCollapseState["Collapsed"] = 1] = "Collapsed";
        /**
         * If the element is already in the tree, preserve its current state. Else, expand it.
         */
        ObjectTreeElementCollapseState[ObjectTreeElementCollapseState["PreserveOrExpanded"] = 2] = "PreserveOrExpanded";
        /**
         * If the element is already in the tree, preserve its current state. Else, collapse it.
         */
        ObjectTreeElementCollapseState[ObjectTreeElementCollapseState["PreserveOrCollapsed"] = 3] = "PreserveOrCollapsed";
    })(ObjectTreeElementCollapseState || (exports.ObjectTreeElementCollapseState = ObjectTreeElementCollapseState = {}));
    var TreeMouseEventTarget;
    (function (TreeMouseEventTarget) {
        TreeMouseEventTarget[TreeMouseEventTarget["Unknown"] = 0] = "Unknown";
        TreeMouseEventTarget[TreeMouseEventTarget["Twistie"] = 1] = "Twistie";
        TreeMouseEventTarget[TreeMouseEventTarget["Element"] = 2] = "Element";
        TreeMouseEventTarget[TreeMouseEventTarget["Filter"] = 3] = "Filter";
    })(TreeMouseEventTarget || (exports.TreeMouseEventTarget = TreeMouseEventTarget = {}));
    var TreeDragOverBubble;
    (function (TreeDragOverBubble) {
        TreeDragOverBubble[TreeDragOverBubble["Down"] = 0] = "Down";
        TreeDragOverBubble[TreeDragOverBubble["Up"] = 1] = "Up";
    })(TreeDragOverBubble || (exports.TreeDragOverBubble = TreeDragOverBubble = {}));
    exports.$8R = {
        acceptBubbleUp() { return { accept: true, bubble: 1 /* TreeDragOverBubble.Up */ }; },
        acceptBubbleDown(autoExpand = false) { return { accept: true, bubble: 0 /* TreeDragOverBubble.Down */, autoExpand }; },
        acceptCopyBubbleUp() { return { accept: true, bubble: 1 /* TreeDragOverBubble.Up */, effect: 0 /* ListDragOverEffect.Copy */ }; },
        acceptCopyBubbleDown(autoExpand = false) { return { accept: true, bubble: 0 /* TreeDragOverBubble.Down */, effect: 0 /* ListDragOverEffect.Copy */, autoExpand }; }
    };
    class $9R extends Error {
        constructor(user, message) {
            super(`TreeError [${user}] ${message}`);
        }
    }
    exports.$9R = $9R;
    class $0R {
        constructor(a) {
            this.a = a;
            this.b = new WeakMap();
        }
        map(key) {
            let result = this.b.get(key);
            if (!result) {
                result = this.a(key);
                this.b.set(key, result);
            }
            return result;
        }
    }
    exports.$0R = $0R;
});
//# sourceMappingURL=tree.js.map