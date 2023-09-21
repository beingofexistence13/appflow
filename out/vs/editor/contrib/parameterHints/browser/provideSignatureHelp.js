/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/types", "vs/base/common/uri", "vs/editor/common/core/position", "vs/editor/common/languages", "vs/editor/common/services/languageFeatures", "vs/editor/common/services/resolverService", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey"], function (require, exports, cancellation_1, errors_1, types_1, uri_1, position_1, languages, languageFeatures_1, resolverService_1, commands_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.provideSignatureHelp = exports.Context = void 0;
    exports.Context = {
        Visible: new contextkey_1.RawContextKey('parameterHintsVisible', false),
        MultipleSignatures: new contextkey_1.RawContextKey('parameterHintsMultipleSignatures', false),
    };
    async function provideSignatureHelp(registry, model, position, context, token) {
        const supports = registry.ordered(model);
        for (const support of supports) {
            try {
                const result = await support.provideSignatureHelp(model, position, token, context);
                if (result) {
                    return result;
                }
            }
            catch (err) {
                (0, errors_1.onUnexpectedExternalError)(err);
            }
        }
        return undefined;
    }
    exports.provideSignatureHelp = provideSignatureHelp;
    commands_1.CommandsRegistry.registerCommand('_executeSignatureHelpProvider', async (accessor, ...args) => {
        const [uri, position, triggerCharacter] = args;
        (0, types_1.assertType)(uri_1.URI.isUri(uri));
        (0, types_1.assertType)(position_1.Position.isIPosition(position));
        (0, types_1.assertType)(typeof triggerCharacter === 'string' || !triggerCharacter);
        const languageFeaturesService = accessor.get(languageFeatures_1.ILanguageFeaturesService);
        const ref = await accessor.get(resolverService_1.ITextModelService).createModelReference(uri);
        try {
            const result = await provideSignatureHelp(languageFeaturesService.signatureHelpProvider, ref.object.textEditorModel, position_1.Position.lift(position), {
                triggerKind: languages.SignatureHelpTriggerKind.Invoke,
                isRetrigger: false,
                triggerCharacter,
            }, cancellation_1.CancellationToken.None);
            if (!result) {
                return undefined;
            }
            setTimeout(() => result.dispose(), 0);
            return result.value;
        }
        finally {
            ref.dispose();
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdmlkZVNpZ25hdHVyZUhlbHAuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9wYXJhbWV0ZXJIaW50cy9icm93c2VyL3Byb3ZpZGVTaWduYXR1cmVIZWxwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWVuRixRQUFBLE9BQU8sR0FBRztRQUN0QixPQUFPLEVBQUUsSUFBSSwwQkFBYSxDQUFVLHVCQUF1QixFQUFFLEtBQUssQ0FBQztRQUNuRSxrQkFBa0IsRUFBRSxJQUFJLDBCQUFhLENBQVUsa0NBQWtDLEVBQUUsS0FBSyxDQUFDO0tBQ3pGLENBQUM7SUFFSyxLQUFLLFVBQVUsb0JBQW9CLENBQ3pDLFFBQWtFLEVBQ2xFLEtBQWlCLEVBQ2pCLFFBQWtCLEVBQ2xCLE9BQXVDLEVBQ3ZDLEtBQXdCO1FBR3hCLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFekMsS0FBSyxNQUFNLE9BQU8sSUFBSSxRQUFRLEVBQUU7WUFDL0IsSUFBSTtnQkFDSCxNQUFNLE1BQU0sR0FBRyxNQUFNLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDbkYsSUFBSSxNQUFNLEVBQUU7b0JBQ1gsT0FBTyxNQUFNLENBQUM7aUJBQ2Q7YUFDRDtZQUFDLE9BQU8sR0FBRyxFQUFFO2dCQUNiLElBQUEsa0NBQXlCLEVBQUMsR0FBRyxDQUFDLENBQUM7YUFDL0I7U0FDRDtRQUNELE9BQU8sU0FBUyxDQUFDO0lBQ2xCLENBQUM7SUFyQkQsb0RBcUJDO0lBRUQsMkJBQWdCLENBQUMsZUFBZSxDQUFDLCtCQUErQixFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsR0FBRyxJQUErQixFQUFFLEVBQUU7UUFDeEgsTUFBTSxDQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDL0MsSUFBQSxrQkFBVSxFQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMzQixJQUFBLGtCQUFVLEVBQUMsbUJBQVEsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUMzQyxJQUFBLGtCQUFVLEVBQUMsT0FBTyxnQkFBZ0IsS0FBSyxRQUFRLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBRXRFLE1BQU0sdUJBQXVCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywyQ0FBd0IsQ0FBQyxDQUFDO1FBRXZFLE1BQU0sR0FBRyxHQUFHLE1BQU0sUUFBUSxDQUFDLEdBQUcsQ0FBQyxtQ0FBaUIsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzVFLElBQUk7WUFFSCxNQUFNLE1BQU0sR0FBRyxNQUFNLG9CQUFvQixDQUFDLHVCQUF1QixDQUFDLHFCQUFxQixFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLG1CQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUM3SSxXQUFXLEVBQUUsU0FBUyxDQUFDLHdCQUF3QixDQUFDLE1BQU07Z0JBQ3RELFdBQVcsRUFBRSxLQUFLO2dCQUNsQixnQkFBZ0I7YUFDaEIsRUFBRSxnQ0FBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUUzQixJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNaLE9BQU8sU0FBUyxDQUFDO2FBQ2pCO1lBRUQsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN0QyxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUM7U0FFcEI7Z0JBQVM7WUFDVCxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDZDtJQUNGLENBQUMsQ0FBQyxDQUFDIn0=