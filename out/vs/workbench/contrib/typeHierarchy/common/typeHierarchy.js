/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/range", "vs/base/common/cancellation", "vs/editor/common/languageFeatureRegistry", "vs/base/common/uri", "vs/editor/common/core/position", "vs/base/common/arrays", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/platform/commands/common/commands", "vs/base/common/types", "vs/editor/common/services/model", "vs/editor/common/services/resolverService"], function (require, exports, range_1, cancellation_1, languageFeatureRegistry_1, uri_1, position_1, arrays_1, errors_1, lifecycle_1, commands_1, types_1, model_1, resolverService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TypeHierarchyModel = exports.TypeHierarchyProviderRegistry = exports.TypeHierarchyDirection = void 0;
    var TypeHierarchyDirection;
    (function (TypeHierarchyDirection) {
        TypeHierarchyDirection["Subtypes"] = "subtypes";
        TypeHierarchyDirection["Supertypes"] = "supertypes";
    })(TypeHierarchyDirection || (exports.TypeHierarchyDirection = TypeHierarchyDirection = {}));
    exports.TypeHierarchyProviderRegistry = new languageFeatureRegistry_1.LanguageFeatureRegistry();
    class TypeHierarchyModel {
        static async create(model, position, token) {
            const [provider] = exports.TypeHierarchyProviderRegistry.ordered(model);
            if (!provider) {
                return undefined;
            }
            const session = await provider.prepareTypeHierarchy(model, position, token);
            if (!session) {
                return undefined;
            }
            return new TypeHierarchyModel(session.roots.reduce((p, c) => p + c._sessionId, ''), provider, session.roots, new lifecycle_1.RefCountedDisposable(session));
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
            return new class extends TypeHierarchyModel {
                constructor() {
                    super(that.id, that.provider, [item], that.ref.acquire());
                }
            };
        }
        async provideSupertypes(item, token) {
            try {
                const result = await this.provider.provideSupertypes(item, token);
                if ((0, arrays_1.isNonEmptyArray)(result)) {
                    return result;
                }
            }
            catch (e) {
                (0, errors_1.onUnexpectedExternalError)(e);
            }
            return [];
        }
        async provideSubtypes(item, token) {
            try {
                const result = await this.provider.provideSubtypes(item, token);
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
    exports.TypeHierarchyModel = TypeHierarchyModel;
    // --- API command support
    const _models = new Map();
    commands_1.CommandsRegistry.registerCommand('_executePrepareTypeHierarchy', async (accessor, ...args) => {
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
            const model = await TypeHierarchyModel.create(textModel, position, cancellation_1.CancellationToken.None);
            if (!model) {
                return [];
            }
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
    function isTypeHierarchyItemDto(obj) {
        const item = obj;
        return typeof obj === 'object'
            && typeof item.name === 'string'
            && typeof item.kind === 'number'
            && uri_1.URI.isUri(item.uri)
            && range_1.Range.isIRange(item.range)
            && range_1.Range.isIRange(item.selectionRange);
    }
    commands_1.CommandsRegistry.registerCommand('_executeProvideSupertypes', async (_accessor, ...args) => {
        const [item] = args;
        (0, types_1.assertType)(isTypeHierarchyItemDto(item));
        // find model
        const model = _models.get(item._sessionId);
        if (!model) {
            return undefined;
        }
        return model.provideSupertypes(item, cancellation_1.CancellationToken.None);
    });
    commands_1.CommandsRegistry.registerCommand('_executeProvideSubtypes', async (_accessor, ...args) => {
        const [item] = args;
        (0, types_1.assertType)(isTypeHierarchyItemDto(item));
        // find model
        const model = _models.get(item._sessionId);
        if (!model) {
            return undefined;
        }
        return model.provideSubtypes(item, cancellation_1.CancellationToken.None);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZUhpZXJhcmNoeS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3R5cGVIaWVyYXJjaHkvY29tbW9uL3R5cGVIaWVyYXJjaHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBaUJoRyxJQUFrQixzQkFHakI7SUFIRCxXQUFrQixzQkFBc0I7UUFDdkMsK0NBQXFCLENBQUE7UUFDckIsbURBQXlCLENBQUE7SUFDMUIsQ0FBQyxFQUhpQixzQkFBc0Isc0NBQXRCLHNCQUFzQixRQUd2QztJQXlCWSxRQUFBLDZCQUE2QixHQUFHLElBQUksaURBQXVCLEVBQXlCLENBQUM7SUFJbEcsTUFBYSxrQkFBa0I7UUFFOUIsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBaUIsRUFBRSxRQUFtQixFQUFFLEtBQXdCO1lBQ25GLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxxQ0FBNkIsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDaEUsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDZCxPQUFPLFNBQVMsQ0FBQzthQUNqQjtZQUNELE1BQU0sT0FBTyxHQUFHLE1BQU0sUUFBUSxDQUFDLG9CQUFvQixDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDNUUsSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDYixPQUFPLFNBQVMsQ0FBQzthQUNqQjtZQUNELE9BQU8sSUFBSSxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksZ0NBQW9CLENBQUMsT0FBTyxDQUFDLENBQUMs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