/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/browser/ui/tree/objectTree", "vs/base/test/common/utils"], function (require, exports, assert, objectTree_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ObjectTree', function () {
        suite('TreeNavigator', function () {
            let tree;
            let filter = (_) => true;
            teardown(() => {
                tree.dispose();
                filter = (_) => true;
            });
            (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
            setup(() => {
                const container = document.createElement('div');
                container.style.width = '200px';
                container.style.height = '200px';
                const delegate = new class {
                    getHeight() { return 20; }
                    getTemplateId() { return 'default'; }
                };
                const renderer = new class {
                    constructor() {
                        this.templateId = 'default';
                    }
                    renderTemplate(container) {
                        return container;
                    }
                    renderElement(element, index, templateData) {
                        templateData.textContent = `${element.element}`;
                    }
                    disposeTemplate() { }
                };
                tree = new objectTree_1.ObjectTree('test', container, delegate, [renderer], { filter: { filter: (el) => filter(el) } });
                tree.layout(200);
            });
            test('should be able to navigate', () => {
                tree.setChildren(null, [
                    {
                        element: 0, children: [
                            { element: 10 },
                            { element: 11 },
                            { element: 12 },
                        ]
                    },
                    { element: 1 },
                    { element: 2 }
                ]);
                const navigator = tree.navigate();
                assert.strictEqual(navigator.current(), null);
                assert.strictEqual(navigator.next(), 0);
                assert.strictEqual(navigator.current(), 0);
                assert.strictEqual(navigator.next(), 10);
                assert.strictEqual(navigator.current(), 10);
                assert.strictEqual(navigator.next(), 11);
                assert.strictEqual(navigator.current(), 11);
                assert.strictEqual(navigator.next(), 12);
                assert.strictEqual(navigator.current(), 12);
                assert.strictEqual(navigator.next(), 1);
                assert.strictEqual(navigator.current(), 1);
                assert.strictEqual(navigator.next(), 2);
                assert.strictEqual(navigator.current(), 2);
                assert.strictEqual(navigator.previous(), 1);
                assert.strictEqual(navigator.current(), 1);
                assert.strictEqual(navigator.previous(), 12);
                assert.strictEqual(navigator.previous(), 11);
                assert.strictEqual(navigator.previous(), 10);
                assert.strictEqual(navigator.previous(), 0);
                assert.strictEqual(navigator.previous(), null);
                assert.strictEqual(navigator.next(), 0);
                assert.strictEqual(navigator.next(), 10);
                assert.strictEqual(navigator.first(), 0);
                assert.strictEqual(navigator.last(), 2);
            });
            test('should skip collapsed nodes', () => {
                tree.setChildren(null, [
                    {
                        element: 0, collapsed: true, children: [
                            { element: 10 },
                            { element: 11 },
                            { element: 12 },
                        ]
                    },
                    { element: 1 },
                    { element: 2 }
                ]);
                const navigator = tree.navigate();
                assert.strictEqual(navigator.current(), null);
                assert.strictEqual(navigator.next(), 0);
                assert.strictEqual(navigator.next(), 1);
                assert.strictEqual(navigator.next(), 2);
                assert.strictEqual(navigator.next(), null);
                assert.strictEqual(navigator.previous(), 2);
                assert.strictEqual(navigator.previous(), 1);
                assert.strictEqual(navigator.previous(), 0);
                assert.strictEqual(navigator.previous(), null);
                assert.strictEqual(navigator.next(), 0);
                assert.strictEqual(navigator.first(), 0);
                assert.strictEqual(navigator.last(), 2);
            });
            test('should skip filtered elements', () => {
                filter = el => el % 2 === 0;
                tree.setChildren(null, [
                    {
                        element: 0, children: [
                            { element: 10 },
                            { element: 11 },
                            { element: 12 },
                        ]
                    },
                    { element: 1 },
                    { element: 2 }
                ]);
                const navigator = tree.navigate();
                assert.strictEqual(navigator.current(), null);
                assert.strictEqual(navigator.next(), 0);
                assert.strictEqual(navigator.next(), 10);
                assert.strictEqual(navigator.next(), 12);
                assert.strictEqual(navigator.next(), 2);
                assert.strictEqual(navigator.next(), null);
                assert.strictEqual(navigator.previous(), 2);
                assert.strictEqual(navigator.previous(), 12);
                assert.strictEqual(navigator.previous(), 10);
                assert.strictEqual(navigator.previous(), 0);
                assert.strictEqual(navigator.previous(), null);
                assert.strictEqual(navigator.next(), 0);
                assert.strictEqual(navigator.next(), 10);
                assert.strictEqual(navigator.first(), 0);
                assert.strictEqual(navigator.last(), 2);
            });
            test('should be able to start from node', () => {
                tree.setChildren(null, [
                    {
                        element: 0, children: [
                            { element: 10 },
                            { element: 11 },
                            { element: 12 },
                        ]
                    },
                    { element: 1 },
                    { element: 2 }
                ]);
                const navigator = tree.navigate(1);
                assert.strictEqual(navigator.current(), 1);
                assert.strictEqual(navigator.next(), 2);
                assert.strictEqual(navigator.current(), 2);
                assert.strictEqual(navigator.previous(), 1);
                assert.strictEqual(navigator.current(), 1);
                assert.strictEqual(navigator.previous(), 12);
                assert.strictEqual(navigator.previous(), 11);
                assert.strictEqual(navigator.previous(), 10);
                assert.strictEqual(navigator.previous(), 0);
                assert.strictEqual(navigator.previous(), null);
                assert.strictEqual(navigator.next(), 0);
                assert.strictEqual(navigator.next(), 10);
                assert.strictEqual(navigator.first(), 0);
                assert.strictEqual(navigator.last(), 2);
            });
        });
        test('traits are preserved according to string identity', function () {
            const container = document.createElement('div');
            container.style.width = '200px';
            container.style.height = '200px';
            const delegate = new class {
                getHeight() { return 20; }
                getTemplateId() { return 'default'; }
            };
            const renderer = new class {
                constructor() {
                    this.templateId = 'default';
                }
                renderTemplate(container) {
                    return container;
                }
                renderElement(element, index, templateData) {
                    templateData.textContent = `${element.element}`;
                }
                disposeTemplate() { }
            };
            const identityProvider = new class {
                getId(element) {
                    return `${element % 100}`;
                }
            };
            const tree = new objectTree_1.ObjectTree('test', container, delegate, [renderer], { identityProvider });
            tree.layout(200);
            tree.setChildren(null, [{ element: 0 }, { element: 1 }, { element: 2 }, { element: 3 }]);
            tree.setFocus([1]);
            assert.deepStrictEqual(tree.getFocus(), [1]);
            tree.setChildren(null, [{ element: 100 }, { element: 101 }, { element: 102 }, { element: 103 }]);
            assert.deepStrictEqual(tree.getFocus(), [101]);
        });
    });
    function getRowsTextContent(container) {
        const rows = [...container.querySelectorAll('.monaco-list-row')];
        rows.sort((a, b) => parseInt(a.getAttribute('data-index')) - parseInt(b.getAttribute('data-index')));
        return rows.map(row => row.querySelector('.monaco-tl-contents').textContent);
    }
    suite('CompressibleObjectTree', function () {
        class Delegate {
            getHeight() { return 20; }
            getTemplateId() { return 'default'; }
        }
        class Renderer {
            constructor() {
                this.templateId = 'default';
            }
            renderTemplate(container) {
                return container;
            }
            renderElement(node, _, templateData) {
                templateData.textContent = `${node.element}`;
            }
            renderCompressedElements(node, _, templateData) {
                templateData.textContent = `${node.element.elements.join('/')}`;
            }
            disposeTemplate() { }
        }
        test('empty', function () {
            const container = document.createElement('div');
            container.style.width = '200px';
            container.style.height = '200px';
            const tree = new objectTree_1.CompressibleObjectTree('test', container, new Delegate(), [new Renderer()]);
            tree.layout(200);
            assert.strictEqual(getRowsTextContent(container).length, 0);
        });
        test('simple', function () {
            const container = document.createElement('div');
            container.style.width = '200px';
            container.style.height = '200px';
            const tree = new objectTree_1.CompressibleObjectTree('test', container, new Delegate(), [new Renderer()]);
            tree.layout(200);
            tree.setChildren(null, [
                {
                    element: 0, children: [
                        { element: 10 },
                        { element: 11 },
                        { element: 12 },
                    ]
                },
                { element: 1 },
                { element: 2 }
            ]);
            assert.deepStrictEqual(getRowsTextContent(container), ['0', '10', '11', '12', '1', '2']);
        });
        test('compressed', () => {
            const container = document.createElement('div');
            container.style.width = '200px';
            container.style.height = '200px';
            const tree = new objectTree_1.CompressibleObjectTree('test', container, new Delegate(), [new Renderer()]);
            tree.layout(200);
            tree.setChildren(null, [
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
            ]);
            assert.deepStrictEqual(getRowsTextContent(container), ['1/11/111', '1111', '1112', '1113']);
            tree.setChildren(11, [
                { element: 111 },
                { element: 112 },
                { element: 113 },
            ]);
            assert.deepStrictEqual(getRowsTextContent(container), ['1/11', '111', '112', '113']);
            tree.setChildren(113, [
                { element: 1131 }
            ]);
            assert.deepStrictEqual(getRowsTextContent(container), ['1/11', '111', '112', '113/1131']);
            tree.setChildren(1131, [
                { element: 1132 }
            ]);
            assert.deepStrictEqual(getRowsTextContent(container), ['1/11', '111', '112', '113/1131/1132']);
            tree.setChildren(1131, [
                { element: 1132 },
                { element: 1133 },
            ]);
            assert.deepStrictEqual(getRowsTextContent(container), ['1/11', '111', '112', '113/1131', '1132', '1133']);
        });
        test('enableCompression', () => {
            const container = document.createElement('div');
            container.style.width = '200px';
            container.style.height = '200px';
            const tree = new objectTree_1.CompressibleObjectTree('test', container, new Delegate(), [new Renderer()]);
            tree.layout(200);
            tree.setChildren(null, [
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
            ]);
            assert.deepStrictEqual(getRowsTextContent(container), ['1/11/111', '1111', '1112', '1113']);
            tree.updateOptions({ compressionEnabled: false });
            assert.deepStrictEqual(getRowsTextContent(container), ['1', '11', '111', '1111', '1112', '1113']);
            tree.updateOptions({ compressionEnabled: true });
            assert.deepStrictEqual(getRowsTextContent(container), ['1/11/111', '1111', '1112', '1113']);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JqZWN0VHJlZS50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS90ZXN0L2Jyb3dzZXIvdWkvdHJlZS9vYmplY3RUcmVlLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFTaEcsS0FBSyxDQUFDLFlBQVksRUFBRTtRQUVuQixLQUFLLENBQUMsZUFBZSxFQUFFO1lBQ3RCLElBQUksSUFBd0IsQ0FBQztZQUM3QixJQUFJLE1BQU0sR0FBRyxDQUFDLENBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDO1lBRWpDLFFBQVEsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2IsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNmLE1BQU0sR0FBRyxDQUFDLENBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDO1lBQzlCLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1lBRTFDLEtBQUssQ0FBQyxHQUFHLEVBQUU7Z0JBQ1YsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDaEQsU0FBUyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDO2dCQUNoQyxTQUFTLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUM7Z0JBRWpDLE1BQU0sUUFBUSxHQUFHLElBQUk7b0JBQ3BCLFNBQVMsS0FBSyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQzFCLGFBQWEsS0FBYSxPQUFPLFNBQVMsQ0FBQyxDQUFDLENBQUM7aUJBQzdDLENBQUM7Z0JBRUYsTUFBTSxRQUFRLEdBQUcsSUFBSTtvQkFBQTt3QkFDWCxlQUFVLEdBQUcsU0FBUyxDQUFDO29CQVFqQyxDQUFDO29CQVBBLGNBQWMsQ0FBQyxTQUFzQjt3QkFDcEMsT0FBTyxTQUFTLENBQUM7b0JBQ2xCLENBQUM7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RSxDQUFDLENBQUMsQ0FBQztnQkFDM0MsTUFBTSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hDLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUMzQyxNQUFNLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDNUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQzNDLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUM3QyxNQUFNLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDN0MsTUFBTSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQzdDLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUM1QyxNQUFNLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDL0MsTUFBTSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hDLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUN6QyxNQUFNLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDekMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDekMsQ0FBQyxD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