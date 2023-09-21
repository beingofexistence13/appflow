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
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/api/common/extHost.protocol", "vs/workbench/services/aiEmbeddingVector/common/aiEmbeddingVectorService", "vs/workbench/services/extensions/common/extHostCustomers"], function (require, exports, lifecycle_1, extHost_protocol_1, aiEmbeddingVectorService_1, extHostCustomers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ptb = void 0;
    let $ptb = class $ptb extends lifecycle_1.$kc {
        constructor(context, c) {
            super();
            this.c = c;
            this.b = this.B(new lifecycle_1.$sc());
            this.a = context.getProxy(extHost_protocol_1.$2J.ExtHostAiEmbeddingVector);
        }
        $registerAiEmbeddingVectorProvider(model, handle) {
            const provider = {
                provideAiEmbeddingVector: (strings, token) => {
                    return this.a.$provideAiEmbeddingVector(handle, strings, token);
                },
            };
            this.b.set(handle, this.c.registerAiEmbeddingVectorProvider(model, provider));
        }
        $unregisterAiEmbeddingVectorProvider(handle) {
            this.b.deleteAndDispose(handle);
        }
    };
    exports.$ptb = $ptb;
    exports.$ptb = $ptb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadAiEmbeddingVector),
        __param(1, aiEmbeddingVectorService_1.$ntb)
    ], $ptb);
});
//# sourceMappingURL=mainThreadAiEmbeddingVector.js.map