/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/workbench/contrib/testing/common/mainThreadTestCollection", "vs/workbench/contrib/testing/common/testId", "vs/workbench/contrib/testing/common/testItemCollection"], function (require, exports, uri_1, mainThreadTestCollection_1, testId_1, testItemCollection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$$fc = exports.$0fc = exports.$9fc = exports.$8fc = void 0;
    class $8fc {
        get tags() {
            return this.d.tags.map(id => ({ id }));
        }
        set tags(value) {
            this.api.listener?.({ op: 1 /* TestItemEventOp.SetTags */, new: value, old: this.d.tags.map(t => ({ id: t })) });
            this.d.tags = value.map(tag => tag.id);
        }
        get canResolveChildren() {
            return this.e;
        }
        set canResolveChildren(value) {
            this.e = value;
            this.api.listener?.({ op: 2 /* TestItemEventOp.UpdateCanResolveChildren */, state: value });
        }
        get parent() {
            return this.api.parent;
        }
        get id() {
            return this.f.localId;
        }
        constructor(f, label, uri) {
            this.f = f;
            this.e = false;
            this.api = { controllerId: this.f.controllerId };
            this.children = (0, testItemCollection_1.$VL)(this.api, i => i.api, $8fc);
            this.d = {
                extId: f.toString(),
                busy: false,
                description: null,
                error: null,
                label,
                range: null,
                sortText: null,
                tags: [],
                uri,
            };
        }
        get(key) {
            return this.d[key];
        }
        set(key, value) {
            this.d[key] = value;
            this.api.listener?.({ op: 4 /* TestItemEventOp.SetProp */, update: { [key]: value } });
        }
        toTestItem() {
            const props = { ...this.d };
            props.extId = this.f.toString();
            return props;
        }
    }
    exports.$8fc = $8fc;
    class $9fc extends testItemCollection_1.$RL {
        constructor(controllerId = 'ctrlId') {
            const root = new $8fc(new testId_1.$PI([controllerId]), 'root');
            root._isRoot = true;
            super({
                controllerId,
                getApiFor: t => t.api,
                toITestItem: t => t.toTestItem(),
                getChildren: t => t.children,
                getDocumentVersion: () => undefined,
                root,
            });
        }
        get currentDiff() {
            return this.m;
        }
        setDiff(diff) {
            this.m = diff;
        }
    }
    exports.$9fc = $9fc;
    /**
     * Gets a main thread test collection initialized with the given set of
     * roots/stubs.
     */
    const $0fc = async (singleUse = exports.$$fc.nested()) => {
        const c = new mainThreadTestCollection_1.$OKb(async (t, l) => singleUse.expand(t, l));
        await singleUse.expand(singleUse.root.id, Infinity);
        c.apply(singleUse.collectDiff());
        singleUse.dispose();
        return c;
    };
    exports.$0fc = $0fc;
    exports.$$fc = {
        nested: (idPrefix = 'id-') => {
            const collection = new $9fc();
            collection.resolveHandler = item => {
                if (item === undefined) {
                    const a = new $8fc(new testId_1.$PI(['ctrlId', 'id-a']), 'a', uri_1.URI.file('/'));
                    a.canResolveChildren = true;
                    const b = new $8fc(new testId_1.$PI(['ctrlId', 'id-b']), 'b', uri_1.URI.file('/'));
                    collection.root.children.add(a);
                    collection.root.children.add(b);
                }
                else if (item.id === idPrefix + 'a') {
                    item.children.add(new $8fc(new testId_1.$PI(['ctrlId', 'id-a', 'id-aa']), 'aa', uri_1.URI.file('/')));
                    item.children.add(new $8fc(new testId_1.$PI(['ctrlId', 'id-a', 'id-ab']), 'ab', uri_1.URI.file('/')));
                }
            };
            return collection;
        },
    };
});
//# sourceMappingURL=testStubs.js.map