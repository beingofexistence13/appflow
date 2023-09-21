/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/editor/common/editorFeatures", "vs/editor/contrib/dropOrPasteInto/browser/copyPasteController", "vs/editor/contrib/dropOrPasteInto/browser/defaultProviders", "vs/nls"], function (require, exports, editorExtensions_1, editorFeatures_1, copyPasteController_1, defaultProviders_1, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, editorExtensions_1.registerEditorContribution)(copyPasteController_1.CopyPasteController.ID, copyPasteController_1.CopyPasteController, 0 /* EditorContributionInstantiation.Eager */); // eager because it listens to events on the container dom node of the editor
    (0, editorFeatures_1.registerEditorFeature)(defaultProviders_1.DefaultPasteProvidersFeature);
    (0, editorExtensions_1.registerEditorCommand)(new class extends editorExtensions_1.EditorCommand {
        constructor() {
            super({
                id: copyPasteController_1.changePasteTypeCommandId,
                precondition: copyPasteController_1.pasteWidgetVisibleCtx,
                kbOpts: {
                    weight: 100 /* KeybindingWeight.EditorContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 89 /* KeyCode.Period */,
                }
            });
        }
        runEditorCommand(_accessor, editor, _args) {
            return copyPasteController_1.CopyPasteController.get(editor)?.changePasteType();
        }
    });
    (0, editorExtensions_1.registerEditorAction)(class extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.pasteAs',
                label: nls.localize('pasteAs', "Paste As..."),
                alias: 'Paste As...',
                precondition: undefined,
                description: {
                    description: 'Paste as',
                    args: [{
                            name: 'args',
                            schema: {
                                type: 'object',
                                properties: {
                                    'id': {
                                        type: 'string',
                                        description: nls.localize('pasteAs.id', "The id of the paste edit to try applying. If not provided, the editor will show a picker."),
                                    }
                                },
                            }
                        }]
                }
            });
        }
        run(_accessor, editor, args) {
            const id = typeof args?.id === 'string' ? args.id : undefined;
            return copyPasteController_1.CopyPasteController.get(editor)?.pasteAs(id);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29weVBhc3RlQ29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvZHJvcE9yUGFzdGVJbnRvL2Jyb3dzZXIvY29weVBhc3RlQ29udHJpYnV0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBV2hHLElBQUEsNkNBQTBCLEVBQUMseUNBQW1CLENBQUMsRUFBRSxFQUFFLHlDQUFtQixnREFBd0MsQ0FBQyxDQUFDLDZFQUE2RTtJQUU3TCxJQUFBLHNDQUFxQixFQUFDLCtDQUE0QixDQUFDLENBQUM7SUFFcEQsSUFBQSx3Q0FBcUIsRUFBQyxJQUFJLEtBQU0sU0FBUSxnQ0FBYTtRQUNwRDtZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsOENBQXdCO2dCQUM1QixZQUFZLEVBQUUsMkNBQXFCO2dCQUNuQyxNQUFNLEVBQUU7b0JBQ1AsTUFBTSwwQ0FBZ0M7b0JBQ3RDLE9BQU8sRUFBRSxtREFBK0I7aUJBQ3hDO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVlLGdCQUFnQixDQUFDLFNBQWtDLEVBQUUsTUFBbUIsRUFBRSxLQUFVO1lBQ25HLE9BQU8seUNBQW1CLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLGVBQWUsRUFBRSxDQUFDO1FBQzNELENBQUM7S0FDRCxDQUFDLENBQUM7SUFFSCxJQUFBLHVDQUFvQixFQUFDLEtBQU0sU0FBUSwrQkFBWTtRQUM5QztZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsdUJBQXVCO2dCQUMzQixLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsYUFBYSxDQUFDO2dCQUM3QyxLQUFLLEVBQUUsYUFBYTtnQkFDcEIsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLFdBQVcsRUFBRTtvQkFDWixXQUFXLEVBQUUsVUFBVTtvQkFDdkIsSUFBSSxFQUFFLENBQUM7NEJBQ04sSUFBSSxFQUFFLE1BQU07NEJBQ1osTUFBTSxFQUFFO2dDQUNQLElBQUksRUFBRSxRQUFRO2dDQUNkLFVBQVUsRUFBRTtvQ0FDWCxJQUFJLEVBQUU7d0NBQ0wsSUFBSSxFQUFFLFFBQVE7d0NBQ2QsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLDJGQUEyRixDQUFDO3FDQUNwSTtpQ0FDRDs2QkFDRDt5QkFDRCxDQUFDO2lCQUNGO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVlLEdBQUcsQ0FBQyxTQUEyQixFQUFFLE1BQW1CLEVBQUUsSUFBUztZQUM5RSxNQUFNLEVBQUUsR0FBRyxPQUFPLElBQUksRUFBRSxFQUFFLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7WUFDOUQsT0FBTyx5Q0FBbUIsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3JELENBQUM7S0FDRCxDQUFDLENBQUMifQ==