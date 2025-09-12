
import { Information } from "./InformationModel.js"
export const AddNewnIformation = async (req, res) => {
    try {
        if (!req?.user) return res.status(400).json({ message: "please login !" });
        // console.log(req?.user)


        req.body.user = req.user._id
        const information = await Information.create(req.body);

        res.status(201).json({
            success: true,
            information,
            message: 'Information Added',
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message ? error.message : 'Something went Wrong',
        });
    }
}

export const FindAllInformation = async (req, res) => {
    try {
        if (!req?.user) return res.status(400).json({ message: "please login !" });
        // console.log(req?.user)


        const information = await Information.find().sort({ createdAt: -1 });
        if (information) {
            return res.status(200).json({
                success: true,
                information,
                message: 'Fetched All Information',
            });
        }
        else {
            return res.status(404).json({
                success: true,

                message: 'No Information till Now',
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message ? error.message : 'Something went Wrong',
        });
    }
}
