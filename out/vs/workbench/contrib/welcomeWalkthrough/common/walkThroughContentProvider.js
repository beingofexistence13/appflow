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
define(["require", "exports", "vs/editor/common/services/resolverService", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/base/common/marked/marked", "vs/base/common/network", "vs/editor/common/core/range", "vs/editor/common/model/textModel", "vs/base/common/types", "vs/platform/instantiation/common/instantiation"], function (require, exports, resolverService_1, model_1, language_1, marked_1, network_1, range_1, textModel_1, types_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WalkThroughSnippetContentProvider = exports.requireToContent = void 0;
    function requireToContent(instantiationService, resource) {
        if (!resource.query) {
            throw new Error('Welcome: invalid resource');
        }
        const query = JSON.parse(resource.query);
        if (!query.moduleId) {
            throw new Error('Welcome: invalid resource');
        }
        const content = new Promise((resolve, reject) => {
            require([query.moduleId], content => {
                try {
                    resolve(instantiationService.invokeFunction(content.default));
                }
                catch (err) {
                    reject(err);
                }
            });
        });
        return content;
    }
    exports.requireToContent = requireToContent;
    let WalkThroughSnippetContentProvider = class WalkThroughSnippetContentProvider {
        constructor(textModelResolverService, languageService, modelService, instantiationService) {
            this.textModelResolverService = textModelResolverService;
            this.languageService = languageService;
            this.modelService = modelService;
            this.instantiationService = instantiationService;
            this.loads = new Map();
            this.textModelResolverService.registerTextModelContentProvider(network_1.Schemas.walkThroughSnippet, this);
        }
        async textBufferFactoryFromResource(resource) {
            let ongoing = this.loads.get(resource.toString());
            if (!ongoing) {
                ongoing = requireToContent(this.instantiationService, resource)
                    .then(content => (0, textModel_1.createTextBufferFactory)(content))
                    .finally(() => this.loads.delete(resource.toString()));
                this.loads.set(resource.toString(), ongoing);
            }
            return ongoing;
        }
        async provideTextContent(resource) {
            const factory = await this.textBufferFactoryFromResource(resource.with({ fragment: '' }));
            let codeEditorModel = this.modelService.getModel(resource);
            if (!codeEditorModel) {
                const j = parseInt(resource.fragment);
                let i = 0;
                const renderer = new marked_1.marked.Renderer();
                renderer.code = (code, lang) => {
                    i++;
                    const languageId = typeof lang === 'string' ? this.languageService.getLanguageIdByLanguageName(lang) || '' : '';
                    const languageSelection = this.languageService.createById(languageId);
                    // Create all models for this resource in one go... we'll need them all and we don't want to re-parse markdown each time
                    const model = this.modelService.createModel(code, languageSelection, resource.with({ fragment: `${i}.${lang}` }));
                    if (i === j) {
                        codeEditorModel = model;
                    }
                    return '';
                };
                const textBuffer = factory.create(1 /* DefaultEndOfLine.LF */).textBuffer;
                const lineCount = textBuffer.getLineCount();
                const range = new range_1.Range(1, 1, lineCount, textBuffer.getLineLength(lineCount) + 1);
                const markdown = textBuffer.getValueInRange(range, 0 /* EndOfLinePreference.TextDefined */);
                (0, marked_1.marked)(markdown, { renderer });
            }
            return (0, types_1.assertIsDefined)(codeEditorModel);
        }
    };
    exports.WalkThroughSnippetContentProvider = WalkThroughSnippetContentProvider;
    exports.WalkThroughSnippetContentProvider = WalkThroughSnippetContentProvider = __decorate([
        __param(0, resolverService_1.ITextModelService),
        __param(1, language_1.ILanguageService),
        __param(2, model_1.IModelService),
        __param(3, instantiation_1.IInstantiationService)
    ], WalkThroughSnippetContentProvider);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Fsa1Rocm91Z2hDb250ZW50UHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi93ZWxjb21lV2Fsa3Rocm91Z2gvY29tbW9uL3dhbGtUaHJvdWdoQ29udGVudFByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWVoRyxTQUFnQixnQkFBZ0IsQ0FBQyxvQkFBMkMsRUFBRSxRQUFhO1FBQzFGLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFO1lBQ3BCLE1BQU0sSUFBSSxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQztTQUM3QztRQUVELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFO1lBQ3BCLE1BQU0sSUFBSSxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQztTQUM3QztRQUVELE1BQU0sT0FBTyxHQUFvQixJQUFJLE9BQU8sQ0FBUyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUN4RSxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsT0FBTyxDQUFDLEVBQUU7Z0JBQ25DLElBQUk7b0JBQ0gsT0FBTyxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztpQkFDOUQ7Z0JBQUMsT0FBTyxHQUFHLEVBQUU7b0JBQ2IsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUNaO1lBQ0YsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sT0FBTyxDQUFDO0lBQ2hCLENBQUM7SUFyQkQsNENBcUJDO0lBRU0sSUFBTSxpQ0FBaUMsR0FBdkMsTUFBTSxpQ0FBaUM7UUFHN0MsWUFDb0Isd0JBQTRELEVBQzdELGVBQWtELEVBQ3JELFlBQTRDLEVBQ3BDLG9CQUE0RDtZQUgvQyw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQW1CO1lBQzVDLG9CQUFlLEdBQWYsZUFBZSxDQUFrQjtZQUNwQyxpQkFBWSxHQUFaLFlBQVksQ0FBZTtZQUNuQix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBTjVFLFVBQUssR0FBRyxJQUFJLEdBQUcsRUFBdUMsQ0FBQztZQVE5RCxJQUFJLENBQUMsd0JBQXdCLENBQUMsZ0NBQWdDLENBQUMsaUJBQU8sQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNsRyxDQUFDO1FBRU8sS0FBSyxDQUFDLDZCQUE2QixDQUFDLFFBQWE7WUFDeEQsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDbEQsSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDYixPQUFPLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLFFBQVEsQ0FBQztxQkFDN0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsSUFBQSxtQ0FBdUIsRUFBQyxPQUFPLENBQUMsQ0FBQztxQkFDakQsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hELElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQzthQUM3QztZQUNELE9BQU8sT0FBTyxDQUFDO1FBQ2hCLENBQUM7UUFFTSxLQUFLLENBQUMsa0JBQWtCLENBQUMsUUFBYTtZQUM1QyxNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxRixJQUFJLGVBQWUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMzRCxJQUFJLENBQUMsZUFBZSxFQUFFO2dCQUNyQixNQUFNLENBQUMsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUN0QyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ1YsTUFBTSxRQUFRLEdBQUcsSUFBSSxlQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ3ZDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEVBQUU7b0JBQzlCLENBQUMsRUFBRSxDQUFDO29CQUNKLE1BQU0sVUFBVSxHQUFHLE9BQU8sSUFBSSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQywyQkFBMkIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztvQkFDaEgsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDdEUsd0hBQXdIO29CQUN4SCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLFFBQVEsRUFBRSxHQUFHLENBQUMsSUFBSSxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDbEgsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFO3dCQUFFLGVBQWUsR0FBRyxLQUFLLENBQUM7cUJBQUU7b0JBQ3pDLE9BQU8sRUFBRSxDQUFDO2dCQUNYLENBQUMsQ0FBQztnQkFDRixNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsTUFBTSw2QkFBcUIsQ0FBQyxVQUFVLENBQUM7Z0JBQ2xFLE1BQU0sU0FBUyxHQUFHLFVBQVUsQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDNUMsTUFBTSxLQUFLLEdBQUcsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsVUFBVSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDbEYsTUFBTSxRQUFRLEdBQUcsVUFBVSxDQUFDLGVBQWUsQ0FBQyxLQUFLLDBDQUFrQyxDQUFDO2dCQUNwRixJQUFBLGVBQU0sRUFBQyxRQUFRLEVBQUUsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO2FBQy9CO1lBQ0QsT0FBTyxJQUFBLHVCQUFlLEVBQUMsZUFBZSxDQUFDLENBQUM7UUFDekMsQ0FBQztLQUNELENBQUE7SUEvQ1ksOEVBQWlDO2dEQUFqQyxpQ0FBaUM7UUFJM0MsV0FBQSxtQ0FBaUIsQ0FBQTtRQUNqQixXQUFBLDJCQUFnQixDQUFBO1FBQ2hCLFdBQUEscUJBQWEsQ0FBQTtRQUNiLFdBQUEscUNBQXFCLENBQUE7T0FQWCxpQ0FBaUMsQ0ErQzdDIn0=