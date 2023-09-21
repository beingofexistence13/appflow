/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/languages/languageConfiguration", "vs/editor/common/languages/languageConfigurationRegistry"], function (require, exports, languageConfiguration_1, languageConfigurationRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getEnterAction = void 0;
    function getEnterAction(autoIndent, model, range, languageConfigurationService) {
        const scopedLineTokens = (0, languageConfigurationRegistry_1.getScopedLineTokens)(model, range.startLineNumber, range.startColumn);
        const richEditSupport = languageConfigurationService.getLanguageConfiguration(scopedLineTokens.languageId);
        if (!richEditSupport) {
            return null;
        }
        const scopedLineText = scopedLineTokens.getLineContent();
        const beforeEnterText = scopedLineText.substr(0, range.startColumn - 1 - scopedLineTokens.firstCharOffset);
        // selection support
        let afterEnterText;
        if (range.isEmpty()) {
            afterEnterText = scopedLineText.substr(range.startColumn - 1 - scopedLineTokens.firstCharOffset);
        }
        else {
            const endScopedLineTokens = (0, languageConfigurationRegistry_1.getScopedLineTokens)(model, range.endLineNumber, range.endColumn);
            afterEnterText = endScopedLineTokens.getLineContent().substr(range.endColumn - 1 - scopedLineTokens.firstCharOffset);
        }
        let previousLineText = '';
        if (range.startLineNumber > 1 && scopedLineTokens.firstCharOffset === 0) {
            // This is not the first line and the entire line belongs to this mode
            const oneLineAboveScopedLineTokens = (0, languageConfigurationRegistry_1.getScopedLineTokens)(model, range.startLineNumber - 1);
            if (oneLineAboveScopedLineTokens.languageId === scopedLineTokens.languageId) {
                // The line above ends with text belonging to the same mode
                previousLineText = oneLineAboveScopedLineTokens.getLineContent();
            }
        }
        const enterResult = richEditSupport.onEnter(autoIndent, previousLineText, beforeEnterText, afterEnterText);
        if (!enterResult) {
            return null;
        }
        const indentAction = enterResult.indentAction;
        let appendText = enterResult.appendText;
        const removeText = enterResult.removeText || 0;
        // Here we add `\t` to appendText first because enterAction is leveraging appendText and removeText to change indentation.
        if (!appendText) {
            if ((indentAction === languageConfiguration_1.IndentAction.Indent) ||
                (indentAction === languageConfiguration_1.IndentAction.IndentOutdent)) {
                appendText = '\t';
            }
            else {
                appendText = '';
            }
        }
        else if (indentAction === languageConfiguration_1.IndentAction.Indent) {
            appendText = '\t' + appendText;
        }
        let indentation = (0, languageConfigurationRegistry_1.getIndentationAtPosition)(model, range.startLineNumber, range.startColumn);
        if (removeText) {
            indentation = indentation.substring(0, indentation.length - removeText);
        }
        return {
            indentAction: indentAction,
            appendText: appendText,
            removeText: removeText,
            indentation: indentation
        };
    }
    exports.getEnterAction = getEnterAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50ZXJBY3Rpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL2xhbmd1YWdlcy9lbnRlckFjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFRaEcsU0FBZ0IsY0FBYyxDQUM3QixVQUFvQyxFQUNwQyxLQUFpQixFQUNqQixLQUFZLEVBQ1osNEJBQTJEO1FBRTNELE1BQU0sZ0JBQWdCLEdBQUcsSUFBQSxtREFBbUIsRUFBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLGVBQWUsRUFBRSxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDOUYsTUFBTSxlQUFlLEdBQUcsNEJBQTRCLENBQUMsd0JBQXdCLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDM0csSUFBSSxDQUFDLGVBQWUsRUFBRTtZQUNyQixPQUFPLElBQUksQ0FBQztTQUNaO1FBRUQsTUFBTSxjQUFjLEdBQUcsZ0JBQWdCLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDekQsTUFBTSxlQUFlLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLFdBQVcsR0FBRyxDQUFDLEdBQUcsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLENBQUM7UUFFM0csb0JBQW9CO1FBQ3BCLElBQUksY0FBc0IsQ0FBQztRQUMzQixJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUNwQixjQUFjLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxHQUFHLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsQ0FBQztTQUNqRzthQUFNO1lBQ04sTUFBTSxtQkFBbUIsR0FBRyxJQUFBLG1EQUFtQixFQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM3RixjQUFjLEdBQUcsbUJBQW1CLENBQUMsY0FBYyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsQ0FBQyxHQUFHLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxDQUFDO1NBQ3JIO1FBRUQsSUFBSSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7UUFDMUIsSUFBSSxLQUFLLENBQUMsZUFBZSxHQUFHLENBQUMsSUFBSSxnQkFBZ0IsQ0FBQyxlQUFlLEtBQUssQ0FBQyxFQUFFO1lBQ3hFLHNFQUFzRTtZQUN0RSxNQUFNLDRCQUE0QixHQUFHLElBQUEsbURBQW1CLEVBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDM0YsSUFBSSw0QkFBNEIsQ0FBQyxVQUFVLEtBQUssZ0JBQWdCLENBQUMsVUFBVSxFQUFFO2dCQUM1RSwyREFBMkQ7Z0JBQzNELGdCQUFnQixHQUFHLDRCQUE0QixDQUFDLGNBQWMsRUFBRSxDQUFDO2FBQ2pFO1NBQ0Q7UUFFRCxNQUFNLFdBQVcsR0FBRyxlQUFlLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxnQkFBZ0IsRUFBRSxlQUFlLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDM0csSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNqQixPQUFPLElBQUksQ0FBQztTQUNaO1FBRUQsTUFBTSxZQUFZLEdBQUcsV0FBVyxDQUFDLFlBQVksQ0FBQztRQUM5QyxJQUFJLFVBQVUsR0FBRyxXQUFXLENBQUMsVUFBVSxDQUFDO1FBQ3hDLE1BQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQyxVQUFVLElBQUksQ0FBQyxDQUFDO1FBRS9DLDBIQUEwSDtRQUMxSCxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2hCLElBQ0MsQ0FBQyxZQUFZLEtBQUssb0NBQVksQ0FBQyxNQUFNLENBQUM7Z0JBQ3RDLENBQUMsWUFBWSxLQUFLLG9DQUFZLENBQUMsYUFBYSxDQUFDLEVBQzVDO2dCQUNELFVBQVUsR0FBRyxJQUFJLENBQUM7YUFDbEI7aUJBQU07Z0JBQ04sVUFBVSxHQUFHLEVBQUUsQ0FBQzthQUNoQjtTQUNEO2FBQU0sSUFBSSxZQUFZLEtBQUssb0NBQVksQ0FBQyxNQUFNLEVBQUU7WUFDaEQsVUFBVSxHQUFHLElBQUksR0FBRyxVQUFVLENBQUM7U0FDL0I7UUFFRCxJQUFJLFdBQVcsR0FBRyxJQUFBLHdEQUF3QixFQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsZUFBZSxFQUFFLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM1RixJQUFJLFVBQVUsRUFBRTtZQUNmLFdBQVcsR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQyxDQUFDO1NBQ3hFO1FBRUQsT0FBTztZQUNOLFlBQVksRUFBRSxZQUFZO1lBQzFCLFVBQVUsRUFBRSxVQUFVO1lBQ3RCLFVBQVUsRUFBRSxVQUFVO1lBQ3RCLFdBQVcsRUFBRSxXQUFXO1NBQ3hCLENBQUM7SUFDSCxDQUFDO0lBcEVELHdDQW9FQyJ9