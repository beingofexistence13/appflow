/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/editor/common/services/languageFeatures", "vs/editor/common/services/resolverService", "vs/platform/commands/common/commands"], function (require, exports, cancellation_1, languageFeatures_1, resolverService_1, commands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    commands_1.$Gr.registerCommand('_executeMappedEditsProvider', async (accessor, documentUri, codeBlocks, context) => {
        const modelService = accessor.get(resolverService_1.$uA);
        const langFeaturesService = accessor.get(languageFeatures_1.$hF);
        const document = await modelService.createModelReference(documentUri);
        let result = null;
        try {
            const providers = langFeaturesService.mappedEditsProvider.ordered(document.object.textEditorModel);
            if (providers.length > 0) {
                const mostRelevantProvider = providers[0];
                const cancellationTokenSource = new cancellation_1.$pd();
                result = await mostRelevantProvider.provideMappedEdits(document.object.textEditorModel, codeBlocks, context, cancellationTokenSource.token);
            }
        }
        finally {
            document.dispose();
        }
        return result;
    });
});
//# sourceMappingURL=mappedEdits.contribution.js.map