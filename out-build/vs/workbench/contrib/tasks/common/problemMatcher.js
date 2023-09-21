/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/tasks/common/problemMatcher", "vs/base/common/objects", "vs/base/common/strings", "vs/base/common/assert", "vs/base/common/path", "vs/base/common/types", "vs/base/common/uuid", "vs/base/common/platform", "vs/base/common/severity", "vs/base/common/uri", "vs/base/common/parsers", "vs/base/common/arrays", "vs/base/common/network", "vs/platform/markers/common/markers", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/base/common/event", "vs/platform/files/common/files"], function (require, exports, nls_1, Objects, Strings, Assert, path_1, Types, UUID, Platform, severity_1, uri_1, parsers_1, arrays_1, network_1, markers_1, extensionsRegistry_1, event_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$0F = exports.$9F = exports.$8F = exports.Schemas = exports.$7F = exports.$6F = exports.Config = exports.$5F = exports.$4F = exports.$3F = exports.ApplyToKind = exports.ProblemLocationKind = exports.FileLocationKind = void 0;
    var FileLocationKind;
    (function (FileLocationKind) {
        FileLocationKind[FileLocationKind["Default"] = 0] = "Default";
        FileLocationKind[FileLocationKind["Relative"] = 1] = "Relative";
        FileLocationKind[FileLocationKind["Absolute"] = 2] = "Absolute";
        FileLocationKind[FileLocationKind["AutoDetect"] = 3] = "AutoDetect";
        FileLocationKind[FileLocationKind["Search"] = 4] = "Search";
    })(FileLocationKind || (exports.FileLocationKind = FileLocationKind = {}));
    (function (FileLocationKind) {
        function fromString(value) {
            value = value.toLowerCase();
            if (value === 'absolute') {
                return FileLocationKind.Absolute;
            }
            else if (value === 'relative') {
                return FileLocationKind.Relative;
            }
            else if (value === 'autodetect') {
                return FileLocationKind.AutoDetect;
            }
            else if (value === 'search') {
                return FileLocationKind.Search;
            }
            else {
                return undefined;
            }
        }
        FileLocationKind.fromString = fromString;
    })(FileLocationKind || (exports.FileLocationKind = FileLocationKind = {}));
    var ProblemLocationKind;
    (function (ProblemLocationKind) {
        ProblemLocationKind[ProblemLocationKind["File"] = 0] = "File";
        ProblemLocationKind[ProblemLocationKind["Location"] = 1] = "Location";
    })(ProblemLocationKind || (exports.ProblemLocationKind = ProblemLocationKind = {}));
    (function (ProblemLocationKind) {
        function fromString(value) {
            value = value.toLowerCase();
            if (value === 'file') {
                return ProblemLocationKind.File;
            }
            else if (value === 'location') {
                return ProblemLocationKind.Location;
            }
            else {
                return undefined;
            }
        }
        ProblemLocationKind.fromString = fromString;
    })(ProblemLocationKind || (exports.ProblemLocationKind = ProblemLocationKind = {}));
    var ApplyToKind;
    (function (ApplyToKind) {
        ApplyToKind[ApplyToKind["allDocuments"] = 0] = "allDocuments";
        ApplyToKind[ApplyToKind["openDocuments"] = 1] = "openDocuments";
        ApplyToKind[ApplyToKind["closedDocuments"] = 2] = "closedDocuments";
    })(ApplyToKind || (exports.ApplyToKind = ApplyToKind = {}));
    (function (ApplyToKind) {
        function fromString(value) {
            value = value.toLowerCase();
            if (value === 'alldocuments') {
                return ApplyToKind.allDocuments;
            }
            else if (value === 'opendocuments') {
                return ApplyToKind.openDocuments;
            }
            else if (value === 'closeddocuments') {
                return ApplyToKind.closedDocuments;
            }
            else {
                return undefined;
            }
        }
        ApplyToKind.fromString = fromString;
    })(ApplyToKind || (exports.ApplyToKind = ApplyToKind = {}));
    function $3F(value) {
        return value && Types.$jf(value.name) ? true : false;
    }
    exports.$3F = $3F;
    async function $4F(filename, matcher, fileService) {
        const kind = matcher.fileLocation;
        let fullPath;
        if (kind === FileLocationKind.Absolute) {
            fullPath = filename;
        }
        else if ((kind === FileLocationKind.Relative) && matcher.filePrefix && Types.$jf(matcher.filePrefix)) {
            fullPath = (0, path_1.$9d)(matcher.filePrefix, filename);
        }
        else if (kind === FileLocationKind.AutoDetect) {
            const matcherClone = Objects.$Vm(matcher);
            matcherClone.fileLocation = FileLocationKind.Relative;
            if (fileService) {
                const relative = await $4F(filename, matcherClone);
                let stat = undefined;
                try {
                    stat = await fileService.stat(relative);
                }
                catch (ex) {
                    // Do nothing, we just need to catch file resolution errors.
                }
                if (stat) {
                    return relative;
                }
            }
            matcherClone.fileLocation = FileLocationKind.Absolute;
            return $4F(filename, matcherClone);
        }
        else if (kind === FileLocationKind.Search && fileService) {
            const fsProvider = fileService.getProvider(network_1.Schemas.file);
            if (fsProvider) {
                const uri = await searchForFileLocation(filename, fsProvider, matcher.filePrefix);
                fullPath = uri?.path;
            }
            if (!fullPath) {
                const absoluteMatcher = Objects.$Vm(matcher);
                absoluteMatcher.fileLocation = FileLocationKind.Absolute;
                return $4F(filename, absoluteMatcher);
            }
        }
        if (fullPath === undefined) {
            throw new Error('FileLocationKind is not actionable. Does the matcher have a filePrefix? This should never happen.');
        }
        fullPath = (0, path_1.$7d)(fullPath);
        fullPath = fullPath.replace(/\\/g, '/');
        if (fullPath[0] !== '/') {
            fullPath = '/' + fullPath;
        }
        if (matcher.uriProvider !== undefined) {
            return matcher.uriProvider(fullPath);
        }
        else {
            return uri_1.URI.file(fullPath);
        }
    }
    exports.$4F = $4F;
    async function searchForFileLocation(filename, fsProvider, args) {
        const exclusions = new Set((0, arrays_1.$1b)(args.exclude || []).map(x => uri_1.URI.file(x).path));
        async function search(dir) {
            if (exclusions.has(dir.path)) {
                return undefined;
            }
            const entries = await fsProvider.readdir(dir);
            const subdirs = [];
            for (const [name, fileType] of entries) {
                if (fileType === files_1.FileType.Directory) {
                    subdirs.push(uri_1.URI.joinPath(dir, name));
                    continue;
                }
                if (fileType === files_1.FileType.File) {
                    /**
                     * Note that sometimes the given `filename` could be a relative
                     * path (not just the "name.ext" part). For example, the
                     * `filename` can be "/subdir/name.ext". So, just comparing
                     * `name` as `filename` is not sufficient. The workaround here
                     * is to form the URI with `dir` and `name` and check if it ends
                     * with the given `filename`.
                     */
                    const fullUri = uri_1.URI.joinPath(dir, name);
                    if (fullUri.path.endsWith(filename)) {
                        return fullUri;
                    }
                }
            }
            for (const subdir of subdirs) {
                const result = await search(subdir);
                if (result) {
                    return result;
                }
            }
            return undefined;
        }
        for (const dir of (0, arrays_1.$1b)(args.include || [])) {
            const hit = await search(uri_1.URI.file(dir));
            if (hit) {
                return hit;
            }
        }
        return undefined;
    }
    function $5F(matcher, fileService) {
        const pattern = matcher.pattern;
        if (Array.isArray(pattern)) {
            return new MultiLineMatcher(matcher, fileService);
        }
        else {
            return new SingleLineMatcher(matcher, fileService);
        }
    }
    exports.$5F = $5F;
    const endOfLine = Platform.OS === 1 /* Platform.OperatingSystem.Windows */ ? '\r\n' : '\n';
    class AbstractLineMatcher {
        constructor(matcher, fileService) {
            this.a = matcher;
            this.b = fileService;
        }
        handle(lines, start = 0) {
            return { match: null, continue: false };
        }
        next(line) {
            return null;
        }
        c(data, pattern, matches) {
            if (data) {
                this.e(data, 'file', pattern, matches, true);
                this.d(data, 'message', pattern, matches, true);
                this.e(data, 'code', pattern, matches, true);
                this.e(data, 'severity', pattern, matches, true);
                this.e(data, 'location', pattern, matches, true);
                this.e(data, 'line', pattern, matches);
                this.e(data, 'character', pattern, matches);
                this.e(data, 'endLine', pattern, matches);
                this.e(data, 'endCharacter', pattern, matches);
                return true;
            }
            else {
                return false;
            }
        }
        d(data, property, pattern, matches, trim = false) {
            const patternProperty = pattern[property];
            if (Types.$qf(data[property])) {
                this.e(data, property, pattern, matches, trim);
            }
            else if (!Types.$qf(patternProperty) && patternProperty < matches.length) {
                let value = matches[patternProperty];
                if (trim) {
                    value = Strings.$te(value);
                }
                data[property] += endOfLine + value;
            }
        }
        e(data, property, pattern, matches, trim = false) {
            const patternAtProperty = pattern[property];
            if (Types.$qf(data[property]) && !Types.$qf(patternAtProperty) && patternAtProperty < matches.length) {
                let value = matches[patternAtProperty];
                if (value !== undefined) {
                    if (trim) {
                        value = Strings.$te(value);
                    }
                    data[property] = value;
                }
            }
        }
        f(data) {
            try {
                const location = this.h(data);
                if (data.file && location && data.message) {
                    const marker = {
                        severity: this.l(data),
                        startLineNumber: location.startLineNumber,
                        startColumn: location.startCharacter,
                        endLineNumber: location.endLineNumber,
                        endColumn: location.endCharacter,
                        message: data.message
                    };
                    if (data.code !== undefined) {
                        marker.code = data.code;
                    }
                    if (this.a.source !== undefined) {
                        marker.source = this.a.source;
                    }
                    return {
                        description: this.a,
                        resource: this.g(data.file),
                        marker: marker
                    };
                }
            }
            catch (err) {
                console.error(`Failed to convert problem data into match: ${JSON.stringify(data)}`);
            }
            return undefined;
        }
        g(filename) {
            return $4F(filename, this.a, this.b);
        }
        h(data) {
            if (data.kind === ProblemLocationKind.File) {
                return this.k(0, 0, 0, 0);
            }
            if (data.location) {
                return this.j(data.location);
            }
            if (!data.line) {
                return null;
            }
            const startLine = parseInt(data.line);
            const startColumn = data.character ? parseInt(data.character) : undefined;
            const endLine = data.endLine ? parseInt(data.endLine) : undefined;
            const endColumn = data.endCharacter ? parseInt(data.endCharacter) : undefined;
            return this.k(startLine, startColumn, endLine, endColumn);
        }
        j(value) {
            if (!value || !value.match(/(\d+|\d+,\d+|\d+,\d+,\d+,\d+)/)) {
                return null;
            }
            const parts = value.split(',');
            const startLine = parseInt(parts[0]);
            const startColumn = parts.length > 1 ? parseInt(parts[1]) : undefined;
            if (parts.length > 3) {
                return this.k(startLine, startColumn, parseInt(parts[2]), parseInt(parts[3]));
            }
            else {
                return this.k(startLine, startColumn, undefined, undefined);
            }
        }
        k(startLine, startColumn, endLine, endColumn) {
            if (startColumn !== undefined && endColumn !== undefined) {
                return { startLineNumber: startLine, startCharacter: startColumn, endLineNumber: endLine || startLine, endCharacter: endColumn };
            }
            if (startColumn !== undefined) {
                return { startLineNumber: startLine, startCharacter: startColumn, endLineNumber: startLine, endCharacter: startColumn };
            }
            return { startLineNumber: startLine, startCharacter: 1, endLineNumber: startLine, endCharacter: 2 ** 31 - 1 }; // See https://github.com/microsoft/vscode/issues/80288#issuecomment-650636442 for discussion
        }
        l(data) {
            let result = null;
            if (data.severity) {
                const value = data.severity;
                if (value) {
                    result = severity_1.default.fromValue(value);
                    if (result === severity_1.default.Ignore) {
                        if (value === 'E') {
                            result = severity_1.default.Error;
                        }
                        else if (value === 'W') {
                            result = severity_1.default.Warning;
                        }
                        else if (value === 'I') {
                            result = severity_1.default.Info;
                        }
                        else if (Strings.$Me(value, 'hint')) {
                            result = severity_1.default.Info;
                        }
                        else if (Strings.$Me(value, 'note')) {
                            result = severity_1.default.Info;
                        }
                    }
                }
            }
            if (result === null || result === severity_1.default.Ignore) {
                result = this.a.severity || severity_1.default.Error;
            }
            return markers_1.MarkerSeverity.fromSeverity(result);
        }
    }
    class SingleLineMatcher extends AbstractLineMatcher {
        constructor(matcher, fileService) {
            super(matcher, fileService);
            this.m = matcher.pattern;
        }
        get matchLength() {
            return 1;
        }
        handle(lines, start = 0) {
            Assert.ok(lines.length - start === 1);
            const data = Object.create(null);
            if (this.m.kind !== undefined) {
                data.kind = this.m.kind;
            }
            const matches = this.m.regexp.exec(lines[start]);
            if (matches) {
                this.c(data, this.m, matches);
                const match = this.f(data);
                if (match) {
                    return { match: match, continue: false };
                }
            }
            return { match: null, continue: false };
        }
        next(line) {
            return null;
        }
    }
    class MultiLineMatcher extends AbstractLineMatcher {
        constructor(matcher, fileService) {
            super(matcher, fileService);
            this.m = matcher.pattern;
        }
        get matchLength() {
            return this.m.length;
        }
        handle(lines, start = 0) {
            Assert.ok(lines.length - start === this.m.length);
            this.n = Object.create(null);
            let data = this.n;
            data.kind = this.m[0].kind;
            for (let i = 0; i < this.m.length; i++) {
                const pattern = this.m[i];
                const matches = pattern.regexp.exec(lines[i + start]);
                if (!matches) {
                    return { match: null, continue: false };
                }
                else {
                    // Only the last pattern can loop
                    if (pattern.loop && i === this.m.length - 1) {
                        data = Objects.$Vm(data);
                    }
                    this.c(data, pattern, matches);
                }
            }
            const loop = !!this.m[this.m.length - 1].loop;
            if (!loop) {
                this.n = undefined;
            }
            const markerMatch = data ? this.f(data) : null;
            return { match: markerMatch ? markerMatch : null, continue: loop };
        }
        next(line) {
            const pattern = this.m[this.m.length - 1];
            Assert.ok(pattern.loop === true && this.n !== null);
            const matches = pattern.regexp.exec(line);
            if (!matches) {
                this.n = undefined;
                return null;
            }
            const data = Objects.$Vm(this.n);
            let problemMatch;
            if (this.c(data, pattern, matches)) {
                problemMatch = this.f(data);
            }
            return problemMatch ? problemMatch : null;
        }
    }
    var Config;
    (function (Config) {
        let CheckedProblemPattern;
        (function (CheckedProblemPattern) {
            function is(value) {
                const candidate = value;
                return candidate && Types.$jf(candidate.regexp);
            }
            CheckedProblemPattern.is = is;
        })(CheckedProblemPattern = Config.CheckedProblemPattern || (Config.CheckedProblemPattern = {}));
        let NamedProblemPattern;
        (function (NamedProblemPattern) {
            function is(value) {
                const candidate = value;
                return candidate && Types.$jf(candidate.name);
            }
            NamedProblemPattern.is = is;
        })(NamedProblemPattern = Config.NamedProblemPattern || (Config.NamedProblemPattern = {}));
        let NamedCheckedProblemPattern;
        (function (NamedCheckedProblemPattern) {
            function is(value) {
                const candidate = value;
                return candidate && NamedProblemPattern.is(candidate) && Types.$jf(candidate.regexp);
            }
            NamedCheckedProblemPattern.is = is;
        })(NamedCheckedProblemPattern = Config.NamedCheckedProblemPattern || (Config.NamedCheckedProblemPattern = {}));
        let MultiLineProblemPattern;
        (function (MultiLineProblemPattern) {
            function is(value) {
                return value && Array.isArray(value);
            }
            MultiLineProblemPattern.is = is;
        })(MultiLineProblemPattern = Config.MultiLineProblemPattern || (Config.MultiLineProblemPattern = {}));
        let MultiLineCheckedProblemPattern;
        (function (MultiLineCheckedProblemPattern) {
            function is(value) {
                if (!MultiLineProblemPattern.is(value)) {
                    return false;
                }
                for (const element of value) {
                    if (!Config.CheckedProblemPattern.is(element)) {
                        return false;
                    }
                }
                return true;
            }
            MultiLineCheckedProblemPattern.is = is;
        })(MultiLineCheckedProblemPattern = Config.MultiLineCheckedProblemPattern || (Config.MultiLineCheckedProblemPattern = {}));
        let NamedMultiLineCheckedProblemPattern;
        (function (NamedMultiLineCheckedProblemPattern) {
            function is(value) {
                const candidate = value;
                return candidate && Types.$jf(candidate.name) && Array.isArray(candidate.patterns) && MultiLineCheckedProblemPattern.is(candidate.patterns);
            }
            NamedMultiLineCheckedProblemPattern.is = is;
        })(NamedMultiLineCheckedProblemPattern = Config.NamedMultiLineCheckedProblemPattern || (Config.NamedMultiLineCheckedProblemPattern = {}));
        function isNamedProblemMatcher(value) {
            return Types.$jf(value.name);
        }
        Config.isNamedProblemMatcher = isNamedProblemMatcher;
    })(Config || (exports.Config = Config = {}));
    class $6F extends parsers_1.$zF {
        constructor(logger) {
            super(logger);
        }
        parse(value) {
            if (Config.NamedMultiLineCheckedProblemPattern.is(value)) {
                return this.c(value);
            }
            else if (Config.MultiLineCheckedProblemPattern.is(value)) {
                return this.d(value);
            }
            else if (Config.NamedCheckedProblemPattern.is(value)) {
                const result = this.b(value);
                result.name = value.name;
                return result;
            }
            else if (Config.CheckedProblemPattern.is(value)) {
                return this.b(value);
            }
            else {
                this.error((0, nls_1.localize)(0, null));
                return null;
            }
        }
        b(value) {
            const result = this.e(value, true);
            if (result === undefined) {
                return null;
            }
            else if (result.kind === undefined) {
                result.kind = ProblemLocationKind.Location;
            }
            return this.f([result]) ? result : null;
        }
        c(value) {
            const validPatterns = this.d(value.patterns);
            if (!validPatterns) {
                return null;
            }
            const result = {
                name: value.name,
                label: value.label ? value.label : value.name,
                patterns: validPatterns
            };
            return result;
        }
        d(values) {
            const result = [];
            for (let i = 0; i < values.length; i++) {
                const pattern = this.e(values[i], false);
                if (pattern === undefined) {
                    return null;
                }
                if (i < values.length - 1) {
                    if (!Types.$qf(pattern.loop) && pattern.loop) {
                        pattern.loop = false;
                        this.error((0, nls_1.localize)(1, null));
                    }
                }
                result.push(pattern);
            }
            if (result[0].kind === undefined) {
                result[0].kind = ProblemLocationKind.Location;
            }
            return this.f(result) ? result : null;
        }
        e(value, setDefaults) {
            const regexp = this.g(value.regexp);
            if (regexp === undefined) {
                return undefined;
            }
            let result = { regexp };
            if (value.kind) {
                result.kind = ProblemLocationKind.fromString(value.kind);
            }
            function copyProperty(result, source, resultKey, sourceKey) {
                const value = source[sourceKey];
                if (typeof value === 'number') {
                    result[resultKey] = value;
                }
            }
            copyProperty(result, value, 'file', 'file');
            copyProperty(result, value, 'location', 'location');
            copyProperty(result, value, 'line', 'line');
            copyProperty(result, value, 'character', 'column');
            copyProperty(result, value, 'endLine', 'endLine');
            copyProperty(result, value, 'endCharacter', 'endColumn');
            copyProperty(result, value, 'severity', 'severity');
            copyProperty(result, value, 'code', 'code');
            copyProperty(result, value, 'message', 'message');
            if (value.loop === true || value.loop === false) {
                result.loop = value.loop;
            }
            if (setDefaults) {
                if (result.location || result.kind === ProblemLocationKind.File) {
                    const defaultValue = {
                        file: 1,
                        message: 0
                    };
                    result = Objects.$Ym(result, defaultValue, false);
                }
                else {
                    const defaultValue = {
                        file: 1,
                        line: 2,
                        character: 3,
                        message: 0
                    };
                    result = Objects.$Ym(result, defaultValue, false);
                }
            }
            return result;
        }
        f(values) {
            let file = false, message = false, location = false, line = false;
            const locationKind = (values[0].kind === undefined) ? ProblemLocationKind.Location : values[0].kind;
            values.forEach((pattern, i) => {
                if (i !== 0 && pattern.kind) {
                    this.error((0, nls_1.localize)(2, null));
                }
                file = file || !Types.$qf(pattern.file);
                message = message || !Types.$qf(pattern.message);
                location = location || !Types.$qf(pattern.location);
                line = line || !Types.$qf(pattern.line);
            });
            if (!(file && message)) {
                this.error((0, nls_1.localize)(3, null));
                return false;
            }
            if (locationKind === ProblemLocationKind.Location && !(location || line)) {
                this.error((0, nls_1.localize)(4, null));
                return false;
            }
            return true;
        }
        g(value) {
            let result;
            try {
                result = new RegExp(value);
            }
            catch (err) {
                this.error((0, nls_1.localize)(5, null, value));
            }
            return result;
        }
    }
    exports.$6F = $6F;
    class $7F {
        constructor(a, b = new parsers_1.$yF()) {
            this.a = a;
            this.b = b;
        }
        info(message) {
            this.b.state = 1 /* ValidationState.Info */;
            this.a.info(message);
        }
        warn(message) {
            this.b.state = 2 /* ValidationState.Warning */;
            this.a.warn(message);
        }
        error(message) {
            this.b.state = 3 /* ValidationState.Error */;
            this.a.error(message);
        }
        fatal(message) {
            this.b.state = 4 /* ValidationState.Fatal */;
            this.a.error(message);
        }
        get status() {
            return this.b;
        }
    }
    exports.$7F = $7F;
    var Schemas;
    (function (Schemas) {
        Schemas.ProblemPattern = {
            default: {
                regexp: '^([^\\\\s].*)\\\\((\\\\d+,\\\\d+)\\\\):\\\\s*(.*)$',
                file: 1,
                location: 2,
                message: 3
            },
            type: 'object',
            additionalProperties: false,
            properties: {
                regexp: {
                    type: 'string',
                    description: (0, nls_1.localize)(6, null)
                },
                kind: {
                    type: 'string',
                    description: (0, nls_1.localize)(7, null)
                },
                file: {
                    type: 'integer',
                    description: (0, nls_1.localize)(8, null)
                },
                location: {
                    type: 'integer',
                    description: (0, nls_1.localize)(9, null)
                },
                line: {
                    type: 'integer',
                    description: (0, nls_1.localize)(10, null)
                },
                column: {
                    type: 'integer',
                    description: (0, nls_1.localize)(11, null)
                },
                endLine: {
                    type: 'integer',
                    description: (0, nls_1.localize)(12, null)
                },
                endColumn: {
                    type: 'integer',
                    description: (0, nls_1.localize)(13, null)
                },
                severity: {
                    type: 'integer',
                    description: (0, nls_1.localize)(14, null)
                },
                code: {
                    type: 'integer',
                    description: (0, nls_1.localize)(15, null)
                },
                message: {
                    type: 'integer',
                    description: (0, nls_1.localize)(16, null)
                },
                loop: {
                    type: 'boolean',
                    description: (0, nls_1.localize)(17, null)
                }
            }
        };
        Schemas.NamedProblemPattern = Objects.$Vm(Schemas.ProblemPattern);
        Schemas.NamedProblemPattern.properties = Objects.$Vm(Schemas.NamedProblemPattern.properties) || {};
        Schemas.NamedProblemPattern.properties['name'] = {
            type: 'string',
            description: (0, nls_1.localize)(18, null)
        };
        Schemas.MultiLineProblemPattern = {
            type: 'array',
            items: Schemas.ProblemPattern
        };
        Schemas.NamedMultiLineProblemPattern = {
            type: 'object',
            additionalProperties: false,
            properties: {
                name: {
                    type: 'string',
                    description: (0, nls_1.localize)(19, null)
                },
                patterns: {
                    type: 'array',
                    description: (0, nls_1.localize)(20, null),
                    items: Schemas.ProblemPattern
                }
            }
        };
    })(Schemas || (exports.Schemas = Schemas = {}));
    const problemPatternExtPoint = extensionsRegistry_1.$2F.registerExtensionPoint({
        extensionPoint: 'problemPatterns',
        jsonSchema: {
            description: (0, nls_1.localize)(21, null),
            type: 'array',
            items: {
                anyOf: [
                    Schemas.NamedProblemPattern,
                    Schemas.NamedMultiLineProblemPattern
                ]
            }
        }
    });
    class ProblemPatternRegistryImpl {
        constructor() {
            this.a = Object.create(null);
            this.c();
            this.b = new Promise((resolve, reject) => {
                problemPatternExtPoint.setHandler((extensions, delta) => {
                    // We get all statically know extension during startup in one batch
                    try {
                        delta.removed.forEach(extension => {
                            const problemPatterns = extension.value;
                            for (const pattern of problemPatterns) {
                                if (this.a[pattern.name]) {
                                    delete this.a[pattern.name];
                                }
                            }
                        });
                        delta.added.forEach(extension => {
                            const problemPatterns = extension.value;
                            const parser = new $6F(new $7F(extension.collector));
                            for (const pattern of problemPatterns) {
                                if (Config.NamedMultiLineCheckedProblemPattern.is(pattern)) {
                                    const result = parser.parse(pattern);
                                    if (parser.problemReporter.status.state < 3 /* ValidationState.Error */) {
                                        this.add(result.name, result.patterns);
                                    }
                                    else {
                                        extension.collector.error((0, nls_1.localize)(22, null));
                                        extension.collector.error(JSON.stringify(pattern, undefined, 4));
                                    }
                                }
                                else if (Config.NamedProblemPattern.is(pattern)) {
                                    const result = parser.parse(pattern);
                                    if (parser.problemReporter.status.state < 3 /* ValidationState.Error */) {
                                        this.add(pattern.name, result);
                                    }
                                    else {
                                        extension.collector.error((0, nls_1.localize)(23, null));
                                        extension.collector.error(JSON.stringify(pattern, undefined, 4));
                                    }
                                }
                                parser.reset();
                            }
                        });
                    }
                    catch (error) {
                        // Do nothing
                    }
                    resolve(undefined);
                });
            });
        }
        onReady() {
            return this.b;
        }
        add(key, value) {
            this.a[key] = value;
        }
        get(key) {
            return this.a[key];
        }
        c() {
            this.add('msCompile', {
                regexp: /^(?:\s*\d+>)?(\S.*)\((\d+|\d+,\d+|\d+,\d+,\d+,\d+)\)\s*:\s+((?:fatal +)?error|warning|info)\s+(\w+\d+)\s*:\s*(.*)$/,
                kind: ProblemLocationKind.Location,
                file: 1,
                location: 2,
                severity: 3,
                code: 4,
                message: 5
            });
            this.add('gulp-tsc', {
                regexp: /^([^\s].*)\((\d+|\d+,\d+|\d+,\d+,\d+,\d+)\):\s+(\d+)\s+(.*)$/,
                kind: ProblemLocationKind.Location,
                file: 1,
                location: 2,
                code: 3,
                message: 4
            });
            this.add('cpp', {
                regexp: /^(\S.*)\((\d+|\d+,\d+|\d+,\d+,\d+,\d+)\):\s+(error|warning|info)\s+(C\d+)\s*:\s*(.*)$/,
                kind: ProblemLocationKind.Location,
                file: 1,
                location: 2,
                severity: 3,
                code: 4,
                message: 5
            });
            this.add('csc', {
                regexp: /^(\S.*)\((\d+|\d+,\d+|\d+,\d+,\d+,\d+)\):\s+(error|warning|info)\s+(CS\d+)\s*:\s*(.*)$/,
                kind: ProblemLocationKind.Location,
                file: 1,
                location: 2,
                severity: 3,
                code: 4,
                message: 5
            });
            this.add('vb', {
                regexp: /^(\S.*)\((\d+|\d+,\d+|\d+,\d+,\d+,\d+)\):\s+(error|warning|info)\s+(BC\d+)\s*:\s*(.*)$/,
                kind: ProblemLocationKind.Location,
                file: 1,
                location: 2,
                severity: 3,
                code: 4,
                message: 5
            });
            this.add('lessCompile', {
                regexp: /^\s*(.*) in file (.*) line no. (\d+)$/,
                kind: ProblemLocationKind.Location,
                message: 1,
                file: 2,
                line: 3
            });
            this.add('jshint', {
                regexp: /^(.*):\s+line\s+(\d+),\s+col\s+(\d+),\s(.+?)(?:\s+\((\w)(\d+)\))?$/,
                kind: ProblemLocationKind.Location,
                file: 1,
                line: 2,
                character: 3,
                message: 4,
                severity: 5,
                code: 6
            });
            this.add('jshint-stylish', [
                {
                    regexp: /^(.+)$/,
                    kind: ProblemLocationKind.Location,
                    file: 1
                },
                {
                    regexp: /^\s+line\s+(\d+)\s+col\s+(\d+)\s+(.+?)(?:\s+\((\w)(\d+)\))?$/,
                    line: 1,
                    character: 2,
                    message: 3,
                    severity: 4,
                    code: 5,
                    loop: true
                }
            ]);
            this.add('eslint-compact', {
                regexp: /^(.+):\sline\s(\d+),\scol\s(\d+),\s(Error|Warning|Info)\s-\s(.+)\s\((.+)\)$/,
                file: 1,
                kind: ProblemLocationKind.Location,
                line: 2,
                character: 3,
                severity: 4,
                message: 5,
                code: 6
            });
            this.add('eslint-stylish', [
                {
                    regexp: /^((?:[a-zA-Z]:)*[./\\]+.*?)$/,
                    kind: ProblemLocationKind.Location,
                    file: 1
                },
                {
                    regexp: /^\s+(\d+):(\d+)\s+(error|warning|info)\s+(.+?)(?:\s\s+(.*))?$/,
                    line: 1,
                    character: 2,
                    severity: 3,
                    message: 4,
                    code: 5,
                    loop: true
                }
            ]);
            this.add('go', {
                regexp: /^([^:]*: )?((.:)?[^:]*):(\d+)(:(\d+))?: (.*)$/,
                kind: ProblemLocationKind.Location,
                file: 2,
                line: 4,
                character: 6,
                message: 7
            });
        }
    }
    exports.$8F = new ProblemPatternRegistryImpl();
    class $9F extends parsers_1.$zF {
        constructor(logger) {
            super(logger);
        }
        parse(json) {
            const result = this.c(json);
            if (!this.b(json, result)) {
                return undefined;
            }
            this.e(json, result);
            return result;
        }
        b(externalProblemMatcher, problemMatcher) {
            if (!problemMatcher) {
                this.error((0, nls_1.localize)(24, null, JSON.stringify(externalProblemMatcher, null, 4)));
                return false;
            }
            if (!problemMatcher.pattern) {
                this.error((0, nls_1.localize)(25, null, JSON.stringify(externalProblemMatcher, null, 4)));
                return false;
            }
            if (!problemMatcher.owner) {
                this.error((0, nls_1.localize)(26, null, JSON.stringify(externalProblemMatcher, null, 4)));
                return false;
            }
            if (Types.$qf(problemMatcher.fileLocation)) {
                this.error((0, nls_1.localize)(27, null, JSON.stringify(externalProblemMatcher, null, 4)));
                return false;
            }
            return true;
        }
        c(description) {
            let result = null;
            const owner = Types.$jf(description.owner) ? description.owner : UUID.$4f();
            const source = Types.$jf(description.source) ? description.source : undefined;
            let applyTo = Types.$jf(description.applyTo) ? ApplyToKind.fromString(description.applyTo) : ApplyToKind.allDocuments;
            if (!applyTo) {
                applyTo = ApplyToKind.allDocuments;
            }
            let fileLocation = undefined;
            let filePrefix = undefined;
            let kind;
            if (Types.$qf(description.fileLocation)) {
                fileLocation = FileLocationKind.Relative;
                filePrefix = '${workspaceFolder}';
            }
            else if (Types.$jf(description.fileLocation)) {
                kind = FileLocationKind.fromString(description.fileLocation);
                if (kind) {
                    fileLocation = kind;
                    if ((kind === FileLocationKind.Relative) || (kind === FileLocationKind.AutoDetect)) {
                        filePrefix = '${workspaceFolder}';
                    }
                    else if (kind === FileLocationKind.Search) {
                        filePrefix = { include: ['${workspaceFolder}'] };
                    }
                }
            }
            else if (Types.$kf(description.fileLocation)) {
                const values = description.fileLocation;
                if (values.length > 0) {
                    kind = FileLocationKind.fromString(values[0]);
                    if (values.length === 1 && kind === FileLocationKind.Absolute) {
                        fileLocation = kind;
                    }
                    else if (values.length === 2 && (kind === FileLocationKind.Relative || kind === FileLocationKind.AutoDetect) && values[1]) {
                        fileLocation = kind;
                        filePrefix = values[1];
                    }
                }
            }
            else if (Array.isArray(description.fileLocation)) {
                const kind = FileLocationKind.fromString(description.fileLocation[0]);
                if (kind === FileLocationKind.Search) {
                    fileLocation = FileLocationKind.Search;
                    filePrefix = description.fileLocation[1] ?? { include: ['${workspaceFolder}'] };
                }
            }
            const pattern = description.pattern ? this.d(description.pattern) : undefined;
            let severity = description.severity ? severity_1.default.fromValue(description.severity) : undefined;
            if (severity === severity_1.default.Ignore) {
                this.info((0, nls_1.localize)(28, null, description.severity));
                severity = severity_1.default.Error;
            }
            if (Types.$jf(description.base)) {
                const variableName = description.base;
                if (variableName.length > 1 && variableName[0] === '$') {
                    const base = exports.$0F.get(variableName.substring(1));
                    if (base) {
                        result = Objects.$Vm(base);
                        if (description.owner !== undefined && owner !== undefined) {
                            result.owner = owner;
                        }
                        if (description.source !== undefined && source !== undefined) {
                            result.source = source;
                        }
                        if (description.fileLocation !== undefined && fileLocation !== undefined) {
                            result.fileLocation = fileLocation;
                            result.filePrefix = filePrefix;
                        }
                        if (description.pattern !== undefined && pattern !== undefined && pattern !== null) {
                            result.pattern = pattern;
                        }
                        if (description.severity !== undefined && severity !== undefined) {
                            result.severity = severity;
                        }
                        if (description.applyTo !== undefined && applyTo !== undefined) {
                            result.applyTo = applyTo;
                        }
                    }
                }
            }
            else if (fileLocation && pattern) {
                result = {
                    owner: owner,
                    applyTo: applyTo,
                    fileLocation: fileLocation,
                    pattern: pattern,
                };
                if (source) {
                    result.source = source;
                }
                if (filePrefix) {
                    result.filePrefix = filePrefix;
                }
                if (severity) {
                    result.severity = severity;
                }
            }
            if (Config.isNamedProblemMatcher(description)) {
                result.name = description.name;
                result.label = Types.$jf(description.label) ? description.label : description.name;
            }
            return result;
        }
        d(value) {
            if (Types.$jf(value)) {
                const variableName = value;
                if (variableName.length > 1 && variableName[0] === '$') {
                    const result = exports.$8F.get(variableName.substring(1));
                    if (!result) {
                        this.error((0, nls_1.localize)(29, null, variableName));
                    }
                    return result;
                }
                else {
                    if (variableName.length === 0) {
                        this.error((0, nls_1.localize)(30, null));
                    }
                    else {
                        this.error((0, nls_1.localize)(31, null, variableName));
                    }
                }
            }
            else if (value) {
                const problemPatternParser = new $6F(this.problemReporter);
                if (Array.isArray(value)) {
                    return problemPatternParser.parse(value);
                }
                else {
                    return problemPatternParser.parse(value);
                }
            }
            return null;
        }
        e(external, internal) {
            const oldBegins = this.g(external.watchedTaskBeginsRegExp);
            const oldEnds = this.g(external.watchedTaskEndsRegExp);
            if (oldBegins && oldEnds) {
                internal.watching = {
                    activeOnStart: false,
                    beginsPattern: { regexp: oldBegins },
                    endsPattern: { regexp: oldEnds }
                };
                return;
            }
            const backgroundMonitor = external.background || external.watching;
            if (Types.$sf(backgroundMonitor)) {
                return;
            }
            const begins = this.f(backgroundMonitor.beginsPattern);
            const ends = this.f(backgroundMonitor.endsPattern);
            if (begins && ends) {
                internal.watching = {
                    activeOnStart: Types.$pf(backgroundMonitor.activeOnStart) ? backgroundMonitor.activeOnStart : false,
                    beginsPattern: begins,
                    endsPattern: ends
                };
                return;
            }
            if (begins || ends) {
                this.error((0, nls_1.localize)(32, null));
            }
        }
        f(external) {
            if (Types.$sf(external)) {
                return null;
            }
            let regexp;
            let file;
            if (Types.$jf(external)) {
                regexp = this.g(external);
            }
            else {
                regexp = this.g(external.regexp);
                if (Types.$nf(external.file)) {
                    file = external.file;
                }
            }
            if (!regexp) {
                return null;
            }
            return file ? { regexp, file } : { regexp, file: 1 };
        }
        g(value) {
            let result = null;
            if (!value) {
                return result;
            }
            try {
                result = new RegExp(value);
            }
            catch (err) {
                this.error((0, nls_1.localize)(33, null, value));
            }
            return result;
        }
    }
    exports.$9F = $9F;
    (function (Schemas) {
        Schemas.WatchingPattern = {
            type: 'object',
            additionalProperties: false,
            properties: {
                regexp: {
                    type: 'string',
                    description: (0, nls_1.localize)(34, null)
                },
                file: {
                    type: 'integer',
                    description: (0, nls_1.localize)(35, null)
                },
            }
        };
        Schemas.PatternType = {
            anyOf: [
                {
                    type: 'string',
                    description: (0, nls_1.localize)(36, null)
                },
                Schemas.ProblemPattern,
                Schemas.MultiLineProblemPattern
            ],
            description: (0, nls_1.localize)(37, null)
        };
        Schemas.ProblemMatcher = {
            type: 'object',
            additionalProperties: false,
            properties: {
                base: {
                    type: 'string',
                    description: (0, nls_1.localize)(38, null)
                },
                owner: {
                    type: 'string',
                    description: (0, nls_1.localize)(39, null)
                },
                source: {
                    type: 'string',
                    description: (0, nls_1.localize)(40, null)
                },
                severity: {
                    type: 'string',
                    enum: ['error', 'warning', 'info'],
                    description: (0, nls_1.localize)(41, null)
                },
                applyTo: {
                    type: 'string',
                    enum: ['allDocuments', 'openDocuments', 'closedDocuments'],
                    description: (0, nls_1.localize)(42, null)
                },
                pattern: Schemas.PatternType,
                fileLocation: {
                    oneOf: [
                        {
                            type: 'string',
                            enum: ['absolute', 'relative', 'autoDetect', 'search']
                        },
                        {
                            type: 'array',
                            prefixItems: [
                                {
                                    type: 'string',
                                    enum: ['absolute', 'relative', 'autoDetect', 'search']
                                },
                            ],
                            minItems: 1,
                            maxItems: 1,
                            additionalItems: false
                        },
                        {
                            type: 'array',
                            prefixItems: [
                                { type: 'string', enum: ['relative', 'autoDetect'] },
                                { type: 'string' },
                            ],
                            minItems: 2,
                            maxItems: 2,
                            additionalItems: false,
                            examples: [
                                ['relative', '${workspaceFolder}'],
                                ['autoDetect', '${workspaceFolder}'],
                            ]
                        },
                        {
                            type: 'array',
                            prefixItems: [
                                { type: 'string', enum: ['search'] },
                                {
                                    type: 'object',
                                    properties: {
                                        'include': {
                                            oneOf: [
                                                { type: 'string' },
                                                { type: 'array', items: { type: 'string' } }
                                            ]
                                        },
                                        'exclude': {
                                            oneOf: [
                                                { type: 'string' },
                                                { type: 'array', items: { type: 'string' } }
                                            ]
                                        },
                                    },
                                    required: ['include']
                                }
                            ],
                            minItems: 2,
                            maxItems: 2,
                            additionalItems: false,
                            examples: [
                                ['search', { 'include': ['${workspaceFolder}'] }],
                                ['search', { 'include': ['${workspaceFolder}'], 'exclude': [] }]
                            ],
                        }
                    ],
                    description: (0, nls_1.localize)(43, null)
                },
                background: {
                    type: 'object',
                    additionalProperties: false,
                    description: (0, nls_1.localize)(44, null),
                    properties: {
                        activeOnStart: {
                            type: 'boolean',
                            description: (0, nls_1.localize)(45, null)
                        },
                        beginsPattern: {
                            oneOf: [
                                {
                                    type: 'string'
                                },
                                Schemas.WatchingPattern
                            ],
                            description: (0, nls_1.localize)(46, null)
                        },
                        endsPattern: {
                            oneOf: [
                                {
                                    type: 'string'
                                },
                                Schemas.WatchingPattern
                            ],
                            description: (0, nls_1.localize)(47, null)
                        }
                    }
                },
                watching: {
                    type: 'object',
                    additionalProperties: false,
                    deprecationMessage: (0, nls_1.localize)(48, null),
                    description: (0, nls_1.localize)(49, null),
                    properties: {
                        activeOnStart: {
                            type: 'boolean',
                            description: (0, nls_1.localize)(50, null)
                        },
                        beginsPattern: {
                            oneOf: [
                                {
                                    type: 'string'
                                },
                                Schemas.WatchingPattern
                            ],
                            description: (0, nls_1.localize)(51, null)
                        },
                        endsPattern: {
                            oneOf: [
                                {
                                    type: 'string'
                                },
                                Schemas.WatchingPattern
                            ],
                            description: (0, nls_1.localize)(52, null)
                        }
                    }
                }
            }
        };
        Schemas.LegacyProblemMatcher = Objects.$Vm(Schemas.ProblemMatcher);
        Schemas.LegacyProblemMatcher.properties = Objects.$Vm(Schemas.LegacyProblemMatcher.properties) || {};
        Schemas.LegacyProblemMatcher.properties['watchedTaskBeginsRegExp'] = {
            type: 'string',
            deprecationMessage: (0, nls_1.localize)(53, null),
            description: (0, nls_1.localize)(54, null)
        };
        Schemas.LegacyProblemMatcher.properties['watchedTaskEndsRegExp'] = {
            type: 'string',
            deprecationMessage: (0, nls_1.localize)(55, null),
            description: (0, nls_1.localize)(56, null)
        };
        Schemas.NamedProblemMatcher = Objects.$Vm(Schemas.ProblemMatcher);
        Schemas.NamedProblemMatcher.properties = Objects.$Vm(Schemas.NamedProblemMatcher.properties) || {};
        Schemas.NamedProblemMatcher.properties.name = {
            type: 'string',
            description: (0, nls_1.localize)(57, null)
        };
        Schemas.NamedProblemMatcher.properties.label = {
            type: 'string',
            description: (0, nls_1.localize)(58, null)
        };
    })(Schemas || (exports.Schemas = Schemas = {}));
    const problemMatchersExtPoint = extensionsRegistry_1.$2F.registerExtensionPoint({
        extensionPoint: 'problemMatchers',
        deps: [problemPatternExtPoint],
        jsonSchema: {
            description: (0, nls_1.localize)(59, null),
            type: 'array',
            items: Schemas.NamedProblemMatcher
        }
    });
    class ProblemMatcherRegistryImpl {
        constructor() {
            this.c = new event_1.$fd();
            this.onMatcherChanged = this.c.event;
            this.a = Object.create(null);
            this.d();
            this.b = new Promise((resolve, reject) => {
                problemMatchersExtPoint.setHandler((extensions, delta) => {
                    try {
                        delta.removed.forEach(extension => {
                            const problemMatchers = extension.value;
                            for (const matcher of problemMatchers) {
                                if (this.a[matcher.name]) {
                                    delete this.a[matcher.name];
                                }
                            }
                        });
                        delta.added.forEach(extension => {
                            const problemMatchers = extension.value;
                            const parser = new $9F(new $7F(extension.collector));
                            for (const matcher of problemMatchers) {
                                const result = parser.parse(matcher);
                                if (result && $3F(result)) {
                                    this.add(result);
                                }
                            }
                        });
                        if ((delta.removed.length > 0) || (delta.added.length > 0)) {
                            this.c.fire();
                        }
                    }
                    catch (error) {
                    }
                    const matcher = this.get('tsc-watch');
                    if (matcher) {
                        matcher.tscWatch = true;
                    }
                    resolve(undefined);
                });
            });
        }
        onReady() {
            exports.$8F.onReady();
            return this.b;
        }
        add(matcher) {
            this.a[matcher.name] = matcher;
        }
        get(name) {
            return this.a[name];
        }
        keys() {
            return Object.keys(this.a);
        }
        d() {
            this.add({
                name: 'msCompile',
                label: (0, nls_1.localize)(60, null),
                owner: 'msCompile',
                source: 'cpp',
                applyTo: ApplyToKind.allDocuments,
                fileLocation: FileLocationKind.Absolute,
                pattern: exports.$8F.get('msCompile')
            });
            this.add({
                name: 'lessCompile',
                label: (0, nls_1.localize)(61, null),
                deprecated: true,
                owner: 'lessCompile',
                source: 'less',
                applyTo: ApplyToKind.allDocuments,
                fileLocation: FileLocationKind.Absolute,
                pattern: exports.$8F.get('lessCompile'),
                severity: severity_1.default.Error
            });
            this.add({
                name: 'gulp-tsc',
                label: (0, nls_1.localize)(62, null),
                owner: 'typescript',
                source: 'ts',
                applyTo: ApplyToKind.closedDocuments,
                fileLocation: FileLocationKind.Relative,
                filePrefix: '${workspaceFolder}',
                pattern: exports.$8F.get('gulp-tsc')
            });
            this.add({
                name: 'jshint',
                label: (0, nls_1.localize)(63, null),
                owner: 'jshint',
                source: 'jshint',
                applyTo: ApplyToKind.allDocuments,
                fileLocation: FileLocationKind.Absolute,
                pattern: exports.$8F.get('jshint')
            });
            this.add({
                name: 'jshint-stylish',
                label: (0, nls_1.localize)(64, null),
                owner: 'jshint',
                source: 'jshint',
                applyTo: ApplyToKind.allDocuments,
                fileLocation: FileLocationKind.Absolute,
                pattern: exports.$8F.get('jshint-stylish')
            });
            this.add({
                name: 'eslint-compact',
                label: (0, nls_1.localize)(65, null),
                owner: 'eslint',
                source: 'eslint',
                applyTo: ApplyToKind.allDocuments,
                fileLocation: FileLocationKind.Absolute,
                filePrefix: '${workspaceFolder}',
                pattern: exports.$8F.get('eslint-compact')
            });
            this.add({
                name: 'eslint-stylish',
                label: (0, nls_1.localize)(66, null),
                owner: 'eslint',
                source: 'eslint',
                applyTo: ApplyToKind.allDocuments,
                fileLocation: FileLocationKind.Absolute,
                pattern: exports.$8F.get('eslint-stylish')
            });
            this.add({
                name: 'go',
                label: (0, nls_1.localize)(67, null),
                owner: 'go',
                source: 'go',
                applyTo: ApplyToKind.allDocuments,
                fileLocation: FileLocationKind.Relative,
                filePrefix: '${workspaceFolder}',
                pattern: exports.$8F.get('go')
            });
        }
    }
    exports.$0F = new ProblemMatcherRegistryImpl();
});
//# sourceMappingURL=problemMatcher.js.map