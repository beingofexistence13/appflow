/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/tree/objectTree", "vs/base/common/event", "vs/base/common/lifecycle", "vs/workbench/contrib/testing/browser/explorerProjections/index", "vs/workbench/contrib/testing/common/mainThreadTestCollection", "vs/workbench/contrib/testing/test/common/testStubs"], function (require, exports, objectTree_1, event_1, lifecycle_1, index_1, mainThreadTestCollection_1, testStubs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestTreeTestHarness = void 0;
    const element = document.createElement('div');
    element.style.height = '1000px';
    element.style.width = '200px';
    class TestObjectTree extends objectTree_1.ObjectTree {
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
            return this.model;
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
            if (a instanceof index_1.TestTreeErrorMessage || b instanceof index_1.TestTreeErrorMessage) {
                return (a instanceof index_1.TestTreeErrorMessage ? -1 : 0) + (b instanceof index_1.TestTreeErrorMessage ? 1 : 0);
            }
            if (a instanceof index_1.TestItemTreeElement && b instanceof index_1.TestItemTreeElement && a.test.item.uri && b.test.item.uri && a.test.item.uri.toString() === b.test.item.uri.toString() && a.test.item.range && b.test.item.range) {
                const delta = a.test.item.range.startLineNumber - b.test.item.range.startLineNumber;
                if (delta !== 0) {
                    return delta;
                }
            }
            return (a.test.item.sortText || a.test.item.label).localeCompare(b.test.item.sortText || b.test.item.label);
        }
    }
    // names are hard
    class TestTreeTestHarness extends lifecycle_1.Disposable {
        constructor(makeTree, c = testStubs_1.testStubs.nested()) {
            super();
            this.c = c;
            this.onDiff = this._register(new event_1.Emitter());
            this.onFolderChange = this._register(new event_1.Emitter());
            this.isProcessingDiff = false;
            this._register(c);
            this._register(this.c.onDidGenerateDiff(d => this.c.setDiff(d /* don't clear during testing */)));
            const collection = new mainThreadTestCollection_1.MainThreadTestCollection((testId, levels) => {
                this.c.expand(testId, levels);
                if (!this.isProcessingDiff) {
                    this.onDiff.fire(this.c.collectDiff());
                }
                return Promise.resolve();
            });
            this._register(this.onDiff.event(diff => collection.apply(diff)));
            this.projection = this._register(makeTree({
                collection,
                onDidProcessDiff: this.onDiff.event,
            }));
            const sorter = new ByLabelTreeSorter();
            this.tree = this._register(new TestObjectTree(t => 'test' in t ? t.test.item.label : t.message.toString(), sorter));
            this._register(this.tree.onDidChangeCollapseState(evt => {
                if (evt.node.element instanceof index_1.TestItemTreeElement) {
                    this.projection.expandElement(evt.node.element, evt.deep ? Infinity : 0);
                }
            }));
        }
        pushDiff(...diff) {
            this.onDiff.fire(diff);
        }
        flush() {
            this.isProcessingDiff = true;
            while (this.c.currentDiff.length) {
                this.onDiff.fire(this.c.collectDiff());
            }
            this.isProcessingDiff = false;
            this.projection.applyTo(this.tree);
            return this.tree.getRendered();
        }
    }
    exports.TestTreeTestHarness = TestTreeTestHarness;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdE9iamVjdFRyZWUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXN0aW5nL3Rlc3QvYnJvd3Nlci90ZXN0T2JqZWN0VHJlZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFlaEcsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM5QyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUM7SUFDaEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDO0lBRTlCLE1BQU0sY0FBa0IsU0FBUSx1QkFBa0I7UUFDakQsWUFBWSxVQUErQixFQUFFLE1BQXVCO1lBQ25FLEtBQUssQ0FDSixNQUFNLEVBQ04sT0FBTyxFQUNQO2dCQUNDLFNBQVMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFO2dCQUNuQixhQUFhLEVBQUUsR0FBRyxFQUFFLENBQUMsU0FBUzthQUM5QixFQUNEO2dCQUNDO29CQUNDLGVBQWUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxTQUFTO29CQUNoQyxhQUFhLEVBQUUsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFNBQXNCLEVBQUUsRUFBRTt3QkFDdkQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFDL0MsU0FBUyxDQUFDLFdBQVcsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO29CQUNyRSxDQUFDO29CQUNELGNBQWMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3RCLFVBQVUsRUFBRSxTQUFTO2lCQUNyQjthQUNELEVBQ0Q7Z0JBQ0MsTUFBTSxFQUFFLE1B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