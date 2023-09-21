/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/browser/ui/tree/compressedObjectTreeModel", "vs/base/common/iterator", "vs/base/test/common/utils"], function (require, exports, assert, compressedObjectTreeModel_1, iterator_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function resolve(treeElement) {
        const result = { element: treeElement.element };
        const children = Array.from(iterator_1.Iterable.from(treeElement.children), resolve);
        if (treeElement.incompressible) {
            result.incompressible = true;
        }
        if (children.length > 0) {
            result.children = children;
        }
        return result;
    }
    suite('CompressedObjectTree', function () {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        suite('compress & decompress', function () {
            test('small', function () {
                const decompressed = { element: 1 };
                const compressed = { element: { elements: [1], incompressible: false } };
                assert.deepStrictEqual(resolve((0, compressedObjectTreeModel_1.compress)(decompressed)), compressed);
                assert.deepStrictEqual(resolve((0, compressedObjectTreeModel_1.decompress)(compressed)), decompressed);
            });
            test('no compression', function () {
                const decompressed = {
                    element: 1, children: [
                        { element: 11 },
                        { element: 12 },
                        { element: 13 }
                    ]
                };
                const compressed = {
                    element: { elements: [1], incompressible: false },
                    children: [
                        { element: { elements: [11], incompressible: false } },
                        { element: { elements: [12], incompressible: false } },
                        { element: { elements: [13], incompressible: false } }
                    ]
                };
                assert.deepStrictEqual(resolve((0, compressedObjectTreeModel_1.compress)(decompressed)), compressed);
                assert.deepStrictEqual(resolve((0, compressedObjectTreeModel_1.decompress)(compressed)), decompressed);
            });
            test('single hierarchy', function () {
                const decompressed = {
                    element: 1, children: [
                        {
                            element: 11, children: [
                                {
                                    element: 111, children: [
                                        { element: 1111 }
                                    ]
                                }
                            ]
                        }
                    ]
                };
                const compressed = {
                    element: { elements: [1, 11, 111, 1111], incompressible: false }
                };
                assert.deepStrictEqual(resolve((0, compressedObjectTreeModel_1.compress)(decompressed)), compressed);
                assert.deepStrictEqual(resolve((0, compressedObjectTreeModel_1.decompress)(compressed)), decompressed);
            });
            test('deep compression', function () {
                const decompressed = {
                    element: 1, children: [
                        {
                            element: 11, children: [
                                {
                                    element: 111, children: [
                                        { element: 1111 },
                                        { element: 1112 },
                                        { element: 1113 },
                                        { element: 1114 },
                                    ]
                                }
                            ]
                        }
                    ]
                };
                const compressed = {
                    element: { elements: [1, 11, 111], incompressible: false },
                    children: [
                        { element: { elements: [1111], incompressible: false } },
                        { element: { elements: [1112], incompressible: false } },
                        { element: { elements: [1113], incompressible: false } },
                        { element: { elements: [1114], incompressible: false } },
                    ]
                };
                assert.deepStrictEqual(resolve((0, compressedObjectTreeModel_1.compress)(decompressed)), compressed);
                assert.deepStrictEqual(resolve((0, compressedObjectTreeModel_1.decompress)(compressed)), decompressed);
            });
            test('double deep compression', function () {
                const decompressed = {
                    element: 1, children: [
                        {
                            element: 11, children: [
                                {
                                    element: 111, children: [
                                        { element: 1112 },
                                        { element: 1113 },
                                    ]
                                }
                            ]
                        },
                        {
                            element: 12, children: [
                                {
                                    element: 121, children: [
                                        { element: 1212 },
                                        { element: 1213 },
                                    ]
                                }
                            ]
                        }
                    ]
                };
                const compressed = {
                    element: { elements: [1], incompressible: false },
                    children: [
                        {
                            element: { elements: [11, 111], incompressible: false },
                            children: [
                                { element: { elements: [1112], incompressible: false } },
                                { element: { elements: [1113], incompressible: false } },
                            ]
                        },
                        {
                            element: { elements: [12, 121], incompressible: false },
                            children: [
                                { element: { elements: [1212], incompressible: false } },
                                { element: { elements: [1213], incompressible: false } },
                            ]
                        }
                    ]
                };
                assert.deepStrictEqual(resolve((0, compressedObjectTreeModel_1.compress)(decompressed)), compressed);
                assert.deepStrictEqual(resolve((0, compressedObjectTreeModel_1.decompress)(compressed)), decompressed);
            });
            test('incompressible leaf', function () {
                const decompressed = {
                    element: 1, children: [
                        {
                            element: 11, children: [
                                {
                                    element: 111, children: [
                                        { element: 1111, incompressible: true }
                                    ]
                                }
                            ]
                        }
                    ]
                };
                const compressed = {
                    element: { elements: [1, 11, 111], incompressible: false },
                    children: [
                        { element: { elements: [1111], incompressible: true } }
                    ]
                };
                assert.deepStrictEqual(resolve((0, compressedObjectTreeModel_1.compress)(decompressed)), compressed);
                assert.deepStrictEqual(resolve((0, compressedObjectTreeModel_1.decompress)(compressed)), decompressed);
            });
            test('incompressible branch', function () {
                const decompressed = {
                    element: 1, children: [
                        {
                            element: 11, children: [
                                {
                                    element: 111, incompressible: true, children: [
                                        { element: 1111 }
                                    ]
                                }
                            ]
                        }
                    ]
                };
                const compressed = {
                    element: { elements: [1, 11], incompressible: false },
                    children: [
                        { element: { elements: [111, 1111], incompressible: true } }
                    ]
                };
                assert.deepStrictEqual(resolve((0, compressedObjectTreeModel_1.compress)(decompressed)), compressed);
                assert.deepStrictEqual(resolve((0, compressedObjectTreeModel_1.decompress)(compressed)), decompressed);
            });
            test('incompressible chain', function () {
                const decompressed = {
                    element: 1, children: [
                        {
                            element: 11, children: [
                                {
                                    element: 111, incompressible: true, children: [
                                        { element: 1111, incompressible: true }
                                    ]
                                }
                            ]
                        }
                    ]
                };
                const compressed = {
                    element: { elements: [1, 11], incompressible: false },
                    children: [
                        {
                            element: { elements: [111], incompressible: true },
                            children: [
                                { element: { elements: [1111], incompressible: true } }
                            ]
                        }
                    ]
                };
                assert.deepStrictEqual(resolve((0, compressedObjectTreeModel_1.compress)(decompressed)), compressed);
                assert.deepStrictEqual(resolve((0, compressedObjectTreeModel_1.decompress)(compressed)), decompressed);
            });
            test('incompressible tree', function () {
                const decompressed = {
                    element: 1, children: [
                        {
                            element: 11, incompressible: true, children: [
                                {
                                    element: 111, incompressible: true, children: [
                                        { element: 1111, incompressible: true }
                                    ]
                                }
                            ]
                        }
                    ]
                };
                const compressed = {
                    element: { elements: [1], incompressible: false },
                    children: [
                        {
                            element: { elements: [11], incompressible: true },
                            children: [
                                {
                                    element: { elements: [111], incompressible: true },
                                    children: [
                                        { element: { elements: [1111], incompressible: true } }
                                    ]
                                }
                            ]
                        }
                    ]
                };
                assert.deepStrictEqual(resolve((0, compressedObjectTreeModel_1.compress)(decompressed)), compressed);
                assert.deepStrictEqual(resolve((0, compressedObjectTreeModel_1.decompress)(compressed)), decompressed);
            });
        });
        function toList(arr) {
            return {
                splice(start, deleteCount, elements) {
                    arr.splice(start, deleteCount, ...elements);
                },
                updateElementHeight() { }
            };
        }
        function toArray(list) {
            return list.map(i => i.element.elements);
        }
        suite('CompressedObjectTreeModel', function () {
            /**
             * Calls that test function twice, once with an empty options and
             * once with `diffIdentityProvider`.
             */
            function withSmartSplice(fn) {
                fn({});
                fn({ diffIdentityProvider: { getId: n => String(n) } });
            }
            test('ctor', () => {
                const list = [];
                const model = new compressedObjectTreeModel_1.CompressedObjectTreeModel('test', toList(list));
                assert(model);
                assert.strictEqual(list.length, 0);
                assert.strictEqual(model.size, 0);
            });
            test('flat', () => withSmartSplice(options => {
                const list = [];
                const model = new compressedObjectTreeModel_1.CompressedObjectTreeModel('test', toList(list));
                model.setChildren(null, [
                    { element: 0 },
                    { element: 1 },
                    { element: 2 }
                ], options);
                assert.deepStrictEqual(toArray(list), [[0], [1], [2]]);
                assert.strictEqual(model.size, 3);
                model.setChildren(null, [
                    { element: 3 },
                    { element: 4 },
                    { element: 5 },
                ], options);
                assert.deepStrictEqual(toArray(list), [[3], [4], [5]]);
                assert.strictEqual(model.size, 3);
                model.setChildren(null, [], options);
                assert.deepStrictEqual(toArray(list), []);
                assert.strictEqual(model.size, 0);
            }));
            test('nested', () => withSmartSplice(options => {
                const list = [];
                const model = new compressedObjectTreeModel_1.CompressedObjectTreeModel('test', toList(list));
                model.setChildren(null, [
                    {
                        element: 0, children: [
                            { element: 10 },
                            { element: 11 },
                            { element: 12 },
                        ]
                    },
                    { element: 1 },
                    { element: 2 }
                ], options);
                assert.deepStrictEqual(toArray(list), [[0], [10], [11], [12], [1], [2]]);
                assert.strictEqual(model.size, 6);
                model.setChildren(12, [
                    { element: 120 },
                    { element: 121 }
                ], options);
                assert.deepStrictEqual(toArray(list), [[0], [10], [11], [12], [120], [121], [1], [2]]);
                assert.strictEqual(model.size, 8);
                model.setChildren(0, [], options);
                assert.deepStrictEqual(toArray(list), [[0], [1], [2]]);
                assert.strictEqual(model.size, 3);
                model.setChildren(null, [], options);
                assert.deepStrictEqual(toArray(list), []);
                assert.strictEqual(model.size, 0);
            }));
            test('compressed', () => withSmartSplice(options => {
                const list = [];
                const model = new compressedObjectTreeModel_1.CompressedObjectTreeModel('test', toList(list));
                model.setChildren(null, [
                    {
                        element: 1, children: [{
                                element: 11, children: [{
                                        element: 111, children: [
                                            { element: 1111 },
                                            { element: 1112 },
                                            { element: 1113 },
                                        ]
                                    }]
                            }]
                    }
                ], options);
                assert.deepStrictEqual(toArray(list), [[1, 11, 111], [1111], [1112], [1113]]);
                assert.strictEqual(model.size, 6);
                model.setChildren(11, [
                    { element: 111 },
                    { element: 112 },
                    { element: 113 },
                ], options);
                assert.deepStrictEqual(toArray(list), [[1, 11], [111], [112], [113]]);
                assert.strictEqual(model.size, 5);
                model.setChildren(113, [
                    { element: 1131 }
                ], options);
                assert.deepStrictEqual(toArray(list), [[1, 11], [111], [112], [113, 1131]]);
                assert.strictEqual(model.size, 6);
                model.setChildren(1131, [
                    { element: 1132 }
                ], options);
                assert.deepStrictEqual(toArray(list), [[1, 11], [111], [112], [113, 1131, 1132]]);
                assert.strictEqual(model.size, 7);
                model.setChildren(1131, [
                    { element: 1132 },
                    { element: 1133 },
                ], options);
                assert.deepStrictEqual(toArray(list), [[1, 11], [111], [112], [113, 1131], [1132], [1133]]);
                assert.strictEqual(model.size, 8);
            }));
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcHJlc3NlZE9iamVjdFRyZWVNb2RlbC50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS90ZXN0L2Jyb3dzZXIvdWkvdHJlZS9jb21wcmVzc2VkT2JqZWN0VHJlZU1vZGVsLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFlaEcsU0FBUyxPQUFPLENBQUksV0FBc0M7UUFDekQsTUFBTSxNQUFNLEdBQVEsRUFBRSxPQUFPLEVBQUUsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3JELE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsbUJBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRTFFLElBQUksV0FBVyxDQUFDLGNBQWMsRUFBRTtZQUMvQixNQUFNLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztTQUM3QjtRQUVELElBQUksUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDeEIsTUFBTSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7U0FDM0I7UUFFRCxPQUFPLE1BQU0sQ0FBQztJQUNmLENBQUM7SUFFRCxLQUFLLENBQUMsc0JBQXNCLEVBQUU7UUFFN0IsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRTFDLEtBQUssQ0FBQyx1QkFBdUIsRUFBRTtZQUU5QixJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNiLE1BQU0sWUFBWSxHQUFtQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDcEUsTUFBTSxVQUFVLEdBQ2YsRUFBRSxPQUFPLEVBQUUsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQztnQkFFdkQsTUFBTSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsSUFBQSxv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