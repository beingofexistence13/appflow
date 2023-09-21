/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/workbench/services/textMate/common/TMGrammars", "vs/workbench/services/extensions/common/extensions", "vs/platform/commands/common/commands"], function (require, exports, editorExtensions_1, TMGrammars_1, extensions_1, commands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$6Xb = void 0;
    class GrammarContributions {
        static { this.a = {}; }
        constructor(contributions) {
            if (!Object.keys(GrammarContributions.a).length) {
                this.b(contributions);
            }
        }
        b(contributions) {
            contributions.forEach((contribution) => {
                contribution.value.forEach((grammar) => {
                    if (grammar.language && grammar.scopeName) {
                        GrammarContributions.a[grammar.language] = grammar.scopeName;
                    }
                });
            });
        }
        getGrammar(mode) {
            return GrammarContributions.a[mode];
        }
    }
    class $6Xb extends editorExtensions_1.$sV {
        constructor(opts) {
            super(opts);
            this.h = null;
            this.j = null;
            this.d = opts.actionName;
        }
        static { this.e = ['html', 'css', 'xml', 'xsl', 'haml', 'jade', 'jsx', 'slim', 'scss', 'sass', 'less', 'stylus', 'styl', 'svg']; }
        l(extensionService) {
            if (this.j !== extensionService) {
                this.j = extensionService;
                this.h = extensionService.readExtensionPointContributions(TMGrammars_1.$GBb).then((contributions) => {
                    return new GrammarContributions(contributions);
                });
            }
            return this.h || Promise.resolve(null);
        }
        run(accessor, editor) {
            const extensionService = accessor.get(extensions_1.$MF);
            const commandService = accessor.get(commands_1.$Fr);
            return this.l(extensionService).then((grammarContributions) => {
                if (this.id === 'editor.emmet.action.expandAbbreviation' && grammarContributions) {
                    return commandService.executeCommand('emmet.expandAbbreviation', $6Xb.getLanguage(editor, grammarContributions));
                }
                return undefined;
            });
        }
        static getLanguage(editor, grammars) {
            const model = editor.getModel();
            const selection = editor.getSelection();
            if (!model || !selection) {
                return null;
            }
            const position = selection.getStartPosition();
            model.tokenization.tokenizeIfCheap(position.lineNumber);
            const languageId = model.getLanguageIdAtPosition(position.lineNumber, position.column);
            const syntax = languageId.split('.').pop();
            if (!syntax) {
                return null;
            }
            const checkParentMode = () => {
                const languageGrammar = grammars.getGrammar(syntax);
                if (!languageGrammar) {
                    return syntax;
                }
                const languages = languageGrammar.split('.');
                if (languages.length < 2) {
                    return syntax;
                }
                for (let i = 1; i < languages.length; i++) {
                    const language = languages[languages.length - i];
                    if (this.e.indexOf(language) !== -1) {
                        return language;
                    }
                }
                return syntax;
            };
            return {
                language: syntax,
                parentMode: checkParentMode()
            };
        }
    }
    exports.$6Xb = $6Xb;
});
//# sourceMappingURL=emmetActions.js.map