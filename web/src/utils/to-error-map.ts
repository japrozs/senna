export const toErrorMap = (
	errors: { field: string; message: string }[],
): Record<string, string> => {
	const errorMap: Record<string, string> = {};

	errors.forEach(({ field, message }) => {
		errorMap[field] = message;
	});

	return errorMap;
};
