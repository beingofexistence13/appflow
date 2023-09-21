/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/iterator", "vs/workbench/contrib/testing/common/testTypes", "vs/base/common/map"], function (require, exports, event_1, iterator_1, testTypes_1, map_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadTestCollection = void 0;
    class MainThreadTestCollection extends testTypes_1.AbstractIncrementalTestCollection {
        /**
         * @inheritdoc
         */
        get busyProviders() {
            return this.busyControllerCount;
        }
        /**
         * @inheritdoc
         */
        get rootItems() {
            return this.roots;
        }
        /**
         * @inheritdoc
         */
        get all() {
            return this.getIterator();
        }
        get rootIds() {
            return iterator_1.Iterable.map(this.roots.values(), r => r.item.extId);
        }
        constructor(expandActual) {
            super();
            this.expandActual = expandActual;
            this.testsByUrl = new map_1.ResourceMap();
            this.busyProvidersChangeEmitter = new event_1.Emitter();
            this.expandPromises = new WeakMap();
            this.onBusyProvidersChange = this.busyProvidersChangeEmitter.event;
            this.changeCollector = {
                add: node => {
                    if (!node.item.uri) {
                        return;
                    }
                    const s = this.testsByUrl.get(node.item.uri);
                    if (!s) {
                        this.testsByUrl.set(node.item.uri, new Set([node]));
                    }
                    else {
                        s.add(node);
                    }
                },
                remove: node => {
                    if (!node.item.uri) {
                        return;
                    }
                    const s = this.testsByUrl.get(node.item.uri);
                    if (!s) {
                        return;
                    }
                    s.delete(node);
                    if (s.size === 0) {
                        this.testsByUrl.delete(node.item.uri);
                    }
                },
            };
        }
        /**
         * @inheritdoc
         */
        expand(testId, levels) {
            const test = this.items.get(testId);
            if (!test) {
                return Promise.resolve();
            }
            // simple cache to avoid duplicate/unnecessary expansion calls
            const existing = this.expandPromises.get(test);
            if (existing && existing.pendingLvl >= levels) {
                return existing.prom;
            }
            const prom = this.expandActual(test.item.extId, levels);
            const record = { doneLvl: existing ? existing.doneLvl : -1, pendingLvl: levels, prom };
            this.expandPromises.set(test, record);
            return prom.then(() => {
                record.doneLvl = levels;
            });
        }
        /**
         * @inheritdoc
         */
        getNodeById(id) {
            return this.items.get(id);
        }
        /**
         * @inheritdoc
         */
        getNodeByUrl(uri) {
            return this.testsByUrl.get(uri) || iterator_1.Iterable.empty();
        }
        /**
         * @inheritdoc
         */
        getReviverDiff() {
            const ops = [{ op: 4 /* TestDiffOpType.IncrementPendingExtHosts */, amount: this.pendingRootCount }];
            const queue = [this.rootIds];
            while (queue.length) {
                for (const child of queue.pop()) {
                    const item = this.items.get(child);
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
            const prevBusy = this.busyControllerCount;
            super.apply(diff);
            if (prevBusy !== this.busyControllerCount) {
                this.busyProvidersChangeEmitter.fire(this.busyControllerCount);
            }
        }
        /**
         * Clears everything from the collection, and returns a diff that applies
         * that action.
         */
        clear() {
            const ops = [];
            for (const root of this.roots) {
                ops.push({ op: 3 /* TestDiffOpType.Remove */, itemId: root.item.extId });
            }
            this.roots.clear();
            this.items.clear();
            return ops;
        }
        /**
         * @override
         */
        createItem(internal) {
            return { ...internal, children: new Set() };
        }
        createChangeCollector() {
            return this.changeCollector;
        }
        *getIterator() {
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
    exports.MainThreadTestCollection = MainThreadTestCollection;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZFRlc3RDb2xsZWN0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVzdGluZy9jb21tb24vbWFpblRocmVhZFRlc3RDb2xsZWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVNoRyxNQUFhLHdCQUF5QixTQUFRLDZDQUFnRTtRQVU3Rzs7V0FFRztRQUNILElBQVcsYUFBYTtZQUN2QixPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQztRQUNqQyxDQUFDO1FBRUQ7O1dBRUc7UUFDSCxJQUFXLFNBQVM7WUFDbkIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ25CLENBQUM7UUFFRDs7V0FFRztRQUNILElBQVcsR0FBRztZQUNiLE9BQU8sSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNCLENBQUM7UUFFRCxJQUFXLE9BQU87WUFDakIsT0FBTyxtQkFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBSUQsWUFBNkIsWUFBMkQ7WUFDdkYsS0FBSyxFQUFFLENBQUM7WUFEb0IsaUJBQVksR0FBWixZQUFZLENBQStDO1lBcENoRixlQUFVLEdBQUcsSUFBSSxpQkFBVyxFQUFzQyxDQUFDO1lBRW5FLCtCQUEwQixHQUFHLElBQUksZUFBTyxFQUFVLENBQUM7WUFDbkQsbUJBQWMsR0FBRyxJQUFJLE9BQU8sRUFJaEMsQ0FBQztZQTJCVywwQkFBcUIsR0FBRyxJQUFJLENBQUMsMEJBQTBCLENBQUMsS0FBSyxDQUFDO1lBd0c3RCxvQkFBZSxHQUE4RDtnQkFDN0YsR0FBRyxFQUFFLElBQUksQ0FBQyxFQUFFO29CQUNYLElBQUksQ0FB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