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
    exports.$KBb = void 0;
    let $KBb = class $KBb extends lifecycle_1.$kc {
        constructor(modelService, c) {
            super();
            this.c = c;
            this.a = this.B(new event_1.$fd());
            this.onDidChangeMarker = this.a.event;
            this.b = new map_1.$zi();
            modelService.getModels().forEach(model => this.g(model));
            this.B(modelService.onModelAdded(this.g, this));
            this.B(modelService.onModelRemoved(this.h, this));
            this.B(this.c.onMarkerChanged(this.f, this));
        }
        dispose() {
            super.dispose();
            this.b.forEach(value => value.dispose());
            this.b.clear();
        }
        getMarker(uri, decoration) {
            const markerDecorations = this.b.get(uri);
            return markerDecorations ? (markerDecorations.getMarker(decoration) || null) : null;
        }
        getLiveMarkers(uri) {
            const markerDecorations = this.b.get(uri);
            return markerDecorations ? markerDecorations.getMarkers() : [];
        }
        f(changedResources) {
            changedResources.forEach((resource) => {
                const markerDecorations = this.b.get(resource);
                if (markerDecorations) {
                    this.j(markerDecorations);
                }
            });
        }
        g(model) {
            const markerDecorations = new MarkerDecorations(model);
            this.b.set(model.uri, markerDecorations);
            this.j(markerDecorations);
        }
        h(model) {
            const markerDecorations = this.b.get(model.uri);
            if (markerDecorations) {
                markerDecorations.dispose();
                this.b.delete(model.uri);
            }
            // clean up markers for internal, transient models
            if (model.uri.scheme === network_1.Schemas.inMemory
                || model.uri.scheme === network_1.Schemas.internal
                || model.uri.scheme === network_1.Schemas.vscode) {
                this.c?.read({ resource: model.uri }).map(marker => marker.owner).forEach(owner => this.c.remove(owner, [model.uri]));
            }
        }
        j(markerDecorations) {
            // Limit to the first 500 errors/warnings
            const markers = this.c.read({ resource: markerDecorations.model.uri, take: 500 });
            if (markerDecorations.update(markers)) {
                this.a.fire(markerDecorations.model);
            }
        }
    };
    exports.$KBb = $KBb;
    exports.$KBb = $KBb = __decorate([
        __param(0, model_2.$yA),
        __param(1, markers_1.$3s)
    ], $KBb);
    class MarkerDecorations extends lifecycle_1.$kc {
        constructor(model) {
            super();
            this.model = model;
            this.a = new map_1.$Ei();
            this.B((0, lifecycle_1.$ic)(() => {
                this.model.deltaDecorations([...this.a.values()], []);
                this.a.clear();
            }));
        }
        update(markers) {
            // We use the fact that marker instances are not recreated when different owners
            // update. So we can compare references to find out what changed since the last update.
            const { added, removed } = (0, collections_1.$J)(new Set(this.a.keys()), new Set(markers));
            if (added.length === 0 && removed.length === 0) {
                return false;
            }
            const oldIds = removed.map(marker => this.a.get(marker));
            const newDecorations = added.map(marker => {
                return {
                    range: this.b(this.model, marker),
                    options: this.c(marker)
                };
            });
            const ids = this.model.deltaDecorations(oldIds, newDecorations);
            for (const removedMarker of removed) {
                this.a.delete(removedMarker);
            }
            for (let index = 0; index < ids.length; index++) {
                this.a.set(added[index], ids[index]);
            }
            return true;
        }
        getMarker(decoration) {
            return this.a.getKey(decoration.id);
        }
        getMarkers() {
            const res = [];
            this.a.forEach((id, marker) => {
                const range = this.model.getDecorationRange(id);
                if (range) {
                    res.push([range, marker]);
                }
            });
            return res;
        }
        b(model, rawMarker) {
            let ret = range_1.$ks.lift(rawMarker);
            if (rawMarker.severity === markers_1.MarkerSeverity.Hint && !this.f(rawMarker, 1 /* MarkerTag.Unnecessary */) && !this.f(rawMarker, 2 /* MarkerTag.Deprecated */)) {
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
                    ret = new range_1.$ks(ret.startLineNumber, word.startColumn, ret.endLineNumber, word.endColumn);
                }
            }
            else if (rawMarker.endColumn === Number.MAX_VALUE && rawMarker.startColumn === 1 && ret.startLineNumber === ret.endLineNumber) {
                const minColumn = model.getLineFirstNonWhitespaceColumn(rawMarker.startLineNumber);
                if (minColumn < ret.endColumn) {
                    ret = new range_1.$ks(ret.startLineNumber, minColumn, ret.endLineNumber, ret.endColumn);
                    rawMarker.startColumn = minColumn;
                }
            }
            return ret;
        }
        c(marker) {
            let className;
            let color = undefined;
            let zIndex;
            let inlineClassName = undefined;
            let minimap;
            switch (marker.severity) {
                case markers_1.MarkerSeverity.Hint:
                    if (this.f(marker, 2 /* MarkerTag.Deprecated */)) {
                        className = undefined;
                    }
                    else if (this.f(marker, 1 /* MarkerTag.Unnecessary */)) {
                        className = "squiggly-unnecessary" /* ClassName.EditorUnnecessaryDecoration */;
                    }
                    else {
                        className = "squiggly-hint" /* ClassName.EditorHintDecoration */;
                    }
                    zIndex = 0;
                    break;
                case markers_1.MarkerSeverity.Info:
                    className = "squiggly-info" /* ClassName.EditorInfoDecoration */;
                    color = (0, themeService_1.$hv)(editorColorRegistry_1.$uB);
                    zIndex = 10;
                    minimap = {
                        color: (0, themeService_1.$hv)(colorRegistry_1.$Ey),
                        position: model_1.MinimapPosition.Inline
                    };
                    break;
                case markers_1.MarkerSeverity.Warning:
                    className = "squiggly-warning" /* ClassName.EditorWarningDecoration */;
                    color = (0, themeService_1.$hv)(editorColorRegistry_1.$tB);
                    zIndex = 20;
                    minimap = {
                        color: (0, themeService_1.$hv)(colorRegistry_1.$Fy),
                        position: model_1.MinimapPosition.Inline
                    };
                    break;
                case markers_1.MarkerSeverity.Error:
                default:
                    className = "squiggly-error" /* ClassName.EditorErrorDecoration */;
                    color = (0, themeService_1.$hv)(editorColorRegistry_1.$sB);
                    zIndex = 30;
                    minimap = {
                        color: (0, themeService_1.$hv)(colorRegistry_1.$Gy),
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
        f(marker, tag) {
            if (marker.tags) {
                return marker.tags.indexOf(tag) >= 0;
            }
            return false;
        }
    }
});
//# sourceMappingURL=markerDecorationsService.js.map