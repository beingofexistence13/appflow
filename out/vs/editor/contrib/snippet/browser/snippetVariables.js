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
define(["require", "exports", "vs/base/common/labels", "vs/base/common/path", "vs/base/common/resources", "vs/base/common/strings", "vs/base/common/uuid", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/contrib/snippet/browser/snippetParser", "vs/nls", "vs/platform/workspace/common/workspace"], function (require, exports, labels_1, path, resources_1, strings_1, uuid_1, languageConfigurationRegistry_1, snippetParser_1, nls, workspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RandomBasedVariableResolver = exports.WorkspaceBasedVariableResolver = exports.TimeBasedVariableResolver = exports.CommentBasedVariableResolver = exports.ClipboardBasedVariableResolver = exports.ModelBasedVariableResolver = exports.SelectionBasedVariableResolver = exports.CompositeSnippetVariableResolver = exports.KnownSnippetVariableNames = void 0;
    exports.KnownSnippetVariableNames = Object.freeze({
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
    class CompositeSnippetVariableResolver {
        constructor(_delegates) {
            this._delegates = _delegates;
            //
        }
        resolve(variable) {
            for (const delegate of this._delegates) {
                const value = delegate.resolve(variable);
                if (value !== undefined) {
                    return value;
                }
            }
            return undefined;
        }
    }
    exports.CompositeSnippetVariableResolver = CompositeSnippetVariableResolver;
    class SelectionBasedVariableResolver {
        constructor(_model, _selection, _selectionIdx, _overtypingCapturer) {
            this._model = _model;
            this._selection = _selection;
            this._selectionIdx = _selectionIdx;
            this._overtypingCapturer = _overtypingCapturer;
            //
        }
        resolve(variable) {
            const { name } = variable;
            if (name === 'SELECTION' || name === 'TM_SELECTED_TEXT') {
                let value = this._model.getValueInRange(this._selection) || undefined;
                let isMultiline = this._selection.startLineNumber !== this._selection.endLineNumber;
                // If there was no selected text, try to get last overtyped text
                if (!value && this._overtypingCapturer) {
                    const info = this._overtypingCapturer.getLastOvertypedInfo(this._selectionIdx);
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
                    const line = this._model.getLineContent(this._selection.startLineNumber);
                    const lineLeadingWhitespace = (0, strings_1.getLeadingWhitespace)(line, 0, this._selection.startColumn - 1);
                    let varLeadingWhitespace = lineLeadingWhitespace;
                    variable.snippet.walk(marker => {
                        if (marker === variable) {
                            return false;
                        }
                        if (marker instanceof snippetParser_1.Text) {
                            varLeadingWhitespace = (0, strings_1.getLeadingWhitespace)((0, strings_1.splitLines)(marker.value).pop());
                        }
                        return true;
                    });
                    const whitespaceCommonLength = (0, strings_1.commonPrefixLength)(varLeadingWhitespace, lineLeadingWhitespace);
                    value = value.replace(/(\r\n|\r|\n)(.*)/g, (m, newline, rest) => `${newline}${varLeadingWhitespace.substr(whitespaceCommonLength)}${rest}`);
                }
                return value;
            }
            else if (name === 'TM_CURRENT_LINE') {
                return this._model.getLineContent(this._selection.positionLineNumber);
            }
            else if (name === 'TM_CURRENT_WORD') {
                const info = this._model.getWordAtPosition({
                    lineNumber: this._selection.positionLineNumber,
                    column: this._selection.positionColumn
                });
                return info && info.word || undefined;
            }
            else if (name === 'TM_LINE_INDEX') {
                return String(this._selection.positionLineNumber - 1);
            }
            else if (name === 'TM_LINE_NUMBER') {
                return String(this._selection.positionLineNumber);
            }
            else if (name === 'CURSOR_INDEX') {
                return String(this._selectionIdx);
            }
            else if (name === 'CURSOR_NUMBER') {
                return String(this._selectionIdx + 1);
            }
            return undefined;
        }
    }
    exports.SelectionBasedVariableResolver = SelectionBasedVariableResolver;
    class ModelBasedVariableResolver {
        constructor(_labelService, _model) {
            this._labelService = _labelService;
            this._model = _model;
            //
        }
        resolve(variable) {
            const { name } = variable;
            if (name === 'TM_FILENAME') {
                return path.basename(this._model.uri.fsPath);
            }
            else if (name === 'TM_FILENAME_BASE') {
                const name = path.basename(this._model.uri.fsPath);
                const idx = name.lastIndexOf('.');
                if (idx <= 0) {
                    return name;
                }
                else {
                    return name.slice(0, idx);
                }
            }
            else if (name === 'TM_DIRECTORY') {
                if (path.dirname(this._model.uri.fsPath) === '.') {
                    return '';
                }
                return this._labelService.getUriLabel((0, resources_1.dirname)(this._model.uri));
            }
            else if (name === 'TM_FILEPATH') {
                return this._labelService.getUriLabel(this._model.uri);
            }
            else if (name === 'RELATIVE_FILEPATH') {
                return this._labelService.getUriLabel(this._model.uri, { relative: true, noPrefix: true });
            }
            return undefined;
        }
    }
    exports.ModelBasedVariableResolver = ModelBasedVariableResolver;
    class ClipboardBasedVariableResolver {
        constructor(_readClipboardText, _selectionIdx, _selectionCount, _spread) {
            this._readClipboardText = _readClipboardText;
            this._selectionIdx = _selectionIdx;
            this._selectionCount = _selectionCount;
            this._spread = _spread;
            //
        }
        resolve(variable) {
            if (variable.name !== 'CLIPBOARD') {
                return undefined;
            }
            const clipboardText = this._readClipboardText();
            if (!clipboardText) {
                return undefined;
            }
            // `spread` is assigning each cursor a line of the clipboard
            // text whenever there the line count equals the cursor count
            // and when enabled
            if (this._spread) {
                const lines = clipboardText.split(/\r\n|\n|\r/).filter(s => !(0, strings_1.isFalsyOrWhitespace)(s));
                if (lines.length === this._selectionCount) {
                    return lines[this._selectionIdx];
                }
            }
            return clipboardText;
        }
    }
    exports.ClipboardBasedVariableResolver = ClipboardBasedVariableResolver;
    let CommentBasedVariableResolver = class CommentBasedVariableResolver {
        constructor(_model, _selection, _languageConfigurationService) {
            this._model = _model;
            this._selection = _selection;
            this._languageConfigurationService = _languageConfigurationService;
            //
        }
        resolve(variable) {
            const { name } = variable;
            const langId = this._model.getLanguageIdAtPosition(this._selection.selectionStartLineNumber, this._selection.selectionStartColumn);
            const config = this._languageConfigurationService.getLanguageConfiguration(langId).comments;
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
    exports.CommentBasedVariableResolver = CommentBasedVariableResolver;
    exports.CommentBasedVariableResolver = CommentBasedVariableResolver = __decorate([
        __param(2, languageConfigurationRegistry_1.ILanguageConfigurationService)
    ], CommentBasedVariableResolver);
    class TimeBasedVariableResolver {
        constructor() {
            this._date = new Date();
        }
        static { this.dayNames = [nls.localize('Sunday', "Sunday"), nls.localize('Monday', "Monday"), nls.localize('Tuesday', "Tuesday"), nls.localize('Wednesday', "Wednesday"), nls.localize('Thursday', "Thursday"), nls.localize('Friday', "Friday"), nls.localize('Saturday', "Saturday")]; }
        static { this.dayNamesShort = [nls.localize('SundayShort', "Sun"), nls.localize('MondayShort', "Mon"), nls.localize('TuesdayShort', "Tue"), nls.localize('WednesdayShort', "Wed"), nls.localize('ThursdayShort', "Thu"), nls.localize('FridayShort', "Fri"), nls.localize('SaturdayShort', "Sat")]; }
        static { this.monthNames = [nls.localize('January', "January"), nls.localize('February', "February"), nls.localize('March', "March"), nls.localize('April', "April"), nls.localize('May', "May"), nls.localize('June', "June"), nls.localize('July', "July"), nls.localize('August', "August"), nls.localize('September', "September"), nls.localize('October', "October"), nls.localize('November', "November"), nls.localize('December', "December")]; }
        static { this.monthNamesShort = [nls.localize('JanuaryShort', "Jan"), nls.localize('FebruaryShort', "Feb"), nls.localize('MarchShort', "Mar"), nls.localize('AprilShort', "Apr"), nls.localize('MayShort', "May"), nls.localize('JuneShort', "Jun"), nls.localize('JulyShort', "Jul"), nls.localize('AugustShort', "Aug"), nls.localize('SeptemberShort', "Sep"), nls.localize('OctoberShort', "Oct"), nls.localize('NovemberShort', "Nov"), nls.localize('DecemberShort', "Dec")]; }
        resolve(variable) {
            const { name } = variable;
            if (name === 'CURRENT_YEAR') {
                return String(this._date.getFullYear());
            }
            else if (name === 'CURRENT_YEAR_SHORT') {
                return String(this._date.getFullYear()).slice(-2);
            }
            else if (name === 'CURRENT_MONTH') {
                return String(this._date.getMonth().valueOf() + 1).padStart(2, '0');
            }
            else if (name === 'CURRENT_DATE') {
                return String(this._date.getDate().valueOf()).padStart(2, '0');
            }
            else if (name === 'CURRENT_HOUR') {
                return String(this._date.getHours().valueOf()).padStart(2, '0');
            }
            else if (name === 'CURRENT_MINUTE') {
                return String(this._date.getMinutes().valueOf()).padStart(2, '0');
            }
            else if (name === 'CURRENT_SECOND') {
                return String(this._date.getSeconds().valueOf()).padStart(2, '0');
            }
            else if (name === 'CURRENT_DAY_NAME') {
                return TimeBasedVariableResolver.dayNames[this._date.getDay()];
            }
            else if (name === 'CURRENT_DAY_NAME_SHORT') {
                return TimeBasedVariableResolver.dayNamesShort[this._date.getDay()];
            }
            else if (name === 'CURRENT_MONTH_NAME') {
                return TimeBasedVariableResolver.monthNames[this._date.getMonth()];
            }
            else if (name === 'CURRENT_MONTH_NAME_SHORT') {
                return TimeBasedVariableResolver.monthNamesShort[this._date.getMonth()];
            }
            else if (name === 'CURRENT_SECONDS_UNIX') {
                return String(Math.floor(this._date.getTime() / 1000));
            }
            else if (name === 'CURRENT_TIMEZONE_OFFSET') {
                const rawTimeOffset = this._date.getTimezoneOffset();
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
    exports.TimeBasedVariableResolver = TimeBasedVariableResolver;
    class WorkspaceBasedVariableResolver {
        constructor(_workspaceService) {
            this._workspaceService = _workspaceService;
            //
        }
        resolve(variable) {
            if (!this._workspaceService) {
                return undefined;
            }
            const workspaceIdentifier = (0, workspace_1.toWorkspaceIdentifier)(this._workspaceService.getWorkspace());
            if ((0, workspace_1.isEmptyWorkspaceIdentifier)(workspaceIdentifier)) {
                return undefined;
            }
            if (variable.name === 'WORKSPACE_NAME') {
                return this._resolveWorkspaceName(workspaceIdentifier);
            }
            else if (variable.name === 'WORKSPACE_FOLDER') {
                return this._resoveWorkspacePath(workspaceIdentifier);
            }
            return undefined;
        }
        _resolveWorkspaceName(workspaceIdentifier) {
            if ((0, workspace_1.isSingleFolderWorkspaceIdentifier)(workspaceIdentifier)) {
                return path.basename(workspaceIdentifier.uri.path);
            }
            let filename = path.basename(workspaceIdentifier.configPath.path);
            if (filename.endsWith(workspace_1.WORKSPACE_EXTENSION)) {
                filename = filename.substr(0, filename.length - workspace_1.WORKSPACE_EXTENSION.length - 1);
            }
            return filename;
        }
        _resoveWorkspacePath(workspaceIdentifier) {
            if ((0, workspace_1.isSingleFolderWorkspaceIdentifier)(workspaceIdentifier)) {
                return (0, labels_1.normalizeDriveLetter)(workspaceIdentifier.uri.fsPath);
            }
            const filename = path.basename(workspaceIdentifier.configPath.path);
            let folderpath = workspaceIdentifier.configPath.fsPath;
            if (folderpath.endsWith(filename)) {
                folderpath = folderpath.substr(0, folderpath.length - filename.length - 1);
            }
            return (folderpath ? (0, labels_1.normalizeDriveLetter)(folderpath) : '/');
        }
    }
    exports.WorkspaceBasedVariableResolver = WorkspaceBasedVariableResolver;
    class RandomBasedVariableResolver {
        resolve(variable) {
            const { name } = variable;
            if (name === 'RANDOM') {
                return Math.random().toString().slice(-6);
            }
            else if (name === 'RANDOM_HEX') {
                return Math.random().toString(16).slice(-6);
            }
            else if (name === 'UUID') {
                return (0, uuid_1.generateUuid)();
            }
            return undefined;
        }
    }
    exports.RandomBasedVariableResolver = RandomBasedVariableResolver;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25pcHBldFZhcmlhYmxlcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL3NuaXBwZXQvYnJvd3Nlci9zbmlwcGV0VmFyaWFibGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWdCbkYsUUFBQSx5QkFBeUIsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUEwQjtRQUMvRSxjQUFjLEVBQUUsSUFBSTtRQUNwQixvQkFBb0IsRUFBRSxJQUFJO1FBQzFCLGVBQWUsRUFBRSxJQUFJO1FBQ3JCLGNBQWMsRUFBRSxJQUFJO1FBQ3BCLGNBQWMsRUFBRSxJQUFJO1FBQ3BCLGdCQUFnQixFQUFFLElBQUk7UUFDdEIsZ0JBQWdCLEVBQUUsSUFBSTtRQUN0QixrQkFBa0IsRUFBRSxJQUFJO1FBQ3hCLHdCQUF3QixFQUFFLElBQUk7UUFDOUIsb0JBQW9CLEVBQUUsSUFBSTtRQUMxQiwwQkFBMEIsRUFBRSxJQUFJO1FBQ2hDLHNCQUFzQixFQUFFLElBQUk7UUFDNUIseUJBQXlCLEVBQUUsSUFBSTtRQUMvQixXQUFXLEVBQUUsSUFBSTtRQUNqQixXQUFXLEVBQUUsSUFBSTtRQUNqQixrQkFBa0IsRUFBRSxJQUFJO1FBQ3hCLGlCQUFpQixFQUFFLElBQUk7UUFDdkIsaUJBQWlCLEVBQUUsSUFBSTtRQUN2QixlQUFlLEVBQUUsSUFBSTtRQUNyQixnQkFBZ0IsRUFBRSxJQUFJO1FBQ3RCLGFBQWEsRUFBRSxJQUFJO1FBQ25CLGtCQUFrQixFQUFFLElBQUk7UUFDeEIsY0FBYyxFQUFFLElBQUk7UUFDcEIsYUFBYSxFQUFFLElBQUk7UUFDbkIsY0FBYyxFQUFFLElBQUk7UUFDcEIsZUFBZSxFQUFFLElBQUk7UUFDckIsbUJBQW1CLEVBQUUsSUFBSTtRQUN6QixxQkFBcUIsRUFBRSxJQUFJO1FBQzNCLG1CQUFtQixFQUFFLElBQUk7UUFDekIs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