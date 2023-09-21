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
define(["require", "exports", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/network", "vs/base/common/resources", "vs/base/common/ternarySearchTree", "vs/base/common/uri", "vs/base/common/uuid", "vs/nls!vs/workbench/contrib/extensions/electron-sandbox/extensionsAutoProfiler", "vs/platform/configuration/common/configuration", "vs/platform/extensions/common/extensions", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/profiling/electron-sandbox/profileAnalysisWorkerService", "vs/platform/telemetry/common/telemetry", "vs/workbench/contrib/extensions/common/runtimeExtensionsInput", "vs/workbench/contrib/extensions/electron-sandbox/extensionsSlowActions", "vs/workbench/contrib/extensions/electron-sandbox/runtimeExtensionsEditor", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/electron-sandbox/extensionHostProfiler", "vs/workbench/services/timer/browser/timerService"], function (require, exports, async_1, buffer_1, cancellation_1, errors_1, network_1, resources_1, ternarySearchTree_1, uri_1, uuid_1, nls_1, configuration_1, extensions_1, files_1, instantiation_1, log_1, notification_1, profileAnalysisWorkerService_1, telemetry_1, runtimeExtensionsInput_1, extensionsSlowActions_1, runtimeExtensionsEditor_1, editorService_1, environmentService_1, extensions_2, extensionHostProfiler_1, timerService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$xac = void 0;
    let $xac = class $xac {
        constructor(f, g, h, i, j, k, l, m, n, o, p, timerService) {
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.k = k;
            this.l = l;
            this.m = m;
            this.n = n;
            this.o = o;
            this.p = p;
            this.a = new extensions_1.$Wl();
            this.d = -1;
            timerService.perfBaseline.then(value => {
                if (value < 0) {
                    return; // too slow for profiling
                }
                this.d = value;
                this.c = f.onDidChangeResponsiveChange(this.q, this);
            });
        }
        dispose() {
            this.c?.dispose();
            this.b?.dispose(true);
        }
        async q(event) {
            if (event.extensionHostKind !== 1 /* ExtensionHostKind.LocalProcess */) {
                return;
            }
            const port = await event.getInspectPort(true);
            if (!port) {
                return;
            }
            if (event.isResponsive && this.b) {
                // stop profiling when responsive again
                this.b.cancel();
                this.i.info('UNRESPONSIVE extension host: received responsive event and cancelling profiling session');
            }
            else if (!event.isResponsive && !this.b) {
                // start profiling if not yet profiling
                const cts = new cancellation_1.$pd();
                this.b = cts;
                let session;
                try {
                    session = await this.l.createInstance(extensionHostProfiler_1.$vac, port).start();
                }
                catch (err) {
                    this.b = undefined;
                    // fail silent as this is often
                    // caused by another party being
                    // connected already
                    return;
                }
                this.i.info('UNRESPONSIVE extension host: starting to profile NOW');
                // wait 5 seconds or until responsive again
                try {
                    await (0, async_1.$Hg)(5e3, cts.token);
                }
                catch {
                    // can throw cancellation error. that is
                    // OK, we stop profiling and analyse the
                    // profile anyways
                }
                try {
                    // stop profiling and analyse results
                    this.r(await session.stop());
                }
                catch (err) {
                    (0, errors_1.$Y)(err);
                }
                finally {
                    this.b = undefined;
                }
            }
        }
        async r(profile) {
            // get all extensions
            await this.f.whenInstalledExtensionsRegistered();
            // send heavy samples iff enabled
            if (this.o.getValue('application.experimental.rendererProfiling')) {
                const searchTree = ternarySearchTree_1.$Hh.forUris();
                searchTree.fill(this.f.extensions.map(e => [e.extensionLocation, e]));
                await this.n.analyseBottomUp(profile.data, url => searchTree.findSubstr(uri_1.URI.parse(url))?.identifier.value ?? '<<not-found>>', this.d, false);
            }
            // analyse profile by extension-category
            const categories = this.f.extensions
                .filter(e => e.extensionLocation.scheme === network_1.Schemas.file)
                .map(e => [e.extensionLocation, extensions_1.$Vl.toKey(e.identifier)]);
            const data = await this.n.analyseByLocation(profile.data, categories);
            //
            let overall = 0;
            let top = '';
            let topAggregated = -1;
            for (const [category, aggregated] of data) {
                overall += aggregated;
                if (aggregated > topAggregated) {
                    topAggregated = aggregated;
                    top = category;
                }
            }
            const topPercentage = topAggregated / (overall / 100);
            // associate extensions to profile node
            const extension = await this.f.getExtension(top);
            if (!extension) {
                // not an extension => idle, gc, self?
                return;
            }
            const sessionId = (0, uuid_1.$4f)();
            // print message to log
            const path = (0, resources_1.$ig)(this.m.tmpDir, `exthost-${Math.random().toString(16).slice(2, 8)}.cpuprofile`);
            await this.p.writeFile(path, buffer_1.$Fd.fromString(JSON.stringify(profile.data)));
            this.i.warn(`UNRESPONSIVE extension host: '${top}' took ${topPercentage}% of ${topAggregated / 1e3}ms, saved PROFILE here: '${path}'`);
            this.h.publicLog2('exthostunresponsive', {
                sessionId,
                duration: overall,
                data: data.map(tuple => tuple[0]).flat(),
                id: extensions_1.$Vl.toKey(extension.identifier),
            });
            // add to running extensions view
            this.g.setUnresponsiveProfile(extension.identifier, profile);
            // prompt: when really slow/greedy
            if (!(topPercentage >= 95 && topAggregated >= 5e6)) {
                return;
            }
            const action = await this.l.invokeFunction(extensionsSlowActions_1.$jac, extension, profile);
            if (!action) {
                // cannot report issues against this extension...
                return;
            }
            // only blame once per extension, don't blame too often
            if (this.a.has(extension.identifier) || this.a.size >= 3) {
                return;
            }
            this.a.add(extension.identifier);
            // user-facing message when very bad...
            this.j.prompt(notification_1.Severity.Warning, (0, nls_1.localize)(0, null, extension.displayName || extension.name), [{
                    label: (0, nls_1.localize)(1, null),
                    run: () => this.k.openEditor(runtimeExtensionsInput_1.$5Ub.instance, { pinned: true })
                },
                action
            ], { priority: notification_1.NotificationPriority.SILENT });
        }
    };
    exports.$xac = $xac;
    exports.$xac = $xac = __decorate([
        __param(0, extensions_2.$MF),
        __param(1, runtimeExtensionsEditor_1.$kac),
        __param(2, telemetry_1.$9k),
        __param(3, log_1.$5i),
        __param(4, notification_1.$Yu),
        __param(5, editorService_1.$9C),
        __param(6, instantiation_1.$Ah),
        __param(7, environmentService_1.$1$b),
        __param(8, profileAnalysisWorkerService_1.$G$b),
        __param(9, configuration_1.$8h),
        __param(10, files_1.$6j),
        __param(11, timerService_1.$kkb)
    ], $xac);
});
//# sourceMappingURL=extensionsAutoProfiler.js.map