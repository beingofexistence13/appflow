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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/network", "vs/base/common/path", "vs/base/browser/ui/countBadge/countBadge", "vs/base/browser/ui/highlightedlabel/highlightedLabel", "vs/platform/markers/common/markers", "vs/workbench/contrib/markers/browser/markersModel", "vs/workbench/contrib/markers/browser/messages", "vs/platform/instantiation/common/instantiation", "vs/base/common/themables", "vs/base/common/lifecycle", "vs/base/browser/ui/actionbar/actionbar", "vs/workbench/contrib/markers/browser/markersViewActions", "vs/platform/label/common/label", "vs/base/common/resources", "vs/workbench/contrib/markers/browser/markersFilterOptions", "vs/base/common/event", "vs/base/common/types", "vs/base/common/actions", "vs/nls!vs/workbench/contrib/markers/browser/markersTreeViewer", "vs/base/common/async", "vs/editor/common/services/model", "vs/editor/common/core/range", "vs/editor/contrib/codeAction/browser/codeAction", "vs/editor/contrib/codeAction/common/types", "vs/workbench/services/editor/common/editorService", "vs/platform/severityIcon/browser/severityIcon", "vs/platform/opener/common/opener", "vs/platform/files/common/files", "vs/platform/progress/common/progress", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/platform/opener/browser/link", "vs/editor/common/services/languageFeatures", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/markers/common/markers", "vs/platform/markers/common/markerService", "vs/platform/theme/browser/defaultStyles", "vs/base/common/severity"], function (require, exports, dom, network, paths, countBadge_1, highlightedLabel_1, markers_1, markersModel_1, messages_1, instantiation_1, themables_1, lifecycle_1, actionbar_1, markersViewActions_1, label_1, resources_1, markersFilterOptions_1, event_1, types_1, actions_1, nls_1, async_1, model_1, range_1, codeAction_1, types_2, editorService_1, severityIcon_1, opener_1, files_1, progress_1, actionViewItems_1, codicons_1, iconRegistry_1, link_1, languageFeatures_1, contextkey_1, markers_2, markerService_1, defaultStyles_1, severity_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$NSb = exports.$MSb = exports.$LSb = exports.$KSb = exports.$JSb = exports.$ISb = exports.$HSb = exports.$GSb = exports.$FSb = void 0;
    let $FSb = class $FSb {
        constructor(a) {
            this.a = a;
        }
        getWidgetAriaLabel() {
            return (0, nls_1.localize)(0, null);
        }
        getAriaLabel(element) {
            if (element instanceof markersModel_1.$uSb) {
                const path = this.a.getUriLabel(element.resource, { relative: true }) || element.resource.fsPath;
                return messages_1.default.MARKERS_TREE_ARIA_LABEL_RESOURCE(element.markers.length, element.name, paths.$_d(path));
            }
            if (element instanceof markersModel_1.$vSb || element instanceof markersModel_1.$wSb) {
                return messages_1.default.MARKERS_TREE_ARIA_LABEL_MARKER(element);
            }
            if (element instanceof markersModel_1.$xSb) {
                return messages_1.default.MARKERS_TREE_ARIA_LABEL_RELATED_INFORMATION(element.raw);
            }
            return null;
        }
    };
    exports.$FSb = $FSb;
    exports.$FSb = $FSb = __decorate([
        __param(0, label_1.$Vz)
    ], $FSb);
    var TemplateId;
    (function (TemplateId) {
        TemplateId["ResourceMarkers"] = "rm";
        TemplateId["Marker"] = "m";
        TemplateId["RelatedInformation"] = "ri";
    })(TemplateId || (TemplateId = {}));
    class $GSb {
        static { this.LINE_HEIGHT = 22; }
        constructor(a) {
            this.a = a;
        }
        getHeight(element) {
            if (element instanceof markersModel_1.$vSb) {
                const viewModel = this.a.getViewModel(element);
                const noOfLines = !viewModel || viewModel.multiline ? element.lines.length : 1;
                return noOfLines * $GSb.LINE_HEIGHT;
            }
            return $GSb.LINE_HEIGHT;
        }
        getTemplateId(element) {
            if (element instanceof markersModel_1.$uSb) {
                return "rm" /* TemplateId.ResourceMarkers */;
            }
            else if (element instanceof markersModel_1.$vSb) {
                return "m" /* TemplateId.Marker */;
            }
            else {
                return "ri" /* TemplateId.RelatedInformation */;
            }
        }
    }
    exports.$GSb = $GSb;
    var FilterDataType;
    (function (FilterDataType) {
        FilterDataType[FilterDataType["ResourceMarkers"] = 0] = "ResourceMarkers";
        FilterDataType[FilterDataType["Marker"] = 1] = "Marker";
        FilterDataType[FilterDataType["RelatedInformation"] = 2] = "RelatedInformation";
    })(FilterDataType || (FilterDataType = {}));
    let $HSb = class $HSb {
        constructor(d, onDidChangeRenderNodeCount, e, f) {
            this.d = d;
            this.e = e;
            this.f = f;
            this.a = new Map();
            this.b = new lifecycle_1.$jc();
            this.templateId = "rm" /* TemplateId.ResourceMarkers */;
            onDidChangeRenderNodeCount(this.g, this, this.b);
        }
        renderTemplate(container) {
            const resourceLabelContainer = dom.$0O(container, dom.$('.resource-label-container'));
            const resourceLabel = this.d.create(resourceLabelContainer, { supportHighlights: true });
            const badgeWrapper = dom.$0O(container, dom.$('.count-badge-wrapper'));
            const count = new countBadge_1.$nR(badgeWrapper, {}, defaultStyles_1.$v2);
            return { count, resourceLabel };
        }
        renderElement(node, _, templateData) {
            const resourceMarkers = node.element;
            const uriMatches = node.filterData && node.filterData.uriMatches || [];
            if (this.f.hasProvider(resourceMarkers.resource) || resourceMarkers.resource.scheme === network.Schemas.untitled) {
                templateData.resourceLabel.setFile(resourceMarkers.resource, { matches: uriMatches });
            }
            else {
                templateData.resourceLabel.setResource({ name: resourceMarkers.name, description: this.e.getUriLabel((0, resources_1.$hg)(resourceMarkers.resource), { relative: true }), resource: resourceMarkers.resource }, { matches: uriMatches });
            }
            this.h(node, templateData);
            this.a.set(node, templateData);
        }
        disposeElement(node) {
            this.a.delete(node);
        }
        disposeTemplate(templateData) {
            templateData.resourceLabel.dispose();
        }
        g(node) {
            const templateData = this.a.get(node);
            if (!templateData) {
                return;
            }
            this.h(node, templateData);
        }
        h(node, templateData) {
            templateData.count.setCount(node.children.reduce((r, n) => r + (n.visible ? 1 : 0), 0));
        }
        dispose() {
            this.b.dispose();
        }
    };
    exports.$HSb = $HSb;
    exports.$HSb = $HSb = __decorate([
        __param(2, label_1.$Vz),
        __param(3, files_1.$6j)
    ], $HSb);
    class $ISb extends $HSb {
    }
    exports.$ISb = $ISb;
    let $JSb = class $JSb {
        constructor(a, b, d) {
            this.a = a;
            this.b = b;
            this.d = d;
            this.templateId = "m" /* TemplateId.Marker */;
        }
        renderTemplate(container) {
            const data = Object.create(null);
            data.markerWidget = new MarkerWidget(container, this.a, this.d, this.b);
            return data;
        }
        renderElement(node, _, templateData) {
            templateData.markerWidget.render(node.element, node.filterData);
        }
        disposeTemplate(templateData) {
            templateData.markerWidget.dispose();
        }
    };
    exports.$JSb = $JSb;
    exports.$JSb = $JSb = __decorate([
        __param(1, instantiation_1.$Ah),
        __param(2, opener_1.$NT)
    ], $JSb);
    const expandedIcon = (0, iconRegistry_1.$9u)('markers-view-multi-line-expanded', codicons_1.$Pj.chevronUp, (0, nls_1.localize)(1, null));
    const collapsedIcon = (0, iconRegistry_1.$9u)('markers-view-multi-line-collapsed', codicons_1.$Pj.chevronDown, (0, nls_1.localize)(2, null));
    const toggleMultilineAction = 'problems.action.toggleMultiline';
    class ToggleMultilineActionViewItem extends actionViewItems_1.$NQ {
        render(container) {
            super.render(container);
            this.b();
        }
        F() {
            super.F();
            this.b();
        }
        b() {
            this.element?.setAttribute('aria-expanded', `${this._action.class === themables_1.ThemeIcon.asClassName(expandedIcon)}`);
        }
    }
    class MarkerWidget extends lifecycle_1.$kc {
        constructor(j, m, s, _instantiationService) {
            super();
            this.j = j;
            this.m = m;
            this.s = s;
            this.h = this.B(new lifecycle_1.$jc());
            this.a = this.B(new actionbar_1.$1P(dom.$0O(j, dom.$('.actions')), {
                actionViewItemProvider: (action) => action.id === markersViewActions_1.$BSb.ID ? _instantiationService.createInstance(markersViewActions_1.$CSb, action) : undefined
            }));
            // wrap the icon in a container that get the icon color as foreground color. That way, if the
            // list view does not have a specific color for the icon (=the color variable is invalid) it
            // falls back to the foreground color of container (inherit)
            this.f = dom.$0O(j, dom.$(''));
            this.b = dom.$0O(this.f, dom.$(''));
            this.g = dom.$0O(j, dom.$('.marker-message-details-container'));
        }
        render(element, filterData) {
            this.a.clear();
            this.h.clear();
            dom.$lO(this.g);
            this.f.className = `marker-icon ${severity_1.default.toString(markers_1.MarkerSeverity.toSeverity(element.marker.severity))}`;
            this.b.className = `codicon ${severityIcon_1.SeverityIcon.className(markers_1.MarkerSeverity.toSeverity(element.marker.severity))}`;
            this.t(element);
            this.w(element, filterData);
            this.h.add(dom.$nO(this.j, dom.$3O.MOUSE_OVER, () => this.m.onMarkerMouseHover(element)));
            this.h.add(dom.$nO(this.j, dom.$3O.MOUSE_LEAVE, () => this.m.onMarkerMouseLeave(element)));
        }
        t(marker) {
            const viewModel = this.m.getViewModel(marker);
            if (viewModel) {
                const quickFixAction = viewModel.quickFixAction;
                this.a.push([quickFixAction], { icon: true, label: false });
                this.f.classList.toggle('quickFix', quickFixAction.enabled);
                quickFixAction.onDidChange(({ enabled }) => {
                    if (!(0, types_1.$sf)(enabled)) {
                        this.f.classList.toggle('quickFix', enabled);
                    }
                }, this, this.h);
                quickFixAction.onShowQuickFixes(() => {
                    const quickFixActionViewItem = this.a.viewItems[0];
                    if (quickFixActionViewItem) {
                        quickFixActionViewItem.showQuickFixes();
                    }
                }, this, this.h);
            }
        }
        u(marker, parent) {
            const multilineActionbar = this.h.add(new actionbar_1.$1P(dom.$0O(parent, dom.$('.multiline-actions')), {
                actionViewItemProvider: (action) => {
                    if (action.id === toggleMultilineAction) {
                        return new ToggleMultilineActionViewItem(undefined, action, { icon: true });
                    }
                    return undefined;
                }
            }));
            this.h.add((0, lifecycle_1.$ic)(() => multilineActionbar.dispose()));
            const viewModel = this.m.getViewModel(marker);
            const multiline = viewModel && viewModel.multiline;
            const action = new actions_1.$gi(toggleMultilineAction);
            action.enabled = !!viewModel && marker.lines.length > 1;
            action.tooltip = multiline ? (0, nls_1.localize)(3, null) : (0, nls_1.localize)(4, null);
            action.class = themables_1.ThemeIcon.asClassName(multiline ? expandedIcon : collapsedIcon);
            action.run = () => { if (viewModel) {
                viewModel.multiline = !viewModel.multiline;
            } return Promise.resolve(); };
            multilineActionbar.push([action], { icon: true, label: false });
        }
        w(element, filterData) {
            const { marker, lines } = element;
            const viewState = this.m.getViewModel(element);
            const multiline = !viewState || viewState.multiline;
            const lineMatches = filterData && filterData.lineMatches || [];
            this.g.title = element.marker.message;
            const lineElements = [];
            for (let index = 0; index < (multiline ? lines.length : 1); index++) {
                const lineElement = dom.$0O(this.g, dom.$('.marker-message-line'));
                const messageElement = dom.$0O(lineElement, dom.$('.marker-message'));
                const highlightedLabel = new highlightedLabel_1.$JR(messageElement);
                highlightedLabel.set(lines[index].length > 1000 ? `${lines[index].substring(0, 1000)}...` : lines[index], lineMatches[index]);
                if (lines[index] === '') {
                    lineElement.style.height = `${$GSb.LINE_HEIGHT}px`;
                }
                lineElements.push(lineElement);
            }
            this.y(marker, filterData, lineElements[0]);
            this.u(element, lineElements[0]);
        }
        y(marker, filterData, parent) {
            parent.classList.add('details-container');
            if (marker.source || marker.code) {
                const source = new highlightedLabel_1.$JR(dom.$0O(parent, dom.$('.marker-source')));
                const sourceMatches = filterData && filterData.sourceMatches || [];
                source.set(marker.source, sourceMatches);
                if (marker.code) {
                    if (typeof marker.code === 'string') {
                        const code = new highlightedLabel_1.$JR(dom.$0O(parent, dom.$('.marker-code')));
                        const codeMatches = filterData && filterData.codeMatches || [];
                        code.set(marker.code, codeMatches);
                    }
                    else {
                        const container = dom.$('.marker-code');
                        const code = new highlightedLabel_1.$JR(container);
                        const link = marker.code.target.toString(true);
                        this.h.add(new link_1.$40(parent, { href: link, label: container, title: link }, undefined, this.s));
                        const codeMatches = filterData && filterData.codeMatches || [];
                        code.set(marker.code.value, codeMatches);
                    }
                }
            }
            const lnCol = dom.$0O(parent, dom.$('span.marker-line'));
            lnCol.textContent = messages_1.default.MARKERS_PANEL_AT_LINE_COL_NUMBER(marker.startLineNumber, marker.startColumn);
        }
    }
    let $KSb = class $KSb {
        constructor(a) {
            this.a = a;
            this.templateId = "ri" /* TemplateId.RelatedInformation */;
        }
        renderTemplate(container) {
            const data = Object.create(null);
            dom.$0O(container, dom.$('.actions'));
            dom.$0O(container, dom.$('.icon'));
            data.resourceLabel = new highlightedLabel_1.$JR(dom.$0O(container, dom.$('.related-info-resource')));
            data.lnCol = dom.$0O(container, dom.$('span.marker-line'));
            const separator = dom.$0O(container, dom.$('span.related-info-resource-separator'));
            separator.textContent = ':';
            separator.style.paddingRight = '4px';
            data.description = new highlightedLabel_1.$JR(dom.$0O(container, dom.$('.marker-description')));
            return data;
        }
        renderElement(node, _, templateData) {
            const relatedInformation = node.element.raw;
            const uriMatches = node.filterData && node.filterData.uriMatches || [];
            const messageMatches = node.filterData && node.filterData.messageMatches || [];
            templateData.resourceLabel.set((0, resources_1.$fg)(relatedInformation.resource), uriMatches);
            templateData.resourceLabel.element.title = this.a.getUriLabel(relatedInformation.resource, { relative: true });
            templateData.lnCol.textContent = messages_1.default.MARKERS_PANEL_AT_LINE_COL_NUMBER(relatedInformation.startLineNumber, relatedInformation.startColumn);
            templateData.description.set(relatedInformation.message, messageMatches);
            templateData.description.element.title = relatedInformation.message;
        }
        disposeTemplate(templateData) {
            // noop
        }
    };
    exports.$KSb = $KSb;
    exports.$KSb = $KSb = __decorate([
        __param(0, label_1.$Vz)
    ], $KSb);
    class $LSb {
        constructor(options) {
            this.options = options;
        }
        filter(element, parentVisibility) {
            if (element instanceof markersModel_1.$uSb) {
                return this.a(element);
            }
            else if (element instanceof markersModel_1.$vSb) {
                return this.b(element, parentVisibility);
            }
            else {
                return this.d(element, parentVisibility);
            }
        }
        a(resourceMarkers) {
            if (markerService_1.$LBb.has(resourceMarkers.resource.scheme)) {
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
                const uriMatches = markersFilterOptions_1.$ESb._filter(this.options.textFilter.text, (0, resources_1.$fg)(resourceMarkers.resource));
                if (uriMatches) {
                    return { visibility: true, data: { type: 0 /* FilterDataType.ResourceMarkers */, uriMatches: uriMatches || [] } };
                }
            }
            return 2 /* TreeVisibility.Recurse */;
        }
        b(marker, parentVisibility) {
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
                const lineMatch = markersFilterOptions_1.$ESb._messageFilter(this.options.textFilter.text, line);
                lineMatches.push(lineMatch || []);
            }
            const sourceMatches = marker.marker.source ? markersFilterOptions_1.$ESb._filter(this.options.textFilter.text, marker.marker.source) : undefined;
            const codeMatches = marker.marker.code ? markersFilterOptions_1.$ESb._filter(this.options.textFilter.text, typeof marker.marker.code === 'string' ? marker.marker.code : marker.marker.code.value) : undefined;
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
        d(relatedInformation, parentVisibility) {
            if (!this.options.textFilter.text) {
                return true;
            }
            const uriMatches = markersFilterOptions_1.$ESb._filter(this.options.textFilter.text, (0, resources_1.$fg)(relatedInformation.raw.resource));
            const messageMatches = markersFilterOptions_1.$ESb._messageFilter(this.options.textFilter.text, paths.$ae(relatedInformation.raw.message));
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
    exports.$LSb = $LSb;
    let $MSb = class $MSb extends lifecycle_1.$kc {
        constructor(g, h, j, m, s) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.s = s;
            this.a = this.B(new event_1.$fd());
            this.onDidChange = this.a.event;
            this.b = null;
            this.f = null;
            this.t = true;
            this.u = null;
            this.B((0, lifecycle_1.$ic)(() => {
                if (this.b) {
                    this.b.cancel();
                }
                if (this.f) {
                    this.f.cancel();
                }
            }));
        }
        get multiline() {
            return this.t;
        }
        set multiline(value) {
            if (this.t !== value) {
                this.t = value;
                this.a.fire();
            }
        }
        get quickFixAction() {
            if (!this.u) {
                this.u = this.B(this.j.createInstance(markersViewActions_1.$BSb, this.g));
            }
            return this.u;
        }
        showLightBulb() {
            this.w(true);
        }
        async w(waitForModel) {
            const codeActions = await this.y(waitForModel);
            this.quickFixAction.quickFixes = codeActions ? this.z(codeActions) : [];
            this.quickFixAction.autoFixable(!!codeActions && codeActions.hasAutoFix);
        }
        y(waitForModel) {
            if (this.f !== null) {
                return this.f;
            }
            return this.D(waitForModel)
                .then(model => {
                if (model) {
                    if (!this.f) {
                        this.f = (0, async_1.$ug)(cancellationToken => {
                            return (0, codeAction_1.$I1)(this.s.codeActionProvider, model, new range_1.$ks(this.g.range.startLineNumber, this.g.range.startColumn, this.g.range.endLineNumber, this.g.range.endColumn), {
                                type: 1 /* CodeActionTriggerType.Invoke */, triggerAction: types_2.CodeActionTriggerSource.ProblemsView, filter: { include: types_2.$v1.QuickFix }
                            }, progress_1.$4u.None, cancellationToken).then(actions => {
                                return this.B(actions);
                            });
                        });
                    }
                    return this.f;
                }
                return null;
            });
        }
        z(codeActions) {
            return codeActions.validActions.map(item => new actions_1.$gi(item.action.command ? item.action.command.id : item.action.title, item.action.title, undefined, true, () => {
                return this.C(this.g)
                    .then(() => this.j.invokeFunction(codeAction_1.$J1, item, codeAction_1.ApplyCodeActionReason.FromProblemsView));
            }));
        }
        C(element) {
            const { resource, selection } = { resource: element.resource, selection: element.range };
            return this.m.openEditor({
                resource,
                options: {
                    selection,
                    preserveFocus: true,
                    pinned: false,
                    revealIfVisible: true
                },
            }, editorService_1.$0C).then(() => undefined);
        }
        D(waitForModel) {
            const model = this.h.getModel(this.g.resource);
            if (model) {
                return Promise.resolve(model);
            }
            if (waitForModel) {
                if (!this.b) {
                    this.b = (0, async_1.$ug)(cancellationToken => {
                        return new Promise((c) => {
                            this.B(this.h.onModelAdded(model => {
                                if ((0, resources_1.$bg)(model.uri, this.g.resource)) {
                                    c(model);
                                }
                            }));
                        });
                    });
                }
                return this.b;
            }
            return Promise.resolve(null);
        }
    };
    exports.$MSb = $MSb;
    exports.$MSb = $MSb = __decorate([
        __param(1, model_1.$yA),
        __param(2, instantiation_1.$Ah),
        __param(3, editorService_1.$9C),
        __param(4, languageFeatures_1.$hF)
    ], $MSb);
    let $NSb = class $NSb extends lifecycle_1.$kc {
        constructor(multiline = true, viewMode = "tree" /* MarkersViewMode.Tree */, t, u) {
            super();
            this.t = t;
            this.u = u;
            this.a = this.B(new event_1.$fd());
            this.onDidChange = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.onDidChangeViewMode = this.b.event;
            this.f = new Map();
            this.g = new Map();
            this.h = false;
            this.j = null;
            this.m = new async_1.$Dg(300);
            this.w = true;
            this.y = "tree" /* MarkersViewMode.Tree */;
            this.w = multiline;
            this.y = viewMode;
            this.s = markers_2.MarkersContextKeys.MarkersViewModeContextKey.bindTo(this.t);
            this.s.set(viewMode);
        }
        add(marker) {
            if (!this.f.has(marker.id)) {
                const viewModel = this.u.createInstance($MSb, marker);
                const disposables = [viewModel];
                viewModel.multiline = this.multiline;
                viewModel.onDidChange(() => {
                    if (!this.h) {
                        this.a.fire(marker);
                    }
                }, this, disposables);
                this.f.set(marker.id, { viewModel, disposables });
                const markers = this.g.get(marker.resource.toString()) || [];
                markers.push(marker);
                this.g.set(marker.resource.toString(), markers);
            }
        }
        remove(resource) {
            const markers = this.g.get(resource.toString()) || [];
            for (const marker of markers) {
                const value = this.f.get(marker.id);
                if (value) {
                    (0, lifecycle_1.$fc)(value.disposables);
                }
                this.f.delete(marker.id);
                if (this.j === marker) {
                    this.j = null;
                }
            }
            this.g.delete(resource.toString());
        }
        getViewModel(marker) {
            const value = this.f.get(marker.id);
            return value ? value.viewModel : null;
        }
        onMarkerMouseHover(marker) {
            this.j = marker;
            this.m.trigger(() => {
                if (this.j) {
                    const model = this.getViewModel(this.j);
                    if (model) {
                        model.showLightBulb();
                    }
                }
            });
        }
        onMarkerMouseLeave(marker) {
            if (this.j === marker) {
                this.j = null;
            }
        }
        get multiline() {
            return this.w;
        }
        set multiline(value) {
            let changed = false;
            if (this.w !== value) {
                this.w = value;
                changed = true;
            }
            this.h = true;
            this.f.forEach(({ viewModel }) => {
                if (viewModel.multiline !== value) {
                    viewModel.multiline = value;
                    changed = true;
                }
            });
            this.h = false;
            if (changed) {
                this.a.fire(undefined);
            }
        }
        get viewMode() {
            return this.y;
        }
        set viewMode(value) {
            if (this.y === value) {
                return;
            }
            this.y = value;
            this.b.fire(value);
            this.s.set(value);
        }
        dispose() {
            this.f.forEach(({ disposables }) => (0, lifecycle_1.$fc)(disposables));
            this.f.clear();
            this.g.clear();
            super.dispose();
        }
    };
    exports.$NSb = $NSb;
    exports.$NSb = $NSb = __decorate([
        __param(2, contextkey_1.$3i),
        __param(3, instantiation_1.$Ah)
    ], $NSb);
});
//# sourceMappingURL=markersTreeViewer.js.map