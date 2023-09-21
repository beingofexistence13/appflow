define(["require", "exports", "vs/base/common/codicons", "vs/base/common/themables", "vs/platform/markers/common/markers", "vs/workbench/contrib/notebook/browser/notebookIcons", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/editor/common/languages"], function (require, exports, codicons_1, themables_1, markers_1, notebookIcons_1, notebookCommon_1, languages_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$urb = void 0;
    class $urb {
        get icon() {
            if (this.symbolKind) {
                return languages_1.SymbolKinds.toIcon(this.symbolKind);
            }
            return this.isExecuting && this.isPaused ? notebookIcons_1.$Jpb :
                this.isExecuting ? themables_1.ThemeIcon.modify(notebookIcons_1.$Jpb, 'spin') :
                    this.cell.cellKind === notebookCommon_1.CellKind.Markup ? codicons_1.$Pj.markdown : codicons_1.$Pj.code;
        }
        constructor(index, level, cell, label, isExecuting, isPaused, position, symbolKind) {
            this.index = index;
            this.level = level;
            this.cell = cell;
            this.label = label;
            this.isExecuting = isExecuting;
            this.isPaused = isPaused;
            this.position = position;
            this.symbolKind = symbolKind;
            this.b = [];
        }
        addChild(entry) {
            this.b.push(entry);
            entry.c = this;
        }
        get parent() {
            return this.c;
        }
        get children() {
            return this.b;
        }
        get markerInfo() {
            return this.d;
        }
        updateMarkers(markerService) {
            if (this.cell.cellKind === notebookCommon_1.CellKind.Code) {
                // a code cell can have marker
                const marker = markerService.read({ resource: this.cell.uri, severities: markers_1.MarkerSeverity.Error | markers_1.MarkerSeverity.Warning });
                if (marker.length === 0) {
                    this.d = undefined;
                }
                else {
                    const topSev = marker.find(a => a.severity === markers_1.MarkerSeverity.Error)?.severity ?? markers_1.MarkerSeverity.Warning;
                    this.d = { topSev, count: marker.length };
                }
            }
            else {
                // a markdown cell can inherit markers from its children
                let topChild;
                for (const child of this.children) {
                    child.updateMarkers(markerService);
                    if (child.markerInfo) {
                        topChild = !topChild ? child.markerInfo.topSev : Math.max(child.markerInfo.topSev, topChild);
                    }
                }
                this.d = topChild && { topSev: topChild, count: 0 };
            }
        }
        clearMarkers() {
            this.d = undefined;
            for (const child of this.children) {
                child.clearMarkers();
            }
        }
        find(cell, parents) {
            if (cell.id === this.cell.id) {
                return this;
            }
            parents.push(this);
            for (const child of this.children) {
                const result = child.find(cell, parents);
                if (result) {
                    return result;
                }
            }
            parents.pop();
            return undefined;
        }
        asFlatList(bucket) {
            bucket.push(this);
            for (const child of this.children) {
                child.asFlatList(bucket);
            }
        }
    }
    exports.$urb = $urb;
});
//# sourceMappingURL=OutlineEntry.js.map