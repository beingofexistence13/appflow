/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/functional"], function (require, exports, functional_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CustomEditorModelManager = void 0;
    class CustomEditorModelManager {
        constructor() {
            this._references = new Map();
        }
        async getAllModels(resource) {
            const keyStart = `${resource.toString()}@@@`;
            const models = [];
            for (const [key, entry] of this._references) {
                if (key.startsWith(keyStart) && entry.model) {
                    models.push(await entry.model);
                }
            }
            return models;
        }
        async get(resource, viewType) {
            const key = this.key(resource, viewType);
            const entry = this._references.get(key);
            return entry?.model;
        }
        tryRetain(resource, viewType) {
            const key = this.key(resource, viewType);
            const entry = this._references.get(key);
            if (!entry) {
                return undefined;
            }
            entry.counter++;
            return entry.model.then(model => {
                return {
                    object: model,
                    dispose: (0, functional_1.once)(() => {
                        if (--entry.counter <= 0) {
                            entry.model.then(x => x.dispose());
                            this._references.delete(key);
                        }
                    }),
                };
            });
        }
        add(resource, viewType, model) {
            const key = this.key(resource, viewType);
            const existing = this._references.get(key);
            if (existing) {
                throw new Error('Model already exists');
            }
            this._references.set(key, { viewType, model, counter: 0 });
            return this.tryRetain(resource, viewType);
        }
        disposeAllModelsForView(viewType) {
            for (const [key, value] of this._references) {
                if (value.viewType === viewType) {
                    value.model.then(x => x.dispose());
                    this._references.delete(key);
                }
            }
        }
        key(resource, viewType) {
            return `${resource.toString()}@@@${viewType}`;
        }
    }
    exports.CustomEditorModelManager = CustomEditorModelManager;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tRWRpdG9yTW9kZWxNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY3VzdG9tRWRpdG9yL2NvbW1vbi9jdXN0b21FZGl0b3JNb2RlbE1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBT2hHLE1BQWEsd0JBQXdCO1FBQXJDO1lBRWtCLGdCQUFXLEdBQUcsSUFBSSxHQUFHLEVBSWxDLENBQUM7UUFnRU4sQ0FBQztRQTlETyxLQUFLLENBQUMsWUFBWSxDQUFDLFFBQWE7WUFDdEMsTUFBTSxRQUFRLEdBQUcsR0FBRyxRQUFRLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQztZQUM3QyxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7WUFDbEIsS0FBSyxNQUFNLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBQzVDLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxLQUFLLENBQUMsS0FBSyxFQUFFO29CQUM1QyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUMvQjthQUNEO1lBQ0QsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBQ00sS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFhLEVBQUUsUUFBZ0I7WUFDL0MsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDekMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDeEMsT0FBTyxLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQ3JCLENBQUM7UUFFTSxTQUFTLENBQUMsUUFBYSxFQUFFLFFBQWdCO1lBQy9DLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBRXpDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ1gsT0FBTyxTQUFTLENBQUM7YUFDakI7WUFFRCxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7WUFFaEIsT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDL0IsT0FBTztvQkFDTixNQUFNLEVBQUUsS0FBSztvQkFDYixPQUFPLEVBQUUsSUFBQSxpQkFBSSxFQUFDLEdBQUcsRUFBRTt3QkFDbEIsSUFBSSxFQUFFLEtBQU0sQ0FBQyxPQUFPLElBQUksQ0FBQyxFQUFFOzRCQUMxQixLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDOzRCQUNuQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzt5QkFDN0I7b0JBQ0YsQ0FBQyxDQUFDO2lCQUNGLENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFTSxHQUFHLENBQUMsUUFBYSxFQUFFLFFBQWdCLEVBQUUsS0FBa0M7WUFDN0UsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDekMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDM0MsSUFBSSxRQUFRLEVBQUU7Z0JBQ2IsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO2FBQ3hDO1lBRUQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUMzRCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBRSxDQUFDO1FBQzVDLENBQUM7UUFFTSx1QkFBdUIsQ0FBQyxRQUFnQjtZQUM5QyxLQUFLLE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDNUMsSUFBSSxLQUFLLENBQUMsUUFBUSxLQUFLLFFBQVEsRUFBRTtvQkFDaEMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztvQkFDbkMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQzdCO2FBQ0Q7UUFDRixDQUFDO1FBRU8sR0FBRyxDQUFDLFFBQWEsRUFBRSxRQUFnQjtZQUMxQyxPQUFPLEdBQUcsUUFBUSxDQUFDLFFBQVEsRUFBRSxNQUFNLFFBQVEsRUFBRSxDQUFDO1FBQy9DLENBQUM7S0FDRDtJQXRFRCw0REFzRUMifQ==