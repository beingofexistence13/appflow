/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$PI = exports.TestPosition = exports.TestIdPathParts = void 0;
    var TestIdPathParts;
    (function (TestIdPathParts) {
        /** Delimiter for path parts in test IDs */
        TestIdPathParts["Delimiter"] = "\0";
    })(TestIdPathParts || (exports.TestIdPathParts = TestIdPathParts = {}));
    /**
     * Enum for describing relative positions of tests. Similar to
     * `node.compareDocumentPosition` in the DOM.
     */
    var TestPosition;
    (function (TestPosition) {
        /** a === b */
        TestPosition[TestPosition["IsSame"] = 0] = "IsSame";
        /** Neither a nor b are a child of one another. They may share a common parent, though. */
        TestPosition[TestPosition["Disconnected"] = 1] = "Disconnected";
        /** b is a child of a */
        TestPosition[TestPosition["IsChild"] = 2] = "IsChild";
        /** b is a parent of a */
        TestPosition[TestPosition["IsParent"] = 3] = "IsParent";
    })(TestPosition || (exports.TestPosition = TestPosition = {}));
    /**
     * The test ID is a stringifiable client that
     */
    class $PI {
        /**
         * Creates a test ID from an ext host test item.
         */
        static fromExtHostTestItem(item, rootId, parent = item.parent) {
            if (item._isRoot) {
                return new $PI([rootId]);
            }
            const path = [item.id];
            for (let i = parent; i && i.id !== rootId; i = i.parent) {
                path.push(i.id);
            }
            path.push(rootId);
            return new $PI(path.reverse());
        }
        /**
         * Cheaply ets whether the ID refers to the root .
         */
        static isRoot(idString) {
            return !idString.includes("\0" /* TestIdPathParts.Delimiter */);
        }
        /**
         * Cheaply gets whether the ID refers to the root .
         */
        static root(idString) {
            const idx = idString.indexOf("\0" /* TestIdPathParts.Delimiter */);
            return idx === -1 ? idString : idString.slice(0, idx);
        }
        /**
         * Creates a test ID from a serialized TestId instance.
         */
        static fromString(idString) {
            return new $PI(idString.split("\0" /* TestIdPathParts.Delimiter */));
        }
        /**
         * Gets the ID resulting from adding b to the base ID.
         */
        static join(base, b) {
            return new $PI([...base.path, b]);
        }
        /**
         * Gets the string ID resulting from adding b to the base ID.
         */
        static joinToString(base, b) {
            return base.toString() + "\0" /* TestIdPathParts.Delimiter */ + b;
        }
        /**
         * Cheaply gets the parent ID of a test identified with the string.
         */
        static parentId(idString) {
            const idx = idString.lastIndexOf("\0" /* TestIdPathParts.Delimiter */);
            return idx === -1 ? undefined : idString.slice(0, idx);
        }
        /**
         * Cheaply gets the local ID of a test identified with the string.
         */
        static localId(idString) {
            const idx = idString.lastIndexOf("\0" /* TestIdPathParts.Delimiter */);
            return idx === -1 ? idString : idString.slice(idx + "\0" /* TestIdPathParts.Delimiter */.length);
        }
        /**
         * Gets whether maybeChild is a child of maybeParent.
         * todo@connor4312: review usages of this to see if using the WellDefinedPrefixTree is better
         */
        static isChild(maybeParent, maybeChild) {
            return maybeChild.startsWith(maybeParent) && maybeChild[maybeParent.length] === "\0" /* TestIdPathParts.Delimiter */;
        }
        /**
         * Compares the position of the two ID strings.
         * todo@connor4312: review usages of this to see if using the WellDefinedPrefixTree is better
         */
        static compare(a, b) {
            if (a === b) {
                return 0 /* TestPosition.IsSame */;
            }
            if ($PI.isChild(a, b)) {
                return 2 /* TestPosition.IsChild */;
            }
            if ($PI.isChild(b, a)) {
                return 3 /* TestPosition.IsParent */;
            }
            return 1 /* TestPosition.Disconnected */;
        }
        constructor(path, d = path.length) {
            this.path = path;
            this.d = d;
            if (path.length === 0 || d < 1) {
                throw new Error('cannot create test with empty path');
            }
        }
        /**
         * Gets the ID of the parent test.
         */
        get rootId() {
            return new $PI(this.path, 1);
        }
        /**
         * Gets the ID of the parent test.
         */
        get parentId() {
            return this.d > 1 ? new $PI(this.path, this.d - 1) : undefined;
        }
        /**
         * Gets the local ID of the current full test ID.
         */
        get localId() {
            return this.path[this.d - 1];
        }
        /**
         * Gets whether this ID refers to the root.
         */
        get controllerId() {
            return this.path[0];
        }
        /**
         * Gets whether this ID refers to the root.
         */
        get isRoot() {
            return this.d === 1;
        }
        /**
         * Returns an iterable that yields IDs of all parent items down to and
         * including the current item.
         */
        *idsFromRoot() {
            for (let i = 1; i <= this.d; i++) {
                yield new $PI(this.path, i);
            }
        }
        /**
         * Returns an iterable that yields IDs of the current item up to the root
         * item.
         */
        *idsToRoot() {
            for (let i = this.d; i > 0; i--) {
                yield new $PI(this.path, i);
            }
        }
        /**
         * Compares the other test ID with this one.
         */
        compare(other) {
            if (typeof other === 'string') {
                return $PI.compare(this.toString(), other);
            }
            for (let i = 0; i < other.d && i < this.d; i++) {
                if (other.path[i] !== this.path[i]) {
                    return 1 /* TestPosition.Disconnected */;
                }
            }
            if (other.d > this.d) {
                return 2 /* TestPosition.IsChild */;
            }
            if (other.d < this.d) {
                return 3 /* TestPosition.IsParent */;
            }
            return 0 /* TestPosition.IsSame */;
        }
        /**
         * Serializes the ID.
         */
        toJSON() {
            return this.toString();
        }
        /**
         * Serializes the ID to a string.
         */
        toString() {
            if (!this.c) {
                this.c = this.path[0];
                for (let i = 1; i < this.d; i++) {
                    this.c += "\0" /* TestIdPathParts.Delimiter */;
                    this.c += this.path[i];
                }
            }
            return this.c;
        }
    }
    exports.$PI = $PI;
});
//# sourceMappingURL=testId.js.map