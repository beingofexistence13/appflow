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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/countBadge/countBadge", "vs/base/common/lifecycle", "vs/base/common/path", "vs/nls!vs/workbench/contrib/search/browser/searchResultsView", "vs/platform/configuration/common/configuration", "vs/platform/files/common/files", "vs/platform/label/common/label", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/search/browser/searchModel", "vs/base/common/resources", "vs/platform/actions/common/actions", "vs/platform/instantiation/common/instantiation", "vs/platform/actions/browser/toolbar", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/serviceCollection", "vs/workbench/contrib/search/common/constants", "vs/platform/theme/browser/defaultStyles"], function (require, exports, DOM, countBadge_1, lifecycle_1, paths, nls, configuration_1, files_1, label_1, workspace_1, searchModel_1, resources_1, actions_1, instantiation_1, toolbar_1, contextkey_1, serviceCollection_1, constants_1, defaultStyles_1) {
    "use strict";
    var $fPb_1, $gPb_1, $hPb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$iPb = exports.$hPb = exports.$gPb = exports.$fPb = exports.$ePb = void 0;
    class $ePb {
        static { this.ITEM_HEIGHT = 22; }
        getHeight(element) {
            return $ePb.ITEM_HEIGHT;
        }
        getTemplateId(element) {
            if (element instanceof searchModel_1.$TMb) {
                return $fPb.TEMPLATE_ID;
            }
            else if (element instanceof searchModel_1.$SMb) {
                return $gPb.TEMPLATE_ID;
            }
            else if (element instanceof searchModel_1.$PMb) {
                return $hPb.TEMPLATE_ID;
            }
            console.error('Invalid search tree element', element);
            throw new Error('Invalid search tree element');
        }
    }
    exports.$ePb = $ePb;
    let $fPb = class $fPb extends lifecycle_1.$kc {
        static { $fPb_1 = this; }
        static { this.TEMPLATE_ID = 'folderMatch'; }
        constructor(a, b, c, f, h, j) {
            super();
            this.a = a;
            this.b = b;
            this.c = c;
            this.f = f;
            this.h = h;
            this.j = j;
            this.templateId = $fPb_1.TEMPLATE_ID;
        }
        renderCompressedElements(node, index, templateData, height) {
            const compressed = node.element;
            const folder = compressed.elements[compressed.elements.length - 1];
            const label = compressed.elements.map(e => e.name());
            if (folder.resource) {
                const fileKind = (folder instanceof searchModel_1.$VMb) ? files_1.FileKind.ROOT_FOLDER : files_1.FileKind.FOLDER;
                templateData.label.setResource({ resource: folder.resource, name: label }, {
                    fileKind,
                    separator: this.f.getSeparator(folder.resource.scheme),
                });
            }
            else {
                templateData.label.setLabel(nls.localize(0, null));
            }
            this.m(folder, templateData);
        }
        renderTemplate(container) {
            const disposables = new lifecycle_1.$jc();
            const folderMatchElement = DOM.$0O(container, DOM.$('.foldermatch'));
            const label = this.b.create(folderMatchElement, { supportDescriptionHighlights: true, supportHighlights: true });
            disposables.add(label);
            const badge = new countBadge_1.$nR(DOM.$0O(folderMatchElement, DOM.$('.badge')), {}, defaultStyles_1.$v2);
            const actionBarContainer = DOM.$0O(folderMatchElement, DOM.$('.actionBarContainer'));
            const elementDisposables = new lifecycle_1.$jc();
            disposables.add(elementDisposables);
            const contextKeyServiceMain = disposables.add(this.j.createScoped(container));
            constants_1.$xOb.bindTo(contextKeyServiceMain).set(false);
            constants_1.$tOb.bindTo(contextKeyServiceMain).set(false);
            constants_1.$uOb.bindTo(contextKeyServiceMain).set(true);
            const instantiationService = this.h.createChild(new serviceCollection_1.$zh([contextkey_1.$3i, contextKeyServiceMain]));
            const actions = disposables.add(instantiationService.createInstance(toolbar_1.$M6, actionBarContainer, actions_1.$Ru.SearchActionMenu, {
                menuOptions: {
                    shouldForwardArgs: true
                },
                hiddenItemStrategy: 0 /* HiddenItemStrategy.Ignore */,
                toolbarOptions: {
                    primaryGroup: (g) => /^inline/.test(g),
                },
            }));
            return {
                label,
                badge,
                actions,
                disposables,
                elementDisposables,
                contextKeyService: contextKeyServiceMain
            };
        }
        renderElement(node, index, templateData) {
            const folderMatch = node.element;
            if (folderMatch.resource) {
                const workspaceFolder = this.c.getWorkspaceFolder(folderMatch.resource);
                if (workspaceFolder && (0, resources_1.$bg)(workspaceFolder.uri, folderMatch.resource)) {
                    templateData.label.setFile(folderMatch.resource, { fileKind: files_1.FileKind.ROOT_FOLDER, hidePath: true });
                }
                else {
                    templateData.label.setFile(folderMatch.resource, { fileKind: files_1.FileKind.FOLDER, hidePath: this.a.cd });
                }
            }
            else {
                templateData.label.setLabel(nls.localize(1, null));
            }
            constants_1.$wOb.bindTo(templateData.contextKeyService).set(!folderMatch.hasOnlyReadOnlyMatches());
            templateData.elementDisposables.add(folderMatch.onChange(() => {
                constants_1.$wOb.bindTo(templateData.contextKeyService).set(!folderMatch.hasOnlyReadOnlyMatches());
            }));
            this.m(folderMatch, templateData);
        }
        disposeElement(element, index, templateData) {
            templateData.elementDisposables.clear();
        }
        disposeCompressedElements(node, index, templateData, height) {
            templateData.elementDisposables.clear();
        }
        disposeTemplate(templateData) {
            templateData.disposables.dispose();
        }
        m(folder, templateData) {
            const count = folder.recursiveMatchCount();
            templateData.badge.setCount(count);
            templateData.badge.setTitleFormat(count > 1 ? nls.localize(2, null, count) : nls.localize(3, null, count));
            templateData.actions.context = { viewer: this.a.getControl(), element: folder };
        }
    };
    exports.$fPb = $fPb;
    exports.$fPb = $fPb = $fPb_1 = __decorate([
        __param(2, workspace_1.$Kh),
        __param(3, label_1.$Vz),
        __param(4, instantiation_1.$Ah),
        __param(5, contextkey_1.$3i)
    ], $fPb);
    let $gPb = class $gPb extends lifecycle_1.$kc {
        static { $gPb_1 = this; }
        static { this.TEMPLATE_ID = 'fileMatch'; }
        constructor(a, b, c, f, h, j) {
            super();
            this.a = a;
            this.b = b;
            this.c = c;
            this.f = f;
            this.h = h;
            this.j = j;
            this.templateId = $gPb_1.TEMPLATE_ID;
        }
        renderCompressedElements(node, index, templateData, height) {
            throw new Error('Should never happen since node is incompressible.');
        }
        renderTemplate(container) {
            const disposables = new lifecycle_1.$jc();
            const elementDisposables = new lifecycle_1.$jc();
            disposables.add(elementDisposables);
            const fileMatchElement = DOM.$0O(container, DOM.$('.filematch'));
            const label = this.b.create(fileMatchElement);
            disposables.add(label);
            const badge = new countBadge_1.$nR(DOM.$0O(fileMatchElement, DOM.$('.badge')), {}, defaultStyles_1.$v2);
            const actionBarContainer = DOM.$0O(fileMatchElement, DOM.$('.actionBarContainer'));
            const contextKeyServiceMain = disposables.add(this.j.createScoped(container));
            constants_1.$xOb.bindTo(contextKeyServiceMain).set(false);
            constants_1.$tOb.bindTo(contextKeyServiceMain).set(true);
            constants_1.$uOb.bindTo(contextKeyServiceMain).set(false);
            const instantiationService = this.h.createChild(new serviceCollection_1.$zh([contextkey_1.$3i, contextKeyServiceMain]));
            const actions = disposables.add(instantiationService.createInstance(toolbar_1.$M6, actionBarContainer, actions_1.$Ru.SearchActionMenu, {
                menuOptions: {
                    shouldForwardArgs: true
                },
                hiddenItemStrategy: 0 /* HiddenItemStrategy.Ignore */,
                toolbarOptions: {
                    primaryGroup: (g) => /^inline/.test(g),
                },
            }));
            return {
                el: fileMatchElement,
                label,
                badge,
                actions,
                disposables,
                elementDisposables,
                contextKeyService: contextKeyServiceMain
            };
        }
        renderElement(node, index, templateData) {
            const fileMatch = node.element;
            templateData.el.setAttribute('data-resource', fileMatch.resource.toString());
            const decorationConfig = this.f.getValue('search').decorations;
            templateData.label.setFile(fileMatch.resource, { hidePath: this.a.cd && !(fileMatch.parent() instanceof searchModel_1.$WMb), hideIcon: false, fileDecorations: { colors: decorationConfig.colors, badges: decorationConfig.badges } });
            const count = fileMatch.count();
            templateData.badge.setCount(count);
            templateData.badge.setTitleFormat(count > 1 ? nls.localize(4, null, count) : nls.localize(5, null, count));
            templateData.actions.context = { viewer: this.a.getControl(), element: fileMatch };
            constants_1.$wOb.bindTo(templateData.contextKeyService).set(!fileMatch.hasOnlyReadOnlyMatches());
            templateData.elementDisposables.add(fileMatch.onChange(() => {
                constants_1.$wOb.bindTo(templateData.contextKeyService).set(!fileMatch.hasOnlyReadOnlyMatches());
            }));
            // when hidesExplorerArrows: true, then the file nodes should still have a twistie because it would otherwise
            // be hard to tell whether the node is collapsed or expanded.
            const twistieContainer = templateData.el.parentElement?.parentElement?.querySelector('.monaco-tl-twistie');
            twistieContainer?.classList.add('force-twistie');
        }
        disposeElement(element, index, templateData) {
            templateData.elementDisposables.clear();
        }
        disposeTemplate(templateData) {
            templateData.disposables.dispose();
        }
    };
    exports.$gPb = $gPb;
    exports.$gPb = $gPb = $gPb_1 = __decorate([
        __param(2, workspace_1.$Kh),
        __param(3, configuration_1.$8h),
        __param(4, instantiation_1.$Ah),
        __param(5, contextkey_1.$3i)
    ], $gPb);
    let $hPb = class $hPb extends lifecycle_1.$kc {
        static { $hPb_1 = this; }
        static { this.TEMPLATE_ID = 'match'; }
        constructor(a, b, c, f, h, j) {
            super();
            this.a = a;
            this.b = b;
            this.c = c;
            this.f = f;
            this.h = h;
            this.j = j;
            this.templateId = $hPb_1.TEMPLATE_ID;
        }
        renderCompressedElements(node, index, templateData, height) {
            throw new Error('Should never happen since node is incompressible.');
        }
        renderTemplate(container) {
            container.classList.add('linematch');
            const parent = DOM.$0O(container, DOM.$('a.plain.match'));
            const before = DOM.$0O(parent, DOM.$('span'));
            const match = DOM.$0O(parent, DOM.$('span.findInFileMatch'));
            const replace = DOM.$0O(parent, DOM.$('span.replaceMatch'));
            const after = DOM.$0O(parent, DOM.$('span'));
            const lineNumber = DOM.$0O(container, DOM.$('span.matchLineNum'));
            const actionBarContainer = DOM.$0O(container, DOM.$('span.actionBarContainer'));
            const disposables = new lifecycle_1.$jc();
            const contextKeyServiceMain = disposables.add(this.j.createScoped(container));
            constants_1.$xOb.bindTo(contextKeyServiceMain).set(true);
            constants_1.$tOb.bindTo(contextKeyServiceMain).set(false);
            constants_1.$uOb.bindTo(contextKeyServiceMain).set(false);
            const instantiationService = this.h.createChild(new serviceCollection_1.$zh([contextkey_1.$3i, contextKeyServiceMain]));
            const actions = disposables.add(instantiationService.createInstance(toolbar_1.$M6, actionBarContainer, actions_1.$Ru.SearchActionMenu, {
                menuOptions: {
                    shouldForwardArgs: true
                },
                hiddenItemStrategy: 0 /* HiddenItemStrategy.Ignore */,
                toolbarOptions: {
                    primaryGroup: (g) => /^inline/.test(g),
                },
            }));
            return {
                parent,
                before,
                match,
                replace,
                after,
                lineNumber,
                actions,
                disposables,
                contextKeyService: contextKeyServiceMain
            };
        }
        renderElement(node, index, templateData) {
            const match = node.element;
            const preview = match.preview();
            const replace = this.a.isReplaceActive() && !!this.a.replaceString && !(match instanceof searchModel_1.$RMb && match.isWebviewMatch());
            templateData.before.textContent = preview.before;
            templateData.match.textContent = preview.inside;
            templateData.match.classList.toggle('replace', replace);
            templateData.replace.textContent = replace ? match.replaceString : '';
            templateData.after.textContent = preview.after;
            templateData.parent.title = (preview.before + (replace ? match.replaceString : preview.inside) + preview.after).trim().substr(0, 999);
            constants_1.$wOb.bindTo(templateData.contextKeyService).set(!(match instanceof searchModel_1.$RMb && match.isWebviewMatch()));
            const numLines = match.range().endLineNumber - match.range().startLineNumber;
            const extraLinesStr = numLines > 0 ? `+${numLines}` : '';
            const showLineNumbers = this.f.getValue('search').showLineNumbers;
            const lineNumberStr = showLineNumbers ? `:${match.range().startLineNumber}` : '';
            templateData.lineNumber.classList.toggle('show', (numLines > 0) || showLineNumbers);
            templateData.lineNumber.textContent = lineNumberStr + extraLinesStr;
            templateData.lineNumber.setAttribute('title', this.m(match, showLineNumbers));
            templateData.actions.context = { viewer: this.b.getControl(), element: match };
        }
        disposeTemplate(templateData) {
            templateData.disposables.dispose();
        }
        m(match, showLineNumbers) {
            const startLine = match.range().startLineNumber;
            const numLines = match.range().endLineNumber - match.range().startLineNumber;
            const lineNumStr = showLineNumbers ?
                nls.localize(6, null, startLine, numLines) + ' ' :
                '';
            const numLinesStr = numLines > 0 ?
                '+ ' + nls.localize(7, null, numLines) :
                '';
            return lineNumStr + numLinesStr;
        }
    };
    exports.$hPb = $hPb;
    exports.$hPb = $hPb = $hPb_1 = __decorate([
        __param(2, workspace_1.$Kh),
        __param(3, configuration_1.$8h),
        __param(4, instantiation_1.$Ah),
        __param(5, contextkey_1.$3i)
    ], $hPb);
    let $iPb = class $iPb {
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        getWidgetAriaLabel() {
            return nls.localize(8, null);
        }
        getAriaLabel(element) {
            if (element instanceof searchModel_1.$TMb) {
                const count = element.allDownstreamFileMatches().reduce((total, current) => total + current.count(), 0);
                return element.resource ?
                    nls.localize(9, null, count, element.name()) :
                    nls.localize(10, null, count);
            }
            if (element instanceof searchModel_1.$SMb) {
                const path = this.b.getUriLabel(element.resource, { relative: true }) || element.resource.fsPath;
                return nls.localize(11, null, element.count(), element.name(), paths.$_d(path));
            }
            if (element instanceof searchModel_1.$PMb) {
                const match = element;
                const searchModel = this.a;
                const replace = searchModel.isReplaceActive() && !!searchModel.replaceString;
                const matchString = match.getMatchString();
                const range = match.range();
                const matchText = match.text().substr(0, range.endColumn + 150);
                if (replace) {
                    return nls.localize(12, null, matchText, range.startColumn, matchString, match.replaceString);
                }
                return nls.localize(13, null, matchText, range.startColumn, matchString);
            }
            return null;
        }
    };
    exports.$iPb = $iPb;
    exports.$iPb = $iPb = __decorate([
        __param(1, label_1.$Vz)
    ], $iPb);
});
//# sourceMappingURL=searchResultsView.js.map