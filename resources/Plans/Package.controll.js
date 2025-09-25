import packageModel from "./Package.model.js";

export const PackageCreate = async (req, res) => {
  try {
    const {
      Package,
      GST,
      Yearly_Price,
      Monthly_Price,
      Total_Monthly_Price,
      Total_Yearly_Price,
      PlanLimit,
      name,
      Monthly_features,
      Yearly_features,
    } = req.body;
    if (!Package || !GST || !PlanLimit) {
      return res.status(404).json({ message: "Please Fill the Form" });
    }

    let data = {
      Package,
      GST,

      Yearly_Price,
      Monthly_Price,
      Total_Monthly_Price,
      Total_Yearly_Price,
      PlanLimit,
      name,
      Monthly_features,
      Yearly_features,
    };
    const add = await packageModel.create(data);
    return res
      .status(200)
      .json({ message: "Package Created Successfully", add });
  } catch (error) {
    console.log("Erron in the PackageCreate", error);
    return res.status(500).json({ message: error.message });
  }
};

export const getByIdPackage = async (req, res) => {
  try {
    const { id } = req.params;
    let Findpackage = await packageModel
      .findById(id)
      .populate("GST", "name Gst active");

    if (!Findpackage) {
      return res
        .status(404)
        .json({ message: "Package not found with this Id" });
    }

    return res.status(200).json(Findpackage);
  } catch (error) {
    console.log("Erron in the getByIdPackage", error.message);
    return res.status(500).json({ message: error.message });
  }
};
export const getAllPackages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;

    const { packagename } = req.query;

    const filter = {
      Status: "Active",
    };
    let skip = (page - 1) * limit;

    if (packagename) {
      filter.Package = packagename;
    }

    const total = await packageModel.countDocuments(filter);
    let getpackages = await packageModel
      .find(filter)
      .populate("GST", "name Gst active")
      .sort({ createdAt: -1 })
      .skip(skip)

      .limit(limit);
    return res.status(200).json({
      getpackages,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (error) {
    console.log("Erron in the getAllPackages", error);
    return res.status(500).json({ message: error });
  }
};

export const PackageDelete = async (req, res) => {
  try {
    const { id } = req.params;
    let Findpackage = await packageModel.findById(id);

    if (!Findpackage) {
      return res
        .status(404)
        .json({ message: "Package not found with this Id" });
    }
    const dlt = await packageModel.findByIdAndDelete(id);
    return res
      .status(200)
      .json({ message: "Package Deleted Successfully", dlt });
  } catch (error) {
    console.log("Erron in the PackageDelete", error);
    return res.status(500).json({ message: error.message });
  }
};
export const PackageUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      Package,
      GST,
      Yearly_Price,
      Monthly_Price,
      Total_Monthly_Price,
      Total_Yearly_Price,
      PlanLimit,
      name,
      Monthly_features,
      Yearly_features,
      Status,
    } = req.body;
    const getuser = await packageModel.findById(id);
    if (!getuser) {
      return res.status(404).json({ message: "Package not found" });
    }

    let data = {
      Package,
      GST,

      Yearly_Price,
      Monthly_Price,
      Total_Monthly_Price,
      Total_Yearly_Price,
      PlanLimit,
      name,
      Monthly_features,
      Yearly_features,
      Status,
    };
    let update = await packageModel.findByIdAndUpdate(id, data, { new: true });
    return res
      .status(200)
      .json({ message: "Package Updated Successfully", update });
  } catch (error) {
    console.log("Erron in the PackageUpdate", error);
    return res.status(500).json({ message: error.message });
  }
};
