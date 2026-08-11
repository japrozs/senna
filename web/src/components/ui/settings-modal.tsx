import React, { useState } from "react";
import { BiExit } from "react-icons/bi";
import { IoExitOutline } from "react-icons/io5";
import { MdOutlineAlternateEmail, MdOutlineMailOutline } from "react-icons/md";

interface SettingsModalProps {}

export const SettingsModal: React.FC<SettingsModalProps> = ({}) => {
	const [integrations, setIntegrations] = useState({
		github: false,
		google: false,
		dropbox: false,
	});

	const toggleIntegration = (integration: keyof typeof integrations) => {
		setIntegrations((prev) => ({
			...prev,
			[integration]: !prev[integration],
		}));
	};

	return (
		<div className="absolute right-0 top-7 z-50 w-64 border border-gray-300 bg-white">
			<div className="px-3 pt-1.5 pb-1">
				<p className="text-[0.95rem] text-gray-900">Integrations</p>
			</div>

			<div className="border-t border-dashed border-gray-200 py-0.5">
				{/* GitHub */}
				<div className="flex items-center justify-between px-3 py-1.5">
					<span className="text-[0.9rem] text-gray-600">GitHub</span>

					<button
						type="button"
						onClick={() => toggleIntegration("github")}
						className={`relative h-5 w-9 cursor-pointer rounded-full transition-colors ${
							integrations.github
								? "bg-emerald-500"
								: "bg-gray-300"
						}`}
					>
						<span
							className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
								integrations.github
									? "translate-x-0"
									: "-translate-x-4"
							}`}
						/>
					</button>
				</div>

				{/* Google */}
				<div className="flex items-center justify-between px-3 py-1.5">
					<span className="text-[0.9rem] text-gray-600">Google</span>

					<button
						type="button"
						onClick={() => toggleIntegration("google")}
						className={`relative h-5 w-9 cursor-pointer rounded-full transition-colors ${
							integrations.google
								? "bg-emerald-500"
								: "bg-gray-300"
						}`}
					>
						<span
							className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
								integrations.google
									? "translate-x-0"
									: "-translate-x-4"
							}`}
						/>
					</button>
				</div>

				{/* Dropbox */}
				<div className="flex items-center justify-between px-3 py-1.5 pb-1.5">
					<span className="text-[0.9rem] text-gray-600">Dropbox</span>

					<button
						type="button"
						onClick={() => toggleIntegration("dropbox")}
						className={`relative h-5 w-9 cursor-pointer rounded-full transition-colors ${
							integrations.dropbox
								? "bg-emerald-500"
								: "bg-gray-300"
						}`}
					>
						<span
							className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
								integrations.dropbox
									? "translate-x-0"
									: "-translate-x-4"
							}`}
						/>
					</button>
				</div>
			</div>
			<div className="group flex border-t border-gray-200 items-center justify-between px-3 py-1.5 hover:cursor-pointer">
				<span className="flex flex-row items-center text-[0.9rem] text-gray-600 group-hover:text-primary-color group-hover:underline">
					<MdOutlineAlternateEmail className="text-[1.1rem] mb-0.5 mr-1.5" />
					Contact developer
				</span>
			</div>
			<div className="group flex border-t border-gray-200 items-center justify-between px-3 py-1.5 hover:cursor-pointer">
				<span className="flex flex-row items-center text-[0.9rem] text-red-600 group-hover:underline">
					<BiExit className="text-[1.1rem] mb-0.5 mr-1.5" />
					Sign out
				</span>
			</div>
		</div>
	);
};
