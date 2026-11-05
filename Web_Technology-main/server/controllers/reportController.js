const Report = require('../models/Report');
const { predictRoadDamage } = require('../utils/mlInference');

const getImageUrl = (req, fileName) => {
  return `${req.protocol}://${req.get('host')}/uploads/${fileName}`;
};

const buildReportFilters = ({ area, damageType }) => {
  const filters = {};

  if (area) {
    filters.location = { $regex: area, $options: 'i' };
  }

  if (damageType) {
    filters.damageType = { $regex: `^${damageType}$`, $options: 'i' };
  }

  return filters;
};

const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    return res.json(reports);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch reports', error: error.message });
  }
};

const getAllReportsForAdmin = async (req, res) => {
  try {
    const { area = '', damageType = '' } = req.query;
    const filters = buildReportFilters({ area, damageType });

    const reports = await Report.find(filters)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });

    return res.json(reports);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch admin reports', error: error.message });
  }
};

const getAdminReportAnalytics = async (req, res) => {
  try {
    const { area = '', damageType = '' } = req.query;
    const match = buildReportFilters({ area, damageType });

    const [
      totalReports,
      avgConfidenceResult,
      damageTypeBreakdown,
      areaBreakdown,
      highDamageZones
    ] = await Promise.all([
      Report.countDocuments(match),
      Report.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            averageConfidence: { $avg: '$confidence' }
          }
        }
      ]),
      Report.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$damageType',
            count: { $sum: 1 },
            avgConfidence: { $avg: '$confidence' }
          }
        },
        { $sort: { count: -1 } }
      ]),
      Report.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$location',
            count: { $sum: 1 },
            avgConfidence: { $avg: '$confidence' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      Report.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$location',
            reportCount: { $sum: 1 },
            averageConfidence: { $avg: '$confidence' },
            maxConfidence: { $max: '$confidence' }
          }
        },
        { $sort: { averageConfidence: -1, reportCount: -1 } },
        { $limit: 5 }
      ])
    ]);

    return res.json({
      totalReports,
      averageConfidence: Math.round(avgConfidenceResult[0]?.averageConfidence || 0),
      damageTypeBreakdown: damageTypeBreakdown.map((item) => ({
        damageType: item._id || 'Unknown',
        count: item.count,
        avgConfidence: Math.round(item.avgConfidence || 0)
      })),
      areaBreakdown: areaBreakdown.map((item) => ({
        area: item._id || 'Unknown location',
        count: item.count,
        avgConfidence: Math.round(item.avgConfidence || 0)
      })),
      highDamageZones: highDamageZones.map((item) => ({
        area: item._id || 'Unknown location',
        reportCount: item.reportCount,
        averageConfidence: Math.round(item.averageConfidence || 0),
        maxConfidence: Math.round(item.maxConfidence || 0)
      }))
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
};

const createReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Road image is required' });
    }

    const { location, damageType, confidence, latitude, longitude } = req.body;
    const predictedResult = await predictRoadDamage(req.file.path, req.file.originalname);
    const parsedLatitude = latitude !== undefined && latitude !== '' ? Number(latitude) : undefined;
    const parsedLongitude = longitude !== undefined && longitude !== '' ? Number(longitude) : undefined;

    const report = await Report.create({
      userId: req.user.userId,
      imageUrl: getImageUrl(req, req.file.filename),
      damageType: damageType || predictedResult.damageType,
      location: location || 'Unknown location',
      latitude: Number.isFinite(parsedLatitude) ? parsedLatitude : undefined,
      longitude: Number.isFinite(parsedLongitude) ? parsedLongitude : undefined,
      confidence: confidence ? Number(confidence) : predictedResult.confidence
    });

    return res.status(201).json({
      message: 'Report created successfully',
      report
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create report', error: error.message });
  }
};

const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { damageType, location } = req.body;

    const report = req.user.role === 'admin'
      ? await Report.findById(id)
      : await Report.findOne({ _id: id, userId: req.user.userId });

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (damageType) {
      report.damageType = damageType;
    }

    if (location) {
      report.location = location;
    }

    await report.save();

    return res.json({
      message: 'Report updated successfully',
      report
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update report', error: error.message });
  }
};

const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = req.user.role === 'admin'
      ? await Report.findByIdAndDelete(id)
      : await Report.findOneAndDelete({ _id: id, userId: req.user.userId });

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    return res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete report', error: error.message });
  }
};

module.exports = {
  createReport,
  getMyReports,
  getAllReportsForAdmin,
  getAdminReportAnalytics,
  updateReport,
  deleteReport
};
