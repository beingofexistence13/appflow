"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const csp_1 = require("./csp");
const loading_1 = require("./loading");
const settings_1 = require("./settings");
window.cspAlerter = new csp_1.CspAlerter(new settings_1.SettingsManager());
window.styleLoadingMonitor = new loading_1.StyleLoadingMonitor();
//# sourceMappingURL=pre.js.map