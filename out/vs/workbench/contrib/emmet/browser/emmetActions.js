/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/workbench/services/textMate/common/TMGrammars", "vs/workbench/services/extensions/common/extensions", "vs/platform/commands/common/commands"], function (require, exports, editorExtensions_1, TMGrammars_1, extensions_1, commands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EmmetEditorAction = void 0;
    class GrammarContributions {
        static { this._grammars = {}; }
        constructor(contributions) {
            if (!Object.keys(GrammarContributions._grammars).length) {
                this.fillModeScopeMap(contributions);
            }
        }
        fillModeScopeMap(contributions) {
            contributions.forEach((contribution) => {
                contribution.value.forEach((grammar) => {
                    if (grammar.language && grammar.scopeName) {
                        GrammarContributions._grammars[grammar.language] = grammar.scopeName;
                    }
                });
            });
        }
        getGrammar(mode) {
            return GrammarContributions._grammars[mode];
        }
    }
    class EmmetEditorAction extends editorExtensions_1.EditorAction {
        constructor(opts) {
            super(opts);
            this._lastGrammarContributions = null;
            this._lastExtensionService = null;
            this.emmetActionName = opts.actionName;
        }
        static { this.emmetSupportedModes = ['html', 'css', 'xml', 'xsl', 'haml', 'jade', 'jsx', 'slim', 'scss', 'sass', 'less', 'stylus', 'styl', 'svg']; }
        _withGrammarContributions(extensionService) {
            if (this._lastExtensionService !== extensionService) {
                this._lastExtensionService = extensionService;
                this._lastGrammarContributions = extensionService.readExtensionPointContributions(TMGrammars_1.grammarsExtPoint).then((contributions) => {
                    return new GrammarContributions(contributions);
                });
            }
            return this._lastGrammarContributions || Promise.resolve(null);
        }
        run(accessor, editor) {
            const extensionService = accessor.get(extensions_1.IExtensionService);
            const commandService = accessor.get(commands_1.ICommandService);
            return this._withGrammarContributions(extensionService).then((grammarContributions) => {
                if (this.id === 'editor.emmet.action.expandAbbreviation' && grammarContributions) {
                    return commandService.executeCommand('emmet.expandAbbreviation', EmmetEditorAction.getLanguage(editor, grammarContributions));
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
                    if (this.emmetSupportedModes.indexOf(language) !== -1) {
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
    exports.EmmetEditorAction = EmmetEditorAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1tZXRBY3Rpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZW1tZXQvYnJvd3Nlci9lbW1ldEFjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBZ0JoRyxNQUFNLG9CQUFvQjtpQkFFVixjQUFTLEdBQWlCLEVBQUUsQ0FBQztRQUU1QyxZQUFZLGFBQXNFO1lBQ2pGLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sRUFBRTtnQkFDeEQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDO2FBQ3JDO1FBQ0YsQ0FBQztRQUVPLGdCQUFnQixDQUFDLGFBQXNFO1lBQzlGLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxZQUFZLEVBQUUsRUFBRTtnQkFDdEMsWUFBWSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtvQkFDdEMsSUFBSSxPQUFPLENBQUMsUUFBUSxJQUFJLE9BQU8sQ0FBQyxTQUFTLEVBQUU7d0JBQzFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQztxQkFDckU7Z0JBQ0YsQ0FBQyxDQUFDLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFTSxVQUFVLENBQUMsSUFBWTtZQUM3QixPQUFPLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3QyxDQUFDOztJQU9GLE1BQXNCLGlCQUFrQixTQUFRLCtCQUFZO1FBSTNELFlBQVksSUFBeUI7WUFDcEMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBTUwsOEJBQXlCLEdBQXlDLElBQUksQ0FBQztZQUN2RSwwQkFBcUIsR0FBNkIs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