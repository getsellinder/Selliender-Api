import mongoose from "mongoose";
const ExperienceSchema = new mongoose.Schema({
    title: { type: String, },
    company: { type: String, },
    duration: { type: String }
}, { _id: false });

const EducationSchema = new mongoose.Schema({
    school: { type: String },
    degree: { type: String },
    year: { type: Number },
}, { _id: false });

const CertificationSchema = new mongoose.Schema({
    name: String,
    issuer: String,
    issueDate: String,
    credentialId: String,
    url: String
}, { _id: false });

const VolunteeringSchema = new mongoose.Schema({
    role: String,
    organization: String,
    duration: String,
    cause: String
}, { _id: false });

const PostSchema = new mongoose.Schema({
    content: String,
    date: String,
    engagement: String,
    type: String,
    text: String,
    timeAgo: String,
    likes: String
}, { _id: false });
const LinkedinContentSchema = new mongoose.Schema(
    {
        LinkedinURL: String,
        LinkedinDec: String,
        name: String,

        title: String,
        company: String,
        location: String,
        about: String,
        profilePicture: String,

        experience: {
            type: [ExperienceSchema],
            // required: [true, 'Experience is required'],
            // validate: v => v.length > 0 // ensures at least one entry
        },
        education: {
            type: [EducationSchema],
            // required: [true, 'Education is required'],
            // validate: v => v.length > 0
        },
        skills: {
            type: [String],
            // required: [true, 'Skills are required'],
            // validate: v => v.length > 0
        },
        followerCount: Number,
        connectionCount: Number,
        connections: String,

        certifications: [CertificationSchema],
        languages: [String],
        recommendations: [String],
        volunteering: [VolunteeringSchema],
        accomplishments: [String],
        courses: [String],
        projects: [String],
        awards: [String],
        publications: [String],
        patents: [String],

        posts: [PostSchema],

        activityLevel: String,
        contactInfo: mongoose.Schema.Types.Mixed,
        extractedAt: Date,
        profileUrl: String,
        extractionMethod: String,
        dataSource: String
    },
    { timestamps: true }
);

const LinkedinContent = mongoose.model("LinkedinContent", LinkedinContentSchema);

export default LinkedinContent;
