import LibraryModel from "./Myligrarymodel.js";
// MY LIBRARY SCREEN

export const addlibrary = async (req, res) => {
  try {
    const { id } = req.params;

    const userId = req.user._id;

    // 1. Try to find the series by ID
    const foundSeries = await Series.findById(id);

    let data;
    if (foundSeries) {
      const libraryDoc = await LibraryModel.findOne({ userId });
      const isDuplicate = libraryDoc?.library?.some(
        (item) => item.seriesId && item.seriesId.toString() === id
      );

      if (isDuplicate) {
        return res
          .status(400)
          .json({ message: "Already has series with this series Id" });
      }
      data = {
        type: "series",
        seriesId: foundSeries._id,
        seriestitle: foundSeries.seriestitle,
        thumbnail: foundSeries.coverImage.fileUrl,
        about: foundSeries.seriesabout,
        seriespart: foundSeries.seriespart,
        genre: foundSeries.genre,
        subject: foundSeries.subject,
        // seriesno: foundSeries.seriesno,
      };
    }

    // 2. Try to find the episode by ID
    const foundEpisode = await episode.findById(id);
    if (foundEpisode) {
      const libraryDoc = await LibraryModel.findOne({ userId });
      const isDuplicate = libraryDoc?.library?.some(
        (item) => item.episodeId && item.episodeId.toString() === id
      );

      if (isDuplicate) {
        return res
          .status(400)
          .json({ message: "Already has episode with this episode Id" });
      }
      data = {
        type: "episode",
        title: foundEpisode.title,
        episodenumber: foundEpisode.episodenumber,
        episodeId: foundEpisode._id,
        audioUrl: foundEpisode.audioUrl.fileUrl,
        duration: foundEpisode.duration,
        thumbnail: foundEpisode.thumbnail.fileUrl,
        description: foundEpisode.description,
        about: foundEpisode.about,
        subject: foundEpisode.subject,
        genre: foundEpisode.genre,
        seriesId: foundEpisode.seriesId || null,
        isStandalone: foundEpisode.isStandalone,
      };
    }
    const result = await LibraryModel.updateOne(
      { userId },
      { $push: { library: data } },
      { upsert: true }
    );
    return res.status(200).json({ message: "Added to library successfully" });
  } catch (error) {
    console.log("error.addlibrary", error.message);
    return res.status(500).json({ message: error.message });
  }
};
export const getlibrary = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(402).json({ message: "Login details not found" });
    }
    const userId = req.user._id;

    let result = await LibraryModel.findOne({ userId }).select("library");
    if (!result) {
      return res
        .status(404)
        .json({ message: "Library not found for this user" });
    }
    const sortedLibrary = result.library.sort((a, b) => {
      const aTime = new Date(a.listenedAt || a._id.getTimestamp());
      const bTime = new Date(b.listenedAt || b._id.getTimestamp());
      return bTime - aTime;
    });

    if (sortedLibrary.length === 0) {
      return res.status(500).json({
        message: "No content available to Library for this request.",
      });
    }

    return res.status(200).json({ library: sortedLibrary });
  } catch (error) {
    console.log("error.getlibrary", error.message);
    return res.status(500).json({ message: error.message });
  }
};
export const deletelibrary = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    let libraryDoc = await LibraryModel.findOne({
      userId,
      "library._id": id,
    });
    if (!libraryDoc) {
      return res
        .status(401)
        .json({ message: "No libary entry found with this ID" });
    }
    let result = await LibraryModel.updateOne(
      { userId },
      { $pull: { library: { _id: id } } }
    );
    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: `Item with ID ${id} not found in library` });
    }
    return res
      .status(200)
      .json({ message: "Library item removed successfully" });
  } catch (error) {
    console.log("error.deletelibrary", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const addlistenhistory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // 1. Try to find the series by ID
    const foundSeries = await Series.findById(id);

    let data;
    if (foundSeries) {
      data = {
        type: "series",
        seriesId: foundSeries._id,
        seriestitle: foundSeries.seriestitle,
        thumbnail: foundSeries.coverImage.fileUrl,
        about: foundSeries.seriesabout,
        seriespart: foundSeries.seriespart,
        genre: foundSeries.genre,
        subject: foundSeries.subject,
        // seriesno: foundSeries.seriesno,
      };
    }

    // 2. Try to find the episode by ID
    const foundEpisode = await episode.findById(id);
    if (foundEpisode) {
      data = {
        refId: foundEpisode._id,
        title: foundEpisode.title,
        episodenumber: foundEpisode.episodenumber,
        episodeId: foundEpisode._id,
        audioUrl: foundEpisode.audioUrl.fileUrl,
        duration: foundEpisode.duration,
        thumbnail: foundEpisode.thumbnail.fileUrl,
        description: foundEpisode.description,
        about: foundEpisode.about,
        subject: foundEpisode.subject,
        genre: foundEpisode.genre,
        seriesId: foundEpisode.seriesId || null,
        isStandalone: foundEpisode.isStandalone,
      };
    }
    const result = await LibraryModel.updateOne(
      { userId },
      { $addToSet: { listenHistory: data } },
      { upsert: true }
    );
    return res
      .status(200)
      .json({ message: "Added to listenhistory successfully" });
  } catch (error) {
    console.log("error in addlistenhistory", error.message);
    return res.status(500).json({ message: error.message });
  }
};
export const getlistenhistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    let result = await LibraryModel.findOne({ userId }).select("listenHistory");
    if (!result) {
      return res
        .status(404)
        .json({ message: "listenHistory not found for this user" });
    }
    const filter = result.listenHistory.filter((item) => {
      return new Date(item.listenedAt) >= oneMonthAgo;
    });
    filter.sort((a, b) => new Date(b.listenedAt) - new Date(a.listenedAt));
    const limited = filter.slice(0, 50);

    if (limited.length === 0) {
      return res.status(500).json({
        message: "No content available to Listen History for this request.",
      });
    }
    return res.status(200).json({
      message: "Showing recent 50 or 1-month listen history items",
      listenHistory: limited,
    });
  } catch (error) {
    console.log("error.getlistenhistory", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const deletelistenhistory = async (req, res) => {
  try {
    const { id } = req.params; //listenHistory id which in the object
    const userId = req.user._id;
    let libraryDoc = await LibraryModel.findOne({
      userId,
      "listenHistory._id": id,
    });
    if (!libraryDoc) {
      return res.status(401).json({
        message: "No listen history entry found with this ID",
      });
    }

    let result = await LibraryModel.updateOne(
      { userId },
      { $pull: { listenHistory: { _id: id } } }
    );
    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: `Item with ID ${id} not found in library` });
    }
    return res
      .status(200)
      .json({ message: "listenHistory item removed successfully" });
  } catch (error) {
    console.log("error.deletelistenhistory", error.message);
    return res.status(500).json({ message: error.message });
  }
};
// MY DOWNLOADS
export const adddownloads = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // 1. Try to find the series by ID
    const foundSeries = await Series.findById(id);

    let data;
    if (foundSeries) {
      const libraryDoc = await LibraryModel.findOne({ userId });
      const isDuplicate = libraryDoc?.downloads?.some(
        (item) => item.seriesId && item.seriesId.toString() === id
      );

      if (isDuplicate) {
        return res
          .status(400)
          .json({ message: "Already This series was downloaded" });
      }

      data = {
        type: "series",
        seriesId: foundSeries._id,
        seriestitle: foundSeries.seriestitle,
        thumbnail: foundSeries.coverImage.fileUrl,
        about: foundSeries.seriesabout,
        seriespart: foundSeries.seriespart,
        genre: foundSeries.genre,
        subject: foundSeries.subject,
        // seriesno: foundSeries.seriesno,
      };
    }

    // 2. Try to find the episode by ID
    const foundEpisode = await episode.findById(id);
    if (foundEpisode) {
      const libraryDoc = await LibraryModel.findOne({ userId });
      const isDuplicate = libraryDoc?.downloads?.some(
        (item) => item.episodeId && item.episodeId.toString() === id
      );

      if (isDuplicate) {
        return res
          .status(400)
          .json({ message: "Already This episode was downloaded" });
      }
      data = {
        type: "episode",
        title: foundEpisode.title,
        episodenumber: foundEpisode.episodenumber,
        episodeId: foundEpisode._id,
        // audioUrl: foundEpisode.audioUrl,
        audioUrl: foundEpisode.audioUrl.fileUrl,
        duration: foundEpisode.duration,
        thumbnail: foundEpisode.thumbnail.fileUrl,
        description: foundEpisode.description,
        about: foundEpisode.about,
        subject: foundEpisode.subject,
        genre: foundEpisode.genre,
        seriesId: foundEpisode.seriesId || null,
        isStandalone: foundEpisode.isStandalone,
      };
    }
    const result = await LibraryModel.updateOne(
      { userId },
      { $push: { downloads: data } },
      { upsert: true }
    );
    return res.status(200).json({ message: " downloaded successfully" });
  } catch (error) {
    console.log("error in adddownloads", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const getdownloads = async (req, res) => {
  try {
    const userId = req.user._id;

    let result = await LibraryModel.findOne({ userId }).select("downloads");
    if (!result) {
      return res
        .status(404)
        .json({ message: "downloads not found for this user" });
    }
    let sorteddownloads = result.downloads.sort((a, b) => {
      let aTime = new Date(a.listenedAt || a._id.getTimestamp());
      let bTime = new Date(a.listenedAt || a._id.getTimestamp());
      return bTime - aTime;
    });
    if (sorteddownloads.length === 0) {
      return res.status(500).json({
        message: "No content available to download for this request.",
      });
    }
    return res.status(200).json({ downloads: sorteddownloads });
  } catch (error) {
    console.log("error.getdownloads", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const deletedownloads = async (req, res) => {
  try {
    const { id } = req.params;

    const userId = req.user._id;
    const dowloadId = await LibraryModel.findOne({
      userId,
      "downloads._id": id,
    });
    if (!dowloadId) {
      return res
        .status(401)
        .json({ message: "No download entry found with this ID" });
    }

    let result = await LibraryModel.updateOne(
      { userId },
      { $pull: { downloads: { _id: id } } }
    );
    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: `Item with ID ${id} not found in downloads` });
    }
    return res
      .status(200)
      .json({ message: "downloads item removed successfully" });
  } catch (error) {
    console.log("error.downloads", error.message);
    return res.status(500).json({ message: error.message });
  }
};
