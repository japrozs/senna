import { SearchDocumentsQuery } from "@/generated/graphql";
import React from "react";

interface DocumentCardProps {
	document: SearchDocumentsQuery["search"][number];
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
	return (
		<a
			href={document.url}
			target="_blank"
			rel="noopener noreferrer"
			className="block border border-gray-200 p-4 hover:border-gray-400"
		>
			<div className="font-medium">{document.title}</div>

			<div className="mt-1 text-sm text-gray-400">
				{document.provider} · {document.mimeType}
			</div>
		</a>
	);
};
