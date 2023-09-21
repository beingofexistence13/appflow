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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/fastDomNode", "vs/base/browser/ui/scrollbar/scrollbarState", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/editor/browser/widget/diffEditor/utils", "vs/editor/common/core/position", "vs/editor/common/viewModel/overviewZoneManager", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService"], function (require, exports, dom_1, fastDomNode_1, scrollbarState_1, lifecycle_1, observable_1, utils_1, position_1, overviewZoneManager_1, colorRegistry_1, themeService_1) {
    "use strict";
    var $qZ_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$qZ = void 0;
    let $qZ = class $qZ extends lifecycle_1.$kc {
        static { $qZ_1 = this; }
        static { this.ONE_OVERVIEW_WIDTH = 15; }
        static { this.ENTIRE_DIFF_OVERVIEW_WIDTH = $qZ_1.ONE_OVERVIEW_WIDTH * 2; }
        constructor(a, b, c, f, g, j, _options, n) {
            super();
            this.a = a;
            this.b = b;
            this.c = c;
            this.f = f;
            this.g = g;
            this.j = j;
            this._options = _options;
            this.n = n;
            const currentColorTheme = (0, observable_1.observableFromEvent)(this.n.onDidColorThemeChange, () => this.n.getColorTheme());
            const currentColors = (0, observable_1.derived)(reader => {
                /** @description colors */
                const theme = currentColorTheme.read(reader);
                const insertColor = theme.getColor(colorRegistry_1.$lx) || (theme.getColor(colorRegistry_1.$fx) || colorRegistry_1.$dx).transparent(2);
                const removeColor = theme.getColor(colorRegistry_1.$mx) || (theme.getColor(colorRegistry_1.$gx) || colorRegistry_1.$ex).transparent(2);
                return { insertColor, removeColor };
            });
            const scrollTopObservable = (0, observable_1.observableFromEvent)(this.a.modified.onDidScrollChange, () => this.a.modified.getScrollTop());
            const scrollHeightObservable = (0, observable_1.observableFromEvent)(this.a.modified.onDidScrollChange, () => this.a.modified.getScrollHeight());
            this.B((0, observable_1.autorunWithStore)((reader, store) => {
                /** @description create diff editor overview ruler if enabled */
                if (!this._options.renderOverviewRuler.read(reader)) {
                    return;
                }
                const viewportDomElement = (0, fastDomNode_1.$GP)(document.createElement('div'));
                viewportDomElement.setClassName('diffViewport');
                viewportDomElement.setPosition('absolute');
                const diffOverviewRoot = (0, dom_1.h)('div.diffOverview', {
                    style: { position: 'absolute', top: '0px', width: $qZ_1.ENTIRE_DIFF_OVERVIEW_WIDTH + 'px' }
                }).root;
                store.add((0, utils_1.$0Y)(diffOverviewRoot, viewportDomElement.domNode));
                store.add((0, dom_1.$oO)(diffOverviewRoot, dom_1.$3O.POINTER_DOWN, (e) => {
                    this.a.modified.delegateVerticalScrollbarPointerDown(e);
                }));
                store.add((0, dom_1.$nO)(diffOverviewRoot, dom_1.$3O.MOUSE_WHEEL, (e) => {
                    this.a.modified.delegateScrollFromMouseWheelEvent(e);
                }, { passive: false }));
                store.add((0, utils_1.$0Y)(this.b, diffOverviewRoot));
                store.add((0, observable_1.autorunWithStore)((reader, store) => {
                    /** @description recreate overview rules when model changes */
                    const m = this.c.read(reader);
                    const originalOverviewRuler = this.a.original.createOverviewRuler('original diffOverviewRuler');
                    if (originalOverviewRuler) {
                        store.add(originalOverviewRuler);
                        store.add((0, utils_1.$0Y)(diffOverviewRoot, originalOverviewRuler.getDomNode()));
                    }
                    const modifiedOverviewRuler = this.a.modified.createOverviewRuler('modified diffOverviewRuler');
                    if (modifiedOverviewRuler) {
                        store.add(modifiedOverviewRuler);
                        store.add((0, utils_1.$0Y)(diffOverviewRoot, modifiedOverviewRuler.getDomNode()));
                    }
                    if (!originalOverviewRuler || !modifiedOverviewRuler) {
                        // probably no model
                        return;
                    }
                    const origViewZonesChanged = (0, observable_1.observableSignalFromEvent)('viewZoneChanged', this.a.original.onDidChangeViewZones);
                    const modViewZonesChanged = (0, observable_1.observableSignalFromEvent)('viewZoneChanged', this.a.modified.onDidChangeViewZones);
                    const origHiddenRangesChanged = (0, observable_1.observableSignalFromEvent)('hiddenRangesChanged', this.a.original.onDidChangeHiddenAreas);
                    const modHiddenRangesChanged = (0, observable_1.observableSignalFromEvent)('hiddenRangesChanged', this.a.modified.onDidChangeHiddenAreas);
                    store.add((0, observable_1.autorun)(reader => {
                        /** @description set overview ruler zones */
                        origViewZonesChanged.read(reader);
                        modViewZonesChanged.read(reader);
                        origHiddenRangesChanged.read(reader);
                        modHiddenRangesChanged.read(reader);
                        const colors = currentColors.read(reader);
                        const diff = m?.diff.read(reader)?.mappings;
                        function createZones(ranges, color, editor) {
                            const vm = editor._getViewModel();
                            if (!vm) {
                                return [];
                            }
                            return ranges
                                .filter(d => d.length > 0)
                                .map(r => {
                                const start = vm.coordinatesConverter.convertModelPositionToViewPosition(new position_1.$js(r.startLineNumber, 1));
                                const end = vm.coordinatesConverter.convertModelPositionToViewPosition(new position_1.$js(r.endLineNumberExclusive, 1));
                                // By computing the lineCount, we won't ask the view model later for the bottom vertical position.
                                // (The view model will take into account the alignment viewzones, which will give
                                // modifications and deletetions always the same height.)
                                const lineCount = end.lineNumber - start.lineNumber;
                                return new overviewZoneManager_1.$gV(start.lineNumber, end.lineNumber, lineCount, color.toString());
                            });
                        }
                        const originalZones = createZones((diff || []).map(d => d.lineRangeMapping.original), colors.removeColor, this.a.original);
                        const modifiedZones = createZones((diff || []).map(d => d.lineRangeMapping.modified), colors.insertColor, this.a.modified);
                        originalOverviewRuler?.setZones(originalZones);
                        modifiedOverviewRuler?.setZones(modifiedZones);
                    }));
                    store.add((0, observable_1.autorun)(reader => {
                        /** @description layout overview ruler */
                        const height = this.g.read(reader);
                        const width = this.f.read(reader);
                        const layoutInfo = this.j.read(reader);
                        if (layoutInfo) {
                            const freeSpace = $qZ_1.ENTIRE_DIFF_OVERVIEW_WIDTH - 2 * $qZ_1.ONE_OVERVIEW_WIDTH;
                            originalOverviewRuler.setLayout({
                                top: 0,
                                height: height,
                                right: freeSpace + $qZ_1.ONE_OVERVIEW_WIDTH,
                                width: $qZ_1.ONE_OVERVIEW_WIDTH,
                            });
                            modifiedOverviewRuler.setLayout({
                                top: 0,
                                height: height,
                                right: 0,
                                width: $qZ_1.ONE_OVERVIEW_WIDTH,
                            });
                            const scrollTop = scrollTopObservable.read(reader);
                            const scrollHeight = scrollHeightObservable.read(reader);
                            const scrollBarOptions = this.a.modified.getOption(102 /* EditorOption.scrollbar */);
                            const state = new scrollbarState_1.$LP(scrollBarOptions.verticalHasArrows ? scrollBarOptions.arrowSize : 0, scrollBarOptions.verticalScrollbarSize, 0, layoutInfo.height, scrollHeight, scrollTop);
                            viewportDomElement.setTop(state.getSliderPosition());
                            viewportDomElement.setHeight(state.getSliderSize());
                        }
                        else {
                            viewportDomElement.setTop(0);
                            viewportDomElement.setHeight(0);
                        }
                        diffOverviewRoot.style.height = height + 'px';
                        diffOverviewRoot.style.left = (width - $qZ_1.ENTIRE_DIFF_OVERVIEW_WIDTH) + 'px';
                        viewportDomElement.setWidth($qZ_1.ENTIRE_DIFF_OVERVIEW_WIDTH);
                    }));
                }));
            }));
        }
    };
    exports.$qZ = $qZ;
    exports.$qZ = $qZ = $qZ_1 = __decorate([
        __param(7, themeService_1.$gv)
    ], $qZ);
});
//# sourceMappingURL=overviewRulerPart.js.map