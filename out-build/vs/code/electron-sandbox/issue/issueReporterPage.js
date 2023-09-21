/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/nls!vs/code/electron-sandbox/issue/issueReporterPage"], function (require, exports, strings_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const sendSystemInfoLabel = (0, strings_1.$pe)((0, nls_1.localize)(0, null));
    const sendProcessInfoLabel = (0, strings_1.$pe)((0, nls_1.localize)(1, null));
    const sendWorkspaceInfoLabel = (0, strings_1.$pe)((0, nls_1.localize)(2, null));
    const sendExtensionsLabel = (0, strings_1.$pe)((0, nls_1.localize)(3, null));
    const sendExperimentsLabel = (0, strings_1.$pe)((0, nls_1.localize)(4, null));
    const reviewGuidanceLabel = (0, nls_1.localize)(// intentionally not escaped because of its embedded tags
    5, null);






    exports.default = () => `
<div id="issue-reporter">
	<div id="english" class="input-group hidden">${(0, strings_1.$pe)((0, nls_1.localize)(6, null))}</div>

	<div id="review-guidance-help-text" class="input-group">${reviewGuidanceLabel}</div>

	<div class="section">
		<div class="input-group">
			<label class="inline-label" for="issue-type">${(0, strings_1.$pe)((0, nls_1.localize)(7, null))}</label>
			<select id="issue-type" class="inline-form-control">
				<!-- To be dynamically filled -->
			</select>
		</div>

		<div class="input-group" id="problem-source">
			<label class="inline-label" for="issue-source">${(0, strings_1.$pe)((0, nls_1.localize)(8, null))} <span class="required-input">*</span></label>
			<select id="issue-source" class="inline-form-control" required>
				<!-- To be dynamically filled -->
			</select>
			<div id="issue-source-empty-error" class="validation-error hidden" role="alert">${(0, strings_1.$pe)((0, nls_1.localize)(9, null))}</div>
			<div id="problem-source-help-text" class="instructions hidden">${(0, strings_1.$pe)((0, nls_1.localize)(10, null))
        .replace('{0}', () => `<span tabIndex=0 role="button" id="disableExtensions" class="workbenchCommand">${(0, strings_1.$pe)((0, nls_1.localize)(11, null))}</span>`)}
			</div>

			<div id="extension-selection">
				<label class="inline-label" for="extension-selector">${(0, strings_1.$pe)((0, nls_1.localize)(12, null))} <span class="required-input">*</span></label>
				<select id="extension-selector" class="inline-form-control">
					<!-- To be dynamically filled -->
				</select>
				<div id="extension-selection-validation-error" class="validation-error hidden" role="alert">${(0, strings_1.$pe)((0, nls_1.localize)(13, null))
        .replace('{0}', () => `<span tabIndex=0 role="button" id="extensionBugsLink" class="workbenchCommand"><!-- To be dynamically filled --></span>`)}</div>
				<div id="extension-selection-validation-error-no-url" class="validation-error hidden" role="alert">
					${(0, strings_1.$pe)((0, nls_1.localize)(14, null))}
				</div>
			</div>
		</div>

		<div id="issue-title-container" class="input-group">
			<label class="inline-label" for="issue-title">${(0, strings_1.$pe)((0, nls_1.localize)(15, null))} <span class="required-input">*</span></label>
			<input id="issue-title" type="text" class="inline-form-control" placeholder="${(0, strings_1.$pe)((0, nls_1.localize)(16, null))}" required>
			<div id="issue-title-empty-error" class="validation-error hidden" role="alert">${(0, strings_1.$pe)((0, nls_1.localize)(17, null))}</div>
			<div id="issue-title-length-validation-error" class="validation-error hidden" role="alert">${(0, strings_1.$pe)((0, nls_1.localize)(18, null))}</div>
			<small id="similar-issues">
				<!-- To be dynamically filled -->
			</small>
		</div>

	</div>

	<div class="input-group description-section">
		<label for="description" id="issue-description-label">
			<!-- To be dynamically filled -->
		</label>
		<div class="instructions" id="issue-description-subtitle">
			<!-- To be dynamically filled -->
		</div>
		<div class="block-info-text">
			<textarea name="description" id="description" placeholder="${(0, strings_1.$pe)((0, nls_1.localize)(19, null))}" required></textarea>
		</div>
		<div id="description-empty-error" class="validation-error hidden" role="alert">${(0, strings_1.$pe)((0, nls_1.localize)(20, null))}</div>
	</div>

	<div class="system-info" id="block-container">
		<div class="block block-system">
			<input class="sendData" aria-label="${sendSystemInfoLabel}" type="checkbox" id="includeSystemInfo" checked/>
			<label class="caption" for="includeSystemInfo">
				${sendSystemInfoLabel}
				(<a href="#" class="showInfo">${(0, strings_1.$pe)((0, nls_1.localize)(21, null))}</a>)
			</label>
			<div class="block-info hidden">
				<!-- To be dynamically filled -->
			</div>
		</div>
		<div class="block block-process">
			<input class="sendData" aria-label="${sendProcessInfoLabel}" type="checkbox" id="includeProcessInfo" checked/>
			<label class="caption" for="includeProcessInfo">
				${sendProcessInfoLabel}
				(<a href="#" class="showInfo">${(0, strings_1.$pe)((0, nls_1.localize)(22, null))}</a>)
			</label>
			<pre class="block-info hidden">
				<code>
				<!-- To be dynamically filled -->
				</code>
			</pre>
		</div>
		<div class="block block-workspace">
			<input class="sendData" aria-label="${sendWorkspaceInfoLabel}" type="checkbox" id="includeWorkspaceInfo" checked/>
			<label class="caption" for="includeWorkspaceInfo">
				${sendWorkspaceInfoLabel}
				(<a href="#" class="showInfo">${(0, strings_1.$pe)((0, nls_1.localize)(23, null))}</a>)
			</label>
			<pre id="systemInfo" class="block-info hidden">
				<code>
				<!-- To be dynamically filled -->
				</code>
			</pre>
		</div>
		<div class="block block-extensions">
			<input class="sendData" aria-label="${sendExtensionsLabel}" type="checkbox" id="includeExtensions" checked/>
			<label class="caption" for="includeExtensions">
				${sendExtensionsLabel}
				(<a href="#" class="showInfo">${(0, strings_1.$pe)((0, nls_1.localize)(24, null))}</a>)
			</label>
			<div id="systemInfo" class="block-info hidden">
				<!-- To be dynamically filled -->
			</div>
		</div>
		<div class="block block-experiments">
			<input class="sendData" aria-label="${sendExperimentsLabel}" type="checkbox" id="includeExperiments" checked/>
			<label class="caption" for="includeExperiments">
				${sendExperimentsLabel}
				(<a href="#" class="showInfo">${(0, strings_1.$pe)((0, nls_1.localize)(25, null))}</a>)
			</label>
			<pre class="block-info hidden">
				<!-- To be dynamically filled -->
			</pre>
		</div>
	</div>
</div>`;
});
//# sourceMappingURL=issueReporterPage.js.map