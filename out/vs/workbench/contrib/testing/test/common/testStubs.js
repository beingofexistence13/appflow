/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/workbench/contrib/testing/common/mainThreadTestCollection", "vs/workbench/contrib/testing/common/testId", "vs/workbench/contrib/testing/common/testItemCollection"], function (require, exports, uri_1, mainThreadTestCollection_1, testId_1, testItemCollection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.testStubs = exports.getInitializedMainTestCollection = exports.TestTestCollection = exports.TestTestItem = void 0;
    class TestTestItem {
        get tags() {
            return this.props.tags.map(id => ({ id }));
        }
        set tags(value) {
            this.api.listener?.({ op: 1 /* TestItemEventOp.SetTags */, new: value, old: this.props.tags.map(t => ({ id: t })) });
            this.props.tags = value.map(tag => tag.id);
        }
        get canResolveChildren() {
            return this._canResolveChildren;
        }
        set canResolveChildren(value) {
            this._canResolveChildren = value;
            this.api.listener?.({ op: 2 /* TestItemEventOp.UpdateCanResolveChildren */, state: value });
        }
        get parent() {
            return this.api.parent;
        }
        get id() {
            return this._extId.localId;
        }
        constructor(_extId, label, uri) {
            this._extId = _extId;
            this._canResolveChildren = false;
            this.api = { controllerId: this._extId.controllerId };
            this.children = (0, testItemCollection_1.createTestItemChildren)(this.api, i => i.api, TestTestItem);
            this.props = {
                extId: _extId.toString(),
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
            return this.props[key];
        }
        set(key, value) {
            this.props[key] = value;
            this.api.listener?.({ op: 4 /* TestItemEventOp.SetProp */, update: { [key]: value } });
        }
        toTestItem() {
            const props = { ...this.props };
            props.extId = this._extId.toString();
            return props;
        }
    }
    exports.TestTestItem = TestTestItem;
    class TestTestCollection extends testItemCollection_1.TestItemCollection {
        constructor(controllerId = 'ctrlId') {
            const root = new TestTestItem(new testId_1.TestId([controllerId]), 'root');
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
            return this.diff;
        }
        setDiff(diff) {
            this.diff = diff;
        }
    }
    exports.TestTestCollection = TestTestCollection;
    /**
     * Gets a main thread test collection initialized with the given set of
     * roots/stubs.
     */
    const getInitializedMainTestCollection = async (singleUse = exports.testStubs.nested()) => {
        const c = new mainThreadTestCollection_1.MainThreadTestCollection(async (t, l) => singleUse.expand(t, l));
        await singleUse.expand(singleUse.root.id, Infinity);
        c.apply(singleUse.collectDiff());
        singleUse.dispose();
        return c;
    };
    exports.getInitializedMainTestCollection = getInitializedMainTestCollection;
    exports.testStubs = {
        nested: (idPrefix = 'id-') => {
            const collection = new TestTestCollection();
            collection.resolveHandler = item => {
                if (item === undefined) {
                    const a = new TestTestItem(new testId_1.TestId(['ctrlId', 'id-a']), 'a', uri_1.URI.file('/'));
                    a.canResolveChildren = true;
                    const b = new TestTestItem(new testId_1.TestId(['ctrlId', 'id-b']), 'b', uri_1.URI.file('/'));
                    collection.root.children.add(a);
                    collection.root.children.add(b);
                }
                else if (item.id === idPrefix + 'a') {
                    item.children.add(new TestTestItem(new testId_1.TestId(['ctrlId', 'id-a', 'id-aa']), 'aa', uri_1.URI.file('/')));
                    item.children.add(new TestTestItem(new testId_1.TestId(['ctrlId', 'id-a', 'id-ab']), 'ab', uri_1.URI.file('/')));
                }
            };
            return collection;
        },
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdFN0dWJzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVzdGluZy90ZXN0L2NvbW1vbi90ZXN0U3R1YnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUWhHLE1BQWEsWUFBWTtRQUl4QixJQUFXLElBQUk7WUFDZCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUVELElBQVcsSUFBSSxDQUFDLEtBQUs7WUFDcEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLEVBQUUsaUNBQXlCLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzdHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUVELElBQVcsa0JBQWtCO1lBQzVCLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDO1FBQ2pDLENBQUM7UUFFRCxJQUFXLGtCQUFrQixDQUFDLEtBQWM7WUFDM0MsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEtBQUssQ0FBQztZQUNqQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsRUFBRSxrREFBMEMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FB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