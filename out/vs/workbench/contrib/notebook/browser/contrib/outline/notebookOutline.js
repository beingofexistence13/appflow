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
define(["require", "exports", "vs/nls", "vs/base/browser/ui/iconLabel/iconLabel", "vs/base/common/async", "vs/base/common/event", "vs/base/common/filters", "vs/base/common/lifecycle", "vs/base/common/themables", "vs/editor/common/services/getIconClasses", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/instantiation/common/instantiation", "vs/platform/markers/common/markers", "vs/platform/registry/common/platform", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/common/contributions", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/notebookEditor", "vs/workbench/contrib/notebook/browser/viewModel/notebookOutlineProvider", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/outline/browser/outline"], function (require, exports, nls_1, iconLabel_1, async_1, event_1, filters_1, lifecycle_1, themables_1, getIconClasses_1, configuration_1, configurationRegistry_1, instantiation_1, markers_1, platform_1, colorRegistry_1, themeService_1, contributions_1, notebookBrowser_1, notebookEditor_1, notebookOutlineProvider_1, notebookCommon_1, editorService_1, outline_1) {
    "use strict";
    var NotebookCellOutline_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookOutlineCreator = exports.NotebookCellOutline = void 0;
    class NotebookOutlineTemplate {
        static { this.templateId = 'NotebookOutlineRenderer'; }
        constructor(container, iconClass, iconLabel, decoration) {
            this.container = container;
            this.iconClass = iconClass;
            this.iconLabel = iconLabel;
            this.decoration = decoration;
        }
    }
    let NotebookOutlineRenderer = class NotebookOutlineRenderer {
        constructor(_themeService, _configurationService) {
            this._themeService = _themeService;
            this._configurationService = _configurationService;
            this.templateId = NotebookOutlineTemplate.templateId;
        }
        renderTemplate(container) {
            container.classList.add('notebook-outline-element', 'show-file-icons');
            const iconClass = document.createElement('div');
            container.append(iconClass);
            const iconLabel = new iconLabel_1.IconLabel(container, { supportHighlights: true });
            const decoration = document.createElement('div');
            decoration.className = 'element-decoration';
            container.append(decoration);
            return new NotebookOutlineTemplate(container, iconClass, iconLabel, decoration);
        }
        renderElement(node, _index, template, _height) {
            const extraClasses = [];
            const options = {
                matches: (0, filters_1.createMatches)(node.filterData),
                labelEscapeNewLines: true,
                extraClasses,
            };
            if (node.element.cell.cellKind === notebookCommon_1.CellKind.Code && this._themeService.getFileIconTheme().hasFileIcons && !node.element.isExecuting) {
                template.iconClass.className = '';
                extraClasses.push(...(0, getIconClasses_1.getIconClassesForLanguageId)(node.element.cell.language ?? ''));
            }
            else {
                template.iconClass.className = 'element-icon ' + themables_1.ThemeIcon.asClassNameArray(node.element.icon).join(' ');
            }
            template.iconLabel.setLabel(node.element.label, undefined, options);
            const { markerInfo } = node.element;
            template.container.style.removeProperty('--outline-element-color');
            template.decoration.innerText = '';
            if (markerInfo) {
                const useBadges = this._configurationService.getValue("outline.problems.badges" /* OutlineConfigKeys.problemsBadges */);
                if (!useBadges) {
                    template.decoration.classList.remove('bubble');
                    template.decoration.innerText = '';
                }
                else if (markerInfo.count === 0) {
                    template.decoration.classList.add('bubble');
                    template.decoration.innerText = '\uea71';
                }
                else {
                    template.decoration.classList.remove('bubble');
                    template.decoration.innerText = markerInfo.count > 9 ? '9+' : String(markerInfo.count);
                }
                const color = this._themeService.getColorTheme().getColor(markerInfo.topSev === markers_1.MarkerSeverity.Error ? colorRegistry_1.listErrorForeground : colorRegistry_1.listWarningForeground);
                const useColors = this._configurationService.getValue("outline.problems.colors" /* OutlineConfigKeys.problemsColors */);
                if (!useColors) {
                    template.container.style.removeProperty('--outline-element-color');
                    template.decoration.style.setProperty('--outline-element-color', color?.toString() ?? 'inherit');
                }
                else {
                    template.container.style.setProperty('--outline-element-color', color?.toString() ?? 'inherit');
                }
            }
        }
        disposeTemplate(templateData) {
            templateData.iconLabel.dispose();
        }
    };
    NotebookOutlineRenderer = __decorate([
        __param(0, themeService_1.IThemeService),
        __param(1, configuration_1.IConfigurationService)
    ], NotebookOutlineRenderer);
    class NotebookOutlineAccessibility {
        getAriaLabel(element) {
            return element.label;
        }
        getWidgetAriaLabel() {
            return '';
        }
    }
    class NotebookNavigationLabelProvider {
        getKeyboardNavigationLabel(element) {
            return element.label;
        }
    }
    class NotebookOutlineVirtualDelegate {
        getHeight(_element) {
            return 22;
        }
        getTemplateId(_element) {
            return NotebookOutlineTemplate.templateId;
        }
    }
    let NotebookQuickPickProvider = class NotebookQuickPickProvider {
        constructor(_getEntries, _themeService) {
            this._getEntries = _getEntries;
            this._themeService = _themeService;
        }
        getQuickPickElements() {
            const bucket = [];
            for (const entry of this._getEntries()) {
                entry.asFlatList(bucket);
            }
            const result = [];
            const { hasFileIcons } = this._themeService.getFileIconTheme();
            for (const element of bucket) {
                const useFileIcon = hasFileIcons && !element.symbolKind;
                // todo@jrieken it is fishy that codicons cannot be used with iconClasses
                // but file icons can...
                result.push({
                    element,
                    label: useFileIcon ? element.label : `$(${element.icon.id}) ${element.label}`,
                    ariaLabel: element.label,
                    iconClasses: useFileIcon ? (0, getIconClasses_1.getIconClassesForLanguageId)(element.cell.language ?? '') : undefined,
                });
            }
            return result;
        }
    };
    NotebookQuickPickProvider = __decorate([
        __param(1, themeService_1.IThemeService)
    ], NotebookQuickPickProvider);
    class NotebookComparator {
        constructor() {
            this._collator = new async_1.IdleValue(() => new Intl.Collator(undefined, { numeric: true }));
        }
        compareByPosition(a, b) {
            return a.index - b.index;
        }
        compareByType(a, b) {
            return a.cell.cellKind - b.cell.cellKind || this._collator.value.compare(a.label, b.label);
        }
        compareByName(a, b) {
            return this._collator.value.compare(a.label, b.label);
        }
    }
    let NotebookCellOutline = NotebookCellOutline_1 = class NotebookCellOutline {
        get entries() {
            return this._outlineProvider?.entries ?? [];
        }
        get activeElement() {
            return this._outlineProvider?.activeElement;
        }
        constructor(_editor, _target, instantiationService, _editorService, _configurationService) {
            this._editor = _editor;
            this._editorService = _editorService;
            this._dispoables = new lifecycle_1.DisposableStore();
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this._entriesDisposables = new lifecycle_1.DisposableStore();
            this.outlineKind = 'notebookCells';
            this._localDisposables = new lifecycle_1.DisposableStore();
            const installSelectionListener = () => {
                const notebookEditor = _editor.getControl();
                if (!notebookEditor?.hasModel()) {
                    this._outlineProvider?.dispose();
                    this._outlineProvider = undefined;
                    this._localDisposables.clear();
                }
                else {
                    this._outlineProvider?.dispose();
                    this._localDisposables.clear();
                    this._outlineProvider = instantiationService.createInstance(notebookOutlineProvider_1.NotebookCellOutlineProvider, notebookEditor, _target);
                    this._localDisposables.add(this._outlineProvider.onDidChange(e => {
                        this._onDidChange.fire(e);
                    }));
                }
            };
            this._dispoables.add(_editor.onDidChangeModel(() => {
                installSelectionListener();
            }));
            installSelectionListener();
            const treeDataSource = { getChildren: parent => parent instanceof NotebookCellOutline_1 ? (this._outlineProvider?.entries ?? []) : parent.children };
            const delegate = new NotebookOutlineVirtualDelegate();
            const renderers = [instantiationService.createInstance(NotebookOutlineRenderer)];
            const comparator = new NotebookComparator();
            const options = {
                collapseByDefault: _target === 2 /* OutlineTarget.Breadcrumbs */ || (_target === 1 /* OutlineTarget.OutlinePane */ && _configurationService.getValue("outline.collapseItems" /* OutlineConfigKeys.collapseItems */) === "alwaysCollapse" /* OutlineConfigCollapseItemsValues.Collapsed */),
                expandOnlyOnTwistieClick: true,
                multipleSelectionSupport: false,
                accessibilityProvider: new NotebookOutlineAccessibility(),
                identityProvider: { getId: element => element.cell.uri.toString() },
                keyboardNavigationLabelProvider: new NotebookNavigationLabelProvider()
            };
            this.config = {
                breadcrumbsDataSource: {
                    getBreadcrumbElements: () => {
                        const result = [];
                        let candidate = this.activeElement;
                        while (candidate) {
                            result.unshift(candidate);
                            candidate = candidate.parent;
                        }
                        return result;
                    }
                },
                quickPickDataSource: instantiationService.createInstance(NotebookQuickPickProvider, () => (this._outlineProvider?.entries ?? [])),
                treeDataSource,
                delegate,
                renderers,
                comparator,
                options
            };
        }
        async setFullSymbols(cancelToken) {
            await this._outlineProvider?.setFullSymbols(cancelToken);
        }
        get uri() {
            return this._outlineProvider?.uri;
        }
        get isEmpty() {
            return this._outlineProvider?.isEmpty ?? true;
        }
        async reveal(entry, options, sideBySide) {
            await this._editorService.openEditor({
                resource: entry.cell.uri,
                options: {
                    ...options,
                    override: this._editor.input?.editorId,
                    cellRevealType: notebookBrowser_1.CellRevealType.NearTopIfOutsideViewport,
                    selection: entry.position
                },
            }, sideBySide ? editorService_1.SIDE_GROUP : undefined);
        }
        preview(entry) {
            const widget = this._editor.getControl();
            if (!widget) {
                return lifecycle_1.Disposable.None;
            }
            widget.revealInCenterIfOutsideViewport(entry.cell);
            const ids = widget.deltaCellDecorations([], [{
                    handle: entry.cell.handle,
                    options: { className: 'nb-symbolHighlight', outputClassName: 'nb-symbolHighlight' }
                }]);
            return (0, lifecycle_1.toDisposable)(() => { widget.deltaCellDecorations(ids, []); });
        }
        captureViewState() {
            const widget = this._editor.getControl();
            const viewState = widget?.getEditorViewState();
            return (0, lifecycle_1.toDisposable)(() => {
                if (viewState) {
                    widget?.restoreListViewState(viewState);
                }
            });
        }
        dispose() {
            this._onDidChange.dispose();
            this._dispoables.dispose();
            this._entriesDisposables.dispose();
            this._outlineProvider?.dispose();
            this._localDisposables.dispose();
        }
    };
    exports.NotebookCellOutline = NotebookCellOutline;
    exports.NotebookCellOutline = NotebookCellOutline = NotebookCellOutline_1 = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, editorService_1.IEditorService),
        __param(4, configuration_1.IConfigurationService)
    ], NotebookCellOutline);
    let NotebookOutlineCreator = class NotebookOutlineCreator {
        constructor(outlineService, _instantiationService, _configurationService) {
            this._instantiationService = _instantiationService;
            this._configurationService = _configurationService;
            const reg = outlineService.registerOutlineCreator(this);
            this.dispose = () => reg.dispose();
        }
        matches(candidate) {
            return candidate.getId() === notebookEditor_1.NotebookEditor.ID;
        }
        async createOutline(editor, target, cancelToken) {
            const outline = this._instantiationService.createInstance(NotebookCellOutline, editor, target);
            const showAllSymbols = this._configurationService.getValue(notebookCommon_1.NotebookSetting.gotoSymbolsAllSymbols);
            if (target === 4 /* OutlineTarget.QuickPick */ && showAllSymbols) {
                await outline.setFullSymbols(cancelToken);
            }
            return outline;
        }
    };
    exports.NotebookOutlineCreator = NotebookOutlineCreator;
    exports.NotebookOutlineCreator = NotebookOutlineCreator = __decorate([
        __param(0, outline_1.IOutlineService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, configuration_1.IConfigurationService)
    ], NotebookOutlineCreator);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(NotebookOutlineCreator, 4 /* LifecyclePhase.Eventually */);
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        id: 'notebook',
        order: 100,
        type: 'object',
        'properties': {
            'notebook.outline.showCodeCells': {
                type: 'boolean',
                default: false,
                markdownDescription: (0, nls_1.localize)('outline.showCodeCells', "When enabled notebook outline shows code cells.")
            },
            'notebook.breadcrumbs.showCodeCells': {
                type: 'boolean',
                default: true,
                markdownDescription: (0, nls_1.localize)('breadcrumbs.showCodeCells', "When enabled notebook breadcrumbs contain code cells.")
            },
            [notebookCommon_1.NotebookSetting.gotoSymbolsAllSymbols]: {
                type: 'boolean',
                default: false,
                markdownDescription: (0, nls_1.localize)('notebook.gotoSymbols.showAllSymbols', "When enabled goto symbol quickpick will display full code symbols from the notebook, as well as markdown headers.")
            },
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tPdXRsaW5lLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci9jb250cmliL291dGxpbmUvbm90ZWJvb2tPdXRsaW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFtQ2hHLE1BQU0sdUJBQXVCO2lCQUVaLGVBQVUsR0FBRyx5QkFBeUIsQ0FBQztRQUV2RCxZQUNVLFNBQXNCLEVBQ3RCLFNBQXNCLEVBQ3RCLFNBQW9CLEVBQ3BCLFVBQXVCO1lBSHZCLGNBQVMsR0FBVCxTQUFTLENBQWE7WUFDdEIsY0FBUyxHQUFULFNBQVMsQ0FBYTtZQUN0QixjQUFTLEdBQVQsU0FBUyxDQUFXO1lBQ3BCLGVBQVUsR0FBVixVQUFVLENBQWE7UUFDN0IsQ0FBQzs7SUFHTixJQUFNLHVCQUF1QixHQUE3QixNQUFNLHVCQUF1QjtRQUk1QixZQUNnQixhQUE2QyxFQUNyQyxxQkFBNkQ7WUFEcEQsa0JBQWEsR0FBYixhQUFhLENBQWU7WUFDcEIsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQUpyRixlQUFVLEdBQVcsdUJBQXVCLENBQUMsVUFBVSxDQUFDO1FBS3BELENBQUM7UUFFTCxjQUFjLENBQUMsU0FBc0I7WUFDcEMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsMEJBQTBCLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztZQUN2RSxNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2hELFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDNUIsTUFBTSxTQUFTLEdBQUcsSUFBSSxxQkFBUyxDQUFDLFNBQVMsRUFBRSxFQUFFLGlCQUFpQixFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7WUFDeEUsTUFBTSxVQUFVLEdB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