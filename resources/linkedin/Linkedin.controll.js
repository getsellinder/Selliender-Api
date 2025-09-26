import UserModel from "../user/userModel.js";
import LinkedinContent from "./LinkedinContent.model.js";
import LinkedinPost from "./LinkedinPost.model.js";


export const LinkedinUploadFile = async (req, res) => {
    const { id } = req.params
    const { LinkedinURL, LinkedinDec } = req.body;
    const { files } = req
    try {
        if (!files || (!files.content && !files.posts)) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Convert uploaded buffer to JSON
        let savePfofile = null;
        let savePosts = [];
        // save content
        if (files.content && files.content[0]) {
            const contentBuffe = files.content[0].buffer
            const contentJson = JSON.parse(contentBuffe.toString("utf8"))
            // insert profile (add LinkedinURL, LinkedinDec)
            savePfofile = await LinkedinContent.create({
                LinkedinURL,
                LinkedinDec,
                ...contentJson
            })
        }


        // ---------- Save Posts ----------
        if (files.posts && files.posts[0]) {
            const postBuffer = files.posts[0].buffer
            const postsJson = JSON.parse(postBuffer.toString("utf8"))
            if (Array.isArray(postsJson)) {
                savePosts = await LinkedinPost.insertMany(postsJson.map(p => ({
                    ...p,
                    profileId: savePfofile ? savePfofile._id : null
                })))
            }
            else {
                const post = await LinkedinPost.create({
                    ...postsJson,
                    profileId: savePfofile ? savePfofile._id : null

                })
                savePosts.push(post);
            }
        }

        if (id) {
            await UserModel.findByIdAndUpdate(id, {
                LinkedinContentId: savePfofile ? savePfofile._id : null,
                LinkedinPostId: savePosts.length > 0 ? savePosts[0]._id : null
            })
        }



        res.status(200).json({
            message: "Files uploaded successfully",
            profile: savePfofile,
            posts: savePosts
        });
    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({ message: error.message });
    }
};

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
            message: "⚠️ LinkedIn data will be deleted automatically after 4 minutes"
        });

        // // schedule deletion after 4 minutes
        setTimeout(async () => {
            try {
                if (getUser.LinkedinContentId) {
                    await LinkedinContent.findByIdAndDelete(getUser.LinkedinContentId._id)
                }
                if (getUser.LinkedinPostId) {
                    await LinkedinPost.findByIdAndDelete(getUser.LinkedinPostId._id);
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



    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}