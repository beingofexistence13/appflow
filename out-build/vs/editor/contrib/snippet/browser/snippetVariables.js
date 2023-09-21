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
define(["require", "exports", "vs/base/common/labels", "vs/base/common/path", "vs/base/common/resources", "vs/base/common/strings", "vs/base/common/uuid", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/contrib/snippet/browser/snippetParser", "vs/nls!vs/editor/contrib/snippet/browser/snippetVariables", "vs/platform/workspace/common/workspace"], function (require, exports, labels_1, path, resources_1, strings_1, uuid_1, languageConfigurationRegistry_1, snippetParser_1, nls, workspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$j6 = exports.$i6 = exports.$h6 = exports.$g6 = exports.$f6 = exports.$e6 = exports.$d6 = exports.$c6 = exports.$b6 = void 0;
    exports.$b6 = Object.freeze({
        'CURRENT_YEAR': true,
        'CURRENT_YEAR_SHORT': true,
        'CURRENT_MONTH': true,
        'CURRENT_DATE': true,
        'CURRENT_HOUR': true,
        'CURRENT_MINUTE': true,
        'CURRENT_SECOND': true,
        'CURRENT_DAY_NAME': true,
        'CURRENT_DAY_NAME_SHORT': true,
        'CURRENT_MONTH_NAME': true,
        'CURRENT_MONTH_NAME_SHORT': true,
        'CURRENT_SECONDS_UNIX': true,
        'CURRENT_TIMEZONE_OFFSET': true,
        'SELECTION': true,
        'CLIPBOARD': true,
        'TM_SELECTED_TEXT': true,
        'TM_CURRENT_LINE': true,
        'TM_CURRENT_WORD': true,
        'TM_LINE_INDEX': true,
        'TM_LINE_NUMBER': true,
        'TM_FILENAME': true,
        'TM_FILENAME_BASE': true,
        'TM_DIRECTORY': true,
        'TM_FILEPATH': true,
        'CURSOR_INDEX': true,
        'CURSOR_NUMBER': true,
        'RELATIVE_FILEPATH': true,
        'BLOCK_COMMENT_START': true,
        'BLOCK_COMMENT_END': true,
        'LINE_COMMENT': true,
        'WORKSPACE_NAME': true,
        'WORKSPACE_FOLDER': true,
        'RANDOM': true,
        'RANDOM_HEX': true,
        'UUID': true
    });
    class $c6 {
        constructor(a) {
            this.a = a;
            //
        }
        resolve(variable) {
            for (const delegate of this.a) {
                const value = delegate.resolve(variable);
                if (value !== undefined) {
                    return value;
                }
            }
            return undefined;
        }
    }
    exports.$c6 = $c6;
    class $d6 {
        constructor(a, b, c, d) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            //
        }
        resolve(variable) {
            const { name } = variable;
            if (name === 'SELECTION' || name === 'TM_SELECTED_TEXT') {
                let value = this.a.getValueInRange(this.b) || undefined;
                let isMultiline = this.b.startLineNumber !== this.b.endLineNumber;
                // If there was no selected text, try to get last overtyped text
                if (!value && this.d) {
                    const info = this.d.getLastOvertypedInfo(this.c);
                    if (info) {
                        value = info.value;
                        isMultiline = info.multiline;
                    }
                }
                if (value && isMultiline && variable.snippet) {
                    // Selection is a multiline string which we indentation we now
                    // need to adjust. We compare the indentation of this variable
                    // with the indentation at the editor position and add potential
                    // extra indentation to the value
                    const line = this.a.getLineContent(this.b.startLineNumber);
                    const lineLeadingWhitespace = (0, strings_1.$Ce)(line, 0, this.b.startColumn - 1);
                    let varLeadingWhitespace = lineLeadingWhitespace;
                    variable.snippet.walk(marker => {
                        if (marker === variable) {
                            return false;
                        }
                        if (marker instanceof snippetParser_1.$y5) {
                            varLeadingWhitespace = (0, strings_1.$Ce)((0, strings_1.$Ae)(marker.value).pop());
                        }
                        return true;
                    });
                    const whitespaceCommonLength = (0, strings_1.$Oe)(varLeadingWhitespace, lineLeadingWhitespace);
                    value = value.replace(/(\r\n|\r|\n)(.*)/g, (m, newline, rest) => `${newline}${varLeadingWhitespace.substr(whitespaceCommonLength)}${rest}`);
                }
                return value;
            }
            else if (name === 'TM_CURRENT_LINE') {
                return this.a.getLineContent(this.b.positionLineNumber);
            }
            else if (name === 'TM_CURRENT_WORD') {
                const info = this.a.getWordAtPosition({
                    lineNumber: this.b.positionLineNumber,
                    column: this.b.positionColumn
                });
                return info && info.word || undefined;
            }
            else if (name === 'TM_LINE_INDEX') {
                return String(this.b.positionLineNumber - 1);
            }
            else if (name === 'TM_LINE_NUMBER') {
                return String(this.b.positionLineNumber);
            }
            else if (name === 'CURSOR_INDEX') {
                return String(this.c);
            }
            else if (name === 'CURSOR_NUMBER') {
                return String(this.c + 1);
            }
            return undefined;
        }
    }
    exports.$d6 = $d6;
    class $e6 {
        constructor(a, b) {
            this.a = a;
            this.b = b;
            //
        }
        resolve(variable) {
            const { name } = variable;
            if (name === 'TM_FILENAME') {
                return path.$ae(this.b.uri.fsPath);
            }
            else if (name === 'TM_FILENAME_BASE') {
                const name = path.$ae(this.b.uri.fsPath);
                const idx = name.lastIndexOf('.');
                if (idx <= 0) {
                    return name;
                }
                else {
                    return name.slice(0, idx);
                }
            }
            else if (name === 'TM_DIRECTORY') {
                if (path.$_d(this.b.uri.fsPath) === '.') {
                    return '';
                }
                return this.a.getUriLabel((0, resources_1.$hg)(this.b.uri));
            }
            else if (name === 'TM_FILEPATH') {
                return this.a.getUriLabel(this.b.uri);
            }
            else if (name === 'RELATIVE_FILEPATH') {
                return this.a.getUriLabel(this.b.uri, { relative: true, noPrefix: true });
            }
            return undefined;
        }
    }
    exports.$e6 = $e6;
    class $f6 {
        constructor(a, b, c, d) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            //
        }
        resolve(variable) {
            if (variable.name !== 'CLIPBOARD') {
                return undefined;
            }
            const clipboardText = this.a();
            if (!clipboardText) {
                return undefined;
            }
            // `spread` is assigning each cursor a line of the clipboard
            // text whenever there the line count equals the cursor count
            // and when enabled
            if (this.d) {
                const lines = clipboardText.split(/\r\n|\n|\r/).filter(s => !(0, strings_1.$me)(s));
                if (lines.length === this.c) {
                    return lines[this.b];
                }
            }
            return clipboardText;
        }
    }
    exports.$f6 = $f6;
    let $g6 = class $g6 {
        constructor(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
            //
        }
        resolve(variable) {
            const { name } = variable;
            const langId = this.a.getLanguageIdAtPosition(this.b.selectionStartLineNumber, this.b.selectionStartColumn);
            const config = this.c.getLanguageConfiguration(langId).comments;
            if (!config) {
                return undefined;
            }
            if (name === 'LINE_COMMENT') {
                return config.lineCommentToken || undefined;
            }
            else if (name === 'BLOCK_COMMENT_START') {
                return config.blockCommentStartToken || undefined;
            }
            else if (name === 'BLOCK_COMMENT_END') {
                return config.blockCommentEndToken || undefined;
            }
            return undefined;
        }
    };
    exports.$g6 = $g6;
    exports.$g6 = $g6 = __decorate([
        __param(2, languageConfigurationRegistry_1.$2t)
    ], $g6);
    class $h6 {
        constructor() {
            this.e = new Date();
        }
        static { this.a = [nls.localize(0, null), nls.localize(1, null), nls.localize(2, null), nls.localize(3, null), nls.localize(4, null), nls.localize(5, null), nls.localize(6, null)]; }
        static { this.b = [nls.localize(7, null), nls.localize(8, null), nls.localize(9, null), nls.localize(10, null), nls.localize(11, null), nls.localize(12, null), nls.localize(13, null)]; }
        static { this.c = [nls.localize(14, null), nls.localize(15, null), nls.localize(16, null), nls.localize(17, null), nls.localize(18, null), nls.localize(19, null), nls.localize(20, null), nls.localize(21, null), nls.localize(22, null), nls.localize(23, null), nls.localize(24, null), nls.localize(25, null)]; }
        static { this.d = [nls.localize(26, null), nls.localize(27, null), nls.localize(28, null), nls.localize(29, null), nls.localize(30, null), nls.localize(31, null), nls.localize(32, null), nls.localize(33, null), nls.localize(34, null), nls.localize(35, null), nls.localize(36, null), nls.localize(37, null)]; }
        resolve(variable) {
            const { name } = variable;
            if (name === 'CURRENT_YEAR') {
                return String(this.e.getFullYear());
            }
            else if (name === 'CURRENT_YEAR_SHORT') {
                return String(this.e.getFullYear()).slice(-2);
            }
            else if (name === 'CURRENT_MONTH') {
                return String(this.e.getMonth().valueOf() + 1).padStart(2, '0');
            }
            else if (name === 'CURRENT_DATE') {
                return String(this.e.getDate().valueOf()).padStart(2, '0');
            }
            else if (name === 'CURRENT_HOUR') {
                return String(this.e.getHours().valueOf()).padStart(2, '0');
            }
            else if (name === 'CURRENT_MINUTE') {
                return String(this.e.getMinutes().valueOf()).padStart(2, '0');
            }
            else if (name === 'CURRENT_SECOND') {
                return String(this.e.getSeconds().valueOf()).padStart(2, '0');
            }
            else if (name === 'CURRENT_DAY_NAME') {
                return $h6.a[this.e.getDay()];
            }
            else if (name === 'CURRENT_DAY_NAME_SHORT') {
                return $h6.b[this.e.getDay()];
            }
            else if (name === 'CURRENT_MONTH_NAME') {
                return $h6.c[this.e.getMonth()];
            }
            else if (name === 'CURRENT_MONTH_NAME_SHORT') {
                return $h6.d[this.e.getMonth()];
            }
            else if (name === 'CURRENT_SECONDS_UNIX') {
                return String(Math.floor(this.e.getTime() / 1000));
            }
            else if (name === 'CURRENT_TIMEZONE_OFFSET') {
                const rawTimeOffset = this.e.getTimezoneOffset();
                const sign = rawTimeOffset > 0 ? '-' : '+';
                const hours = Math.trunc(Math.abs(rawTimeOffset / 60));
                const hoursString = (hours < 10 ? '0' + hours : hours);
                const minutes = Math.abs(rawTimeOffset) - hours * 60;
                const minutesString = (minutes < 10 ? '0' + minutes : minutes);
                return sign + hoursString + ':' + minutesString;
            }
            return undefined;
        }
    }
    exports.$h6 = $h6;
    class $i6 {
        constructor(a) {
            this.a = a;
            //
        }
        resolve(variable) {
            if (!this.a) {
                return undefined;
            }
            const workspaceIdentifier = (0, workspace_1.$Ph)(this.a.getWorkspace());
            if ((0, workspace_1.$Mh)(workspaceIdentifier)) {
                return undefined;
            }
            if (variable.name === 'WORKSPACE_NAME') {
                return this.b(workspaceIdentifier);
            }
            else if (variable.name === 'WORKSPACE_FOLDER') {
                return this.c(workspaceIdentifier);
            }
            return undefined;
        }
        b(workspaceIdentifier) {
            if ((0, workspace_1.$Lh)(workspaceIdentifier)) {
                return path.$ae(workspaceIdentifier.uri.path);
            }
            let filename = path.$ae(workspaceIdentifier.configPath.path);
            if (filename.endsWith(workspace_1.$Xh)) {
                filename = filename.substr(0, filename.length - workspace_1.$Xh.length - 1);
            }
            return filename;
        }
        c(workspaceIdentifier) {
            if ((0, workspace_1.$Lh)(workspaceIdentifier)) {
                return (0, labels_1.$fA)(workspaceIdentifier.uri.fsPath);
            }
            const filename = path.$ae(workspaceIdentifier.configPath.path);
            let folderpath = workspaceIdentifier.configPath.fsPath;
            if (folderpath.endsWith(filename)) {
                folderpath = folderpath.substr(0, folderpath.length - filename.length - 1);
            }
            return (folderpath ? (0, labels_1.$fA)(folderpath) : '/');
        }
    }
    exports.$i6 = $i6;
    class $j6 {
        resolve(variable) {
            const { name } = variable;
            if (name === 'RANDOM') {
                return Math.random().toString().slice(-6);
            }
            else if (name === 'RANDOM_HEX') {
                return Math.random().toString(16).slice(-6);
            }
            else if (name === 'UUID') {
                return (0, uuid_1.$4f)();
            }
            return undefined;
        }
    }
    exports.$j6 = $j6;
});
//# sourceMappingURL=snippetVariables.js.map