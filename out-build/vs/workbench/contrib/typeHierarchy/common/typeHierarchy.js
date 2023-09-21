/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/range", "vs/base/common/cancellation", "vs/editor/common/languageFeatureRegistry", "vs/base/common/uri", "vs/editor/common/core/position", "vs/base/common/arrays", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/platform/commands/common/commands", "vs/base/common/types", "vs/editor/common/services/model", "vs/editor/common/services/resolverService"], function (require, exports, range_1, cancellation_1, languageFeatureRegistry_1, uri_1, position_1, arrays_1, errors_1, lifecycle_1, commands_1, types_1, model_1, resolverService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$2I = exports.$1I = exports.TypeHierarchyDirection = void 0;
    var TypeHierarchyDirection;
    (function (TypeHierarchyDirection) {
        TypeHierarchyDirection["Subtypes"] = "subtypes";
        TypeHierarchyDirection["Supertypes"] = "supertypes";
    })(TypeHierarchyDirection || (exports.TypeHierarchyDirection = TypeHierarchyDirection = {}));
    exports.$1I = new languageFeatureRegistry_1.$dF();
    class $2I {
        static async create(model, position, token) {
            const [provider] = exports.$1I.ordered(model);
            if (!provider) {
                return undefined;
            }
            const session = await provider.prepareTypeHierarchy(model, position, token);
            if (!session) {
                return undefined;
            }
            return new $2I(session.roots.reduce((p, c) => p + c._sessionId, ''), provider, session.roots, new lifecycle_1.$mc(session));
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
            return new class extends $2I {
                constructor() {
                    super(that.id, that.provider, [item], that.ref.acquire());
                }
            };
        }
        async provideSupertypes(item, token) {
            try {
                const result = await this.provider.provideSupertypes(item, token);
                if ((0, arrays_1.$Jb)(result)) {
                    return result;
                }
            }
            catch (e) {
                (0, errors_1.$Z)(e);
            }
            return [];
        }
        async provideSubtypes(item, token) {
            try {
                const result = await this.provider.provideSubtypes(item, token);
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
    exports.$2I = $2I;
    // --- API command support
    const _models = new Map();
    commands_1.$Gr.registerCommand('_executePrepareTypeHierarchy', async (accessor, ...args) => {
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
            const model = await $2I.create(textModel, position, cancellation_1.CancellationToken.None);
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
            && range_1.$ks.isIRange(item.range)
            && range_1.$ks.isIRange(item.selectionRange);
    }
    commands_1.$Gr.registerCommand('_executeProvideSupertypes', async (_accessor, ...args) => {
        const [item] = args;
        (0, types_1.$tf)(isTypeHierarchyItemDto(item));
        // find model
        const model = _models.get(item._sessionId);
        if (!model) {
            return undefined;
        }
        return model.provideSupertypes(item, cancellation_1.CancellationToken.None);
    });
    commands_1.$Gr.registerCommand('_executeProvideSubtypes', async (_accessor, ...args) => {
        const [item] = args;
        (0, types_1.$tf)(isTypeHierarchyItemDto(item));
        // find model
        const model = _models.get(item._sessionId);
        if (!model) {
            return undefined;
        }
        return model.provideSubtypes(item, cancellation_1.CancellationToken.None);
    });
});
//# sourceMappingURL=typeHierarchy.js.map