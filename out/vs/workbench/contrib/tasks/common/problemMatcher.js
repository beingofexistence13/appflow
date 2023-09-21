/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/objects", "vs/base/common/strings", "vs/base/common/assert", "vs/base/common/path", "vs/base/common/types", "vs/base/common/uuid", "vs/base/common/platform", "vs/base/common/severity", "vs/base/common/uri", "vs/base/common/parsers", "vs/base/common/arrays", "vs/base/common/network", "vs/platform/markers/common/markers", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/base/common/event", "vs/platform/files/common/files"], function (require, exports, nls_1, Objects, Strings, Assert, path_1, Types, UUID, Platform, severity_1, uri_1, parsers_1, arrays_1, network_1, markers_1, extensionsRegistry_1, event_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProblemMatcherRegistry = exports.ProblemMatcherParser = exports.ProblemPatternRegistry = exports.Schemas = exports.ExtensionRegistryReporter = exports.ProblemPatternParser = exports.Config = exports.createLineMatcher = exports.getResource = exports.isNamedProblemMatcher = exports.ApplyToKind = exports.ProblemLocationKind = exports.FileLocationKind = void 0;
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
    function isNamedProblemMatcher(value) {
        return value && Types.isString(value.name) ? true : false;
    }
    exports.isNamedProblemMatcher = isNamedProblemMatcher;
    async function getResource(filename, matcher, fileService) {
        const kind = matcher.fileLocation;
        let fullPath;
        if (kind === FileLocationKind.Absolute) {
            fullPath = filename;
        }
        else if ((kind === FileLocationKind.Relative) && matcher.filePrefix && Types.isString(matcher.filePrefix)) {
            fullPath = (0, path_1.join)(matcher.filePrefix, filename);
        }
        else if (kind === FileLocationKind.AutoDetect) {
            const matcherClone = Objects.deepClone(matcher);
            matcherClone.fileLocation = FileLocationKind.Relative;
            if (fileService) {
                const relative = await getResource(filename, matcherClone);
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
            return getResource(filename, matcherClone);
        }
        else if (kind === FileLocationKind.Search && fileService) {
            const fsProvider = fileService.getProvider(network_1.Schemas.file);
            if (fsProvider) {
                const uri = await searchForFileLocation(filename, fsProvider, matcher.filePrefix);
                fullPath = uri?.path;
            }
            if (!fullPath) {
                const absoluteMatcher = Objects.deepClone(matcher);
                absoluteMatcher.fileLocation = FileLocationKind.Absolute;
                return getResource(filename, absoluteMatcher);
            }
        }
        if (fullPath === undefined) {
            throw new Error('FileLocationKind is not actionable. Does the matcher have a filePrefix? This should never happen.');
        }
        fullPath = (0, path_1.normalize)(fullPath);
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
    exports.getResource = getResource;
    async function searchForFileLocation(filename, fsProvider, args) {
        const exclusions = new Set((0, arrays_1.asArray)(args.exclude || []).map(x => uri_1.URI.file(x).path));
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
        for (const dir of (0, arrays_1.asArray)(args.include || [])) {
            const hit = await search(uri_1.URI.file(dir));
            if (hit) {
                return hit;
            }
        }
        return undefined;
    }
    function createLineMatcher(matcher, fileService) {
        const pattern = matcher.pattern;
        if (Array.isArray(pattern)) {
            return new MultiLineMatcher(matcher, fileService);
        }
        else {
            return new SingleLineMatcher(matcher, fileService);
        }
    }
    exports.createLineMatcher = createLineMatcher;
    const endOfLine = Platform.OS === 1 /* Platform.OperatingSystem.Windows */ ? '\r\n' : '\n';
    class AbstractLineMatcher {
        constructor(matcher, fileService) {
            this.matcher = matcher;
            this.fileService = fileService;
        }
        handle(lines, start = 0) {
            return { match: null, continue: false };
        }
        next(line) {
            return null;
        }
        fillProblemData(data, pattern, matches) {
            if (data) {
                this.fillProperty(data, 'file', pattern, matches, true);
                this.appendProperty(data, 'message', pattern, matches, true);
                this.fillProperty(data, 'code', pattern, matches, true);
                this.fillProperty(data, 'severity', pattern, matches, true);
                this.fillProperty(data, 'location', pattern, matches, true);
                this.fillProperty(data, 'line', pattern, matches);
                this.fillProperty(data, 'character', pattern, matches);
                this.fillProperty(data, 'endLine', pattern, matches);
                this.fillProperty(data, 'endCharacter', pattern, matches);
                return true;
            }
            else {
                return false;
            }
        }
        appendProperty(data, property, pattern, matches, trim = false) {
            const patternProperty = pattern[property];
            if (Types.isUndefined(data[property])) {
                this.fillProperty(data, property, pattern, matches, trim);
            }
            else if (!Types.isUndefined(patternProperty) && patternProperty < matches.length) {
                let value = matches[patternProperty];
                if (trim) {
                    value = Strings.trim(value);
                }
                data[property] += endOfLine + value;
            }
        }
        fillProperty(data, property, pattern, matches, trim = false) {
            const patternAtProperty = pattern[property];
            if (Types.isUndefined(data[property]) && !Types.isUndefined(patternAtProperty) && patternAtProperty < matches.length) {
                let value = matches[patternAtProperty];
                if (value !== undefined) {
                    if (trim) {
                        value = Strings.trim(value);
                    }
                    data[property] = value;
                }
            }
        }
        getMarkerMatch(data) {
            try {
                const location = this.getLocation(data);
                if (data.file && location && data.message) {
                    const marker = {
                        severity: this.getSeverity(data),
                        startLineNumber: location.startLineNumber,
                        startColumn: location.startCharacter,
                        endLineNumber: location.endLineNumber,
                        endColumn: location.endCharacter,
                        message: data.message
                    };
                    if (data.code !== undefined) {
                        marker.code = data.code;
                    }
                    if (this.matcher.source !== undefined) {
                        marker.source = this.matcher.source;
                    }
                    return {
                        description: this.matcher,
                        resource: this.getResource(data.file),
                        marker: marker
                    };
                }
            }
            catch (err) {
                console.error(`Failed to convert problem data into match: ${JSON.stringify(data)}`);
            }
            return undefined;
        }
        getResource(filename) {
            return getResource(filename, this.matcher, this.fileService);
        }
        getLocation(data) {
            if (data.kind === ProblemLocationKind.File) {
                return this.createLocation(0, 0, 0, 0);
            }
            if (data.location) {
                return this.parseLocationInfo(data.location);
            }
            if (!data.line) {
                return null;
            }
            const startLine = parseInt(data.line);
            const startColumn = data.character ? parseInt(data.character) : undefined;
            const endLine = data.endLine ? parseInt(data.endLine) : undefined;
            const endColumn = data.endCharacter ? parseInt(data.endCharacter) : undefined;
            return this.createLocation(startLine, startColumn, endLine, endColumn);
        }
        parseLocationInfo(value) {
            if (!value || !value.match(/(\d+|\d+,\d+|\d+,\d+,\d+,\d+)/)) {
                return null;
            }
            const parts = value.split(',');
            const startLine = parseInt(parts[0]);
            const startColumn = parts.length > 1 ? parseInt(parts[1]) : undefined;
            if (parts.length > 3) {
                return this.createLocation(startLine, startColumn, parseInt(parts[2]), parseInt(parts[3]));
            }
            else {
                return this.createLocation(startLine, startColumn, undefined, undefined);
            }
        }
        createLocation(startLine, startColumn, endLine, endColumn) {
            if (startColumn !== undefined && endColumn !== undefined) {
                return { startLineNumber: startLine, startCharacter: startColumn, endLineNumber: endLine || startLine, endCharacter: endColumn };
            }
            if (startColumn !== undefined) {
                return { startLineNumber: startLine, startCharacter: startColumn, endLineNumber: startLine, endCharacter: startColumn };
            }
            return { startLineNumber: startLine, startCharacter: 1, endLineNumber: startLine, endCharacter: 2 ** 31 - 1 }; // See https://github.com/microsoft/vscode/issues/80288#issuecomment-650636442 for discussion
        }
        getSeverity(data) {
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
                        else if (Strings.equalsIgnoreCase(value, 'hint')) {
                            result = severity_1.default.Info;
                        }
                        else if (Strings.equalsIgnoreCase(value, 'note')) {
                            result = severity_1.default.Info;
                        }
                    }
                }
            }
            if (result === null || result === severity_1.default.Ignore) {
                result = this.matcher.severity || severity_1.default.Error;
            }
            return markers_1.MarkerSeverity.fromSeverity(result);
        }
    }
    class SingleLineMatcher extends AbstractLineMatcher {
        constructor(matcher, fileService) {
            super(matcher, fileService);
            this.pattern = matcher.pattern;
        }
        get matchLength() {
            return 1;
        }
        handle(lines, start = 0) {
            Assert.ok(lines.length - start === 1);
            const data = Object.create(null);
            if (this.pattern.kind !== undefined) {
                data.kind = this.pattern.kind;
            }
            const matches = this.pattern.regexp.exec(lines[start]);
            if (matches) {
                this.fillProblemData(data, this.pattern, matches);
                const match = this.getMarkerMatch(data);
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
            this.patterns = matcher.pattern;
        }
        get matchLength() {
            return this.patterns.length;
        }
        handle(lines, start = 0) {
            Assert.ok(lines.length - start === this.patterns.length);
            this.data = Object.create(null);
            let data = this.data;
            data.kind = this.patterns[0].kind;
            for (let i = 0; i < this.patterns.length; i++) {
                const pattern = this.patterns[i];
                const matches = pattern.regexp.exec(lines[i + start]);
                if (!matches) {
                    return { match: null, continue: false };
                }
                else {
                    // Only the last pattern can loop
                    if (pattern.loop && i === this.patterns.length - 1) {
                        data = Objects.deepClone(data);
                    }
                    this.fillProblemData(data, pattern, matches);
                }
            }
            const loop = !!this.patterns[this.patterns.length - 1].loop;
            if (!loop) {
                this.data = undefined;
            }
            const markerMatch = data ? this.getMarkerMatch(data) : null;
            return { match: markerMatch ? markerMatch : null, continue: loop };
        }
        next(line) {
            const pattern = this.patterns[this.patterns.length - 1];
            Assert.ok(pattern.loop === true && this.data !== null);
            const matches = pattern.regexp.exec(line);
            if (!matches) {
                this.data = undefined;
                return null;
            }
            const data = Objects.deepClone(this.data);
            let problemMatch;
            if (this.fillProblemData(data, pattern, matches)) {
                problemMatch = this.getMarkerMatch(data);
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
                return candidate && Types.isString(candidate.regexp);
            }
            CheckedProblemPattern.is = is;
        })(CheckedProblemPattern = Config.CheckedProblemPattern || (Config.CheckedProblemPattern = {}));
        let NamedProblemPattern;
        (function (NamedProblemPattern) {
            function is(value) {
                const candidate = value;
                return candidate && Types.isString(candidate.name);
            }
            NamedProblemPattern.is = is;
        })(NamedProblemPattern = Config.NamedProblemPattern || (Config.NamedProblemPattern = {}));
        let NamedCheckedProblemPattern;
        (function (NamedCheckedProblemPattern) {
            function is(value) {
                const candidate = value;
                return candidate && NamedProblemPattern.is(candidate) && Types.isString(candidate.regexp);
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
                return candidate && Types.isString(candidate.name) && Array.isArray(candidate.patterns) && MultiLineCheckedProblemPattern.is(candidate.patterns);
            }
            NamedMultiLineCheckedProblemPattern.is = is;
        })(NamedMultiLineCheckedProblemPattern = Config.NamedMultiLineCheckedProblemPattern || (Config.NamedMultiLineCheckedProblemPattern = {}));
        function isNamedProblemMatcher(value) {
            return Types.isString(value.name);
        }
        Config.isNamedProblemMatcher = isNamedProblemMatcher;
    })(Config || (exports.Config = Config = {}));
    class ProblemPatternParser extends parsers_1.Parser {
        constructor(logger) {
            super(logger);
        }
        parse(value) {
            if (Config.NamedMultiLineCheckedProblemPattern.is(value)) {
                return this.createNamedMultiLineProblemPattern(value);
            }
            else if (Config.MultiLineCheckedProblemPattern.is(value)) {
                return this.createMultiLineProblemPattern(value);
            }
            else if (Config.NamedCheckedProblemPattern.is(value)) {
                const result = this.createSingleProblemPattern(value);
                result.name = value.name;
                return result;
            }
            else if (Config.CheckedProblemPattern.is(value)) {
                return this.createSingleProblemPattern(value);
            }
            else {
                this.error((0, nls_1.localize)('ProblemPatternParser.problemPattern.missingRegExp', 'The problem pattern is missing a regular expression.'));
                return null;
            }
        }
        createSingleProblemPattern(value) {
            const result = this.doCreateSingleProblemPattern(value, true);
            if (result === undefined) {
                return null;
            }
            else if (result.kind === undefined) {
                result.kind = ProblemLocationKind.Location;
            }
            return this.validateProblemPattern([result]) ? result : null;
        }
        createNamedMultiLineProblemPattern(value) {
            const validPatterns = this.createMultiLineProblemPattern(value.patterns);
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
        createMultiLineProblemPattern(values) {
            const result = [];
            for (let i = 0; i < values.length; i++) {
                const pattern = this.doCreateSingleProblemPattern(values[i], false);
                if (pattern === undefined) {
                    return null;
                }
                if (i < values.length - 1) {
                    if (!Types.isUndefined(pattern.loop) && pattern.loop) {
                        pattern.loop = false;
                        this.error((0, nls_1.localize)('ProblemPatternParser.loopProperty.notLast', 'The loop property is only supported on the last line matcher.'));
                    }
                }
                result.push(pattern);
            }
            if (result[0].kind === undefined) {
                result[0].kind = ProblemLocationKind.Location;
            }
            return this.validateProblemPattern(result) ? result : null;
        }
        doCreateSingleProblemPattern(value, setDefaults) {
            const regexp = this.createRegularExpression(value.regexp);
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
                    result = Objects.mixin(result, defaultValue, false);
                }
                else {
                    const defaultValue = {
                        file: 1,
                        line: 2,
                        character: 3,
                        message: 0
                    };
                    result = Objects.mixin(result, defaultValue, false);
                }
            }
            return result;
        }
        validateProblemPattern(values) {
            let file = false, message = false, location = false, line = false;
            const locationKind = (values[0].kind === undefined) ? ProblemLocationKind.Location : values[0].kind;
            values.forEach((pattern, i) => {
                if (i !== 0 && pattern.kind) {
                    this.error((0, nls_1.localize)('ProblemPatternParser.problemPattern.kindProperty.notFirst', 'The problem pattern is invalid. The kind property must be provided only in the first element'));
                }
                file = file || !Types.isUndefined(pattern.file);
                message = message || !Types.isUndefined(pattern.message);
                location = location || !Types.isUndefined(pattern.location);
                line = line || !Types.isUndefined(pattern.line);
            });
            if (!(file && message)) {
                this.error((0, nls_1.localize)('ProblemPatternParser.problemPattern.missingProperty', 'The problem pattern is invalid. It must have at least have a file and a message.'));
                return false;
            }
            if (locationKind === ProblemLocationKind.Location && !(location || line)) {
                this.error((0, nls_1.localize)('ProblemPatternParser.problemPattern.missingLocation', 'The problem pattern is invalid. It must either have kind: "file" or have a line or location match group.'));
                return false;
            }
            return true;
        }
        createRegularExpression(value) {
            let result;
            try {
                result = new RegExp(value);
            }
            catch (err) {
                this.error((0, nls_1.localize)('ProblemPatternParser.invalidRegexp', 'Error: The string {0} is not a valid regular expression.\n', value));
            }
            return result;
        }
    }
    exports.ProblemPatternParser = ProblemPatternParser;
    class ExtensionRegistryReporter {
        constructor(_collector, _validationStatus = new parsers_1.ValidationStatus()) {
            this._collector = _collector;
            this._validationStatus = _validationStatus;
        }
        info(message) {
            this._validationStatus.state = 1 /* ValidationState.Info */;
            this._collector.info(message);
        }
        warn(message) {
            this._validationStatus.state = 2 /* ValidationState.Warning */;
            this._collector.warn(message);
        }
        error(message) {
            this._validationStatus.state = 3 /* ValidationState.Error */;
            this._collector.error(message);
        }
        fatal(message) {
            this._validationStatus.state = 4 /* ValidationState.Fatal */;
            this._collector.error(message);
        }
        get status() {
            return this._validationStatus;
        }
    }
    exports.ExtensionRegistryReporter = ExtensionRegistryReporter;
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
                    description: (0, nls_1.localize)('ProblemPatternSchema.regexp', 'The regular expression to find an error, warning or info in the output.')
                },
                kind: {
                    type: 'string',
                    description: (0, nls_1.localize)('ProblemPatternSchema.kind', 'whether the pattern matches a location (file and line) or only a file.')
                },
                file: {
                    type: 'integer',
                    description: (0, nls_1.localize)('ProblemPatternSchema.file', 'The match group index of the filename. If omitted 1 is used.')
                },
                location: {
                    type: 'integer',
                    description: (0, nls_1.localize)('ProblemPatternSchema.location', 'The match group index of the problem\'s location. Valid location patterns are: (line), (line,column) and (startLine,startColumn,endLine,endColumn). If omitted (line,column) is assumed.')
                },
                line: {
                    type: 'integer',
                    description: (0, nls_1.localize)('ProblemPatternSchema.line', 'The match group index of the problem\'s line. Defaults to 2')
                },
                column: {
                    type: 'integer',
                    description: (0, nls_1.localize)('ProblemPatternSchema.column', 'The match group index of the problem\'s line character. Defaults to 3')
                },
                endLine: {
                    type: 'integer',
                    description: (0, nls_1.localize)('ProblemPatternSchema.endLine', 'The match group index of the problem\'s end line. Defaults to undefined')
                },
                endColumn: {
                    type: 'integer',
                    description: (0, nls_1.localize)('ProblemPatternSchema.endColumn', 'The match group index of the problem\'s end line character. Defaults to undefined')
                },
                severity: {
                    type: 'integer',
                    description: (0, nls_1.localize)('ProblemPatternSchema.severity', 'The match group index of the problem\'s severity. Defaults to undefined')
                },
                code: {
                    type: 'integer',
                    description: (0, nls_1.localize)('ProblemPatternSchema.code', 'The match group index of the problem\'s code. Defaults to undefined')
                },
                message: {
                    type: 'integer',
                    description: (0, nls_1.localize)('ProblemPatternSchema.message', 'The match group index of the message. If omitted it defaults to 4 if location is specified. Otherwise it defaults to 5.')
                },
                loop: {
                    type: 'boolean',
                    description: (0, nls_1.localize)('ProblemPatternSchema.loop', 'In a multi line matcher loop indicated whether this pattern is executed in a loop as long as it matches. Can only specified on a last pattern in a multi line pattern.')
                }
            }
        };
        Schemas.NamedProblemPattern = Objects.deepClone(Schemas.ProblemPattern);
        Schemas.NamedProblemPattern.properties = Objects.deepClone(Schemas.NamedProblemPattern.properties) || {};
        Schemas.NamedProblemPattern.properties['name'] = {
            type: 'string',
            description: (0, nls_1.localize)('NamedProblemPatternSchema.name', 'The name of the problem pattern.')
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
                    description: (0, nls_1.localize)('NamedMultiLineProblemPatternSchema.name', 'The name of the problem multi line problem pattern.')
                },
                patterns: {
                    type: 'array',
                    description: (0, nls_1.localize)('NamedMultiLineProblemPatternSchema.patterns', 'The actual patterns.'),
                    items: Schemas.ProblemPattern
                }
            }
        };
    })(Schemas || (exports.Schemas = Schemas = {}));
    const problemPatternExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'problemPatterns',
        jsonSchema: {
            description: (0, nls_1.localize)('ProblemPatternExtPoint', 'Contributes problem patterns'),
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
            this.patterns = Object.create(null);
            this.fillDefaults();
            this.readyPromise = new Promise((resolve, reject) => {
                problemPatternExtPoint.setHandler((extensions, delta) => {
                    // We get all statically know extension during startup in one batch
                    try {
                        delta.removed.forEach(extension => {
                            const problemPatterns = extension.value;
                            for (const pattern of problemPatterns) {
                                if (this.patterns[pattern.name]) {
                                    delete this.patterns[pattern.name];
                                }
                            }
                        });
                        delta.added.forEach(extension => {
                            const problemPatterns = extension.value;
                            const parser = new ProblemPatternParser(new ExtensionRegistryReporter(extension.collector));
                            for (const pattern of problemPatterns) {
                                if (Config.NamedMultiLineCheckedProblemPattern.is(pattern)) {
                                    const result = parser.parse(pattern);
                                    if (parser.problemReporter.status.state < 3 /* ValidationState.Error */) {
                                        this.add(result.name, result.patterns);
                                    }
                                    else {
                                        extension.collector.error((0, nls_1.localize)('ProblemPatternRegistry.error', 'Invalid problem pattern. The pattern will be ignored.'));
                                        extension.collector.error(JSON.stringify(pattern, undefined, 4));
                                    }
                                }
                                else if (Config.NamedProblemPattern.is(pattern)) {
                                    const result = parser.parse(pattern);
                                    if (parser.problemReporter.status.state < 3 /* ValidationState.Error */) {
                                        this.add(pattern.name, result);
                                    }
                                    else {
                                        extension.collector.error((0, nls_1.localize)('ProblemPatternRegistry.error', 'Invalid problem pattern. The pattern will be ignored.'));
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
            return this.readyPromise;
        }
        add(key, value) {
            this.patterns[key] = value;
        }
        get(key) {
            return this.patterns[key];
        }
        fillDefaults() {
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
    exports.ProblemPatternRegistry = new ProblemPatternRegistryImpl();
    class ProblemMatcherParser extends parsers_1.Parser {
        constructor(logger) {
            super(logger);
        }
        parse(json) {
            const result = this.createProblemMatcher(json);
            if (!this.checkProblemMatcherValid(json, result)) {
                return undefined;
            }
            this.addWatchingMatcher(json, result);
            return result;
        }
        checkProblemMatcherValid(externalProblemMatcher, problemMatcher) {
            if (!problemMatcher) {
                this.error((0, nls_1.localize)('ProblemMatcherParser.noProblemMatcher', 'Error: the description can\'t be converted into a problem matcher:\n{0}\n', JSON.stringify(externalProblemMatcher, null, 4)));
                return false;
            }
            if (!problemMatcher.pattern) {
                this.error((0, nls_1.localize)('ProblemMatcherParser.noProblemPattern', 'Error: the description doesn\'t define a valid problem pattern:\n{0}\n', JSON.stringify(externalProblemMatcher, null, 4)));
                return false;
            }
            if (!problemMatcher.owner) {
                this.error((0, nls_1.localize)('ProblemMatcherParser.noOwner', 'Error: the description doesn\'t define an owner:\n{0}\n', JSON.stringify(externalProblemMatcher, null, 4)));
                return false;
            }
            if (Types.isUndefined(problemMatcher.fileLocation)) {
                this.error((0, nls_1.localize)('ProblemMatcherParser.noFileLocation', 'Error: the description doesn\'t define a file location:\n{0}\n', JSON.stringify(externalProblemMatcher, null, 4)));
                return false;
            }
            return true;
        }
        createProblemMatcher(description) {
            let result = null;
            const owner = Types.isString(description.owner) ? description.owner : UUID.generateUuid();
            const source = Types.isString(description.source) ? description.source : undefined;
            let applyTo = Types.isString(description.applyTo) ? ApplyToKind.fromString(description.applyTo) : ApplyToKind.allDocuments;
            if (!applyTo) {
                applyTo = ApplyToKind.allDocuments;
            }
            let fileLocation = undefined;
            let filePrefix = undefined;
            let kind;
            if (Types.isUndefined(description.fileLocation)) {
                fileLocation = FileLocationKind.Relative;
                filePrefix = '${workspaceFolder}';
            }
            else if (Types.isString(description.fileLocation)) {
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
            else if (Types.isStringArray(description.fileLocation)) {
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
            const pattern = description.pattern ? this.createProblemPattern(description.pattern) : undefined;
            let severity = description.severity ? severity_1.default.fromValue(description.severity) : undefined;
            if (severity === severity_1.default.Ignore) {
                this.info((0, nls_1.localize)('ProblemMatcherParser.unknownSeverity', 'Info: unknown severity {0}. Valid values are error, warning and info.\n', description.severity));
                severity = severity_1.default.Error;
            }
            if (Types.isString(description.base)) {
                const variableName = description.base;
                if (variableName.length > 1 && variableName[0] === '$') {
                    const base = exports.ProblemMatcherRegistry.get(variableName.substring(1));
                    if (base) {
                        result = Objects.deepClone(base);
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
                result.label = Types.isString(description.label) ? description.label : description.name;
            }
            return result;
        }
        createProblemPattern(value) {
            if (Types.isString(value)) {
                const variableName = value;
                if (variableName.length > 1 && variableName[0] === '$') {
                    const result = exports.ProblemPatternRegistry.get(variableName.substring(1));
                    if (!result) {
                        this.error((0, nls_1.localize)('ProblemMatcherParser.noDefinedPatter', 'Error: the pattern with the identifier {0} doesn\'t exist.', variableName));
                    }
                    return result;
                }
                else {
                    if (variableName.length === 0) {
                        this.error((0, nls_1.localize)('ProblemMatcherParser.noIdentifier', 'Error: the pattern property refers to an empty identifier.'));
                    }
                    else {
                        this.error((0, nls_1.localize)('ProblemMatcherParser.noValidIdentifier', 'Error: the pattern property {0} is not a valid pattern variable name.', variableName));
                    }
                }
            }
            else if (value) {
                const problemPatternParser = new ProblemPatternParser(this.problemReporter);
                if (Array.isArray(value)) {
                    return problemPatternParser.parse(value);
                }
                else {
                    return problemPatternParser.parse(value);
                }
            }
            return null;
        }
        addWatchingMatcher(external, internal) {
            const oldBegins = this.createRegularExpression(external.watchedTaskBeginsRegExp);
            const oldEnds = this.createRegularExpression(external.watchedTaskEndsRegExp);
            if (oldBegins && oldEnds) {
                internal.watching = {
                    activeOnStart: false,
                    beginsPattern: { regexp: oldBegins },
                    endsPattern: { regexp: oldEnds }
                };
                return;
            }
            const backgroundMonitor = external.background || external.watching;
            if (Types.isUndefinedOrNull(backgroundMonitor)) {
                return;
            }
            const begins = this.createWatchingPattern(backgroundMonitor.beginsPattern);
            const ends = this.createWatchingPattern(backgroundMonitor.endsPattern);
            if (begins && ends) {
                internal.watching = {
                    activeOnStart: Types.isBoolean(backgroundMonitor.activeOnStart) ? backgroundMonitor.activeOnStart : false,
                    beginsPattern: begins,
                    endsPattern: ends
                };
                return;
            }
            if (begins || ends) {
                this.error((0, nls_1.localize)('ProblemMatcherParser.problemPattern.watchingMatcher', 'A problem matcher must define both a begin pattern and an end pattern for watching.'));
            }
        }
        createWatchingPattern(external) {
            if (Types.isUndefinedOrNull(external)) {
                return null;
            }
            let regexp;
            let file;
            if (Types.isString(external)) {
                regexp = this.createRegularExpression(external);
            }
            else {
                regexp = this.createRegularExpression(external.regexp);
                if (Types.isNumber(external.file)) {
                    file = external.file;
                }
            }
            if (!regexp) {
                return null;
            }
            return file ? { regexp, file } : { regexp, file: 1 };
        }
        createRegularExpression(value) {
            let result = null;
            if (!value) {
                return result;
            }
            try {
                result = new RegExp(value);
            }
            catch (err) {
                this.error((0, nls_1.localize)('ProblemMatcherParser.invalidRegexp', 'Error: The string {0} is not a valid regular expression.\n', value));
            }
            return result;
        }
    }
    exports.ProblemMatcherParser = ProblemMatcherParser;
    (function (Schemas) {
        Schemas.WatchingPattern = {
            type: 'object',
            additionalProperties: false,
            properties: {
                regexp: {
                    type: 'string',
                    description: (0, nls_1.localize)('WatchingPatternSchema.regexp', 'The regular expression to detect the begin or end of a background task.')
                },
                file: {
                    type: 'integer',
                    description: (0, nls_1.localize)('WatchingPatternSchema.file', 'The match group index of the filename. Can be omitted.')
                },
            }
        };
        Schemas.PatternType = {
            anyOf: [
                {
                    type: 'string',
                    description: (0, nls_1.localize)('PatternTypeSchema.name', 'The name of a contributed or predefined pattern')
                },
                Schemas.ProblemPattern,
                Schemas.MultiLineProblemPattern
            ],
            description: (0, nls_1.localize)('PatternTypeSchema.description', 'A problem pattern or the name of a contributed or predefined problem pattern. Can be omitted if base is specified.')
        };
        Schemas.ProblemMatcher = {
            type: 'object',
            additionalProperties: false,
            properties: {
                base: {
                    type: 'string',
                    description: (0, nls_1.localize)('ProblemMatcherSchema.base', 'The name of a base problem matcher to use.')
                },
                owner: {
                    type: 'string',
                    description: (0, nls_1.localize)('ProblemMatcherSchema.owner', 'The owner of the problem inside Code. Can be omitted if base is specified. Defaults to \'external\' if omitted and base is not specified.')
                },
                source: {
                    type: 'string',
                    description: (0, nls_1.localize)('ProblemMatcherSchema.source', 'A human-readable string describing the source of this diagnostic, e.g. \'typescript\' or \'super lint\'.')
                },
                severity: {
                    type: 'string',
                    enum: ['error', 'warning', 'info'],
                    description: (0, nls_1.localize)('ProblemMatcherSchema.severity', 'The default severity for captures problems. Is used if the pattern doesn\'t define a match group for severity.')
                },
                applyTo: {
                    type: 'string',
                    enum: ['allDocuments', 'openDocuments', 'closedDocuments'],
                    description: (0, nls_1.localize)('ProblemMatcherSchema.applyTo', 'Controls if a problem reported on a text document is applied only to open, closed or all documents.')
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
                    description: (0, nls_1.localize)('ProblemMatcherSchema.fileLocation', 'Defines how file names reported in a problem pattern should be interpreted. A relative fileLocation may be an array, where the second element of the array is the path of the relative file location. The search fileLocation mode, performs a deep (and, possibly, heavy) file system search within the directories specified by the include/exclude properties of the second element (or the current workspace directory if not specified).')
                },
                background: {
                    type: 'object',
                    additionalProperties: false,
                    description: (0, nls_1.localize)('ProblemMatcherSchema.background', 'Patterns to track the begin and end of a matcher active on a background task.'),
                    properties: {
                        activeOnStart: {
                            type: 'boolean',
                            description: (0, nls_1.localize)('ProblemMatcherSchema.background.activeOnStart', 'If set to true the background monitor is in active mode when the task starts. This is equals of issuing a line that matches the beginsPattern')
                        },
                        beginsPattern: {
                            oneOf: [
                                {
                                    type: 'string'
                                },
                                Schemas.WatchingPattern
                            ],
                            description: (0, nls_1.localize)('ProblemMatcherSchema.background.beginsPattern', 'If matched in the output the start of a background task is signaled.')
                        },
                        endsPattern: {
                            oneOf: [
                                {
                                    type: 'string'
                                },
                                Schemas.WatchingPattern
                            ],
                            description: (0, nls_1.localize)('ProblemMatcherSchema.background.endsPattern', 'If matched in the output the end of a background task is signaled.')
                        }
                    }
                },
                watching: {
                    type: 'object',
                    additionalProperties: false,
                    deprecationMessage: (0, nls_1.localize)('ProblemMatcherSchema.watching.deprecated', 'The watching property is deprecated. Use background instead.'),
                    description: (0, nls_1.localize)('ProblemMatcherSchema.watching', 'Patterns to track the begin and end of a watching matcher.'),
                    properties: {
                        activeOnStart: {
                            type: 'boolean',
                            description: (0, nls_1.localize)('ProblemMatcherSchema.watching.activeOnStart', 'If set to true the watcher is in active mode when the task starts. This is equals of issuing a line that matches the beginPattern')
                        },
                        beginsPattern: {
                            oneOf: [
                                {
                                    type: 'string'
                                },
                                Schemas.WatchingPattern
                            ],
                            description: (0, nls_1.localize)('ProblemMatcherSchema.watching.beginsPattern', 'If matched in the output the start of a watching task is signaled.')
                        },
                        endsPattern: {
                            oneOf: [
                                {
                                    type: 'string'
                                },
                                Schemas.WatchingPattern
                            ],
                            description: (0, nls_1.localize)('ProblemMatcherSchema.watching.endsPattern', 'If matched in the output the end of a watching task is signaled.')
                        }
                    }
                }
            }
        };
        Schemas.LegacyProblemMatcher = Objects.deepClone(Schemas.ProblemMatcher);
        Schemas.LegacyProblemMatcher.properties = Objects.deepClone(Schemas.LegacyProblemMatcher.properties) || {};
        Schemas.LegacyProblemMatcher.properties['watchedTaskBeginsRegExp'] = {
            type: 'string',
            deprecationMessage: (0, nls_1.localize)('LegacyProblemMatcherSchema.watchedBegin.deprecated', 'This property is deprecated. Use the watching property instead.'),
            description: (0, nls_1.localize)('LegacyProblemMatcherSchema.watchedBegin', 'A regular expression signaling that a watched tasks begins executing triggered through file watching.')
        };
        Schemas.LegacyProblemMatcher.properties['watchedTaskEndsRegExp'] = {
            type: 'string',
            deprecationMessage: (0, nls_1.localize)('LegacyProblemMatcherSchema.watchedEnd.deprecated', 'This property is deprecated. Use the watching property instead.'),
            description: (0, nls_1.localize)('LegacyProblemMatcherSchema.watchedEnd', 'A regular expression signaling that a watched tasks ends executing.')
        };
        Schemas.NamedProblemMatcher = Objects.deepClone(Schemas.ProblemMatcher);
        Schemas.NamedProblemMatcher.properties = Objects.deepClone(Schemas.NamedProblemMatcher.properties) || {};
        Schemas.NamedProblemMatcher.properties.name = {
            type: 'string',
            description: (0, nls_1.localize)('NamedProblemMatcherSchema.name', 'The name of the problem matcher used to refer to it.')
        };
        Schemas.NamedProblemMatcher.properties.label = {
            type: 'string',
            description: (0, nls_1.localize)('NamedProblemMatcherSchema.label', 'A human readable label of the problem matcher.')
        };
    })(Schemas || (exports.Schemas = Schemas = {}));
    const problemMatchersExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'problemMatchers',
        deps: [problemPatternExtPoint],
        jsonSchema: {
            description: (0, nls_1.localize)('ProblemMatcherExtPoint', 'Contributes problem matchers'),
            type: 'array',
            items: Schemas.NamedProblemMatcher
        }
    });
    class ProblemMatcherRegistryImpl {
        constructor() {
            this._onMatchersChanged = new event_1.Emitter();
            this.onMatcherChanged = this._onMatchersChanged.event;
            this.matchers = Object.create(null);
            this.fillDefaults();
            this.readyPromise = new Promise((resolve, reject) => {
                problemMatchersExtPoint.setHandler((extensions, delta) => {
                    try {
                        delta.removed.forEach(extension => {
                            const problemMatchers = extension.value;
                            for (const matcher of problemMatchers) {
                                if (this.matchers[matcher.name]) {
                                    delete this.matchers[matcher.name];
                                }
                            }
                        });
                        delta.added.forEach(extension => {
                            const problemMatchers = extension.value;
                            const parser = new ProblemMatcherParser(new ExtensionRegistryReporter(extension.collector));
                            for (const matcher of problemMatchers) {
                                const result = parser.parse(matcher);
                                if (result && isNamedProblemMatcher(result)) {
                                    this.add(result);
                                }
                            }
                        });
                        if ((delta.removed.length > 0) || (delta.added.length > 0)) {
                            this._onMatchersChanged.fire();
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
            exports.ProblemPatternRegistry.onReady();
            return this.readyPromise;
        }
        add(matcher) {
            this.matchers[matcher.name] = matcher;
        }
        get(name) {
            return this.matchers[name];
        }
        keys() {
            return Object.keys(this.matchers);
        }
        fillDefaults() {
            this.add({
                name: 'msCompile',
                label: (0, nls_1.localize)('msCompile', 'Microsoft compiler problems'),
                owner: 'msCompile',
                source: 'cpp',
                applyTo: ApplyToKind.allDocuments,
                fileLocation: FileLocationKind.Absolute,
                pattern: exports.ProblemPatternRegistry.get('msCompile')
            });
            this.add({
                name: 'lessCompile',
                label: (0, nls_1.localize)('lessCompile', 'Less problems'),
                deprecated: true,
                owner: 'lessCompile',
                source: 'less',
                applyTo: ApplyToKind.allDocuments,
                fileLocation: FileLocationKind.Absolute,
                pattern: exports.ProblemPatternRegistry.get('lessCompile'),
                severity: severity_1.default.Error
            });
            this.add({
                name: 'gulp-tsc',
                label: (0, nls_1.localize)('gulp-tsc', 'Gulp TSC Problems'),
                owner: 'typescript',
                source: 'ts',
                applyTo: ApplyToKind.closedDocuments,
                fileLocation: FileLocationKind.Relative,
                filePrefix: '${workspaceFolder}',
                pattern: exports.ProblemPatternRegistry.get('gulp-tsc')
            });
            this.add({
                name: 'jshint',
                label: (0, nls_1.localize)('jshint', 'JSHint problems'),
                owner: 'jshint',
                source: 'jshint',
                applyTo: ApplyToKind.allDocuments,
                fileLocation: FileLocationKind.Absolute,
                pattern: exports.ProblemPatternRegistry.get('jshint')
            });
            this.add({
                name: 'jshint-stylish',
                label: (0, nls_1.localize)('jshint-stylish', 'JSHint stylish problems'),
                owner: 'jshint',
                source: 'jshint',
                applyTo: ApplyToKind.allDocuments,
                fileLocation: FileLocationKind.Absolute,
                pattern: exports.ProblemPatternRegistry.get('jshint-stylish')
            });
            this.add({
                name: 'eslint-compact',
                label: (0, nls_1.localize)('eslint-compact', 'ESLint compact problems'),
                owner: 'eslint',
                source: 'eslint',
                applyTo: ApplyToKind.allDocuments,
                fileLocation: FileLocationKind.Absolute,
                filePrefix: '${workspaceFolder}',
                pattern: exports.ProblemPatternRegistry.get('eslint-compact')
            });
            this.add({
                name: 'eslint-stylish',
                label: (0, nls_1.localize)('eslint-stylish', 'ESLint stylish problems'),
                owner: 'eslint',
                source: 'eslint',
                applyTo: ApplyToKind.allDocuments,
                fileLocation: FileLocationKind.Absolute,
                pattern: exports.ProblemPatternRegistry.get('eslint-stylish')
            });
            this.add({
                name: 'go',
                label: (0, nls_1.localize)('go', 'Go problems'),
                owner: 'go',
                source: 'go',
                applyTo: ApplyToKind.allDocuments,
                fileLocation: FileLocationKind.Relative,
                filePrefix: '${workspaceFolder}',
                pattern: exports.ProblemPatternRegistry.get('go')
            });
        }
    }
    exports.ProblemMatcherRegistry = new ProblemMatcherRegistryImpl();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvYmxlbU1hdGNoZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90YXNrcy9jb21tb24vcHJvYmxlbU1hdGNoZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBd0JoRyxJQUFZLGdCQU1YO0lBTkQsV0FBWSxnQkFBZ0I7UUFDM0IsNkRBQU8sQ0FBQTtRQUNQLCtEQUFRLENBQUE7UUFDUiwrREFBUSxDQUFBO1FBQ1IsbUVBQVUsQ0FBQTtRQUNWLDJEQUFNLENBQUE7SUFDUCxDQUFDLEVBTlcsZ0JBQWdCLGdDQUFoQixnQkFBZ0IsUUFNM0I7SUFFRCxXQUFjLGdCQUFnQjtRQUM3QixTQUFnQixVQUFVLENBQUMsS0FBYTtZQUN2QyxLQUFLLEdBQUcsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQzVCLElBQUksS0FBSyxLQUFLLFVBQVUsRUFBRTtnQkFDekIsT0FBTyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUM7YUFDakM7aUJBQU0sSUFBSSxLQUFLLEtBQUssVUFBVSxFQUFFO2dCQUNoQyxPQUFPLGdCQUFnQixDQUFDLFFBQVEsQ0FBQzthQUNqQztpQkFBTSxJQUFJLEtBQUssS0FBSyxZQUFZLEVBQUU7Z0JBQ2xDLE9BQU8sZ0JBQWdCLENBQUMsVUFBVSxDQUFDO2FBQ25DO2lCQUFNLElBQUksS0FBSyxLQUFLLFFBQVEsRUFBRTtnQkFDOUIsT0FBTyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUM7YUFDL0I7aUJBQU07Z0JBQ04sT0FBTyxTQUFTLENBQUM7YUFDakI7UUFDRixDQUFDO1FBYmUsMkJBQVUsYUFhekIsQ0FBQTtJQUNGLENBQUMsRUFmYSxnQkFBZ0IsZ0NBQWhCLGdCQUFnQixRQWU3QjtJQUVELElBQVksbUJBR1g7SUFIRCxXQUFZLG1CQUFtQjtRQUM5Qiw2REFBSSxDQUFBO1FBQ0oscUVBQVEsQ0FBQTtJQUNULENB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