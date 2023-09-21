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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/countBadge/countBadge", "vs/base/common/lifecycle", "vs/base/common/path", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/files/common/files", "vs/platform/label/common/label", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/search/browser/searchModel", "vs/base/common/resources", "vs/platform/actions/common/actions", "vs/platform/instantiation/common/instantiation", "vs/platform/actions/browser/toolbar", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/serviceCollection", "vs/workbench/contrib/search/common/constants", "vs/platform/theme/browser/defaultStyles"], function (require, exports, DOM, countBadge_1, lifecycle_1, paths, nls, configuration_1, files_1, label_1, workspace_1, searchModel_1, resources_1, actions_1, instantiation_1, toolbar_1, contextkey_1, serviceCollection_1, constants_1, defaultStyles_1) {
    "use strict";
    var FolderMatchRenderer_1, FileMatchRenderer_1, MatchRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SearchAccessibilityProvider = exports.MatchRenderer = exports.FileMatchRenderer = exports.FolderMatchRenderer = exports.SearchDelegate = void 0;
    class SearchDelegate {
        static { this.ITEM_HEIGHT = 22; }
        getHeight(element) {
            return SearchDelegate.ITEM_HEIGHT;
        }
        getTemplateId(element) {
            if (element instanceof searchModel_1.FolderMatch) {
                return FolderMatchRenderer.TEMPLATE_ID;
            }
            else if (element instanceof searchModel_1.FileMatch) {
                return FileMatchRenderer.TEMPLATE_ID;
            }
            else if (element instanceof searchModel_1.Match) {
                return MatchRenderer.TEMPLATE_ID;
            }
            console.error('Invalid search tree element', element);
            throw new Error('Invalid search tree element');
        }
    }
    exports.SearchDelegate = SearchDelegate;
    let FolderMatchRenderer = class FolderMatchRenderer extends lifecycle_1.Disposable {
        static { FolderMatchRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'folderMatch'; }
        constructor(searchView, labels, contextService, labelService, instantiationService, contextKeyService) {
            super();
            this.searchView = searchView;
            this.labels = labels;
            this.contextService = contextService;
            this.labelService = labelService;
            this.instantiationService = instantiationService;
            this.contextKeyService = contextKeyService;
            this.templateId = FolderMatchRenderer_1.TEMPLATE_ID;
        }
        renderCompressedElements(node, index, templateData, height) {
            const compressed = node.element;
            const folder = compressed.elements[compressed.elements.length - 1];
            const label = compressed.elements.map(e => e.name());
            if (folder.resource) {
                const fileKind = (folder instanceof searchModel_1.FolderMatchWorkspaceRoot) ? files_1.FileKind.ROOT_FOLDER : files_1.FileKind.FOLDER;
                templateData.label.setResource({ resource: folder.resource, name: label }, {
                    fileKind,
                    separator: this.labelService.getSeparator(folder.resource.scheme),
                });
            }
            else {
                templateData.label.setLabel(nls.localize('searchFolderMatch.other.label', "Other files"));
            }
            this.renderFolderDetails(folder, templateData);
        }
        renderTemplate(container) {
            const disposables = new lifecycle_1.DisposableStore();
            const folderMatchElement = DOM.append(container, DOM.$('.foldermatch'));
            const label = this.labels.create(folderMatchElement, { supportDescriptionHighlights: true, supportHighlights: true });
            disposables.add(label);
            const badge = new countBadge_1.CountBadge(DOM.append(folderMatchElement, DOM.$('.badge')), {}, defaultStyles_1.defaultCountBadgeStyles);
            const actionBarContainer = DOM.append(folderMatchElement, DOM.$('.actionBarContainer'));
            const elementDisposables = new lifecycle_1.DisposableStore();
            disposables.add(elementDisposables);
            const contextKeyServiceMain = disposables.add(this.contextKeyService.createScoped(container));
            constants_1.MatchFocusKey.bindTo(contextKeyServiceMain).set(false);
            constants_1.FileFocusKey.bindTo(contextKeyServiceMain).set(false);
            constants_1.FolderFocusKey.bindTo(contextKeyServiceMain).set(true);
            const instantiationService = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, contextKeyServiceMain]));
            const actions = disposables.add(instantiationService.createInstance(toolbar_1.MenuWorkbenchToolBar, actionBarContainer, actions_1.MenuId.SearchActionMenu, {
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
                const workspaceFolder = this.contextService.getWorkspaceFolder(folderMatch.resource);
                if (workspaceFolder && (0, resources_1.isEqual)(workspaceFolder.uri, folderMatch.resource)) {
                    templateData.label.setFile(folderMatch.resource, { fileKind: files_1.FileKind.ROOT_FOLDER, hidePath: true });
                }
                else {
                    templateData.label.setFile(folderMatch.resource, { fileKind: files_1.FileKind.FOLDER, hidePath: this.searchView.isTreeLayoutViewVisible });
                }
            }
            else {
                templateData.label.setLabel(nls.localize('searchFolderMatch.other.label', "Other files"));
            }
            constants_1.IsEditableItemKey.bindTo(templateData.contextKeyService).set(!folderMatch.hasOnlyReadOnlyMatches());
            templateData.elementDisposables.add(folderMatch.onChange(() => {
                constants_1.IsEditableItemKey.bindTo(templateData.contextKeyService).set(!folderMatch.hasOnlyReadOnlyMatches());
            }));
            this.renderFolderDetails(folderMatch, templateData);
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
        renderFolderDetails(folder, templateData) {
            const count = folder.recursiveMatchCount();
            templateData.badge.setCount(count);
            templateData.badge.setTitleFormat(count > 1 ? nls.localize('searchFileMatches', "{0} files found", count) : nls.localize('searchFileMatch', "{0} file found", count));
            templateData.actions.context = { viewer: this.searchView.getControl(), element: folder };
        }
    };
    exports.FolderMatchRenderer = FolderMatchRenderer;
    exports.FolderMatchRenderer = FolderMatchRenderer = FolderMatchRenderer_1 = __decorate([
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, label_1.ILabelService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, contextkey_1.IContextKeyService)
    ], FolderMatchRenderer);
    let FileMatchRenderer = class FileMatchRenderer extends lifecycle_1.Disposable {
        static { FileMatchRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'fileMatch'; }
        constructor(searchView, labels, contextService, configurationService, instantiationService, contextKeyService) {
            super();
            this.searchView = searchView;
            this.labels = labels;
            this.contextService = contextService;
            this.configurationService = configurationService;
            this.instantiationService = instantiationService;
            this.contextKeyService = contextKeyService;
            this.templateId = FileMatchRenderer_1.TEMPLATE_ID;
        }
        renderCompressedElements(node, index, templateData, height) {
            throw new Error('Should never happen since node is incompressible.');
        }
        renderTemplate(container) {
            const disposables = new lifecycle_1.DisposableStore();
            const elementDisposables = new lifecycle_1.DisposableStore();
            disposables.add(elementDisposables);
            const fileMatchElement = DOM.append(container, DOM.$('.filematch'));
            const label = this.labels.create(fileMatchElement);
            disposables.add(label);
            const badge = new countBadge_1.CountBadge(DOM.append(fileMatchElement, DOM.$('.badge')), {}, defaultStyles_1.defaultCountBadgeStyles);
            const actionBarContainer = DOM.append(fileMatchElement, DOM.$('.actionBarContainer'));
            const contextKeyServiceMain = disposables.add(this.contextKeyService.createScoped(container));
            constants_1.MatchFocusKey.bindTo(contextKeyServiceMain).set(false);
            constants_1.FileFocusKey.bindTo(contextKeyServiceMain).set(true);
            constants_1.FolderFocusKey.bindTo(contextKeyServiceMain).set(false);
            const instantiationService = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, contextKeyServiceMain]));
            const actions = disposables.add(instantiationService.createInstance(toolbar_1.MenuWorkbenchToolBar, actionBarContainer, actions_1.MenuId.SearchActionMenu, {
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
            const decorationConfig = this.configurationService.getValue('search').decorations;
            templateData.label.setFile(fileMatch.resource, { hidePath: this.searchView.isTreeLayoutViewVisible && !(fileMatch.parent() instanceof searchModel_1.FolderMatchNoRoot), hideIcon: false, fileDecorations: { colors: decorationConfig.colors, badges: decorationConfig.badges } });
            const count = fileMatch.count();
            templateData.badge.setCount(count);
            templateData.badge.setTitleFormat(count > 1 ? nls.localize('searchMatches', "{0} matches found", count) : nls.localize('searchMatch', "{0} match found", count));
            templateData.actions.context = { viewer: this.searchView.getControl(), element: fileMatch };
            constants_1.IsEditableItemKey.bindTo(templateData.contextKeyService).set(!fileMatch.hasOnlyReadOnlyMatches());
            templateData.elementDisposables.add(fileMatch.onChange(() => {
                constants_1.IsEditableItemKey.bindTo(templateData.contextKeyService).set(!fileMatch.hasOnlyReadOnlyMatches());
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
    exports.FileMatchRenderer = FileMatchRenderer;
    exports.FileMatchRenderer = FileMatchRenderer = FileMatchRenderer_1 = __decorate([
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, contextkey_1.IContextKeyService)
    ], FileMatchRenderer);
    let MatchRenderer = class MatchRenderer extends lifecycle_1.Disposable {
        static { MatchRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'match'; }
        constructor(searchModel, searchView, contextService, configurationService, instantiationService, contextKeyService) {
            super();
            this.searchModel = searchModel;
            this.searchView = searchView;
            this.contextService = contextService;
            this.configurationService = configurationService;
            this.instantiationService = instantiationService;
            this.contextKeyService = contextKeyService;
            this.templateId = MatchRenderer_1.TEMPLATE_ID;
        }
        renderCompressedElements(node, index, templateData, height) {
            throw new Error('Should never happen since node is incompressible.');
        }
        renderTemplate(container) {
            container.classList.add('linematch');
            const parent = DOM.append(container, DOM.$('a.plain.match'));
            const before = DOM.append(parent, DOM.$('span'));
            const match = DOM.append(parent, DOM.$('span.findInFileMatch'));
            const replace = DOM.append(parent, DOM.$('span.replaceMatch'));
            const after = DOM.append(parent, DOM.$('span'));
            const lineNumber = DOM.append(container, DOM.$('span.matchLineNum'));
            const actionBarContainer = DOM.append(container, DOM.$('span.actionBarContainer'));
            const disposables = new lifecycle_1.DisposableStore();
            const contextKeyServiceMain = disposables.add(this.contextKeyService.createScoped(container));
            constants_1.MatchFocusKey.bindTo(contextKeyServiceMain).set(true);
            constants_1.FileFocusKey.bindTo(contextKeyServiceMain).set(false);
            constants_1.FolderFocusKey.bindTo(contextKeyServiceMain).set(false);
            const instantiationService = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, contextKeyServiceMain]));
            const actions = disposables.add(instantiationService.createInstance(toolbar_1.MenuWorkbenchToolBar, actionBarContainer, actions_1.MenuId.SearchActionMenu, {
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
            const replace = this.searchModel.isReplaceActive() && !!this.searchModel.replaceString && !(match instanceof searchModel_1.MatchInNotebook && match.isWebviewMatch());
            templateData.before.textContent = preview.before;
            templateData.match.textContent = preview.inside;
            templateData.match.classList.toggle('replace', replace);
            templateData.replace.textContent = replace ? match.replaceString : '';
            templateData.after.textContent = preview.after;
            templateData.parent.title = (preview.before + (replace ? match.replaceString : preview.inside) + preview.after).trim().substr(0, 999);
            constants_1.IsEditableItemKey.bindTo(templateData.contextKeyService).set(!(match instanceof searchModel_1.MatchInNotebook && match.isWebviewMatch()));
            const numLines = match.range().endLineNumber - match.range().startLineNumber;
            const extraLinesStr = numLines > 0 ? `+${numLines}` : '';
            const showLineNumbers = this.configurationService.getValue('search').showLineNumbers;
            const lineNumberStr = showLineNumbers ? `:${match.range().startLineNumber}` : '';
            templateData.lineNumber.classList.toggle('show', (numLines > 0) || showLineNumbers);
            templateData.lineNumber.textContent = lineNumberStr + extraLinesStr;
            templateData.lineNumber.setAttribute('title', this.getMatchTitle(match, showLineNumbers));
            templateData.actions.context = { viewer: this.searchView.getControl(), element: match };
        }
        disposeTemplate(templateData) {
            templateData.disposables.dispose();
        }
        getMatchTitle(match, showLineNumbers) {
            const startLine = match.range().startLineNumber;
            const numLines = match.range().endLineNumber - match.range().startLineNumber;
            const lineNumStr = showLineNumbers ?
                nls.localize('lineNumStr', "From line {0}", startLine, numLines) + ' ' :
                '';
            const numLinesStr = numLines > 0 ?
                '+ ' + nls.localize('numLinesStr', "{0} more lines", numLines) :
                '';
            return lineNumStr + numLinesStr;
        }
    };
    exports.MatchRenderer = MatchRenderer;
    exports.MatchRenderer = MatchRenderer = MatchRenderer_1 = __decorate([
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, contextkey_1.IContextKeyService)
    ], MatchRenderer);
    let SearchAccessibilityProvider = class SearchAccessibilityProvider {
        constructor(searchModel, labelService) {
            this.searchModel = searchModel;
            this.labelService = labelService;
        }
        getWidgetAriaLabel() {
            return nls.localize('search', "Search");
        }
        getAriaLabel(element) {
            if (element instanceof searchModel_1.FolderMatch) {
                const count = element.allDownstreamFileMatches().reduce((total, current) => total + current.count(), 0);
                return element.resource ?
                    nls.localize('folderMatchAriaLabel', "{0} matches in folder root {1}, Search result", count, element.name()) :
                    nls.localize('otherFilesAriaLabel', "{0} matches outside of the workspace, Search result", count);
            }
            if (element instanceof searchModel_1.FileMatch) {
                const path = this.labelService.getUriLabel(element.resource, { relative: true }) || element.resource.fsPath;
                return nls.localize('fileMatchAriaLabel', "{0} matches in file {1} of folder {2}, Search result", element.count(), element.name(), paths.dirname(path));
            }
            if (element instanceof searchModel_1.Match) {
                const match = element;
                const searchModel = this.searchModel;
                const replace = searchModel.isReplaceActive() && !!searchModel.replaceString;
                const matchString = match.getMatchString();
                const range = match.range();
                const matchText = match.text().substr(0, range.endColumn + 150);
                if (replace) {
                    return nls.localize('replacePreviewResultAria', "'{0}' at column {1} replace {2} with {3}", matchText, range.startColumn, matchString, match.replaceString);
                }
                return nls.localize('searchResultAria', "'{0}' at column {1} found {2}", matchText, range.startColumn, matchString);
            }
            return null;
        }
    };
    exports.SearchAccessibilityProvider = SearchAccessibilityProvider;
    exports.SearchAccessibilityProvider = SearchAccessibilityProvider = __decorate([
        __param(1, label_1.ILabelService)
    ], SearchAccessibilityProvider);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoUmVzdWx0c1ZpZXcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9zZWFyY2gvYnJvd3Nlci9zZWFyY2hSZXN1bHRzVmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBNkRoRyxNQUFhLGNBQWM7aUJBRVosZ0JBQVcsR0FBRyxFQUFFLENBQUM7UUFFL0IsU0FBUyxDQUFDLE9BQXdCO1lBQ2pDLE9BQU8sY0FBYyxDQUFDLFdBQVcsQ0FBQztRQUNuQyxDQUFDO1FBRUQsYUFBYSxDQUFDLE9BQXdCO1lBQ3JDLElBQUksT0FBTyxZQUFZLHlCQUFXLEVBQUU7Z0JBQ25DLE9BQU8sbUJBQW1CLENBQUMsV0FBVyxDQUFDO2FBQ3ZDO2lCQUFNLElBQUksT0FBTyxZQUFZLHVCQUFTLEVBQUU7Z0JBQ3hDLE9BQU8saUJBQWlCLENBQUMsV0FBVyxDQUFDO2FBQ3JDO2lCQUFNLElBQUksT0FBTyxZQUFZLG1CQUFLLEVBQUU7Z0JBQ3BDLE9BQU8sYUFBYSxDQUFDLFdBQVcsQ0FBQzthQUNqQztZQUVELE9BQU8sQ0FBQyxLQUFLLENBQUMsNkJBQTZCLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDdEQsTUFBTSxJQUFJLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO1FBQ2hELENBQUM7O0lBbkJGLHdDQW9CQztJQUNNLElBQU0sbUJBQW1CLEdBQXpCLE1BQU0sbUJBQW9CLFNBQVEsc0JBQVU7O2lCQUNsQyxnQkFBVyxHQUFHLGFBQWEsQUFBaEIsQ0FBaUI7UUFJNUMsWUFDUyxVQUFzQixFQUN0QixNQUFzQixFQUNKLGNBQWtELEVBQzdELFlBQTRDLEVBQ3BDLG9CQUE0RCxFQUMvRCxpQkFBc0Q7WUFFMUUsS0FBSyxFQUFFLENBQUM7WUFQQSxlQUFVLEdBQVYsVUFBVSxDQUFZO1lBQ3RCLFdBQU0sR0FBTixNQUFN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