export default function Home() {
	return (
		<div className="px-3 py-2 w-full max-w-6xl mx-auto">
			<div className="flex flex-row items-center mb-2">
				<p className="menlo text-gray-400">$$$$$ [senna] $$$$$</p>
				<a
					className="ml-auto pt-1 cursor-pointer text-[0.95rem] text-gray-500 hover:text-primary-color hover:underline"
					href="/login"
				>
					Sign in
				</a>
			</div>
			<img src="ss.png" className="border border-gray-300 box-shadow" />
		</div>
	);
}
