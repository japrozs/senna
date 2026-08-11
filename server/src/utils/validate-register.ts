import { UserInput } from "../schemas/user-input";

// TODO: add more restrictions on username like can't contain @ and stuff
export const validateRegister = (options: UserInput) => {
	if (options.name.length == 0) {
		return [
			{
				field: "name",
				message: "Name cannot be empty",
			},
		];
	}
	if (!options.email.includes("@")) {
		return [
			{
				field: "email",
				message: "Invalid email",
			},
		];
	}

	if (options.password.length <= 6) {
		return [
			{
				field: "password",
				message: "Length must be greater than 6",
			},
		];
	}

	return null;
};
