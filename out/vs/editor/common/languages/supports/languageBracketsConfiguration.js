/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cache"], function (require, exports, cache_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ClosingBracketKind = exports.OpeningBracketKind = exports.BracketKindBase = exports.LanguageBracketsConfiguration = void 0;
    /**
     * Captures all bracket related configurations for a single language.
     * Immutable.
    */
    class LanguageBracketsConfiguration {
        constructor(languageId, config) {
            this.languageId = languageId;
            const bracketPairs = config.brackets ? filterValidBrackets(config.brackets) : [];
            const openingBracketInfos = new cache_1.CachedFunction((bracket) => {
                const closing = new Set();
                return {
                    info: new OpeningBracketKind(this, bracket, closing),
                    closing,
                };
            });
            const closingBracketInfos = new cache_1.CachedFunction((bracket) => {
                const opening = new Set();
                const openingColorized = new Set();
                return {
                    info: new ClosingBracketKind(this, bracket, opening, openingColorized),
                    opening,
                    openingColorized,
                };
            });
            for (const [open, close] of bracketPairs) {
                const opening = openingBracketInfos.get(open);
                const closing = closingBracketInfos.get(close);
                opening.closing.add(closing.info);
                closing.opening.add(opening.info);
            }
            // Treat colorized brackets as brackets, and mark them as colorized.
            const colorizedBracketPairs = config.colorizedBracketPairs
                ? filterValidBrackets(config.colorizedBracketPairs)
                // If not configured: Take all brackets except `<` ... `>`
                // Many languages set < ... > as bracket pair, even though they also use it as comparison operator.
                // This leads to problems when colorizing this bracket, so we exclude it if not explicitly configured otherwise.
                // https://github.com/microsoft/vscode/issues/132476
                : bracketPairs.filter((p) => !(p[0] === '<' && p[1] === '>'));
            for (const [open, close] of colorizedBracketPairs) {
                const opening = openingBracketInfos.get(open);
                const closing = closingBracketInfos.get(close);
                opening.closing.add(closing.info);
                closing.openingColorized.add(opening.info);
                closing.opening.add(opening.info);
            }
            this._openingBrackets = new Map([...openingBracketInfos.cachedValues].map(([k, v]) => [k, v.info]));
            this._closingBrackets = new Map([...closingBracketInfos.cachedValues].map(([k, v]) => [k, v.info]));
        }
        /**
         * No two brackets have the same bracket text.
        */
        get openingBrackets() {
            return [...this._openingBrackets.values()];
        }
        /**
         * No two brackets have the same bracket text.
        */
        get closingBrackets() {
            return [...this._closingBrackets.values()];
        }
        getOpeningBracketInfo(bracketText) {
            return this._openingBrackets.get(bracketText);
        }
        getClosingBracketInfo(bracketText) {
            return this._closingBrackets.get(bracketText);
        }
        getBracketInfo(bracketText) {
            return this.getOpeningBracketInfo(bracketText) || this.getClosingBracketInfo(bracketText);
        }
    }
    exports.LanguageBracketsConfiguration = LanguageBracketsConfiguration;
    function filterValidBrackets(bracketPairs) {
        return bracketPairs.filter(([open, close]) => open !== '' && close !== '');
    }
    class BracketKindBase {
        constructor(config, bracketText) {
            this.config = config;
            this.bracketText = bracketText;
        }
        get languageId() {
            return this.config.languageId;
        }
    }
    exports.BracketKindBase = BracketKindBase;
    class OpeningBracketKind extends BracketKindBase {
        constructor(config, bracketText, openedBrackets) {
            super(config, bracketText);
            this.openedBrackets = openedBrackets;
            this.isOpeningBracket = true;
        }
    }
    exports.OpeningBracketKind = OpeningBracketKind;
    class ClosingBracketKind extends BracketKindBase {
        constructor(config, bracketText, 
        /**
         * Non empty array of all opening brackets this bracket closes.
        */
        openingBrackets, openingColorizedBrackets) {
            super(config, bracketText);
            this.openingBrackets = openingBrackets;
            this.openingColorizedBrackets = openingColorizedBrackets;
            this.isOpeningBracket = false;
        }
        /**
         * Checks if this bracket closes the given other bracket.
         * If the bracket infos come from different configurations, this method will return false.
        */
        closes(other) {
            if (other['config'] !== this.config) {
                return false;
            }
            return this.openingBrackets.has(other);
        }
        closesColorized(other) {
            if (other['config'] !== this.config) {
                return false;
            }
            return this.openingColorizedBrackets.has(other);
        }
        getOpeningBrackets() {
            return [...this.openingBrackets];
        }
    }
    exports.ClosingBracketKind = ClosingBracketKind;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2VCcmFja2V0c0NvbmZpZ3VyYXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL2xhbmd1YWdlcy9zdXBwb3J0cy9sYW5ndWFnZUJyYWNrZXRzQ29uZmlndXJhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFLaEc7OztNQUdFO0lBQ0YsTUFBYSw2QkFBNkI7UUFJekMsWUFDaUIsVUFBa0IsRUFDbEMsTUFBNkI7WUFEYixlQUFVLEdBQVYsVUFBVSxDQUFRO1lBR2xDLE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ2pGLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxzQkFBYyxDQUFDLENBQUMsT0FBZSxFQUFFLEVBQUU7Z0JBQ2xFLE1BQU0sT0FBTyxHQUFHLElBQUksR0FBRyxFQUFzQixDQUFDO2dCQUU5QyxPQUFPO29CQUNOLElBQUksRUFBRSxJQUFJLGtCQUFrQixDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDO29CQUNwRCxPQUFPO2lCQUNQLENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUNILE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxzQkFBYyxDQUFDLENBQUMsT0FBZSxFQUFFLEVBQUU7Z0JBQ2xFLE1BQU0sT0FBTyxHQUFHLElBQUksR0FBRyxFQUFzQixDQUFDO2dCQUM5QyxNQUFNLGdCQUFnQixHQUFHLElBQUksR0FBRyxFQUFzQixDQUFDO2dCQUN2RCxPQUFPO29CQUNOLElBQUksRUFBRSxJQUFJLGtCQUFrQixDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLGdCQUFnQixDQUFDO29CQUN0RSxPQUFPO29CQUNQLGdCQUFnQjtpQkFDaEIsQ0FBQztZQUNILENBQUMsQ0FBQyxDQUFDO1lBRUgsS0FBSyxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLFlBQVksRUFBRTtnQkFDekMsTUFBTSxPQUFPLEdBQUcsbUJBQW1CLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM5QyxNQUFNLE9BQU8sR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBRS9DLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDbEMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ2xDO1lBRUQsb0VBQW9FO1lBQ3BFLE1BQU0scUJBQXFCLEdBQUcsTUFBTSxDQUFDLHFCQUFxQjtnQkFDekQsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQztnQkFDbkQsMERBQTBEO2dCQUMxRCxtR0FBbUc7Z0JBQ25HLGdIQUFnSDtnQkFDaEgsb0RBQW9EO2dCQUNwRCxDQUFDLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0QsS0FBSyxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLHFCQUFxQixFQUFFO2dCQUNsRCxNQUFNLE9BQU8sR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzlDLE1BQU0sT0FBTyxHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFFL0MsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNsQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDM0MsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ2xDO1lBRUQsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxtQkFBbUIsQ0FBQyxZQUFZLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwRyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLG1CQUFtQixDQUFDLFlBQVksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JHLENBQUM7UUFFRDs7VUFFRTtRQUNGLElBQVcsZUFBZTtZQUN6QixPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUM1QyxDQUFDO1FBRUQ7O1VBRUU7UUFDRixJQUFXLGVBQWU7WUFDekIsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUVNLHFCQUFxQixDQUFDLFdBQW1CO1lBQy9DLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMvQyxDQUFDO1FBRU0scUJBQXFCLENBQUMsV0FBbUI7WUFDL0MsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFFTSxjQUFjLENBQUMsV0FBbUI7WUFDeEMsT0FBTyxJQUFJLENBQUMscUJBQXFCLENBQUMsV0FBVyxDQUFDLElBQUksSUFBSSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzNGLENBQUM7S0FDRDtJQWpGRCxzRUFpRkM7SUFFRCxTQUFTLG1CQUFtQixDQUFDLFlBQWdDO1FBQzVELE9BQU8sWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLEtBQUssRUFBRSxJQUFJLEtBQUssS0FBSyxFQUFFLENBQUMsQ0FBQztJQUM1RSxDQUFDO0lBSUQsTUFBYSxlQUFlO1FBQzNCLFlBQ29CLE1BQXFDLEVBQ3hDLFdBQW1CO1lBRGhCLFdBQU0sR0FBTixNQUFNLENBQStCO1lBQ3hDLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1FBQ2hDLENBQUM7UUFFTCxJQUFXLFVBQVU7WUFDcEIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQztRQUMvQixDQUFDO0tBQ0Q7SUFURCwwQ0FTQztJQUVELE1BQWEsa0JBQW1CLFNBQVEsZUFBZTtRQUd0RCxZQUNDLE1BQXFDLEVBQ3JDLFdBQW1CLEVBQ0gsY0FBK0M7WUFFL0QsS0FBSyxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztZQUZYLG1CQUFjLEdBQWQsY0FBYyxDQUFpQztZQUxoRCxxQkFBZ0IsR0FBRyxJQUFJLENBQUM7UUFReEMsQ0FBQztLQUNEO0lBVkQsZ0RBVUM7SUFFRCxNQUFhLGtCQUFtQixTQUFRLGVBQWU7UUFHdEQsWUFDQyxNQUFxQyxFQUNyQyxXQUFtQjtRQUNuQjs7VUFFRTtRQUNjLGVBQWdELEVBQy9DLHdCQUF5RDtZQUUxRSxLQUFLLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBSFgsb0JBQWUsR0FBZixlQUFlLENBQWlDO1lBQy9DLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBaUM7WUFUM0QscUJBQWdCLEdBQUcsS0FBSyxDQUFDO1FBWXpDLENBQUM7UUFFRDs7O1VBR0U7UUFDSyxNQUFNLENBQUMsS0FBeUI7WUFDdEMsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDcEMsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUNELE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDeEMsQ0FBQztRQUVNLGVBQWUsQ0FBQyxLQUF5QjtZQUMvQyxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNwQyxPQUFPLEtBQUssQ0FBQzthQUNiO1lBQ0QsT0FBTyxJQUFJLENBQUMsd0JBQXdCLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2pELENBQUM7UUFFTSxrQkFBa0I7WUFDeEIsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ2xDLENBQUM7S0FDRDtJQXBDRCxnREFvQ0MifQ==