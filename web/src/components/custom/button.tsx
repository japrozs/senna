import React, { LegacyRef } from "react";
import { IconType } from "react-icons/lib";
import { SpinnerWrapper } from "./spinner-wrapper";

type ButtonProps = {
	label: string;
	className?: string;
	colored?: boolean;
	color?: string;
	disabled?: boolean;
	loading?: boolean;
	iconAnimate?: boolean;
	iconRight?: boolean;
	iconMargin?: number;
	icon?: IconType;
	buttonRef?: LegacyRef<HTMLButtonElement> | undefined;
} & React.DetailedHTMLProps<
	React.ButtonHTMLAttributes<HTMLButtonElement>,
	HTMLButtonElement
>;

export const Button: React.FC<ButtonProps> = ({
	label,
	colored,
	color,
	disabled,
	icon: Icon,
	iconAnimate,
	loading = false,
	iconRight,
	className,
	iconMargin,
	buttonRef,
	...props
}) => {
	return (
		<button
			disabled={loading}
			ref={buttonRef}
			className={`${
				(loading || disabled) && "cursor-not-allowed"
			} flex items-center justify-center group button-component ${
				colored
					? `${color ? color : "bg-gray-900 hover:bg-primary-color border-none text-white"}`
					: "bg-white border-gray-300 hover:bg-gray-50"
			} focus:ring-none ${
				disabled && "opacity-40 disabled"
			} focus:ring-none transition-all text-sm py-2 w-full border  ${className}`}
			{...props}
		>
			{loading ? (
				<>
					<SpinnerWrapper
						tiny
						className="w-5 h-5 text-gray-50 fill-primary-color"
					/>
				</>
			) : (
				<>
					{!iconRight && (
						<>
							{Icon && (
								<Icon
									className={`transition-all ${
										label.length != 0 &&
										`${
											iconAnimate
												? `mr-${
														iconMargin
															? iconMargin
															: "1"
													} group-hover:ml-${
														iconMargin
															? iconMargin
															: "2"
													}`
												: `mr-${
														iconMargin
															? iconMargin
															: "1"
													}`
										}`
									} text-lg`}
								/>
							)}
						</>
					)}
					{label}{" "}
					{iconRight && (
						<>
							{Icon && (
								<Icon
									className={`transition-all ${
										label.length != 0 &&
										`${
											iconAnimate
												? `ml-${
														iconMargin
															? iconMargin
															: "1"
													} group-hover:ml-${
														iconMargin
															? iconMargin
															: "2"
													}`
												: `ml-${
														iconMargin
															? iconMargin
															: "1"
													}`
										}`
									} text-lg`}
								/>
							)}
						</>
					)}
				</>
			)}
		</button>
	);
};
