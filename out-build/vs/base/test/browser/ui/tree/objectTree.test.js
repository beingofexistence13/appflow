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
            (0, utils_1.$bT)();
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
                tree = new objectTree_1.$mS('test', container, delegate, [renderer], { filter: { filter: (el) => filter(el) } });
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
            const tree = new objectTree_1.$mS('test', container, delegate, [renderer], { identityProvider });
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
            const tree = new objectTree_1.$nS('test', container, new Delegate(), [new Renderer()]);
            tree.layout(200);
            assert.strictEqual(getRowsTextContent(container).length, 0);
        });
        test('simple', function () {
            const container = document.createElement('div');
            container.style.width = '200px';
            container.style.height = '200px';
            const tree = new objectTree_1.$nS('test', container, new Delegate(), [new Renderer()]);
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
            const tree = new objectTree_1.$nS('test', container, new Delegate(), [new Renderer()]);
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
            const tree = new objectTree_1.$nS('test', container, new Delegate(), [new Renderer()]);
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
//# sourceMappingURL=objectTree.test.js.map