export default function Home() {
	return (
		<div className="px-3 py-2">
			<p className="menlo text-gray-400">$$$$$ [senna] $$$$$</p>
			<a
				className="blue menlo underline hover:decoration-dotted"
				href="/login"
			>
				login
			</a>
			<br />
			<a
				className="blue menlo underline hover:decoration-dotted"
				href="/signup"
			>
				signup
			</a>
		</div>
	);
}
