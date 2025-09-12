import { Franchisee } from "./FranchiseeModel.js";
import sendEmail from "../../Utils/sendEmail.js"
import cloudinary from "../../Utils/cloudinary.js";
import { Order } from '../Orders/orderModel.js'
import fs from "fs";
import bcrypt from "bcryptjs"
import password from 'secure-random-password'
import { generate } from "generate-password";
import { Product } from "../Products/ProductModel.js";

const addFranchisee = async (req, res) => {
    const image_file = req?.files?.image;
    try {
        const { email } = req.body
        let franchisee = await Franchisee.findOne({ email });
        if (franchisee) {
            return res
                .status(400)
                .json({ success: false, message: "franchisee already exists" });
        }
        const FranchiseeWithURL = await Franchisee.findOne({
            short_url: req.body?.short_url,
        });
        if (FranchiseeWithURL?._id) {
            if (req?.files?.image?.tempFilePath)
                fs.unlinkSync(image_file?.tempFilePath);
            return res.status(400).json({ message: "Franchisee URL is not available!" });
        }
        if (image_file?.tempFilePath) {
            const result = await cloudinary.v2.uploader.upload(
                image_file?.tempFilePath,
                {
                    folder: "ATP/Franchisee_banners",
                }
            );
            const image = { url: result?.secure_url, public_id: result?.public_id };
            req.body.banner = image;
            fs.unlinkSync(image_file?.tempFilePath);
        }
        //generate password
        const passwords = password.randomPassword({
            length: 10,
            characters: [
                { characters: password.upper, exactly: 1 },
                { characters: password.symbols, exactly: 1 },
                password.lower,
                password.digits]
        })

        req.body.password = passwords;
        req.user.role === 'admin' ? req.body.verify = true : req.body.verify = false
        const entity = await Franchisee.create(req.body);
        await sendEmail({

            to: `${req.body.email}`, // Change to your recipient

            from: `${process.env.SEND_EMAIL_FROM}`, // Change to your verified sender

            subject: `ATP Franchisee Created`,
            html: `your  franchisee Url is:${req.body.url}<br/><br/>your login email  is: <strong> ${req.body.email}</strong><br/>and  password is: <strong> ${passwords}</strong><br/><br/><h3>Thank You</h3>`

        });
        return res.status(200).json({
            success: true,
            data: entity,
            message: `Franchisee added successfully and Email sent to ${req.body.email} successfully`,
        });
    } catch (err) {
        // console.log(err)
        fs.unlinkSync(image_file?.tempFilePath);
        return res.status(500).json({ message: err.message ? err.message : "Unable to create." });
    }
};

const addProductToFranchisee = async (req, res) => {
    try {
        const Franchisee = await Franchisee.findByIdAndUpdate(
            req.params.id,
            {
                $push: { products: req.body.product_id },
            },
            { new: true }
        );
        res
            .status(200)
            .json({ status: "ok", message: "Product added to Franchisee successfully" });
    } catch (err) {
        return res.status(500).json({ message: "Unable to get ID." });
    }
};



const getFranchiseeById = async (req, res) => {
    try {
        const entity = await Franchisee.findById(req.params.id)
            .populate("city")
            .populate("products");
        return res.status(200).json({ status: "OK", data: entity });
    } catch (err) {
        // console.log(err);
        return res.status(500).json({ message: "Unable to get menu items." });
    }
};

const getFranchiseeByIdPopulated = async (req, res) => {
    try {
        const entity = await Franchisee.findById(req.params.id).populate({
            path: "city",
            select: "city_name state -_id",
            populate: {
                path: "state",
                select: "state_name state_code -_id",
            },
        });
        return res.status(200).json({ status: "OK", data: entity });
    } catch (err) {
        return res.status(500).json({ message: "Unable to get franchiee ." });
    }
};

const getFranchiseeByIdWithoutPopulate = async (req, res) => {
    try {
        const entity = await Franchisee.findById(req.params.id);
        return res.status(200).json({ status: "OK", data: entity });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Unable to get menu items." });
    }
};

const getAllFranchisees = async (req, res) => {
    try {
        const entity = await Franchisee.find({}).populate("city");
        return res.status(200).json({ status: "OK", data: entity });
    } catch (err) {
        return res.status(500).json({ message: "Unable to get menu items." });
    }
};

const getAllFranchiseesPopulated = async (req, res) => {
    try {
        const entity = await Franchisee.find({})
            .populate("city");
        return res.status(200).json({ status: "OK", data: entity });
    } catch (err) {
        return res.status(500).json({ message: "Unable to get menu items." });
    }
};



const updateFranchisee = async (req, res) => {
    const image_file = req?.files?.image;
    try {
        const FranchiseeWithURL = await Franchisee.findOne({
            short_url: req.body?.short_url,
        });
        if (
            FranchiseeWithURL?._id &&
            FranchiseeWithURL?._id?.toString() !== req.params.id
        ) {
            if (req?.files?.image?.tempFilePath)
                fs.unlinkSync(image_file?.tempFilePath);
            return res.status(400).json({ message: "Franchisee URL is not available!" });
        }
        const getFranchisee = await Franchisee.findById(req.params.id);
        if (image_file?.tempFilePath) {
            if (getFranchisee?.banner) {
                const imageId = getFranchisee?.banner?.public_id;

                await cloudinary.uploader.destroy(imageId)
            }
            const result = await cloudinary.v2.uploader.upload(
                image_file?.tempFilePath,
                {
                    folder: "ATP/Franchisee_banners",
                }
            );
            const image = { url: result?.secure_url, public_id: result?.public_id };
            req.body.banner = image;
            fs.unlinkSync(image_file?.tempFilePath);
            await cloudinary.v2.uploader.destroy(getFranchisee.banner.public_id);
        }
        //generate password
        const passwords = password.randomPassword({
            length: 10,
            characters: [
                { characters: password.upper, exactly: 1 },
                { characters: password.symbols, exactly: 1 },
                password.lower,
                password.digits]
        })

        req.body.password = await bcrypt.hash(passwords, 12)
        req.user.role === 'admin' ? req.body.verify = true : req.body.verify = false

        const entity = await Franchisee.findByIdAndUpdate(req.params.id, req.body);
        await sendEmail({

            to: `${req.body.email}`, // Change to your recipient

            from: `${process.env.SEND_EMAIL_FROM}`, // Change to your verified sender

            subject: `ATP Franchisee Updated`,
            html: `your  franchisee Url is:${req.body.url}<br/><br/>your login email  is: <strong> ${req.body.email}</strong><br/>and  password is: <strong> ${passwords}</strong><br/><br/><h3>Thank You</h3>`

        });
        return res.status(200).json({
            success: true,
            data: entity,
            message: `Franchisee Updated successfully and Email sent to ${req.body.email} successfully`,
        });
    } catch (err) {
        console.log(err);
        if (req?.files?.image?.tempFilePath)
            fs.unlinkSync(image_file?.tempFilePath);
        return res.status(500).json({ message: err.message ? err.message : "Unable to Update." });
    }
};

const deleteFranchiseeById = async (req, res) => {
    try {
        const findFranchisee = await Franchisee.findById(req.params.id);
        if (findFranchisee?.banner?.public_id)
            await cloudinary.v2.uploader.destroy(findFranchisee?.banner?.public_id);


        const franchisee = await Franchisee.findByIdAndDelete(req.params.id)
        if (!franchisee) {
            return res.status(400).json({ message: 'franchisee Not Found' });
        }
        await franchisee.remove();

        res.status(200).json({ status: "OK", msg: 'Deteted successfully' });
    } catch (err) {
        return res.status(500).json({ message: err.message ? err.message : "Unable to delete." });
    }
};

//website requests
const findFranchiseeByURL = async (req, res) => {
    try {
        const entity = await Franchisee.findOne({ short_url: req.params.url })
            .populate({
                path: "city",
                select: "city_name state -_id",
                populate: {
                    path: "state",
                    select: "state_name state_code -_id",
                },
            })
            .select(
                " -products -url -short_url -state_name -createdAt -updatedAt"
            );
        if (entity?._id) {
            return res.status(200).json({ status: "OK", data: entity });
        } else {
            return res.status(404).json({ message: "Franchisee not found" });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Franchisee not found" });
    }
};
//------------------------------Franchisee Auth----------------------//
export const FranchiseeLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const franchisee = await Franchisee.findOne({ email })
            .select("+password")


        if (!franchisee) {
            return res.status(400).json({
                success: false,
                message: "Franchisee does not exist",
            });
        }

        const isMatch = await franchisee.comparePassword(password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Incorrect password",
            });
        }

        const token = await franchisee.getJWTToken();


        res.status(200).json({
            success: true,
            franchisee,
            token,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
//6.Get User Detail
export const getFransiDetails = async (req, res) => {
    try {
        const franchisee = await Franchisee.findById(req.franchi._id);

        res.status(200).json({
            success: true,
            franchisee,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }

};

export const franchiseeUpdatePassword = async (req, res) => {
    try {
        const franchisee = await Franchisee.findById(req.franchi._id).select("+password");

        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Please provide old and new password",
            });
        }

        const isMatch = await franchisee.comparePassword(oldPassword);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Incorrect Old password",
            });
        }

        franchisee.password = newPassword;
        await franchisee.save();

        res.status(200).json({
            success: true,
            message: "Password Updated",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
export const franchiseeForgotPassword = async (req, res, next) => {
    const franchisee = await Franchisee.findOne({ email: req.body.email });

    if (!franchisee) {
        return res.status(404).json({ message: "Franchisee not found" });

    }

    const passwords = password.randomPassword({
        length: 12,
        characters: [
            { characters: password.upper, exactly: 1 },
            { characters: password.symbols, exactly: 1 },
            password.lower,
            password.digits]
    })

    franchisee.password = passwords;
    //         req.body.password = await bcrypt.hash(passwords, 12)

    await franchisee.save()
    try {

        await sendEmail({

            to: `${franchisee.email}`, // Change to your recipient

            from: `${process.env.SEND_EMAIL_FROM}`, // Change to your verified sender

            subject: `ATP Franchisee Password Recovery`,
            html: `your new password is: <br/> <strong> ${passwords}</strong><br/><br/>If you have not requested this email then, please ignore it.`

        });

        res.status(200).json({
            success: true,
            message: `Password sent to ${franchisee.email} successfully`,
        });
    } catch (error) {

        return res.status(500).json({ message: error?.message || "Something went wrong!" });
    }
}

//edit franchi profile self
export const EditFranchiseeProfile = async (req, res) => {
    const image_file = req?.files?.image;
    try {
        const FranchiseeWithURL = await Franchisee.findOne({
            short_url: req.body?.short_url,
        });

        if (
            FranchiseeWithURL?._id &&
            FranchiseeWithURL?._id?.toString() !== req.franchi._id.toString()
        ) {
            if (req?.files?.image?.tempFilePath)
                fs.unlinkSync(image_file?.tempFilePath);
            return res.status(400).json({ message: "Franchisee URL is not available!" });
        }
        const getFranchisee = await Franchisee.findById(req.franchi._id);



        if (image_file?.tempFilePath) {
            if (getFranchisee?.banner) {
                const imageId = getFranchisee?.banner?.public_id;

                await cloudinary.uploader.destroy(imageId)
            }
            const result = await cloudinary.v2.uploader.upload(
                image_file?.tempFilePath,
                {
                    folder: "ATP/Franchisee_banners",
                }
            );
            const image = { url: result?.secure_url, public_id: result?.public_id };
            req.body.banner = image;
            fs.unlinkSync(image_file?.tempFilePath);
            await cloudinary.v2.uploader.destroy(getFranchisee.banner.public_id);
        }
        req.body.verify = false
        const entity = await Franchisee.findByIdAndUpdate(req.franchi._id, req.body);

        return res.status(200).json({
            success: true,
            data: entity,
            message: `Franchisee Edited successfully and varified by admin soon !`,
        });
    } catch (err) {
        console.log(err);
        if (req?.files?.image?.tempFilePath)
            fs.unlinkSync(image_file?.tempFilePath);
        return res.status(500).json({ message: err.message });
    }
}

//franchisee varification
export const FranchiseeVarificationFromAdmin = async (req, res) => {

    try {

        const getFranchisee = await Franchisee.findById(req.params.id);
        if (getFranchisee.verify === false) {
            if (req.user.role === 'admin') {
                getFranchisee.verify = true
                getFranchisee.save()
                await sendEmail({

                    to: `${getFranchisee.email}`, // Change to your recipient

                    from: `${process.env.SEND_EMAIL_FROM}`, // Change to your verified sender

                    subject: `Cakestick Franchisee Varification`,
                    html: `your  franchisee ${getFranchisee.name} is Varified !!<br/><br/><h3>Thank You</h3>`

                });
                return res.status(200).json({
                    success: true,
                    message: `Franchisee varify successfully`,
                });
            }
            else {
                return res.status(400).json({
                    success: false,

                    message: `Franchisee varification failled!  only admin can varify, please try with admin account `,
                });
            }
        } else {
            return res.status(400).json({
                success: false,
                message: `Franchisee Allready Varified`,
            });
        }
    } catch (err) {
        // console.log(err)
        return res.status(500).json({ message: err.message ? err.message : "Something went wrong." });
    }
};

//filter franchisee wise product
export const FranchiseePriceLevelProduct = async (req, res) => {

    try {
        const getFranchisee = await Franchisee.findById(req.franchi._id);
        // console.log(getFranchisee.price_Lable)
        if (getFranchisee?.price_Lable) {
            const getFranchiseeProduct = await Product.find().select(` name ${getFranchisee.price_Lable} ${getFranchisee.price_Lable}_With_Tax taxId  description image
            createdAt updatedAt`);



            return res.status(200).json({
                success: true,
                getFranchiseeProduct,
                message: `Franchisee product fetched`,
            });
        }

    } catch (err) {

        return res.status(500).json({ message: err.message ? err.message : "Something went wrong." });
    }
};



//franchisee order 
export const createOrder = async (req, res) => {
    try {
        if (!req?.franchi) return res.status(400).json({ message: "please login !" });
        // console.log(req?.user)
        let isUnique = false;
        let order_id = generate({
            length: 9,
            numbers: true,
            lowercase: false,
            uppercase: false,
        });

        while (!isUnique) {
            const unqOrder = await Order.findOne({ order_id });
            if (!unqOrder) {
                isUnique = true;
            } else {
                order_id = generate({
                    length: 9,
                    numbers: true,
                    lowercase: false,
                    uppercase: false,
                });
            }
        }

        req.body.user = req?.franchi?._id
        req.body.order_id = order_id
        const order = await Order.create(req.body);

        res.status(201).json({
            success: true,
            order,
            message: 'order Created',
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message ? error.message : 'Something went Wrong',
        });
    }

}

export const getAllOrder = async (req, res) => {
    try {
        if (!req?.franchi) return res.status(400).json({ message: "please login first !" });
        // console.log(req?.user)


        const order = await Order.find({ user: req?.franchi?._id }).populate({
            path: "user",
            select: "name -_id",
        }).sort({ createdAt: -1 });
        if (order) {
            res.status(201).json({
                success: true,
                order,
                message: 'All Order Fetched',
            });
        }


    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message ? error.message : 'Something went Wrong',
        });
    }

}
export const getSingleOrder = async (req, res) => {
    try {
        if (!req?.franchi) return res.status(400).json({ message: "please login first !" });
        // console.log(req?.user)
        if (!req.params.id) return res.status(400).json({ message: "please Provide Order Id" });



        const order = await Order.findById(req.params.id).populate({
            path: "user",
            select: "name -_id",


        }).populate({
            path: "shippingInfo",

            populate: {
                path: "Franchisee",
                select: "banner price_Lable ",
            },
        }).sort({ createdAt: -1 });
        if (order) {
            res.status(201).json({
                success: true,
                order,
                message: ' Order Fetched',
            });
        }


    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message ? error.message : 'Something went Wrong',
        });

    }

}

export const EditOrderBeforePayment = async (req, res) => {
    try {
        if (!req?.franchi) return res.status(400).json({ message: "please login first !" });
        // console.log(req?.user)
        if (!req.params.id) return res.status(400).json({ message: "please Provide Order Id" });



        const order = await Order.findById(req.params.id)
        if (order) {
            if (order.isPaid === false) {



                if (order.user.toString() === req?.franchi._id.toString()) {
                    req.body.user = req?.franchi._id

                    const ModifyOrder = await Order.findByIdAndUpdate(req.params.id, req.body,

                        {
                            new: true,
                            runValidators: true,
                            useFindAndModify: false,
                        }

                    );
                    res.status(200).json({
                        success: true,
                        order: ModifyOrder,
                        message: ' Order Updated',
                    });
                }
                else {
                    return res.status(400).json({ message: 'You not created This So You Can not Edit this Order !! ' })

                }


            }
            else {
                return res.status(400).json({ message: 'order can not Edited Because Payment Done !! ' })

            }

        }


    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message ? error.message : 'Something went Wrong',
        });
    }

}

export {
    addFranchisee,
    getAllFranchisees,
    getAllFranchiseesPopulated,
    getFranchiseeById,
    getFranchiseeByIdPopulated,
    updateFranchisee,
    deleteFranchiseeById,
    getFranchiseeByIdWithoutPopulate,
    // getAllFranchiseesPopulatedWithOption,
    findFranchiseeByURL,
    // getFranchiseeProductsForChild,
    addProductToFranchisee,
    // addGradeToFranchisee,
    // getFranchiseeGradesAndHousesByParent,
};
