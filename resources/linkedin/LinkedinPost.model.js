import mongoose from "mongoose";



const PostSchema = new mongoose.Schema({
    content: String,
    extractedAt: Date,
    timestamp: String
}, { _id: false });
const LinkedinPostSchema = new mongoose.Schema(
    {
        name: String,
        title: String,
        company: String,
        location: String,
        about: String,
        profilePicture: String,
        profileUrl: String,

        experience: [mongoose.Schema.Types.Mixed],   // empty in this file, keep flexible
        education: [mongoose.Schema.Types.Mixed],
        skills: [String],
        followerCount: Number,
        connectionCount: Number,
        connections: String,

        certifications: [mongoose.Schema.Types.Mixed],
        languages: [String],
        recommendations: [mongoose.Schema.Types.Mixed],
        volunteering: [mongoose.Schema.Types.Mixed],
        accomplishments: [mongoose.Schema.Types.Mixed],
        courses: [mongoose.Schema.Types.Mixed],
        projects: [mongoose.Schema.Types.Mixed],
        awards: [mongoose.Schema.Types.Mixed],
        publications: [mongoose.Schema.Types.Mixed],
        patents: [mongoose.Schema.Types.Mixed],

        posts: [PostSchema],
        postsCount: Number,

        activityLevel: String,
        contactInfo: mongoose.Schema.Types.Mixed,
        extractedAt: Date,
        mergedAt: Date,
        extractionMethod: String,
        extractionComplete: Boolean,
        dataSource: String,
        dataFolder: mongoose.Schema.Types.Mixed, // contains profileFile, postsFile, mergedFile
        isAutoScraped: Boolean,
        buyerIntelligenceReady: Boolean
    },
    { timestamps: true }
);

const LinkedinPost = mongoose.model("LinkedinPost", LinkedinPostSchema);

export default LinkedinPost;
