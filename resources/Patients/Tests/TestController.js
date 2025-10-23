import Patient from "../PatientModel.js";
import Test from "./TestModel.js";

export const createTest = async (req, res) => {
    const {
        k_value,
        v_value,
        p_value,
    } = req.body;
    if (!k_value) return res.status(400).json({ message: 'k value is required' });
    if (!v_value) return res.status(400).json({ message: 'v value is required' });
    if (!p_value) return res.status(400).json({ message: 'p value is required' });
    try {
        if (!req?.patient?.isVerified) {
            return res.status(400).json({ message: 'Your Mobile Number not verified, first verify !' });
        }
        req.body.patient = req?.patient?._id;
        const test = await Test.create({
            ...req.body
        });
        res.status(201).json({ test, message: 'test Added successfully' });
    } catch (error) {

        res.status(500).json({
            message: error.message ? error.message : "Server error!",
        });

    }
};
export const getSinglePatientAllTest = async (req, res) => {
    try {
        if (!req.params?.patientId) {
            return res.status(400).json({ message: "Please provide patient ID" });
        }
        const data = await Test.find({ patient: req.params?.patientId }).populate('patient').exec();;
        if (data) {
            return res.status(200).json({
                success: true,
                message: "feched!",
                data,
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message ? error.message : "Something went wrong!",
        });
    }
}
export const getselfTest = async (req, res) => {
    try {
        const data = await Test.find({ patient: req.patient?._id }).populate('patient').exec();;
        if (data) {
            return res.status(200).json({
                success: true,
                message: "feched!",
                data,
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message ? error.message : "Something went wrong!",
        });
    }
}