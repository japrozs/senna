import { SearchDocumentsQuery } from "@/generated/graphql";
import { formatMimeType } from "@/utils/format-mime-types";
import { getDocumentLogo } from "@/utils/get-document-logo";
import React, { useEffect, useRef, useState } from "react";
import { IoCode } from "react-icons/io5";

interface DocumentCardProps {
	document: SearchDocumentsQuery["search"][number];
	selected: boolean;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
	document: doc,
	selected = false,
}) => {
	const [metadataOpen, setMetadataOpen] = useState(false);
	const metadataRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				metadataRef.current &&
				!metadataRef.current.contains(event.target as Node)
			) {
				setMetadataOpen(false);
			}
		};

		if (metadataOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [metadataOpen]);

	return (
		<div
			className={`relative overflow-visible border ${
				selected
					? "border-gray-300 box-shadow"
					: "border-gray-200 hover:border-gray-300"
			} ${metadataOpen ? "z-50" : "z-0"}`}
		>
			{/* Document */}
			<a
				href={doc.url}
				target="_blank"
				rel="noopener noreferrer"
				className="block p-4 pr-12"
			>
				<div className="font-medium inter text-[0.93rem]">
					{doc.title}
				</div>

				<div className="mt-1 text-sm text-gray-400">
					<p className="flex items-center text-sm text-gray-400">
						<span className="flex items-center gap-1">
							<img
								className="h-[1.05rem] object-contain"
								src={getDocumentLogo(
									doc.provider,
									doc.mimeType,
								)}
								alt=""
							/>

							<span className="ml-0.5 pt-0.5">
								{formatMimeType(doc.mimeType)}
							</span>
						</span>

						<span className="mx-1.5">—</span>

						<span className="pt-0.5">
							{new Date(
								doc.modifiedAt as string | number,
							).toLocaleDateString("en-US", {
								month: "short",
								day: "numeric",
								year: "numeric",
							})}
						</span>
					</p>
				</div>
			</a>

			{/* Metadata */}
			<div
				ref={metadataRef}
				className="absolute bottom-3 right-3 z-[100]"
			>
				<button
					type="button"
					onClick={() => setMetadataOpen((open) => !open)}
					className={`cursor-pointer text-gray-400 transition-colors hover:text-primary-color ${
						metadataOpen ? "text-primary-color" : ""
					}`}
					aria-label="Show document metadata"
					aria-expanded={metadataOpen}
				>
					<IoCode size={16} />
				</button>

				{metadataOpen && (
					<div className="absolute right-0 top-6 z-[100] w-64 border border-gray-300 bg-white p-3 box-shadow">
						<p className="mb-2 text-[0.9rem] text-gray-900">
							Metadata
						</p>

						<div className="space-y-1.5 text-[0.82rem]">
							<div className="flex justify-between gap-4">
								<span className="text-gray-400">Provider</span>

								<span className="text-right text-gray-700 mono">
									{doc.provider}
								</span>
							</div>

							<div className="flex justify-between gap-4">
								<span className="text-gray-400">Type</span>

								<span className="max-w-[150px] truncate text-right text-gray-700 mono">
									{doc.mimeType}
								</span>
							</div>

							<div className="flex justify-between gap-4">
								<span className="text-gray-400">Modified</span>

								<span className="text-right text-gray-700 mono">
									{new Date(
										doc.modifiedAt as string | number,
									).toLocaleDateString("en-US", {
										month: "short",
										day: "numeric",
										year: "numeric",
									})}
								</span>
							</div>

							<div className="flex justify-between gap-4">
								<span className="text-gray-400">ID</span>

								<span className="max-w-[150px] truncate text-right text-gray-700 mono">
									{doc.id}
								</span>
							</div>

							<div className="flex justify-between gap-4">
								<span className="text-gray-400">URL</span>

								<span className="max-w-[150px] truncate text-right text-gray-700 mono">
									{doc.url}
								</span>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
