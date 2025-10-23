import { timeFormat } from "../../Utils/formatDateToIST .js";
import UserModel from "../user/userModel.js";
import LinkedinContent from "./LinkedinContent.model.js";
import LinkedinPost from "./LinkedinPost.model.js";
import DISCProfile from "../DISCProfile/DISCProfileModel.js";
import { analyzeLinkedInProfile } from "../DISCProfile/analysisEngineV2.js";


export const LinkedinUploadFile = async (req, res) => {
    const { id } = req.params
    const { LinkedinURL, content, posts } = req.body;

    try {
        let savePfofile = null;
        let savePosts = [];
        console.log("📥 Uploading LinkedIn data (without product description)");

        if (content) {
            savePfofile = await LinkedinContent.create({
                LinkedinURL,
                ...content
            })
            console.log("✅ Profile saved:", savePfofile._id);
        }

        if (posts) {
            if (Array.isArray(posts)) {
                savePosts = await LinkedinPost.insertMany(posts.map(p => ({
                    ...p,
                    profileId: savePfofile ? savePfofile._id : null
                })))
                console.log("✅ Posts saved:", savePosts.length);
            }
            else {
                const post = await LinkedinPost.create({
                    ...posts,
                    profileId: savePfofile ? savePfofile._id : null
                })
                savePosts.push(post);
                console.log("✅ Single post saved");
            }
        }

        if (id) {
            await UserModel.findByIdAndUpdate(id, {
                LinkedinContentId: savePfofile ? savePfofile._id : null,
                LinkedinPostId: savePosts.length > 0 ? savePosts[0]._id : null
            });
            console.log("✅ Linked to user:", id);
        }

        res.status(200).json({
            message: "LinkedIn data uploaded successfully",
            profile: savePfofile,
            posts: savePosts,
            profileId: savePfofile?._id,
            postId: savePosts.length > 0 ? savePosts[0]._id : null
        });
    } catch (error) {
        console.error("❌ Error uploading file:", error);
        res.status(500).json({ message: error.message });
    }
};

export const saveDISCRequest = async (req, res) => {
    const { userId } = req.params;
    const { LinkedinURL, productDescription, productPrice } = req.body;

    try {
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        if (!LinkedinURL || !productDescription) {
            return res.status(400).json({ message: "LinkedIn URL and product description are required" });
        }

        // optional: validate productPrice if provided (must be number or numeric string)
        let parsedPrice = null;
        if (productPrice !== undefined && productPrice !== null && productPrice !== '') {
            const maybeNumber = typeof productPrice === 'number' ? productPrice : parseFloat(String(productPrice).replace(/[^0-9.\-]/g, ''));
            if (Number.isNaN(maybeNumber)) {
                return res.status(400).json({ message: 'productPrice must be a valid number' });
            }
            parsedPrice = maybeNumber;
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const updateObj = {
            pendingLinkedInURL: LinkedinURL,
            pendingProductDescription: productDescription
        };
        if (parsedPrice !== null) updateObj.pendingProductPrice = parsedPrice;

        await UserModel.findByIdAndUpdate(userId, updateObj);

        console.log("✅ Product description saved for user:", userId);

        res.status(200).json({
            message: "Request saved successfully. Ready for analysis.",
            LinkedinURL,
            productDescription,
            productPrice: parsedPrice
        });

    } catch (error) {
        console.error("❌ Error saving DISC request:", error);
        res.status(500).json({ message: error.message });
    }
};

export const analyzeDISCProfile = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await UserModel.findById(userId)
            .populate('LinkedinContentId')
            .populate('LinkedinPostId');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.pendingProductDescription) {
            return res.status(400).json({ message: "No product description found. Please save it first." });
        }

        if (!user.LinkedinContentId) {
            return res.status(400).json({ message: "No LinkedIn profile data found. Please upload profile first." });
        }

        console.log("🔄 Starting DISC analysis...");

        const profileData = user.LinkedinContentId.toObject ? user.LinkedinContentId.toObject() : user.LinkedinContentId;

        const allPosts = await LinkedinPost.find({ 
            profileId: user.LinkedinContentId._id 
        }).sort({ createdAt: -1 }).limit(30);

        const postsData = allPosts.map(p => p.toObject ? p.toObject() : p);

        console.log(`📊 Analyzing profile: ${profileData.name} with ${postsData.length} posts`);

        const analysisResult = await analyzeLinkedInProfile(
            profileData,
            postsData,
            user.pendingProductDescription,
            user.pendingProductPrice
        );

        console.log("✅ Analysis engine completed");

        const profileDISC = analysisResult.personality.disc;
        const confidenceResult = analysisResult.confidence;

        const dataSources = [];
        if (user.LinkedinContentId._id) dataSources.push(`profile_${user.LinkedinContentId._id}`);
        if (postsData.length > 0) dataSources.push(`posts_${postsData.length}_items`);
        dataSources.push('about_section', 'experience_section', 'skills_section');

        const discProfileDoc = new DISCProfile({
            userId: userId,
            linkedinContentId: user.LinkedinContentId._id,
            linkedinPostId: user.LinkedinPostId?._id || null,
            productDescription: user.pendingProductDescription,
            productPrice: user.pendingProductPrice || null,
            executive: analysisResult.executive,
            starting: analysisResult.starting,
            personality: analysisResult.personality,
            talkingPoints: analysisResult.talkingPoints,
            openingScripts: analysisResult.openingScripts,
            objectionHandling: analysisResult.objectionHandling,
            personalizationCues: analysisResult.personalizationCues,
            nextActions: analysisResult.nextActions,
            confidence: confidenceResult,
            dataSources,
            analysisMetadata: analysisResult.analysisMetadata
        });

        await discProfileDoc.save();

        await UserModel.findByIdAndUpdate(userId, {
            $unset: { pendingLinkedInURL: "", pendingProductDescription: "", pendingProductPrice: "" }
        });

        console.log("✅ DISC analysis completed successfully");

        res.status(200).json({
            message: "DISC analysis completed successfully",
            analysisId: discProfileDoc._id,
            analysis: discProfileDoc
        });

    } catch (error) {
        console.error("❌ DISC analysis failed:", error);
        res.status(500).json({ message: error.message });
    }
};

// export const LinkedinUploadFile = async (req, res) => {
//     const { id } = req.params
//     const { LinkedinURL, LinkedinDec, content, posts } = req.body;

//     try {
//         let saveProfile = null;
//         let savePosts = [];
//         console.log("Incoming body:", { LinkedinURL, LinkedinDec, content, posts });

//         if (content && Object.keys(content).length > 0) {
//             saveProfile = await LinkedinContent.create({
//                 LinkedinURL,
//                 LinkedinDec,
//                 ...content
//             })
//             console.log("✅ Saved content:", saveProfile._id);
//         } else {
//             return res.status(400).json({ message: "No content provided." })
//         }


//         // ---------- Save Posts ----------
//         if (posts && Array.isArray(posts) && posts.length > 0) {
//             savePosts = await LinkedinPost.insertMany(posts.map((p) => ({
//                 ...p,
//                 profileId: saveProfile ? saveProfile._id : null
//             })))
//             console.log("✅ Saved posts:", savePosts.length)
//         } else if (posts && typeof posts === "object" && Object.keys(posts).length > 0) {
//             const post = await LinkedinPost.create({
//                 ...posts,
//                 profileId: saveProfile ? saveProfile._id : null,
//             })
//             savePosts.push(post)
//             console.log("✅ Saved single post:", post._id);
//         } else {
//             return res.status(400).json({ message: "No posts provided." })
//         }


//         if (id) {
//             await UserModel.findByIdAndUpdate(id, {
//                 LinkedinContentId: saveProfile ? saveProfile._id : null,
//                 LinkedinPostId: savePosts.length > 0 ? savePosts[0]._id : null,
//             });
//             console.log("✅ Linked data to user:", id);


//         }
//         res.status(200).json({
//             message: "Files uploaded successfully",
//             profile: saveProfile,
//             posts: savePosts,

//         });
//     } catch (error) {
//         console.error("❌ Error uploading LinkedIn data:", error);
//         res.status(500).json({ message: error.message });
//     }
// };





export const getLinkedinUploadFile = async (req, res) => {
    const { id } = req.params
    try {
        const getUser = await UserModel.findById(id)
            .populate("LinkedinContentId")
            .populate("LinkedinPostId");
        if (!getUser) {
            return res.status(404).json({ message: "User not found" })
        }

        res.status(200).json({
            user: getUser,
            message: "⚠️ LinkedIn data will be deleted automatically after 2 minutes"
        });

        // // schedule deletion after 4 minutes
        setTimeout(async () => {
            try {
                if (getUser.LinkedinContentId) {
                    await LinkedinContent.findByIdAndDelete(getUser.LinkedinContentId._id)
                    getUser.LinkedinContentId = null
                }
                if (getUser.LinkedinPostId) {
                    await LinkedinPost.findByIdAndDelete(getUser.LinkedinPostId._id);
                    getUser.LinkedinPostId = null
                }
                // also unlink from user so populate won’t find them again
                await UserModel.findByIdAndUpdate(id, {
                    $unset: { LinkedinContentId: "", LinkedinPostId: "" }
                })
                console.log(`LinkedIn data removed for user ${id}`);
            } catch (error) {
                console.error("Error deleting LinkedIn data:", err.message);
            }
        }, 2 * 60 * 1000)

        await getUser.save()

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}




export const getLinkedinAnalysisResult = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    try {
        const { name } = req.query;  // ✅ get name from query params

        // build match for populate
        let match = {};
        if (name) {
            match.$or = [
                { name: { $regex: new RegExp(name, "i") } },
                { title: { $regex: new RegExp(name, "i") } }
            ];
        }

        let linkedinCondition = {
            $or: [
                { LinkedinPostId: { $exists: true, $ne: null } },
                { LinkedinContentId: { $exists: true, $ne: null } }
            ]
        };

        // fetch paginated results
        let result = await UserModel.find(linkedinCondition)
            .populate("LinkedinPostId")
            .populate({
                path: "LinkedinContentId",
                match  // ✅ use the new match object here
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // filter out docs where LinkedinContentId didn’t match
        result = result.filter(u => u.LinkedinContentId);

        // fetch total count
        let totalDocs = await UserModel.find(linkedinCondition)
            .populate({
                path: "LinkedinContentId",
                match  // ✅ also here
            });

        const total = totalDocs.filter(u => u.LinkedinContentId).length;
        let data = result.map((val) => ({
            ...val.toObject(),
            createdAt: timeFormat(val.createdAt),
            updatedAt: timeFormat(val.updatedAt),

        }))

        return res.status(200).json({
            result: data,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};



export const getLinkedinUserProfile = async (req, res) => {
    const { id } = req.params
    try {
        const getUser = await UserModel.findById(id)
            .populate("LinkedinContentId")
            .populate("LinkedinPostId");
        if (!getUser) {
            return res.status(404).json({ message: "User not found" })
        }

        res.status(200).json(getUser);




    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}
export const LinkedinuserDelete = async (req, res) => {
    try {
        const { id } = req.params;
        let Finduser = await UserModel.findById(id);

        if (!Finduser) {
            return res
                .status(404)
                .json({ message: "Linkedin Profile not found with this Id" });
        }
        if (Finduser.LinkedinPostId) {
            await LinkedinPost.findByIdAndDelete(Finduser.LinkedinPostId)
            Finduser.LinkedinPostId = null
        }
        if (Finduser.LinkedinContentId) {
            await LinkedinContent.findByIdAndDelete(Finduser.LinkedinContentId)
            Finduser.LinkedinContentId = null
        }
        await Finduser.save()
        return res.status(200).json({ message: "User LinkedIn data removed", user: Finduser });
    } catch (error) {
        console.log("Erron in the PackageDelete", error);
        return res.status(500).json({ message: error.message });
    }
};

export const getLatestDISCAnalysis = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const latestAnalysis = await DISCProfile.findOne({ userId })
            .sort({ createdAt: -1 })
            .populate('linkedinContentId')
            .populate('linkedinPostId');

        if (!latestAnalysis) {
            return res.status(404).json({ 
                message: "No DISC analysis found for this user. Please analyze a profile first." 
            });
        }

        return res.status(200).json({
            success: true,
            analysis: latestAnalysis
        });

    } catch (error) {
        console.error("Error fetching latest DISC analysis:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const getDISCAnalysisById = async (req, res) => {
    try {
        const { analysisId } = req.params;

        const analysis = await DISCProfile.findById(analysisId)
            .populate('userId')
            .populate('linkedinContentId')
            .populate('linkedinPostId');

        if (!analysis) {
            return res.status(404).json({ message: "Analysis not found" });
        }

        return res.status(200).json({
            success: true,
            analysis: analysis
        });

    } catch (error) {
        console.error("Error fetching DISC analysis:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const getAllDISCAnalysesByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const analyses = await DISCProfile.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('linkedinContentId', 'name title company LinkedinURL')
            .populate('linkedinPostId');

        const total = await DISCProfile.countDocuments({ userId });

        return res.status(200).json({
            success: true,
            count: analyses.length,
            total: total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            analyses: analyses.map(analysis => ({
                _id: analysis._id,
                profileName: analysis.linkedinContentId?.name || 'Unknown',
                profileTitle: analysis.linkedinContentId?.title || 'N/A',
                profileCompany: analysis.linkedinContentId?.company || 'N/A',
                linkedinURL: analysis.linkedinContentId?.LinkedinURL || '',
                productDescription: analysis.productDescription,
                primaryType: analysis.personality?.primaryType || 'N/A',
                confidenceScore: analysis.confidence?.score || 0,
                createdAt: analysis.createdAt,
                analysisPreview: {
                    executive: analysis.executive,
                    disc: analysis.personality?.disc
                }
            }))
        });

    } catch (error) {
        console.error("Error fetching user DISC analyses:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const getDISCAnalysisSummary = async (req, res) => {
    try {
        const { analysisId } = req.params;

        const analysis = await DISCProfile.findById(analysisId)
            .populate('linkedinContentId', 'name title company location profilePicture LinkedinURL');

        if (!analysis) {
            return res.status(404).json({ message: "Analysis not found" });
        }

        const summary = {
            _id: analysis._id,
            profile: {
                name: analysis.linkedinContentId?.name || 'Unknown',
                title: analysis.linkedinContentId?.title || 'N/A',
                company: analysis.linkedinContentId?.company || 'N/A',
                location: analysis.linkedinContentId?.location || 'N/A',
                profilePicture: analysis.linkedinContentId?.profilePicture || '',
                linkedinURL: analysis.linkedinContentId?.LinkedinURL || ''
            },
            productDescription: analysis.productDescription,
            executive: analysis.executive,
            personality: {
                disc: analysis.personality.disc,
                bullets: analysis.personality.bullets,
                primaryType: analysis.personality.primaryType,
                secondaryType: analysis.personality.secondaryType
            },
            talkingPoints: analysis.talkingPoints.slice(0, 5),
            openingScripts: analysis.openingScripts,
            objectionHandling: analysis.objectionHandling.slice(0, 5),
            personalizationCues: analysis.personalizationCues.slice(0, 5),
            nextActions: analysis.nextActions,
            confidence: analysis.confidence,
            analysisMetadata: analysis.analysisMetadata,
            createdAt: analysis.createdAt
        };

        return res.status(200).json({
            success: true,
            summary: summary
        });

    } catch (error) {
        console.error("Error fetching DISC analysis summary:", error);
        return res.status(500).json({ message: error.message });
    }
};