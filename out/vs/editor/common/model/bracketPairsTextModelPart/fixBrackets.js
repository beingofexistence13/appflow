/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/brackets", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/length", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/parser", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/smallImmutableSet", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/tokenizer"], function (require, exports, brackets_1, length_1, parser_1, smallImmutableSet_1, tokenizer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.fixBracketsInLine = void 0;
    function fixBracketsInLine(tokens, languageConfigurationService) {
        const denseKeyProvider = new smallImmutableSet_1.DenseKeyProvider();
        const bracketTokens = new brackets_1.LanguageAgnosticBracketTokens(denseKeyProvider, (languageId) => languageConfigurationService.getLanguageConfiguration(languageId));
        const tokenizer = new tokenizer_1.TextBufferTokenizer(new StaticTokenizerSource([tokens]), bracketTokens);
        const node = (0, parser_1.parseDocument)(tokenizer, [], undefined, true);
        let str = '';
        const line = tokens.getLineContent();
        function processNode(node, offset) {
            if (node.kind === 2 /* AstNodeKind.Pair */) {
                processNode(node.openingBracket, offset);
                offset = (0, length_1.lengthAdd)(offset, node.openingBracket.length);
                if (node.child) {
                    processNode(node.child, offset);
                    offset = (0, length_1.lengthAdd)(offset, node.child.length);
                }
                if (node.closingBracket) {
                    processNode(node.closingBracket, offset);
                    offset = (0, length_1.lengthAdd)(offset, node.closingBracket.length);
                }
                else {
                    const singleLangBracketTokens = bracketTokens.getSingleLanguageBracketTokens(node.openingBracket.languageId);
                    const closingTokenText = singleLangBracketTokens.findClosingTokenText(node.openingBracket.bracketIds);
                    str += closingTokenText;
                }
            }
            else if (node.kind === 3 /* AstNodeKind.UnexpectedClosingBracket */) {
                // remove the bracket
            }
            else if (node.kind === 0 /* AstNodeKind.Text */ || node.kind === 1 /* AstNodeKind.Bracket */) {
                str += line.substring((0, length_1.lengthGetColumnCountIfZeroLineCount)(offset), (0, length_1.lengthGetColumnCountIfZeroLineCount)((0, length_1.lengthAdd)(offset, node.length)));
            }
            else if (node.kind === 4 /* AstNodeKind.List */) {
                for (const child of node.children) {
                    processNode(child, offset);
                    offset = (0, length_1.lengthAdd)(offset, child.length);
                }
            }
        }
        processNode(node, length_1.lengthZero);
        return str;
    }
    exports.fixBracketsInLine = fixBracketsInLine;
    class StaticTokenizerSource {
        constructor(lines) {
            this.lines = lines;
            this.tokenization = {
                getLineTokens: (lineNumber) => {
                    return this.lines[lineNumber - 1];
                }
            };
        }
        getValue() {
            return this.lines.map(l => l.getLineContent()).join('\n');
        }
        getLineCount() {
            return this.lines.length;
        }
        getLineLength(lineNumber) {
            return this.lines[lineNumber - 1].getLineContent().length;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZml4QnJhY2tldHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL21vZGVsL2JyYWNrZXRQYWlyc1RleHRNb2RlbFBhcnQvZml4QnJhY2tldHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBV2hHLFNBQWdCLGlCQUFpQixDQUFDLE1BQXVCLEVBQUUsNEJBQTJEO1FBQ3JILE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxvQ0FBZ0IsRUFBVSxDQUFDO1FBQ3hELE1BQU0sYUFBYSxHQUFHLElBQUksd0NBQTZCLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUN4Riw0QkFBNEIsQ0FBQyx3QkFBd0IsQ0FBQyxVQUFVLENBQUMsQ0FDakUsQ0FBQztRQUNGLE1BQU0sU0FBUyxHQUFHLElBQUksK0JBQW1CLENBQ3hDLElBQUkscUJBQXFCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUNuQyxhQUFhLENBQ2IsQ0FBQztRQUNGLE1BQU0sSUFBSSxHQUFHLElBQUEsc0JBQWEsRUFBQyxTQUFTLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUUzRCxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7UUFDYixNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUM7UUFFckMsU0FBUyxXQUFXLENBQUMsSUFBYSxFQUFFLE1BQWM7WUFDakQsSUFBSSxJQUFJLENBQUMsSUFBSSw2QkFBcUIsRUFBRTtnQkFDbkMsV0FBVyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQ3pDLE1BQU0sR0FBRyxJQUFBLGtCQUFTLEVBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBRXZELElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtv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