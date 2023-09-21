/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/editor/common/languageFeatureRegistry", "vs/base/common/uri", "vs/editor/common/core/position", "vs/base/common/arrays", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/platform/commands/common/commands", "vs/base/common/types", "vs/editor/common/services/model", "vs/editor/common/services/resolverService"], function (require, exports, cancellation_1, languageFeatureRegistry_1, uri_1, position_1, arrays_1, errors_1, lifecycle_1, commands_1, types_1, model_1, resolverService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CallHierarchyModel = exports.CallHierarchyProviderRegistry = exports.CallHierarchyDirection = void 0;
    var CallHierarchyDirection;
    (function (CallHierarchyDirection) {
        CallHierarchyDirection["CallsTo"] = "incomingCalls";
        CallHierarchyDirection["CallsFrom"] = "outgoingCalls";
    })(CallHierarchyDirection || (exports.CallHierarchyDirection = CallHierarchyDirection = {}));
    exports.CallHierarchyProviderRegistry = new languageFeatureRegistry_1.LanguageFeatureRegistry();
    class CallHierarchyModel {
        static async create(model, position, token) {
            const [provider] = exports.CallHierarchyProviderRegistry.ordered(model);
            if (!provider) {
                return undefined;
            }
            const session = await provider.prepareCallHierarchy(model, position, token);
            if (!session) {
                return undefined;
            }
            return new CallHierarchyModel(session.roots.reduce((p, c) => p + c._sessionId, ''), provider, session.roots, new lifecycle_1.RefCountedDisposable(session));
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
            return new class extends CallHierarchyModel {
                constructor() {
                    super(that.id, that.provider, [item], that.ref.acquire());
                }
            };
        }
        async resolveIncomingCalls(item, token) {
            try {
                const result = await this.provider.provideIncomingCalls(item, token);
                if ((0, arrays_1.isNonEmptyArray)(result)) {
                    return result;
                }
            }
            catch (e) {
                (0, errors_1.onUnexpectedExternalError)(e);
            }
            return [];
        }
        async resolveOutgoingCalls(item, token) {
            try {
                const result = await this.provider.provideOutgoingCalls(item, token);
                if ((0, arrays_1.isNonEmptyArray)(result)) {
                    return result;
                }
            }
            catch (e) {
                (0, errors_1.onUnexpectedExternalError)(e);
            }
            return [];
        }
    }
    exports.CallHierarchyModel = CallHierarchyModel;
    // --- API command support
    const _models = new Map();
    commands_1.CommandsRegistry.registerCommand('_executePrepareCallHierarchy', async (accessor, ...args) => {
        const [resource, position] = args;
        (0, types_1.assertType)(uri_1.URI.isUri(resource));
        (0, types_1.assertType)(position_1.Position.isIPosition(position));
        const modelService = accessor.get(model_1.IModelService);
        let textModel = modelService.getModel(resource);
        let textModelReference;
        if (!textModel) {
            const textModelService = accessor.get(resolverService_1.ITextModelService);
            const result = await textModelService.createModelReference(resource);
            textModel = result.object.textEditorModel;
            textModelReference = result;
        }
        try {
            const model = await CallHierarchyModel.create(textModel, position, cancellation_1.CancellationToken.None);
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
    commands_1.CommandsRegistry.registerCommand('_executeProvideIncomingCalls', async (_accessor, ...args) => {
        const [item] = args;
        (0, types_1.assertType)(isCallHierarchyItemDto(item));
        // find model
        const model = _models.get(item._sessionId);
        if (!model) {
            return undefined;
        }
        return model.resolveIncomingCalls(item, cancellation_1.CancellationToken.None);
    });
    commands_1.CommandsRegistry.registerCommand('_executeProvideOutgoingCalls', async (_accessor, ...args) => {
        const [item] = args;
        (0, types_1.assertType)(isCallHierarchyItemDto(item));
        // find model
        const model = _models.get(item._sessionId);
        if (!model) {
            return undefined;
        }
        return model.resolveOutgoingCalls(item, cancellation_1.CancellationToken.None);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsbEhpZXJhcmNoeS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NhbGxIaWVyYXJjaHkvY29tbW9uL2NhbGxIaWVyYXJjaHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBaUJoRyxJQUFrQixzQkFHakI7SUFIRCxXQUFrQixzQkFBc0I7UUFDdkMsbURBQXlCLENBQUE7UUFDekIscURBQTJCLENBQUE7SUFDNUIsQ0FBQyxFQUhpQixzQkFBc0Isc0NBQXRCLHNCQUFzQixRQUd2QztJQXNDWSxRQUFBLDZCQUE2QixHQUFHLElBQUksaURBQXVCLEVBQXlCLENBQUM7SUFHbEcsTUFBYSxrQkFBa0I7UUFFOUIsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBaUIsRUFBRSxRQUFtQixFQUFFLEtBQXdCO1lBQ25GLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxxQ0FBNkIsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDaEUsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDZCxPQUFPLFNBQVMsQ0FBQzthQUNqQjtZQUNELE1BQU0sT0FBTyxHQUFHLE1BQU0sUUFBUSxDQUFDLG9CQUFvQixDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDNUUsSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDYixPQUFPLFNBQVMsQ0FBQzthQUNqQjtZQUNELE9BQU8sSUFBSSxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksZ0NBQW9CLENBQUMsT0FBTyxDQUFDLENBQUMs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