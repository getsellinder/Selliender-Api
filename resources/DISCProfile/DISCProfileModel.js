import mongoose from "mongoose";

const DISCScoresSchema = new mongoose.Schema({
    dominance: { type: Number, min: 0, max: 100 },
    influence: { type: Number, min: 0, max: 100 },
    steadiness: { type: Number, min: 0, max: 100 },
    conscientiousness: { type: Number, min: 0, max: 100 }
}, { _id: false });

const TalkingPointSchema = new mongoose.Schema({
    topic: String,
    why: String,
    whatToSay: String,
    evidence: String,
    priority: Number
}, { _id: false });

const OpeningScriptSchema = new mongoose.Schema({
    linkedin_dm: [String],
    email: [{
        subject: String,
        body: String
    }],
    phone: [String],
    whatsapp: [String]
}, { _id: false });

const ObjectionHandlingSchema = new mongoose.Schema({
    objection: String,
    recommendedResponse: String,
    followUpTone: String,
    rationale: String,
    response: String,
    category: String
}, { _id: false });

const FollowUpActionSchema = new mongoose.Schema({
    day: Number,
    action: String,
    channel: String,
    copy: String,
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
    explanation: String,
    warnings: [String]
}, { _id: false });


const DISCTypeSchema = new mongoose.Schema({
    type: String,
    name: String,
    abbreviation: String,
    percentage: Number,
    description: String
}, { _id: false });

const DISCBreakdownSchema = new mongoose.Schema({
    abbreviation: String,
    name: String,
    percentage: Number
}, { _id: false });

const StartingSectionSchema = new mongoose.Schema({
    aboutProduct: String,
    productCost: String,
    profileSummary: String
}, { _id: false });

const CompanyOverviewSchema = new mongoose.Schema({
    companyName: String,
    specializations: [String],
    keyFeatures: [String],
    pricingModel: String
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
        productPrice: {
            type: Number,
            default: null
        },
        executive: String,
        starting: StartingSectionSchema,
        personality: {
            disc: DISCScoresSchema,
            discBreakdown: [DISCBreakdownSchema],
            discDefinitions: {
                dominance: String,
                influence: String,
                steadiness: String,
                conscientiousness: String
            },
            primaryStyle: String,
            secondaryStyle: String,
            approachGuidance: String,
            bullets: [String],
            keyTraits: [String],
            primaryType: String,
            secondaryType: String,
            primary: DISCTypeSchema,
            secondary: DISCTypeSchema
        },
        talkingPoints: [TalkingPointSchema],
        openingScripts: OpeningScriptSchema,
        objectionHandling: [ObjectionHandlingSchema],
        personalizationCues: [String],
        nextActions: [FollowUpActionSchema],
    nextSteps: [String],
        confidence: ConfidenceSchema,
        quickSummary: {
            who: String,
            primaryDISC: String,
            topTalkingPoints: [String],
            bestOutreachChannel: String,
            preferredTone: String
        },
        actionableMetrics: {
            responseRateTarget: String,
            followUpCadence: [String],
            engagementMilestones: [String]
        },
        dataSources: [String],
        analysisMetadata: {
            profileFieldsUsed: Number,
            postsAnalyzed: Number,
            avgPostEngagement: Number,
            dominantTopics: [String],
            writingTone: String,
            rawRationale: String
        },
        quickSummary: {
            who: String,
            primaryDISC: String,
            topTalkingPoints: [String],
            bestOutreachChannel: String,
            preferredTone: String
        },
        actionableMetrics: {
            responseRateTarget: String,
            followUpCadence: [String],
            engagementMilestones: [String]
        },
        preferenceSnapshot: {
            likes: [String],
            dislikes: [String],
            salesInsight: String
        },
        probabilityToPurchase: {
            factors: [{
                factor: String,
                influence: String,
                impact: String
            }],
            predictedOutcome: {
                percentage: Number,
                category: String,
                description: String
            },
            reasoning: String
        },
        commonGroundAndSharedVision: {
            areas: [{
                area: String,
                commonality: String
            }],
            salesInsight: String
        },
        confidenceExplanation: {
            parameters: [{
                parameter: String,
                score: String,
                reasoning: String
            }],
            overallConfidence: {
                score: Number,
                category: String,
                reasoning: String
            },
            interpretation: String
        },
        executiveSummary: {
            profileName: String,
            title: String,
            companyType: String,
            primaryDISCType: String,
            secondaryDISCType: String,
            confidenceScore: String,
            purchaseProbability: String,
            communicationTone: String,
            bestOutreachChannels: String,
            nextStep: String
        },
        companyOverview: CompanyOverviewSchema,
        communicationStrategy: {
            recommendedSequence: [{
                day: Number,
                channel: String,
                objective: String
            }],
            toneGuidance: String
        }
    },
    { timestamps: true }
);

const DISCProfile = mongoose.model("DISCProfile", DISCProfileSchema);

export default DISCProfile;
