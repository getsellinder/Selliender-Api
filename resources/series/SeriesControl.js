import cloudinary from "../../Utils/cloudinary.js";
import { GenreModel } from "../Genres/GenreModel.js";
import { SubjectModel } from "../Subjects/SubjectModel.js";
import { episode, Series, seriesseason } from "./SeriesModel.js";
import { deleteFile, uploadFile } from "../../Utils/uploadeFile.js";
import { treading } from "../treading/Trading.model.js";

export const createseries = async (req, res) => {
  try {
    const {
      // seriesno,
      seriestitle,
      description,
      about,
      genre,
      subject,
      seriespart,
    } = req.body;
    const coverImage = req.files.coverImage;
    if (
      // !seriesno ||
      !seriestitle ||
      !about ||
      !genre ||
      !subject ||
      !coverImage
    ) {
      return res.status(400).json({ message: "Please fill the form" });
    }

    if (!coverImage || !coverImage.mimetype.startsWith("image/")) {
      return res
        .status(400)
        .json({ message: "Please upload a valid Image file." });
    }

    const coverImagedata = await uploadFile(coverImage);
    const data = {
      // seriesno,
      seriestitle,
      description,
      about,
      genre,
      subject,
      seriespart,
      coverImage: {
        fileUrl: coverImagedata.fileUrl,
        filePath: coverImagedata.filePath,
      },
    };

    const response = await Series.create(data);
    return res.status(200).json(response);
  } catch (error) {
    console.log("createseries.error", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const createseasons = async (req, res) => {
  try {
    const {
      // seriesno,
      seriestitle,
      description,
      about,

      seriespart,
    } = req.body;
    const coverImage = req.files.coverImage;
    if (!seriesno || !seriestitle || !about || !coverImage) {
      return res.status(400).json({ message: "Please fill the form" });
    }

    if (!coverImage || !coverImage.mimetype.startsWith("image/")) {
      return res
        .status(400)
        .json({ message: "Please upload a valid Image file." });
    }
    const audioUpload = await uploadFile(coverImage);
    const getseriesno = await Series.findOne({ seriesno: seriesno });
    console.log("getseriesno", getseriesno);
    if (!getseriesno) {
      return res.status(404).json({ message: "Series not found" });
    }
    const data = {
      seriesno: getseriesno._id,
      seriestitle,
      description,
      about,

      seriespart,
      coverImage: audioUpload.secure_url,
    };

    const response = await seriesseason.create(data);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getseasons = async (req, res) => {
  const { id } = req.params;
  try {
    const series = await Series.findById(id);
    if (!series) {
      return res.status(404).json({ message: "Series not found" });
    }

    const seasons = await seriesseason.find({ seriesno: id });

    return res.status(200).json(seasons);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getseries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const { genreId, subgeneId, seriesId } = req.query;

    const skip = (page - 1) * limit;
    const filter = {};
    if (genreId) {
      filter.genre = genreId;
    }
    if (subgeneId) {
      filter.subject = subgeneId;
    }
    if (seriesId) {
      filter._id = seriesId;
    }
    const response = await Series.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    // const total = await episode.countDocuments({ isStandalone: false });
    const total = await Series.countDocuments(filter);
    const trendingDocs = await treading.find(
      {
        titleId: { $in: response.map((s) => s._id) },
      },
      { titleId: 1, isTreading: 1 }
    );
    const trendingMap = new Map(
      trendingDocs.map((t) => [String(t.titleId), t])
    );
    let data = [];
    for (const item of response) {
      const genrename = await GenreModel.findById({ _id: item.genre });
      const subjectname = await SubjectModel.findById({ _id: item.subject });
      const countepisode = await episode.countDocuments({
        seriesId: item._id,
      });
      const tDoc = trendingMap.get(String(item._id));

      const istDateTime = new Date(item.createdAt).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        // second: "2-digit",
        hour12: true,
      });
      const istupdateTime = new Date(item.updatedAt).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        // second: "2-digit",
        hour12: true,
      });

      data.push({
        ...item._doc,
        genrename: genrename?.genreName,
        subjectname: subjectname?.subjectName,
        countepisode,
        createdAtIST: istDateTime,
        updatedAt: istupdateTime,
        hasTrending: !!tDoc,
        isTreading: tDoc ? tDoc.isTreading : false,
        trendingId: tDoc ? tDoc._id : null,
      });
    }

    return res.status(200).json({
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (error) {
    console.log("createseries.error", error.message);
    return res.status(500).json({ message: error.message });
  }
};
export const getAlltitles = async (req, res) => {
  try {
    const title = await Series.find();
    if (!title) {
      return res.status(400).json({ message: "Titles not found" });
    }
    return res.status(200).json(title);
  } catch (error) {
    console.log("getAlltitles.error", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const getallseriesepisodes = async (req, res) => {
  const { id } = req.params;

  try {
    const seriesdata = await Series.findById(id);

    if (!seriesdata) {
      return res.status(400).json({ message: "Series not found" });
    }

    const genrenames = await GenreModel.findById(seriesdata.genre);
    const subjectnames = await SubjectModel.findById(seriesdata.subject);

    const episodedata = await episode
      .find({
        seriesId: id,
        isStandalone: false,
      })
      .sort({ orderIndex: 1 });

    const seasonMap = {};
    for (let ep of episodedata) {
      const genrename = await GenreModel.findById(ep.genre);
      const subjectname = await SubjectModel.findById(ep.subject);

      const seasonNumber = ep.seasonNo;
      if (!seasonMap[seasonNumber]) {
        seasonMap[seasonNumber] = [];
      }
      seasonMap[seasonNumber].push({
        id: ep._id,
        episodenumber: ep.episodenumber,
        orderIndex: ep.orderIndex,
        title: ep.title,
        description: ep.description,
        audioUrl: ep.audioUrl,
        thumbnail: ep.thumbnail,
        duration: ep.duration,
        about: ep.about,
        genrename: genrename.genreName,
        subjectname: subjectname.subjectName,
        seriesId: ep.seriesId,
      });
    }
    const seasons = Object.keys(seasonMap).map((season) => ({
      season: season,
      episodes: seasonMap[season],
    }));
    const formattedResponse = {
      series: {
        _id: seriesdata._id,
        // seriesno: seriesdata.seriesno,
        seriestitle: seriesdata.seriestitle,
        coverImage: seriesdata.coverImage,
        seriespart: seriesdata.seriespart,
        description: seriesdata.description,
        about: seriesdata.about,
        genre: genrenames?.genreName || "Unknown",
        subject: subjectnames?.subjectName || "Unknown",
      },
      seasons,
    };
    return res.status(200).json(formattedResponse);
  } catch (error) {
    console.log("error in getallseriesepisodes", error.message);
    return res.status(500).json({ message: error.message });
  }
};

//drag-drop updates

export const episodedragandDrop = async (req, res) => {
  try {
    const { episodes } = req.body;

    if (!Array.isArray(episodes)) {
      return res
        .status(400)
        .json({ success: false, message: "Episodes must be an array" });
    }

    // Return promises properly
    const update = episodes.map((ep) =>
      episode.findByIdAndUpdate(ep.id, { orderIndex: ep.orderIndex })
    );

    await Promise.all(update);

    res.json({
      success: true,
      message: "Episodes order saved successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteseries = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await Series.findByIdAndDelete(id);

    if (!response) {
      return res.status(400).json({ message: "Not found Episode" });
    }
    let seriesImage = response.coverImage.filePath;
    if (seriesImage) {
      await deleteFile(seriesImage);
    }
    return res.status(200).json({ message: "Series Deleted successfully" });
  } catch (error) {
    console.log("createseries.error", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const getserisbyId = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await Series.findById(id);
    const epi = await episode.find({ seriesId: id, isStandalone: false });
    const genrename = await GenreModel.findById(response.genre);
    const subjectname = await SubjectModel.findById(response.subject);

    if (!response) {
      return res.status(400).json({ message: "Not found Episode" });
    }
    if (!genrename) {
      return res.status(400).json({ message: "genrename details not found" });
    }
    if (!subjectname) {
      return res.status(401).json({ message: "subjectname details not found" });
    }
    if (!epi) {
      return res.status(401).json({ message: "episode details not found" });
    }
    let data = {
      id: response._id,
      // seriesno: response.seriesno,
      seriestitle: response.seriestitle,
      coverImage: response.coverImage,
      seriespart: response.seriespart,
      description: response.description,
      about: response.about,
      genreId: response.genre,
      subjectId: response.subject,
      genrename: genrename.genreName,
      subjectname: subjectname.subjectName,
    };
    return res.status(200).json(data);
  } catch (error) {
    console.log("getserisbyId.error", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const updateseries = async (req, res) => {
  const { id } = req.params;
  try {
    const {
      // seriesno,
      seriestitle,
      description,
      about,
      genre,
      subject,
      seriespart,
    } = req.body;

    const data = {
      // seriesno,
      seriestitle,
      description,
      about,
      genre,
      subject,
      seriespart,
      // coverImage: audioUpload.secure_url,
    };

    const getoladimage = await Series.findById(id);
    if (!getoladimage) {
      return res
        .status(400)
        .json({ message: "with This Id Series  not found" });
    }
    let coverimage = req.files?.coverImage;
    let imageupload;
    if (coverimage) {
      if (!coverimage || !coverimage.mimetype.startsWith("image/")) {
        return res
          .status(400)
          .json({ message: "Please upload a valid Image file." });
      }
      if (getoladimage.coverImage?.filePath) {
        await deleteFile(getoladimage.coverImage.filePath);
      }
      imageupload = await uploadFile(coverimage);
      data.coverImage = {
        fileUrl: imageupload.fileUrl,
        filePath: imageupload.filePath,
      };
    } else {
      data.coverImage = getoladimage.coverImage || null;
    }

    const response = await Series.findByIdAndUpdate(id, data, { new: true });
    return res
      .status(200)
      .json({ message: "Series updated successfullly", response });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
// create episode

const uploadAudeoFile = async (file) => {
  try {
    const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
      // folder: "Frameji/chapter",
      folder: "Frameji/audio",
      resource_type: "video",
    });
    return result;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Error uploading to Cloudinary.");
  }
};
export const createEpisode = async (req, res) => {
  const { id } = req.params;
  try {
    let {
      title,
      episodenumber,
      // seriesId,
      duration,

      description,
      about,

      // seasonNo,
      // isStandalone,
    } = req.body;
    const audioUrl = req.files?.audioUrl;
    const thumbnail = req.files?.thumbnail;

    if (!title || !episodenumber || !duration) {
      return res.status(400).json({ message: "Please fill the form" });
    }

    const getseries = await Series.findById(id);
    if (!getseries) {
      return res.status(400).json({ message: "Series not found" });
    }

    let subject = getseries.subject;
    let genre = getseries.genre;

    if (!audioUrl || !audioUrl.mimetype.startsWith("audio/")) {
      return res
        .status(400)
        .json({ message: "Please upload a valid audio file." });
    }
    if (!thumbnail || !thumbnail.mimetype.startsWith("image/")) {
      return res
        .status(400)
        .json({ message: "Please upload a valid Image file." });
    }
    const thumbnailImage = await uploadFile(thumbnail);
    const audioUpload = await uploadFile(audioUrl);

    const data = {
      title,
      episodenumber,
      audioUrl: {
        fileUrl: audioUpload.fileUrl,
        filePath: audioUpload.filePath,
      },
      duration,
      thumbnail: {
        fileUrl: thumbnailImage.fileUrl,
        filePath: thumbnailImage.filePath,
      },
      description,
      about,
      subject,
      genre,
      seriesId: getseries._id,
      seasonNo: getseries.seriespart,
      // isStandalone,
    };
    const response = await episode.create(data);
    return res.status(200).json(response);
  } catch (error) {
    console.log("createEpisode.error", error.message);
    return res.status(500).json({ message: error.message });
  }
};

// create episode

export const getepisode = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const skip = (page - 1) * limit;
    const { title } = req.query;
    let filter = { isStandalone: false };

    if (title && title.trim() !== "") {
      const words = title.trim().split(/\s+/);
      filter.$or = words.map((word) => ({
        title: { $regex: word, $options: "i" },
      }));
    }

    const response = await episode
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await episode.countDocuments(filter);

    const trendingDocs = await treading.find(
      {
        episodeId: { $in: response.map((ep) => ep._id) },
      },
      { episodeId: 1, isTreading: 1 }
    );
    const trendingMap = new Map(
      trendingDocs.map((t) => [String(t.episodeId), t])
    );
    const finalResponse = response.map((ep) => {
      const tDoc = trendingMap.get(String(ep._id));
      return {
        ...ep.toObject(),
        hasTrending: !!tDoc, // true if trending exists
        isTreading: tDoc ? tDoc.isTreading : false, // active/deactive
        trendingId: tDoc ? tDoc._id : null, // trending document id
      };
    });

    return res.status(200).json({
      data: finalResponse,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (error) {
    console.log("createseries.error", error.message);
    return res.status(500).json({ message: error.message });
  }
};

// delete episde;

export const deleteepisode = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await episode.findByIdAndDelete(id);
    if (!response) {
      return res.status(400).json({ message: "Not found Episode" });
    }
    let thumbnail = response.thumbnail.filePath;
    let audio = response.audioUrl.filePath;
    if (thumbnail) {
      await deleteFile(thumbnail);
    }
    if (audio) {
      await deleteFile(audio);
    }
    return res.status(200).json({ message: "Episode Deleted successfully" });
  } catch (error) {
    console.log("createseries.error", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const getepisodebyId = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await episode.findById({ _id: id, isStandalone: true });

    if (!response) {
      return res.status(400).json({ message: "Not found Episode" });
    }

    const subject = await SubjectModel.findById(response.subject);
    const sereisdata = await Series.findById(response.seriesId);

    if (!subject) {
      return res.status(401).json({ message: "subject data not found" });
    }
    const genre = await GenreModel.findById(response.genre);
    if (!genre) {
      return res.status(401).json({ message: "genre data not found" });
    }
    if (!sereisdata) {
      return res.status(401).json({ message: "Title data not found" });
    }
    let data = {
      id: response._id,
      title: response.title,
      episodenumber: response.episodenumber,
      audioUrl: response.audioUrl,

      duration: response.duration,
      thumbnail: response.thumbnail,
      description: response.description,
      about: response.about,
      seriesId: response.seriesId,
      // seasonNo: response.seasonNo || "null",
      seasonNodata: sereisdata.seriesno || "null",
      seriespart: sereisdata.seriespart,
      subjectId: response.subject,

      genreId: response.genre,
      // seriesId: seriedetails,
      subject: subject.subjectName,
      genre: genre.genreName,
      isStandalone: response.isStandalone,
    };

    return res.status(200).json(data);
  } catch (error) {
    console.log("createseries.error", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const updatepisode = async (req, res) => {
  const { id } = req.params;
  try {
    let {
      title,
      episodenumber,

      duration,

      description,
      about,
    } = req.body;

    const data = {
      title,
      episodenumber,

      duration,

      description,
      about,
    };
    const getOlddata = await episode.findById(id);
    if (!getOlddata) {
      return res.status(401).json({ message: "With Id Episode not found" });
    }

    let audio = getOlddata.audioUrl.filePath;
    let image = getOlddata.thumbnail.filePath;

    const audioUrl = req.files?.audioUrl;
    const thumbnail = req.files?.thumbnail;
    let audioUpload;
    let thumbnailImage;

    // auidoData
    if (audioUrl) {
      if (!audioUrl.mimetype.startsWith("audio/")) {
        return res
          .status(400)
          .json({ message: "Please upload a valid audio file." });
      }
      if (audio) {
        await deleteFile(audio);
      }
      audioUpload = await uploadFile(audioUrl);
      data.audioUrl = {
        fileUrl: audioUpload.fileUrl,
        filePath: audioUpload.filePath,
      };
    } else {
      data.audioUrl = getOlddata.audioUrl || null;
    }

    if (thumbnail) {
      if (!thumbnail || !thumbnail.mimetype.startsWith("image/")) {
        return res
          .status(400)
          .json({ message: "Please upload a valid Image file." });
      }
      if (image) {
        await deleteFile(image);
      }
      thumbnailImage = await uploadFile(thumbnail);
      data.thumbnail = {
        fileUrl: thumbnailImage.fileUrl,
        filePath: thumbnailImage.filePath,
      };
    } else {
      data.thumbnail = getOlddata.thumbnail || null;
    }

    const response = await episode.findByIdAndUpdate(id, data, { new: true });
    return res
      .status(200)
      .json({ message: "Episode updated successfullly", response });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// selected seriesbased on we have get the series under it

// export const getseriesSessions = async (req, res) => {
//   const { seriesId } = req.body;

//   try {
//     const response = await Series.findOne({ seriesno: seriesId });

//     if (!response) {
//       return res.status(401).json({ message: "seriesId data not found" });
//     }
//     const gen = await GenreModel.findById(response.genre);
//     const sub = await SubjectModel.findById(response.subject);
//     if (!gen) {
//       return res.status(401).json({ message: "genrename data not found" });
//     }
//     if (!sub) {
//       return res.status(401).json({ message: "subjectname data not found" });
//     }

//     const data = {
//       ...response._doc,
//       genrename: gen.genreName,
//       subjectname: sub.subjectName,
//     };
//     return res.status(200).json(data);
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };

export const getSeasonseries = async (req, res) => {
  try {
    const resp = await Series.find();
    if (!resp) {
      return res.stastus(400).json({ message: "Series data not found" });
    }
    return res.status(200).json(resp);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// createseasons;
