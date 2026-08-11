import React, { useState } from "react";
import { BiExit } from "react-icons/bi";
import { FaDropbox, FaPlus } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FiPlus } from "react-icons/fi";
import { IoLogoGithub, IoPersonOutline } from "react-icons/io5";
import { MdOutlineAlternateEmail } from "react-icons/md";
import { PiPersonSimpleCircleBold } from "react-icons/pi";
import { SiNotion } from "react-icons/si";

interface SettingsModalProps {
	name: string;
	email: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
	name,
	email,
}) => {
	const [integrations, setIntegrations] = useState({
		github: false,
		google: false,
		dropbox: false,
		notion: false,
	});

	const toggleIntegration = (integration: keyof typeof integrations) => {
		setIntegrations((prev) => ({
			...prev,
			[integration]: !prev[integration],
		}));
	};

	return (
		<div className="absolute right-0 top-7 z-50 w-64 border border-gray-300 bg-white">
			<div className="border-gray-200 px-3 py-1.5">
				<div className="text-[0.9rem] text-gray-600">
					<p className="text-gray-900">{name}</p>
					<p className="mt-0.5 text-[0.8rem] text-gray-400 menlo">
						{email}
					</p>
				</div>
			</div>

			{/* Integrations */}
			<div className="border-t border-gray-200 px-3 pt-1.5 pb-1">
				<p className="flex flex-row text-[0.95rem] text-gray-900">
					{/* <FiPlus className="mt-[0.045rem] mr-1.5 text-[1.1rem] text-gray-400" />{" "} */}
					Integrations
				</p>
			</div>

			<div className="border-t border-dashed border-gray-200 py-0.5">
				{/* GitHub */}
				<div className="flex items-center justify-between px-3 py-1.5">
					<span className="flex flex-row text-[0.9rem] text-gray-600">
						<IoLogoGithub className="mt-[0.045rem] mr-1.5 text-[1.1rem] text-primary-color" />{" "}
						GitHub
					</span>

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
					<span className="flex flex-row text-[0.9rem] text-gray-600">
						<FcGoogle className="mt-[0.045rem] mr-1.5 text-[1.1rem] text-gray-400" />{" "}
						Google
					</span>

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
					<span className="flex flex-row text-[0.9rem] text-gray-600">
						<FaDropbox className="mt-[0.045rem] mr-1.5 text-[1.1rem] text-blue-500" />{" "}
						Dropbox
					</span>

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

				{/* Notion */}
				<div className="flex items-center justify-between px-3 py-1.5 pb-1.5">
					<span className="flex flex-row text-[0.9rem] text-gray-600">
						<SiNotion className="mt-[0.045rem] mr-1.5 text-[1.1rem] text-primary-color" />{" "}
						Notion
					</span>

					<button
						type="button"
						onClick={() => toggleIntegration("notion")}
						className={`relative h-5 w-9 cursor-pointer rounded-full transition-colors ${
							integrations.notion
								? "bg-emerald-500"
								: "bg-gray-300"
						}`}
					>
						<span
							className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
								integrations.notion
									? "translate-x-0"
									: "-translate-x-4"
							}`}
						/>
					</button>
				</div>
			</div>

			<div className="group flex items-center justify-between border-t border-gray-200 px-3 py-1.5 hover:cursor-pointer">
				<span className="flex flex-row items-center text-[0.9rem] text-gray-600 group-hover:text-primary-color group-hover:underline">
					View source
				</span>
			</div>
			<div className="group flex items-center justify-between border-t border-gray-200 px-3 py-1.5 hover:cursor-pointer">
				<span className="flex flex-row items-center text-[0.9rem] text-gray-600 group-hover:text-primary-color group-hover:underline">
					Suggest features
				</span>
			</div>

			{/* Sign out */}
			<div className="group flex items-center justify-between border-t border-gray-200 px-3 py-1.5 hover:cursor-pointer">
				<span className="flex flex-row items-center text-[0.9rem] text-red-600 group-hover:underline">
					Sign out
				</span>
			</div>
		</div>
	);
};
