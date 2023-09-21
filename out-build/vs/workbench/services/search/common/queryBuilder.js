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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/collections", "vs/base/common/glob", "vs/base/common/labels", "vs/base/common/map", "vs/base/common/network", "vs/base/common/path", "vs/base/common/resources", "vs/base/common/strings", "vs/base/common/types", "vs/base/common/uri", "vs/editor/common/model/textModelSearch", "vs/nls!vs/workbench/services/search/common/queryBuilder", "vs/platform/configuration/common/configuration", "vs/platform/log/common/log", "vs/platform/workspace/common/workspace", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/path/common/pathService", "vs/workbench/services/search/common/search"], function (require, exports, arrays, collections, glob, labels_1, map_1, network_1, path, resources_1, strings, types_1, uri_1, textModelSearch_1, nls, configuration_1, log_1, workspace_1, editorGroupsService_1, pathService_1, search_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$BJ = exports.$AJ = void 0;
    let $AJ = class $AJ {
        constructor(a, b, c, d, e) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.e = e;
        }
        text(contentPattern, folderResources, options = {}) {
            contentPattern = this.f(contentPattern, options);
            const searchConfig = this.a.getValue();
            const fallbackToPCRE = folderResources && folderResources.some(folder => {
                const folderConfig = this.a.getValue({ resource: folder });
                return !folderConfig.search.useRipgrep;
            });
            const commonQuery = this.h(folderResources?.map(workspace_1.$Wh), options);
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
        f(inputPattern, options) {
            const searchConfig = this.a.getValue();
            if (inputPattern.isRegExp) {
                inputPattern.pattern = inputPattern.pattern.replace(/\r?\n/g, '\\n');
            }
            const newPattern = {
                ...inputPattern,
                wordSeparators: searchConfig.editor.wordSeparators
            };
            if (this.j(inputPattern, options)) {
                newPattern.isCaseSensitive = true;
            }
            if (this.k(inputPattern)) {
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
            const commonQuery = this.h(folders, options);
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
        g(pattern, expandPatterns) {
            if (!pattern) {
                return {};
            }
            pattern = Array.isArray(pattern) ? pattern.map(normalizeSlashes) : normalizeSlashes(pattern);
            return expandPatterns
                ? this.parseSearchPaths(pattern)
                : { pattern: patternListToIExpression(...(Array.isArray(pattern) ? pattern : [pattern])) };
        }
        h(folderResources = [], options = {}) {
            const includeSearchPathsInfo = this.g(options.includePattern, options.expandPatterns);
            const excludeSearchPathsInfo = this.g(options.excludePattern, options.expandPatterns);
            // Build folderQueries from searchPaths, if given, otherwise folderResources
            const includeFolderName = folderResources.length > 1;
            const folderQueries = (includeSearchPathsInfo.searchPaths && includeSearchPathsInfo.searchPaths.length ?
                includeSearchPathsInfo.searchPaths.map(searchPath => this.q(searchPath, options, excludeSearchPathsInfo)) :
                folderResources.map(folder => this.r(folder, options, excludeSearchPathsInfo, includeFolderName)))
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
                const openEditors = arrays.$Fb(arrays.$Pb(this.c.groups.map(group => group.editors.map(editor => editor.resource))));
                this.d.trace('QueryBuilder#commonQuery - openEditor URIs', JSON.stringify(openEditors));
                const openEditorsInQuery = openEditors.filter(editor => (0, search_1.$xI)(queryProps, editor.fsPath));
                const openEditorsQueryProps = this.i(openEditorsInQuery);
                this.d.trace('QueryBuilder#commonQuery - openEditor Query', JSON.stringify(openEditorsQueryProps));
                return { ...queryProps, ...openEditorsQueryProps };
            }
            // Filter extraFileResources against global include/exclude patterns - they are already expected to not belong to a workspace
            const extraFileResources = options.extraFileResources && options.extraFileResources.filter(extraFile => (0, search_1.$xI)(queryProps, extraFile.fsPath));
            queryProps.extraFileResources = extraFileResources && extraFileResources.length ? extraFileResources : undefined;
            return queryProps;
        }
        i(files) {
            const folderQueries = [];
            const foldersToSearch = new map_1.$zi();
            const includePattern = {};
            let hasIncludedFile = false;
            files.forEach(file => {
                if (file.scheme === network_1.Schemas.walkThrough) {
                    return;
                }
                const providerExists = (0, resources_1.$mg)(file);
                // Special case userdata as we don't have a search provider for it, but it can be searched.
                if (providerExists) {
                    const searchRoot = this.b.getWorkspaceFolder(file)?.uri ?? file.with({ path: path.$_d(file.fsPath) });
                    let folderQuery = foldersToSearch.get(searchRoot);
                    if (!folderQuery) {
                        hasIncludedFile = true;
                        folderQuery = { folder: searchRoot, includePattern: {} };
                        folderQueries.push(folderQuery);
                        foldersToSearch.set(searchRoot, folderQuery);
                    }
                    const relPath = path.$$d(searchRoot.fsPath, file.fsPath);
                    (0, types_1.$uf)(folderQuery.includePattern)[relPath.replace(/\\/g, '/')] = true;
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
        j(contentPattern, options) {
            if (options.isSmartCase) {
                if (contentPattern.isRegExp) {
                    // Consider it case sensitive if it contains an unescaped capital letter
                    if (strings.$af(contentPattern.pattern, true)) {
                        return true;
                    }
                }
                else if (strings.$af(contentPattern.pattern)) {
                    return true;
                }
            }
            return !!contentPattern.isCaseSensitive;
        }
        k(contentPattern) {
            if (contentPattern.isMultiline) {
                return true;
            }
            if (contentPattern.isRegExp && (0, textModelSearch_1.$iC)(contentPattern.pattern)) {
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
                return path.$8d(segment) || /^\.\.?([\/\\]|$)/.test(segment);
            };
            const patterns = Array.isArray(pattern) ? pattern : splitGlobPattern(pattern);
            const segments = patterns
                .map(segment => {
                const userHome = this.e.resolvedUserHome;
                if (userHome) {
                    return (0, labels_1.$hA)(segment, userHome.scheme === network_1.Schemas.file ? userHome.fsPath : userHome.path);
                }
                return segment;
            });
            const groups = collections.$I(segments, segment => isSearchPath(segment) ? 'searchPaths' : 'exprSegments');
            const expandedExprSegments = (groups.exprSegments || [])
                .map(s => strings.$ve(s, '/'))
                .map(s => strings.$ve(s, '\\'))
                .map(p => {
                if (p[0] === '.') {
                    p = '*' + p; // convert ".js" to "*.js"
                }
                return expandGlobalGlob(p);
            });
            const result = {};
            const searchPaths = this.m(groups.searchPaths || []);
            if (searchPaths && searchPaths.length) {
                result.searchPaths = searchPaths;
            }
            const exprSegments = arrays.$Pb(expandedExprSegments);
            const includePattern = patternListToIExpression(...exprSegments);
            if (includePattern) {
                result.pattern = includePattern;
            }
            return result;
        }
        l(folderConfig, options) {
            return options.disregardExcludeSettings ?
                undefined :
                (0, search_1.$wI)(folderConfig, !options.disregardSearchExcludeSettings);
        }
        /**
         * Split search paths (./ or ../ or absolute paths in the includePatterns) into absolute paths and globs applied to those paths
         */
        m(searchPaths) {
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
                const oneExpanded = this.n(pathPortion);
                // Expanded search paths to multiple resolved patterns (with ** and without)
                return oneExpanded.flatMap(oneExpandedResult => this.o(oneExpandedResult, globPortion));
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
        n(searchPath) {
            if (path.$8d(searchPath)) {
                const workspaceFolders = this.b.getWorkspace().folders;
                if (workspaceFolders[0] && workspaceFolders[0].uri.scheme !== network_1.Schemas.file) {
                    return [{
                            searchPath: workspaceFolders[0].uri.with({ path: searchPath })
                        }];
                }
                // Currently only local resources can be searched for with absolute search paths.
                // TODO convert this to a workspace folder + pattern, so excludes will be resolved properly for an absolute path inside a workspace folder
                return [{
                        searchPath: uri_1.URI.file(path.$7d(searchPath))
                    }];
            }
            if (this.b.getWorkbenchState() === 2 /* WorkbenchState.FOLDER */) {
                const workspaceUri = this.b.getWorkspace().folders[0].uri;
                searchPath = normalizeSlashes(searchPath);
                if (searchPath.startsWith('../') || searchPath === '..') {
                    const resolvedPath = path.$6d.resolve(workspaceUri.path, searchPath);
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
                const folders = this.b.getWorkspace().folders;
                const folderMatches = folders.map(folder => {
                    const match = searchPathWithoutDotSlash.match(new RegExp(`^${strings.$qe(folder.name)}(?:/(.*)|$)`));
                    return match ? {
                        match,
                        folder
                    } : null;
                }).filter(types_1.$rf);
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
                    const searchPathNotFoundError = nls.localize(0, null, probableWorkspaceFolderName);
                    throw new Error(searchPathNotFoundError);
                }
            }
        }
        o(oneExpandedResult, globPortion) {
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
        q(searchPath, options, searchPathExcludes) {
            const rootConfig = this.r((0, workspace_1.$Wh)(searchPath.searchPath), options, searchPathExcludes, false);
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
        r(folder, options, searchPathExcludes, includeFolderName) {
            let thisFolderExcludeSearchPathPattern;
            const folderUri = uri_1.URI.isUri(folder) ? folder : folder.uri;
            if (searchPathExcludes.searchPaths) {
                const thisFolderExcludeSearchPath = searchPathExcludes.searchPaths.filter(sp => (0, resources_1.$bg)(sp.searchPath, folderUri))[0];
                if (thisFolderExcludeSearchPath && !thisFolderExcludeSearchPath.pattern) {
                    // entire folder is excluded
                    return null;
                }
                else if (thisFolderExcludeSearchPath) {
                    thisFolderExcludeSearchPathPattern = thisFolderExcludeSearchPath.pattern;
                }
            }
            const folderConfig = this.a.getValue({ resource: folderUri });
            const settingExcludes = this.l(folderConfig, options);
            const excludePattern = {
                ...(settingExcludes || {}),
                ...(thisFolderExcludeSearchPathPattern || {})
            };
            const folderName = uri_1.URI.isUri(folder) ? (0, resources_1.$fg)(folder) : folder.name;
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
    exports.$AJ = $AJ;
    exports.$AJ = $AJ = __decorate([
        __param(0, configuration_1.$8h),
        __param(1, workspace_1.$Kh),
        __param(2, editorGroupsService_1.$5C),
        __param(3, log_1.$5i),
        __param(4, pathService_1.$yJ)
    ], $AJ);
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
        return glob.$pj(pattern, ',')
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
    function $BJ(resources, contextService) {
        resources = arrays.$Kb(resources, resource => resource.toString());
        const folderPaths = [];
        const workspace = contextService.getWorkspace();
        if (resources) {
            resources.forEach(resource => {
                let folderPath;
                if (contextService.getWorkbenchState() === 2 /* WorkbenchState.FOLDER */) {
                    // Show relative path from the root for single-root mode
                    folderPath = (0, resources_1.$kg)(workspace.folders[0].uri, resource); // always uses forward slashes
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
                            const relPath = (0, resources_1.$kg)(owningFolder.uri, resource); // always uses forward slashes
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
    exports.$BJ = $BJ;
});
//# sourceMappingURL=queryBuilder.js.map