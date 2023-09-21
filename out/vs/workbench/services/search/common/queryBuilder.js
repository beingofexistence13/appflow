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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/collections", "vs/base/common/glob", "vs/base/common/labels", "vs/base/common/map", "vs/base/common/network", "vs/base/common/path", "vs/base/common/resources", "vs/base/common/strings", "vs/base/common/types", "vs/base/common/uri", "vs/editor/common/model/textModelSearch", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/log/common/log", "vs/platform/workspace/common/workspace", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/path/common/pathService", "vs/workbench/services/search/common/search"], function (require, exports, arrays, collections, glob, labels_1, map_1, network_1, path, resources_1, strings, types_1, uri_1, textModelSearch_1, nls, configuration_1, log_1, workspace_1, editorGroupsService_1, pathService_1, search_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.resolveResourcesForSearchIncludes = exports.QueryBuilder = void 0;
    let QueryBuilder = class QueryBuilder {
        constructor(configurationService, workspaceContextService, editorGroupsService, logService, pathService) {
            this.configurationService = configurationService;
            this.workspaceContextService = workspaceContextService;
            this.editorGroupsService = editorGroupsService;
            this.logService = logService;
            this.pathService = pathService;
        }
        text(contentPattern, folderResources, options = {}) {
            contentPattern = this.getContentPattern(contentPattern, options);
            const searchConfig = this.configurationService.getValue();
            const fallbackToPCRE = folderResources && folderResources.some(folder => {
                const folderConfig = this.configurationService.getValue({ resource: folder });
                return !folderConfig.search.useRipgrep;
            });
            const commonQuery = this.commonQuery(folderResources?.map(workspace_1.toWorkspaceFolder), options);
            return {
                ...commonQuery,
                type: 2 /* QueryType.Text */,
                contentPattern,
                previewOptions: options.previewOptions,
                maxFileSize: options.maxFileSize,
                usePCRE2: searchConfig.search.usePCRE2 || fallbackToPCRE || false,
                beforeContext: options.beforeContext,
                afterContext: options.afterContext,
                userDisabledExcludesAndIgnoreFiles: options.disregardExcludeSettings && options.disregardIgnoreFiles,
            };
        }
        /**
         * Adjusts input pattern for config
         */
        getContentPattern(inputPattern, options) {
            const searchConfig = this.configurationService.getValue();
            if (inputPattern.isRegExp) {
                inputPattern.pattern = inputPattern.pattern.replace(/\r?\n/g, '\\n');
            }
            const newPattern = {
                ...inputPattern,
                wordSeparators: searchConfig.editor.wordSeparators
            };
            if (this.isCaseSensitive(inputPattern, options)) {
                newPattern.isCaseSensitive = true;
            }
            if (this.isMultiline(inputPattern)) {
                newPattern.isMultiline = true;
            }
            if (options.notebookSearchConfig?.includeMarkupInput) {
                if (!newPattern.notebookInfo) {
                    newPattern.notebookInfo = {};
                }
                newPattern.notebookInfo.isInNotebookMarkdownInput = options.notebookSearchConfig.includeMarkupInput;
            }
            if (options.notebookSearchConfig?.includeMarkupPreview) {
                if (!newPattern.notebookInfo) {
                    newPattern.notebookInfo = {};
                }
                newPattern.notebookInfo.isInNotebookMarkdownPreview = options.notebookSearchConfig.includeMarkupPreview;
            }
            if (options.notebookSearchConfig?.includeCodeInput) {
                if (!newPattern.notebookInfo) {
                    newPattern.notebookInfo = {};
                }
                newPattern.notebookInfo.isInNotebookCellInput = options.notebookSearchConfig.includeCodeInput;
            }
            if (options.notebookSearchConfig?.includeOutput) {
                if (!newPattern.notebookInfo) {
                    newPattern.notebookInfo = {};
                }
                newPattern.notebookInfo.isInNotebookCellOutput = options.notebookSearchConfig.includeOutput;
            }
            return newPattern;
        }
        file(folders, options = {}) {
            const commonQuery = this.commonQuery(folders, options);
            return {
                ...commonQuery,
                type: 1 /* QueryType.File */,
                filePattern: options.filePattern
                    ? options.filePattern.trim()
                    : options.filePattern,
                exists: options.exists,
                sortByScore: options.sortByScore,
                cacheKey: options.cacheKey,
            };
        }
        handleIncludeExclude(pattern, expandPatterns) {
            if (!pattern) {
                return {};
            }
            pattern = Array.isArray(pattern) ? pattern.map(normalizeSlashes) : normalizeSlashes(pattern);
            return expandPatterns
                ? this.parseSearchPaths(pattern)
                : { pattern: patternListToIExpression(...(Array.isArray(pattern) ? pattern : [pattern])) };
        }
        commonQuery(folderResources = [], options = {}) {
            const includeSearchPathsInfo = this.handleIncludeExclude(options.includePattern, options.expandPatterns);
            const excludeSearchPathsInfo = this.handleIncludeExclude(options.excludePattern, options.expandPatterns);
            // Build folderQueries from searchPaths, if given, otherwise folderResources
            const includeFolderName = folderResources.length > 1;
            const folderQueries = (includeSearchPathsInfo.searchPaths && includeSearchPathsInfo.searchPaths.length ?
                includeSearchPathsInfo.searchPaths.map(searchPath => this.getFolderQueryForSearchPath(searchPath, options, excludeSearchPathsInfo)) :
                folderResources.map(folder => this.getFolderQueryForRoot(folder, options, excludeSearchPathsInfo, includeFolderName)))
                .filter(query => !!query);
            const queryProps = {
                _reason: options._reason,
                folderQueries,
                usingSearchPaths: !!(includeSearchPathsInfo.searchPaths && includeSearchPathsInfo.searchPaths.length),
                extraFileResources: options.extraFileResources,
                excludePattern: excludeSearchPathsInfo.pattern,
                includePattern: includeSearchPathsInfo.pattern,
                onlyOpenEditors: options.onlyOpenEditors,
                maxResults: options.maxResults
            };
            if (options.onlyOpenEditors) {
                const openEditors = arrays.coalesce(arrays.flatten(this.editorGroupsService.groups.map(group => group.editors.map(editor => editor.resource))));
                this.logService.trace('QueryBuilder#commonQuery - openEditor URIs', JSON.stringify(openEditors));
                const openEditorsInQuery = openEditors.filter(editor => (0, search_1.pathIncludedInQuery)(queryProps, editor.fsPath));
                const openEditorsQueryProps = this.commonQueryFromFileList(openEditorsInQuery);
                this.logService.trace('QueryBuilder#commonQuery - openEditor Query', JSON.stringify(openEditorsQueryProps));
                return { ...queryProps, ...openEditorsQueryProps };
            }
            // Filter extraFileResources against global include/exclude patterns - they are already expected to not belong to a workspace
            const extraFileResources = options.extraFileResources && options.extraFileResources.filter(extraFile => (0, search_1.pathIncludedInQuery)(queryProps, extraFile.fsPath));
            queryProps.extraFileResources = extraFileResources && extraFileResources.length ? extraFileResources : undefined;
            return queryProps;
        }
        commonQueryFromFileList(files) {
            const folderQueries = [];
            const foldersToSearch = new map_1.ResourceMap();
            const includePattern = {};
            let hasIncludedFile = false;
            files.forEach(file => {
                if (file.scheme === network_1.Schemas.walkThrough) {
                    return;
                }
                const providerExists = (0, resources_1.isAbsolutePath)(file);
                // Special case userdata as we don't have a search provider for it, but it can be searched.
                if (providerExists) {
                    const searchRoot = this.workspaceContextService.getWorkspaceFolder(file)?.uri ?? file.with({ path: path.dirname(file.fsPath) });
                    let folderQuery = foldersToSearch.get(searchRoot);
                    if (!folderQuery) {
                        hasIncludedFile = true;
                        folderQuery = { folder: searchRoot, includePattern: {} };
                        folderQueries.push(folderQuery);
                        foldersToSearch.set(searchRoot, folderQuery);
                    }
                    const relPath = path.relative(searchRoot.fsPath, file.fsPath);
                    (0, types_1.assertIsDefined)(folderQuery.includePattern)[relPath.replace(/\\/g, '/')] = true;
                }
                else {
                    if (file.fsPath) {
                        hasIncludedFile = true;
                        includePattern[file.fsPath] = true;
                    }
                }
            });
            return {
                folderQueries,
                includePattern,
                usingSearchPaths: true,
                excludePattern: hasIncludedFile ? undefined : { '**/*': true }
            };
        }
        /**
         * Resolve isCaseSensitive flag based on the query and the isSmartCase flag, for search providers that don't support smart case natively.
         */
        isCaseSensitive(contentPattern, options) {
            if (options.isSmartCase) {
                if (contentPattern.isRegExp) {
                    // Consider it case sensitive if it contains an unescaped capital letter
                    if (strings.containsUppercaseCharacter(contentPattern.pattern, true)) {
                        return true;
                    }
                }
                else if (strings.containsUppercaseCharacter(contentPattern.pattern)) {
                    return true;
                }
            }
            return !!contentPattern.isCaseSensitive;
        }
        isMultiline(contentPattern) {
            if (contentPattern.isMultiline) {
                return true;
            }
            if (contentPattern.isRegExp && (0, textModelSearch_1.isMultilineRegexSource)(contentPattern.pattern)) {
                return true;
            }
            if (contentPattern.pattern.indexOf('\n') >= 0) {
                return true;
            }
            return !!contentPattern.isMultiline;
        }
        /**
         * Take the includePattern as seen in the search viewlet, and split into components that look like searchPaths, and
         * glob patterns. Glob patterns are expanded from 'foo/bar' to '{foo/bar/**, **\/foo/bar}.
         *
         * Public for test.
         */
        parseSearchPaths(pattern) {
            const isSearchPath = (segment) => {
                // A segment is a search path if it is an absolute path or starts with ./, ../, .\, or ..\
                return path.isAbsolute(segment) || /^\.\.?([\/\\]|$)/.test(segment);
            };
            const patterns = Array.isArray(pattern) ? pattern : splitGlobPattern(pattern);
            const segments = patterns
                .map(segment => {
                const userHome = this.pathService.resolvedUserHome;
                if (userHome) {
                    return (0, labels_1.untildify)(segment, userHome.scheme === network_1.Schemas.file ? userHome.fsPath : userHome.path);
                }
                return segment;
            });
            const groups = collections.groupBy(segments, segment => isSearchPath(segment) ? 'searchPaths' : 'exprSegments');
            const expandedExprSegments = (groups.exprSegments || [])
                .map(s => strings.rtrim(s, '/'))
                .map(s => strings.rtrim(s, '\\'))
                .map(p => {
                if (p[0] === '.') {
                    p = '*' + p; // convert ".js" to "*.js"
                }
                return expandGlobalGlob(p);
            });
            const result = {};
            const searchPaths = this.expandSearchPathPatterns(groups.searchPaths || []);
            if (searchPaths && searchPaths.length) {
                result.searchPaths = searchPaths;
            }
            const exprSegments = arrays.flatten(expandedExprSegments);
            const includePattern = patternListToIExpression(...exprSegments);
            if (includePattern) {
                result.pattern = includePattern;
            }
            return result;
        }
        getExcludesForFolder(folderConfig, options) {
            return options.disregardExcludeSettings ?
                undefined :
                (0, search_1.getExcludes)(folderConfig, !options.disregardSearchExcludeSettings);
        }
        /**
         * Split search paths (./ or ../ or absolute paths in the includePatterns) into absolute paths and globs applied to those paths
         */
        expandSearchPathPatterns(searchPaths) {
            if (!searchPaths || !searchPaths.length) {
                // No workspace => ignore search paths
                return [];
            }
            const expandedSearchPaths = searchPaths.flatMap(searchPath => {
                // 1 open folder => just resolve the search paths to absolute paths
                let { pathPortion, globPortion } = splitGlobFromPath(searchPath);
                if (globPortion) {
                    globPortion = normalizeGlobPattern(globPortion);
                }
                // One pathPortion to multiple expanded search paths (e.g. duplicate matching workspace folders)
                const oneExpanded = this.expandOneSearchPath(pathPortion);
                // Expanded search paths to multiple resolved patterns (with ** and without)
                return oneExpanded.flatMap(oneExpandedResult => this.resolveOneSearchPathPattern(oneExpandedResult, globPortion));
            });
            const searchPathPatternMap = new Map();
            expandedSearchPaths.forEach(oneSearchPathPattern => {
                const key = oneSearchPathPattern.searchPath.toString();
                const existing = searchPathPatternMap.get(key);
                if (existing) {
                    if (oneSearchPathPattern.pattern) {
                        existing.pattern = existing.pattern || {};
                        existing.pattern[oneSearchPathPattern.pattern] = true;
                    }
                }
                else {
                    searchPathPatternMap.set(key, {
                        searchPath: oneSearchPathPattern.searchPath,
                        pattern: oneSearchPathPattern.pattern ? patternListToIExpression(oneSearchPathPattern.pattern) : undefined
                    });
                }
            });
            return Array.from(searchPathPatternMap.values());
        }
        /**
         * Takes a searchPath like `./a/foo` or `../a/foo` and expands it to absolute paths for all the workspaces it matches.
         */
        expandOneSearchPath(searchPath) {
            if (path.isAbsolute(searchPath)) {
                const workspaceFolders = this.workspaceContextService.getWorkspace().folders;
                if (workspaceFolders[0] && workspaceFolders[0].uri.scheme !== network_1.Schemas.file) {
                    return [{
                            searchPath: workspaceFolders[0].uri.with({ path: searchPath })
                        }];
                }
                // Currently only local resources can be searched for with absolute search paths.
                // TODO convert this to a workspace folder + pattern, so excludes will be resolved properly for an absolute path inside a workspace folder
                return [{
                        searchPath: uri_1.URI.file(path.normalize(searchPath))
                    }];
            }
            if (this.workspaceContextService.getWorkbenchState() === 2 /* WorkbenchState.FOLDER */) {
                const workspaceUri = this.workspaceContextService.getWorkspace().folders[0].uri;
                searchPath = normalizeSlashes(searchPath);
                if (searchPath.startsWith('../') || searchPath === '..') {
                    const resolvedPath = path.posix.resolve(workspaceUri.path, searchPath);
                    return [{
                            searchPath: workspaceUri.with({ path: resolvedPath })
                        }];
                }
                const cleanedPattern = normalizeGlobPattern(searchPath);
                return [{
                        searchPath: workspaceUri,
                        pattern: cleanedPattern
                    }];
            }
            else if (searchPath === './' || searchPath === '.\\') {
                return []; // ./ or ./**/foo makes sense for single-folder but not multi-folder workspaces
            }
            else {
                const searchPathWithoutDotSlash = searchPath.replace(/^\.[\/\\]/, '');
                const folders = this.workspaceContextService.getWorkspace().folders;
                const folderMatches = folders.map(folder => {
                    const match = searchPathWithoutDotSlash.match(new RegExp(`^${strings.escapeRegExpCharacters(folder.name)}(?:/(.*)|$)`));
                    return match ? {
                        match,
                        folder
                    } : null;
                }).filter(types_1.isDefined);
                if (folderMatches.length) {
                    return folderMatches.map(match => {
                        const patternMatch = match.match[1];
                        return {
                            searchPath: match.folder.uri,
                            pattern: patternMatch && normalizeGlobPattern(patternMatch)
                        };
                    });
                }
                else {
                    const probableWorkspaceFolderNameMatch = searchPath.match(/\.[\/\\](.+)[\/\\]?/);
                    const probableWorkspaceFolderName = probableWorkspaceFolderNameMatch ? probableWorkspaceFolderNameMatch[1] : searchPath;
                    // No root folder with name
                    const searchPathNotFoundError = nls.localize('search.noWorkspaceWithName', "Workspace folder does not exist: {0}", probableWorkspaceFolderName);
                    throw new Error(searchPathNotFoundError);
                }
            }
        }
        resolveOneSearchPathPattern(oneExpandedResult, globPortion) {
            const pattern = oneExpandedResult.pattern && globPortion ?
                `${oneExpandedResult.pattern}/${globPortion}` :
                oneExpandedResult.pattern || globPortion;
            const results = [
                {
                    searchPath: oneExpandedResult.searchPath,
                    pattern
                }
            ];
            if (pattern && !pattern.endsWith('**')) {
                results.push({
                    searchPath: oneExpandedResult.searchPath,
                    pattern: pattern + '/**'
                });
            }
            return results;
        }
        getFolderQueryForSearchPath(searchPath, options, searchPathExcludes) {
            const rootConfig = this.getFolderQueryForRoot((0, workspace_1.toWorkspaceFolder)(searchPath.searchPath), options, searchPathExcludes, false);
            if (!rootConfig) {
                return null;
            }
            return {
                ...rootConfig,
                ...{
                    includePattern: searchPath.pattern
                }
            };
        }
        getFolderQueryForRoot(folder, options, searchPathExcludes, includeFolderName) {
            let thisFolderExcludeSearchPathPattern;
            const folderUri = uri_1.URI.isUri(folder) ? folder : folder.uri;
            if (searchPathExcludes.searchPaths) {
                const thisFolderExcludeSearchPath = searchPathExcludes.searchPaths.filter(sp => (0, resources_1.isEqual)(sp.searchPath, folderUri))[0];
                if (thisFolderExcludeSearchPath && !thisFolderExcludeSearchPath.pattern) {
                    // entire folder is excluded
                    return null;
                }
                else if (thisFolderExcludeSearchPath) {
                    thisFolderExcludeSearchPathPattern = thisFolderExcludeSearchPath.pattern;
                }
            }
            const folderConfig = this.configurationService.getValue({ resource: folderUri });
            const settingExcludes = this.getExcludesForFolder(folderConfig, options);
            const excludePattern = {
                ...(settingExcludes || {}),
                ...(thisFolderExcludeSearchPathPattern || {})
            };
            const folderName = uri_1.URI.isUri(folder) ? (0, resources_1.basename)(folder) : folder.name;
            return {
                folder: folderUri,
                folderName: includeFolderName ? folderName : undefined,
                excludePattern: Object.keys(excludePattern).length > 0 ? excludePattern : undefined,
                fileEncoding: folderConfig.files && folderConfig.files.encoding,
                disregardIgnoreFiles: typeof options.disregardIgnoreFiles === 'boolean' ? options.disregardIgnoreFiles : !folderConfig.search.useIgnoreFiles,
                disregardGlobalIgnoreFiles: typeof options.disregardGlobalIgnoreFiles === 'boolean' ? options.disregardGlobalIgnoreFiles : !folderConfig.search.useGlobalIgnoreFiles,
                disregardParentIgnoreFiles: typeof options.disregardParentIgnoreFiles === 'boolean' ? options.disregardParentIgnoreFiles : !folderConfig.search.useParentIgnoreFiles,
                ignoreSymlinks: typeof options.ignoreSymlinks === 'boolean' ? options.ignoreSymlinks : !folderConfig.search.followSymlinks,
            };
        }
    };
    exports.QueryBuilder = QueryBuilder;
    exports.QueryBuilder = QueryBuilder = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, workspace_1.IWorkspaceContextService),
        __param(2, editorGroupsService_1.IEditorGroupsService),
        __param(3, log_1.ILogService),
        __param(4, pathService_1.IPathService)
    ], QueryBuilder);
    function splitGlobFromPath(searchPath) {
        const globCharMatch = searchPath.match(/[\*\{\}\(\)\[\]\?]/);
        if (globCharMatch) {
            const globCharIdx = globCharMatch.index;
            const lastSlashMatch = searchPath.substr(0, globCharIdx).match(/[/|\\][^/\\]*$/);
            if (lastSlashMatch) {
                let pathPortion = searchPath.substr(0, lastSlashMatch.index);
                if (!pathPortion.match(/[/\\]/)) {
                    // If the last slash was the only slash, then we now have '' or 'C:' or '.'. Append a slash.
                    pathPortion += '/';
                }
                return {
                    pathPortion,
                    globPortion: searchPath.substr((lastSlashMatch.index || 0) + 1)
                };
            }
        }
        // No glob char, or malformed
        return {
            pathPortion: searchPath
        };
    }
    function patternListToIExpression(...patterns) {
        return patterns.length ?
            patterns.reduce((glob, cur) => { glob[cur] = true; return glob; }, Object.create(null)) :
            undefined;
    }
    function splitGlobPattern(pattern) {
        return glob.splitGlobAware(pattern, ',')
            .map(s => s.trim())
            .filter(s => !!s.length);
    }
    /**
     * Note - we used {} here previously but ripgrep can't handle nested {} patterns. See https://github.com/microsoft/vscode/issues/32761
     */
    function expandGlobalGlob(pattern) {
        const patterns = [
            `**/${pattern}/**`,
            `**/${pattern}`
        ];
        return patterns.map(p => p.replace(/\*\*\/\*\*/g, '**'));
    }
    function normalizeSlashes(pattern) {
        return pattern.replace(/\\/g, '/');
    }
    /**
     * Normalize slashes, remove `./` and trailing slashes
     */
    function normalizeGlobPattern(pattern) {
        return normalizeSlashes(pattern)
            .replace(/^\.\//, '')
            .replace(/\/+$/g, '');
    }
    /**
     * Escapes a path for use as a glob pattern that would match the input precisely.
     * Characters '?', '*', '[', and ']' are escaped into character range glob syntax
     * (for example, '?' becomes '[?]').
     * NOTE: This implementation makes no special cases for UNC paths. For example,
     * given the input "//?/C:/A?.txt", this would produce output '//[?]/C:/A[?].txt',
     * which may not be desirable in some cases. Use with caution if UNC paths could be expected.
     */
    function escapeGlobPattern(path) {
        return path.replace(/([?*[\]])/g, '[$1]');
    }
    /**
     * Construct an include pattern from a list of folders uris to search in.
     */
    function resolveResourcesForSearchIncludes(resources, contextService) {
        resources = arrays.distinct(resources, resource => resource.toString());
        const folderPaths = [];
        const workspace = contextService.getWorkspace();
        if (resources) {
            resources.forEach(resource => {
                let folderPath;
                if (contextService.getWorkbenchState() === 2 /* WorkbenchState.FOLDER */) {
                    // Show relative path from the root for single-root mode
                    folderPath = (0, resources_1.relativePath)(workspace.folders[0].uri, resource); // always uses forward slashes
                    if (folderPath && folderPath !== '.') {
                        folderPath = './' + folderPath;
                    }
                }
                else {
                    const owningFolder = contextService.getWorkspaceFolder(resource);
                    if (owningFolder) {
                        const owningRootName = owningFolder.name;
                        // If this root is the only one with its basename, use a relative ./ path. If there is another, use an absolute path
                        const isUniqueFolder = workspace.folders.filter(folder => folder.name === owningRootName).length === 1;
                        if (isUniqueFolder) {
                            const relPath = (0, resources_1.relativePath)(owningFolder.uri, resource); // always uses forward slashes
                            if (relPath === '') {
                                folderPath = `./${owningFolder.name}`;
                            }
                            else {
                                folderPath = `./${owningFolder.name}/${relPath}`;
                            }
                        }
                        else {
                            folderPath = resource.fsPath; // TODO rob: handle non-file URIs
                        }
                    }
                }
                if (folderPath) {
                    folderPaths.push(escapeGlobPattern(folderPath));
                }
            });
        }
        return folderPaths;
    }
    exports.resolveResourcesForSearchIncludes = resolveResourcesForSearchIncludes;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnlCdWlsZGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3NlYXJjaC9jb21tb24vcXVlcnlCdWlsZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXVGekYsSUFBTSxZQUFZLEdBQWxCLE1BQU0sWUFBWTtRQUV4QixZQUN5QyxvQkFBMkMsRUFDeEMsdUJBQWlELEVBQ3JELG1CQUF5QyxFQUNsRCxVQUF1QixFQUN0QixXQUF5QjtZQUpoQix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQ3hDLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBMEI7WUFDckQsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFzQjtZQUNsRCxlQUFVLEdBQVYsVUFBVSxDQUFhO1lBQ3RCLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1FBRXpELENBQUM7UUFFRCxJQUFJLENBQUMsY0FBNEIsRUFBRSxlQUF1QixFQUFFLFVBQW9DLEVBQUU7WUFDakcsY0FBYyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDakUsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsRUFBd0IsQ0FBQztZQUVoRixNQUFNLGNBQWMsR0FBRyxlQUFlLElBQUksZUFBZSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDdkUsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBdUIsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztnQkFDcEcsT0FBTyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDO1lBQ3hDLENBQUMsQ0FBQyxDQUFDO1lBRUgsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFl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