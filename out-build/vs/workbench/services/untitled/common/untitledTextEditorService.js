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
    var $uD_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$uD = exports.$tD = void 0;
    exports.$tD = (0, instantiation_1.$Bh)('untitledTextEditorService');
    let $uD = class $uD extends lifecycle_1.$kc {
        static { $uD_1 = this; }
        static { this.a = /Untitled-\d+/; }
        constructor(j, m) {
            super();
            this.j = j;
            this.m = m;
            this.b = this.B(new event_1.$fd());
            this.onDidChangeDirty = this.b.event;
            this.c = this.B(new event_1.$fd());
            this.onDidChangeEncoding = this.c.event;
            this.f = this.B(new event_1.$fd());
            this.onWillDispose = this.f.event;
            this.g = this.B(new event_1.$fd());
            this.onDidChangeLabel = this.g.event;
            this.h = new map_1.$zi();
        }
        get(resource) {
            return this.h.get(resource);
        }
        getValue(resource) {
            return this.get(resource)?.textEditorModel?.getValue();
        }
        async resolve(options) {
            const model = this.n(options);
            await model.resolve();
            return model;
        }
        create(options) {
            return this.n(options);
        }
        n(options = Object.create(null)) {
            const massagedOptions = this.r(options);
            // Return existing instance if asked for it
            if (massagedOptions.untitledResource && this.h.has(massagedOptions.untitledResource)) {
                return this.h.get(massagedOptions.untitledResource);
            }
            // Create new instance otherwise
            return this.s(massagedOptions);
        }
        r(options) {
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
                const configuration = this.m.getValue();
                if (configuration.files?.defaultLanguage) {
                    massagedOptions.languageId = configuration.files.defaultLanguage;
                }
            }
            // Take over encoding and initial value
            massagedOptions.encoding = options.encoding;
            massagedOptions.initialValue = options.initialValue;
            return massagedOptions;
        }
        s(options) {
            // Create a new untitled resource if none is provided
            let untitledResource = options.untitledResource;
            if (!untitledResource) {
                let counter = 1;
                do {
                    untitledResource = uri_1.URI.from({ scheme: network_1.Schemas.untitled, path: `Untitled-${counter}` });
                    counter++;
                } while (this.h.has(untitledResource));
            }
            // Create new model with provided options
            const model = this.B(this.j.createInstance(untitledTextEditorModel_1.$sD, untitledResource, !!options.associatedResource, options.initialValue, options.languageId, options.encoding));
            this.t(model);
            return model;
        }
        t(model) {
            // Install model listeners
            const modelListeners = new lifecycle_1.$jc();
            modelListeners.add(model.onDidChangeDirty(() => this.b.fire(model)));
            modelListeners.add(model.onDidChangeName(() => this.g.fire(model)));
            modelListeners.add(model.onDidChangeEncoding(() => this.c.fire(model)));
            modelListeners.add(model.onWillDispose(() => this.f.fire(model)));
            // Remove from cache on dispose
            event_1.Event.once(model.onWillDispose)(() => {
                // Registry
                this.h.delete(model.resource);
                // Listeners
                modelListeners.dispose();
            });
            // Add to cache
            this.h.set(model.resource, model);
            // If the model is dirty right from the beginning,
            // make sure to emit this as an event
            if (model.isDirty()) {
                this.b.fire(model);
            }
        }
        isUntitledWithAssociatedResource(resource) {
            return resource.scheme === network_1.Schemas.untitled && resource.path.length > 1 && !$uD_1.a.test(resource.path);
        }
    };
    exports.$uD = $uD;
    exports.$uD = $uD = $uD_1 = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, configuration_1.$8h)
    ], $uD);
    (0, extensions_1.$mr)(exports.$tD, $uD, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=untitledTextEditorService.js.map