define(["require", "exports", "vs/editor/common/core/range", "vs/workbench/api/common/extHostTestingPrivateApi", "vs/workbench/contrib/testing/common/testId", "vs/workbench/contrib/testing/common/testItemCollection", "vs/workbench/contrib/testing/common/testTypes", "vs/workbench/api/common/extHostTypeConverters", "vs/base/common/uri"], function (require, exports, editorRange, extHostTestingPrivateApi_1, testId_1, testItemCollection_1, testTypes_1, Convert, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$eM = exports.$dM = exports.$cM = exports.$bM = void 0;
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
            const updateProps = evSetProps(r => ({ range: editorRange.$ks.lift(Convert.Range.from(r)) }));
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
        const testId = testId_1.$PI.fromString(item.extId);
        const testItem = new $cM(testId.controllerId, testId.localId, item.label, uri_1.URI.revive(item.uri) || undefined);
        testItem.range = Convert.Range.to(item.range || undefined);
        testItem.description = item.description || undefined;
        testItem.sortText = item.sortText || undefined;
        testItem.tags = item.tags.map(t => Convert.TestTag.to({ id: (0, testTypes_1.$UI)(t).tagId }));
        return testItem;
    };
    const $bM = (context) => {
        let node;
        for (const test of context.tests) {
            const next = toItemFromPlain(test.item);
            (0, extHostTestingPrivateApi_1.$XL)(next).parent = node;
            node = next;
        }
        return node;
    };
    exports.$bM = $bM;
    class $cM {
        /**
         * Note that data is deprecated and here for back-compat only
         */
        constructor(controllerId, id, label, uri) {
            if (id.includes("\0" /* TestIdPathParts.Delimiter */)) {
                throw new Error(`Test IDs may not include the ${JSON.stringify(id)} symbol`);
            }
            const api = (0, extHostTestingPrivateApi_1.$WL)(this, controllerId);
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
                        return api.parent instanceof $dM ? undefined : api.parent;
                    },
                },
                children: {
                    value: (0, testItemCollection_1.$VL)(api, extHostTestingPrivateApi_1.$XL, $cM),
                    enumerable: true,
                    writable: false,
                },
                ...makePropDescriptors(api, label),
            });
        }
    }
    exports.$cM = $cM;
    class $dM extends $cM {
        constructor(controllerId, label) {
            super(controllerId, controllerId, label, undefined);
            this._isRoot = true;
        }
    }
    exports.$dM = $dM;
    class $eM extends testItemCollection_1.$RL {
        constructor(controllerId, controllerLabel, editors) {
            super({
                controllerId,
                getDocumentVersion: uri => uri && editors.getDocument(uri)?.version,
                getApiFor: extHostTestingPrivateApi_1.$XL,
                getChildren: (item) => item.children,
                root: new $dM(controllerId, controllerLabel),
                toITestItem: Convert.TestItem.from,
            });
        }
    }
    exports.$eM = $eM;
});
//# sourceMappingURL=extHostTestItem.js.map