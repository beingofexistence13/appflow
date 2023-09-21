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
define(["require", "exports", "vs/base/common/async", "vs/base/common/errors", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/product/common/productService", "vs/platform/telemetry/common/telemetry", "vs/platform/update/common/update", "vs/platform/native/common/native", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/timer/browser/timerService", "vs/platform/files/common/files", "vs/base/common/uri", "vs/base/common/buffer", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/workbench/contrib/performance/browser/startupTimings"], function (require, exports, async_1, errors_1, environmentService_1, lifecycle_1, productService_1, telemetry_1, update_1, native_1, editorService_1, timerService_1, files_1, uri_1, buffer_1, workspaceTrust_1, panecomposite_1, startupTimings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Qac = void 0;
    let $Qac = class $Qac extends startupTimings_1.$W4b {
        constructor(g, h, i, editorService, paneCompositeService, j, lifecycleService, updateService, k, l, workspaceTrustService) {
            super(editorService, paneCompositeService, lifecycleService, updateService, workspaceTrustService);
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.k = k;
            this.l = l;
            this.m().catch(errors_1.$Y);
        }
        async m() {
            const standardStartupError = await this.f();
            this.n(standardStartupError).catch(errors_1.$Y);
        }
        async n(standardStartupError) {
            const appendTo = this.k.args['prof-append-timers'];
            const durationMarkers = this.k.args['prof-duration-markers'];
            const durationMarkersFile = this.k.args['prof-duration-markers-file'];
            if (!appendTo && !durationMarkers) {
                // nothing to do
                return;
            }
            try {
                await Promise.all([
                    this.h.whenReady(),
                    (0, async_1.$Hg)(15000), // wait: cached data creation, telemetry sending
                ]);
                const perfBaseline = await this.h.perfBaseline;
                if (appendTo) {
                    const content = `${this.h.startupMetrics.ellapsed}\t${this.l.nameShort}\t${(this.l.commit || '').slice(0, 10) || '0000000000'}\t${this.j.sessionId}\t${standardStartupError === undefined ? 'standard_start' : 'NO_standard_start : ' + standardStartupError}\t${String(perfBaseline).padStart(4, '0')}ms\n`;
                    await this.p(uri_1.URI.file(appendTo), content);
                }
                if (durationMarkers?.length) {
                    const durations = [];
                    for (const durationMarker of durationMarkers) {
                        let duration = 0;
                        if (durationMarker === 'ellapsed') {
                            duration = this.h.startupMetrics.ellapsed;
                        }
                        else if (durationMarker.indexOf('-') !== -1) {
                            const markers = durationMarker.split('-');
                            if (markers.length === 2) {
                                duration = this.h.getDuration(markers[0], markers[1]);
                            }
                        }
                        if (duration) {
                            durations.push(durationMarker);
                            durations.push(`${duration}`);
                        }
                    }
                    const durationsContent = `${durations.join('\t')}\n`;
                    if (durationMarkersFile) {
                        await this.p(uri_1.URI.file(durationMarkersFile), durationsContent);
                    }
                    else {
                        console.log(durationsContent);
                    }
                }
            }
            catch (err) {
                console.error(err);
            }
            finally {
                this.i.exit(0);
            }
        }
        async f() {
            const windowCount = await this.i.getWindowCount();
            if (windowCount !== 1) {
                return `Expected window count : 1, Actual : ${windowCount}`;
            }
            return super.f();
        }
        async p(file, content) {
            const chunks = [];
            if (await this.g.exists(file)) {
                chunks.push((await this.g.readFile(file)).value);
            }
            chunks.push(buffer_1.$Fd.fromString(content));
            await this.g.writeFile(file, buffer_1.$Fd.concat(chunks));
        }
    };
    exports.$Qac = $Qac;
    exports.$Qac = $Qac = __decorate([
        __param(0, files_1.$6j),
        __param(1, timerService_1.$kkb),
        __param(2, native_1.$05b),
        __param(3, editorService_1.$9C),
        __param(4, panecomposite_1.$Yeb),
        __param(5, telemetry_1.$9k),
        __param(6, lifecycle_1.$7y),
        __param(7, update_1.$UT),
        __param(8, environmentService_1.$1$b),
        __param(9, productService_1.$kj),
        __param(10, workspaceTrust_1.$$z)
    ], $Qac);
});
//# sourceMappingURL=startupTimings.js.map