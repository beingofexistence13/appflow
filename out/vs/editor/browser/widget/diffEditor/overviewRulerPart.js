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
    var OverviewRulerPart_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OverviewRulerPart = void 0;
    let OverviewRulerPart = class OverviewRulerPart extends lifecycle_1.Disposable {
        static { OverviewRulerPart_1 = this; }
        static { this.ONE_OVERVIEW_WIDTH = 15; }
        static { this.ENTIRE_DIFF_OVERVIEW_WIDTH = OverviewRulerPart_1.ONE_OVERVIEW_WIDTH * 2; }
        constructor(_editors, _rootElement, _diffModel, _rootWidth, _rootHeight, _modifiedEditorLayoutInfo, _options, _themeService) {
            super();
            this._editors = _editors;
            this._rootElement = _rootElement;
            this._diffModel = _diffModel;
            this._rootWidth = _rootWidth;
            this._rootHeight = _rootHeight;
            this._modifiedEditorLayoutInfo = _modifiedEditorLayoutInfo;
            this._options = _options;
            this._themeService = _themeService;
            const currentColorTheme = (0, observable_1.observableFromEvent)(this._themeService.onDidColorThemeChange, () => this._themeService.getColorTheme());
            const currentColors = (0, observable_1.derived)(reader => {
                /** @description colors */
                const theme = currentColorTheme.read(reader);
                const insertColor = theme.getColor(colorRegistry_1.diffOverviewRulerInserted) || (theme.getColor(colorRegistry_1.diffInserted) || colorRegistry_1.defaultInsertColor).transparent(2);
                const removeColor = theme.getColor(colorRegistry_1.diffOverviewRulerRemoved) || (theme.getColor(colorRegistry_1.diffRemoved) || colorRegistry_1.defaultRemoveColor).transparent(2);
                return { insertColor, removeColor };
            });
            const scrollTopObservable = (0, observable_1.observableFromEvent)(this._editors.modified.onDidScrollChange, () => this._editors.modified.getScrollTop());
            const scrollHeightObservable = (0, observable_1.observableFromEvent)(this._editors.modified.onDidScrollChange, () => this._editors.modified.getScrollHeight());
            this._register((0, observable_1.autorunWithStore)((reader, store) => {
                /** @description create diff editor overview ruler if enabled */
                if (!this._options.renderOverviewRuler.read(reader)) {
                    return;
                }
                const viewportDomElement = (0, fastDomNode_1.createFastDomNode)(document.createElement('div'));
                viewportDomElement.setClassName('diffViewport');
                viewportDomElement.setPosition('absolute');
                const diffOverviewRoot = (0, dom_1.h)('div.diffOverview', {
                    style: { position: 'absolute', top: '0px', width: OverviewRulerPart_1.ENTIRE_DIFF_OVERVIEW_WIDTH + 'px' }
                }).root;
                store.add((0, utils_1.appendRemoveOnDispose)(diffOverviewRoot, viewportDomElement.domNode));
                store.add((0, dom_1.addStandardDisposableListener)(diffOverviewRoot, dom_1.EventType.POINTER_DOWN, (e) => {
                    this._editors.modified.delegateVerticalScrollbarPointerDown(e);
                }));
                store.add((0, dom_1.addDisposableListener)(diffOverviewRoot, dom_1.EventType.MOUSE_WHEEL, (e) => {
                    this._editors.modified.delegateScrollFromMouseWheelEvent(e);
                }, { passive: false }));
                store.add((0, utils_1.appendRemoveOnDispose)(this._rootElement, diffOverviewRoot));
                store.add((0, observable_1.autorunWithStore)((reader, store) => {
                    /** @description recreate overview rules when model changes */
                    const m = this._diffModel.read(reader);
                    const originalOverviewRuler = this._editors.original.createOverviewRuler('original diffOverviewRuler');
                    if (originalOverviewRuler) {
                        store.add(originalOverviewRuler);
                        store.add((0, utils_1.appendRemoveOnDispose)(diffOverviewRoot, originalOverviewRuler.getDomNode()));
                    }
                    const modifiedOverviewRuler = this._editors.modified.createOverviewRuler('modified diffOverviewRuler');
                    if (modifiedOverviewRuler) {
                        store.add(modifiedOverviewRuler);
                        store.add((0, utils_1.appendRemoveOnDispose)(diffOverviewRoot, modifiedOverviewRuler.getDomNode()));
                    }
                    if (!originalOverviewRuler || !modifiedOverviewRuler) {
                        // probably no model
                        return;
                    }
                    const origViewZonesChanged = (0, observable_1.observableSignalFromEvent)('viewZoneChanged', this._editors.original.onDidChangeViewZones);
                    const modViewZonesChanged = (0, observable_1.observableSignalFromEvent)('viewZoneChanged', this._editors.modified.onDidChangeViewZones);
                    const origHiddenRangesChanged = (0, observable_1.observableSignalFromEvent)('hiddenRangesChanged', this._editors.original.onDidChangeHiddenAreas);
                    const modHiddenRangesChanged = (0, observable_1.observableSignalFromEvent)('hiddenRangesChanged', this._editors.modified.onDidChangeHiddenAreas);
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
                                const start = vm.coordinatesConverter.convertModelPositionToViewPosition(new position_1.Position(r.startLineNumber, 1));
                                const end = vm.coordinatesConverter.convertModelPositionToViewPosition(new position_1.Position(r.endLineNumberExclusive, 1));
                                // By computing the lineCount, we won't ask the view model later for the bottom vertical position.
                                // (The view model will take into account the alignment viewzones, which will give
                                // modifications and deletetions always the same height.)
                                const lineCount = end.lineNumber - start.lineNumber;
                                return new overviewZoneManager_1.OverviewRulerZone(start.lineNumber, end.lineNumber, lineCount, color.toString());
                            });
                        }
                        const originalZones = createZones((diff || []).map(d => d.lineRangeMapping.original), colors.removeColor, this._editors.original);
                        const modifiedZones = createZones((diff || []).map(d => d.lineRangeMapping.modified), colors.insertColor, this._editors.modified);
                        originalOverviewRuler?.setZones(originalZones);
                        modifiedOverviewRuler?.setZones(modifiedZones);
                    }));
                    store.add((0, observable_1.autorun)(reader => {
                        /** @description layout overview ruler */
                        const height = this._rootHeight.read(reader);
                        const width = this._rootWidth.read(reader);
                        const layoutInfo = this._modifiedEditorLayoutInfo.read(reader);
                        if (layoutInfo) {
                            const freeSpace = OverviewRulerPart_1.ENTIRE_DIFF_OVERVIEW_WIDTH - 2 * OverviewRulerPart_1.ONE_OVERVIEW_WIDTH;
                            originalOverviewRuler.setLayout({
                                top: 0,
                                height: height,
                                right: freeSpace + OverviewRulerPart_1.ONE_OVERVIEW_WIDTH,
                                width: OverviewRulerPart_1.ONE_OVERVIEW_WIDTH,
                            });
                            modifiedOverviewRuler.setLayout({
                                top: 0,
                                height: height,
                                right: 0,
                                width: OverviewRulerPart_1.ONE_OVERVIEW_WIDTH,
                            });
                            const scrollTop = scrollTopObservable.read(reader);
                            const scrollHeight = scrollHeightObservable.read(reader);
                            const scrollBarOptions = this._editors.modified.getOption(102 /* EditorOption.scrollbar */);
                            const state = new scrollbarState_1.ScrollbarState(scrollBarOptions.verticalHasArrows ? scrollBarOptions.arrowSize : 0, scrollBarOptions.verticalScrollbarSize, 0, layoutInfo.height, scrollHeight, scrollTop);
                            viewportDomElement.setTop(state.getSliderPosition());
                            viewportDomElement.setHeight(state.getSliderSize());
                        }
                        else {
                            viewportDomElement.setTop(0);
                            viewportDomElement.setHeight(0);
                        }
                        diffOverviewRoot.style.height = height + 'px';
                        diffOverviewRoot.style.left = (width - OverviewRulerPart_1.ENTIRE_DIFF_OVERVIEW_WIDTH) + 'px';
                        viewportDomElement.setWidth(OverviewRulerPart_1.ENTIRE_DIFF_OVERVIEW_WIDTH);
                    }));
                }));
            }));
        }
    };
    exports.OverviewRulerPart = OverviewRulerPart;
    exports.OverviewRulerPart = OverviewRulerPart = OverviewRulerPart_1 = __decorate([
        __param(7, themeService_1.IThemeService)
    ], OverviewRulerPart);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3ZlcnZpZXdSdWxlclBhcnQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvYnJvd3Nlci93aWRnZXQvZGlmZkVkaXRvci9vdmVydmlld1J1bGVyUGFydC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBcUJ6RixJQUFNLGlCQUFpQixHQUF2QixNQUFNLGlCQUFrQixTQUFRLHNCQUFVOztpQkFDekIsdUJBQWtCLEdBQUcsRUFBRSxBQUFMLENBQU07aUJBQ3hCLCtCQUEwQixHQUFHLG1CQUFpQixDQUFDLGtCQUFrQixHQUFHLENBQUMsQUFBM0MsQ0FBNEM7UUFFN0YsWUFDa0IsUUFBMkIsRUFDM0IsWUFBeUIsRUFDekIsVUFBd0QsRUFDeEQsVUFBK0IsRUFDL0IsV0FBZ0MsRUFDaEMseUJBQStELEVBQ2hFLFFBQTJCLEVBQ1gsYUFBNEI7WUFFNUQsS0FBSyxFQUFFLENBQUM7WUFUUyxhQUFRLEdBQVIsUUFBUSxDQUFtQjtZQUMzQixpQkFBWSxHQUFaLFlBQVksQ0FBYTtZQUN6QixlQUFVLEdBQVYsVUFBVSxDQUE4QztZQUN4RCxlQUFVLEdBQVYsVUFBVSxDQUFxQjtZQUMvQixnQkFBVyxHQUFYLFdBQVcsQ0FBcUI7WUFDaEMsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUFzQztZQUNoRSxhQUFRLEdBQVIsUUFBUSxDQUFtQjtZQUNYLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1lBSTVELE1BQU0saUJBQWlCLEdBQUcsSUFBQSxnQ0FBbUIsRUFBQyxJQUFJLENBQUMsYUFBYSxDQUFDLHFCQUFxQixFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQztZQUVsSSxNQUFNLGFBQWEsR0FBRyxJQUFBLG9CQUFPLEVBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ3RDLDBCQUEwQjtnQkFDMUIsTUFB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