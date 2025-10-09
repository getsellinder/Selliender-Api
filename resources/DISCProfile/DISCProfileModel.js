import mongoose from "mongoose";

const DISCScoresSchema = new mongoose.Schema({
    D: { type: Number, min: 0, max: 100 },
    I: { type: Number, min: 0, max: 100 },
    S: { type: Number, min: 0, max: 100 },
    C: { type: Number, min: 0, max: 100 }
}, { _id: false });

const TalkingPointSchema = new mongoose.Schema({
    topic: String,
    why: String,
    priority: Number
}, { _id: false });

const OpeningScriptSchema = new mongoose.Schema({
    linkedin_dm: [String],
    email: [{
        subject: String,
        body: String
    }],
    phone: String,
    whatsapp: String
}, { _id: false });

const ObjectionHandlingSchema = new mongoose.Schema({
    objection: String,
    response: String,
    category: String
}, { _id: false });

const FollowUpActionSchema = new mongoose.Schema({
    day: Number,
    action: String,
    channel: String,
    note: String
}, { _id: false });

const ConfidenceBreakdownSchema = new mongoose.Schema({
    completeness: Number,
    sampleQuality: Number,
    recency: Number,
    agreement: Number,
    signalStrength: Number
}, { _id: false });

const ConfidenceSchema = new mongoose.Schema({
    score: { type: Number, min: 0, max: 100 },
    breakdown: ConfidenceBreakdownSchema,
    warnings: [String]
}, { _id: false });

const DISCProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        linkedinContentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "LinkedinContent"
        },
        linkedinPostId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "LinkedinPost"
        },
        productDescription: {
            type: String,
            required: true
        },
        executive: String,
        personality: {
            disc: DISCScoresSchema,
            bullets: [String],
            primaryType: String,
            secondaryType: String
        },
        talkingPoints: [TalkingPointSchema],
        openingScripts: OpeningScriptSchema,
        objectionHandling: [ObjectionHandlingSchema],
        personalizationCues: [String],
        nextActions: {
            plan: [FollowUpActionSchema],
            cadence: String
        },
        confidence: ConfidenceSchema,
        dataSources: [String],
        analysisMetadata: {
            profileFieldsUsed: Number,
            postsAnalyzed: Number,
            avgPostEngagement: String,
            dominantTopics: [String],
            writingTone: String
        }
    },
    { timestamps: true }
);

const DISCProfile = mongoose.model("DISCProfile", DISCProfileSchema);

export default DISCProfile;
