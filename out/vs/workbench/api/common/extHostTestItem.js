define(["require", "exports", "vs/editor/common/core/range", "vs/workbench/api/common/extHostTestingPrivateApi", "vs/workbench/contrib/testing/common/testId", "vs/workbench/contrib/testing/common/testItemCollection", "vs/workbench/contrib/testing/common/testTypes", "vs/workbench/api/common/extHostTypeConverters", "vs/base/common/uri"], function (require, exports, editorRange, extHostTestingPrivateApi_1, testId_1, testItemCollection_1, testTypes_1, Convert, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostTestItemCollection = exports.TestItemRootImpl = exports.TestItemImpl = exports.toItemFromContext = void 0;
    const testItemPropAccessor = (api, defaultValue, equals, toUpdate) => {
        let value = defaultValue;
        return {
            enumerable: true,
            configurable: false,
            get() {
                return value;
            },
            set(newValue) {
                if (!equals(value, newValue)) {
                    const oldValue = value;
                    value = newValue;
                    api.listener?.(toUpdate(newValue, oldValue));
                }
            },
        };
    };
    const strictEqualComparator = (a, b) => a === b;
    const propComparators = {
        range: (a, b) => {
            if (a === b) {
                return true;
            }
            if (!a || !b) {
                return false;
            }
            return a.isEqual(b);
        },
        label: strictEqualComparator,
        description: strictEqualComparator,
        sortText: strictEqualComparator,
        busy: strictEqualComparator,
        error: strictEqualComparator,
        canResolveChildren: strictEqualComparator,
        tags: (a, b) => {
            if (a.length !== b.length) {
                return false;
            }
            if (a.some(t1 => !b.find(t2 => t1.id === t2.id))) {
                return false;
            }
            return true;
        },
    };
    const evSetProps = (fn) => v => ({ op: 4 /* TestItemEventOp.SetProp */, update: fn(v) });
    const makePropDescriptors = (api, label) => ({
        range: (() => {
            let value;
            const updateProps = evSetProps(r => ({ range: editorRange.Range.lift(Convert.Range.from(r)) }));
            return {
                enumerable: true,
                configurable: false,
                get() {
                    return value;
                },
                set(newValue) {
                    api.listener?.({ op: 6 /* TestItemEventOp.DocumentSynced */ });
                    if (!propComparators.range(value, newValue)) {
                        value = newValue;
                        api.listener?.(updateProps(newValue));
                    }
                },
            };
        })(),
        label: testItemPropAccessor(api, label, propComparators.label, evSetProps(label => ({ label }))),
        description: testItemPropAccessor(api, undefined, propComparators.description, evSetProps(description => ({ description }))),
        sortText: testItemPropAccessor(api, undefined, propComparators.sortText, evSetProps(sortText => ({ sortText }))),
        canResolveChildren: testItemPropAccessor(api, false, propComparators.canResolveChildren, state => ({
            op: 2 /* TestItemEventOp.UpdateCanResolveChildren */,
            state,
        })),
        busy: testItemPropAccessor(api, false, propComparators.busy, evSetProps(busy => ({ busy }))),
        error: testItemPropAccessor(api, undefined, propComparators.error, evSetProps(error => ({ error: Convert.MarkdownString.fromStrict(error) || null }))),
        tags: testItemPropAccessor(api, [], propComparators.tags, (current, previous) => ({
            op: 1 /* TestItemEventOp.SetTags */,
            new: current.map(Convert.TestTag.from),
            old: previous.map(Convert.TestTag.from),
        })),
    });
    const toItemFromPlain = (item) => {
        const testId = testId_1.TestId.fromString(item.extId);
        const testItem = new TestItemImpl(testId.controllerId, testId.localId, item.label, uri_1.URI.revive(item.uri) || undefined);
        testItem.range = Convert.Range.to(item.range || undefined);
        testItem.description = item.description || undefined;
        testItem.sortText = item.sortText || undefined;
        testItem.tags = item.tags.map(t => Convert.TestTag.to({ id: (0, testTypes_1.denamespaceTestTag)(t).tagId }));
        return testItem;
    };
    const toItemFromContext = (context) => {
        let node;
        for (const test of context.tests) {
            const next = toItemFromPlain(test.item);
            (0, extHostTestingPrivateApi_1.getPrivateApiFor)(next).parent = node;
            node = next;
        }
        return node;
    };
    exports.toItemFromContext = toItemFromContext;
    class TestItemImpl {
        /**
         * Note that data is deprecated and here for back-compat only
         */
        constructor(controllerId, id, label, uri) {
            if (id.includes("\0" /* TestIdPathParts.Delimiter */)) {
                throw new Error(`Test IDs may not include the ${JSON.stringify(id)} symbol`);
            }
            const api = (0, extHostTestingPrivateApi_1.createPrivateApiFor)(this, controllerId);
            Object.defineProperties(this, {
                id: {
                    value: id,
                    enumerable: true,
                    writable: false,
                },
                uri: {
                    value: uri,
                    enumerable: true,
                    writable: false,
                },
                parent: {
                    enumerable: false,
                    get() {
                        return api.parent instanceof TestItemRootImpl ? undefined : api.parent;
                    },
                },
                children: {
                    value: (0, testItemCollection_1.createTestItemChildren)(api, extHostTestingPrivateApi_1.getPrivateApiFor, TestItemImpl),
                    enumerable: true,
                    writable: false,
                },
                ...makePropDescriptors(api, label),
            });
        }
    }
    exports.TestItemImpl = TestItemImpl;
    class TestItemRootImpl extends TestItemImpl {
        constructor(controllerId, label) {
            super(controllerId, controllerId, label, undefined);
            this._isRoot = true;
        }
    }
    exports.TestItemRootImpl = TestItemRootImpl;
    class ExtHostTestItemCollection extends testItemCollection_1.TestItemCollection {
        constructor(controllerId, controllerLabel, editors) {
            super({
                controllerId,
                getDocumentVersion: uri => uri && editors.getDocument(uri)?.version,
                getApiFor: extHostTestingPrivateApi_1.getPrivateApiFor,
                getChildren: (item) => item.children,
                root: new TestItemRootImpl(controllerId, controllerLabel),
                toITestItem: Convert.TestItem.from,
            });
        }
    }
    exports.ExtHostTestItemCollection = ExtHostTestItemCollection;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFRlc3RJdGVtLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9jb21tb24vZXh0SG9zdFRlc3RJdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFjQSxNQUFNLG9CQUFvQixHQUFHLENBQzVCLEdBQXdCLEVBQ3hCLFlBQWdDLEVBQ2hDLE1BQWlFLEVBQ2pFLFFBQThGLEVBQzdGLEVBQUU7UUFDSCxJQUFJLEtBQUssR0FBRyxZQUFZLENBQUM7UUFDekIsT0FBTztZQUNOLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLFlBQVksRUFBRSxLQUFLO1lBQ25CLEdBQUc7Z0JBQ0YsT0FBTyxLQUFLLENBQUM7WUFDZCxDQUFDO1lBQ0QsR0FBRyxDQUFDLFFBQTRCO2dCQUMvQixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsRUFBRTtvQkFDN0IsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDO29CQUN2QixLQUFLLEdBQUcsUUFBUSxDQUFDO29CQUNqQixHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO2lCQUM3QztZQUNGLENBQUM7U0FDRCxDQUFDO0lBQ0gsQ0FBQyxDQUFDO0lBSUYsTUFBTSxxQkFBcUIsR0FBRyxDQUFJLENBQUksRUFBRSxDQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFekQsTUFBTSxlQUFlLEdBQXdHO1FBQzVILEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNmLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFBRSxPQUFPLElBQUksQ0FBQzthQUFFO1lBQzdCLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUU7Z0JBQUUsT0FBTyxLQUFLLENBQUM7YUFBRTtZQUMvQixPQUFP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