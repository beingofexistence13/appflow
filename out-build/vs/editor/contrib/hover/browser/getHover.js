/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errors", "vs/editor/browser/editorExtensions", "vs/editor/common/services/languageFeatures"], function (require, exports, async_1, cancellation_1, errors_1, editorExtensions_1, languageFeatures_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$84 = exports.$74 = exports.$64 = void 0;
    class $64 {
        constructor(provider, hover, ordinal) {
            this.provider = provider;
            this.hover = hover;
            this.ordinal = ordinal;
        }
    }
    exports.$64 = $64;
    async function executeProvider(provider, ordinal, model, position, token) {
        try {
            const result = await Promise.resolve(provider.provideHover(model, position, token));
            if (result && isValid(result)) {
                return new $64(provider, result, ordinal);
            }
        }
        catch (err) {
            (0, errors_1.$Z)(err);
        }
        return undefined;
    }
    function $74(registry, model, position, token) {
        const providers = registry.ordered(model);
        const promises = providers.map((provider, index) => executeProvider(provider, index, model, position, token));
        return async_1.$3g.fromPromises(promises).coalesce();
    }
    exports.$74 = $74;
    function $84(registry, model, position, token) {
        return $74(registry, model, position, token).map(item => item.hover).toPromise();
    }
    exports.$84 = $84;
    (0, editorExtensions_1.$vV)('_executeHoverProvider', (accessor, model, position) => {
        const languageFeaturesService = accessor.get(languageFeatures_1.$hF);
        return $84(languageFeaturesService.hoverProvider, model, position, cancellation_1.CancellationToken.None);
    });
    function isValid(result) {
        const hasRange = (typeof result.range !== 'undefined');
        const hasHtmlContent = typeof result.contents !== 'undefined' && result.contents && result.contents.length > 0;
        return hasRange && hasHtmlContent;
    }
});
//# sourceMappingURL=getHover.js.map