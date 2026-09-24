const Settings = require("../models/Settings");

// GET SETTINGS
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({});
    }

    res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Get settings error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching settings",
    });
  }
};

// UPDATE SETTINGS
const updateSettings = async (req, res) => {
  try {
    const {
      libraryName,
      issuePeriod,
      finePerDay,
      maxBooks,
      openingTime,
      closingTime,
      libraryEnabled,
    } = req.body;

    if (!libraryName || !libraryName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Library name is required",
      });
    }

    if (Number(issuePeriod) < 1) {
      return res.status(400).json({
        success: false,
        message: "Issue period must be at least 1 day",
      });
    }

    if (Number(finePerDay) < 0) {
      return res.status(400).json({
        success: false,
        message: "Fine per day cannot be negative",
      });
    }

    if (Number(maxBooks) < 1) {
      return res.status(400).json({
        success: false,
        message: "Maximum books must be at least 1",
      });
    }

    const settings = await Settings.findOneAndUpdate(
      {},
      {
        libraryName: libraryName.trim(),
        issuePeriod: Number(issuePeriod),
        finePerDay: Number(finePerDay),
        maxBooks: Number(maxBooks),
        openingTime,
        closingTime,
        libraryEnabled: Boolean(libraryEnabled),
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      settings,
    });
  } catch (error) {
    console.error("Update settings error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating settings",
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};