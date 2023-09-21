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
define(["require", "exports", "vs/editor/common/services/model", "vs/editor/common/services/resolverService", "vs/base/common/lifecycle", "vs/platform/undoRedo/common/undoRedo", "vs/editor/common/model/editStack"], function (require, exports, model_1, resolverService_1, lifecycle_1, undoRedo_1, editStack_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Iyb = void 0;
    let $Iyb = class $Iyb extends lifecycle_1.$kc {
        constructor(a, b, c) {
            super();
            this.a = a;
            this.b = b;
            this.c = c;
            this.B(this.a.onModelRemoved((model) => {
                // a model will get disposed, so let's check if the undo redo stack is maintained
                const elements = this.c.getElements(model.uri);
                if (elements.past.length === 0 && elements.future.length === 0) {
                    return;
                }
                for (const element of elements.past) {
                    if (element instanceof editStack_1.$TB) {
                        element.setDelegate(this);
                    }
                }
                for (const element of elements.future) {
                    if (element instanceof editStack_1.$TB) {
                        element.setDelegate(this);
                    }
                }
            }));
        }
        prepareUndoRedo(element) {
            // Load all the needed text models
            const missingModels = element.getMissingModels();
            if (missingModels.length === 0) {
                // All models are available!
                return lifecycle_1.$kc.None;
            }
            const disposablesPromises = missingModels.map(async (uri) => {
                try {
                    const reference = await this.b.createModelReference(uri);
                    return reference;
                }
                catch (err) {
                    // This model could not be loaded, maybe it was deleted in the meantime?
                    return lifecycle_1.$kc.None;
                }
            });
            return Promise.all(disposablesPromises).then(disposables => {
                return {
                    dispose: () => (0, lifecycle_1.$fc)(disposables)
                };
            });
        }
    };
    exports.$Iyb = $Iyb;
    exports.$Iyb = $Iyb = __decorate([
        __param(0, model_1.$yA),
        __param(1, resolverService_1.$uA),
        __param(2, undoRedo_1.$wu)
    ], $Iyb);
});
//# sourceMappingURL=modelUndoRedoParticipant.js.map