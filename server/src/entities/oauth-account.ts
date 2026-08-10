import { Field, ObjectType } from "type-graphql";
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";
import { User } from "./user";
import { Provider } from "../types";

@ObjectType()
@Entity()
@Index(["userId", "provider"], { unique: true })
export class OAuthAccount extends BaseEntity {
	@Field()
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column("uuid")
	userId: string;

	@ManyToOne(() => User, (user) => user.oauthAccounts, {
		onDelete: "CASCADE",
	})
	@JoinColumn({ name: "userId" })
	user: User;

	@Field()
	@Column({
		type: "enum",
		enum: Provider,
	})
	provider: Provider;

	/*
	 * The ID of the account at the provider.
	 *
	 * Nullable because Senna doesn't actually need
	 * it yet for the MVP.
	 */
	@Column({
		type: "varchar",
		nullable: true,
	})
	providerAccountId: string | null;

	@Column("text")
	accessToken: string;

	@Column("text", {
		nullable: true,
	})
	refreshToken: string | null;

	@Column({
		type: "timestamp",
		nullable: true,
	})
	expiresAt: Date | null;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
