/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/browser/ui/tree/asyncDataTree", "vs/base/common/async", "vs/base/common/iterator", "vs/base/test/common/utils"], function (require, exports, assert, asyncDataTree_1, async_1, iterator_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function find(element, id) {
        if (element.id === id) {
            return element;
        }
        if (!element.children) {
            return undefined;
        }
        for (const child of element.children) {
            const result = find(child, id);
            if (result) {
                return result;
            }
        }
        return undefined;
    }
    class Renderer {
        constructor() {
            this.templateId = 'default';
        }
        renderTemplate(container) {
            return container;
        }
        renderElement(element, index, templateData) {
            templateData.textContent = element.element.id + (element.element.suffix || '');
        }
        disposeTemplate(templateData) {
            // noop
        }
    }
    class IdentityProvider {
        getId(element) {
            return element.id;
        }
    }
    class VirtualDelegate {
        getHeight() { return 20; }
        getTemplateId(element) { return 'default'; }
    }
    class DataSource {
        hasChildren(element) {
            return !!element.children && element.children.length > 0;
        }
        getChildren(element) {
            return Promise.resolve(element.children || []);
        }
    }
    class Model {
        constructor(root) {
            this.root = root;
        }
        get(id) {
            const result = find(this.root, id);
            if (!result) {
                throw new Error('element not found');
            }
            return result;
        }
    }
    suite('AsyncDataTree', function () {
        const store = (0, utils_1.$bT)();
        test('Collapse state should be preserved across refresh calls', async () => {
            const container = document.createElement('div');
            const model = new Model({
                id: 'root',
                children: [{
                        id: 'a'
                    }]
            });
            const tree = store.add(new asyncDataTree_1.$oS('test', container, new VirtualDelegate(), [new Renderer()], new DataSource(), { identityProvider: new IdentityProvider() }));
            tree.layout(200);
            assert.strictEqual(container.querySelectorAll('.monaco-list-row').length, 0);
            await tree.setInput(model.root);
            assert.strictEqual(container.querySelectorAll('.monaco-list-row').length, 1);
            const twistie = container.querySelector('.monaco-list-row:first-child .monaco-tl-twistie');
            assert(!twistie.classList.contains('collapsible'));
            assert(!twistie.classList.contains('collapsed'));
            model.get('a').children = [
                { id: 'aa' },
                { id: 'ab' },
                { id: 'ac' }
            ];
            await tree.updateChildren(model.root);
            assert.strictEqual(container.querySelectorAll('.monaco-list-row').length, 1);
            await tree.expand(model.get('a'));
            assert.strictEqual(container.querySelectorAll('.monaco-list-row').length, 4);
            model.get('a').children = [];
            await tree.updateChildren(model.root);
            assert.strictEqual(container.querySelectorAll('.monaco-list-row').length, 1);
        });
        test('issue #68648', async () => {
            const container = document.createElement('div');
            const getChildrenCalls = [];
            const dataSource = new class {
                hasChildren(element) {
                    return !!element.children && element.children.length > 0;
                }
                getChildren(element) {
                    getChildrenCalls.push(element.id);
                    return Promise.resolve(element.children || []);
                }
            };
            const model = new Model({
                id: 'root',
                children: [{
                        id: 'a'
                    }]
            });
            const tree = store.add(new asyncDataTree_1.$oS('test', container, new VirtualDelegate(), [new Renderer()], dataSource, { identityProvider: new IdentityProvider() }));
            tree.layout(200);
            await tree.setInput(model.root);
            assert.deepStrictEqual(getChildrenCalls, ['root']);
            let twistie = container.querySelector('.monaco-list-row:first-child .monaco-tl-twistie');
            assert(!twistie.classList.contains('collapsible'));
            assert(!twistie.classList.contains('collapsed'));
            assert(tree.getNode().children[0].collapsed);
            model.get('a').children = [{ id: 'aa' }, { id: 'ab' }, { id: 'ac' }];
            await tree.updateChildren(model.root);
            assert.deepStrictEqual(getChildrenCalls, ['root', 'root']);
            twistie = container.querySelector('.monaco-list-row:first-child .monaco-tl-twistie');
            assert(twistie.classList.contains('collapsible'));
            assert(twistie.classList.contains('collapsed'));
            assert(tree.getNode().children[0].collapsed);
            model.get('a').children = [];
            await tree.updateChildren(model.root);
            assert.deepStrictEqual(getChildrenCalls, ['root', 'root', 'root']);
            twistie = container.querySelector('.monaco-list-row:first-child .monaco-tl-twistie');
            assert(!twistie.classList.contains('collapsible'));
            assert(!twistie.classList.contains('collapsed'));
            assert(tree.getNode().children[0].collapsed);
            model.get('a').children = [{ id: 'aa' }, { id: 'ab' }, { id: 'ac' }];
            await tree.updateChildren(model.root);
            assert.deepStrictEqual(getChildrenCalls, ['root', 'root', 'root', 'root']);
            twistie = container.querySelector('.monaco-list-row:first-child .monaco-tl-twistie');
            assert(twistie.classList.contains('collapsible'));
            assert(twistie.classList.contains('collapsed'));
            assert(tree.getNode().children[0].collapsed);
        });
        test('issue #67722 - once resolved, refreshed collapsed nodes should only get children when expanded', async () => {
            const container = document.createElement('div');
            const getChildrenCalls = [];
            const dataSource = new class {
                hasChildren(element) {
                    return !!element.children && element.children.length > 0;
                }
                getChildren(element) {
                    getChildrenCalls.push(element.id);
                    return Promise.resolve(element.children || []);
                }
            };
            const model = new Model({
                id: 'root',
                children: [{
                        id: 'a', children: [{ id: 'aa' }, { id: 'ab' }, { id: 'ac' }]
                    }]
            });
            const tree = store.add(new asyncDataTree_1.$oS('test', container, new VirtualDelegate(), [new Renderer()], dataSource, { identityProvider: new IdentityProvider() }));
            tree.layout(200);
            await tree.setInput(model.root);
            assert(tree.getNode(model.get('a')).collapsed);
            assert.deepStrictEqual(getChildrenCalls, ['root']);
            await tree.expand(model.get('a'));
            assert(!tree.getNode(model.get('a')).collapsed);
            assert.deepStrictEqual(getChildrenCalls, ['root', 'a']);
            tree.collapse(model.get('a'));
            assert(tree.getNode(model.get('a')).collapsed);
            assert.deepStrictEqual(getChildrenCalls, ['root', 'a']);
            await tree.updateChildren();
            assert(tree.getNode(model.get('a')).collapsed);
            assert.deepStrictEqual(getChildrenCalls, ['root', 'a', 'root'], 'a should not be refreshed, since it\' collapsed');
        });
        test('resolved collapsed nodes which lose children should lose twistie as well', async () => {
            const container = document.createElement('div');
            const model = new Model({
                id: 'root',
                children: [{
                        id: 'a', children: [{ id: 'aa' }, { id: 'ab' }, { id: 'ac' }]
                    }]
            });
            const tree = store.add(new asyncDataTree_1.$oS('test', container, new VirtualDelegate(), [new Renderer()], new DataSource(), { identityProvider: new IdentityProvider() }));
            tree.layout(200);
            await tree.setInput(model.root);
            await tree.expand(model.get('a'));
            let twistie = container.querySelector('.monaco-list-row:first-child .monaco-tl-twistie');
            assert(twistie.classList.contains('collapsible'));
            assert(!twistie.classList.contains('collapsed'));
            assert(!tree.getNode(model.get('a')).collapsed);
            tree.collapse(model.get('a'));
            model.get('a').children = [];
            await tree.updateChildren(model.root);
            twistie = container.querySelector('.monaco-list-row:first-child .monaco-tl-twistie');
            assert(!twistie.classList.contains('collapsible'));
            assert(!twistie.classList.contains('collapsed'));
            assert(tree.getNode(model.get('a')).collapsed);
        });
        test('support default collapse state per element', async () => {
            const container = document.createElement('div');
            const getChildrenCalls = [];
            const dataSource = new class {
                hasChildren(element) {
                    return !!element.children && element.children.length > 0;
                }
                getChildren(element) {
                    getChildrenCalls.push(element.id);
                    return Promise.resolve(element.children || []);
                }
            };
            const model = new Model({
                id: 'root',
                children: [{
                        id: 'a', children: [{ id: 'aa' }, { id: 'ab' }, { id: 'ac' }]
                    }]
            });
            const tree = store.add(new asyncDataTree_1.$oS('test', container, new VirtualDelegate(), [new Renderer()], dataSource, {
                collapseByDefault: el => el.id !== 'a'
            }));
            tree.layout(200);
            await tree.setInput(model.root);
            assert(!tree.getNode(model.get('a')).collapsed);
            assert.deepStrictEqual(getChildrenCalls, ['root', 'a']);
        });
        test('issue #80098 - concurrent refresh and expand', async () => {
            const container = document.createElement('div');
            const calls = [];
            const dataSource = new class {
                hasChildren(element) {
                    return !!element.children && element.children.length > 0;
                }
                getChildren(element) {
                    return new Promise(c => calls.push(() => c(element.children || [])));
                }
            };
            const model = new Model({
                id: 'root',
                children: [{
                        id: 'a', children: [{
                                id: 'aa'
                            }]
                    }]
            });
            const tree = store.add(new asyncDataTree_1.$oS('test', container, new VirtualDelegate(), [new Renderer()], dataSource, { identityProvider: new IdentityProvider() }));
            tree.layout(200);
            const pSetInput = tree.setInput(model.root);
            calls.pop()(); // resolve getChildren(root)
            await pSetInput;
            const pUpdateChildrenA = tree.updateChildren(model.get('a'));
            const pExpandA = tree.expand(model.get('a'));
            assert.strictEqual(calls.length, 1, 'expand(a) still hasn\'t called getChildren(a)');
            calls.pop()();
            assert.strictEqual(calls.length, 0, 'no pending getChildren calls');
            await pUpdateChildrenA;
            assert.strictEqual(calls.length, 0, 'expand(a) should not have forced a second refresh');
            const result = await pExpandA;
            assert.strictEqual(result, true, 'expand(a) should be done');
        });
        test('issue #80098 - first expand should call getChildren', async () => {
            const container = document.createElement('div');
            const calls = [];
            const dataSource = new class {
                hasChildren(element) {
                    return !!element.children && element.children.length > 0;
                }
                getChildren(element) {
                    return new Promise(c => calls.push(() => c(element.children || [])));
                }
            };
            const model = new Model({
                id: 'root',
                children: [{
                        id: 'a', children: [{
                                id: 'aa'
                            }]
                    }]
            });
            const tree = store.add(new asyncDataTree_1.$oS('test', container, new VirtualDelegate(), [new Renderer()], dataSource, { identityProvider: new IdentityProvider() }));
            tree.layout(200);
            const pSetInput = tree.setInput(model.root);
            calls.pop()(); // resolve getChildren(root)
            await pSetInput;
            const pExpandA = tree.expand(model.get('a'));
            assert.strictEqual(calls.length, 1, 'expand(a) should\'ve called getChildren(a)');
            let race = await Promise.race([pExpandA.then(() => 'expand'), (0, async_1.$Hg)(1).then(() => 'timeout')]);
            assert.strictEqual(race, 'timeout', 'expand(a) should not be yet done');
            calls.pop()();
            assert.strictEqual(calls.length, 0, 'no pending getChildren calls');
            race = await Promise.race([pExpandA.then(() => 'expand'), (0, async_1.$Hg)(1).then(() => 'timeout')]);
            assert.strictEqual(race, 'expand', 'expand(a) should now be done');
        });
        test('issue #78388 - tree should react to hasChildren toggles', async () => {
            const container = document.createElement('div');
            const model = new Model({
                id: 'root',
                children: [{
                        id: 'a'
                    }]
            });
            const tree = store.add(new asyncDataTree_1.$oS('test', container, new VirtualDelegate(), [new Renderer()], new DataSource(), { identityProvider: new IdentityProvider() }));
            tree.layout(200);
            await tree.setInput(model.root);
            assert.strictEqual(container.querySelectorAll('.monaco-list-row').length, 1);
            let twistie = container.querySelector('.monaco-list-row:first-child .monaco-tl-twistie');
            assert(!twistie.classList.contains('collapsible'));
            assert(!twistie.classList.contains('collapsed'));
            model.get('a').children = [{ id: 'aa' }];
            await tree.updateChildren(model.get('a'), false);
            assert.strictEqual(container.querySelectorAll('.monaco-list-row').length, 1);
            twistie = container.querySelector('.monaco-list-row:first-child .monaco-tl-twistie');
            assert(twistie.classList.contains('collapsible'));
            assert(twistie.classList.contains('collapsed'));
            model.get('a').children = [];
            await tree.updateChildren(model.get('a'), false);
            assert.strictEqual(container.querySelectorAll('.monaco-list-row').length, 1);
            twistie = container.querySelector('.monaco-list-row:first-child .monaco-tl-twistie');
            assert(!twistie.classList.contains('collapsible'));
            assert(!twistie.classList.contains('collapsed'));
        });
        test('issues #84569, #82629 - rerender', async () => {
            const container = document.createElement('div');
            const model = new Model({
                id: 'root',
                children: [{
                        id: 'a',
                        children: [{
                                id: 'b',
                                suffix: '1'
                            }]
                    }]
            });
            const tree = store.add(new asyncDataTree_1.$oS('test', container, new VirtualDelegate(), [new Renderer()], new DataSource(), { identityProvider: new IdentityProvider() }));
            tree.layout(200);
            await tree.setInput(model.root);
            await tree.expand(model.get('a'));
            assert.deepStrictEqual(Array.from(container.querySelectorAll('.monaco-list-row')).map(e => e.textContent), ['a', 'b1']);
            const a = model.get('a');
            const b = model.get('b');
            a.children?.splice(0, 1, { id: 'b', suffix: '2' });
            await Promise.all([
                tree.updateChildren(a, true, true),
                tree.updateChildren(b, true, true)
            ]);
            assert.deepStrictEqual(Array.from(container.querySelectorAll('.monaco-list-row')).map(e => e.textContent), ['a', 'b2']);
        });
        test('issue #121567', async () => {
            const container = document.createElement('div');
            const calls = [];
            const dataSource = new class {
                hasChildren(element) {
                    return !!element.children && element.children.length > 0;
                }
                async getChildren(element) {
                    calls.push(element);
                    return element.children ?? iterator_1.Iterable.empty();
                }
            };
            const model = new Model({
                id: 'root',
                children: [{
                        id: 'a', children: [{
                                id: 'aa'
                            }]
                    }]
            });
            const a = model.get('a');
            const tree = store.add(new asyncDataTree_1.$oS('test', container, new VirtualDelegate(), [new Renderer()], dataSource, { identityProvider: new IdentityProvider() }));
            tree.layout(200);
            await tree.setInput(model.root);
            assert.strictEqual(calls.length, 1, 'There should be a single getChildren call for the root');
            assert(tree.isCollapsible(a), 'a is collapsible');
            assert(tree.isCollapsed(a), 'a is collapsed');
            await tree.updateChildren(a, false);
            assert.strictEqual(calls.length, 1, 'There should be no changes to the calls list, since a was collapsed');
            assert(tree.isCollapsible(a), 'a is collapsible');
            assert(tree.isCollapsed(a), 'a is collapsed');
            const children = a.children;
            a.children = [];
            await tree.updateChildren(a, false);
            assert.strictEqual(calls.length, 1, 'There should still be no changes to the calls list, since a was collapsed');
            assert(!tree.isCollapsible(a), 'a is no longer collapsible');
            assert(tree.isCollapsed(a), 'a is collapsed');
            a.children = children;
            await tree.updateChildren(a, false);
            assert.strictEqual(calls.length, 1, 'There should still be no changes to the calls list, since a was collapsed');
            assert(tree.isCollapsible(a), 'a is collapsible again');
            assert(tree.isCollapsed(a), 'a is collapsed');
            await tree.expand(a);
            assert.strictEqual(calls.length, 2, 'Finally, there should be a getChildren call for a');
            assert(tree.isCollapsible(a), 'a is still collapsible');
            assert(!tree.isCollapsed(a), 'a is expanded');
        });
    });
});
//# sourceMappingURL=asyncDataTree.test.js.map