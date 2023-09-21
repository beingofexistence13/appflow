/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/languageFeatureRegistry", "vs/editor/common/services/languageFeatures", "vs/platform/instantiation/common/extensions"], function (require, exports, languageFeatureRegistry_1, languageFeatures_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LanguageFeaturesService = void 0;
    class LanguageFeaturesService {
        constructor() {
            this.referenceProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.renameProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.codeActionProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.definitionProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.typeDefinitionProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.declarationProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.implementationProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.documentSymbolProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.inlayHintsProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.colorProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.codeLensProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.documentFormattingEditProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.documentRangeFormattingEditProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.onTypeFormattingEditProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.signatureHelpProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.hoverProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.documentHighlightProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.selectionRangeProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.foldingRangeProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.linkProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.inlineCompletionsProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.completionProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.linkedEditingRangeProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.inlineValuesProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.evaluatableExpressionProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.documentRangeSemanticTokensProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.documentSemanticTokensProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.documentOnDropEditProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.documentPasteEditProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
            this.mappedEditsProvider = new languageFeatureRegistry_1.LanguageFeatureRegistry(this._score.bind(this));
        }
        setNotebookTypeResolver(resolver) {
            this._notebookTypeResolver = resolver;
        }
        _score(uri) {
            return this._notebookTypeResolver?.(uri);
        }
    }
    exports.LanguageFeaturesService = LanguageFeaturesService;
    (0, extensions_1.registerSingleton)(languageFeatures_1.ILanguageFeaturesService, LanguageFeaturesService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2VGZWF0dXJlc1NlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL3NlcnZpY2VzL2xhbmd1YWdlRmVhdHVyZXNTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVFoRyxNQUFhLHVCQUF1QjtRQUFwQztZQUlVLHNCQUFpQixHQUFHLElBQUksaURBQXVCLENBQW9CLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDM0YsbUJBQWMsR0FBRyxJQUFJLGlEQUF1QixDQUFpQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3JGLHVCQUFrQixHQUFHLElBQUksaURBQXVCLENBQXFCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDN0YsdUJBQWtCLEdBQUcsSUFBSSxpREFBdUIsQ0FBcUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUM3RiwyQkFBc0IsR0FBRyxJQUFJLGlEQUF1QixDQUF5QixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3JHLHdCQUFtQixHQUFHLElBQUksaURBQXVCLENBQXNCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDL0YsMkJBQXNCLEdBQUcsSUFBSSxpREFBdUIsQ0FBeUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNyRywyQkFBc0IsR0FBRyxJQUFJLGlEQUF1QixDQUF5QixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3JHLHVCQUFrQixHQUFHLElBQUksaURBQXVCLENBQXFCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDN0Ysa0JBQWEsR0FBRyxJQUFJLGlEQUF1QixDQUF3QixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzNGLHFCQUFnQixHQUFHLElBQUksaURBQXVCLENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDekYsbUNBQThCLEdBQUcsSUFBSSxpREFBdUIsQ0FBaUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNySCx3Q0FBbUMsR0FBRyxJQUFJLGlEQUF1QixDQUFzQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQy9ILGlDQUE0QixHQUFHLElBQUksaURBQXVCLENBQStCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDakgsMEJBQXFCLEdBQUcsSUFBSSxpREFBdUIsQ0FBd0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNuRyxrQkFBYSxHQUFHLElBQUksaURBQXVCLENBQWdCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDbkYsOEJBQXlCLEdBQUcsSUFBSSxpREFBdUIsQ0FBNEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUMzRywyQkFBc0IsR0FBRyxJQUFJLGlEQUF1QixDQUF5QixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3JHLHlCQUFvQixHQUFHLElBQUksaURBQXVCLENBQXVCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDakcsaUJBQVksR0FBRyxJQUFJLGlEQUF1QixDQUFlLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDakYsOEJBQXlCLEdBQUcsSUFBSSxpREFBdUIsQ0FBNEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUMzRyx1QkFBa0IsR0FBRyxJQUFJLGlEQUF1QixDQUF5QixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ2pHLCtCQUEwQixHQUFHLElBQUksaURBQXVCLENBQTZCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDN0cseUJBQW9CLEdBQUcsSUFBSSxpREFBdUIsQ0FBdUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNqRyxrQ0FBNkIsR0FBRyxJQUFJLGlEQUF1QixDQUFnQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ25ILHdDQUFtQyxHQUFHLElBQUksaURBQXVCLENBQXNDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDL0gsbUNBQThCLEdBQUcsSUFBSSxpREFBdUIsQ0FBaUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNySCwrQkFBMEIsR0FBRyxJQUFJLGlEQUF1QixDQUE2QixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzdHLDhCQUF5QixHQUFHLElBQUksaURBQXVCLENBQTRCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDM0csd0JBQW1CLEdBQWlELElBQUksaURBQXVCLENBQXNCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFZdkosQ0FBQztRQVJBLHVCQUF1QixDQUFDLFFBQTBDO1lBQ2pFLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxRQUFRLENBQUM7UUFDdkMsQ0FBQztRQUVPLE1BQU0sQ0FBQyxHQUFRO1lBQ3RCLE9BQU8sSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDMUMsQ0FBQztLQUVEO0lBN0NELDBEQTZDQztJQUVELElBQUEsOEJBQWlCLEVBQUMsMkNBQXdCLEVBQUUsdUJBQXVCLG9DQUE0QixDQUFDIn0=