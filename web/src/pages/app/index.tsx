import { DocumentCard } from "@/components/custom/document-card";
import { SettingsModal } from "@/components/ui/settings-modal";
import { SearchDocumentsDocument } from "@/generated/graphql";
import { useIsAuth } from "@/utils/use-is-auth";
import { useQuery } from "@apollo/client/react";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";

interface AppIndexProps {}

const AppIndex: React.FC<AppIndexProps> = ({}) => {
	const { data: meData } = useIsAuth();

	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(-1);

	const searchInputRef = useRef<HTMLInputElement>(null);
	const settingsRef = useRef<HTMLDivElement>(null);
	const resultsRef = useRef<HTMLDivElement>(null);

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

	/*
	 * Reset selected result whenever the search changes.
	 */
	useEffect(() => {
		setSelectedIndex(-1);
	}, [debouncedSearch]);

	/*
	 * Keyboard navigation.
	 */
	const handleSearchKeyDown = (
		event: React.KeyboardEvent<HTMLInputElement>,
	) => {
		if (documents.length === 0) {
			return;
		}

		if (event.key === "ArrowDown") {
			event.preventDefault();

			setSelectedIndex((current) => {
				if (current >= documents.length - 1) {
					return 0;
				}

				return current + 1;
			});
		}

		if (event.key === "ArrowUp") {
			event.preventDefault();

			setSelectedIndex((current) => {
				if (current <= 0) {
					return documents.length - 1;
				}

				return current - 1;
			});
		}

		if (event.key === "Enter" && selectedIndex >= 0) {
			event.preventDefault();

			const selectedDocument = documents[selectedIndex];

			if (selectedDocument?.url) {
				window.open(
					selectedDocument.url,
					"_blank",
					"noopener,noreferrer",
				);
			}
		}
	};

	const handleSearchFocus = () => {
		searchInputRef.current?.select();
	};

	/*
	 * Reset selected result when clicking outside
	 * the search bar and document results.
	 */
	useEffect(() => {
		const handleClickOutsideSearch = (event: MouseEvent) => {
			const target = event.target as Node;

			const clickedSearchBar = searchInputRef.current?.contains(target);

			const clickedDocumentCard = resultsRef.current?.contains(target);

			if (!clickedSearchBar && !clickedDocumentCard) {
				setSelectedIndex(-1);
			}
		};

		document.addEventListener("mousedown", handleClickOutsideSearch);

		return () => {
			document.removeEventListener("mousedown", handleClickOutsideSearch);
		};
	}, []);

	/*
	 * Close settings when clicking outside.
	 */
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				settingsRef.current &&
				!settingsRef.current.contains(event.target as Node)
			) {
				setSettingsOpen(false);
			}
		};

		if (settingsOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [settingsOpen]);

	return (
		<div className="min-h-screen px-3 py-2">
			<Head>
				<title>senna</title>
			</Head>

			{/* Header */}
			<div className="relative z-50 flex w-full items-center justify-between">
				<div />

				<div className="absolute left-1/2 mx-auto w-full max-w-3xl -translate-x-1/2">
					<a
						href="/app"
						className="menlo text-gray-400 hover:text-primary-color"
					>
						$$$$$ [senna] $$$$$
					</a>
				</div>

				{/* Settings */}
				<div ref={settingsRef} className="relative z-[100] ml-auto">
					<button
						type="button"
						onClick={() => setSettingsOpen((open) => !open)}
						className={`cursor-pointer text-[0.95rem] ${
							settingsOpen
								? "text-primary-color underline"
								: "text-gray-500"
						} hover:text-primary-color hover:underline`}
					>
						Settings
					</button>

					{settingsOpen && (
						<SettingsModal
							name={meData?.me?.name ?? ""}
							email={meData?.me?.email ?? ""}
						/>
					)}
				</div>
			</div>

			{/* Search / Results */}
			<div className="mx-auto w-full max-w-3xl">
				<div className="sticky top-3 z-10 mt-3.5 bg-white">
					<FiSearch
						className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
						size={17}
					/>

					<input
						ref={searchInputRef}
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						onFocus={handleSearchFocus}
						onKeyDown={handleSearchKeyDown}
						placeholder="Search your files..."
						autoFocus
						className="w-full border border-gray-300 bg-transparent px-10 py-1.5 text-[0.95rem] outline-none"
					/>

					{search && (
						<button
							type="button"
							onClick={() => setSearch("")}
							className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 transition-colors hover:text-primary-color"
							aria-label="Clear search"
						>
							<FiX size={17} />
						</button>
					)}
				</div>

				{loading && (
					<p className="mt-4 text-base text-gray-400">Searching...</p>
				)}

				{error && (
					<p className="mt-4 text-sm text-red-500">{error.message}</p>
				)}

				{!loading && !error && debouncedSearch.trim() !== "" && (
					<div ref={resultsRef} className="mt-6">
						{documents.length === 0 ? (
							<p className="mt-[-2] text-base text-gray-400">
								No results found.
							</p>
						) : (
							<div className="space-y-2">
								{documents.map((document, index) => (
									<DocumentCard
										key={document.id}
										document={document}
										selected={selectedIndex === index}
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
