import { ObjectType, Field } from "type-graphql";
import {
	Entity,
	BaseEntity,
	PrimaryGeneratedColumn,
	Column,
	Index,
	ManyToOne,
	CreateDateColumn,
	UpdateDateColumn,
} from "typeorm";
import { User } from "./user";

export enum Provider {
	GOOGLE = "google",
	GITHUB = "github",
	DROPBOX = "dropbox",
}

@ObjectType()
@Entity()
@Index(["userId", "provider", "externalId"], { unique: true })
export class Document extends BaseEntity {
	@Field()
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Field(() => String)
	@Column({
		type: "enum",
		enum: Provider,
	})
	provider: Provider;

	@Column()
	externalId: string;

	@Field()
	@Column()
	title: string;

	@Column("text")
	content: string;

	@Field()
	@Column()
	url: string;

	@Column()
	mimeType: string;

	@ManyToOne(() => User, (user) => user.documents, {
		onDelete: "CASCADE",
	})
	user: User;

	@Column()
	userId: string;

	// for future use
	@Column({
		nullable: true,
	})
	parentExternalId?: string;

	@Field(() => String)
	@Column()
	modifiedAt: Date;

	@Field(() => String)
	@CreateDateColumn()
	createdAt: Date;

	@Field(() => String)
	@UpdateDateColumn()
	updatedAt: Date;
}
