/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/action/common/actionCommonCategories", "vs/platform/actions/common/actions", "vs/workbench/contrib/logs/electron-sandbox/logsActions", "vs/platform/instantiation/common/instantiation"], function (require, exports, actionCommonCategories_1, actions_1, logsActions_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: logsActions_1.$dac.ID,
                title: logsActions_1.$dac.TITLE,
                category: actionCommonCategories_1.$Nl.Developer,
                f1: true
            });
        }
        run(servicesAccessor) {
            return servicesAccessor.get(instantiation_1.$Ah).createInstance(logsActions_1.$dac, logsActions_1.$dac.ID, logsActions_1.$dac.TITLE.value).run();
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: logsActions_1.$eac.ID,
                title: logsActions_1.$eac.TITLE,
                category: actionCommonCategories_1.$Nl.Developer,
                f1: true
            });
        }
        run(servicesAccessor) {
            return servicesAccessor.get(instantiation_1.$Ah).createInstance(logsActions_1.$eac, logsActions_1.$eac.ID, logsActions_1.$eac.TITLE.value).run();
        }
    });
});
//# sourceMappingURL=logs.contribution.js.map