/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/languages/languageConfiguration"], function (require, exports, languageConfiguration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CharacterPairSupport = void 0;
    class CharacterPairSupport {
        static { this.DEFAULT_AUTOCLOSE_BEFORE_LANGUAGE_DEFINED_QUOTES = ';:.,=}])> \n\t'; }
        static { this.DEFAULT_AUTOCLOSE_BEFORE_LANGUAGE_DEFINED_BRACKETS = '\'"`;:.,=}])> \n\t'; }
        static { this.DEFAULT_AUTOCLOSE_BEFORE_WHITESPACE = ' \n\t'; }
        constructor(config) {
            if (config.autoClosingPairs) {
                this._autoClosingPairs = config.autoClosingPairs.map(el => new languageConfiguration_1.StandardAutoClosingPairConditional(el));
            }
            else if (config.brackets) {
                this._autoClosingPairs = config.brackets.map(b => new languageConfiguration_1.StandardAutoClosingPairConditional({ open: b[0], close: b[1] }));
            }
            else {
                this._autoClosingPairs = [];
            }
            if (config.__electricCharacterSupport && config.__electricCharacterSupport.docComment) {
                const docComment = config.__electricCharacterSupport.docComment;
                // IDocComment is legacy, only partially supported
                this._autoClosingPairs.push(new languageConfiguration_1.StandardAutoClosingPairConditional({ open: docComment.open, close: docComment.close || '' }));
            }
            this._autoCloseBeforeForQuotes = typeof config.autoCloseBefore === 'string' ? config.autoCloseBefore : CharacterPairSupport.DEFAULT_AUTOCLOSE_BEFORE_LANGUAGE_DEFINED_QUOTES;
            this._autoCloseBeforeForBrackets = typeof config.autoCloseBefore === 'string' ? config.autoCloseBefore : CharacterPairSupport.DEFAULT_AUTOCLOSE_BEFORE_LANGUAGE_DEFINED_BRACKETS;
            this._surroundingPairs = config.surroundingPairs || this._autoClosingPairs;
        }
        getAutoClosingPairs() {
            return this._autoClosingPairs;
        }
        getAutoCloseBeforeSet(forQuotes) {
            return (forQuotes ? this._autoCloseBeforeForQuotes : this._autoCloseBeforeForBrackets);
        }
        getSurroundingPairs() {
            return this._surroundingPairs;
        }
    }
    exports.CharacterPairSupport = CharacterPairSupport;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcmFjdGVyUGFpci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vbGFuZ3VhZ2VzL3N1cHBvcnRzL2NoYXJhY3RlclBhaXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBSWhHLE1BQWEsb0JBQW9CO2lCQUVoQixxREFBZ0QsR0FBRyxnQkFBZ0IsQ0FBQztpQkFDcEUsdURBQWtELEdBQUcsb0JBQW9CLENBQUM7aUJBQzFFLHdDQUFtQyxHQUFHLE9BQU8sQ0FBQztRQU85RCxZQUFZLE1BQTZCO1lBQ3hDLElBQUksTUFBTSxDQUFDLGdCQUFnQixFQUFFO2dCQUM1QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksMERBQWtDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUN2RztpQkFBTSxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUU7Z0JBQzNCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksMERBQWtDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDdkg7aUJBQU07Z0JBQ04sSUFBSSxDQUFDLGlCQUFpQixHQUFHLEVBQUUsQ0FBQzthQUM1QjtZQUVELElBQUksTUFBTSxDQUFDLDBCQUEwQixJQUFJLE1BQU0sQ0FBQywwQkFBMEIsQ0FBQyxVQUFVLEVBQUU7Z0JBQ3RGLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQywwQkFBMEIsQ0FBQyxVQUFVLENBQUM7Z0JBQ2hFLGtEQUFrRDtnQkFDbEQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLDBEQUFrQyxDQUFDLEVBQUUsSUFBSSxFQUFFLFVBQVUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFVBQVUsQ0FBQyxLQUFLLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQzlIO1lBRUQsSUFBSSxDQUFDLHlCQUF5QixHQUFHLE9BQU8sTUFBTSxDQUFDLGVBQWUsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLGdEQUFnRCxDQUFDO1lBQzdLLElBQUksQ0FBQywyQkFBMkIsR0FBRyxPQUFPLE1BQU0sQ0FBQyxlQUFlLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxrREFBa0QsQ0FBQztZQUVqTCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztRQUM1RSxDQUFDO1FBRU0sbUJBQW1CO1lBQ3pCLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDO1FBQy9CLENBQUM7UUFFTSxxQkFBcUIsQ0FBQyxTQUFrQjtZQUM5QyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1FBQ3hGLENBQUM7UUFFTSxtQkFBbUI7WUFDekIsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUM7UUFDL0IsQ0FBQzs7SUExQ0Ysb0RBMkNDIn0=