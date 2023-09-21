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
define(["require", "exports", "vs/platform/markers/common/markers", "vs/base/common/lifecycle", "vs/editor/common/model", "vs/platform/theme/common/themeService", "vs/editor/common/core/editorColorRegistry", "vs/editor/common/services/model", "vs/editor/common/core/range", "vs/base/common/network", "vs/base/common/event", "vs/platform/theme/common/colorRegistry", "vs/base/common/map", "vs/base/common/collections"], function (require, exports, markers_1, lifecycle_1, model_1, themeService_1, editorColorRegistry_1, model_2, range_1, network_1, event_1, colorRegistry_1, map_1, collections_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MarkerDecorationsService = void 0;
    let MarkerDecorationsService = class MarkerDecorationsService extends lifecycle_1.Disposable {
        constructor(modelService, _markerService) {
            super();
            this._markerService = _markerService;
            this._onDidChangeMarker = this._register(new event_1.Emitter());
            this.onDidChangeMarker = this._onDidChangeMarker.event;
            this._markerDecorations = new map_1.ResourceMap();
            modelService.getModels().forEach(model => this._onModelAdded(model));
            this._register(modelService.onModelAdded(this._onModelAdded, this));
            this._register(modelService.onModelRemoved(this._onModelRemoved, this));
            this._register(this._markerService.onMarkerChanged(this._handleMarkerChange, this));
        }
        dispose() {
            super.dispose();
            this._markerDecorations.forEach(value => value.dispose());
            this._markerDecorations.clear();
        }
        getMarker(uri, decoration) {
            const markerDecorations = this._markerDecorations.get(uri);
            return markerDecorations ? (markerDecorations.getMarker(decoration) || null) : null;
        }
        getLiveMarkers(uri) {
            const markerDecorations = this._markerDecorations.get(uri);
            return markerDecorations ? markerDecorations.getMarkers() : [];
        }
        _handleMarkerChange(changedResources) {
            changedResources.forEach((resource) => {
                const markerDecorations = this._markerDecorations.get(resource);
                if (markerDecorations) {
                    this._updateDecorations(markerDecorations);
                }
            });
        }
        _onModelAdded(model) {
            const markerDecorations = new MarkerDecorations(model);
            this._markerDecorations.set(model.uri, markerDecorations);
            this._updateDecorations(markerDecorations);
        }
        _onModelRemoved(model) {
            const markerDecorations = this._markerDecorations.get(model.uri);
            if (markerDecorations) {
                markerDecorations.dispose();
                this._markerDecorations.delete(model.uri);
            }
            // clean up markers for internal, transient models
            if (model.uri.scheme === network_1.Schemas.inMemory
                || model.uri.scheme === network_1.Schemas.internal
                || model.uri.scheme === network_1.Schemas.vscode) {
                this._markerService?.read({ resource: model.uri }).map(marker => marker.owner).forEach(owner => this._markerService.remove(owner, [model.uri]));
            }
        }
        _updateDecorations(markerDecorations) {
            // Limit to the first 500 errors/warnings
            const markers = this._markerService.read({ resource: markerDecorations.model.uri, take: 500 });
            if (markerDecorations.update(markers)) {
                this._onDidChangeMarker.fire(markerDecorations.model);
            }
        }
    };
    exports.MarkerDecorationsService = MarkerDecorationsService;
    exports.MarkerDecorationsService = MarkerDecorationsService = __decorate([
        __param(0, model_2.IModelService),
        __param(1, markers_1.IMarkerService)
    ], MarkerDecorationsService);
    class MarkerDecorations extends lifecycle_1.Disposable {
        constructor(model) {
            super();
            this.model = model;
            this._map = new map_1.BidirectionalMap();
            this._register((0, lifecycle_1.toDisposable)(() => {
                this.model.deltaDecorations([...this._map.values()], []);
                this._map.clear();
            }));
        }
        update(markers) {
            // We use the fact that marker instances are not recreated when different owners
            // update. So we can compare references to find out what changed since the last update.
            const { added, removed } = (0, collections_1.diffSets)(new Set(this._map.keys()), new Set(markers));
            if (added.length === 0 && removed.length === 0) {
                return false;
            }
            const oldIds = removed.map(marker => this._map.get(marker));
            const newDecorations = added.map(marker => {
                return {
                    range: this._createDecorationRange(this.model, marker),
                    options: this._createDecorationOption(marker)
                };
            });
            const ids = this.model.deltaDecorations(oldIds, newDecorations);
            for (const removedMarker of removed) {
                this._map.delete(removedMarker);
            }
            for (let index = 0; index < ids.length; index++) {
                this._map.set(added[index], ids[index]);
            }
            return true;
        }
        getMarker(decoration) {
            return this._map.getKey(decoration.id);
        }
        getMarkers() {
            const res = [];
            this._map.forEach((id, marker) => {
                const range = this.model.getDecorationRange(id);
                if (range) {
                    res.push([range, marker]);
                }
            });
            return res;
        }
        _createDecorationRange(model, rawMarker) {
            let ret = range_1.Range.lift(rawMarker);
            if (rawMarker.severity === markers_1.MarkerSeverity.Hint && !this._hasMarkerTag(rawMarker, 1 /* MarkerTag.Unnecessary */) && !this._hasMarkerTag(rawMarker, 2 /* MarkerTag.Deprecated */)) {
                // * never render hints on multiple lines
                // * make enough space for three dots
                ret = ret.setEndPosition(ret.startLineNumber, ret.startColumn + 2);
            }
            ret = model.validateRange(ret);
            if (ret.isEmpty()) {
                const maxColumn = model.getLineLastNonWhitespaceColumn(ret.startLineNumber) ||
                    model.getLineMaxColumn(ret.startLineNumber);
                if (maxColumn === 1 || ret.endColumn >= maxColumn) {
                    // empty line or behind eol
                    // keep the range as is, it will be rendered 1ch wide
                    return ret;
                }
                const word = model.getWordAtPosition(ret.getStartPosition());
                if (word) {
                    ret = new range_1.Range(ret.startLineNumber, word.startColumn, ret.endLineNumber, word.endColumn);
                }
            }
            else if (rawMarker.endColumn === Number.MAX_VALUE && rawMarker.startColumn === 1 && ret.startLineNumber === ret.endLineNumber) {
                const minColumn = model.getLineFirstNonWhitespaceColumn(rawMarker.startLineNumber);
                if (minColumn < ret.endColumn) {
                    ret = new range_1.Range(ret.startLineNumber, minColumn, ret.endLineNumber, ret.endColumn);
                    rawMarker.startColumn = minColumn;
                }
            }
            return ret;
        }
        _createDecorationOption(marker) {
            let className;
            let color = undefined;
            let zIndex;
            let inlineClassName = undefined;
            let minimap;
            switch (marker.severity) {
                case markers_1.MarkerSeverity.Hint:
                    if (this._hasMarkerTag(marker, 2 /* MarkerTag.Deprecated */)) {
                        className = undefined;
                    }
                    else if (this._hasMarkerTag(marker, 1 /* MarkerTag.Unnecessary */)) {
                        className = "squiggly-unnecessary" /* ClassName.EditorUnnecessaryDecoration */;
                    }
                    else {
                        className = "squiggly-hint" /* ClassName.EditorHintDecoration */;
                    }
                    zIndex = 0;
                    break;
                case markers_1.MarkerSeverity.Info:
                    className = "squiggly-info" /* ClassName.EditorInfoDecoration */;
                    color = (0, themeService_1.themeColorFromId)(editorColorRegistry_1.overviewRulerInfo);
                    zIndex = 10;
                    minimap = {
                        color: (0, themeService_1.themeColorFromId)(colorRegistry_1.minimapInfo),
                        position: model_1.MinimapPosition.Inline
                    };
                    break;
                case markers_1.MarkerSeverity.Warning:
                    className = "squiggly-warning" /* ClassName.EditorWarningDecoration */;
                    color = (0, themeService_1.themeColorFromId)(editorColorRegistry_1.overviewRulerWarning);
                    zIndex = 20;
                    minimap = {
                        color: (0, themeService_1.themeColorFromId)(colorRegistry_1.minimapWarning),
                        position: model_1.MinimapPosition.Inline
                    };
                    break;
                case markers_1.MarkerSeverity.Error:
                default:
                    className = "squiggly-error" /* ClassName.EditorErrorDecoration */;
                    color = (0, themeService_1.themeColorFromId)(editorColorRegistry_1.overviewRulerError);
                    zIndex = 30;
                    minimap = {
                        color: (0, themeService_1.themeColorFromId)(colorRegistry_1.minimapError),
                        position: model_1.MinimapPosition.Inline
                    };
                    break;
            }
            if (marker.tags) {
                if (marker.tags.indexOf(1 /* MarkerTag.Unnecessary */) !== -1) {
                    inlineClassName = "squiggly-inline-unnecessary" /* ClassName.EditorUnnecessaryInlineDecoration */;
                }
                if (marker.tags.indexOf(2 /* MarkerTag.Deprecated */) !== -1) {
                    inlineClassName = "squiggly-inline-deprecated" /* ClassName.EditorDeprecatedInlineDecoration */;
                }
            }
            return {
                description: 'marker-decoration',
                stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
                className,
                showIfCollapsed: true,
                overviewRuler: {
                    color,
                    position: model_1.OverviewRulerLane.Right
                },
                minimap,
                zIndex,
                inlineClassName,
            };
        }
        _hasMarkerTag(marker, tag) {
            if (marker.tags) {
                return marker.tags.indexOf(tag) >= 0;
            }
            return false;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2VyRGVjb3JhdGlvbnNTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9zZXJ2aWNlcy9tYXJrZXJEZWNvcmF0aW9uc1NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBbUJ6RixJQUFNLHdCQUF3QixHQUE5QixNQUFNLHdCQUF5QixTQUFRLHNCQUFVO1FBU3ZELFlBQ2dCLFlBQTJCLEVBQzFCLGNBQStDO1lBRS9ELEtBQUssRUFBRSxDQUFDO1lBRnlCLG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtZQVAvQyx1QkFBa0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFjLENBQUMsQ0FBQztZQUN2RSxzQkFBaUIsR0FBc0IsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQztZQUU3RCx1QkFBa0IsR0FBRyxJQUFJLGlCQUFXLEVBQXFCLENBQUM7WUFPMUUsWUFBWSxDQUFDLFNBQVMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNyRSxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3BFLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNyRixDQUFDO1FBRVEsT0FBTztZQUNmLEtBQUssQ0FB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