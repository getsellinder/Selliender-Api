import catchAsyncErrors from "../../middlewares/catchAsyncErrors.js";
import { Specialty } from "./SpecialtiesModel.js";

// add a new specialty
// POST /api/specialty/add
export const createSpecialty = async (req, res, next) => {
  try {
    const specialty = await Specialty.create(req.body);
    res.status(201).json({
      success: true,
      specialty,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// get all specialties
// GET /api/specialty
export const getAllSpecialty = catchAsyncErrors(async (req, res, next) => {
  const specialty = await Specialty.find();

  res.status(200).json({
    success: true,
    specialty,
  });
});

// get a single specialty
// GET /api/specialty/:id
export const getSingleSpecialty = catchAsyncErrors(async (req, res, next) => {
  const specialty = await Specialty.findById(req.params.id);

  if (!specialty) {
    return res.status(404).json({
      success: false,
      message: "Specialty not found",
    });
  }

  res.status(200).json({
    success: true,
    specialty,
  });
});

// delete a single specialty
// DELETE /api/specialty/:id
export const deleteSpecialty = catchAsyncErrors(async (req, res, next) => {
  const specialty = await Specialty.findById(req.params.id);

  if (!specialty) {
    return res.status(404).json({
      success: false,
      message: "Specialty not found",
    });
  }

  await specialty.remove();

  res.status(200).json({
    success: true,
    message: "Specialty deleted",
  });
});
