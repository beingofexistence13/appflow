/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/workbench/contrib/mergeEditor/browser/model/lineRange", "vs/nls!vs/workbench/contrib/mergeEditor/browser/mergeMarkers/mergeMarkersController"], function (require, exports, dom_1, lifecycle_1, observable_1, lineRange_1, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$dkb = exports.$ckb = void 0;
    exports.$ckb = {
        start: '<<<<<<<',
        end: '>>>>>>>',
    };
    class $dkb extends lifecycle_1.$kc {
        constructor(editor, mergeEditorViewModel) {
            super();
            this.editor = editor;
            this.mergeEditorViewModel = mergeEditorViewModel;
            this.a = [];
            this.f = new lifecycle_1.$jc();
            this.B(editor.onDidChangeModelContent(e => {
                this.g();
            }));
            this.B(editor.onDidChangeModel(e => {
                this.g();
            }));
            this.g();
        }
        g() {
            const model = this.editor.getModel();
            const blocks = model ? getBlocks(model, { blockToRemoveStartLinePrefix: exports.$ckb.start, blockToRemoveEndLinePrefix: exports.$ckb.end }) : { blocks: [] };
            this.editor.setHiddenAreas(blocks.blocks.map(b => b.lineRange.deltaEnd(-1).toRange()), this);
            this.editor.changeViewZones(c => {
                this.f.clear();
                for (const id of this.a) {
                    c.removeZone(id);
                }
                this.a.length = 0;
                for (const b of blocks.blocks) {
                    const startLine = model.getLineContent(b.lineRange.startLineNumber).substring(0, 20);
                    const endLine = model.getLineContent(b.lineRange.endLineNumberExclusive - 1).substring(0, 20);
                    const conflictingLinesCount = b.lineRange.lineCount - 2;
                    const domNode = (0, dom_1.h)('div', [
                        (0, dom_1.h)('div.conflict-zone-root', [
                            (0, dom_1.h)('pre', [startLine]),
                            (0, dom_1.h)('span.dots', ['...']),
                            (0, dom_1.h)('pre', [endLine]),
                            (0, dom_1.h)('span.text', [
                                conflictingLinesCount === 1
                                    ? nls.localize(0, null)
                                    : nls.localize(1, null, conflictingLinesCount)
                            ]),
                        ]),
                    ]).root;
                    this.a.push(c.addZone({
                        afterLineNumber: b.lineRange.endLineNumberExclusive - 1,
                        domNode,
                        heightInLines: 1.5,
                    }));
                    const updateWidth = () => {
                        const layoutInfo = this.editor.getLayoutInfo();
                        domNode.style.width = `${layoutInfo.contentWidth - layoutInfo.verticalScrollbarWidth}px`;
                    };
                    this.f.add(this.editor.onDidLayoutChange(() => {
                        updateWidth();
                    }));
                    updateWidth();
                    this.f.add((0, observable_1.autorun)(reader => {
                        /** @description update classname */
                        const vm = this.mergeEditorViewModel.read(reader);
                        if (!vm) {
                            return;
                        }
                        const activeRange = vm.activeModifiedBaseRange.read(reader);
                        const classNames = [];
                        classNames.push('conflict-zone');
                        if (activeRange) {
                            const activeRangeInResult = vm.model.getLineRangeInResult(activeRange.baseRange, reader);
                            if (activeRangeInResult.intersects(b.lineRange)) {
                                classNames.push('focused');
                            }
                        }
                        domNode.className = classNames.join(' ');
                    }));
                }
            });
        }
    }
    exports.$dkb = $dkb;
    function getBlocks(document, configuration) {
        const blocks = [];
        const transformedContent = [];
        let inBlock = false;
        let startLineNumber = -1;
        let curLine = 0;
        for (const line of document.getLinesContent()) {
            curLine++;
            if (!inBlock) {
                if (line.startsWith(configuration.blockToRemoveStartLinePrefix)) {
                    inBlock = true;
                    startLineNumber = curLine;
                }
                else {
                    transformedContent.push(line);
                }
            }
            else {
                if (line.startsWith(configuration.blockToRemoveEndLinePrefix)) {
                    inBlock = false;
                    blocks.push(new Block(new lineRange_1.$6ib(startLineNumber, curLine - startLineNumber + 1)));
                    transformedContent.push('');
                }
            }
        }
        return {
            blocks,
            transformedContent: transformedContent.join('\n')
        };
    }
    class Block {
        constructor(lineRange) {
            this.lineRange = lineRange;
        }
    }
});
//# sourceMappingURL=mergeMarkersController.js.map