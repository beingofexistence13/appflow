/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/welcomeWalkthrough/browser/editor/editorWalkThrough", "vs/workbench/services/editor/common/editorService", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/welcomeWalkthrough/browser/walkThroughInput", "vs/base/common/network", "vs/platform/actions/common/actions", "vs/platform/action/common/actionCommonCategories", "vs/workbench/contrib/welcomeWalkthrough/browser/editor/vs_code_editor_walkthrough"], function (require, exports, nls_1, editorService_1, instantiation_1, walkThroughInput_1, network_1, actions_1, actionCommonCategories_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$$Yb = exports.$0Yb = void 0;
    const typeId = 'workbench.editors.walkThroughInput';
    const inputOptions = {
        typeId,
        name: (0, nls_1.localize)(0, null),
        resource: network_1.$2f.asBrowserUri('vs/workbench/contrib/welcomeWalkthrough/browser/editor/vs_code_editor_walkthrough.md')
            .with({
            scheme: network_1.Schemas.walkThrough,
            query: JSON.stringify({ moduleId: 'vs/workbench/contrib/welcomeWalkthrough/browser/editor/vs_code_editor_walkthrough' })
        }),
        telemetryFrom: 'walkThrough'
    };
    class $0Yb extends actions_1.$Wu {
        static { this.ID = 'workbench.action.showInteractivePlayground'; }
        static { this.LABEL = { value: (0, nls_1.localize)(1, null), original: 'Interactive Editor Playground' }; }
        constructor() {
            super({
                id: $0Yb.ID,
                title: $0Yb.LABEL,
                category: actionCommonCategories_1.$Nl.Help,
                f1: true
            });
        }
        run(serviceAccessor) {
            const editorService = serviceAccessor.get(editorService_1.$9C);
            const instantiationService = serviceAccessor.get(instantiation_1.$Ah);
            const input = instantiationService.createInstance(walkThroughInput_1.$1Yb, inputOptions);
            // TODO @lramos15 adopt the resolver here
            return editorService.openEditor(input, { pinned: true })
                .then(() => void (0));
        }
    }
    exports.$0Yb = $0Yb;
    class $$Yb {
        static { this.ID = typeId; }
        canSerialize(editorInput) {
            return true;
        }
        serialize(editorInput) {
            return '';
        }
        deserialize(instantiationService) {
            return instantiationService.createInstance(walkThroughInput_1.$1Yb, inputOptions);
        }
    }
    exports.$$Yb = $$Yb;
});
//# sourceMappingURL=editorWalkThrough.js.map