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
define(["require", "exports", "vs/nls!vs/workbench/contrib/surveys/browser/ces.contribution", "vs/base/common/platform", "vs/workbench/common/contributions", "vs/platform/registry/common/platform", "vs/platform/telemetry/common/telemetry", "vs/platform/storage/common/storage", "vs/platform/product/common/productService", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/workbench/services/assignment/common/assignmentService", "vs/base/common/uri", "vs/base/common/process", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/event"], function (require, exports, nls, platform_1, contributions_1, platform_2, telemetry_1, storage_1, productService_1, notification_1, opener_1, assignmentService_1, uri_1, process_1, async_1, lifecycle_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const WAIT_TIME_TO_SHOW_SURVEY = 1000 * 60 * 60; // 1 hour
    const MIN_WAIT_TIME_TO_SHOW_SURVEY = 1000 * 60 * 2; // 2 minutes
    const MAX_INSTALL_AGE = 1000 * 60 * 60 * 24; // 24 hours
    const REMIND_LATER_DELAY = 1000 * 60 * 60 * 4; // 4 hours
    const SKIP_SURVEY_KEY = 'ces/skipSurvey';
    const REMIND_LATER_DATE_KEY = 'ces/remindLaterDate';
    let CESContribution = class CESContribution extends lifecycle_1.$kc {
        constructor(c, f, g, h, j, tasExperimentService) {
            super();
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.a = this.B(new async_1.$Eg(0));
            this.b = tasExperimentService;
            if (!j.cesSurveyUrl) {
                return;
            }
            const skipSurvey = c.get(SKIP_SURVEY_KEY, -1 /* StorageScope.APPLICATION */, '');
            if (skipSurvey) {
                return;
            }
            this.n();
        }
        async m() {
            const isCandidate = await this.b?.getTreatment('CESSurvey');
            if (!isCandidate) {
                this.r();
                return;
            }
            const sendTelemetry = (userReaction) => {
                /* __GDPR__
                "cesSurvey:popup" : {
                    "owner": "digitarald",
                    "userReaction" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                }
                */
                this.g.publicLog('cesSurvey:popup', { userReaction });
            };
            const message = await this.b?.getTreatment('CESSurveyMessage') ?? nls.localize(0, null);
            const button = await this.b?.getTreatment('CESSurveyButton') ?? nls.localize(1, null);
            const notification = this.f.prompt(notification_1.Severity.Info, message, [{
                    label: button,
                    run: () => {
                        sendTelemetry('accept');
                        let surveyUrl = `${this.j.cesSurveyUrl}?o=${encodeURIComponent(process_1.$3d)}&v=${encodeURIComponent(this.j.version)}&m=${encodeURIComponent(this.g.machineId)}`;
                        const usedParams = this.j.surveys
                            ?.filter(surveyData => surveyData.surveyId && surveyData.languageId)
                            // Counts provided by contrib/surveys/browser/languageSurveys
                            .filter(surveyData => this.c.getNumber(`${surveyData.surveyId}.editedCount`, -1 /* StorageScope.APPLICATION */, 0) > 0)
                            .map(surveyData => `${encodeURIComponent(surveyData.languageId)}Lang=1`)
                            .join('&');
                        if (usedParams) {
                            surveyUrl += `&${usedParams}`;
                        }
                        this.h.open(uri_1.URI.parse(surveyUrl));
                        this.r();
                    }
                }, {
                    label: nls.localize(2, null),
                    run: () => {
                        sendTelemetry('remindLater');
                        this.c.store(REMIND_LATER_DATE_KEY, new Date().toUTCString(), -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
                        this.n();
                    }
                }], {
                sticky: true,
                onCancel: () => {
                    sendTelemetry('cancelled');
                    this.r();
                }
            });
            await event_1.Event.toPromise(notification.onDidClose);
        }
        async n() {
            let waitTimeToShowSurvey = 0;
            const remindLaterDate = this.c.get(REMIND_LATER_DATE_KEY, -1 /* StorageScope.APPLICATION */, '');
            if (remindLaterDate) {
                const timeToRemind = new Date(remindLaterDate).getTime() + REMIND_LATER_DELAY - Date.now();
                if (timeToRemind > 0) {
                    waitTimeToShowSurvey = timeToRemind;
                }
            }
            else {
                const timeFromInstall = Date.now() - new Date(this.g.firstSessionDate).getTime();
                const isNewInstall = !isNaN(timeFromInstall) && timeFromInstall < MAX_INSTALL_AGE;
                // Installation is older than MAX_INSTALL_AGE
                if (!isNewInstall) {
                    this.r();
                    return;
                }
                if (timeFromInstall < WAIT_TIME_TO_SHOW_SURVEY) {
                    waitTimeToShowSurvey = WAIT_TIME_TO_SHOW_SURVEY - timeFromInstall;
                }
            }
            /* __GDPR__
            "cesSurvey:schedule" : {
                "owner": "digitarald"
            }
            */
            this.g.publicLog('cesSurvey:schedule');
            this.a.trigger(async () => {
                await this.m();
            }, Math.max(waitTimeToShowSurvey, MIN_WAIT_TIME_TO_SHOW_SURVEY));
        }
        r() {
            this.c.store(SKIP_SURVEY_KEY, this.j.version, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
        }
    };
    CESContribution = __decorate([
        __param(0, storage_1.$Vo),
        __param(1, notification_1.$Yu),
        __param(2, telemetry_1.$9k),
        __param(3, opener_1.$NT),
        __param(4, productService_1.$kj),
        __param(5, assignmentService_1.$drb)
    ], CESContribution);
    if (platform_1.$v === 'en') {
        const workbenchRegistry = platform_2.$8m.as(contributions_1.Extensions.Workbench);
        workbenchRegistry.registerWorkbenchContribution(CESContribution, 3 /* LifecyclePhase.Restored */);
    }
});
//# sourceMappingURL=ces.contribution.js.map