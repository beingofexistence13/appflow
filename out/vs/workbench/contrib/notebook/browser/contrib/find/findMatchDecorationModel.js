define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/contrib/find/browser/findDecorations", "vs/platform/theme/common/colorRegistry", "vs/workbench/contrib/notebook/browser/notebookBrowser"], function (require, exports, lifecycle_1, findDecorations_1, colorRegistry_1, notebookBrowser_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FindMatchDecorationModel = void 0;
    class FindMatchDecorationModel extends lifecycle_1.Disposable {
        constructor(_notebookEditor, ownerID) {
            super();
            this._notebookEditor = _notebookEditor;
            this.ownerID = ownerID;
            this._allMatchesDecorations = [];
            this._currentMatchCellDecorations = [];
            this._allMatchesCellDecorations = [];
            this._currentMatchDecorations = null;
        }
        get currentMatchDecorations() {
            return this._currentMatchDecorations;
        }
        clearDecorations() {
            this.clearCurrentFindMatchDecoration();
            this.setAllFindMatchesDecorations([]);
        }
        async highlightCurrentFindMatchDecorationInCell(cell, cellRange) {
            this.clearCurrentFindMatchDecoration();
            // match is an editor FindMatch, we update find match decoration in the editor
            // we will highlight the match in the webview
            this._notebookEditor.changeModelDecorations(accessor => {
                const findMatchesOptions = findDecorations_1.FindDecorations._CURRENT_FIND_MATCH_DECORATION;
                const decorations = [
                    { range: cellRange, options: findMatchesOptions }
                ];
                const deltaDecoration = {
                    ownerId: cell.handle,
                    decorations: decorations
                };
                this._currentMatchDecorations = {
                    kind: 'input',
                    decorations: accessor.deltaDecorations(this._currentMatchDecorations?.kind === 'input' ? this._currentMatchDecorations.decorations : [], [deltaDecoration])
                };
            });
            this._currentMatchCellDecorations = this._notebookEditor.deltaCellDecorations(this._currentMatchCellDecorations, [{
                    ownerId: cell.handle,
                    handle: cell.handle,
                    options: {
                        overviewRuler: {
                            color: colorRegistry_1.overviewRulerSelectionHighlightForeground,
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
            const offset = await this._notebookEditor.findHighlightCurrent(index, this.ownerID);
            this._currentMatchDecorations = { kind: 'output', index: index };
            this._currentMatchCellDecorations = this._notebookEditor.deltaCellDecorations(this._currentMatchCellDecorations, [{
                    ownerId: cell.handle,
                    handle: cell.handle,
                    options: {
                        overviewRuler: {
                            color: colorRegistry_1.overviewRulerSelectionHighlightForeground,
                            modelRanges: [],
                            includeOutput: true,
                            position: notebookBrowser_1.NotebookOverviewRulerLane.Center
                        }
                    }
                }]);
            return offset;
        }
        clearCurrentFindMatchDecoration() {
            if (this._currentMatchDecorations?.kind === 'input') {
                this._notebookEditor.changeModelDecorations(accessor => {
                    accessor.deltaDecorations(this._currentMatchDecorations?.kind === 'input' ? this._currentMatchDecorations.decorations : [], []);
                    this._currentMatchDecorations = null;
                });
            }
            else if (this._currentMatchDecorations?.kind === 'output') {
                this._notebookEditor.findUnHighlightCurrent(this._currentMatchDecorations.index, this.ownerID);
            }
            this._currentMatchCellDecorations = this._notebookEditor.deltaCellDecorations(this._currentMatchCellDecorations, []);
        }
        setAllFindMatchesDecorations(cellFindMatches) {
            this._notebookEditor.changeModelDecorations((accessor) => {
                const findMatchesOptions = findDecorations_1.FindDecorations._FIND_MATCH_DECORATION;
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
                this._allMatchesDecorations = accessor.deltaDecorations(this._allMatchesDecorations, deltaDecorations);
            });
            this._allMatchesCellDecorations = this._notebookEditor.deltaCellDecorations(this._allMatchesCellDecorations, cellFindMatches.map(cellFindMatch => {
                return {
                    ownerId: cellFindMatch.cell.handle,
                    handle: cellFindMatch.cell.handle,
                    options: {
                        overviewRuler: {
                            color: colorRegistry_1.overviewRulerFindMatchForeground,
                            modelRanges: cellFindMatch.contentMatches.map(match => match.range),
                            includeOutput: cellFindMatch.webviewMatches.length > 0,
                            position: notebookBrowser_1.NotebookOverviewRulerLane.Center
                        }
                    }
                };
            }));
        }
        stopWebviewFind() {
            this._notebookEditor.findStop(this.ownerID);
        }
        dispose() {
            this.clearDecorations();
            super.dispose();
        }
    }
    exports.FindMatchDecorationModel = FindMatchDecorationModel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZE1hdGNoRGVjb3JhdGlvbk1vZGVsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci9jb250cmliL2ZpbmQvZmluZE1hdGNoRGVjb3JhdGlvbk1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFZQSxNQUFhLHdCQUF5QixTQUFRLHNCQUFVO1FBTXZELFlBQ2tCLGVBQWdDLEVBQ2hDLE9BQWU7WUFFaEMsS0FBSyxFQUFFLENBQUM7WUFIUyxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7WUFDaEMsWUFBTyxHQUFQLE9BQU8sQ0FBUTtZQVB6QiwyQkFBc0IsR0FBNEIsRUFBRSxDQUFDO1lBQ3JELGlDQUE0QixHQUFhLEVBQUUsQ0FBQztZQUM1QywrQkFBMEIsR0FBYSxFQUFFLENBQUM7WUFDMUMsNkJBQXdCLEdBQXVHLElBQUksQ0FBQztRQU81SSxDQUFDO1FBRUQsSUFBVyx1QkFBdUI7WUFDakMsT0FBTyxJQUFJLENBQUMsd0JBQXdCLENBQUM7UUFDdEMsQ0FBQztRQUVPLGdCQUFnQjtZQUN2QixJQUFJLENBQUMsK0JBQStCLEVBQUUsQ0FBQztZQUN2QyxJQUFJLENBQUMsNEJBQTRCLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdkMsQ0FBQztRQUdNLEtBQUssQ0FBQyx5Q0FBeUMsQ0FBQyxJQUFvQixFQUFFLFNBQWdCO1lBRTVGLElBQUksQ0FBQywrQkFBK0IsRUFBRSxDQUFDO1lBRXZDLDhFQUE4RTtZQUM5RSw2Q0FBNkM7WUFDN0MsSUFBSSxDQUFDLGVBQWUsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDdEQsTUFBTSxrQkFBa0IsR0FBMkIsaUNBQWUsQ0FBQyw4QkFBOEIsQ0FBQztnQkFFbEcsTUFBTSxXQUFXLEdBQTRCO29CQUM1QyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFF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