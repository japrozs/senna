export const formatMimeType = (mimeType: string): string => {
	const mimeTypes: Record<string, string> = {
		// Google
		"application/vnd.google-apps.document": "Google Docs",
		"application/vnd.google-apps.spreadsheet": "Google Sheets",
		"application/vnd.google-apps.presentation": "Google Slides",
		"application/vnd.google-apps.form": "Google Forms",
		"application/vnd.google-apps.drawing": "Google Drawings",
		"application/vnd.google-apps.script": "Google Apps Script",
		"application/vnd.google-apps.site": "Google Sites",
		"application/vnd.google-apps.folder": "GDrive Folder",
		"application/vnd.google-apps.shortcut": "Shortcut",

		// Common files
		"application/pdf": "PDF",
		"application/msword": "Word",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document":
			"Word",
		"application/vnd.ms-excel": "Excel",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
			"Excel",
		"application/vnd.ms-powerpoint": "PowerPoint",
		"application/vnd.openxmlformats-officedocument.presentationml.presentation":
			"PowerPoint",

		// Text
		"text/plain": "Text",
		"text/csv": "CSV",
		"text/html": "HTML",

		// Images
		"image/jpeg": "JPEG",
		"image/png": "PNG",
		"image/gif": "GIF",
		"image/webp": "WebP",

		// Archives
		"application/zip": "ZIP",
		"application/x-rar-compressed": "RAR",
	};

	return mimeTypes[mimeType] ?? mimeType;
};
