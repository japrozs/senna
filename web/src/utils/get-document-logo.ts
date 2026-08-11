export const getDocumentLogo = (provider: string, mimeType: string): string => {
	// Google Drive
	if (provider === "google") {
		switch (mimeType) {
			case "application/vnd.google-apps.document":
				return "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Google_Docs_icon_%282026%29.svg/960px-Google_Docs_icon_%282026%29.svg.png";

			case "application/vnd.google-apps.spreadsheet":
				return "https://upload.wikimedia.org/wikipedia/commons/5/50/Google_Sheets_Logo_05.2026.png";

			case "application/vnd.google-apps.presentation":
				return "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Google_Slides_icon_%282026%29.svg/1280px-Google_Slides_icon_%282026%29.svg.png";

			case "application/vnd.google-apps.form":
				return "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Google_Forms_icon_%282026%29.svg/1280px-Google_Forms_icon_%282026%29.svg.png";

			case "application/vnd.google-apps.drawing":
				return "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Google_Drawings_2015_Logo.svg/960px-Google_Drawings_2015_Logo.svg.png";

			case "application/vnd.google-apps.folder":
				return "https://www.macworld.com/wp-content/uploads/2023/12/folder-icon-macos.png";

			default:
				return "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Google_Drive_icon_%282026%29.svg/960px-Google_Drive_icon_%282026%29.svg.png";
		}
	}

	// GitHub
	if (provider === "github") {
		return "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png";
	}

	// Dropbox
	if (provider === "dropbox") {
		return "https://cfl.dropboxstatic.com/static/images/favicon-vflUu0i1.ico";
	}

	// Generic fallback
	return "";
};
