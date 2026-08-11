import { SearchDocumentsQuery } from "@/generated/graphql";
import { formatMimeType } from "@/utils/format-mime-types";
import { getDocumentLogo } from "@/utils/get-document-logo";
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
			className="block border border-gray-200 p-4 hover:border-gray-400 "
		>
			<div className="font-medium">{document.title}</div>

			<div className="mt-1 text-sm text-gray-400">
				<p className="flex items-center text-sm text-gray-400">
					<span className="flex items-center gap-1">
						<img
							className="h-[1.05rem] object-contain"
							src={getDocumentLogo(
								document.provider,
								document.mimeType,
							)}
							alt=""
						/>
						<span className="ml-0.5">
							{formatMimeType(document.mimeType)}
						</span>
					</span>
					<span className="mx-1.5">—</span>
					<span>
						{new Date(
							document.modifiedAt as string | number,
						).toLocaleDateString("en-US", {
							month: "short",
							day: "numeric",
							year: "numeric",
						})}
					</span>
				</p>
			</div>
		</a>
	);
};
