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
@Index(["userId", "provider", "externalId"], { unique: true })
@Index(["userId"])
@Index(["userId", "modifiedAt"])
export class Document extends BaseEntity {
	@Field()
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column("uuid")
	userId: string;

	@ManyToOne(() => User, (user) => user.documents, {
		onDelete: "CASCADE",
	})
	@JoinColumn({ name: "userId" })
	user: User;

	/*
	 * ID of the file/document at the external provider.
	 *
	 * Example:
	 * Google Drive → Google file ID
	 * GitHub → repository/blob identifier
	 */
	@Field()
	@Column()
	externalId: string;

	@Field()
	@Column({
		type: "enum",
		enum: Provider,
	})
	provider: Provider;

	@Field()
	@Column()
	title: string;

	/*
	 * Actual extracted text from the document.
	 *
	 * This will become extremely important later for:
	 * - PostgreSQL full-text search
	 * - embeddings
	 * - pgvector
	 */
	@Field()
	@Column("text", {
		default: "",
	})
	content: string;

	@Field()
	@Column("text")
	url: string;

	@Field()
	@Column()
	mimeType: string;

	@Field()
	@Column({
		type: "timestamp",
	})
	modifiedAt: Date;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
