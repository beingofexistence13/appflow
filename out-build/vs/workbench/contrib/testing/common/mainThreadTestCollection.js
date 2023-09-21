/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/iterator", "vs/workbench/contrib/testing/common/testTypes", "vs/base/common/map"], function (require, exports, event_1, iterator_1, testTypes_1, map_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$OKb = void 0;
    class $OKb extends testTypes_1.$WI {
        /**
         * @inheritdoc
         */
        get busyProviders() {
            return this.h;
        }
        /**
         * @inheritdoc
         */
        get rootItems() {
            return this.g;
        }
        /**
         * @inheritdoc
         */
        get all() {
            return this.w();
        }
        get rootIds() {
            return iterator_1.Iterable.map(this.g.values(), r => r.item.extId);
        }
        constructor(e) {
            super();
            this.e = e;
            this.a = new map_1.$zi();
            this.b = new event_1.$fd();
            this.c = new WeakMap();
            this.onBusyProvidersChange = this.b.event;
            this.n = {
                add: node => {
                    if (!node.item.uri) {
                        return;
                    }
                    const s = this.a.get(node.item.uri);
                    if (!s) {
                        this.a.set(node.item.uri, new Set([node]));
                    }
                    else {
                        s.add(node);
                    }
                },
                remove: node => {
                    if (!node.item.uri) {
                        return;
                    }
                    const s = this.a.get(node.item.uri);
                    if (!s) {
                        return;
                    }
                    s.delete(node);
                    if (s.size === 0) {
                        this.a.delete(node.item.uri);
                    }
                },
            };
        }
        /**
         * @inheritdoc
         */
        expand(testId, levels) {
            const test = this.f.get(testId);
            if (!test) {
                return Promise.resolve();
            }
            // simple cache to avoid duplicate/unnecessary expansion calls
            const existing = this.c.get(test);
            if (existing && existing.pendingLvl >= levels) {
                return existing.prom;
            }
            const prom = this.e(test.item.extId, levels);
            const record = { doneLvl: existing ? existing.doneLvl : -1, pendingLvl: levels, prom };
            this.c.set(test, record);
            return prom.then(() => {
                record.doneLvl = levels;
            });
        }
        /**
         * @inheritdoc
         */
        getNodeById(id) {
            return this.f.get(id);
        }
        /**
         * @inheritdoc
         */
        getNodeByUrl(uri) {
            return this.a.get(uri) || iterator_1.Iterable.empty();
        }
        /**
         * @inheritdoc
         */
        getReviverDiff() {
            const ops = [{ op: 4 /* TestDiffOpType.IncrementPendingExtHosts */, amount: this.j }];
            const queue = [this.rootIds];
            while (queue.length) {
                for (const child of queue.pop()) {
                    const item = this.f.get(child);
                    ops.push({
                        op: 0 /* TestDiffOpType.Add */,
                        item: {
                            controllerId: item.controllerId,
                            expand: item.expand,
                            item: item.item,
                        }
                    });
                    queue.push(item.children);
                }
            }
            return ops;
        }
        /**
         * Applies the diff to the collection.
         */
        apply(diff) {
            const prevBusy = this.h;
            super.apply(diff);
            if (prevBusy !== this.h) {
                this.b.fire(this.h);
            }
        }
        /**
         * Clears everything from the collection, and returns a diff that applies
         * that action.
         */
        clear() {
            const ops = [];
            for (const root of this.g) {
                ops.push({ op: 3 /* TestDiffOpType.Remove */, itemId: root.item.extId });
            }
            this.g.clear();
            this.f.clear();
            return ops;
        }
        /**
         * @override
         */
        q(internal) {
            return { ...internal, children: new Set() };
        }
        p() {
            return this.n;
        }
        *w() {
            const queue = [this.rootIds];
            while (queue.length) {
                for (const id of queue.pop()) {
                    const node = this.getNodeById(id);
                    yield node;
                    queue.push(node.children);
                }
            }
        }
    }
    exports.$OKb = $OKb;
});
//# sourceMappingURL=mainThreadTestCollection.js.map