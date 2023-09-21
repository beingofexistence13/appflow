/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/editor/common/services/languageFeatures", "vs/editor/common/services/resolverService", "vs/platform/commands/common/commands"], function (require, exports, cancellation_1, languageFeatures_1, resolverService_1, commands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    commands_1.CommandsRegistry.registerCommand('_executeMappedEditsProvider', async (accessor, documentUri, codeBlocks, context) => {
        const modelService = accessor.get(resolverService_1.ITextModelService);
        const langFeaturesService = accessor.get(languageFeatures_1.ILanguageFeaturesService);
        const document = await modelService.createModelReference(documentUri);
        let result = null;
        try {
            const providers = langFeaturesService.mappedEditsProvider.ordered(document.object.textEditorModel);
            if (providers.length > 0) {
                const mostRelevantProvider = providers[0];
                const cancellationTokenSource = new cancellation_1.CancellationTokenSource();
                result = await mostRelevantProvider.provideMappedEdits(document.object.textEditorModel, codeBlocks, context, cancellationTokenSource.token);
            }
        }
        finally {
            document.dispose();
        }
        return result;
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwcGVkRWRpdHMuY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbWFwcGVkRWRpdHMvY29tbW9uL21hcHBlZEVkaXRzLmNvbnRyaWJ1dGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQVVoRywyQkFBZ0IsQ0FBQyxlQUFlLENBQy9CLDZCQUE2QixFQUM3QixLQUFLLEVBQ0osUUFBMEIsRUFDMUIsV0FBZ0IsRUFDaEIsVUFBb0IsRUFDcEIsT0FBcUMsRUFDSyxFQUFFO1FBRTVDLE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsbUNBQWlCLENBQUMsQ0FBQztRQUNyRCxNQUFNLG1CQUFtQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsMkNBQXdCLENBQUMsQ0FBQztRQUVuRSxNQUFNLFFBQVEsR0FBRyxNQUFNLFlBQVksQ0FBQyxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUV0RSxJQUFJLE1BQU0sR0FBbUMsSUFBSSxDQUFDO1FBRWxELElBQUk7WUFDSCxNQUFNLFNBQVMsR0FBRyxtQkFBbUIsQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUVuRyxJQUFJLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUN6QixNQUFNLG9CQUFvQixHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFMUMsTUFBTSx1QkFBdUIsR0FBRyxJQUFJLHNDQUF1QixFQUFFLENBQUM7Z0JBRTlELE1BQU0sR0FBRyxNQUFNLG9CQUFvQixDQUFDLGtCQUFrQixDQUNyRCxRQUFRLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFDL0IsVUFBVSxFQUNWLE9BQU8sRUFDUCx1QkFBdUIsQ0FBQyxLQUFLLENBQzdCLENBQUM7YUFDRjtTQUNEO2dCQUFTO1lBQ1QsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDO1NBQ25CO1FBRUQsT0FBTyxNQUFNLENBQUM7SUFDZixDQUFDLENBQ0QsQ0FBQyJ9