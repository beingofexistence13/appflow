define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/contrib/find/browser/findDecorations", "vs/platform/theme/common/colorRegistry", "vs/workbench/contrib/notebook/browser/notebookBrowser"], function (require, exports, lifecycle_1, findDecorations_1, colorRegistry_1, notebookBrowser_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$wob = void 0;
    class $wob extends lifecycle_1.$kc {
        constructor(g, h) {
            super();
            this.g = g;
            this.h = h;
            this.a = [];
            this.b = [];
            this.c = [];
            this.f = null;
        }
        get currentMatchDecorations() {
            return this.f;
        }
        j() {
            this.clearCurrentFindMatchDecoration();
            this.setAllFindMatchesDecorations([]);
        }
        async highlightCurrentFindMatchDecorationInCell(cell, cellRange) {
            this.clearCurrentFindMatchDecoration();
            // match is an editor FindMatch, we update find match decoration in the editor
            // we will highlight the match in the webview
            this.g.changeModelDecorations(accessor => {
                const findMatchesOptions = findDecorations_1.$s7._CURRENT_FIND_MATCH_DECORATION;
                const decorations = [
                    { range: cellRange, options: findMatchesOptions }
                ];
                const deltaDecoration = {
                    ownerId: cell.handle,
                    decorations: decorations
                };
                this.f = {
                    kind: 'input',
                    decorations: accessor.deltaDecorations(this.f?.kind === 'input' ? this.f.decorations : [], [deltaDecoration])
                };
            });
            this.b = this.g.deltaCellDecorations(this.b, [{
                    ownerId: cell.handle,
                    handle: cell.handle,
                    options: {
                        overviewRuler: {
                            color: colorRegistry_1.$Ay,
                            modelRanges: [cellRange],
                            includeOutput: false,
                            position: notebookBrowser_1.NotebookOverviewRulerLane.Center
                        }
                    }
                }]);
            return null;
        }
        async highlightCurrentFindMatchDecorationInWebview(cell, index) {
            this.clearCurrentFindMatchDecoration();
            const offset = await this.g.findHighlightCurrent(index, this.h);
            this.f = { kind: 'output', index: index };
            this.b = this.g.deltaCellDecorations(this.b, [{
                    ownerId: cell.handle,
                    handle: cell.handle,
                    options: {
                        overviewRuler: {
                            color: colorRegistry_1.$Ay,
                            modelRanges: [],
                            includeOutput: true,
                            position: notebookBrowser_1.NotebookOverviewRulerLane.Center
                        }
                    }
                }]);
            return offset;
        }
        clearCurrentFindMatchDecoration() {
            if (this.f?.kind === 'input') {
                this.g.changeModelDecorations(accessor => {
                    accessor.deltaDecorations(this.f?.kind === 'input' ? this.f.decorations : [], []);
                    this.f = null;
                });
            }
            else if (this.f?.kind === 'output') {
                this.g.findUnHighlightCurrent(this.f.index, this.h);
            }
            this.b = this.g.deltaCellDecorations(this.b, []);
        }
        setAllFindMatchesDecorations(cellFindMatches) {
            this.g.changeModelDecorations((accessor) => {
                const findMatchesOptions = findDecorations_1.$s7._FIND_MATCH_DECORATION;
                const deltaDecorations = cellFindMatches.map(cellFindMatch => {
                    // Find matches
                    const newFindMatchesDecorations = new Array(cellFindMatch.contentMatches.length);
                    for (let i = 0; i < cellFindMatch.contentMatches.length; i++) {
                        newFindMatchesDecorations[i] = {
                            range: cellFindMatch.contentMatches[i].range,
                            options: findMatchesOptions
                        };
                    }
                    return { ownerId: cellFindMatch.cell.handle, decorations: newFindMatchesDecorations };
                });
                this.a = accessor.deltaDecorations(this.a, deltaDecorations);
            });
            this.c = this.g.deltaCellDecorations(this.c, cellFindMatches.map(cellFindMatch => {
                return {
                    ownerId: cellFindMatch.cell.handle,
                    handle: cellFindMatch.cell.handle,
                    options: {
                        overviewRuler: {
                            color: colorRegistry_1.$zy,
                            modelRanges: cellFindMatch.contentMatches.map(match => match.range),
                            includeOutput: cellFindMatch.webviewMatches.length > 0,
                            position: notebookBrowser_1.NotebookOverviewRulerLane.Center
                        }
                    }
                };
            }));
        }
        stopWebviewFind() {
            this.g.findStop(this.h);
        }
        dispose() {
            this.j();
            super.dispose();
        }
    }
    exports.$wob = $wob;
});
//# sourceMappingURL=findMatchDecorationModel.js.map