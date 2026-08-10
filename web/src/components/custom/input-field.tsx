import { useField } from "formik";
import React, { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> &
	TextareaHTMLAttributes<HTMLTextAreaElement> & {
		name: string;
		label: string;
		fullWidth?: boolean;
		shadow?: boolean;
		textarea?: boolean;
		rows?: number;
		notResizable?: boolean;
	};

export const InputField: React.FC<InputFieldProps> = ({
	label,
	fullWidth,
	shadow,
	textarea,
	rows,
	notResizable,
	...props
}) => {
	const [field, { error }] = useField(props as any);
	return (
		<div className={"mt-3 flex flex-col"}>
			<label
				className={
					"text-[0.8rem] text-slate-600 font-medium text-opacity-70"
				}
				htmlFor={field.name}
			>
				{label}
			</label>

			{textarea ? (
				<textarea
					rows={rows || 3}
					className={`${
						fullWidth ? "w-full" : "w-80"
					} text-gray-700 transition-all border ${
						shadow && "shadow-sm"
					} placeholder-gray-300 text-smol py-1.5 px-3 mt-1.5 mb-1.5 bg-white rounded-md outline-none focus:ring-2 focus:ring-border-blue-100 ${
						!!error ? "border-red-500" : "border-gray-300"
					} ${notResizable && "resize-none"}`}
					{...field}
					{...props}
					id={field.name}
					placeholder={props.placeholder}
				/>
			) : (
				<input
					className={`${
						fullWidth ? "w-full" : "w-80"
					} text-gray-700 transition-all border ${
						shadow && "shadow-sm"
					} placeholder-gray-300 text-[0.95rem] menlo py-1.5 px-3 mt-1.5 mb-1.5 bg-white rounded-none outline-none focus:ring-1 focus:ring-border-blue-100 ${
						!!error ? "border-red-500" : "border-gray-300"
					}`}
					{...field}
					{...props}
					id={field.name}
					placeholder={props.placeholder}
				/>
			)}
			{error && (
				<span className={"mt-1 font-medium text-sm text-red-500"}>
					{error}
				</span>
			)}
		</div>
	);
};
