import React, { useEffect, useState } from "react";
import { SearchDocumentsDocument } from "@/generated/graphql";
import { useQuery } from "@apollo/client/react";
import { DocumentCard } from "@/components/custom/document-card";

interface AppIndexProps {}

const AppIndex: React.FC<AppIndexProps> = ({}) => {
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");

	useEffect(() => {
		const timeout = setTimeout(() => {
			setDebouncedSearch(search);
		}, 300);

		return () => clearTimeout(timeout);
	}, [search]);

	const { data, loading, error } = useQuery(SearchDocumentsDocument, {
		variables: {
			query: debouncedSearch,
		},
		skip: debouncedSearch.trim() === "",
	});

	const documents = data?.search ?? [];

	return (
		<div className="min-h-screen px-3 py-2">
			<div className="relative flex w-full items-center justify-between">
				<div></div>
				<a
					href="/app"
					className="w-full max-w-3xl mx-auto absolute left-1/2 -translate-x-1/2 menlo text-gray-400 hover:text-primary-color"
				>
					$$$$$ [senna] $$$$$
				</a>

				<p>hi ther</p>
			</div>

			<div className="mx-auto w-full max-w-3xl">
				<input
					type="text"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search your files..."
					autoFocus
					className="mt-3.5 w-full border border-gray-300 bg-transparent px-4 pt-2 py-1.5 text-[0.95rem] outline-none focus:border-primary-color"
				/>

				{loading && (
					<p className="mt-4 text-base text-gray-400">Searching...</p>
				)}

				{error && (
					<p className="mt-4 text-sm text-red-500">{error.message}</p>
				)}

				{!loading && !error && debouncedSearch.trim() !== "" && (
					<div className="mt-6">
						{documents.length === 0 ? (
							<p className="mt-[-2] text-base text-gray-400">
								No results found.
							</p>
						) : (
							<div className="space-y-2">
								{documents.map((document) => (
									<DocumentCard
										key={document.id}
										document={document}
									/>
								))}
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default AppIndex;
