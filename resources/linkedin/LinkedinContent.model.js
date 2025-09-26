import mongoose from "mongoose";




const ExperienceSchema = new mongoose.Schema({
    title: String,
    company: String,
    duration: String
}, { _id: false });

const EducationSchema = new mongoose.Schema({
    school: String,
    degree: String,
    year: String
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

        experience: [ExperienceSchema],
        education: [EducationSchema],
        skills: [String],
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
