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
    exports.NotebookOverviewRuler = void 0;
    let NotebookOverviewRuler = class NotebookOverviewRuler extends themeService_1.Themable {
        constructor(notebookEditor, container, themeService) {
            super(themeService);
            this.notebookEditor = notebookEditor;
            this._lanes = 3;
            this._domNode = (0, fastDomNode_1.createFastDomNode)(document.createElement('canvas'));
            this._domNode.setPosition('relative');
            this._domNode.setLayerHinting(true);
            this._domNode.setContain('strict');
            container.appendChild(this._domNode.domNode);
            this._register(notebookEditor.onDidChangeDecorations(() => {
                this.layout();
            }));
            this._register(browser.PixelRatio.onDidChange(() => {
                this.layout();
            }));
        }
        layout() {
            const width = 10;
            const layoutInfo = this.notebookEditor.getLayoutInfo();
            const scrollHeight = layoutInfo.scrollHeight;
            const height = layoutInfo.height;
            const ratio = browser.PixelRatio.value;
            this._domNode.setWidth(width);
            this._domNode.setHeight(height);
            this._domNode.domNode.width = width * ratio;
            this._domNode.domNode.height = height * ratio;
            const ctx = this._domNode.domNode.getContext('2d');
            ctx.clearRect(0, 0, width * ratio, height * ratio);
            this._render(ctx, width * ratio, height * ratio, scrollHeight * ratio, ratio);
        }
        _render(ctx, width, height, scrollHeight, ratio) {
            const viewModel = this.notebookEditor.getViewModel();
            const fontInfo = this.notebookEditor.getLayoutInfo().fontInfo;
            const laneWidth = width / this._lanes;
            let currentFrom = 0;
            if (viewModel) {
                for (let i = 0; i < viewModel.viewCells.length; i++) {
                    const viewCell = viewModel.viewCells[i];
                    const textBuffer = viewCell.textBuffer;
                    const decorations = viewCell.getCellDecorations();
                    const cellHeight = (viewCell.layoutInfo.totalHeight / scrollHeight) * ratio * height;
                    decorations.filter(decoration => decoration.overviewRuler).forEach(decoration => {
                        const overviewRuler = decoration.overviewRuler;
                        const fillStyle = this.getColor(overviewRuler.color) ?? '#000000';
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
    exports.NotebookOverviewRuler = NotebookOverviewRuler;
    exports.NotebookOverviewRuler = NotebookOverviewRuler = __decorate([
        __param(2, themeService_1.IThemeService)
    ], NotebookOverviewRuler);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tPdmVydmlld1J1bGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci92aWV3UGFydHMvbm90ZWJvb2tPdmVydmlld1J1bGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQU96RixJQUFNLHFCQUFxQixHQUEzQixNQUFNLHFCQUFzQixTQUFRLHVCQUFRO1FBSWxELFlBQXFCLGNBQXVDLEVBQUUsU0FBc0IsRUFBaUIsWUFBMkI7WUFDL0gsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBREEsbUJBQWMsR0FBZCxjQUFjLENBQXlCO1lBRnBELFdBQU0sR0FBRyxDQUFDLENBQUM7WUFJbEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFBLCtCQUFpQixFQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNwRSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN0QyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNwQyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUVuQyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFN0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsc0JBQXNCLENBQUMsR0FBRyxFQUFFO2dCQUN6RCxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDZixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2xELElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNmLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRUQsTUFBTTtZQUNMLE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQztZQUNqQixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3ZELE1BQU0sWUFBWSxHQUFHLFVBQVUsQ0FBQyxZQUFZLENBQUM7WUFDN0MsTUFBTSxNQUFNLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQztZQUNqQyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQztZQUN2QyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM5QixJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNoQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUM1QyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsTUFBTSxHQUFHLEtBQUssQ0FBQztZQUM5QyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFFLENBQUM7WUFDcEQsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssR0FBRyxLQUFLLEVBQUUsTUFBTSxHQUFHLEtBQUssQ0FBQyxDQUFDO1lBQ25ELElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEtBQUssR0FBRyxLQUFLLEVBQUUsTUFBTSxHQUFHLEtBQUssRUFBRSxZQUFZLEdBQUcsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQy9FLENBQUM7UUFFTyxPQUFPLENBQUMsR0FBNkIsRUFBRSxLQUFhLEVBQUUsTUFBYyxFQUFFLFlBQW9CLEVBQUUsS0FBYTtZQUNoSCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ3JELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLENBQUMsUUFBUSxDQUFDO1lBQzlELE1BQU0sU0FBUyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBRXRDLElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQztZQUVwQixJQUFJLFNBQVMsRUFBRTtnQkFDZCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQ3BELE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3hDLE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUM7b0JBQ3ZDLE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO29CQUNsRCxNQUFNLFVBQVUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsV0FBVyxHQUFHLFlBQVksQ0FBQyxHQUFHLEtBQUssR0FBRyxNQUFNLENBQUM7b0JBRXJGLFdBQVcsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFO3dCQUMvRSxNQUFNLGFBQWEsR0FBRyxVQUFVLENBQUMsYUFBYyxDQUFDO3dCQUNoRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsSUFBSSxTQUFTLENBQUM7d0JBQ2xFLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsWUFBWSxHQUFHLFlBQVksR0FBRyxVQUFVLENBQUMsWUFBWSxFQUFFLENBQUMsR0FBRyxLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUM7d0JBQ2pKLE1BQU0sV0FBVyxHQUFHLGFBQWEsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQWtCLEVBQUUsT0FBZSxFQUFFLEVBQUU7NEJBQ2hJLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0NBQzFCLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7NkJBQ3ZCO2lDQUFNO2dDQUNOLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dDQUMzQyxJQUFJLElBQUksS0FBSyxPQUFPLEVBQUU7b0NBQ3JCLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7aUNBQ3ZCOzZCQUNEOzRCQUVELE9BQU8sUUFBUSxDQUFDO3dCQUNqQixDQUFDLEVBQUUsRUFBYyxDQUFDLENBQUM7d0JBRW5CLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDVixRQUFRLGFBQWEsQ0FBQyxRQUFRLEVBQUU7NEJBQy9CLEtBQUssMkNBQXlCLENBQUMsSUFBSTtnQ0FDbEMsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQ0FDTixNQUFNOzRCQUNQLEtBQUssMkNBQXlCLENBQUMsTUFBTTtnQ0FDcEMsQ0FBQyxHQUFHLFNBQVMsQ0FBQztnQ0FDZCxNQUFNOzRCQUNQLEtBQUssMkNBQXlCLENBQUMsS0FBSztnQ0FDbkMsQ0FBQyxHQUFHLFNBQVMsR0FBRyxDQUFDLENBQUM7Z0NBQ2xCLE1BQU07NEJBQ1A7Z0NBQ0MsTUFBTTt5QkFDUDt3QkFFRCxNQUFNLEtBQUssR0FBRyxhQUFhLENBQUMsUUFBUSxLQUFLLDJDQUF5QixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO3dCQUVwRyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTs0QkFDNUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7NEJBQzFCLE1BQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDbEMsTUFBTSxNQUFNLEdBQUcsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDOzRCQUM3QyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxXQUFXLEdBQUcsTUFBTSxFQUFFLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQzt5QkFDekQ7d0JBRUQsSUFBSSxhQUFhLENBQUMsYUFBYSxFQUFFOzRCQUNoQyxHQUFHLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQzs0QkFDMUIsTUFBTSxZQUFZLEdBQUcsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUMsR0FBRyxLQUFLLEdBQUcsTUFBTSxDQUFDOzRCQUN4RixNQUFNLGdCQUFnQixHQUFHLENBQUMsUUFBUSxDQUFDLFVBQVUsR0FBRyxZQUFZLENBQUMsR0FBRyxLQUFLLEdBQUcsTUFBTSxDQUFDOzRCQUMvRSxHQUFHLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxXQUFXLEdBQUcsWUFBWSxFQUFFLFNBQVMsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO3lCQUNqRjtvQkFDRixDQUFDLENBQUMsQ0FBQztvQkFFSCxXQUFXLElBQUksVUFBVSxDQUFDO2lCQUMxQjthQUNEO1FBQ0YsQ0FBQztLQUNELENBQUE7SUF4R1ksc0RBQXFCO29DQUFyQixxQkFBcUI7UUFJc0QsV0FBQSw0QkFBYSxDQUFBO09BSnhGLHFCQUFxQixDQXdHakMifQ==