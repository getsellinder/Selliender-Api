import { Departure } from "./DepartureModel.js"
export const AddNewFlight = async (req, res) => {
    try {
        if (!req?.user) return res.status(400).json({ message: "please login !" });
        // console.log(req?.user)


        req.body.user = req.user._id
        const departure = await Departure.create(req.body);

        res.status(201).json({
            success: true,
            departure,
            message: 'few Flight Created',
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message ? error.message : 'Something went Wrong',
        });
    }
}

export const FindAllFlight = async (req, res) => {
    try {
        if (!req?.user) return res.status(400).json({ message: "please login !" });
        // console.log(req?.user)


        const departure = await Departure.find().sort({ createdAt: -1 });
        if (departure) {
            return res.status(200).json({
                success: true,
                departure,
                message: 'Fetched All Flight ',
            });
        }
        else {
            return res.status(404).json({
                success: true,
                departure,
                message: 'No Flight till Now',
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message ? error.message : 'Something went Wrong',
        });
    }
}
