/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/tree/objectTree", "vs/base/common/event", "vs/base/common/lifecycle", "vs/workbench/contrib/testing/browser/explorerProjections/index", "vs/workbench/contrib/testing/common/mainThreadTestCollection", "vs/workbench/contrib/testing/test/common/testStubs"], function (require, exports, objectTree_1, event_1, lifecycle_1, index_1, mainThreadTestCollection_1, testStubs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$_fc = void 0;
    const element = document.createElement('div');
    element.style.height = '1000px';
    element.style.width = '200px';
    class TestObjectTree extends objectTree_1.$mS {
        constructor(serializer, sorter) {
            super('test', element, {
                getHeight: () => 20,
                getTemplateId: () => 'default'
            }, [
                {
                    disposeTemplate: () => undefined,
                    renderElement: (node, _index, container) => {
                        Object.assign(container.dataset, node.element);
                        container.textContent = `${node.depth}:${serializer(node.element)}`;
                    },
                    renderTemplate: c => c,
                    templateId: 'default'
                }
            ], {
                sorter: sorter ?? {
                    compare: (a, b) => serializer(a).localeCompare(serializer(b))
                }
            });
            this.layout(1000, 200);
        }
        getModel() {
            return this.o;
        }
        getRendered(getProperty) {
            const elements = element.querySelectorAll('.monaco-tl-contents');
            const sorted = [...elements].sort((a, b) => pos(a) - pos(b));
            const chain = [{ e: '', children: [] }];
            for (const element of sorted) {
                const [depthStr, label] = element.textContent.split(':');
                const depth = Number(depthStr);
                const parent = chain[depth - 1];
                const child = { e: label };
                if (getProperty) {
                    child.data = element.dataset[getProperty];
                }
                parent.children = parent.children?.concat(child) ?? [child];
                chain[depth] = child;
            }
            return chain[0].children;
        }
    }
    const pos = (element) => Number(element.parentElement.parentElement.getAttribute('aria-posinset'));
    class ByLabelTreeSorter {
        compare(a, b) {
            if (a instanceof index_1.$sKb || b instanceof index_1.$sKb) {
                return (a instanceof index_1.$sKb ? -1 : 0) + (b instanceof index_1.$sKb ? 1 : 0);
            }
            if (a instanceof index_1.$rKb && b instanceof index_1.$rKb && a.test.item.uri && b.test.item.uri && a.test.item.uri.toString() === b.test.item.uri.toString() && a.test.item.range && b.test.item.range) {
                const delta = a.test.item.range.startLineNumber - b.test.item.range.startLineNumber;
                if (delta !== 0) {
                    return delta;
                }
            }
            return (a.test.item.sortText || a.test.item.label).localeCompare(b.test.item.sortText || b.test.item.label);
        }
    }
    // names are hard
    class $_fc extends lifecycle_1.$kc {
        constructor(makeTree, c = testStubs_1.$$fc.nested()) {
            super();
            this.c = c;
            this.f = this.B(new event_1.$fd());
            this.onFolderChange = this.B(new event_1.$fd());
            this.g = false;
            this.B(c);
            this.B(this.c.onDidGenerateDiff(d => this.c.setDiff(d /* don't clear during testing */)));
            const collection = new mainThreadTestCollection_1.$OKb((testId, levels) => {
                this.c.expand(testId, levels);
                if (!this.g) {
                    this.f.fire(this.c.collectDiff());
                }
                return Promise.resolve();
            });
            this.B(this.f.event(diff => collection.apply(diff)));
            this.projection = this.B(makeTree({
                collection,
                onDidProcessDiff: this.f.event,
            }));
            const sorter = new ByLabelTreeSorter();
            this.tree = this.B(new TestObjectTree(t => 'test' in t ? t.test.item.label : t.message.toString(), sorter));
            this.B(this.tree.onDidChangeCollapseState(evt => {
                if (evt.node.element instanceof index_1.$rKb) {
                    this.projection.expandElement(evt.node.element, evt.deep ? Infinity : 0);
                }
            }));
        }
        pushDiff(...diff) {
            this.f.fire(diff);
        }
        flush() {
            this.g = true;
            while (this.c.currentDiff.length) {
                this.f.fire(this.c.collectDiff());
            }
            this.g = false;
            this.projection.applyTo(this.tree);
            return this.tree.getRendered();
        }
    }
    exports.$_fc = $_fc;
});
//# sourceMappingURL=testObjectTree.js.map