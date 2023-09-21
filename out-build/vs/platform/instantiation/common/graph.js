/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$5p = exports.$4p = void 0;
    class $4p {
        constructor(key, data) {
            this.key = key;
            this.data = data;
            this.incoming = new Map();
            this.outgoing = new Map();
        }
    }
    exports.$4p = $4p;
    class $5p {
        constructor(b) {
            this.b = b;
            this.a = new Map();
            // empty
        }
        roots() {
            const ret = [];
            for (const node of this.a.values()) {
                if (node.outgoing.size === 0) {
                    ret.push(node);
                }
            }
            return ret;
        }
        insertEdge(from, to) {
            const fromNode = this.lookupOrInsertNode(from);
            const toNode = this.lookupOrInsertNode(to);
            fromNode.outgoing.set(toNode.key, toNode);
            toNode.incoming.set(fromNode.key, fromNode);
        }
        removeNode(data) {
            const key = this.b(data);
            this.a.delete(key);
            for (const node of this.a.values()) {
                node.outgoing.delete(key);
                node.incoming.delete(key);
            }
        }
        lookupOrInsertNode(data) {
            const key = this.b(data);
            let node = this.a.get(key);
            if (!node) {
                node = new $4p(key, data);
                this.a.set(key, node);
            }
            return node;
        }
        lookup(data) {
            return this.a.get(this.b(data));
        }
        isEmpty() {
            return this.a.size === 0;
        }
        toString() {
            const data = [];
            for (const [key, value] of this.a) {
                data.push(`${key}\n\t(-> incoming)[${[...value.incoming.keys()].join(', ')}]\n\t(outgoing ->)[${[...value.outgoing.keys()].join(',')}]\n`);
            }
            return data.join('\n');
        }
        /**
         * This is brute force and slow and **only** be used
         * to trouble shoot.
         */
        findCycleSlow() {
            for (const [id, node] of this.a) {
                const seen = new Set([id]);
                const res = this.c(node, seen);
                if (res) {
                    return res;
                }
            }
            return undefined;
        }
        c(node, seen) {
            for (const [id, outgoing] of node.outgoing) {
                if (seen.has(id)) {
                    return [...seen, id].join(' -> ');
                }
                seen.add(id);
                const value = this.c(outgoing, seen);
                if (value) {
                    return value;
                }
                seen.delete(id);
            }
            return undefined;
        }
    }
    exports.$5p = $5p;
});
//# sourceMappingURL=graph.js.map