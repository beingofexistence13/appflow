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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/network", "vs/base/common/path", "vs/base/browser/ui/countBadge/countBadge", "vs/base/browser/ui/highlightedlabel/highlightedLabel", "vs/platform/markers/common/markers", "vs/workbench/contrib/markers/browser/markersModel", "vs/workbench/contrib/markers/browser/messages", "vs/platform/instantiation/common/instantiation", "vs/base/common/themables", "vs/base/common/lifecycle", "vs/base/browser/ui/actionbar/actionbar", "vs/workbench/contrib/markers/browser/markersViewActions", "vs/platform/label/common/label", "vs/base/common/resources", "vs/workbench/contrib/markers/browser/markersFilterOptions", "vs/base/common/event", "vs/base/common/types", "vs/base/common/actions", "vs/nls", "vs/base/common/async", "vs/editor/common/services/model", "vs/editor/common/core/range", "vs/editor/contrib/codeAction/browser/codeAction", "vs/editor/contrib/codeAction/common/types", "vs/workbench/services/editor/common/editorService", "vs/platform/severityIcon/browser/severityIcon", "vs/platform/opener/common/opener", "vs/platform/files/common/files", "vs/platform/progress/common/progress", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/platform/opener/browser/link", "vs/editor/common/services/languageFeatures", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/markers/common/markers", "vs/platform/markers/common/markerService", "vs/platform/theme/browser/defaultStyles", "vs/base/common/severity"], function (require, exports, dom, network, paths, countBadge_1, highlightedLabel_1, markers_1, markersModel_1, messages_1, instantiation_1, themables_1, lifecycle_1, actionbar_1, markersViewActions_1, label_1, resources_1, markersFilterOptions_1, event_1, types_1, actions_1, nls_1, async_1, model_1, range_1, codeAction_1, types_2, editorService_1, severityIcon_1, opener_1, files_1, progress_1, actionViewItems_1, codicons_1, iconRegistry_1, link_1, languageFeatures_1, contextkey_1, markers_2, markerService_1, defaultStyles_1, severity_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MarkersViewModel = exports.MarkerViewModel = exports.Filter = exports.RelatedInformationRenderer = exports.MarkerRenderer = exports.FileResourceMarkersRenderer = exports.ResourceMarkersRenderer = exports.VirtualDelegate = exports.MarkersWidgetAccessibilityProvider = void 0;
    let MarkersWidgetAccessibilityProvider = class MarkersWidgetAccessibilityProvider {
        constructor(labelService) {
            this.labelService = labelService;
        }
        getWidgetAriaLabel() {
            return (0, nls_1.localize)('problemsView', "Problems View");
        }
        getAriaLabel(element) {
            if (element instanceof markersModel_1.ResourceMarkers) {
                const path = this.labelService.getUriLabel(element.resource, { relative: true }) || element.resource.fsPath;
                return messages_1.default.MARKERS_TREE_ARIA_LABEL_RESOURCE(element.markers.length, element.name, paths.dirname(path));
            }
            if (element instanceof markersModel_1.Marker || element instanceof markersModel_1.MarkerTableItem) {
                return messages_1.default.MARKERS_TREE_ARIA_LABEL_MARKER(element);
            }
            if (element instanceof markersModel_1.RelatedInformation) {
                return messages_1.default.MARKERS_TREE_ARIA_LABEL_RELATED_INFORMATION(element.raw);
            }
            return null;
        }
    };
    exports.MarkersWidgetAccessibilityProvider = MarkersWidgetAccessibilityProvider;
    exports.MarkersWidgetAccessibilityProvider = MarkersWidgetAccessibilityProvider = __decorate([
        __param(0, label_1.ILabelService)
    ], MarkersWidgetAccessibilityProvider);
    var TemplateId;
    (function (TemplateId) {
        TemplateId["ResourceMarkers"] = "rm";
        TemplateId["Marker"] = "m";
        TemplateId["RelatedInformation"] = "ri";
    })(TemplateId || (TemplateId = {}));
    class VirtualDelegate {
        static { this.LINE_HEIGHT = 22; }
        constructor(markersViewState) {
            this.markersViewState = markersViewState;
        }
        getHeight(element) {
            if (element instanceof markersModel_1.Marker) {
                const viewModel = this.markersViewState.getViewModel(element);
                const noOfLines = !viewModel || viewModel.multiline ? element.lines.length : 1;
                return noOfLines * VirtualDelegate.LINE_HEIGHT;
            }
            return VirtualDelegate.LINE_HEIGHT;
        }
        getTemplateId(element) {
            if (element instanceof markersModel_1.ResourceMarkers) {
                return "rm" /* TemplateId.ResourceMarkers */;
            }
            else if (element instanceof markersModel_1.Marker) {
                return "m" /* TemplateId.Marker */;
            }
            else {
                return "ri" /* TemplateId.RelatedInformation */;
            }
        }
    }
    exports.VirtualDelegate = VirtualDelegate;
    var FilterDataType;
    (function (FilterDataType) {
        FilterDataType[FilterDataType["ResourceMarkers"] = 0] = "ResourceMarkers";
        FilterDataType[FilterDataType["Marker"] = 1] = "Marker";
        FilterDataType[FilterDataType["RelatedInformation"] = 2] = "RelatedInformation";
    })(FilterDataType || (FilterDataType = {}));
    let ResourceMarkersRenderer = class ResourceMarkersRenderer {
        constructor(labels, onDidChangeRenderNodeCount, labelService, fileService) {
            this.labels = labels;
            this.labelService = labelService;
            this.fileService = fileService;
            this.renderedNodes = new Map();
            this.disposables = new lifecycle_1.DisposableStore();
            this.templateId = "rm" /* TemplateId.ResourceMarkers */;
            onDidChangeRenderNodeCount(this.onDidChangeRenderNodeCount, this, this.disposables);
        }
        renderTemplate(container) {
            const resourceLabelContainer = dom.append(container, dom.$('.resource-label-container'));
            const resourceLabel = this.labels.create(resourceLabelContainer, { supportHighlights: true });
            const badgeWrapper = dom.append(container, dom.$('.count-badge-wrapper'));
            const count = new countBadge_1.CountBadge(badgeWrapper, {}, defaultStyles_1.defaultCountBadgeStyles);
            return { count, resourceLabel };
        }
        renderElement(node, _, templateData) {
            const resourceMarkers = node.element;
            const uriMatches = node.filterData && node.filterData.uriMatches || [];
            if (this.fileService.hasProvider(resourceMarkers.resource) || resourceMarkers.resource.scheme === network.Schemas.untitled) {
                templateData.resourceLabel.setFile(resourceMarkers.resource, { matches: uriMatches });
            }
            else {
                templateData.resourceLabel.setResource({ name: resourceMarkers.name, description: this.labelService.getUriLabel((0, resources_1.dirname)(resourceMarkers.resource), { relative: true }), resource: resourceMarkers.resource }, { matches: uriMatches });
            }
            this.updateCount(node, templateData);
            this.renderedNodes.set(node, templateData);
        }
        disposeElement(node) {
            this.renderedNodes.delete(node);
        }
        disposeTemplate(templateData) {
            templateData.resourceLabel.dispose();
        }
        onDidChangeRenderNodeCount(node) {
            const templateData = this.renderedNodes.get(node);
            if (!templateData) {
                return;
            }
            this.updateCount(node, templateData);
        }
        updateCount(node, templateData) {
            templateData.count.setCount(node.children.reduce((r, n) => r + (n.visible ? 1 : 0), 0));
        }
        dispose() {
            this.disposables.dispose();
        }
    };
    exports.ResourceMarkersRenderer = ResourceMarkersRenderer;
    exports.ResourceMarkersRenderer = ResourceMarkersRenderer = __decorate([
        __param(2, label_1.ILabelService),
        __param(3, files_1.IFileService)
    ], ResourceMarkersRenderer);
    class FileResourceMarkersRenderer extends ResourceMarkersRenderer {
    }
    exports.FileResourceMarkersRenderer = FileResourceMarkersRenderer;
    let MarkerRenderer = class MarkerRenderer {
        constructor(markersViewState, instantiationService, openerService) {
            this.markersViewState = markersViewState;
            this.instantiationService = instantiationService;
            this.openerService = openerService;
            this.templateId = "m" /* TemplateId.Marker */;
        }
        renderTemplate(container) {
            const data = Object.create(null);
            data.markerWidget = new MarkerWidget(container, this.markersViewState, this.openerService, this.instantiationService);
            return data;
        }
        renderElement(node, _, templateData) {
            templateData.markerWidget.render(node.element, node.filterData);
        }
        disposeTemplate(templateData) {
            templateData.markerWidget.dispose();
        }
    };
    exports.MarkerRenderer = MarkerRenderer;
    exports.MarkerRenderer = MarkerRenderer = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, opener_1.IOpenerService)
    ], MarkerRenderer);
    const expandedIcon = (0, iconRegistry_1.registerIcon)('markers-view-multi-line-expanded', codicons_1.Codicon.chevronUp, (0, nls_1.localize)('expandedIcon', 'Icon indicating that multiple lines are shown in the markers view.'));
    const collapsedIcon = (0, iconRegistry_1.registerIcon)('markers-view-multi-line-collapsed', codicons_1.Codicon.chevronDown, (0, nls_1.localize)('collapsedIcon', 'Icon indicating that multiple lines are collapsed in the markers view.'));
    const toggleMultilineAction = 'problems.action.toggleMultiline';
    class ToggleMultilineActionViewItem extends actionViewItems_1.ActionViewItem {
        render(container) {
            super.render(container);
            this.updateExpandedAttribute();
        }
        updateClass() {
            super.updateClass();
            this.updateExpandedAttribute();
        }
        updateExpandedAttribute() {
            this.element?.setAttribute('aria-expanded', `${this._action.class === themables_1.ThemeIcon.asClassName(expandedIcon)}`);
        }
    }
    class MarkerWidget extends lifecycle_1.Disposable {
        constructor(parent, markersViewModel, _openerService, _instantiationService) {
            super();
            this.parent = parent;
            this.markersViewModel = markersViewModel;
            this._openerService = _openerService;
            this.disposables = this._register(new lifecycle_1.DisposableStore());
            this.actionBar = this._register(new actionbar_1.ActionBar(dom.append(parent, dom.$('.actions')), {
                actionViewItemProvider: (action) => action.id === markersViewActions_1.QuickFixAction.ID ? _instantiationService.createInstance(markersViewActions_1.QuickFixActionViewItem, action) : undefined
            }));
            // wrap the icon in a container that get the icon color as foreground color. That way, if the
            // list view does not have a specific color for the icon (=the color variable is invalid) it
            // falls back to the foreground color of container (inherit)
            this.iconContainer = dom.append(parent, dom.$(''));
            this.icon = dom.append(this.iconContainer, dom.$(''));
            this.messageAndDetailsContainer = dom.append(parent, dom.$('.marker-message-details-container'));
        }
        render(element, filterData) {
            this.actionBar.clear();
            this.disposables.clear();
            dom.clearNode(this.messageAndDetailsContainer);
            this.iconContainer.className = `marker-icon ${severity_1.default.toString(markers_1.MarkerSeverity.toSeverity(element.marker.severity))}`;
            this.icon.className = `codicon ${severityIcon_1.SeverityIcon.className(markers_1.MarkerSeverity.toSeverity(element.marker.severity))}`;
            this.renderQuickfixActionbar(element);
            this.renderMessageAndDetails(element, filterData);
            this.disposables.add(dom.addDisposableListener(this.parent, dom.EventType.MOUSE_OVER, () => this.markersViewModel.onMarkerMouseHover(element)));
            this.disposables.add(dom.addDisposableListener(this.parent, dom.EventType.MOUSE_LEAVE, () => this.markersViewModel.onMarkerMouseLeave(element)));
        }
        renderQuickfixActionbar(marker) {
            const viewModel = this.markersViewModel.getViewModel(marker);
            if (viewModel) {
                const quickFixAction = viewModel.quickFixAction;
                this.actionBar.push([quickFixAction], { icon: true, label: false });
                this.iconContainer.classList.toggle('quickFix', quickFixAction.enabled);
                quickFixAction.onDidChange(({ enabled }) => {
                    if (!(0, types_1.isUndefinedOrNull)(enabled)) {
                        this.iconContainer.classList.toggle('quickFix', enabled);
                    }
                }, this, this.disposables);
                quickFixAction.onShowQuickFixes(() => {
                    const quickFixActionViewItem = this.actionBar.viewItems[0];
                    if (quickFixActionViewItem) {
                        quickFixActionViewItem.showQuickFixes();
                    }
                }, this, this.disposables);
            }
        }
        renderMultilineActionbar(marker, parent) {
            const multilineActionbar = this.disposables.add(new actionbar_1.ActionBar(dom.append(parent, dom.$('.multiline-actions')), {
                actionViewItemProvider: (action) => {
                    if (action.id === toggleMultilineAction) {
                        return new ToggleMultilineActionViewItem(undefined, action, { icon: true });
                    }
                    return undefined;
                }
            }));
            this.disposables.add((0, lifecycle_1.toDisposable)(() => multilineActionbar.dispose()));
            const viewModel = this.markersViewModel.getViewModel(marker);
            const multiline = viewModel && viewModel.multiline;
            const action = new actions_1.Action(toggleMultilineAction);
            action.enabled = !!viewModel && marker.lines.length > 1;
            action.tooltip = multiline ? (0, nls_1.localize)('single line', "Show message in single line") : (0, nls_1.localize)('multi line', "Show message in multiple lines");
            action.class = themables_1.ThemeIcon.asClassName(multiline ? expandedIcon : collapsedIcon);
            action.run = () => { if (viewModel) {
                viewModel.multiline = !viewModel.multiline;
            } return Promise.resolve(); };
            multilineActionbar.push([action], { icon: true, label: false });
        }
        renderMessageAndDetails(element, filterData) {
            const { marker, lines } = element;
            const viewState = this.markersViewModel.getViewModel(element);
            const multiline = !viewState || viewState.multiline;
            const lineMatches = filterData && filterData.lineMatches || [];
            this.messageAndDetailsContainer.title = element.marker.message;
            const lineElements = [];
            for (let index = 0; index < (multiline ? lines.length : 1); index++) {
                const lineElement = dom.append(this.messageAndDetailsContainer, dom.$('.marker-message-line'));
                const messageElement = dom.append(lineElement, dom.$('.marker-message'));
                const highlightedLabel = new highlightedLabel_1.HighlightedLabel(messageElement);
                highlightedLabel.set(lines[index].length > 1000 ? `${lines[index].substring(0, 1000)}...` : lines[index], lineMatches[index]);
                if (lines[index] === '') {
                    lineElement.style.height = `${VirtualDelegate.LINE_HEIGHT}px`;
                }
                lineElements.push(lineElement);
            }
            this.renderDetails(marker, filterData, lineElements[0]);
            this.renderMultilineActionbar(element, lineElements[0]);
        }
        renderDetails(marker, filterData, parent) {
            parent.classList.add('details-container');
            if (marker.source || marker.code) {
                const source = new highlightedLabel_1.HighlightedLabel(dom.append(parent, dom.$('.marker-source')));
                const sourceMatches = filterData && filterData.sourceMatches || [];
                source.set(marker.source, sourceMatches);
                if (marker.code) {
                    if (typeof marker.code === 'string') {
                        const code = new highlightedLabel_1.HighlightedLabel(dom.append(parent, dom.$('.marker-code')));
                        const codeMatches = filterData && filterData.codeMatches || [];
                        code.set(marker.code, codeMatches);
                    }
                    else {
                        const container = dom.$('.marker-code');
                        const code = new highlightedLabel_1.HighlightedLabel(container);
                        const link = marker.code.target.toString(true);
                        this.disposables.add(new link_1.Link(parent, { href: link, label: container, title: link }, undefined, this._openerService));
                        const codeMatches = filterData && filterData.codeMatches || [];
                        code.set(marker.code.value, codeMatches);
                    }
                }
            }
            const lnCol = dom.append(parent, dom.$('span.marker-line'));
            lnCol.textContent = messages_1.default.MARKERS_PANEL_AT_LINE_COL_NUMBER(marker.startLineNumber, marker.startColumn);
        }
    }
    let RelatedInformationRenderer = class RelatedInformationRenderer {
        constructor(labelService) {
            this.labelService = labelService;
            this.templateId = "ri" /* TemplateId.RelatedInformation */;
        }
        renderTemplate(container) {
            const data = Object.create(null);
            dom.append(container, dom.$('.actions'));
            dom.append(container, dom.$('.icon'));
            data.resourceLabel = new highlightedLabel_1.HighlightedLabel(dom.append(container, dom.$('.related-info-resource')));
            data.lnCol = dom.append(container, dom.$('span.marker-line'));
            const separator = dom.append(container, dom.$('span.related-info-resource-separator'));
            separator.textContent = ':';
            separator.style.paddingRight = '4px';
            data.description = new highlightedLabel_1.HighlightedLabel(dom.append(container, dom.$('.marker-description')));
            return data;
        }
        renderElement(node, _, templateData) {
            const relatedInformation = node.element.raw;
            const uriMatches = node.filterData && node.filterData.uriMatches || [];
            const messageMatches = node.filterData && node.filterData.messageMatches || [];
            templateData.resourceLabel.set((0, resources_1.basename)(relatedInformation.resource), uriMatches);
            templateData.resourceLabel.element.title = this.labelService.getUriLabel(relatedInformation.resource, { relative: true });
            templateData.lnCol.textContent = messages_1.default.MARKERS_PANEL_AT_LINE_COL_NUMBER(relatedInformation.startLineNumber, relatedInformation.startColumn);
            templateData.description.set(relatedInformation.message, messageMatches);
            templateData.description.element.title = relatedInformation.message;
        }
        disposeTemplate(templateData) {
            // noop
        }
    };
    exports.RelatedInformationRenderer = RelatedInformationRenderer;
    exports.RelatedInformationRenderer = RelatedInformationRenderer = __decorate([
        __param(0, label_1.ILabelService)
    ], RelatedInformationRenderer);
    class Filter {
        constructor(options) {
            this.options = options;
        }
        filter(element, parentVisibility) {
            if (element instanceof markersModel_1.ResourceMarkers) {
                return this.filterResourceMarkers(element);
            }
            else if (element instanceof markersModel_1.Marker) {
                return this.filterMarker(element, parentVisibility);
            }
            else {
                return this.filterRelatedInformation(element, parentVisibility);
            }
        }
        filterResourceMarkers(resourceMarkers) {
            if (markerService_1.unsupportedSchemas.has(resourceMarkers.resource.scheme)) {
                return false;
            }
            // Filter resource by pattern first (globs)
            // Excludes pattern
            if (this.options.excludesMatcher.matches(resourceMarkers.resource)) {
                return false;
            }
            // Includes pattern
            if (this.options.includesMatcher.matches(resourceMarkers.resource)) {
                return true;
            }
            // Fiter by text. Do not apply negated filters on resources instead use exclude patterns
            if (this.options.textFilter.text && !this.options.textFilter.negate) {
                const uriMatches = markersFilterOptions_1.FilterOptions._filter(this.options.textFilter.text, (0, resources_1.basename)(resourceMarkers.resource));
                if (uriMatches) {
                    return { visibility: true, data: { type: 0 /* FilterDataType.ResourceMarkers */, uriMatches: uriMatches || [] } };
                }
            }
            return 2 /* TreeVisibility.Recurse */;
        }
        filterMarker(marker, parentVisibility) {
            const matchesSeverity = this.options.showErrors && markers_1.MarkerSeverity.Error === marker.marker.severity ||
                this.options.showWarnings && markers_1.MarkerSeverity.Warning === marker.marker.severity ||
                this.options.showInfos && markers_1.MarkerSeverity.Info === marker.marker.severity;
            if (!matchesSeverity) {
                return false;
            }
            if (!this.options.textFilter.text) {
                return true;
            }
            const lineMatches = [];
            for (const line of marker.lines) {
                const lineMatch = markersFilterOptions_1.FilterOptions._messageFilter(this.options.textFilter.text, line);
                lineMatches.push(lineMatch || []);
            }
            const sourceMatches = marker.marker.source ? markersFilterOptions_1.FilterOptions._filter(this.options.textFilter.text, marker.marker.source) : undefined;
            const codeMatches = marker.marker.code ? markersFilterOptions_1.FilterOptions._filter(this.options.textFilter.text, typeof marker.marker.code === 'string' ? marker.marker.code : marker.marker.code.value) : undefined;
            const matched = sourceMatches || codeMatches || lineMatches.some(lineMatch => lineMatch.length > 0);
            // Matched and not negated
            if (matched && !this.options.textFilter.negate) {
                return { visibility: true, data: { type: 1 /* FilterDataType.Marker */, lineMatches, sourceMatches: sourceMatches || [], codeMatches: codeMatches || [] } };
            }
            // Matched and negated - exclude it only if parent visibility is not set
            if (matched && this.options.textFilter.negate && parentVisibility === 2 /* TreeVisibility.Recurse */) {
                return false;
            }
            // Not matched and negated - include it only if parent visibility is not set
            if (!matched && this.options.textFilter.negate && parentVisibility === 2 /* TreeVisibility.Recurse */) {
                return true;
            }
            return parentVisibility;
        }
        filterRelatedInformation(relatedInformation, parentVisibility) {
            if (!this.options.textFilter.text) {
                return true;
            }
            const uriMatches = markersFilterOptions_1.FilterOptions._filter(this.options.textFilter.text, (0, resources_1.basename)(relatedInformation.raw.resource));
            const messageMatches = markersFilterOptions_1.FilterOptions._messageFilter(this.options.textFilter.text, paths.basename(relatedInformation.raw.message));
            const matched = uriMatches || messageMatches;
            // Matched and not negated
            if (matched && !this.options.textFilter.negate) {
                return { visibility: true, data: { type: 2 /* FilterDataType.RelatedInformation */, uriMatches: uriMatches || [], messageMatches: messageMatches || [] } };
            }
            // Matched and negated - exclude it only if parent visibility is not set
            if (matched && this.options.textFilter.negate && parentVisibility === 2 /* TreeVisibility.Recurse */) {
                return false;
            }
            // Not matched and negated - include it only if parent visibility is not set
            if (!matched && this.options.textFilter.negate && parentVisibility === 2 /* TreeVisibility.Recurse */) {
                return true;
            }
            return parentVisibility;
        }
    }
    exports.Filter = Filter;
    let MarkerViewModel = class MarkerViewModel extends lifecycle_1.Disposable {
        constructor(marker, modelService, instantiationService, editorService, languageFeaturesService) {
            super();
            this.marker = marker;
            this.modelService = modelService;
            this.instantiationService = instantiationService;
            this.editorService = editorService;
            this.languageFeaturesService = languageFeaturesService;
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this.modelPromise = null;
            this.codeActionsPromise = null;
            this._multiline = true;
            this._quickFixAction = null;
            this._register((0, lifecycle_1.toDisposable)(() => {
                if (this.modelPromise) {
                    this.modelPromise.cancel();
                }
                if (this.codeActionsPromise) {
                    this.codeActionsPromise.cancel();
                }
            }));
        }
        get multiline() {
            return this._multiline;
        }
        set multiline(value) {
            if (this._multiline !== value) {
                this._multiline = value;
                this._onDidChange.fire();
            }
        }
        get quickFixAction() {
            if (!this._quickFixAction) {
                this._quickFixAction = this._register(this.instantiationService.createInstance(markersViewActions_1.QuickFixAction, this.marker));
            }
            return this._quickFixAction;
        }
        showLightBulb() {
            this.setQuickFixes(true);
        }
        async setQuickFixes(waitForModel) {
            const codeActions = await this.getCodeActions(waitForModel);
            this.quickFixAction.quickFixes = codeActions ? this.toActions(codeActions) : [];
            this.quickFixAction.autoFixable(!!codeActions && codeActions.hasAutoFix);
        }
        getCodeActions(waitForModel) {
            if (this.codeActionsPromise !== null) {
                return this.codeActionsPromise;
            }
            return this.getModel(waitForModel)
                .then(model => {
                if (model) {
                    if (!this.codeActionsPromise) {
                        this.codeActionsPromise = (0, async_1.createCancelablePromise)(cancellationToken => {
                            return (0, codeAction_1.getCodeActions)(this.languageFeaturesService.codeActionProvider, model, new range_1.Range(this.marker.range.startLineNumber, this.marker.range.startColumn, this.marker.range.endLineNumber, this.marker.range.endColumn), {
                                type: 1 /* CodeActionTriggerType.Invoke */, triggerAction: types_2.CodeActionTriggerSource.ProblemsView, filter: { include: types_2.CodeActionKind.QuickFix }
                            }, progress_1.Progress.None, cancellationToken).then(actions => {
                                return this._register(actions);
                            });
                        });
                    }
                    return this.codeActionsPromise;
                }
                return null;
            });
        }
        toActions(codeActions) {
            return codeActions.validActions.map(item => new actions_1.Action(item.action.command ? item.action.command.id : item.action.title, item.action.title, undefined, true, () => {
                return this.openFileAtMarker(this.marker)
                    .then(() => this.instantiationService.invokeFunction(codeAction_1.applyCodeAction, item, codeAction_1.ApplyCodeActionReason.FromProblemsView));
            }));
        }
        openFileAtMarker(element) {
            const { resource, selection } = { resource: element.resource, selection: element.range };
            return this.editorService.openEditor({
                resource,
                options: {
                    selection,
                    preserveFocus: true,
                    pinned: false,
                    revealIfVisible: true
                },
            }, editorService_1.ACTIVE_GROUP).then(() => undefined);
        }
        getModel(waitForModel) {
            const model = this.modelService.getModel(this.marker.resource);
            if (model) {
                return Promise.resolve(model);
            }
            if (waitForModel) {
                if (!this.modelPromise) {
                    this.modelPromise = (0, async_1.createCancelablePromise)(cancellationToken => {
                        return new Promise((c) => {
                            this._register(this.modelService.onModelAdded(model => {
                                if ((0, resources_1.isEqual)(model.uri, this.marker.resource)) {
                                    c(model);
                                }
                            }));
                        });
                    });
                }
                return this.modelPromise;
            }
            return Promise.resolve(null);
        }
    };
    exports.MarkerViewModel = MarkerViewModel;
    exports.MarkerViewModel = MarkerViewModel = __decorate([
        __param(1, model_1.IModelService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, editorService_1.IEditorService),
        __param(4, languageFeatures_1.ILanguageFeaturesService)
    ], MarkerViewModel);
    let MarkersViewModel = class MarkersViewModel extends lifecycle_1.Disposable {
        constructor(multiline = true, viewMode = "tree" /* MarkersViewMode.Tree */, contextKeyService, instantiationService) {
            super();
            this.contextKeyService = contextKeyService;
            this.instantiationService = instantiationService;
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._onDidChangeViewMode = this._register(new event_1.Emitter());
            this.onDidChangeViewMode = this._onDidChangeViewMode.event;
            this.markersViewStates = new Map();
            this.markersPerResource = new Map();
            this.bulkUpdate = false;
            this.hoveredMarker = null;
            this.hoverDelayer = new async_1.Delayer(300);
            this._multiline = true;
            this._viewMode = "tree" /* MarkersViewMode.Tree */;
            this._multiline = multiline;
            this._viewMode = viewMode;
            this.viewModeContextKey = markers_2.MarkersContextKeys.MarkersViewModeContextKey.bindTo(this.contextKeyService);
            this.viewModeContextKey.set(viewMode);
        }
        add(marker) {
            if (!this.markersViewStates.has(marker.id)) {
                const viewModel = this.instantiationService.createInstance(MarkerViewModel, marker);
                const disposables = [viewModel];
                viewModel.multiline = this.multiline;
                viewModel.onDidChange(() => {
                    if (!this.bulkUpdate) {
                        this._onDidChange.fire(marker);
                    }
                }, this, disposables);
                this.markersViewStates.set(marker.id, { viewModel, disposables });
                const markers = this.markersPerResource.get(marker.resource.toString()) || [];
                markers.push(marker);
                this.markersPerResource.set(marker.resource.toString(), markers);
            }
        }
        remove(resource) {
            const markers = this.markersPerResource.get(resource.toString()) || [];
            for (const marker of markers) {
                const value = this.markersViewStates.get(marker.id);
                if (value) {
                    (0, lifecycle_1.dispose)(value.disposables);
                }
                this.markersViewStates.delete(marker.id);
                if (this.hoveredMarker === marker) {
                    this.hoveredMarker = null;
                }
            }
            this.markersPerResource.delete(resource.toString());
        }
        getViewModel(marker) {
            const value = this.markersViewStates.get(marker.id);
            return value ? value.viewModel : null;
        }
        onMarkerMouseHover(marker) {
            this.hoveredMarker = marker;
            this.hoverDelayer.trigger(() => {
                if (this.hoveredMarker) {
                    const model = this.getViewModel(this.hoveredMarker);
                    if (model) {
                        model.showLightBulb();
                    }
                }
            });
        }
        onMarkerMouseLeave(marker) {
            if (this.hoveredMarker === marker) {
                this.hoveredMarker = null;
            }
        }
        get multiline() {
            return this._multiline;
        }
        set multiline(value) {
            let changed = false;
            if (this._multiline !== value) {
                this._multiline = value;
                changed = true;
            }
            this.bulkUpdate = true;
            this.markersViewStates.forEach(({ viewModel }) => {
                if (viewModel.multiline !== value) {
                    viewModel.multiline = value;
                    changed = true;
                }
            });
            this.bulkUpdate = false;
            if (changed) {
                this._onDidChange.fire(undefined);
            }
        }
        get viewMode() {
            return this._viewMode;
        }
        set viewMode(value) {
            if (this._viewMode === value) {
                return;
            }
            this._viewMode = value;
            this._onDidChangeViewMode.fire(value);
            this.viewModeContextKey.set(value);
        }
        dispose() {
            this.markersViewStates.forEach(({ disposables }) => (0, lifecycle_1.dispose)(disposables));
            this.markersViewStates.clear();
            this.markersPerResource.clear();
            super.dispose();
        }
    };
    exports.MarkersViewModel = MarkersViewModel;
    exports.MarkersViewModel = MarkersViewModel = __decorate([
        __param(2, contextkey_1.IContextKeyService),
        __param(3, instantiation_1.IInstantiationService)
    ], MarkersViewModel);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Vyc1RyZWVWaWV3ZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9tYXJrZXJzL2Jyb3dzZXIvbWFya2Vyc1RyZWVWaWV3ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBa0V6RixJQUFNLGtDQUFrQyxHQUF4QyxNQUFNLGtDQUFrQztRQUU5QyxZQUE0QyxZQUEyQjtZQUEzQixpQkFBWSxHQUFaLFlBQVksQ0FBZTtRQUFJLENBQUM7UUFFNUUsa0JBQWtCO1lBQ2pCLE9BQU8sSUFBQSxjQUFRLEVBQUMsY0FBYyxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBQ2xELENBQUM7UUFFTSxZQUFZLENBQUMsT0FBd0M7WUFDM0QsSUFBSSxPQUFPLFlBQVksOEJBQWUsRUFBRTtnQkFDdkMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO2dCQUM1RyxPQUFPLGtCQUFRLENBQUMsZ0NBQWdDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7YUFDNUc7WUFDRCxJQUFJLE9BQU8sWUFBWSxxQkFBTSxJQUFJLE9BQU8sWUFBWSw4QkFBZSxFQUFFO2dCQUNwRSxPQUFPLGtCQUFRLENBQUMsOEJBQThCLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDeEQ7WUFDRCxJQUFJLE9BQU8sWUFBWSxpQ0FBa0IsRUFBRTtnQkFDMUMsT0FBTyxrQkFBUSxDQUFDLDJDQUEyQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQzth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