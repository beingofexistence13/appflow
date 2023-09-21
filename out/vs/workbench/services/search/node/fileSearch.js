/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "child_process", "fs", "vs/base/common/path", "string_decoder", "vs/base/common/arrays", "vs/base/common/errorMessage", "vs/base/common/glob", "vs/base/common/normalization", "vs/base/common/extpath", "vs/base/common/platform", "vs/base/common/stopwatch", "vs/base/common/strings", "vs/base/common/types", "vs/base/node/pfs", "vs/workbench/services/search/common/search", "./ripgrepFileSearch", "vs/base/common/fuzzyScorer"], function (require, exports, childProcess, fs, path, string_decoder_1, arrays, errorMessage_1, glob, normalization, extpath_1, platform, stopwatch_1, strings, types, pfs_1, search_1, ripgrepFileSearch_1, fuzzyScorer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Engine = exports.FileWalker = void 0;
    const killCmds = new Set();
    process.on('exit', () => {
        killCmds.forEach(cmd => cmd());
    });
    class FileWalker {
        constructor(config) {
            this.normalizedFilePatternLowercase = null;
            this.maxFilesize = null;
            this.isCanceled = false;
            this.fileWalkSW = null;
            this.cmdSW = null;
            this.cmdResultCount = 0;
            this.config = config;
            this.filePattern = config.filePattern || '';
            this.includePattern = config.includePattern && glob.parse(config.includePattern);
            this.maxResults = config.maxResults || null;
            this.exists = !!config.exists;
            this.walkedPaths = Object.create(null);
            this.resultCount = 0;
            this.isLimitHit = false;
            this.directoriesWalked = 0;
            this.filesWalked = 0;
            this.errors = [];
            if (this.filePattern) {
                this.normalizedFilePatternLowercase = (0, fuzzyScorer_1.prepareQuery)(this.filePattern).normalizedLowercase;
            }
            this.globalExcludePattern = config.excludePattern && glob.parse(config.excludePattern);
            this.folderExcludePatterns = new Map();
            config.folderQueries.forEach(folderQuery => {
                const folderExcludeExpression = Object.assign({}, folderQuery.excludePattern || {}, this.config.excludePattern || {});
                // Add excludes for other root folders
                const fqPath = folderQuery.folder.fsPath;
                config.folderQueries
                    .map(rootFolderQuery => rootFolderQuery.folder.fsPath)
                    .filter(rootFolder => rootFolder !== fqPath)
                    .forEach(otherRootFolder => {
                    // Exclude nested root folders
                    if ((0, extpath_1.isEqualOrParent)(otherRootFolder, fqPath)) {
                        folderExcludeExpression[path.relative(fqPath, otherRootFolder)] = true;
                    }
                });
                this.folderExcludePatterns.set(fqPath, new AbsoluteAndRelativeParsedExpression(folderExcludeExpression, fqPath));
            });
        }
        cancel() {
            this.isCanceled = true;
            killCmds.forEach(cmd => cmd());
        }
        walk(folderQueries, extraFiles, onResult, onMessage, done) {
            this.fileWalkSW = stopwatch_1.StopWatch.create(false);
            // Support that the file pattern is a full path to a file that exists
            if (this.isCanceled) {
                return done(null, this.isLimitHit);
            }
            // For each extra file
            extraFiles.forEach(extraFilePath => {
                const basename = path.basename(extraFilePath.fsPath);
                if (this.globalExcludePattern && this.globalExcludePattern(extraFilePath.fsPath, basename)) {
                    return; // excluded
                }
                // File: Check for match on file pattern and include pattern
                this.matchFile(onResult, { relativePath: extraFilePath.fsPath /* no workspace relative path */, searchPath: undefined });
            });
            this.cmdSW = stopwatch_1.StopWatch.create(false);
            // For each root folder
            this.parallel(folderQueries, (folderQuery, rootFolderDone) => {
                this.call(this.cmdTraversal, this, folderQuery, onResult, onMessage, (err) => {
                    if (err) {
                        const errorMessage = (0, errorMessage_1.toErrorMessage)(err);
                        console.error(errorMessage);
                        this.errors.push(errorMessage);
                        rootFolderDone(err, undefined);
                    }
                    else {
                        rootFolderDone(null, undefined);
                    }
                });
            }, (errors, _result) => {
                this.fileWalkSW.stop();
                const err = errors ? arrays.coalesce(errors)[0] : null;
                done(err, this.isLimitHit);
            });
        }
        parallel(list, fn, callback) {
            const results = new Array(list.length);
            const errors = new Array(list.length);
            let didErrorOccur = false;
            let doneCount = 0;
            if (list.length === 0) {
                return callback(null, []);
            }
            list.forEach((item, index) => {
                fn(item, (error, result) => {
                    if (error) {
                        didErrorOccur = true;
                        results[index] = null;
                        errors[index] = error;
                    }
                    else {
                        results[index] = result;
                        errors[index] = null;
                    }
                    if (++doneCount === list.length) {
                        return callback(didErrorOccur ? errors : null, results);
                    }
                });
            });
        }
        call(fun, that, ...args) {
            try {
                fun.apply(that, args);
            }
            catch (e) {
                args[args.length - 1](e);
            }
        }
        cmdTraversal(folderQuery, onResult, onMessage, cb) {
            const rootFolder = folderQuery.folder.fsPath;
            const isMac = platform.isMacintosh;
            const killCmd = () => cmd && cmd.kill();
            killCmds.add(killCmd);
            let done = (err) => {
                killCmds.delete(killCmd);
                done = () => { };
                cb(err);
            };
            let leftover = '';
            const tree = this.initDirectoryTree();
            const ripgrep = (0, ripgrepFileSearch_1.spawnRipgrepCmd)(this.config, folderQuery, this.config.includePattern, this.folderExcludePatterns.get(folderQuery.folder.fsPath).expression);
            const cmd = ripgrep.cmd;
            const noSiblingsClauses = !Object.keys(ripgrep.siblingClauses).length;
            const escapedArgs = ripgrep.rgArgs.args
                .map(arg => arg.match(/^-/) ? arg : `'${arg}'`)
                .join(' ');
            let rgCmd = `${ripgrep.rgDiskPath} ${escapedArgs}\n - cwd: ${ripgrep.cwd}`;
            if (ripgrep.rgArgs.siblingClauses) {
                rgCmd += `\n - Sibling clauses: ${JSON.stringify(ripgrep.rgArgs.siblingClauses)}`;
            }
            onMessage({ message: rgCmd });
            this.cmdResultCount = 0;
            this.collectStdout(cmd, 'utf8', onMessage, (err, stdout, last) => {
                if (err) {
                    done(err);
                    return;
                }
                if (this.isLimitHit) {
                    done();
                    return;
                }
                // Mac: uses NFD unicode form on disk, but we want NFC
                const normalized = leftover + (isMac ? normalization.normalizeNFC(stdout || '') : stdout);
                const relativeFiles = normalized.split('\n');
                if (last) {
                    const n = relativeFiles.length;
                    relativeFiles[n - 1] = relativeFiles[n - 1].trim();
                    if (!relativeFiles[n - 1]) {
                        relativeFiles.pop();
                    }
                }
                else {
                    leftover = relativeFiles.pop() || '';
                }
                if (relativeFiles.length && relativeFiles[0].indexOf('\n') !== -1) {
                    done(new Error('Splitting up files failed'));
                    return;
                }
                this.cmdResultCount += relativeFiles.length;
                if (noSiblingsClauses) {
                    for (const relativePath of relativeFiles) {
                        this.matchFile(onResult, { base: rootFolder, relativePath, searchPath: this.getSearchPath(folderQuery, relativePath) });
                        if (this.isLimitHit) {
                            killCmd();
                            break;
                        }
                    }
                    if (last || this.isLimitHit) {
                        done();
                    }
                    return;
                }
                // TODO: Optimize siblings clauses with ripgrep here.
                this.addDirectoryEntries(folderQuery, tree, rootFolder, relativeFiles, onResult);
                if (last) {
                    this.matchDirectoryTree(tree, rootFolder, onResult);
                    done();
                }
            });
        }
        /**
         * Public for testing.
         */
        spawnFindCmd(folderQuery) {
            const excludePattern = this.folderExcludePatterns.get(folderQuery.folder.fsPath);
            const basenames = excludePattern.getBasenameTerms();
            const pathTerms = excludePattern.getPathTerms();
            const args = ['-L', '.'];
            if (basenames.length || pathTerms.length) {
                args.push('-not', '(', '(');
                for (const basename of basenames) {
                    args.push('-name', basename);
                    args.push('-o');
                }
                for (const path of pathTerms) {
                    args.push('-path', path);
                    args.push('-o');
                }
                args.pop();
                args.push(')', '-prune', ')');
            }
            args.push('-type', 'f');
            return childProcess.spawn('find', args, { cwd: folderQuery.folder.fsPath });
        }
        /**
         * Public for testing.
         */
        readStdout(cmd, encoding, cb) {
            let all = '';
            this.collectStdout(cmd, encoding, () => { }, (err, stdout, last) => {
                if (err) {
                    cb(err);
                    return;
                }
                all += stdout;
                if (last) {
                    cb(null, all);
                }
            });
        }
        collectStdout(cmd, encoding, onMessage, cb) {
            let onData = (err, stdout, last) => {
                if (err || last) {
                    onData = () => { };
                    this.cmdSW?.stop();
                }
                cb(err, stdout, last);
            };
            let gotData = false;
            if (cmd.stdout) {
                // Should be non-null, but #38195
                this.forwardData(cmd.stdout, encoding, onData);
                cmd.stdout.once('data', () => gotData = true);
            }
            else {
                onMessage({ message: 'stdout is null' });
            }
            let stderr;
            if (cmd.stderr) {
                // Should be non-null, but #38195
                stderr = this.collectData(cmd.stderr);
            }
            else {
                onMessage({ message: 'stderr is null' });
            }
            cmd.on('error', (err) => {
                onData(err);
            });
            cmd.on('close', (code) => {
                // ripgrep returns code=1 when no results are found
                let stderrText;
                if (!gotData && (stderrText = this.decodeData(stderr, encoding)) && rgErrorMsgForDisplay(stderrText)) {
                    onData(new Error(`command failed with error code ${code}: ${this.decodeData(stderr, encoding)}`));
                }
                else {
                    if (this.exists && code === 0) {
                        this.isLimitHit = true;
                    }
                    onData(null, '', true);
                }
            });
        }
        forwardData(stream, encoding, cb) {
            const decoder = new string_decoder_1.StringDecoder(encoding);
            stream.on('data', (data) => {
                cb(null, decoder.write(data));
            });
            return decoder;
        }
        collectData(stream) {
            const buffers = [];
            stream.on('data', (data) => {
                buffers.push(data);
            });
            return buffers;
        }
        decodeData(buffers, encoding) {
            const decoder = new string_decoder_1.StringDecoder(encoding);
            return buffers.map(buffer => decoder.write(buffer)).join('');
        }
        initDirectoryTree() {
            const tree = {
                rootEntries: [],
                pathToEntries: Object.create(null)
            };
            tree.pathToEntries['.'] = tree.rootEntries;
            return tree;
        }
        addDirectoryEntries(folderQuery, { pathToEntries }, base, relativeFiles, onResult) {
            // Support relative paths to files from a root resource (ignores excludes)
            if (relativeFiles.indexOf(this.filePattern) !== -1) {
                this.matchFile(onResult, {
                    base,
                    relativePath: this.filePattern,
                    searchPath: this.getSearchPath(folderQuery, this.filePattern)
                });
            }
            const add = (relativePath) => {
                const basename = path.basename(relativePath);
                const dirname = path.dirname(relativePath);
                let entries = pathToEntries[dirname];
                if (!entries) {
                    entries = pathToEntries[dirname] = [];
                    add(dirname);
                }
                entries.push({
                    base,
                    relativePath,
                    basename,
                    searchPath: this.getSearchPath(folderQuery, relativePath),
                });
            };
            relativeFiles.forEach(add);
        }
        matchDirectoryTree({ rootEntries, pathToEntries }, rootFolder, onResult) {
            const self = this;
            const excludePattern = this.folderExcludePatterns.get(rootFolder);
            const filePattern = this.filePattern;
            function matchDirectory(entries) {
                self.directoriesWalked++;
                const hasSibling = (0, search_1.hasSiblingFn)(() => entries.map(entry => entry.basename));
                for (let i = 0, n = entries.length; i < n; i++) {
                    const entry = entries[i];
                    const { relativePath, basename } = entry;
                    // Check exclude pattern
                    // If the user searches for the exact file name, we adjust the glob matching
                    // to ignore filtering by siblings because the user seems to know what they
                    // are searching for and we want to include the result in that case anyway
                    if (excludePattern.test(relativePath, basename, filePattern !== basename ? hasSibling : undefined)) {
                        continue;
                    }
                    const sub = pathToEntries[relativePath];
                    if (sub) {
                        matchDirectory(sub);
                    }
                    else {
                        self.filesWalked++;
                        if (relativePath === filePattern) {
                            continue; // ignore file if its path matches with the file pattern because that is already matched above
                        }
                        self.matchFile(onResult, entry);
                    }
                    if (self.isLimitHit) {
                        break;
                    }
                }
            }
            matchDirectory(rootEntries);
        }
        getStats() {
            return {
                cmdTime: this.cmdSW.elapsed(),
                fileWalkTime: this.fileWalkSW.elapsed(),
                directoriesWalked: this.directoriesWalked,
                filesWalked: this.filesWalked,
                cmdResultCount: this.cmdResultCount
            };
        }
        doWalk(folderQuery, relativeParentPath, files, onResult, done) {
            const rootFolder = folderQuery.folder;
            // Execute tasks on each file in parallel to optimize throughput
            const hasSibling = (0, search_1.hasSiblingFn)(() => files);
            this.parallel(files, (file, clb) => {
                // Check canceled
                if (this.isCanceled || this.isLimitHit) {
                    return clb(null);
                }
                // Check exclude pattern
                // If the user searches for the exact file name, we adjust the glob matching
                // to ignore filtering by siblings because the user seems to know what they
                // are searching for and we want to include the result in that case anyway
                const currentRelativePath = relativeParentPath ? [relativeParentPath, file].join(path.sep) : file;
                if (this.folderExcludePatterns.get(folderQuery.folder.fsPath).test(currentRelativePath, file, this.config.filePattern !== file ? hasSibling : undefined)) {
                    return clb(null);
                }
                // Use lstat to detect links
                const currentAbsolutePath = [rootFolder.fsPath, currentRelativePath].join(path.sep);
                fs.lstat(currentAbsolutePath, (error, lstat) => {
                    if (error || this.isCanceled || this.isLimitHit) {
                        return clb(null);
                    }
                    // If the path is a link, we must instead use fs.stat() to find out if the
                    // link is a directory or not because lstat will always return the stat of
                    // the link which is always a file.
                    this.statLinkIfNeeded(currentAbsolutePath, lstat, (error, stat) => {
                        if (error || this.isCanceled || this.isLimitHit) {
                            return clb(null);
                        }
                        // Directory: Follow directories
                        if (stat.isDirectory()) {
                            this.directoriesWalked++;
                            // to really prevent loops with links we need to resolve the real path of them
                            return this.realPathIfNeeded(currentAbsolutePath, lstat, (error, realpath) => {
                                if (error || this.isCanceled || this.isLimitHit) {
                                    return clb(null);
                                }
                                realpath = realpath || '';
                                if (this.walkedPaths[realpath]) {
                                    return clb(null); // escape when there are cycles (can happen with symlinks)
                                }
                                this.walkedPaths[realpath] = true; // remember as walked
                                // Continue walking
                                return pfs_1.Promises.readdir(currentAbsolutePath).then(children => {
                                    if (this.isCanceled || this.isLimitHit) {
                                        return clb(null);
                                    }
                                    this.doWalk(folderQuery, currentRelativePath, children, onResult, err => clb(err || null));
                                }, error => {
                                    clb(null);
                                });
                            });
                        }
                        // File: Check for match on file pattern and include pattern
                        else {
                            this.filesWalked++;
                            if (currentRelativePath === this.filePattern) {
                                return clb(null, undefined); // ignore file if its path matches with the file pattern because checkFilePatternRelativeMatch() takes care of those
                            }
                            if (this.maxFilesize && types.isNumber(stat.size) && stat.size > this.maxFilesize) {
                                return clb(null, undefined); // ignore file if max file size is hit
                            }
                            this.matchFile(onResult, {
                                base: rootFolder.fsPath,
                                relativePath: currentRelativePath,
                                searchPath: this.getSearchPath(folderQuery, currentRelativePath),
                            });
                        }
                        // Unwind
                        return clb(null, undefined);
                    });
                });
            }, (error) => {
                const filteredErrors = error ? arrays.coalesce(error) : error; // find any error by removing null values first
                return done(filteredErrors && filteredErrors.length > 0 ? filteredErrors[0] : undefined);
            });
        }
        matchFile(onResult, candidate) {
            if (this.isFileMatch(candidate) && (!this.includePattern || this.includePattern(candidate.relativePath, path.basename(candidate.relativePath)))) {
                this.resultCount++;
                if (this.exists || (this.maxResults && this.resultCount > this.maxResults)) {
                    this.isLimitHit = true;
                }
                if (!this.isLimitHit) {
                    onResult(candidate);
                }
            }
        }
        isFileMatch(candidate) {
            // Check for search pattern
            if (this.filePattern) {
                if (this.filePattern === '*') {
                    return true; // support the all-matching wildcard
                }
                if (this.normalizedFilePatternLowercase) {
                    return (0, search_1.isFilePatternMatch)(candidate, this.normalizedFilePatternLowercase);
                }
            }
            // No patterns means we match all
            return true;
        }
        statLinkIfNeeded(path, lstat, clb) {
            if (lstat.isSymbolicLink()) {
                return fs.stat(path, clb); // stat the target the link points to
            }
            return clb(null, lstat); // not a link, so the stat is already ok for us
        }
        realPathIfNeeded(path, lstat, clb) {
            if (lstat.isSymbolicLink()) {
                return fs.realpath(path, (error, realpath) => {
                    if (error) {
                        return clb(error);
                    }
                    return clb(null, realpath);
                });
            }
            return clb(null, path);
        }
        /**
         * If we're searching for files in multiple workspace folders, then better prepend the
         * name of the workspace folder to the path of the file. This way we'll be able to
         * better filter files that are all on the top of a workspace folder and have all the
         * same name. A typical example are `package.json` or `README.md` files.
         */
        getSearchPath(folderQuery, relativePath) {
            if (folderQuery.folderName) {
                return path.join(folderQuery.folderName, relativePath);
            }
            return relativePath;
        }
    }
    exports.FileWalker = FileWalker;
    class Engine {
        constructor(config) {
            this.folderQueries = config.folderQueries;
            this.extraFiles = config.extraFileResources || [];
            this.walker = new FileWalker(config);
        }
        search(onResult, onProgress, done) {
            this.walker.walk(this.folderQueries, this.extraFiles, onResult, onProgress, (err, isLimitHit) => {
                done(err, {
                    limitHit: isLimitHit,
                    stats: this.walker.getStats(),
                    messages: [],
                });
            });
        }
        cancel() {
            this.walker.cancel();
        }
    }
    exports.Engine = Engine;
    /**
     * This class exists to provide one interface on top of two ParsedExpressions, one for absolute expressions and one for relative expressions.
     * The absolute and relative expressions don't "have" to be kept separate, but this keeps us from having to path.join every single
     * file searched, it's only used for a text search with a searchPath
     */
    class AbsoluteAndRelativeParsedExpression {
        constructor(expression, root) {
            this.expression = expression;
            this.root = root;
            this.init(expression);
        }
        /**
         * Split the IExpression into its absolute and relative components, and glob.parse them separately.
         */
        init(expr) {
            let absoluteGlobExpr;
            let relativeGlobExpr;
            Object.keys(expr)
                .filter(key => expr[key])
                .forEach(key => {
                if (path.isAbsolute(key)) {
                    absoluteGlobExpr = absoluteGlobExpr || glob.getEmptyExpression();
                    absoluteGlobExpr[key] = expr[key];
                }
                else {
                    relativeGlobExpr = relativeGlobExpr || glob.getEmptyExpression();
                    relativeGlobExpr[key] = expr[key];
                }
            });
            this.absoluteParsedExpr = absoluteGlobExpr && glob.parse(absoluteGlobExpr, { trimForExclusions: true });
            this.relativeParsedExpr = relativeGlobExpr && glob.parse(relativeGlobExpr, { trimForExclusions: true });
        }
        test(_path, basename, hasSibling) {
            return (this.relativeParsedExpr && this.relativeParsedExpr(_path, basename, hasSibling)) ||
                (this.absoluteParsedExpr && this.absoluteParsedExpr(path.join(this.root, _path), basename, hasSibling));
        }
        getBasenameTerms() {
            const basenameTerms = [];
            if (this.absoluteParsedExpr) {
                basenameTerms.push(...glob.getBasenameTerms(this.absoluteParsedExpr));
            }
            if (this.relativeParsedExpr) {
                basenameTerms.push(...glob.getBasenameTerms(this.relativeParsedExpr));
            }
            return basenameTerms;
        }
        getPathTerms() {
            const pathTerms = [];
            if (this.absoluteParsedExpr) {
                pathTerms.push(...glob.getPathTerms(this.absoluteParsedExpr));
            }
            if (this.relativeParsedExpr) {
                pathTerms.push(...glob.getPathTerms(this.relativeParsedExpr));
            }
            return pathTerms;
        }
    }
    function rgErrorMsgForDisplay(msg) {
        const lines = msg.trim().split('\n');
        const firstLine = lines[0].trim();
        if (firstLine.startsWith('Error parsing regex')) {
            return firstLine;
        }
        if (firstLine.startsWith('regex parse error')) {
            return strings.uppercaseFirstLetter(lines[lines.length - 1].trim());
        }
        if (firstLine.startsWith('error parsing glob') ||
            firstLine.startsWith('unsupported encoding')) {
            // Uppercase first letter
            return firstLine.charAt(0).toUpperCase() + firstLine.substr(1);
        }
        if (firstLine === `Literal '\\n' not allowed.`) {
            // I won't localize this because none of the Ripgrep error messages are localized
            return `Literal '\\n' currently not supported`;
        }
        if (firstLine.startsWith('Literal ')) {
            // Other unsupported chars
            return firstLine;
        }
        return undefined;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZVNlYXJjaC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9zZWFyY2gvbm9kZS9maWxlU2VhcmNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWdDaEcsTUFBTSxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQWMsQ0FBQztJQUN2QyxPQUFPLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUU7UUFDdkIsUUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDaEMsQ0FBQyxDQUFDLENBQUM7SUFFSCxNQUFhLFVBQVU7UUF1QnRCLFlBQVksTUFBa0I7WUFwQnRCLG1DQUE4QixHQUFrQixJQUFJLENBQUM7WUFJckQsZ0JBQVcsR0FBa0IsSUFBSSxDQUFDO1lBR2xDLGVBQVUsR0FBRyxLQUFLLENBQUM7WUFDbkIsZUFBVSxHQUFxQixJQUFJLENBQUM7WUFJcEMsVUFBSyxHQUFxQixJQUFJLENBQUM7WUFDL0IsbUJBQWMsR0FBVyxDQUFDLENBQUM7WUFRbEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7WUFDckIsSUFBSSxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUMsV0FBVyxJQUFJLEVBQUUsQ0FBQztZQUM1QyxJQUFJLENBQUMsY0FBYyxHQUFHLE1BQU0sQ0FBQyxjQUFjLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDakYsSUFBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQztZQUM1QyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO1lBQzlCLElBQUksQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJ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