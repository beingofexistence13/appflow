/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/workbench/services/editor/common/editorService", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/welcomeWalkthrough/browser/walkThroughInput", "vs/base/common/network", "vs/platform/actions/common/actions", "vs/platform/action/common/actionCommonCategories", "vs/workbench/contrib/welcomeWalkthrough/browser/editor/vs_code_editor_walkthrough"], function (require, exports, nls_1, editorService_1, instantiation_1, walkThroughInput_1, network_1, actions_1, actionCommonCategories_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditorWalkThroughInputSerializer = exports.EditorWalkThroughAction = void 0;
    const typeId = 'workbench.editors.walkThroughInput';
    const inputOptions = {
        typeId,
        name: (0, nls_1.localize)('editorWalkThrough.title', "Editor Playground"),
        resource: network_1.FileAccess.asBrowserUri('vs/workbench/contrib/welcomeWalkthrough/browser/editor/vs_code_editor_walkthrough.md')
            .with({
            scheme: network_1.Schemas.walkThrough,
            query: JSON.stringify({ moduleId: 'vs/workbench/contrib/welcomeWalkthrough/browser/editor/vs_code_editor_walkthrough' })
        }),
        telemetryFrom: 'walkThrough'
    };
    class EditorWalkThroughAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.showInteractivePlayground'; }
        static { this.LABEL = { value: (0, nls_1.localize)('editorWalkThrough', "Interactive Editor Playground"), original: 'Interactive Editor Playground' }; }
        constructor() {
            super({
                id: EditorWalkThroughAction.ID,
                title: EditorWalkThroughAction.LABEL,
                category: actionCommonCategories_1.Categories.Help,
                f1: true
            });
        }
        run(serviceAccessor) {
            const editorService = serviceAccessor.get(editorService_1.IEditorService);
            const instantiationService = serviceAccessor.get(instantiation_1.IInstantiationService);
            const input = instantiationService.createInstance(walkThroughInput_1.WalkThroughInput, inputOptions);
            // TODO @lramos15 adopt the resolver here
            return editorService.openEditor(input, { pinned: true })
                .then(() => void (0));
        }
    }
    exports.EditorWalkThroughAction = EditorWalkThroughAction;
    class EditorWalkThroughInputSerializer {
        static { this.ID = typeId; }
        canSerialize(editorInput) {
            return true;
        }
        serialize(editorInput) {
            return '';
        }
        deserialize(instantiationService) {
            return instantiationService.createInstance(walkThroughInput_1.WalkThroughInput, inputOptions);
        }
    }
    exports.EditorWalkThroughInputSerializer = EditorWalkThroughInputSerializer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yV2Fsa1Rocm91Z2guanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi93ZWxjb21lV2Fsa3Rocm91Z2gvYnJvd3Nlci9lZGl0b3IvZWRpdG9yV2Fsa1Rocm91Z2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBYWhHLE1BQU0sTUFBTSxHQUFHLG9DQUFvQyxDQUFDO0lBQ3BELE1BQU0sWUFBWSxHQUE0QjtRQUM3QyxNQUFNO1FBQ04sSUFBSSxFQUFFLElBQUEsY0FBUSxFQUFDLHlCQUF5QixFQUFFLG1CQUFtQixDQUFDO1FBQzlELFFBQVEsRUFBRSxvQkFBVSxDQUFDLFlBQVksQ0FBQyxzRkFBc0YsQ0FBQzthQUN2SCxJQUFJLENBQUM7WUFDTCxNQUFNLEVBQUUsaUJBQU8sQ0FBQyxXQUFXO1lBQzNCLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsUUFBUSxFQUFFLG1GQUFtRixFQUFFLENBQUM7U0FDeEgsQ0FBQztRQUNILGFBQWEsRUFBRSxhQUFhO0tBQzVCLENBQUM7SUFFRixNQUFhLHVCQUF3QixTQUFRLGlCQUFPO2lCQUU1QixPQUFFLEdBQUcsNENBQTRDLENBQUM7aUJBQ2xELFVBQUssR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxtQkFBbUIsRUFBRSwrQkFBK0IsQ0FBQyxFQUFFLFFBQVEsRUFBRSwrQkFBK0IsRUFBRSxDQUFDO1FBRXBKO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSx1QkFBdUIsQ0FBQyxFQUFFO2dCQUM5QixLQUFLLEVBQUUsdUJBQXVCLENBQUMsS0FBSztnQkFDcEMsUUFBUSxFQUFFLG1DQUFVLENBQUMsSUFBSTtnQkFDekIsRUFBRSxFQUFFLElBQUk7YUFDUixDQUFDLENBQUM7UUFDSixDQUFDO1FBRWUsR0FBRyxDQUFDLGVBQWlDO1lBQ3BELE1BQU0sYUFBYSxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMsOEJBQWMsQ0FBQyxDQUFDO1lBQzFELE1BQU0sb0JBQW9CLEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUIsQ0FBQyxDQUFDO1lBQ3hFLE1BQU0sS0FBSyxHQUFHLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxtQ0FBZ0IsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUNsRix5Q0FBeUM7WUFDekMsT0FBTyxhQUFhLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQztpQkFDdEQsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hCLENBQUM7O0lBckJGLDBEQXNCQztJQUVELE1BQWEsZ0NBQWdDO2lCQUU1QixPQUFFLEdBQUcsTUFBTSxDQUFDO1FBRXJCLFlBQVksQ0FBQyxXQUF3QjtZQUMzQyxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTSxTQUFTLENBQUMsV0FBd0I7WUFDeEMsT0FBTyxFQUFFLENBQUM7UUFDWCxDQUFDO1FBRU0sV0FBVyxDQUFDLG9CQUEyQztZQUM3RCxPQUFPLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxtQ0FBZ0IsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUM1RSxDQUFDOztJQWRGLDRFQWVDIn0=