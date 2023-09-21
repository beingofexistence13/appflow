/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "child_process", "fs", "vs/base/common/path", "string_decoder", "vs/base/common/arrays", "vs/base/common/errorMessage", "vs/base/common/glob", "vs/base/common/normalization", "vs/base/common/extpath", "vs/base/common/platform", "vs/base/common/stopwatch", "vs/base/common/strings", "vs/base/common/types", "vs/base/node/pfs", "vs/workbench/services/search/common/search", "./ripgrepFileSearch", "vs/base/common/fuzzyScorer"], function (require, exports, childProcess, fs, path, string_decoder_1, arrays, errorMessage_1, glob, normalization, extpath_1, platform, stopwatch_1, strings, types, pfs_1, search_1, ripgrepFileSearch_1, fuzzyScorer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ydc = exports.$xdc = void 0;
    const killCmds = new Set();
    process.on('exit', () => {
        killCmds.forEach(cmd => cmd());
    });
    class $xdc {
        constructor(config) {
            this.c = null;
            this.h = null;
            this.l = false;
            this.m = null;
            this.r = null;
            this.s = 0;
            this.a = config;
            this.b = config.filePattern || '';
            this.d = config.includePattern && glob.$rj(config.includePattern);
            this.f = config.maxResults || null;
            this.g = !!config.exists;
            this.v = Object.create(null);
            this.k = 0;
            this.j = false;
            this.o = 0;
            this.p = 0;
            this.q = [];
            if (this.b) {
                this.c = (0, fuzzyScorer_1.$oq)(this.b).normalizedLowercase;
            }
            this.u = config.excludePattern && glob.$rj(config.excludePattern);
            this.t = new Map();
            config.folderQueries.forEach(folderQuery => {
                const folderExcludeExpression = Object.assign({}, folderQuery.excludePattern || {}, this.a.excludePattern || {});
                // Add excludes for other root folders
                const fqPath = folderQuery.folder.fsPath;
                config.folderQueries
                    .map(rootFolderQuery => rootFolderQuery.folder.fsPath)
                    .filter(rootFolder => rootFolder !== fqPath)
                    .forEach(otherRootFolder => {
                    // Exclude nested root folders
                    if ((0, extpath_1.$If)(otherRootFolder, fqPath)) {
                        folderExcludeExpression[path.$$d(fqPath, otherRootFolder)] = true;
                    }
                });
                this.t.set(fqPath, new AbsoluteAndRelativeParsedExpression(folderExcludeExpression, fqPath));
            });
        }
        cancel() {
            this.l = true;
            killCmds.forEach(cmd => cmd());
        }
        walk(folderQueries, extraFiles, onResult, onMessage, done) {
            this.m = stopwatch_1.$bd.create(false);
            // Support that the file pattern is a full path to a file that exists
            if (this.l) {
                return done(null, this.j);
            }
            // For each extra file
            extraFiles.forEach(extraFilePath => {
                const basename = path.$ae(extraFilePath.fsPath);
                if (this.u && this.u(extraFilePath.fsPath, basename)) {
                    return; // excluded
                }
                // File: Check for match on file pattern and include pattern
                this.J(onResult, { relativePath: extraFilePath.fsPath /* no workspace relative path */, searchPath: undefined });
            });
            this.r = stopwatch_1.$bd.create(false);
            // For each root folder
            this.w(folderQueries, (folderQuery, rootFolderDone) => {
                this.x(this.y, this, folderQuery, onResult, onMessage, (err) => {
                    if (err) {
                        const errorMessage = (0, errorMessage_1.$mi)(err);
                        console.error(errorMessage);
                        this.q.push(errorMessage);
                        rootFolderDone(err, undefined);
                    }
                    else {
                        rootFolderDone(null, undefined);
                    }
                });
            }, (errors, _result) => {
                this.m.stop();
                const err = errors ? arrays.$Fb(errors)[0] : null;
                done(err, this.j);
            });
        }
        w(list, fn, callback) {
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
        x(fun, that, ...args) {
            try {
                fun.apply(that, args);
            }
            catch (e) {
                args[args.length - 1](e);
            }
        }
        y(folderQuery, onResult, onMessage, cb) {
            const rootFolder = folderQuery.folder.fsPath;
            const isMac = platform.$j;
            const killCmd = () => cmd && cmd.kill();
            killCmds.add(killCmd);
            let done = (err) => {
                killCmds.delete(killCmd);
                done = () => { };
                cb(err);
            };
            let leftover = '';
            const tree = this.D();
            const ripgrep = (0, ripgrepFileSearch_1.$udc)(this.a, folderQuery, this.a.includePattern, this.t.get(folderQuery.folder.fsPath).expression);
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
            this.s = 0;
            this.z(cmd, 'utf8', onMessage, (err, stdout, last) => {
                if (err) {
                    done(err);
                    return;
                }
                if (this.j) {
                    done();
                    return;
                }
                // Mac: uses NFD unicode form on disk, but we want NFC
                const normalized = leftover + (isMac ? normalization.$hl(stdout || '') : stdout);
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
                this.s += relativeFiles.length;
                if (noSiblingsClauses) {
                    for (const relativePath of relativeFiles) {
                        this.J(onResult, { base: rootFolder, relativePath, searchPath: this.N(folderQuery, relativePath) });
                        if (this.j) {
                            killCmd();
                            break;
                        }
                    }
                    if (last || this.j) {
                        done();
                    }
                    return;
                }
                // TODO: Optimize siblings clauses with ripgrep here.
                this.G(folderQuery, tree, rootFolder, relativeFiles, onResult);
                if (last) {
                    this.H(tree, rootFolder, onResult);
                    done();
                }
            });
        }
        /**
         * Public for testing.
         */
        spawnFindCmd(folderQuery) {
            const excludePattern = this.t.get(folderQuery.folder.fsPath);
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
            this.z(cmd, encoding, () => { }, (err, stdout, last) => {
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
        z(cmd, encoding, onMessage, cb) {
            let onData = (err, stdout, last) => {
                if (err || last) {
                    onData = () => { };
                    this.r?.stop();
                }
                cb(err, stdout, last);
            };
            let gotData = false;
            if (cmd.stdout) {
                // Should be non-null, but #38195
                this.A(cmd.stdout, encoding, onData);
                cmd.stdout.once('data', () => gotData = true);
            }
            else {
                onMessage({ message: 'stdout is null' });
            }
            let stderr;
            if (cmd.stderr) {
                // Should be non-null, but #38195
                stderr = this.B(cmd.stderr);
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
                if (!gotData && (stderrText = this.C(stderr, encoding)) && rgErrorMsgForDisplay(stderrText)) {
                    onData(new Error(`command failed with error code ${code}: ${this.C(stderr, encoding)}`));
                }
                else {
                    if (this.g && code === 0) {
                        this.j = true;
                    }
                    onData(null, '', true);
                }
            });
        }
        A(stream, encoding, cb) {
            const decoder = new string_decoder_1.StringDecoder(encoding);
            stream.on('data', (data) => {
                cb(null, decoder.write(data));
            });
            return decoder;
        }
        B(stream) {
            const buffers = [];
            stream.on('data', (data) => {
                buffers.push(data);
            });
            return buffers;
        }
        C(buffers, encoding) {
            const decoder = new string_decoder_1.StringDecoder(encoding);
            return buffers.map(buffer => decoder.write(buffer)).join('');
        }
        D() {
            const tree = {
                rootEntries: [],
                pathToEntries: Object.create(null)
            };
            tree.pathToEntries['.'] = tree.rootEntries;
            return tree;
        }
        G(folderQuery, { pathToEntries }, base, relativeFiles, onResult) {
            // Support relative paths to files from a root resource (ignores excludes)
            if (relativeFiles.indexOf(this.b) !== -1) {
                this.J(onResult, {
                    base,
                    relativePath: this.b,
                    searchPath: this.N(folderQuery, this.b)
                });
            }
            const add = (relativePath) => {
                const basename = path.$ae(relativePath);
                const dirname = path.$_d(relativePath);
                let entries = pathToEntries[dirname];
                if (!entries) {
                    entries = pathToEntries[dirname] = [];
                    add(dirname);
                }
                entries.push({
                    base,
                    relativePath,
                    basename,
                    searchPath: this.N(folderQuery, relativePath),
                });
            };
            relativeFiles.forEach(add);
        }
        H({ rootEntries, pathToEntries }, rootFolder, onResult) {
            const self = this;
            const excludePattern = this.t.get(rootFolder);
            const filePattern = this.b;
            function matchDirectory(entries) {
                self.o++;
                const hasSibling = (0, search_1.$JI)(() => entries.map(entry => entry.basename));
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
                        self.p++;
                        if (relativePath === filePattern) {
                            continue; // ignore file if its path matches with the file pattern because that is already matched above
                        }
                        self.J(onResult, entry);
                    }
                    if (self.j) {
                        break;
                    }
                }
            }
            matchDirectory(rootEntries);
        }
        getStats() {
            return {
                cmdTime: this.r.elapsed(),
                fileWalkTime: this.m.elapsed(),
                directoriesWalked: this.o,
                filesWalked: this.p,
                cmdResultCount: this.s
            };
        }
        I(folderQuery, relativeParentPath, files, onResult, done) {
            const rootFolder = folderQuery.folder;
            // Execute tasks on each file in parallel to optimize throughput
            const hasSibling = (0, search_1.$JI)(() => files);
            this.w(files, (file, clb) => {
                // Check canceled
                if (this.l || this.j) {
                    return clb(null);
                }
                // Check exclude pattern
                // If the user searches for the exact file name, we adjust the glob matching
                // to ignore filtering by siblings because the user seems to know what they
                // are searching for and we want to include the result in that case anyway
                const currentRelativePath = relativeParentPath ? [relativeParentPath, file].join(path.sep) : file;
                if (this.t.get(folderQuery.folder.fsPath).test(currentRelativePath, file, this.a.filePattern !== file ? hasSibling : undefined)) {
                    return clb(null);
                }
                // Use lstat to detect links
                const currentAbsolutePath = [rootFolder.fsPath, currentRelativePath].join(path.sep);
                fs.lstat(currentAbsolutePath, (error, lstat) => {
                    if (error || this.l || this.j) {
                        return clb(null);
                    }
                    // If the path is a link, we must instead use fs.stat() to find out if the
                    // link is a directory or not because lstat will always return the stat of
                    // the link which is always a file.
                    this.L(currentAbsolutePath, lstat, (error, stat) => {
                        if (error || this.l || this.j) {
                            return clb(null);
                        }
                        // Directory: Follow directories
                        if (stat.isDirectory()) {
                            this.o++;
                            // to really prevent loops with links we need to resolve the real path of them
                            return this.M(currentAbsolutePath, lstat, (error, realpath) => {
                                if (error || this.l || this.j) {
                                    return clb(null);
                                }
                                realpath = realpath || '';
                                if (this.v[realpath]) {
                                    return clb(null); // escape when there are cycles (can happen with symlinks)
                                }
                                this.v[realpath] = true; // remember as walked
                                // Continue walking
                                return pfs_1.Promises.readdir(currentAbsolutePath).then(children => {
                                    if (this.l || this.j) {
                                        return clb(null);
                                    }
                                    this.I(folderQuery, currentRelativePath, children, onResult, err => clb(err || null));
                                }, error => {
                                    clb(null);
                                });
                            });
                        }
                        // File: Check for match on file pattern and include pattern
                        else {
                            this.p++;
                            if (currentRelativePath === this.b) {
                                return clb(null, undefined); // ignore file if its path matches with the file pattern because checkFilePatternRelativeMatch() takes care of those
                            }
                            if (this.h && types.$nf(stat.size) && stat.size > this.h) {
                                return clb(null, undefined); // ignore file if max file size is hit
                            }
                            this.J(onResult, {
                                base: rootFolder.fsPath,
                                relativePath: currentRelativePath,
                                searchPath: this.N(folderQuery, currentRelativePath),
                            });
                        }
                        // Unwind
                        return clb(null, undefined);
                    });
                });
            }, (error) => {
                const filteredErrors = error ? arrays.$Fb(error) : error; // find any error by removing null values first
                return done(filteredErrors && filteredErrors.length > 0 ? filteredErrors[0] : undefined);
            });
        }
        J(onResult, candidate) {
            if (this.K(candidate) && (!this.d || this.d(candidate.relativePath, path.$ae(candidate.relativePath)))) {
                this.k++;
                if (this.g || (this.f && this.k > this.f)) {
                    this.j = true;
                }
                if (!this.j) {
                    onResult(candidate);
                }
            }
        }
        K(candidate) {
            // Check for search pattern
            if (this.b) {
                if (this.b === '*') {
                    return true; // support the all-matching wildcard
                }
                if (this.c) {
                    return (0, search_1.$EI)(candidate, this.c);
                }
            }
            // No patterns means we match all
            return true;
        }
        L(path, lstat, clb) {
            if (lstat.isSymbolicLink()) {
                return fs.stat(path, clb); // stat the target the link points to
            }
            return clb(null, lstat); // not a link, so the stat is already ok for us
        }
        M(path, lstat, clb) {
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
        N(folderQuery, relativePath) {
            if (folderQuery.folderName) {
                return path.$9d(folderQuery.folderName, relativePath);
            }
            return relativePath;
        }
    }
    exports.$xdc = $xdc;
    class $ydc {
        constructor(config) {
            this.a = config.folderQueries;
            this.b = config.extraFileResources || [];
            this.c = new $xdc(config);
        }
        search(onResult, onProgress, done) {
            this.c.walk(this.a, this.b, onResult, onProgress, (err, isLimitHit) => {
                done(err, {
                    limitHit: isLimitHit,
                    stats: this.c.getStats(),
                    messages: [],
                });
            });
        }
        cancel() {
            this.c.cancel();
        }
    }
    exports.$ydc = $ydc;
    /**
     * This class exists to provide one interface on top of two ParsedExpressions, one for absolute expressions and one for relative expressions.
     * The absolute and relative expressions don't "have" to be kept separate, but this keeps us from having to path.join every single
     * file searched, it's only used for a text search with a searchPath
     */
    class AbsoluteAndRelativeParsedExpression {
        constructor(expression, c) {
            this.expression = expression;
            this.c = c;
            this.d(expression);
        }
        /**
         * Split the IExpression into its absolute and relative components, and glob.parse them separately.
         */
        d(expr) {
            let absoluteGlobExpr;
            let relativeGlobExpr;
            Object.keys(expr)
                .filter(key => expr[key])
                .forEach(key => {
                if (path.$8d(key)) {
                    absoluteGlobExpr = absoluteGlobExpr || glob.$mj();
                    absoluteGlobExpr[key] = expr[key];
                }
                else {
                    relativeGlobExpr = relativeGlobExpr || glob.$mj();
                    relativeGlobExpr[key] = expr[key];
                }
            });
            this.a = absoluteGlobExpr && glob.$rj(absoluteGlobExpr, { trimForExclusions: true });
            this.b = relativeGlobExpr && glob.$rj(relativeGlobExpr, { trimForExclusions: true });
        }
        test(_path, basename, hasSibling) {
            return (this.b && this.b(_path, basename, hasSibling)) ||
                (this.a && this.a(path.$9d(this.c, _path), basename, hasSibling));
        }
        getBasenameTerms() {
            const basenameTerms = [];
            if (this.a) {
                basenameTerms.push(...glob.$tj(this.a));
            }
            if (this.b) {
                basenameTerms.push(...glob.$tj(this.b));
            }
            return basenameTerms;
        }
        getPathTerms() {
            const pathTerms = [];
            if (this.a) {
                pathTerms.push(...glob.$uj(this.a));
            }
            if (this.b) {
                pathTerms.push(...glob.$uj(this.b));
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
            return strings.$bf(lines[lines.length - 1].trim());
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
//# sourceMappingURL=fileSearch.js.map