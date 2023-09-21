var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls!vs/code/electron-sandbox/issue/issueReporterService", "vs/base/browser/dom", "vs/base/browser/ui/button/button", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/collections", "vs/base/common/decorators", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/strings", "vs/code/electron-sandbox/issue/issueReporterModel", "vs/platform/diagnostics/common/diagnostics", "vs/platform/issue/common/issue", "vs/platform/issue/common/issueReporterUtil", "vs/platform/native/common/native", "vs/platform/window/electron-sandbox/window", "vs/base/common/errors"], function (require, exports, nls_1, dom_1, button_1, iconLabels_1, async_1, codicons_1, collections_1, decorators_1, lifecycle_1, platform_1, strings_1, issueReporterModel_1, diagnostics_1, issue_1, issueReporterUtil_1, native_1, window_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.show = exports.hide = exports.$w7b = void 0;
    // GitHub has let us know that we could up our limit here to 8k. We chose 7500 to play it safe.
    // ref https://github.com/microsoft/vscode/issues/159191
    const MAX_URL_LENGTH = 7500;
    var IssueSource;
    (function (IssueSource) {
        IssueSource["VSCode"] = "vscode";
        IssueSource["Extension"] = "extension";
        IssueSource["Marketplace"] = "marketplace";
    })(IssueSource || (IssueSource = {}));
    let $w7b = class $w7b extends lifecycle_1.$kc {
        constructor(s, t, u) {
            super();
            this.s = s;
            this.t = t;
            this.u = u;
            this.f = 0;
            this.g = false;
            this.h = false;
            this.j = false;
            this.m = false;
            this.n = new async_1.$Dg(300);
            const targetExtension = s.data.extensionId ? s.data.enabledExtensions.find(extension => extension.id.toLocaleLowerCase() === s.data.extensionId?.toLocaleLowerCase()) : undefined;
            this.c = new issueReporterModel_1.$s7b({
                ...s.data,
                issueType: s.data.issueType || 0 /* IssueType.Bug */,
                versionInfo: {
                    vscodeVersion: `${s.product.nameShort} ${!!s.product.darwinUniversalAssetId ? `${s.product.version} (Universal)` : s.product.version} (${s.product.commit || 'Commit unknown'}, ${s.product.date || 'Date unknown'})`,
                    os: `${this.s.os.type} ${this.s.os.arch} ${this.s.os.release}${platform_1.$l ? ' snap' : ''}`
                },
                extensionsDisabled: !!s.disableExtensions,
                fileOnExtension: s.data.extensionId ? !targetExtension?.isBuiltin : undefined,
                selectedExtension: targetExtension
            });
            const issueReporterElement = this.ub('issue-reporter');
            if (issueReporterElement) {
                this.r = new button_1.$7Q(issueReporterElement, button_1.$6Q);
                this.F();
            }
            const issueTitle = s.data.issueTitle;
            if (issueTitle) {
                const issueTitleElement = this.ub('issue-title');
                if (issueTitleElement) {
                    issueTitleElement.value = issueTitle;
                }
            }
            const issueBody = s.data.issueBody;
            if (issueBody) {
                const description = this.ub('description');
                if (description) {
                    description.value = issueBody;
                    this.c.update({ issueDescription: issueBody });
                }
            }
            this.u.$getSystemInfo().then(info => {
                this.c.update({ systemInfo: info });
                this.g = true;
                this.ib(this.c.getData());
                this.F();
            });
            if (s.data.issueType === 1 /* IssueType.PerformanceIssue */) {
                this.u.$getPerformanceInfo().then(info => {
                    this.D(info);
                });
            }
            if (window.document.documentElement.lang !== 'en') {
                show(this.ub('english'));
            }
            this.U();
            this.C();
            (0, window_1.$t7b)(s.data.zoomLevel);
            this.w(s.data.styles);
            this.y(s.data.enabledExtensions);
            this.rb(s.data.experiments);
            this.pb(s.data.restrictedMode);
            this.qb(s.data.isUnsupported);
        }
        render() {
            this.Y();
        }
        setInitialFocus() {
            const { fileOnExtension } = this.c.getData();
            if (fileOnExtension) {
                const issueTitle = document.getElementById('issue-title');
                issueTitle?.focus();
            }
            else {
                const issueType = document.getElementById('issue-type');
                issueType?.focus();
            }
        }
        w(styles) {
            const styleTag = document.createElement('style');
            const content = [];
            if (styles.inputBackground) {
                content.push(`input[type="text"], textarea, select, .issues-container > .issue > .issue-state, .block-info { background-color: ${styles.inputBackground}; }`);
            }
            if (styles.inputBorder) {
                content.push(`input[type="text"], textarea, select { border: 1px solid ${styles.inputBorder}; }`);
            }
            else {
                content.push(`input[type="text"], textarea, select { border: 1px solid transparent; }`);
            }
            if (styles.inputForeground) {
                content.push(`input[type="text"], textarea, select, .issues-container > .issue > .issue-state, .block-info { color: ${styles.inputForeground}; }`);
            }
            if (styles.inputErrorBorder) {
                content.push(`.invalid-input, .invalid-input:focus, .validation-error { border: 1px solid ${styles.inputErrorBorder} !important; }`);
                content.push(`.required-input { color: ${styles.inputErrorBorder}; }`);
            }
            if (styles.inputErrorBackground) {
                content.push(`.validation-error { background: ${styles.inputErrorBackground}; }`);
            }
            if (styles.inputErrorForeground) {
                content.push(`.validation-error { color: ${styles.inputErrorForeground}; }`);
            }
            if (styles.inputActiveBorder) {
                content.push(`input[type='text']:focus, textarea:focus, select:focus, summary:focus, button:focus, a:focus, .workbenchCommand:focus  { border: 1px solid ${styles.inputActiveBorder}; outline-style: none; }`);
            }
            if (styles.textLinkColor) {
                content.push(`a, .workbenchCommand { color: ${styles.textLinkColor}; }`);
            }
            if (styles.textLinkColor) {
                content.push(`a { color: ${styles.textLinkColor}; }`);
            }
            if (styles.textLinkActiveForeground) {
                content.push(`a:hover, .workbenchCommand:hover { color: ${styles.textLinkActiveForeground}; }`);
            }
            if (styles.sliderBackgroundColor) {
                content.push(`::-webkit-scrollbar-thumb { background-color: ${styles.sliderBackgroundColor}; }`);
            }
            if (styles.sliderActiveColor) {
                content.push(`::-webkit-scrollbar-thumb:active { background-color: ${styles.sliderActiveColor}; }`);
            }
            if (styles.sliderHoverColor) {
                content.push(`::--webkit-scrollbar-thumb:hover { background-color: ${styles.sliderHoverColor}; }`);
            }
            if (styles.buttonBackground) {
                content.push(`.monaco-text-button { background-color: ${styles.buttonBackground} !important; }`);
            }
            if (styles.buttonForeground) {
                content.push(`.monaco-text-button { color: ${styles.buttonForeground} !important; }`);
            }
            if (styles.buttonHoverBackground) {
                content.push(`.monaco-text-button:not(.disabled):hover, .monaco-text-button:focus { background-color: ${styles.buttonHoverBackground} !important; }`);
            }
            styleTag.textContent = content.join('\n');
            document.head.appendChild(styleTag);
            document.body.style.color = styles.color || '';
        }
        y(extensions) {
            const installedExtensions = extensions.filter(x => !x.isBuiltin);
            const { nonThemes, themes } = (0, collections_1.$I)(installedExtensions, ext => {
                return ext.isTheme ? 'themes' : 'nonThemes';
            });
            const numberOfThemeExtesions = themes && themes.length;
            this.c.update({ numberOfThemeExtesions, enabledNonThemeExtesions: nonThemes, allExtensions: installedExtensions });
            this.ob(nonThemes, numberOfThemeExtesions);
            if (this.s.disableExtensions || installedExtensions.length === 0) {
                this.ub('disableExtensions').disabled = true;
            }
            this.jb(installedExtensions);
        }
        async z(extension) {
            try {
                const uri = await this.u.$getIssueReporterUri(extension.id);
                extension.bugsUrl = uri.toString(true);
            }
            catch (e) {
                extension.hasIssueUriRequestHandler = false;
                // The issue handler failed so fall back to old issue reporter experience.
                this.Y();
            }
        }
        C() {
            this.vb('issue-type', 'change', (event) => {
                const issueType = parseInt(event.target.value);
                this.c.update({ issueType: issueType });
                if (issueType === 1 /* IssueType.PerformanceIssue */ && !this.h) {
                    this.u.$getPerformanceInfo().then(info => {
                        this.D(info);
                    });
                }
                this.F();
                this.X();
                this.render();
            });
            ['includeSystemInfo', 'includeProcessInfo', 'includeWorkspaceInfo', 'includeExtensions', 'includeExperiments'].forEach(elementId => {
                this.vb(elementId, 'click', (event) => {
                    event.stopPropagation();
                    this.c.update({ [elementId]: !this.c.getData()[elementId] });
                });
            });
            const showInfoElements = document.getElementsByClassName('showInfo');
            for (let i = 0; i < showInfoElements.length; i++) {
                const showInfo = showInfoElements.item(i);
                showInfo.addEventListener('click', (e) => {
                    e.preventDefault();
                    const label = e.target;
                    if (label) {
                        const containingElement = label.parentElement && label.parentElement.parentElement;
                        const info = containingElement && containingElement.lastElementChild;
                        if (info && info.classList.contains('hidden')) {
                            show(info);
                            label.textContent = (0, nls_1.localize)(0, null);
                        }
                        else {
                            hide(info);
                            label.textContent = (0, nls_1.localize)(1, null);
                        }
                    }
                });
            }
            this.vb('issue-source', 'change', (e) => {
                const value = e.target.value;
                const problemSourceHelpText = this.ub('problem-source-help-text');
                if (value === '') {
                    this.c.update({ fileOnExtension: undefined });
                    show(problemSourceHelpText);
                    this.P();
                    this.render();
                    return;
                }
                else {
                    hide(problemSourceHelpText);
                }
                let fileOnExtension, fileOnMarketplace = false;
                if (value === IssueSource.Extension) {
                    fileOnExtension = true;
                }
                else if (value === IssueSource.Marketplace) {
                    fileOnMarketplace = true;
                }
                this.c.update({ fileOnExtension, fileOnMarketplace });
                this.render();
                const title = this.ub('issue-title').value;
                this.L(title, fileOnExtension, fileOnMarketplace);
            });
            this.vb('description', 'input', (e) => {
                const issueDescription = e.target.value;
                this.c.update({ issueDescription });
                // Only search for extension issues on title change
                if (this.c.fileOnExtension() === false) {
                    const title = this.ub('issue-title').value;
                    this.J(title, issueDescription);
                }
            });
            this.vb('issue-title', 'input', (e) => {
                const title = e.target.value;
                const lengthValidationMessage = this.ub('issue-title-length-validation-error');
                const issueUrl = this.eb();
                if (title && this.hb(title, issueUrl).length > MAX_URL_LENGTH) {
                    show(lengthValidationMessage);
                }
                else {
                    hide(lengthValidationMessage);
                }
                const issueSource = this.ub('issue-source');
                if (!issueSource || issueSource.value === '') {
                    return;
                }
                const { fileOnExtension, fileOnMarketplace } = this.c.getData();
                this.L(title, fileOnExtension, fileOnMarketplace);
            });
            this.r.onDidClick(async () => {
                this.n.trigger(async () => {
                    this.cb();
                });
            });
            this.vb('disableExtensions', 'click', () => {
                this.u.$reloadWithExtensionsDisabled();
            });
            this.vb('extensionBugsLink', 'click', (e) => {
                const url = e.target.innerText;
                (0, dom_1.$jP)(url);
            });
            this.vb('disableExtensions', 'keydown', (e) => {
                e.stopPropagation();
                if (e.keyCode === 13 || e.keyCode === 32) {
                    this.u.$reloadWithExtensionsDisabled();
                }
            });
            document.onkeydown = async (e) => {
                const cmdOrCtrlKey = platform_1.$j ? e.metaKey : e.ctrlKey;
                // Cmd/Ctrl+Enter previews issue and closes window
                if (cmdOrCtrlKey && e.keyCode === 13) {
                    this.n.trigger(async () => {
                        if (await this.cb()) {
                            this.O();
                        }
                    });
                }
                // Cmd/Ctrl + w closes issue window
                if (cmdOrCtrlKey && e.keyCode === 87) {
                    e.stopPropagation();
                    e.preventDefault();
                    const issueTitle = this.ub('issue-title').value;
                    const { issueDescription } = this.c.getData();
                    if (!this.m && (issueTitle || issueDescription)) {
                        // fire and forget
                        this.u.$showConfirmCloseDialog();
                    }
                    else {
                        this.O();
                    }
                }
                // Cmd/Ctrl + zooms in
                if (cmdOrCtrlKey && e.keyCode === 187) {
                    (0, window_1.$u7b)();
                }
                // Cmd/Ctrl - zooms out
                if (cmdOrCtrlKey && e.keyCode === 189) {
                    (0, window_1.$v7b)();
                }
                // With latest electron upgrade, cmd+a is no longer propagating correctly for inputs in this window on mac
                // Manually perform the selection
                if (platform_1.$j) {
                    if (cmdOrCtrlKey && e.keyCode === 65 && e.target) {
                        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                            e.target.select();
                        }
                    }
                }
            };
        }
        D(info) {
            this.c.update(info);
            this.h = true;
            const state = this.c.getData();
            this.mb(state);
            this.nb(state);
            this.F();
        }
        F() {
            if (this.G()) {
                if (this.s.data.githubAccessToken) {
                    this.r.label = (0, nls_1.localize)(2, null);
                }
                else {
                    this.r.label = (0, nls_1.localize)(3, null);
                }
                this.r.enabled = true;
            }
            else {
                this.r.enabled = false;
                this.r.label = (0, nls_1.localize)(4, null);
            }
        }
        G() {
            const issueType = this.c.getData().issueType;
            if (issueType === 0 /* IssueType.Bug */ && this.g) {
                return true;
            }
            if (issueType === 1 /* IssueType.PerformanceIssue */ && this.g && this.h) {
                return true;
            }
            if (issueType === 2 /* IssueType.FeatureRequest */) {
                return true;
            }
            return false;
        }
        H() {
            const selectedExtension = this.c.getData().selectedExtension;
            return selectedExtension && selectedExtension.repositoryUrl;
        }
        I() {
            const selectedExtension = this.c.getData().selectedExtension;
            return selectedExtension && selectedExtension.bugsUrl;
        }
        J(title, issueDescription) {
            if (title) {
                this.R(title, issueDescription);
            }
            else {
                this.P();
            }
        }
        L(title, fileOnExtension, fileOnMarketplace) {
            if (fileOnExtension) {
                return this.M(title);
            }
            if (fileOnMarketplace) {
                return this.N(title);
            }
            const description = this.c.getData().issueDescription;
            this.J(title, description);
        }
        M(title) {
            const url = this.gb();
            if (title) {
                const matches = /^https?:\/\/github\.com\/(.*)/.exec(url);
                if (matches && matches.length) {
                    const repo = matches[1];
                    return this.Q(repo, title);
                }
                // If the extension has no repository, display empty search results
                if (this.c.getData().selectedExtension) {
                    this.P();
                    return this.S([]);
                }
            }
            this.P();
        }
        N(title) {
            if (title) {
                const gitHubInfo = this.fb(this.s.product.reportMarketplaceIssueUrl);
                if (gitHubInfo) {
                    return this.Q(`${gitHubInfo.owner}/${gitHubInfo.repositoryName}`, title);
                }
            }
        }
        async O() {
            await this.u.$closeReporter();
        }
        P() {
            const similarIssues = this.ub('similar-issues');
            similarIssues.innerText = '';
            this.f = 0;
        }
        Q(repo, title) {
            const query = `is:issue+repo:${repo}+${title}`;
            const similarIssues = this.ub('similar-issues');
            window.fetch(`https://api.github.com/search/issues?q=${query}`).then((response) => {
                response.json().then(result => {
                    similarIssues.innerText = '';
                    if (result && result.items) {
                        this.S(result.items);
                    }
                    else {
                        // If the items property isn't present, the rate limit has been hit
                        const message = (0, dom_1.$)('div.list-title');
                        message.textContent = (0, nls_1.localize)(5, null);
                        similarIssues.appendChild(message);
                        const resetTime = response.headers.get('X-RateLimit-Reset');
                        const timeToWait = resetTime ? parseInt(resetTime) - Math.floor(Date.now() / 1000) : 1;
                        if (this.j) {
                            this.j = false;
                            setTimeout(() => {
                                this.Q(repo, title);
                                this.j = true;
                            }, timeToWait * 1000);
                        }
                    }
                }).catch(_ => {
                    // Ignore
                });
            }).catch(_ => {
                // Ignore
            });
        }
        R(title, body) {
            const url = 'https://vscode-probot.westus.cloudapp.azure.com:7890/duplicate_candidates';
            const init = {
                method: 'POST',
                body: JSON.stringify({
                    title,
                    body
                }),
                headers: new Headers({
                    'Content-Type': 'application/json'
                })
            };
            window.fetch(url, init).then((response) => {
                response.json().then(result => {
                    this.P();
                    if (result && result.candidates) {
                        this.S(result.candidates);
                    }
                    else {
                        throw new Error('Unexpected response, no candidates property');
                    }
                }).catch(_ => {
                    // Ignore
                });
            }).catch(_ => {
                // Ignore
            });
        }
        S(results) {
            const similarIssues = this.ub('similar-issues');
            if (results.length) {
                const issues = (0, dom_1.$)('div.issues-container');
                const issuesText = (0, dom_1.$)('div.list-title');
                issuesText.textContent = (0, nls_1.localize)(6, null);
                this.f = results.length < 5 ? results.length : 5;
                for (let i = 0; i < this.f; i++) {
                    const issue = results[i];
                    const link = (0, dom_1.$)('a.issue-link', { href: issue.html_url });
                    link.textContent = issue.title;
                    link.title = issue.title;
                    link.addEventListener('click', (e) => this.tb(e));
                    link.addEventListener('auxclick', (e) => this.tb(e));
                    let issueState;
                    let item;
                    if (issue.state) {
                        issueState = (0, dom_1.$)('span.issue-state');
                        const issueIcon = (0, dom_1.$)('span.issue-icon');
                        issueIcon.appendChild((0, iconLabels_1.$yQ)(issue.state === 'open' ? codicons_1.$Pj.issueOpened : codicons_1.$Pj.issueClosed));
                        const issueStateLabel = (0, dom_1.$)('span.issue-state.label');
                        issueStateLabel.textContent = issue.state === 'open' ? (0, nls_1.localize)(7, null) : (0, nls_1.localize)(8, null);
                        issueState.title = issue.state === 'open' ? (0, nls_1.localize)(9, null) : (0, nls_1.localize)(10, null);
                        issueState.appendChild(issueIcon);
                        issueState.appendChild(issueStateLabel);
                        item = (0, dom_1.$)('div.issue', undefined, issueState, link);
                    }
                    else {
                        item = (0, dom_1.$)('div.issue', undefined, link);
                    }
                    issues.appendChild(item);
                }
                similarIssues.appendChild(issuesText);
                similarIssues.appendChild(issues);
            }
            else {
                const message = (0, dom_1.$)('div.list-title');
                message.textContent = (0, nls_1.localize)(11, null);
                similarIssues.appendChild(message);
            }
        }
        U() {
            const makeOption = (issueType, description) => (0, dom_1.$)('option', { 'value': issueType.valueOf() }, (0, strings_1.$pe)(description));
            const typeSelect = this.ub('issue-type');
            const { issueType } = this.c.getData();
            (0, dom_1.$_O)(typeSelect, makeOption(0 /* IssueType.Bug */, (0, nls_1.localize)(12, null)), makeOption(2 /* IssueType.FeatureRequest */, (0, nls_1.localize)(13, null)), makeOption(1 /* IssueType.PerformanceIssue */, (0, nls_1.localize)(14, null)));
            typeSelect.value = issueType.toString();
            this.X();
        }
        W(value, description, disabled) {
            const option = document.createElement('option');
            option.disabled = disabled;
            option.value = value;
            option.textContent = description;
            return option;
        }
        X() {
            const sourceSelect = this.ub('issue-source');
            const { issueType, fileOnExtension, selectedExtension } = this.c.getData();
            let selected = sourceSelect.selectedIndex;
            if (selected === -1) {
                if (fileOnExtension !== undefined) {
                    selected = fileOnExtension ? 2 : 1;
                }
                else if (selectedExtension?.isBuiltin) {
                    selected = 1;
                }
            }
            sourceSelect.innerText = '';
            sourceSelect.append(this.W('', (0, nls_1.localize)(15, null), true));
            sourceSelect.append(this.W('vscode', (0, nls_1.localize)(16, null), false));
            sourceSelect.append(this.W('extension', (0, nls_1.localize)(17, null), false));
            if (this.s.product.reportMarketplaceIssueUrl) {
                sourceSelect.append(this.W('marketplace', (0, nls_1.localize)(18, null), false));
            }
            if (issueType !== 2 /* IssueType.FeatureRequest */) {
                sourceSelect.append(this.W('', (0, nls_1.localize)(19, null), false));
            }
            if (selected !== -1 && selected < sourceSelect.options.length) {
                sourceSelect.selectedIndex = selected;
            }
            else {
                sourceSelect.selectedIndex = 0;
                hide(this.ub('problem-source-help-text'));
            }
        }
        Y() {
            // Depending on Issue Type, we render different blocks and text
            const { issueType, fileOnExtension, fileOnMarketplace, selectedExtension } = this.c.getData();
            const blockContainer = this.ub('block-container');
            const systemBlock = document.querySelector('.block-system');
            const processBlock = document.querySelector('.block-process');
            const workspaceBlock = document.querySelector('.block-workspace');
            const extensionsBlock = document.querySelector('.block-extensions');
            const experimentsBlock = document.querySelector('.block-experiments');
            const problemSource = this.ub('problem-source');
            const descriptionTitle = this.ub('issue-description-label');
            const descriptionSubtitle = this.ub('issue-description-subtitle');
            const extensionSelector = this.ub('extension-selection');
            const titleTextArea = this.ub('issue-title-container');
            const descriptionTextArea = this.ub('description');
            // Hide all by default
            hide(blockContainer);
            hide(systemBlock);
            hide(processBlock);
            hide(workspaceBlock);
            hide(extensionsBlock);
            hide(experimentsBlock);
            hide(problemSource);
            hide(extensionSelector);
            show(problemSource);
            show(titleTextArea);
            show(descriptionTextArea);
            if (fileOnExtension) {
                show(extensionSelector);
            }
            if (fileOnExtension && selectedExtension?.hasIssueUriRequestHandler) {
                hide(titleTextArea);
                hide(descriptionTextArea);
                (0, dom_1.$_O)(descriptionTitle, (0, nls_1.localize)(20, null));
                (0, dom_1.$_O)(descriptionSubtitle, (0, nls_1.localize)(21, null, selectedExtension.displayName));
                this.r.label = (0, nls_1.localize)(22, null);
                return;
            }
            if (issueType === 0 /* IssueType.Bug */) {
                if (!fileOnMarketplace) {
                    show(blockContainer);
                    show(systemBlock);
                    show(experimentsBlock);
                    if (!fileOnExtension) {
                        show(extensionsBlock);
                    }
                }
                (0, dom_1.$_O)(descriptionTitle, (0, nls_1.localize)(23, null) + ' ', (0, dom_1.$)('span.required-input', undefined, '*'));
                (0, dom_1.$_O)(descriptionSubtitle, (0, nls_1.localize)(24, null));
            }
            else if (issueType === 1 /* IssueType.PerformanceIssue */) {
                if (!fileOnMarketplace) {
                    show(blockContainer);
                    show(systemBlock);
                    show(processBlock);
                    show(workspaceBlock);
                    show(experimentsBlock);
                }
                if (fileOnExtension) {
                    show(extensionSelector);
                }
                else if (!fileOnMarketplace) {
                    show(extensionsBlock);
                }
                (0, dom_1.$_O)(descriptionTitle, (0, nls_1.localize)(25, null) + ' ', (0, dom_1.$)('span.required-input', undefined, '*'));
                (0, dom_1.$_O)(descriptionSubtitle, (0, nls_1.localize)(26, null));
            }
            else if (issueType === 2 /* IssueType.FeatureRequest */) {
                (0, dom_1.$_O)(descriptionTitle, (0, nls_1.localize)(27, null) + ' ', (0, dom_1.$)('span.required-input', undefined, '*'));
                (0, dom_1.$_O)(descriptionSubtitle, (0, nls_1.localize)(28, null));
            }
        }
        Z(inputId) {
            const inputElement = this.ub(inputId);
            const inputValidationMessage = this.ub(`${inputId}-empty-error`);
            if (!inputElement.value) {
                inputElement.classList.add('invalid-input');
                inputValidationMessage?.classList.remove('hidden');
                return false;
            }
            else {
                inputElement.classList.remove('invalid-input');
                inputValidationMessage?.classList.add('hidden');
                return true;
            }
        }
        ab() {
            let isValid = true;
            ['issue-title', 'description', 'issue-source'].forEach(elementId => {
                isValid = this.Z(elementId) && isValid;
            });
            if (this.c.fileOnExtension()) {
                isValid = this.Z('extension-selector') && isValid;
            }
            return isValid;
        }
        async bb(issueTitle, issueBody, gitHubDetails) {
            const url = `https://api.github.com/repos/${gitHubDetails.owner}/${gitHubDetails.repositoryName}/issues`;
            const init = {
                method: 'POST',
                body: JSON.stringify({
                    title: issueTitle,
                    body: issueBody
                }),
                headers: new Headers({
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.s.data.githubAccessToken}`
                })
            };
            const response = await window.fetch(url, init);
            if (!response.ok) {
                return false;
            }
            const result = await response.json();
            await this.t.openExternal(result.html_url);
            this.O();
            return true;
        }
        async cb() {
            // Short circuit if the extension provides a custom issue handler
            if (this.c.getData().selectedExtension?.hasIssueUriRequestHandler) {
                const url = this.I();
                if (url) {
                    this.m = true;
                    await this.t.openExternal(url);
                    return true;
                }
            }
            if (!this.ab()) {
                // If inputs are invalid, set focus to the first one and add listeners on them
                // to detect further changes
                const invalidInput = document.getElementsByClassName('invalid-input');
                if (invalidInput.length) {
                    invalidInput[0].focus();
                }
                this.vb('issue-title', 'input', _ => {
                    this.Z('issue-title');
                });
                this.vb('description', 'input', _ => {
                    this.Z('description');
                });
                this.vb('issue-source', 'change', _ => {
                    this.Z('issue-source');
                });
                if (this.c.fileOnExtension()) {
                    this.vb('extension-selector', 'change', _ => {
                        this.Z('extension-selector');
                    });
                }
                return false;
            }
            this.m = true;
            const issueTitle = this.ub('issue-title').value;
            const issueBody = this.c.serialize();
            const issueUrl = this.eb();
            const gitHubDetails = this.fb(issueUrl);
            if (this.s.data.githubAccessToken && gitHubDetails) {
                return this.bb(issueTitle, issueBody, gitHubDetails);
            }
            const baseUrl = this.hb(this.ub('issue-title').value, issueUrl);
            let url = baseUrl + `&body=${encodeURIComponent(issueBody)}`;
            if (url.length > MAX_URL_LENGTH) {
                try {
                    url = await this.db(baseUrl, issueBody);
                }
                catch (_) {
                    return false;
                }
            }
            await this.t.openExternal(url);
            return true;
        }
        async db(baseUrl, issueBody) {
            const shouldWrite = await this.u.$showClipboardDialog();
            if (!shouldWrite) {
                throw new errors_1.$3();
            }
            await this.t.writeClipboardText(issueBody);
            return baseUrl + `&body=${encodeURIComponent((0, nls_1.localize)(29, null))}`;
        }
        eb() {
            return this.c.fileOnExtension()
                ? this.gb()
                : this.c.getData().fileOnMarketplace
                    ? this.s.product.reportMarketplaceIssueUrl
                    : this.s.product.reportIssueUrl;
        }
        fb(url) {
            // Assumes a GitHub url to a particular repo, https://github.com/repositoryName/owner.
            // Repository name and owner cannot contain '/'
            const match = /^https?:\/\/github\.com\/([^\/]*)\/([^\/]*).*/.exec(url);
            if (match && match.length) {
                return {
                    owner: match[1],
                    repositoryName: match[2]
                };
            }
            return undefined;
        }
        gb() {
            let repositoryUrl = '';
            const bugsUrl = this.I();
            const extensionUrl = this.H();
            // If given, try to match the extension's bug url
            if (bugsUrl && bugsUrl.match(/^https?:\/\/github\.com\/(.*)/)) {
                repositoryUrl = (0, issueReporterUtil_1.$c5b)(bugsUrl);
            }
            else if (extensionUrl && extensionUrl.match(/^https?:\/\/github\.com\/(.*)/)) {
                repositoryUrl = (0, issueReporterUtil_1.$c5b)(extensionUrl);
            }
            return repositoryUrl;
        }
        hb(issueTitle, repositoryUrl) {
            if (this.c.fileOnExtension()) {
                repositoryUrl = repositoryUrl + '/issues/new';
            }
            const queryStringPrefix = repositoryUrl.indexOf('?') === -1 ? '?' : '&';
            return `${repositoryUrl}${queryStringPrefix}title=${encodeURIComponent(issueTitle)}`;
        }
        ib(state) {
            const target = document.querySelector('.block-system .block-info');
            if (target) {
                const systemInfo = state.systemInfo;
                const renderedDataTable = (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, 'CPUs'), (0, dom_1.$)('td', undefined, systemInfo.cpus || '')), (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, 'GPU Status'), (0, dom_1.$)('td', undefined, Object.keys(systemInfo.gpuStatus).map(key => `${key}: ${systemInfo.gpuStatus[key]}`).join('\n'))), (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, 'Load (avg)'), (0, dom_1.$)('td', undefined, systemInfo.load || '')), (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, 'Memory (System)'), (0, dom_1.$)('td', undefined, systemInfo.memory)), (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, 'Process Argv'), (0, dom_1.$)('td', undefined, systemInfo.processArgs)), (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, 'Screen Reader'), (0, dom_1.$)('td', undefined, systemInfo.screenReader)), (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, 'VM'), (0, dom_1.$)('td', undefined, systemInfo.vmHint)));
                (0, dom_1.$_O)(target, renderedDataTable);
                systemInfo.remoteData.forEach(remote => {
                    target.appendChild((0, dom_1.$)('hr'));
                    if ((0, diagnostics_1.$hm)(remote)) {
                        const remoteDataTable = (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, 'Remote'), (0, dom_1.$)('td', undefined, remote.hostName)), (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, ''), (0, dom_1.$)('td', undefined, remote.errorMessage)));
                        target.appendChild(remoteDataTable);
                    }
                    else {
                        const remoteDataTable = (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, 'Remote'), (0, dom_1.$)('td', undefined, remote.latency ? `${remote.hostName} (latency: ${remote.latency.current.toFixed(2)}ms last, ${remote.latency.average.toFixed(2)}ms average)` : remote.hostName)), (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, 'OS'), (0, dom_1.$)('td', undefined, remote.machineInfo.os)), (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, 'CPUs'), (0, dom_1.$)('td', undefined, remote.machineInfo.cpus || '')), (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, 'Memory (System)'), (0, dom_1.$)('td', undefined, remote.machineInfo.memory)), (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, 'VM'), (0, dom_1.$)('td', undefined, remote.machineInfo.vmHint)));
                        target.appendChild(remoteDataTable);
                    }
                });
            }
        }
        jb(extensions) {
            const extensionOptions = extensions.map(extension => {
                return {
                    name: extension.displayName || extension.name || '',
                    id: extension.id
                };
            });
            // Sort extensions by name
            extensionOptions.sort((a, b) => {
                const aName = a.name.toLowerCase();
                const bName = b.name.toLowerCase();
                if (aName > bName) {
                    return 1;
                }
                if (aName < bName) {
                    return -1;
                }
                return 0;
            });
            const makeOption = (extension, selectedExtension) => {
                const selected = selectedExtension && extension.id === selectedExtension.id;
                return (0, dom_1.$)('option', {
                    'value': extension.id,
                    'selected': selected || ''
                }, extension.name);
            };
            const extensionsSelector = this.ub('extension-selector');
            if (extensionsSelector) {
                const { selectedExtension } = this.c.getData();
                (0, dom_1.$_O)(extensionsSelector, this.W('', (0, nls_1.localize)(30, null), true), ...extensionOptions.map(extension => makeOption(extension, selectedExtension)));
                extensionsSelector.selectedIndex = 0;
                this.vb('extension-selector', 'change', (e) => {
                    const selectedExtensionId = e.target.value;
                    const extensions = this.c.getData().allExtensions;
                    const matches = extensions.filter(extension => extension.id === selectedExtensionId);
                    if (matches.length) {
                        this.c.update({ selectedExtension: matches[0] });
                        if (matches[0].hasIssueUriRequestHandler) {
                            this.z(matches[0]);
                        }
                        else {
                            this.kb();
                            const title = this.ub('issue-title').value;
                            this.M(title);
                        }
                    }
                    else {
                        this.c.update({ selectedExtension: undefined });
                        this.P();
                        this.kb();
                    }
                    this.F();
                    this.Y();
                });
            }
            this.vb('problem-source', 'change', (_) => {
                this.kb();
            });
        }
        kb() {
            const extensionValidationMessage = this.ub('extension-selection-validation-error');
            const extensionValidationNoUrlsMessage = this.ub('extension-selection-validation-error-no-url');
            hide(extensionValidationMessage);
            hide(extensionValidationNoUrlsMessage);
            const extension = this.c.getData().selectedExtension;
            if (!extension) {
                this.r.enabled = true;
                return;
            }
            const hasValidGitHubUrl = this.gb();
            if (hasValidGitHubUrl || extension.hasIssueUriRequestHandler) {
                this.r.enabled = true;
            }
            else {
                this.lb();
                this.r.enabled = false;
            }
        }
        lb() {
            const extensionValidationMessage = this.ub('extension-selection-validation-error');
            const extensionValidationNoUrlsMessage = this.ub('extension-selection-validation-error-no-url');
            const bugsUrl = this.I();
            if (bugsUrl) {
                show(extensionValidationMessage);
                const link = this.ub('extensionBugsLink');
                link.textContent = bugsUrl;
                return;
            }
            const extensionUrl = this.H();
            if (extensionUrl) {
                show(extensionValidationMessage);
                const link = this.ub('extensionBugsLink');
                link.textContent = extensionUrl;
                return;
            }
            show(extensionValidationNoUrlsMessage);
        }
        mb(state) {
            const target = document.querySelector('.block-process .block-info');
            if (target) {
                (0, dom_1.$_O)(target, (0, dom_1.$)('code', undefined, state.processInfo ?? ''));
            }
        }
        nb(state) {
            document.querySelector('.block-workspace .block-info code').textContent = '\n' + state.workspaceInfo;
        }
        ob(extensions, numThemeExtensions) {
            const target = document.querySelector('.block-extensions .block-info');
            if (target) {
                if (this.s.disableExtensions) {
                    (0, dom_1.$_O)(target, (0, nls_1.localize)(31, null));
                    return;
                }
                const themeExclusionStr = numThemeExtensions ? `\n(${numThemeExtensions} theme extensions excluded)` : '';
                extensions = extensions || [];
                if (!extensions.length) {
                    target.innerText = 'Extensions: none' + themeExclusionStr;
                    return;
                }
                (0, dom_1.$_O)(target, this.sb(extensions), document.createTextNode(themeExclusionStr));
            }
        }
        pb(restrictedMode) {
            this.c.update({ restrictedMode });
        }
        qb(isUnsupported) {
            this.c.update({ isUnsupported });
        }
        rb(experimentInfo) {
            this.c.update({ experimentInfo });
            const target = document.querySelector('.block-experiments .block-info');
            if (target) {
                target.textContent = experimentInfo ? experimentInfo : (0, nls_1.localize)(32, null);
            }
        }
        sb(extensions) {
            return (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, 'Extension'), (0, dom_1.$)('th', undefined, 'Author (truncated)'), (0, dom_1.$)('th', undefined, 'Version')), ...extensions.map(extension => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, extension.name), (0, dom_1.$)('td', undefined, extension.publisher?.substr(0, 3) ?? 'N/A'), (0, dom_1.$)('td', undefined, extension.version))));
        }
        tb(event) {
            event.preventDefault();
            event.stopPropagation();
            // Exclude right click
            if (event.which < 3) {
                (0, dom_1.$jP)(event.target.href);
            }
        }
        ub(elementId) {
            const element = document.getElementById(elementId);
            if (element) {
                return element;
            }
            else {
                return undefined;
            }
        }
        vb(elementId, eventType, handler) {
            const element = this.ub(elementId);
            element?.addEventListener(eventType, handler);
        }
    };
    exports.$w7b = $w7b;
    __decorate([
        (0, decorators_1.$7g)(300)
    ], $w7b.prototype, "Q", null);
    __decorate([
        (0, decorators_1.$7g)(300)
    ], $w7b.prototype, "R", null);
    exports.$w7b = $w7b = __decorate([
        __param(1, native_1.$05b),
        __param(2, issue_1.$qtb)
    ], $w7b);
    // helper functions
    function hide(el) {
        el?.classList.add('hidden');
    }
    exports.hide = hide;
    function show(el) {
        el?.classList.remove('hidden');
    }
    exports.show = show;
});
//# sourceMappingURL=issueReporterService.js.map