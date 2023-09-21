/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/functional"], function (require, exports, functional_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$LTb = void 0;
    class $LTb {
        constructor() {
            this.a = new Map();
        }
        async getAllModels(resource) {
            const keyStart = `${resource.toString()}@@@`;
            const models = [];
            for (const [key, entry] of this.a) {
                if (key.startsWith(keyStart) && entry.model) {
                    models.push(await entry.model);
                }
            }
            return models;
        }
        async get(resource, viewType) {
            const key = this.b(resource, viewType);
            const entry = this.a.get(key);
            return entry?.model;
        }
        tryRetain(resource, viewType) {
            const key = this.b(resource, viewType);
            const entry = this.a.get(key);
            if (!entry) {
                return undefined;
            }
            entry.counter++;
            return entry.model.then(model => {
                return {
                    object: model,
                    dispose: (0, functional_1.$bb)(() => {
                        if (--entry.counter <= 0) {
                            entry.model.then(x => x.dispose());
                            this.a.delete(key);
                        }
                    }),
                };
            });
        }
        add(resource, viewType, model) {
            const key = this.b(resource, viewType);
            const existing = this.a.get(key);
            if (existing) {
                throw new Error('Model already exists');
            }
            this.a.set(key, { viewType, model, counter: 0 });
            return this.tryRetain(resource, viewType);
        }
        disposeAllModelsForView(viewType) {
            for (const [key, value] of this.a) {
                if (value.viewType === viewType) {
                    value.model.then(x => x.dispose());
                    this.a.delete(key);
                }
            }
        }
        b(resource, viewType) {
            return `${resource.toString()}@@@${viewType}`;
        }
    }
    exports.$LTb = $LTb;
});
//# sourceMappingURL=customEditorModelManager.js.map