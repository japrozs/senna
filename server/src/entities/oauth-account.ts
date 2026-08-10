import { Field, ObjectType } from "type-graphql";
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";
import { User } from "./user";

@ObjectType()
@Entity()
export class OAuthAccount extends BaseEntity {
	@Field()
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column()
	userId: string;

	@ManyToOne(() => User, (user) => user.oauthAccounts, {
		onDelete: "CASCADE",
	})
	user: User;

	@Field()
	@Column()
	provider: string;

	@Column({ type: "varchar", nullable: true })
	providerAccountId: string | null;

	@Column("text")
	accessToken: string;

	@Column("text", { nullable: true })
	refreshToken: string | null;

	@Column({ type: "bigint", nullable: true })
	expiresAt: number | null;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
