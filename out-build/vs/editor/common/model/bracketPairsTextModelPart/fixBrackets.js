/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/brackets", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/length", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/parser", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/smallImmutableSet", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/tokenizer"], function (require, exports, brackets_1, length_1, parser_1, smallImmutableSet_1, tokenizer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$u5 = void 0;
    function $u5(tokens, languageConfigurationService) {
        const denseKeyProvider = new smallImmutableSet_1.$Nt();
        const bracketTokens = new brackets_1.$0t(denseKeyProvider, (languageId) => languageConfigurationService.getLanguageConfiguration(languageId));
        const tokenizer = new tokenizer_1.$_t(new StaticTokenizerSource([tokens]), bracketTokens);
        const node = (0, parser_1.$NA)(tokenizer, [], undefined, true);
        let str = '';
        const line = tokens.getLineContent();
        function processNode(node, offset) {
            if (node.kind === 2 /* AstNodeKind.Pair */) {
                processNode(node.openingBracket, offset);
                offset = (0, length_1.$vt)(offset, node.openingBracket.length);
                if (node.child) {
                    processNode(node.child, offset);
                    offset = (0, length_1.$vt)(offset, node.child.length);
                }
                if (node.closingBracket) {
                    processNode(node.closingBracket, offset);
                    offset = (0, length_1.$vt)(offset, node.closingBracket.length);
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
                str += line.substring((0, length_1.$ut)(offset), (0, length_1.$ut)((0, length_1.$vt)(offset, node.length)));
            }
            else if (node.kind === 4 /* AstNodeKind.List */) {
                for (const child of node.children) {
                    processNode(child, offset);
                    offset = (0, length_1.$vt)(offset, child.length);
                }
            }
        }
        processNode(node, length_1.$pt);
        return str;
    }
    exports.$u5 = $u5;
    class StaticTokenizerSource {
        constructor(a) {
            this.a = a;
            this.tokenization = {
                getLineTokens: (lineNumber) => {
                    return this.a[lineNumber - 1];
                }
            };
        }
        getValue() {
            return this.a.map(l => l.getLineContent()).join('\n');
        }
        getLineCount() {
            return this.a.length;
        }
        getLineLength(lineNumber) {
            return this.a[lineNumber - 1].getLineContent().length;
        }
    }
});
//# sourceMappingURL=fixBrackets.js.map