/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/editor/common/languageFeatureRegistry", "vs/base/common/uri", "vs/editor/common/core/position", "vs/base/common/arrays", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/platform/commands/common/commands", "vs/base/common/types", "vs/editor/common/services/model", "vs/editor/common/services/resolverService"], function (require, exports, cancellation_1, languageFeatureRegistry_1, uri_1, position_1, arrays_1, errors_1, lifecycle_1, commands_1, types_1, model_1, resolverService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$fF = exports.$eF = exports.CallHierarchyDirection = void 0;
    var CallHierarchyDirection;
    (function (CallHierarchyDirection) {
        CallHierarchyDirection["CallsTo"] = "incomingCalls";
        CallHierarchyDirection["CallsFrom"] = "outgoingCalls";
    })(CallHierarchyDirection || (exports.CallHierarchyDirection = CallHierarchyDirection = {}));
    exports.$eF = new languageFeatureRegistry_1.$dF();
    class $fF {
        static async create(model, position, token) {
            const [provider] = exports.$eF.ordered(model);
            if (!provider) {
                return undefined;
            }
            const session = await provider.prepareCallHierarchy(model, position, token);
            if (!session) {
                return undefined;
            }
            return new $fF(session.roots.reduce((p, c) => p + c._sessionId, ''), provider, session.roots, new lifecycle_1.$mc(session));
        }
        constructor(id, provider, roots, ref) {
            this.id = id;
            this.provider = provider;
            this.roots = roots;
            this.ref = ref;
            this.root = roots[0];
        }
        dispose() {
            this.ref.release();
        }
        fork(item) {
            const that = this;
            return new class extends $fF {
                constructor() {
                    super(that.id, that.provider, [item], that.ref.acquire());
                }
            };
        }
        async resolveIncomingCalls(item, token) {
            try {
                const result = await this.provider.provideIncomingCalls(item, token);
                if ((0, arrays_1.$Jb)(result)) {
                    return result;
                }
            }
            catch (e) {
                (0, errors_1.$Z)(e);
            }
            return [];
        }
        async resolveOutgoingCalls(item, token) {
            try {
                const result = await this.provider.provideOutgoingCalls(item, token);
                if ((0, arrays_1.$Jb)(result)) {
                    return result;
                }
            }
            catch (e) {
                (0, errors_1.$Z)(e);
            }
            return [];
        }
    }
    exports.$fF = $fF;
    // --- API command support
    const _models = new Map();
    commands_1.$Gr.registerCommand('_executePrepareCallHierarchy', async (accessor, ...args) => {
        const [resource, position] = args;
        (0, types_1.$tf)(uri_1.URI.isUri(resource));
        (0, types_1.$tf)(position_1.$js.isIPosition(position));
        const modelService = accessor.get(model_1.$yA);
        let textModel = modelService.getModel(resource);
        let textModelReference;
        if (!textModel) {
            const textModelService = accessor.get(resolverService_1.$uA);
            const result = await textModelService.createModelReference(resource);
            textModel = result.object.textEditorModel;
            textModelReference = result;
        }
        try {
            const model = await $fF.create(textModel, position, cancellation_1.CancellationToken.None);
            if (!model) {
                return [];
            }
            //
            _models.set(model.id, model);
            _models.forEach((value, key, map) => {
                if (map.size > 10) {
                    value.dispose();
                    _models.delete(key);
                }
            });
            return [model.root];
        }
        finally {
            textModelReference?.dispose();
        }
    });
    function isCallHierarchyItemDto(obj) {
        return true;
    }
    commands_1.$Gr.registerCommand('_executeProvideIncomingCalls', async (_accessor, ...args) => {
        const [item] = args;
        (0, types_1.$tf)(isCallHierarchyItemDto(item));
        // find model
        const model = _models.get(item._sessionId);
        if (!model) {
            return undefined;
        }
        return model.resolveIncomingCalls(item, cancellation_1.CancellationToken.None);
    });
    commands_1.$Gr.registerCommand('_executeProvideOutgoingCalls', async (_accessor, ...args) => {
        const [item] = args;
        (0, types_1.$tf)(isCallHierarchyItemDto(item));
        // find model
        const model = _models.get(item._sessionId);
        if (!model) {
            return undefined;
        }
        return model.resolveOutgoingCalls(item, cancellation_1.CancellationToken.None);
    });
});
//# sourceMappingURL=callHierarchy.js.map