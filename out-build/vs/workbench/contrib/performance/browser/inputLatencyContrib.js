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
define(["require", "exports", "vs/base/browser/performance", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/telemetry/common/telemetry", "vs/workbench/services/editor/common/editorService"], function (require, exports, performance_1, async_1, event_1, lifecycle_1, telemetry_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$iEb = void 0;
    let $iEb = class $iEb extends lifecycle_1.$kc {
        constructor(c, f) {
            super();
            this.c = c;
            this.f = f;
            this.a = this.B(new lifecycle_1.$lc());
            // The current sampling strategy is when the active editor changes, start sampling and
            // report the results after 60 seconds. It's done this way as we don't want to sample
            // everything, just somewhat randomly, and using an interval would utilize CPU when the
            // application is inactive.
            this.b = this.B(new async_1.$Sg(() => {
                this.h();
                this.g();
            }, 60000));
            this.g();
        }
        g() {
            this.a.value = event_1.Event.once(this.c.onDidActiveEditorChange)(() => this.b.schedule());
        }
        h() {
            const measurements = performance_1.inputLatency.getAndClearMeasurements();
            if (!measurements) {
                return;
            }
            this.f.publicLog2('performance.inputLatency', {
                keydown: measurements.keydown,
                input: measurements.input,
                render: measurements.render,
                total: measurements.total,
                sampleCount: measurements.sampleCount
            });
        }
    };
    exports.$iEb = $iEb;
    exports.$iEb = $iEb = __decorate([
        __param(0, editorService_1.$9C),
        __param(1, telemetry_1.$9k)
    ], $iEb);
});
//# sourceMappingURL=inputLatencyContrib.js.map