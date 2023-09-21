/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/uri", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/untitled/common/untitledTextEditorModel", "vs/platform/configuration/common/configuration", "vs/base/common/event", "vs/base/common/map", "vs/base/common/network", "vs/base/common/lifecycle", "vs/platform/instantiation/common/extensions"], function (require, exports, uri_1, instantiation_1, untitledTextEditorModel_1, configuration_1, event_1, map_1, network_1, lifecycle_1, extensions_1) {
    "use strict";
    var UntitledTextEditorService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UntitledTextEditorService = exports.IUntitledTextEditorService = void 0;
    exports.IUntitledTextEditorService = (0, instantiation_1.createDecorator)('untitledTextEditorService');
    let UntitledTextEditorService = class UntitledTextEditorService extends lifecycle_1.Disposable {
        static { UntitledTextEditorService_1 = this; }
        static { this.UNTITLED_WITHOUT_ASSOCIATED_RESOURCE_REGEX = /Untitled-\d+/; }
        constructor(instantiationService, configurationService) {
            super();
            this.instantiationService = instantiationService;
            this.configurationService = configurationService;
            this._onDidChangeDirty = this._register(new event_1.Emitter());
            this.onDidChangeDirty = this._onDidChangeDirty.event;
            this._onDidChangeEncoding = this._register(new event_1.Emitter());
            this.onDidChangeEncoding = this._onDidChangeEncoding.event;
            this._onWillDispose = this._register(new event_1.Emitter());
            this.onWillDispose = this._onWillDispose.event;
            this._onDidChangeLabel = this._register(new event_1.Emitter());
            this.onDidChangeLabel = this._onDidChangeLabel.event;
            this.mapResourceToModel = new map_1.ResourceMap();
        }
        get(resource) {
            return this.mapResourceToModel.get(resource);
        }
        getValue(resource) {
            return this.get(resource)?.textEditorModel?.getValue();
        }
        async resolve(options) {
            const model = this.doCreateOrGet(options);
            await model.resolve();
            return model;
        }
        create(options) {
            return this.doCreateOrGet(options);
        }
        doCreateOrGet(options = Object.create(null)) {
            const massagedOptions = this.massageOptions(options);
            // Return existing instance if asked for it
            if (massagedOptions.untitledResource && this.mapResourceToModel.has(massagedOptions.untitledResource)) {
                return this.mapResourceToModel.get(massagedOptions.untitledResource);
            }
            // Create new instance otherwise
            return this.doCreate(massagedOptions);
        }
        massageOptions(options) {
            const massagedOptions = Object.create(null);
            // Figure out associated and untitled resource
            if (options.associatedResource) {
                massagedOptions.untitledResource = uri_1.URI.from({
                    scheme: network_1.Schemas.untitled,
                    authority: options.associatedResource.authority,
                    fragment: options.associatedResource.fragment,
                    path: options.associatedResource.path,
                    query: options.associatedResource.query
                });
                massagedOptions.associatedResource = options.associatedResource;
            }
            else {
                if (options.untitledResource?.scheme === network_1.Schemas.untitled) {
                    massagedOptions.untitledResource = options.untitledResource;
                }
            }
            // Language id
            if (options.languageId) {
                massagedOptions.languageId = options.languageId;
            }
            else if (!massagedOptions.associatedResource) {
                const configuration = this.configurationService.getValue();
                if (configuration.files?.defaultLanguage) {
                    massagedOptions.languageId = configuration.files.defaultLanguage;
                }
            }
            // Take over encoding and initial value
            massagedOptions.encoding = options.encoding;
            massagedOptions.initialValue = options.initialValue;
            return massagedOptions;
        }
        doCreate(options) {
            // Create a new untitled resource if none is provided
            let untitledResource = options.untitledResource;
            if (!untitledResource) {
                let counter = 1;
                do {
                    untitledResource = uri_1.URI.from({ scheme: network_1.Schemas.untitled, path: `Untitled-${counter}` });
                    counter++;
                } while (this.mapResourceToModel.has(untitledResource));
            }
            // Create new model with provided options
            const model = this._register(this.instantiationService.createInstance(untitledTextEditorModel_1.UntitledTextEditorModel, untitledResource, !!options.associatedResource, options.initialValue, options.languageId, options.encoding));
            this.registerModel(model);
            return model;
        }
        registerModel(model) {
            // Install model listeners
            const modelListeners = new lifecycle_1.DisposableStore();
            modelListeners.add(model.onDidChangeDirty(() => this._onDidChangeDirty.fire(model)));
            modelListeners.add(model.onDidChangeName(() => this._onDidChangeLabel.fire(model)));
            modelListeners.add(model.onDidChangeEncoding(() => this._onDidChangeEncoding.fire(model)));
            modelListeners.add(model.onWillDispose(() => this._onWillDispose.fire(model)));
            // Remove from cache on dispose
            event_1.Event.once(model.onWillDispose)(() => {
                // Registry
                this.mapResourceToModel.delete(model.resource);
                // Listeners
                modelListeners.dispose();
            });
            // Add to cache
            this.mapResourceToModel.set(model.resource, model);
            // If the model is dirty right from the beginning,
            // make sure to emit this as an event
            if (model.isDirty()) {
                this._onDidChangeDirty.fire(model);
            }
        }
        isUntitledWithAssociatedResource(resource) {
            return resource.scheme === network_1.Schemas.untitled && resource.path.length > 1 && !UntitledTextEditorService_1.UNTITLED_WITHOUT_ASSOCIATED_RESOURCE_REGEX.test(resource.path);
        }
    };
    exports.UntitledTextEditorService = UntitledTextEditorService;
    exports.UntitledTextEditorService = UntitledTextEditorService = UntitledTextEditorService_1 = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, configuration_1.IConfigurationService)
    ], UntitledTextEditorService);
    (0, extensions_1.registerSingleton)(exports.IUntitledTextEditorService, UntitledTextEditorService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW50aXRsZWRUZXh0RWRpdG9yU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy91bnRpdGxlZC9jb21tb24vdW50aXRsZWRUZXh0RWRpdG9yU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBYW5GLFFBQUEsMEJBQTBCLEdBQUcsSUFBQSwrQkFBZSxFQUE2QiwyQkFBMkIsQ0FBQyxDQUFDO0lBOEc1RyxJQUFNLHlCQUF5QixHQUEvQixNQUFNLHlCQUEwQixTQUFRLHNCQUFVOztpQkFJaEMsK0NBQTBDLEdBQUcsY0FBYyxBQUFqQixDQUFrQjtRQWdCcEYsWUFDd0Isb0JBQTRELEVBQzVELG9CQUE0RDtZQUVuRixLQUFLLEVBQUUsQ0FBQztZQUhnQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQzNDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFoQm5FLHNCQUFpQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQTRCLENBQUMsQ0FBQztZQUNwRixxQkFBZ0IsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDO1lBRXhDLHlCQUFvQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQTRCLENBQUMsQ0FBQztZQUN2Rix3QkFBbUIsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDO1lBRTlDLG1CQUFjLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBNEIsQ0FBQyxDQUFDO1lBQ2pGLGtCQUFhLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUM7WUFFbEMsc0JBQWlCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBNEIsQ0FBQyxDQUFDO1lBQ3BGLHFCQUFnQixHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUM7WUFFeEMsdUJBQWtCLEdBQUcsSUFBSSxpQkFBVyxFQUEyQixDQUFDO1FBT2pGLENBQUM7UUFFRCxHQUFHLENBQUMsUUFBYTtZQUNoQixPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDOUMsQ0FBQztRQUVELFFBQVEsQ0FBQyxRQUFhO1lBQ3JCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxlQUFlLEVBQUUsUUFBUSxFQUFFLENBQUM7UUFDeEQsQ0FBQztRQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBNEM7WUFDekQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMxQyxNQUFNLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUV0QixPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFRCxNQUFNLENBQUMsT0FBNEM7WUFDbEQsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3BDLENBQUM7UUFFTyxhQUFhLENBQUMsVUFBOEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDdEYsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUVyRCwyQ0FBMkM7WUFDM0MsSUFBSSxlQUFlLENBQUMsZ0JBQWdCLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtnQkFDdEcsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsQ0FBRSxDQUFDO2FBQ3RFO1lBRUQsZ0NBQWdDO1lBQ2hDLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUN2QyxDQUFDO1FBRU8sY0FBYyxDQUFDLE9BQTJDO1lBQ2pFLE1BQU0sZUFBZSxHQUF1QyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRWhGLDhDQUE4QztZQUM5QyxJQUFJLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRTtnQkFDL0IsZUFBZSxDQUFDLGdCQUFnQixHQUFHLFNBQUcsQ0FBQyxJQUFJLENBQUM7b0JBQzNDLE1BQU0sRUFBRSxpQkFBTyxDQUFDLFFBQVE7b0JBQ3hCLFNBQVMsRUFBRSxPQUFPLENBQUMsa0JBQWtCLENBQUMsU0FBUztvQkFDL0MsUUFBUSxFQUFFLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRO29CQUM3QyxJQUFJLEVBQUUsT0FBTyxDQUFDLGtCQUFrQixDQUFDLElBQUk7b0JBQ3JDLEtBQUssRUFBRSxPQUFPLENBQUMsa0JBQWtCLENBQUMsS0FBSztpQkFDdkMsQ0FBQyxDQUFDO2dCQUNILGVBQWUsQ0FBQyxrQkFBa0IsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUM7YUFDaEU7aUJBQU07Z0JBQ04sSUFBSSxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxLQUFLLGlCQUFPLENBQUMsUUFBUSxFQUFFO29CQUMxRCxlQUFlLENBQUMsZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDO2lCQUM1RDthQUNEO1lBRUQsY0FBYztZQUNkLElBQUksT0FBTyxDQUFDLFVBQVUsRUFBRTtnQkFDdkIsZUFBZSxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDO2FBQ2hEO2lCQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsa0JBQWtCLEVBQUU7Z0JBQy9DLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLEVBQXVCLENBQUM7Z0JBQ2hGLElBQUksYUFBYSxDQUFDLEtBQUssRUFBRSxlQUFlLEVBQUU7b0JBQ3pDLGVBQWUsQ0FBQyxVQUFVLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUM7aUJBQ2pFO2FBQ0Q7WUFFRCx1Q0FBdUM7WUFDdkMsZUFBZSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDO1lBQzVDLGVBQWUsQ0FBQyxZQUFZLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQztZQUVwRCxPQUFPLGVBQWUsQ0FBQztRQUN4QixDQUFDO1FBRU8sUUFBUSxDQUFDLE9BQTJDO1lBRTNELHFEQUFxRDtZQUNyRCxJQUFJLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQztZQUNoRCxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQ3RCLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQztnQkFDaEIsR0FBRztvQkFDRixnQkFBZ0IsR0FBRyxTQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLGlCQUFPLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxZQUFZLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDdkYsT0FBTyxFQUFFLENBQUM7aUJBQ1YsUUFBUSxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLEVBQUU7YUFDeEQ7WUFFRCx5Q0FBeUM7WUFDekMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLGlEQUF1QixFQUFFLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsT0FBTyxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBRTVNLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFMUIsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRU8sYUFBYSxDQUFDLEtBQThCO1lBRW5ELDBCQUEwQjtZQUMxQixNQUFNLGNBQWMsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUM3QyxjQUFjLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyRixjQUFjLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEYsY0FBYyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0YsY0FBYyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUUvRSwrQkFBK0I7WUFDL0IsYUFBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBRyxFQUFFO2dCQUVwQyxXQUFXO2dCQUNYLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUUvQyxZQUFZO2dCQUNaLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUMxQixDQUFDLENBQUMsQ0FBQztZQUVILGVBQWU7WUFDZixJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFbkQsa0RBQWtEO1lBQ2xELHFDQUFxQztZQUNyQyxJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUUsRUFBRTtnQkFDcEIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNuQztRQUNGLENBQUM7UUFFRCxnQ0FBZ0MsQ0FBQyxRQUFhO1lBQzdDLE9BQU8sUUFBUSxDQUFDLE1BQU0sS0FBSyxpQkFBTyxDQUFDLFFBQVEsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQywyQkFBeUIsQ0FBQywwQ0FBMEMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RLLENBQUM7O0lBakpXLDhEQUF5Qjt3Q0FBekIseUJBQXlCO1FBcUJuQyxXQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFdBQUEscUNBQXFCLENBQUE7T0F0QlgseUJBQXlCLENBa0pyQztJQUVELElBQUEsOEJBQWlCLEVBQUMsa0NBQTBCLEVBQUUseUJBQXlCLG9DQUE0QixDQUFDIn0=