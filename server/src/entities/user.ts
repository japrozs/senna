import { Field, ObjectType } from "type-graphql";
import {
	Column,
	CreateDateColumn,
	BaseEntity,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
	OneToMany,
} from "typeorm";
import { Document } from "./document";
import { OAuthAccount } from "./oauth-account";

@ObjectType()
@Entity()
export class User extends BaseEntity {
	@Field()
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Field()
	@Column()
	name: string;

	@Field()
	@Column({ unique: true })
	email: string;

	@Column()
	password!: string;

	@Field(() => [Document])
	@OneToMany(() => Document, (document) => document.user)
	documents: Document[];

	@OneToMany(() => OAuthAccount, (account) => account.user)
	oauthAccounts: OAuthAccount[];

	@Field(() => String)
	@CreateDateColumn()
	createdAt: Date;

	@Field(() => String)
	@UpdateDateColumn()
	updatedAt: Date;
}
