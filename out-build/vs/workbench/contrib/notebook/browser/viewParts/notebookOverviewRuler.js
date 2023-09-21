/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/fastDomNode", "vs/platform/theme/common/themeService", "vs/workbench/contrib/notebook/browser/notebookBrowser"], function (require, exports, browser, fastDomNode_1, themeService_1, notebookBrowser_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$krb = void 0;
    let $krb = class $krb extends themeService_1.$nv {
        constructor(notebookEditor, container, themeService) {
            super(themeService);
            this.notebookEditor = notebookEditor;
            this.b = 3;
            this.a = (0, fastDomNode_1.$GP)(document.createElement('canvas'));
            this.a.setPosition('relative');
            this.a.setLayerHinting(true);
            this.a.setContain('strict');
            container.appendChild(this.a.domNode);
            this.B(notebookEditor.onDidChangeDecorations(() => {
                this.layout();
            }));
            this.B(browser.$WN.onDidChange(() => {
                this.layout();
            }));
        }
        layout() {
            const width = 10;
            const layoutInfo = this.notebookEditor.getLayoutInfo();
            const scrollHeight = layoutInfo.scrollHeight;
            const height = layoutInfo.height;
            const ratio = browser.$WN.value;
            this.a.setWidth(width);
            this.a.setHeight(height);
            this.a.domNode.width = width * ratio;
            this.a.domNode.height = height * ratio;
            const ctx = this.a.domNode.getContext('2d');
            ctx.clearRect(0, 0, width * ratio, height * ratio);
            this.c(ctx, width * ratio, height * ratio, scrollHeight * ratio, ratio);
        }
        c(ctx, width, height, scrollHeight, ratio) {
            const viewModel = this.notebookEditor.getViewModel();
            const fontInfo = this.notebookEditor.getLayoutInfo().fontInfo;
            const laneWidth = width / this.b;
            let currentFrom = 0;
            if (viewModel) {
                for (let i = 0; i < viewModel.viewCells.length; i++) {
                    const viewCell = viewModel.viewCells[i];
                    const textBuffer = viewCell.textBuffer;
                    const decorations = viewCell.getCellDecorations();
                    const cellHeight = (viewCell.layoutInfo.totalHeight / scrollHeight) * ratio * height;
                    decorations.filter(decoration => decoration.overviewRuler).forEach(decoration => {
                        const overviewRuler = decoration.overviewRuler;
                        const fillStyle = this.z(overviewRuler.color) ?? '#000000';
                        const lineHeight = Math.min(fontInfo.lineHeight, (viewCell.layoutInfo.editorHeight / scrollHeight / textBuffer.getLineCount()) * ratio * height);
                        const lineNumbers = overviewRuler.modelRanges.map(range => range.startLineNumber).reduce((previous, current) => {
                            if (previous.length === 0) {
                                previous.push(current);
                            }
                            else {
                                const last = previous[previous.length - 1];
                                if (last !== current) {
                                    previous.push(current);
                                }
                            }
                            return previous;
                        }, []);
                        let x = 0;
                        switch (overviewRuler.position) {
                            case notebookBrowser_1.NotebookOverviewRulerLane.Left:
                                x = 0;
                                break;
                            case notebookBrowser_1.NotebookOverviewRulerLane.Center:
                                x = laneWidth;
                                break;
                            case notebookBrowser_1.NotebookOverviewRulerLane.Right:
                                x = laneWidth * 2;
                                break;
                            default:
                                break;
                        }
                        const width = overviewRuler.position === notebookBrowser_1.NotebookOverviewRulerLane.Full ? laneWidth * 3 : laneWidth;
                        for (let i = 0; i < lineNumbers.length; i++) {
                            ctx.fillStyle = fillStyle;
                            const lineNumber = lineNumbers[i];
                            const offset = (lineNumber - 1) * lineHeight;
                            ctx.fillRect(x, currentFrom + offset, width, lineHeight);
                        }
                        if (overviewRuler.includeOutput) {
                            ctx.fillStyle = fillStyle;
                            const outputOffset = (viewCell.layoutInfo.editorHeight / scrollHeight) * ratio * height;
                            const decorationHeight = (fontInfo.lineHeight / scrollHeight) * ratio * height;
                            ctx.fillRect(laneWidth, currentFrom + outputOffset, laneWidth, decorationHeight);
                        }
                    });
                    currentFrom += cellHeight;
                }
            }
        }
    };
    exports.$krb = $krb;
    exports.$krb = $krb = __decorate([
        __param(2, themeService_1.$gv)
    ], $krb);
});
//# sourceMappingURL=notebookOverviewRuler.js.map