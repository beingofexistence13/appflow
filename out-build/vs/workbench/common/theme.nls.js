/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	"Active tab background color in an active group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups.",
	"Active tab background color in an unfocused group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups.",
	"Inactive tab background color in an active group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups.",
	"Inactive tab background color in an unfocused group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups.",
	"Active tab foreground color in an active group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups.",
	"Inactive tab foreground color in an active group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups.",
	"Active tab foreground color in an unfocused group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups.",
	"Inactive tab foreground color in an unfocused group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups.",
	"Tab background color when hovering. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups.",
	"Tab background color in an unfocused group when hovering. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups.",
	"Tab foreground color when hovering. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups.",
	"Tab foreground color in an unfocused group when hovering. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups.",
	"Border to separate tabs from each other. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups.",
	"Border to separate pinned tabs from other tabs. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups.",
	"Border on the bottom of an active tab. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups.",
	"Border on the bottom of an active tab in an unfocused group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups.",
	"Border to the top of an active tab. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups.",
	"Border to the top of an active tab in an unfocused group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups.",
	"Border to highlight tabs when hovering. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups.",
	"Border to highlight tabs in an unfocused group when hovering. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups.",
	"Border on the top of modified active tabs in an active group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups.",
	"Border on the top of modified inactive tabs in an active group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups.",
	"Border on the top of modified active tabs in an unfocused group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups.",
	"Border on the top of modified inactive tabs in an unfocused group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups.",
	"Background color of the editor pane visible on the left and right side of the centered editor layout.",
	"Background color of an empty editor group. Editor groups are the containers of editors.",
	"Border color of an empty editor group that is focused. Editor groups are the containers of editors.",
	"Background color of the editor group title header when tabs are enabled. Editor groups are the containers of editors.",
	"Border color of the editor group title header when tabs are enabled. Editor groups are the containers of editors.",
	"Background color of the editor group title header when tabs are disabled (`\"workbench.editor.showTabs\": false`). Editor groups are the containers of editors.",
	"Border color of the editor group title header. Editor groups are the containers of editors.",
	"Color to separate multiple editor groups from each other. Editor groups are the containers of editors.",
	"Background color when dragging editors around. The color should have transparency so that the editor contents can still shine through.",
	"Foreground color of text shown over editors when dragging files. This text informs the user that they can hold shift to drop into the editor.",
	"Background color of text shown over editors when dragging files. This text informs the user that they can hold shift to drop into the editor.",
	"Border color of text shown over editors when dragging files. This text informs the user that they can hold shift to drop into the editor.",
	"Color to separate two editors from each other when shown side by side in an editor group from top to bottom.",
	"Color to separate two editors from each other when shown side by side in an editor group from left to right.",
	"Panel background color. Panels are shown below the editor area and contain views like output and integrated terminal.",
	"Panel border color to separate the panel from the editor. Panels are shown below the editor area and contain views like output and integrated terminal.",
	"Title color for the active panel. Panels are shown below the editor area and contain views like output and integrated terminal.",
	"Title color for the inactive panel. Panels are shown below the editor area and contain views like output and integrated terminal.",
	"Border color for the active panel title. Panels are shown below the editor area and contain views like output and integrated terminal.",
	"Input box border for inputs in the panel.",
	"Drag and drop feedback color for the panel titles. Panels are shown below the editor area and contain views like output and integrated terminal.",
	"Drag and drop feedback color for the panel sections. The color should have transparency so that the panel sections can still shine through. Panels are shown below the editor area and contain views like output and integrated terminal. Panel sections are views nested within the panels.",
	"Panel section header background color. Panels are shown below the editor area and contain views like output and integrated terminal. Panel sections are views nested within the panels.",
	"Panel section header foreground color. Panels are shown below the editor area and contain views like output and integrated terminal. Panel sections are views nested within the panels.",
	"Panel section header border color used when multiple views are stacked vertically in the panel. Panels are shown below the editor area and contain views like output and integrated terminal. Panel sections are views nested within the panels.",
	"Panel section border color used when multiple views are stacked horizontally in the panel. Panels are shown below the editor area and contain views like output and integrated terminal. Panel sections are views nested within the panels.",
	"Banner background color. The banner is shown under the title bar of the window.",
	"Banner foreground color. The banner is shown under the title bar of the window.",
	"Banner icon color. The banner is shown under the title bar of the window.",
	"Status bar foreground color when a workspace or folder is opened. The status bar is shown in the bottom of the window.",
	"Status bar foreground color when no folder is opened. The status bar is shown in the bottom of the window.",
	"Status bar background color when a workspace or folder is opened. The status bar is shown in the bottom of the window.",
	"Status bar background color when no folder is opened. The status bar is shown in the bottom of the window.",
	"Status bar border color separating to the sidebar and editor. The status bar is shown in the bottom of the window.",
	"Status bar border color when focused on keyboard navigation. The status bar is shown in the bottom of the window.",
	"Status bar border color separating to the sidebar and editor when no folder is opened. The status bar is shown in the bottom of the window.",
	"Status bar item background color when clicking. The status bar is shown in the bottom of the window.",
	"Status bar item border color when focused on keyboard navigation. The status bar is shown in the bottom of the window.",
	"Status bar item background color when hovering. The status bar is shown in the bottom of the window.",
	"Status bar item foreground color when hovering. The status bar is shown in the bottom of the window.",
	"Status bar item background color when hovering an item that contains two hovers. The status bar is shown in the bottom of the window.",
	"Status bar prominent items foreground color. Prominent items stand out from other status bar entries to indicate importance. The status bar is shown in the bottom of the window.",
	"Status bar prominent items background color. Prominent items stand out from other status bar entries to indicate importance. The status bar is shown in the bottom of the window.",
	"Status bar prominent items foreground color when hovering. Prominent items stand out from other status bar entries to indicate importance. The status bar is shown in the bottom of the window.",
	"Status bar prominent items background color when hovering. Prominent items stand out from other status bar entries to indicate importance. The status bar is shown in the bottom of the window.",
	"Status bar error items background color. Error items stand out from other status bar entries to indicate error conditions. The status bar is shown in the bottom of the window.",
	"Status bar error items foreground color. Error items stand out from other status bar entries to indicate error conditions. The status bar is shown in the bottom of the window.",
	"Status bar error items foreground color when hovering. Error items stand out from other status bar entries to indicate error conditions. The status bar is shown in the bottom of the window.",
	"Status bar error items background color when hovering. Error items stand out from other status bar entries to indicate error conditions. The status bar is shown in the bottom of the window.",
	"Status bar warning items background color. Warning items stand out from other status bar entries to indicate warning conditions. The status bar is shown in the bottom of the window.",
	"Status bar warning items foreground color. Warning items stand out from other status bar entries to indicate warning conditions. The status bar is shown in the bottom of the window.",
	"Status bar warning items foreground color when hovering. Warning items stand out from other status bar entries to indicate warning conditions. The status bar is shown in the bottom of the window.",
	"Status bar warning items background color when hovering. Warning items stand out from other status bar entries to indicate warning conditions. The status bar is shown in the bottom of the window.",
	"Activity bar background color. The activity bar is showing on the far left or right and allows to switch between views of the side bar.",
	"Activity bar item foreground color when it is active. The activity bar is showing on the far left or right and allows to switch between views of the side bar.",
	"Activity bar item foreground color when it is inactive. The activity bar is showing on the far left or right and allows to switch between views of the side bar.",
	"Activity bar border color separating to the side bar. The activity bar is showing on the far left or right and allows to switch between views of the side bar.",
	"Activity bar border color for the active item. The activity bar is showing on the far left or right and allows to switch between views of the side bar.",
	"Activity bar focus border color for the active item. The activity bar is showing on the far left or right and allows to switch between views of the side bar.",
	"Activity bar background color for the active item. The activity bar is showing on the far left or right and allows to switch between views of the side bar.",
	"Drag and drop feedback color for the activity bar items. The activity bar is showing on the far left or right and allows to switch between views of the side bar.",
	"Activity notification badge background color. The activity bar is showing on the far left or right and allows to switch between views of the side bar.",
	"Activity notification badge foreground color. The activity bar is showing on the far left or right and allows to switch between views of the side bar.",
	"Profile badge background color. The profile badge shows on top of the settings gear icon in the activity bar.",
	"Profile badge foreground color. The profile badge shows on top of the settings gear icon in the activity bar.",
	"Background color for the remote indicator on the status bar.",
	"Foreground color for the remote indicator on the status bar.",
	"Foreground color for the remote indicator on the status bar when hovering.",
	"Background color for the remote indicator on the status bar when hovering.",
	"Status bar item background color when the workbench is offline.",
	"Status bar item foreground color when the workbench is offline.",
	"Status bar item foreground hover color when the workbench is offline.",
	"Status bar item background hover color when the workbench is offline.",
	"Background color for the remote badge in the extensions view.",
	"Foreground color for the remote badge in the extensions view.",
	"Side bar background color. The side bar is the container for views like explorer and search.",
	"Side bar foreground color. The side bar is the container for views like explorer and search.",
	"Side bar border color on the side separating to the editor. The side bar is the container for views like explorer and search.",
	"Side bar title foreground color. The side bar is the container for views like explorer and search.",
	"Drag and drop feedback color for the side bar sections. The color should have transparency so that the side bar sections can still shine through. The side bar is the container for views like explorer and search. Side bar sections are views nested within the side bar.",
	"Side bar section header background color. The side bar is the container for views like explorer and search. Side bar sections are views nested within the side bar.",
	"Side bar section header foreground color. The side bar is the container for views like explorer and search. Side bar sections are views nested within the side bar.",
	"Side bar section header border color. The side bar is the container for views like explorer and search. Side bar sections are views nested within the side bar.",
	"Title bar foreground when the window is active.",
	"Title bar foreground when the window is inactive.",
	"Title bar background when the window is active.",
	"Title bar background when the window is inactive.",
	"Title bar border color.",
	"Foreground color of the selected menu item in the menubar.",
	"Background color of the selected menu item in the menubar.",
	"Border color of the selected menu item in the menubar.",
	"Foreground color of the command center",
	"Active foreground color of the command center",
	"Foreground color of the command center when the window is inactive",
	"Background color of the command center",
	"Active background color of the command center",
	"Border color of the command center",
	"Active border color of the command center",
	"Border color of the command center when the window is inactive",
	"Notifications center border color. Notifications slide in from the bottom right of the window.",
	"Notification toast border color. Notifications slide in from the bottom right of the window.",
	"Notifications foreground color. Notifications slide in from the bottom right of the window.",
	"Notifications background color. Notifications slide in from the bottom right of the window.",
	"Notification links foreground color. Notifications slide in from the bottom right of the window.",
	"Notifications center header foreground color. Notifications slide in from the bottom right of the window.",
	"Notifications center header background color. Notifications slide in from the bottom right of the window.",
	"Notifications border color separating from other notifications in the notifications center. Notifications slide in from the bottom right of the window.",
	"The color used for the icon of error notifications. Notifications slide in from the bottom right of the window.",
	"The color used for the icon of warning notifications. Notifications slide in from the bottom right of the window.",
	"The color used for the icon of info notifications. Notifications slide in from the bottom right of the window.",
	"The color used for the border of the window when it is active. Only supported in the macOS and Linux desktop client when using the custom title bar.",
	"The color used for the border of the window when it is inactive. Only supported in the macOS and Linux desktop client when using the custom title bar."
]);