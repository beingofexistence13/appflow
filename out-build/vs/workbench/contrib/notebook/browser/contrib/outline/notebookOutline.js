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
define(["require", "exports", "vs/nls!vs/workbench/contrib/notebook/browser/contrib/outline/notebookOutline", "vs/base/browser/ui/iconLabel/iconLabel", "vs/base/common/async", "vs/base/common/event", "vs/base/common/filters", "vs/base/common/lifecycle", "vs/base/common/themables", "vs/editor/common/services/getIconClasses", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/instantiation/common/instantiation", "vs/platform/markers/common/markers", "vs/platform/registry/common/platform", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/common/contributions", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/notebookEditor", "vs/workbench/contrib/notebook/browser/viewModel/notebookOutlineProvider", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/outline/browser/outline"], function (require, exports, nls_1, iconLabel_1, async_1, event_1, filters_1, lifecycle_1, themables_1, getIconClasses_1, configuration_1, configurationRegistry_1, instantiation_1, markers_1, platform_1, colorRegistry_1, themeService_1, contributions_1, notebookBrowser_1, notebookEditor_1, notebookOutlineProvider_1, notebookCommon_1, editorService_1, outline_1) {
    "use strict";
    var $tFb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$uFb = exports.$tFb = void 0;
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
        constructor(c, d) {
            this.c = c;
            this.d = d;
            this.templateId = NotebookOutlineTemplate.templateId;
        }
        renderTemplate(container) {
            container.classList.add('notebook-outline-element', 'show-file-icons');
            const iconClass = document.createElement('div');
            container.append(iconClass);
            const iconLabel = new iconLabel_1.$KR(container, { supportHighlights: true });
            const decoration = document.createElement('div');
            decoration.className = 'element-decoration';
            container.append(decoration);
            return new NotebookOutlineTemplate(container, iconClass, iconLabel, decoration);
        }
        renderElement(node, _index, template, _height) {
            const extraClasses = [];
            const options = {
                matches: (0, filters_1.$Hj)(node.filterData),
                labelEscapeNewLines: true,
                extraClasses,
            };
            if (node.element.cell.cellKind === notebookCommon_1.CellKind.Code && this.c.getFileIconTheme().hasFileIcons && !node.element.isExecuting) {
                template.iconClass.className = '';
                extraClasses.push(...(0, getIconClasses_1.$y6)(node.element.cell.language ?? ''));
            }
            else {
                template.iconClass.className = 'element-icon ' + themables_1.ThemeIcon.asClassNameArray(node.element.icon).join(' ');
            }
            template.iconLabel.setLabel(node.element.label, undefined, options);
            const { markerInfo } = node.element;
            template.container.style.removeProperty('--outline-element-color');
            template.decoration.innerText = '';
            if (markerInfo) {
                const useBadges = this.d.getValue("outline.problems.badges" /* OutlineConfigKeys.problemsBadges */);
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
                const color = this.c.getColorTheme().getColor(markerInfo.topSev === markers_1.MarkerSeverity.Error ? colorRegistry_1.$Mx : colorRegistry_1.$Nx);
                const useColors = this.d.getValue("outline.problems.colors" /* OutlineConfigKeys.problemsColors */);
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
        __param(0, themeService_1.$gv),
        __param(1, configuration_1.$8h)
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
        constructor(c, d) {
            this.c = c;
            this.d = d;
        }
        getQuickPickElements() {
            const bucket = [];
            for (const entry of this.c()) {
                entry.asFlatList(bucket);
            }
            const result = [];
            const { hasFileIcons } = this.d.getFileIconTheme();
            for (const element of bucket) {
                const useFileIcon = hasFileIcons && !element.symbolKind;
                // todo@jrieken it is fishy that codicons cannot be used with iconClasses
                // but file icons can...
                result.push({
                    element,
                    label: useFileIcon ? element.label : `$(${element.icon.id}) ${element.label}`,
                    ariaLabel: element.label,
                    iconClasses: useFileIcon ? (0, getIconClasses_1.$y6)(element.cell.language ?? '') : undefined,
                });
            }
            return result;
        }
    };
    NotebookQuickPickProvider = __decorate([
        __param(1, themeService_1.$gv)
    ], NotebookQuickPickProvider);
    class NotebookComparator {
        constructor() {
            this.c = new async_1.$Xg(() => new Intl.Collator(undefined, { numeric: true }));
        }
        compareByPosition(a, b) {
            return a.index - b.index;
        }
        compareByType(a, b) {
            return a.cell.cellKind - b.cell.cellKind || this.c.value.compare(a.label, b.label);
        }
        compareByName(a, b) {
            return this.c.value.compare(a.label, b.label);
        }
    }
    let $tFb = $tFb_1 = class $tFb {
        get entries() {
            return this.g?.entries ?? [];
        }
        get activeElement() {
            return this.g?.activeElement;
        }
        constructor(i, _target, instantiationService, j, _configurationService) {
            this.i = i;
            this.j = j;
            this.c = new lifecycle_1.$jc();
            this.d = new event_1.$fd();
            this.onDidChange = this.d.event;
            this.f = new lifecycle_1.$jc();
            this.outlineKind = 'notebookCells';
            this.h = new lifecycle_1.$jc();
            const installSelectionListener = () => {
                const notebookEditor = i.getControl();
                if (!notebookEditor?.hasModel()) {
                    this.g?.dispose();
                    this.g = undefined;
                    this.h.clear();
                }
                else {
                    this.g?.dispose();
                    this.h.clear();
                    this.g = instantiationService.createInstance(notebookOutlineProvider_1.$wrb, notebookEditor, _target);
                    this.h.add(this.g.onDidChange(e => {
                        this.d.fire(e);
                    }));
                }
            };
            this.c.add(i.onDidChangeModel(() => {
                installSelectionListener();
            }));
            installSelectionListener();
            const treeDataSource = { getChildren: parent => parent instanceof $tFb_1 ? (this.g?.entries ?? []) : parent.children };
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
                quickPickDataSource: instantiationService.createInstance(NotebookQuickPickProvider, () => (this.g?.entries ?? [])),
                treeDataSource,
                delegate,
                renderers,
                comparator,
                options
            };
        }
        async setFullSymbols(cancelToken) {
            await this.g?.setFullSymbols(cancelToken);
        }
        get uri() {
            return this.g?.uri;
        }
        get isEmpty() {
            return this.g?.isEmpty ?? true;
        }
        async reveal(entry, options, sideBySide) {
            await this.j.openEditor({
                resource: entry.cell.uri,
                options: {
                    ...options,
                    override: this.i.input?.editorId,
                    cellRevealType: notebookBrowser_1.CellRevealType.NearTopIfOutsideViewport,
                    selection: entry.position
                },
            }, sideBySide ? editorService_1.$$C : undefined);
        }
        preview(entry) {
            const widget = this.i.getControl();
            if (!widget) {
                return lifecycle_1.$kc.None;
            }
            widget.revealInCenterIfOutsideViewport(entry.cell);
            const ids = widget.deltaCellDecorations([], [{
                    handle: entry.cell.handle,
                    options: { className: 'nb-symbolHighlight', outputClassName: 'nb-symbolHighlight' }
                }]);
            return (0, lifecycle_1.$ic)(() => { widget.deltaCellDecorations(ids, []); });
        }
        captureViewState() {
            const widget = this.i.getControl();
            const viewState = widget?.getEditorViewState();
            return (0, lifecycle_1.$ic)(() => {
                if (viewState) {
                    widget?.restoreListViewState(viewState);
                }
            });
        }
        dispose() {
            this.d.dispose();
            this.c.dispose();
            this.f.dispose();
            this.g?.dispose();
            this.h.dispose();
        }
    };
    exports.$tFb = $tFb;
    exports.$tFb = $tFb = $tFb_1 = __decorate([
        __param(2, instantiation_1.$Ah),
        __param(3, editorService_1.$9C),
        __param(4, configuration_1.$8h)
    ], $tFb);
    let $uFb = class $uFb {
        constructor(outlineService, c, d) {
            this.c = c;
            this.d = d;
            const reg = outlineService.registerOutlineCreator(this);
            this.dispose = () => reg.dispose();
        }
        matches(candidate) {
            return candidate.getId() === notebookEditor_1.$lEb.ID;
        }
        async createOutline(editor, target, cancelToken) {
            const outline = this.c.createInstance($tFb, editor, target);
            const showAllSymbols = this.d.getValue(notebookCommon_1.$7H.gotoSymbolsAllSymbols);
            if (target === 4 /* OutlineTarget.QuickPick */ && showAllSymbols) {
                await outline.setFullSymbols(cancelToken);
            }
            return outline;
        }
    };
    exports.$uFb = $uFb;
    exports.$uFb = $uFb = __decorate([
        __param(0, outline_1.$trb),
        __param(1, instantiation_1.$Ah),
        __param(2, configuration_1.$8h)
    ], $uFb);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution($uFb, 4 /* LifecyclePhase.Eventually */);
    platform_1.$8m.as(configurationRegistry_1.$an.Configuration).registerConfiguration({
        id: 'notebook',
        order: 100,
        type: 'object',
        'properties': {
            'notebook.outline.showCodeCells': {
                type: 'boolean',
                default: false,
                markdownDescription: (0, nls_1.localize)(0, null)
            },
            'notebook.breadcrumbs.showCodeCells': {
                type: 'boolean',
                default: true,
                markdownDescription: (0, nls_1.localize)(1, null)
            },
            [notebookCommon_1.$7H.gotoSymbolsAllSymbols]: {
                type: 'boolean',
                default: false,
                markdownDescription: (0, nls_1.localize)(2, null)
            },
        }
    });
});
//# sourceMappingURL=notebookOutline.js.map