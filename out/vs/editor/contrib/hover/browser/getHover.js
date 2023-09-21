/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errors", "vs/editor/browser/editorExtensions", "vs/editor/common/services/languageFeatures"], function (require, exports, async_1, cancellation_1, errors_1, editorExtensions_1, languageFeatures_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getHoverPromise = exports.getHover = exports.HoverProviderResult = void 0;
    class HoverProviderResult {
        constructor(provider, hover, ordinal) {
            this.provider = provider;
            this.hover = hover;
            this.ordinal = ordinal;
        }
    }
    exports.HoverProviderResult = HoverProviderResult;
    async function executeProvider(provider, ordinal, model, position, token) {
        try {
            const result = await Promise.resolve(provider.provideHover(model, position, token));
            if (result && isValid(result)) {
                return new HoverProviderResult(provider, result, ordinal);
            }
        }
        catch (err) {
            (0, errors_1.onUnexpectedExternalError)(err);
        }
        return undefined;
    }
    function getHover(registry, model, position, token) {
        const providers = registry.ordered(model);
        const promises = providers.map((provider, index) => executeProvider(provider, index, model, position, token));
        return async_1.AsyncIterableObject.fromPromises(promises).coalesce();
    }
    exports.getHover = getHover;
    function getHoverPromise(registry, model, position, token) {
        return getHover(registry, model, position, token).map(item => item.hover).toPromise();
    }
    exports.getHoverPromise = getHoverPromise;
    (0, editorExtensions_1.registerModelAndPositionCommand)('_executeHoverProvider', (accessor, model, position) => {
        const languageFeaturesService = accessor.get(languageFeatures_1.ILanguageFeaturesService);
        return getHoverPromise(languageFeaturesService.hoverProvider, model, position, cancellation_1.CancellationToken.None);
    });
    function isValid(result) {
        const hasRange = (typeof result.range !== 'undefined');
        const hasHtmlContent = typeof result.contents !== 'undefined' && result.contents && result.contents.length > 0;
        return hasRange && hasHtmlContent;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0SG92ZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9ob3Zlci9icm93c2VyL2dldEhvdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVloRyxNQUFhLG1CQUFtQjtRQUMvQixZQUNpQixRQUF1QixFQUN2QixLQUFZLEVBQ1osT0FBZTtZQUZmLGFBQVEsR0FBUixRQUFRLENBQWU7WUFDdkIsVUFBSyxHQUFMLEtBQUssQ0FBTztZQUNaLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFDNUIsQ0FBQztLQUNMO0lBTkQsa0RBTUM7SUFFRCxLQUFLLFVBQVUsZUFBZSxDQUFDLFFBQXVCLEVBQUUsT0FBZSxFQUFFLEtBQWlCLEVBQUUsUUFBa0IsRUFBRSxLQUF3QjtRQUN2SSxJQUFJO1lBQ0gsTUFBTSxNQUFNLEdBQUcsTUFBTSxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ3BGLElBQUksTUFBTSxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDOUIsT0FBTyxJQUFJLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7YUFDMUQ7U0FDRDtRQUFDLE9BQU8sR0FBRyxFQUFFO1lBQ2IsSUFBQSxrQ0FBeUIsRUFBQyxHQUFHLENBQUMsQ0FBQztTQUMvQjtRQUNELE9BQU8sU0FBUyxDQUFDO0lBQ2xCLENBQUM7SUFFRCxTQUFnQixRQUFRLENBQUMsUUFBZ0QsRUFBRSxLQUFpQixFQUFFLFFBQWtCLEVBQUUsS0FBd0I7UUFDekksTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMxQyxNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQzlHLE9BQU8sMkJBQW1CLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzlELENBQUM7SUFKRCw0QkFJQztJQUVELFNBQWdCLGVBQWUsQ0FBQyxRQUFnRCxFQUFFLEtBQWlCLEVBQUUsUUFBa0IsRUFBRSxLQUF3QjtRQUNoSixPQUFPLFFBQVEsQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDdkYsQ0FBQztJQUZELDBDQUVDO0lBRUQsSUFBQSxrREFBK0IsRUFBQyx1QkFBdUIsRUFBRSxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLEVBQUU7UUFDdEYsTUFBTSx1QkFBdUIsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDJDQUF3QixDQUFDLENBQUM7UUFDdkUsT0FBTyxlQUFlLENBQUMsdUJBQXVCLENBQUMsYUFBYSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsZ0NBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDeEcsQ0FBQyxDQUFDLENBQUM7SUFFSCxTQUFTLE9BQU8sQ0FBQyxNQUFhO1FBQzdCLE1BQU0sUUFBUSxHQUFHLENBQUMsT0FBTyxNQUFNLENBQUMsS0FBSyxLQUFLLFdBQVcsQ0FBQyxDQUFDO1FBQ3ZELE1BQU0sY0FBYyxHQUFHLE9BQU8sTUFBTSxDQUFDLFFBQVEsS0FBSyxXQUFXLElBQUksTUFBTSxDQUFDLFFBQVEsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDL0csT0FBTyxRQUFRLElBQUksY0FBYyxDQUFDO0lBQ25DLENBQUMifQ==