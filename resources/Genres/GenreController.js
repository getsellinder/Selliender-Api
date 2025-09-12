import mongoose from "mongoose";
import cloudinary from "../../Utils/cloudinary.js";
import { GenreModel } from "./GenreModel.js";
import { Chapter } from "../Chapter/ChapterModel.js";
import { SubjectModel } from "../Subjects/SubjectModel.js";
import { episode, Series } from "../series/SeriesModel.js";
import { deleteFile, uploadFile } from "../../Utils/uploadeFile.js";

// Add new Genre
export const addGenre = async (req, res) => {
  if (!req?.user) return res.status(400).json({ message: "please login !" });
  try {
    if (!mongoose.Types.ObjectId.isValid(req.user._id)) {
      return res.status(400).json({ message: "please login again " });
    }
    const { genreName } = req.body;
    const { genreImage } = req.files;
    console.log("genreImage", genreImage);
    const result = await uploadFile(genreImage);
    const genre = await GenreModel.create({
      genreName,
      // subjectId,
      genreImage: {
        fileUrl: result.fileUrl,
        filePath: result.filePath,
        uploadId: result.uploadId,
      },
      addedBy: req.user._id,
    });

    return res
      .status(201)
      .json({ success: true, genre, message: "genre Added" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};

// get subject by genrename
export const getsubjectbygenrename = async (req, res) => {
  try {
    const { genreId } = req.body;
    const findg = await GenreModel.findById(genreId);

    if (!findg) {
      return res.status(500).json({ message: "genreName not found" });
    }
    const getsubjects = await SubjectModel.find({
      _id: { $in: findg.subjectId },
    });
    if (!getsubjects || getsubjects.length === 0) {
      return res.status(500).json({ message: "subject not found" });
    }
    const subjectsWithGenre = getsubjects.map((subject) => ({
      ...subject._doc,
      genreName: findg.genreName,
      genreId: findg._id,
    }));

    return res.status(200).json(subjectsWithGenre);
  } catch (error) {
    console.log("error in getsubjectbygenrename", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const updateGenre = async (req, res) => {
  try {
    const { _id } = req.params;

    const { genreName } = req.body;
    let data = {
      genreName,
    };

    const genreImage = req.files?.genreImage;
    const getOldImage = await GenreModel.findById(_id);
    if (!getOldImage) {
      return res.status(401).json({ message: "With Id banner not found" });
    }
    let oldImage = getOldImage.genreImage.filePath;
    let imageupload;
    if (genreImage) {
      if (oldImage) {
        await deleteFile(oldImage);
      }
      imageupload = await uploadFile(genreImage);
      data.genreImage = {
        fileUrl: imageupload.fileUrl,
        filePath: imageupload.filePath,
      };
    } else {
      data.genreImage = getOldImage.genreImage || null;
    }
    const update = await GenreModel.findByIdAndUpdate(_id, data, { new: true });

    return res
      .status(200)
      .json({ message: "Genre updated Successfullly", update });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const deleteGenre = async (req, res) => {
  try {
    if (!req?.user) return res.status(400).json({ message: "please login !" });
    const { _id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(404).json({ error: "Can not find the document " });
    }

    const deletefromByteScale = await GenreModel.findOne({ _id: _id });
    const delimage = deletefromByteScale.genreImage.filePath;
    await deleteFile(delimage);
    const deletegenre = await GenreModel.findOneAndDelete({ _id });
    if (!deletegenre) {
      return res.status(404).json({
        message: "Cannot find the document with the provided ID to delete",
      });
    }
    return res
      .status(200)
      .json({ success: true, message: "Genre Deleted Successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went wrong",
    });
  }
};

// Explore All Genres
export const getAllGenres = async (req, res) => {
  try {
    const genresdata = await GenreModel.find().sort({
      createdAt: -1,
    });

    if (!genresdata) {
      return res.status(404).json({ message: "No genres found" });
    }
    const genres = await Promise.all(
      genresdata.map(async (gen) => {
        const subgenreCount = await SubjectModel.countDocuments({
          genreId: gen._id,
        });

        const istDateTime = new Date(gen.createdAt).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          // second: "2-digit",
          hour12: true,
        });
        const istupdateTime = new Date(gen.updatedAt).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          // second: "2-digit",
          hour12: true,
        });
        return {
          ...gen._doc,
          subgenreCount,
          createdAtIST: istDateTime,
          updatedAt: istupdateTime,
        };
      })
    );

    res.status(200).json({ success: true, genres });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went wrong",
    });
  }
};

export const getAllsubgenre = async (req, res) => {
  const { id } = req.params; //genre id
  try {
    const trimmedId = id.trim();
    if (!mongoose.Types.ObjectId.isValid(trimmedId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid genre ID format",
      });
    }

    const respdata = await SubjectModel.find({ genreId: trimmedId });
    let resp = [];

    if (!respdata || respdata.length === 0) {
      return res
        .status(404)
        .json({ message: "No subgenre found for this genreId" });
    }

    for (let ge of respdata) {
      const getgenrename = await GenreModel.findById(id);
      resp.push({
        ...ge._doc,
        genrame: getgenrename.genreName,
      });
    }

    return res.status(200).json(resp);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went wrong",
    });
  }
};

// GENRE SCREEN

export const getsubgenrwithsubjectname = async (req, res) => {
  try {
    // if (!req?.user) return res.status(400).json({ message: "please login !" });
    const genresdata = await GenreModel.find().sort({
      createdAt: -1,
    });

    if (!genresdata) {
      return res.status(404).json({ message: "No genres found" });
    }

    const genres = [];
    for (let su of genresdata) {
      const getsubject = await SubjectModel.findById(su.subjectId);

      genres.push({
        ...su._doc,
        subjectname: getsubject?.subjectName || "not-mention",
        subjectId: getsubject?._id || "not-mention",
      });
    }

    res.status(200).json({ success: true, genres });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went wrong",
    });
  }
};

// SUB-GENRE SCREEN

export const Genrescreen = async (req, res) => {
  try {
    const { id } = req.params;

    const gen = await Series.find({ genre: id });

    // const episodes = await episode.find({ genre: id });

    if (!gen || gen.length === 0) {
      return res.status(400).json({ message: "genre  Not found" });
    }

    const grouped = {};

    // Handle Series
    for (const chapter of gen) {
      const subject = await SubjectModel.findById(chapter.subject).select(
        "subjectName subjectImage"
      );

      const Genretitle = await GenreModel.findById(chapter.genre);
      const seriesEpisodes = await episode.find({ seriesId: chapter._id });
      const item = {
        Id: chapter._id,
        subgenreId: chapter.subject,
        seriestitle: chapter.seriestitle,
        description: chapter.description,
        seriespart: chapter.seriespart,
        image: chapter.coverImage,
        subgenre: subject?.subjectName || "Unknown",
        Genretitle: Genretitle?.genreName,
        episodelength: seriesEpisodes.length,

        type: "series",
        episodes: seriesEpisodes.map((ep) => ({
          id: ep._id,
          title: ep.title,
          duration: ep.duration,
          episodenumber: ep.episodenumber,
          thumbnail: ep.thumbnail,
          description: ep.description,
          about: ep.about,
          audioUrl: ep.audioUrl,
        })),
      };

      if (!grouped[item.subgenre]) {
        grouped[item.subgenre] = [];
      }
      grouped[item.subgenre].push(item);
    }

    const result = Object.keys(grouped).map((subgenre) => ({
      subgenre,
      series: grouped[subgenre],
    }));
    return res.status(200).json(result);
  } catch (error) {
    console.log("Error in Genrescreen", error.message);
    return res.status(500).json({ message: error.message });
  }
};
export const Subgenrescreen = async (req, res) => {
  try {
    const { id } = req.params;

    const gen = await Series.find({ subject: id });
    // const episodes = await episode.find({ subject: id, isStandalone: true });

    if (!gen || gen.length === 0) {
      return res.status(400).json({ message: "genre Not found" });
    }

    const grouped = {};

    // Handle Series
    for (const chapter of gen) {
      const subject = await SubjectModel.findById(chapter.subject).select(
        "subjectName subjectImage"
      );

      const Genretitle = await GenreModel.findById(chapter.genre);
      const seriesEpisodes = await episode.find({ seriesId: chapter._id });
      const item = {
        Id: chapter._id,
        subgenreId: chapter.subject?._id || chapter.subject,
        seriestitle: chapter.seriestitle,
        description: chapter.description,
        image: chapter.coverImage,
        subgenre: subject?.subjectName || "Unknown",
        Genretitle: Genretitle?.genreName,
        episodelength: seriesEpisodes.length,
        type: "series",
        episodes: seriesEpisodes.map((ep) => ({
          id: ep._id,
          title: ep.title,
          duration: ep.duration,
          thumbnail: ep.thumbnail,
          description: ep.description,
          about: ep.about,
          audioUrl: ep.audioUrl,
        })),
      };

      if (!grouped[item.subgenre]) {
        grouped[item.subgenre] = [];
      }
      grouped[item.subgenre].push(item);
    }

    const result = Object.keys(grouped).map((subgenre) => ({
      subgenre,
      series: grouped[subgenre],
    }));
    return res.status(200).json(result);
  } catch (error) {
    console.log("Error in Subgenrescreen", error.message);
    return res.status(500).json({ message: error.message });
  }
};

// export const homescreen = async (req, res) => {
//   try {
//     const allSeries = await Series.find().sort({ createdAt: -1 });
//     // const allStandaloneEpisodes = await episode.find({ isStandalone: true });

//     if (!allSeries || allSeries.length === 0) {
//       return res.status(400).json({ message: "Series Not found" });
//     }

//     const grouped = {};

//     // Handle Series
//     for (const chapter of allSeries) {
//       const genre = await GenreModel.findById(chapter.genre).select(
//         "genreName genreImage"
//       );

//       const subject = await SubjectModel.findById(chapter.subject).select(
//         "subjectName subjectImage"
//       );

//       const seriesEpisodes = await episode.find({ seriesId: chapter._id });
//       // console.log("chapter", chapter);
//       const item = {
//         Id: chapter._id,
//         subgenreId: chapter.subject,
//         seriespart: chapter.seriespart,
//         seriestitle: chapter.seriestitle,
//         description: chapter.description,
//         image: chapter.coverImage,
//         subgenre: subject?.subjectName || "Unknown",
//         Genretitle: genre?.genreName,
//         type: "series",
//         episodes: seriesEpisodes.map((ep) => ({
//           id: ep._id,
//           title: ep.title,
//           duration: ep.duration,
//           thumbnail: ep.thumbnail,
//           description: ep.description,
//           about: ep.about,
//           audioUrl: ep.audioUrl,
//         })),
//       };
//       const genreId = genre?._id?.toString() || null;
//       const genreImage = genre?.genreImage || null;
//       const genreTitle = genre?.genreName || "Unknown Genre";

//       const subgenreTitle = subject.subjectName || "Unknown Subgenre";

//       // if (!grouped[genreTitle]) {
//       //   grouped[genreTitle] = {};
//       // }
//       if (!grouped[genreTitle]) {
//         grouped[genreTitle] = {
//           genreId,
//           genreName: genreTitle,
//           genreImage,
//           subgenres: {},
//         };
//       }

//       if (!grouped[genreTitle][subgenreTitle]) {
//         grouped[genreTitle][subgenreTitle] = {
//           subgenreId: chapter.subject,
//           subgenreName: subgenreTitle,
//           subgenreImage: subject?.subjectImage,
//           series: [],
//         };
//       }
//       grouped[genreTitle].subgenre[subgenreTitle].series.push(item);
//       // grouped[item.Genretitle].push(item);
//     }

//     const result = Object.keys(grouped).map((genreObj) => ({
//       genreId: genreObj.genreId,
//       genreName: genreObj.genreName,
//       genreImage: genreObj.genreImage,
//       subgenres: Object.values(genreObj.subgenres),
//       // genre: genreTitle,

//       // subgenres: Object.values(grouped[genreTitle]),
//     }));
//     return res.status(200).json(result);
//   } catch (error) {
//     console.log("error in homescreen", error.message);
//     return res.status(500).json({ message: error.message });
//   }
// };
//SERIES SCREEN

export const homescreen = async (req, res) => {
  try {
    const allSeries = await Series.find().sort({ createdAt: -1 });

    if (!allSeries || allSeries.length === 0) {
      return res.status(400).json({ message: "Series Not found" });
    }

    const grouped = {};

    // Handle Series
    for (const chapter of allSeries) {
      const genre = await GenreModel.findById(chapter.genre).select(
        "genreName genreImage"
      );

      const subject = await SubjectModel.findById(chapter.subject).select(
        "subjectName subjectImage"
      );

      const seriesEpisodes = await episode.find({ seriesId: chapter._id });

      const item = {
        Id: chapter._id,
        subgenreId: chapter.subject,
        seriespart: chapter.seriespart,
        seriestitle: chapter.seriestitle,
        description: chapter.description,
        image: chapter.coverImage,
        subgenre: subject?.subjectName || "Unknown",
        Genretitle: genre?.genreName,
        episodelength: seriesEpisodes.length,
        type: "series",
        episodes: seriesEpisodes.map((ep) => ({
          id: ep._id,
          title: ep.title,
          duration: ep.duration,
          thumbnail: ep.thumbnail,
          description: ep.description,
          about: ep.about,
          audioUrl: ep.audioUrl,
        })),
      };

      const genreId = genre?._id?.toString() || null;
      const genreImage = genre?.genreImage.fileUrl || null;
      const genreTitle = genre?.genreName || "Unknown Genre";

      const subgenreTitle = subject?.subjectName || "Unknown Subgenre";

      // Ensure genre structure
      if (!grouped[genreTitle]) {
        grouped[genreTitle] = {
          genreId,
          genreName: genreTitle,
          genreImage,
          subgenres: {},
        };
      }

      // Ensure subgenre under genre
      if (!grouped[genreTitle].subgenres[subgenreTitle]) {
        grouped[genreTitle].subgenres[subgenreTitle] = {
          subgenreId: chapter.subject,
          subgenreName: subgenreTitle,
          subgenreImage: subject?.subjectImage,
          series: [],
        };
      }

      // Push series into subgenre
      grouped[genreTitle].subgenres[subgenreTitle].series.push(item);
    }

    // Now map over values instead of keys
    const result = Object.values(grouped).map((genreObj) => ({
      genreId: genreObj.genreId,
      genreName: genreObj.genreName,
      genreImage: genreObj.genreImage,
      subgenres: Object.values(genreObj.subgenres),
    }));

    return res.status(200).json(result);
  } catch (error) {
    console.log("error in homescreen", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const seriesScreen = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Try to find the series by ID
    const foundSeries = await Series.findById(id);
    if (!foundSeries) {
      return res.status(400).json({ message: "Series data not found" });
    }

    const episodes = await episode.find({ seriesId: id });
    const Genretitle = await GenreModel.findById(foundSeries.genre);
    const subjecttitle = await SubjectModel.findById(foundSeries.subject);

    return res.status(200).json({
      type: "series",
      data: {
        seriesId: foundSeries._id,
        seriestitle: foundSeries.seriestitle,
        episodelength: episodes.length,
        // seriesno: foundSeries?.seriesno,
        coverImage: foundSeries.coverImage,
        subgenre: subjecttitle.subjectName,
        genre: Genretitle.genreName,
        description: foundSeries.description,
        about: foundSeries.about,
        episodes: episodes.map((ep) => ({
          _id: ep._id,
          title: ep.title,
          duration: ep.duration,
          audioUrl: ep.audioUrl,
          thumbnail: ep.thumbnail,
          description: ep.description,
          about: ep.about,
          subject: subjecttitle.subjectName,
          genre: Genretitle.genreName,
        })),
      },
    });

    // 2. Try to find the episode by ID
    // const foundEpisode = await episode.findById(id);
    // if (foundEpisode) {
    //   const Genretitle = await GenreModel.findById(foundEpisode.genre);
    //   const subjecttitle = await SubjectModel.findById(foundEpisode.subject);

    //   return res.status(200).json({
    //     type: "episode",
    //     data: {
    //       episodeId: foundEpisode._id,
    //       title: foundEpisode.title,
    //       duration: foundEpisode.duration,
    //       audioUrl: foundEpisode.audioUrl,
    //       thumbnail: foundEpisode.thumbnail,
    //       description: foundEpisode.description,
    //       about: foundEpisode.about,
    //       subject: subjecttitle.subjectName,
    //       genre: Genretitle.genreName,
    //       seriesId: foundEpisode.seriesId || null,
    //       isStandalone: foundEpisode.isStandalone,
    //     },
    //   });
    // }
    return res
      .status(404)
      .json({ message: "No series or episode found with the given ID." });
  } catch (error) {
    console.log("error in seriesScreen", error.message);
    return res.status(500).json({ message: error.message });
  }
};

// Player Controls

export const playercontrols = async (req, res) => {
  try {
    const { id } = req.params;
    const episodedata = await episode.findById(id);
    const Genretitle = await GenreModel.findById(episodedata.genre);
    const subjecttitle = await SubjectModel.findById(episodedata.subject);

    const data = {
      episodeId: episodedata._id,
      title: episodedata.title,
      duration: episodedata.duration,
      audioUrl: episodedata.audioUrl,
      thumbnail: episodedata.thumbnail,
      description: episodedata.description,
      about: episodedata.about,
      subgenre: subjecttitle.subjectName,
      genre: Genretitle.genreName,
      seriesId: episodedata.seriesId || null,
      genreId: Genretitle._id,
      subjectId: subjecttitle._id,
      isStandalone: episodedata.isStandalone,
    };
    if (episodedata.isStandalone && episodedata.seriesId) {
      const seriedata = await Series.findById(episodedata.seriesId);
      if (seriedata) {
        data.seriestitle = seriedata.seriestitle;
        data.seriesabout = seriedata.about;
        data.seriespart = seriedata.seriespart;
      }
    }
    return res.status(200).json(data);
  } catch (error) {
    console.log("error in playercontrols", error.message);
    return res.status(500).json({ message: error.message });
  }
};
// AllGenreScreenData

export const AllGenreScreenData = async (req, res) => {
  try {
    const gen = await Series.find();

    if (!gen || gen.length === 0) {
      return res.status(400).json({ message: "genre data Not found" });
    }

    const grouped = {};

    for (const chapter of gen) {
      const subject = await SubjectModel.findById(chapter.subject).select(
        "subjectName subjectImage"
      );
      const Genretitle = await GenreModel.findById(chapter.genre);
      const seriesEpisodes = await episode.find({ seriesId: chapter._id });
      const item = {
        Id: chapter._id,
        subgenreId: chapter.subject,
        seriestitle: chapter.seriestitle,
        description: chapter.description,
        seriespart: chapter.seriespart,
        image: chapter.coverImage,
        subgenre: subject?.subjectName || "Unknown",
        Genretitle: Genretitle?.genreName,

        type: "series",
        episodes: seriesEpisodes.map((ep) => ({
          id: ep._id,
          title: ep.title,
          duration: ep.duration,
          thumbnail: ep.thumbnail,
          description: ep.description,
          about: ep.about,
          audioUrl: ep.audioUrl,
        })),
      };

      if (!grouped[item.subgenre]) {
        grouped[item.subgenre] = [];
      }
      grouped[item.subgenre].push(item);
    }

    const result = Object.keys(grouped).map((subgenre) => ({
      subgenre,
      series: grouped[subgenre],
    }));
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createsubgenreundergenre = async (req, res) => {
  try {
    const { id } = req.params;
    const { subjectName } = req.body;
    const { subjectImage } = req.files;

    const genre = await GenreModel.findById(id);
    if (!genre) {
      return res.status(401).json({ message: "Genre Id not found" });
    }
    if (!req.files || !req.files.subjectImage) {
      return res.status(400).json({ message: "Subject image is required" });
    }
    const imageupload = await uploadFile(subjectImage);

    if (!imageupload?.secure_url) {
      return res
        .status(500)
        .json({ message: "Failed to upload image to Cloudinary" });
    }

    const subject = await SubjectModel.create({
      subjectName,
      genreId: id,
      subjectImage: {
        public_id: imageupload.public_id,
        url: imageupload.secure_url,
      },
      addedBy: req.user._id,
    });
    return res.status(201).json({
      success: true,
      subject,
      message: "Subject added successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: `Subject with name ${req.body.subjectName} already exists`,
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};
