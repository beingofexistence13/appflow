define(["require", "exports", "vs/base/common/codicons", "vs/base/common/themables", "vs/platform/markers/common/markers", "vs/workbench/contrib/notebook/browser/notebookIcons", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/editor/common/languages"], function (require, exports, codicons_1, themables_1, markers_1, notebookIcons_1, notebookCommon_1, languages_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OutlineEntry = void 0;
    class OutlineEntry {
        get icon() {
            if (this.symbolKind) {
                return languages_1.SymbolKinds.toIcon(this.symbolKind);
            }
            return this.isExecuting && this.isPaused ? notebookIcons_1.executingStateIcon :
                this.isExecuting ? themables_1.ThemeIcon.modify(notebookIcons_1.executingStateIcon, 'spin') :
                    this.cell.cellKind === notebookCommon_1.CellKind.Markup ? codicons_1.Codicon.markdown : codicons_1.Codicon.code;
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
            this._children = [];
        }
        addChild(entry) {
            this._children.push(entry);
            entry._parent = this;
        }
        get parent() {
            return this._parent;
        }
        get children() {
            return this._children;
        }
        get markerInfo() {
            return this._markerInfo;
        }
        updateMarkers(markerService) {
            if (this.cell.cellKind === notebookCommon_1.CellKind.Code) {
                // a code cell can have marker
                const marker = markerService.read({ resource: this.cell.uri, severities: markers_1.MarkerSeverity.Error | markers_1.MarkerSeverity.Warning });
                if (marker.length === 0) {
                    this._markerInfo = undefined;
                }
                else {
                    const topSev = marker.find(a => a.severity === markers_1.MarkerSeverity.Error)?.severity ?? markers_1.MarkerSeverity.Warning;
                    this._markerInfo = { topSev, count: marker.length };
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
                this._markerInfo = topChild && { topSev: topChild, count: 0 };
            }
        }
        clearMarkers() {
            this._markerInfo = undefined;
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
    exports.OutlineEntry = OutlineEntry;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3V0bGluZUVudHJ5LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci92aWV3TW9kZWwvT3V0bGluZUVudHJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFtQkEsTUFBYSxZQUFZO1FBS3hCLElBQUksSUFBSTtZQUNQLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDcEIsT0FBTyx1QkFBVyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDM0M7WUFDRCxPQUFPLElBQUksQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsa0NBQWtCLENBQUMsQ0FBQztnQkFDOUQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMscUJBQVMsQ0FBQyxNQUFNLENBQUMsa0NBQWtCLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztvQkFDaEUsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEtBQUsseUJBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLGtCQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxrQkFBTyxDQUFDLElBQUksQ0FBQztRQUM1RSxDQUFDO1FBRUQsWUFDVSxLQUFhLEVBQ2IsS0FBYSxFQUNiLElBQW9CLEVBQ3BCLEtBQWEsRUFDYixXQUFvQixFQUNwQixRQUFpQixFQUNqQixRQUFnQixFQUNoQixVQUF1QjtZQVB2QixVQUFLLEdBQUwsS0FBSyxDQUFRO1lBQ2IsVUFBSyxHQUFMLEtBQUssQ0FBUTtZQUNiLFNBQUksR0FBSixJQUFJLENBQWdCO1lBQ3BCLFVBQUssR0FBTCxLQUFLLENBQVE7WUFDYixnQkFBVyxHQUFYLFdBQVcsQ0FBUztZQUNwQixhQUFRLEdBQVIsUUFBUSxDQUFTO1lBQ2pCLGFBQVEsR0FBUixRQUFRLENBQVE7WUFDaEIsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQXJCekIsY0FBUyxHQUFtQixFQUFFLENBQUM7UUFzQm5DLENBQUM7UUFFTCxRQUFRLENBQUMsS0FBbUI7WUFDM0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDM0IsS0FBSyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDdEIsQ0FBQztRQUVELElBQUksTUFBTTtZQUNULE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUNyQixDQUFDO1FBRUQsSUFBSSxRQUFRO1lBQ1gsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ3ZCLENBQUM7UUFFRCxJQUFJLFVBQVU7WUFDYixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDekIsQ0FBQztRQUVELGFBQWEsQ0FBQyxhQUE2QjtZQUMxQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxLQUFLLHlCQUFRLENBQUMsSUFBSSxFQUFFO2dCQUN6Qyw4QkFBOEI7Z0JBQzlCLE1BQU0sTUFBTSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsVUFBVSxFQUFFLHdCQUFjLENBQUMsS0FBSyxHQUFHLHdCQUFjLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztnQkFDMUgsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtvQkFDeEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxTQUFTLENBQUM7aUJBQzdCO3FCQUFNO29CQUNOLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxLQUFLLHdCQUFjLENBQUMsS0FBSyxDQUFDLEVBQUUsUUFBUSxJQUFJLHdCQUFjLENBQUMsT0FBTyxDQUFDO29CQUN6RyxJQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7aUJBQ3BEO2FBQ0Q7aUJBQU07Z0JBQ04sd0RBQXdEO2dCQUN4RCxJQUFJLFFBQW9DLENBQUM7Z0JBQ3pDLEtBQUssTUFBTSxLQUFLLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtvQkFDbEMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBQztvQkFDbkMsSUFBSSxLQUFLLENBQUMsVUFBVSxFQUFFO3dCQUNyQixRQUFRLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO3FCQUM3RjtpQkFDRDtnQkFDRCxJQUFJLENBQUMsV0FBVyxHQUFHLFFBQVEsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDO2FBQzlEO1FBQ0YsQ0FBQztRQUVELFlBQVk7WUFDWCxJQUFJLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQztZQUM3QixLQUFLLE1BQU0sS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ2xDLEtBQUssQ0FBQyxZQUFZLEVBQUUsQ0FBQzthQUNyQjtRQUNGLENBQUM7UUFFRCxJQUFJLENBQUMsSUFBb0IsRUFBRSxPQUF1QjtZQUNqRCxJQUFJLElBQUksQ0FBQyxFQUFFLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUU7Z0JBQzdCLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFDRCxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ25CLEtBQUssTUFBTSxLQUFLLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDbEMsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQ3pDLElBQUksTUFBTSxFQUFFO29CQUNYLE9BQU8sTUFBTSxDQUFDO2lCQUNkO2FBQ0Q7WUFDRCxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDZCxPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBRUQsVUFBVSxDQUFDLE1BQXNCO1lBQ2hDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEIsS0FBSyxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUNsQyxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ3pCO1FBQ0YsQ0FBQztLQUNEO0lBN0ZELG9DQTZGQyJ9