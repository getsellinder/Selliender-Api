import { formatDateToIST } from "../../Utils/formatDateToIST .js";
import { deleteFile, uploadFile } from "../../Utils/uploadeFile.js";

import { notification } from "../notificaiton/Notifications.model.js";
import { episode, Series } from "../series/SeriesModel.js";

import { treading } from "./Trading.model.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import relativeTime from "dayjs/plugin/relativeTime.js";

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

export const createTrading = async (req, res) => {
  const { id } = req.params;
  try {
    const { content } = req.body;
    const image = req.files.image;

    const title = await Series.findById(id);
    const episod = await episode.findById(id);
    let genreId;
    let subgeneId;
    let titleId = null;
    let episodeId = null;
    if (title) {
      genreId = title.genre;
      subgeneId = title.subject;
      titleId = title.id;
    }
    if (episod) {
      genreId = episod.genre;
      subgeneId = episod.subject;
      episodeId = episod.id;
    }

    if (!image || !image.mimetype.startsWith("image/")) {
      return res
        .status(400)
        .json({ message: "Please upload a valid Image file." });
    }
    const imageupload = await uploadFile(image);
    const data = {
      content,
      genre: genreId,
      subgenre: subgeneId,
      episodeId,
      titleId,
      image: {
        fileUrl: imageupload.fileUrl,
        filePath: imageupload.filePath,
      },
    };
    const result = await treading.create(data);
    const notifiy = {
      trendingId: result._id,
      notifymodel: "trending",
    };
    await notification.create(notifiy);
    return res.status(200).json({
      message: `A new ${
        title ? "Title" : "Episode"
      }Successfully Created Trending`,
      result,
    });
  } catch (error) {
    console.log("error.createTrading", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const updateTrading = async (req, res) => {
  const { id } = req.params; // treading id
  try {
    const { content } = req.body;
    const image = req.files?.image;

    const title = await Series.findById(id);
    const episod = await episode.findById(id);
    const getoldata = await treading.findById(id);
    if (!getoldata) {
      return res
        .status(401)
        .json({ message: "Trending not found with this id" });
    }
    const oldimage = getoldata.image.filePath;
    let genreId;
    let subgeneId;
    let titleId = null;
    let episodeId = null;
    if (title) {
      genreId = title.genre;
      subgeneId = title.subject;
      titleId = title.id;
    }
    if (episod) {
      genreId = episod.genre;
      subgeneId = episod.subject;
      episodeId = episod.id;
    }
    let imageupload;

    const data = {
      content,
      genre: genreId,
      subgenre: subgeneId,
      episodeId,
      titleId,
    };

    if (image) {
      if (!image || !image.mimetype.startsWith("image/")) {
        return res
          .status(400)
          .json({ message: "Please upload a valid Image file." });
      }
      if (oldimage) {
        await deleteFile(oldimage);
      }
      imageupload = await uploadFile(image);
      data.image = {
        fileUrl: imageupload.fileUrl,
        filePath: imageupload.filePath,
      };
    } else {
      data.image = getoldata.image || null;
    }

    const result = await treading.findByIdAndUpdate(id, data, { new: true });

    return res.status(200).json({
      message: `A new ${title ? "Title" : "Episode"} is Updated Sccessfully! `,
      result,
    });
  } catch (error) {
    console.log("error.updateTrading", error.message);
    return res.status(500).json({ message: error.message });
  }
};
export const getAllTradings = async (req, res) => {
  try {
    const { isTreading, title } = req.query;
    let page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    let skip = (page - 1) * limit;

    const filter = {};

    if (isTreading === undefined) {
      filter.isTreading = true;
    } else {
      filter.isTreading = isTreading === "true";
    }
    if (title) {
      const matchingEpisodes = await episode.find(
        {
          title: { $regex: title, $options: "i" },
        },
        "_id"
      );
      const matchingSeries = await Series.find(
        { seriestitle: { $regex: title, $options: "i" } },
        "_id"
      );
      filter.$or = [
        { episodeId: { $in: matchingEpisodes } },
        { titleId: { $in: matchingSeries } },
      ];
    }

    const total = await treading.countDocuments(filter);
    const getTradings = await treading
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("genre", "genreName")
      .populate("subgenre", "subjectName")
      .populate("titleId", "seriestitle")
      .populate("episodeId", "title");
    if (getTradings.length === 0) {
      return res.status(404).json({
        message: `${
          isTreading === filter.isTreading
            ? "No Trending Active Now"
            : "No Trending Deactive Now"
        }`,
      });
    }
    const data = getTradings.map((t) => ({
      t,
      createdAt: formatDateToIST(t.createdAt),
      updatedAt: formatDateToIST(t.updatedAt),
    }));

    return res.status(200).json({
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (error) {
    console.log("error.getALlTradings", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const getAllTradingsForApp = async (req, res) => {
  try {
    const getTradings = await treading
      .find({ isTreading: true })
      .sort({ createdAt: -1 })

      .limit(10)
      .populate("genre", "genreName")
      .populate("subgenre", "subjectName")
      .populate("titleId", "seriestitle")
      .populate("episodeId", "title");
    if (getTradings.length === 0) {
      return res.status(404).json({ message: "Trending not found" });
    }
    const data = getTradings.map((t) => ({
      t,
      createdAt: formatDateToIST(t.createdAt),
      updatedAt: formatDateToIST(t.updatedAt),
    }));

    return res.status(200).json(data);
  } catch (error) {
    console.log("error.getALlTradings", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const getByIdTrading = async (req, res) => {
  try {
    const { id } = req.params; // treading id
    const getTreading = await treading
      .findById(id)
      .populate("genre", "genreName")
      .populate("subgenre", "subjectName")
      .populate("titleId", "seriestitle")
      .populate("episodeId", "title");
    if (!getTreading) {
      return res
        .status(404)
        .json({ message: "With This id trending data not found" });
    }

    return res.status(200).json(getTreading);
  } catch (error) {
    console.log("error.getByIdTrading", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const deleteTrading = async (req, res) => {
  try {
    const { id } = req.params;
    const gettreading = await treading.findById(id);
    const dleimage = gettreading.image.filePath;
    if (!gettreading) {
      return res
        .status(404)
        .json({ message: "With this Id trending not found" });
    }
    if (dleimage) {
      await deleteFile(dleimage);
    }
    await treading.findByIdAndDelete(id);
    await notification.findOneAndDelete({ trendingId: id });
    return res.status(200).json({
      message: "Trending data && notification data  Deleted Successfully",
    });
  } catch (error) {
    console.log("error.deleteTrading", error.message);
    return res.status(500).json({ message: error.message });
  }
};

// make the toggle function
export const MakeTreading = async (req, res) => {
  try {
    const { id } = req.params; //treading id
    const { isTreading } = req.body;
    const gettreading = await treading.findById(id);
    if (!gettreading) {
      return res
        .status(404)
        .json({ message: "With this id Trending not found " });
    }
    const updateTreading = await treading.findByIdAndUpdate(
      id,
      { isTreading },
      {
        new: true,
      }
    );
    const updateNotify = await notification.findOneAndUpdate(
      {
        trendingId: id,
      },
      { isActive: isTreading },
      { new: true }
    );
    return res.status(200).json({
      message:
        isTreading === true
          ? "Activated Successfully"
          : "Deactivated Successfully",
      treading: updateTreading,
      notification: updateNotify,
    });
  } catch (error) {
    console.log("MakeTreading.error", error);
    return res.status(500).json({ message: error.message });
  }
};
// get treading notifications

export const getTreadingNotifications = async (req, res) => {
  try {
    const getTreadingNotification = await notification
      .find({
        notifymodel: "trending",
        isActive: true,
      })
      .populate({
        path: "trendingId",
        populate: [
          { path: "genre", select: "genreName" },
          { path: "subgenre", select: "subjectName" },
          { path: "titleId", select: "seriestitle" },
          { path: "episodeId", select: "title" },
        ],
      })
      .sort({ createdAt: -1 });
    if (getTreadingNotification.length === 0) {
      return res
        .status(404)
        .json({ message: "Trending notification not found" });
    }
    // const formattedNotifications = getTreadingNotification.map((item) => ({
    //   ...item.toObject(),
    //   timeAgo: dayjs(item.createdAt).fromNow(),
    //   formattedDate: dayjs(item.createdAt).format("DD MMM YYYY, hh:mm A"),
    // }));

    const formattedNotifications = getTreadingNotification.map((item) => {
      const createdAt = dayjs(item.createdAt).tz("Asia/Kolkata");
      const diffSeconds = dayjs().tz("Asia/Kolkata").diff(createdAt, "second");
      const diffMinutes = dayjs().tz("Asia/Kolkata").diff(createdAt, "minute");
      const diffHours = dayjs().tz("Asia/Kolkata").diff(createdAt, "hour");
      const diffDays = dayjs().tz("Asia/Kolkata").diff(createdAt, "day");

      let exactTimeAgo = "";
      if (diffSeconds < 60) {
        exactTimeAgo = `${diffSeconds} sec ago`;
      } else if (diffMinutes < 60) {
        exactTimeAgo = `${diffMinutes} min ago`;
      } else if (diffHours < 24) {
        exactTimeAgo = `${diffHours} hr ago`;
      } else {
        exactTimeAgo = `${diffDays} days ago`;
      }

      return {
        ...item.toObject(),
        timeAgo: exactTimeAgo,
        formattedDate: createdAt.format("DD MMM YYYY, hh:mm A"),
      };
    });
    return res.status(200).json(formattedNotifications);
  } catch (error) {
    console.log("error.getTreadingNotification", error);
    return res.status(500).json({ message: error.message });
  }
};
