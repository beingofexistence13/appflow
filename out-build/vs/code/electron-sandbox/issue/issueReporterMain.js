/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/platform", "vs/code/electron-sandbox/issue/issueReporterPage", "vs/platform/ipc/electron-sandbox/mainProcessService", "vs/platform/issue/common/issue", "vs/platform/native/common/native", "vs/platform/native/electron-sandbox/nativeHostService", "vs/platform/instantiation/common/serviceCollection", "vs/platform/instantiation/common/descriptors", "vs/platform/ipc/common/mainProcessService", "./issueReporterService", "vs/platform/instantiation/common/instantiationService", "vs/platform/instantiation/common/extensions", "vs/platform/ipc/electron-sandbox/services", "vs/css!./media/issueReporter", "vs/base/browser/ui/codicons/codiconStyles"], function (require, exports, dom_1, platform_1, issueReporterPage_1, mainProcessService_1, issue_1, native_1, nativeHostService_1, serviceCollection_1, descriptors_1, mainProcessService_2, issueReporterService_1, instantiationService_1, extensions_1, services_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.startup = void 0;
    function startup(configuration) {
        const platformClass = platform_1.$i ? 'windows' : platform_1.$k ? 'linux' : 'mac';
        document.body.classList.add(platformClass); // used by our fonts
        (0, dom_1.$vP)(document.body, (0, issueReporterPage_1.default)());
        const instantiationService = initServices(configuration.windowId);
        const issueReporter = instantiationService.createInstance(issueReporterService_1.$w7b, configuration);
        issueReporter.render();
        document.body.style.display = 'block';
        issueReporter.setInitialFocus();
    }
    exports.startup = startup;
    function initServices(windowId) {
        const services = new serviceCollection_1.$zh();
        const contributedServices = (0, extensions_1.$nr)();
        for (const [id, descriptor] of contributedServices) {
            services.set(id, descriptor);
        }
        services.set(mainProcessService_2.$o7b, new descriptors_1.$yh(mainProcessService_1.$q7b, [windowId]));
        services.set(native_1.$05b, new descriptors_1.$yh(nativeHostService_1.$r7b, [windowId]));
        return new instantiationService_1.$6p(services, true);
    }
    (0, services_1.$z7b)(issue_1.$qtb, 'issue');
});
//# sourceMappingURL=issueReporterMain.js.map