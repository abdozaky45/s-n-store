import { model, Schema } from "mongoose";
import ISocialReview from "./ISocialReviewModel";
import { ImageSchema, RefType } from "../../Utils/Schemas";
import SchemaTypesReference from "../../Utils/Schemas/SchemaTypesReference";

const SocialReviewSchema = new Schema<ISocialReview>({
    image: ImageSchema,
    createdBy: RefType(SchemaTypesReference.User, true),
}, { id: false }
);
const SocialReviewModel = model(SchemaTypesReference.SocialReview, SocialReviewSchema);
export default SocialReviewModel;