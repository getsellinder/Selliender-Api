import { Order } from "../Orders/orderModel.js";
import UserModel from "../user/userModel.js";

export const getDashboardData = async (req, res) => {
  try {
    const { timePeriod, year, month } = req.query;
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date();

    // Get timezone offset in minutes
    const tzOffset = -today.getTimezoneOffset();

    // Handle specific year and month queries
    if (year) {
      if (month) {
        const yearInt = parseInt(year);
        const monthInt = parseInt(month);

        // Start of month - using UTC string
        startDate = new Date(
          `${yearInt}-${monthInt.toString().padStart(2, "0")}-01T00:00:00.000Z`
        );

        // End of month - get last day
        // Create the first day of next month, then subtract 1 millisecond
        const lastDay = new Date(yearInt, monthInt, 0).getDate();
        endDate = new Date(
          `${yearInt}-${monthInt
            .toString()
            .padStart(2, "0")}-${lastDay}T23:59:59.999Z`
        );
      } else {
        // Entire specific year
        const yearInt = parseInt(year);
        // Create dates using UTC string format to avoid timezone issues
        startDate = new Date(`${yearInt}-01-01T00:00:00.000Z`);
        endDate = new Date(`${yearInt}-12-31T23:59:59.999Z`);
      }
    } else {
      // Original time period logic
      switch (timePeriod) {
        case "today":
          startDate.setHours(0, 0, 0, 0);
          endDate = today;
          break;
        case "weekly":
          startDate.setDate(today.getDate() - 6);
          endDate = today;
          break;
        case "monthly":
          startDate.setMonth(today.getMonth() - 1);
          endDate = today;
          break;
        case "yearly":
          startDate.setFullYear(today.getFullYear() - 1);
          endDate = today;
          break;
        default:
          startDate.setHours(0, 0, 0, 0);
          endDate = today;
      }
    }

    // Update all aggregation queries to use the new date range
    const totalStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          orderStatus: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$total_amount" },
          totalWeight: { $sum: "$weight" },
        },
      },
    ]);

    const newUsers = await UserModel.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
      role: { $eq: "user" },
    });

    const topCities = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          orderStatus: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: "$shippingInfo.city",
          orders: { $sum: 1 },
          revenue: { $sum: "$total_amount" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 20 },
    ]);

    const productPerformance = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          orderStatus: { $ne: "cancelled" },
        },
      },
      { $unwind: { path: "$orderItems", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$orderItems.product",
          productName: { $first: "$orderItems.name" },
          orders: { $sum: "$orderItems.quantity" },
          revenue: { $sum: "$orderItems.total_price" },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    // Modify getTimeSeriesMatch for year/month specific queries
    const getTimeSeriesMatch = () => {
      if (year && month) {
        return {
          $dayOfMonth: "$createdAt",
        };
      } else if (year) {
        return {
          $month: "$createdAt",
        };
      }

      switch (timePeriod) {
        case "today":
          return {
            $hour: {
              $add: ["$createdAt", tzOffset * 60 * 1000],
            },
          };
        case "weekly":
          return {
            $dayOfWeek: "$createdAt",
          };
        case "monthly":
          return {
            $dayOfMonth: "$createdAt",
          };
        case "yearly":
          return {
            $month: "$createdAt",
          };
        default:
          return null;
      }
    };

    const timeSeriesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          orderStatus: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: getTimeSeriesMatch(),
          count: { $sum: 1 },
          revenue: { $sum: "$total_amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Modify formatTimeSeriesData for year/month specific queries
    const formatTimeSeriesData = () => {
      return timeSeriesData.map((item) => {
        let label;
        if (year && month) {
          label = `Day ${item._id}`;
        } else if (year) {
          const months = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          label = months[item._id - 1];
        } else {
          switch (timePeriod) {
            case "today":
              label = `${item._id.toString().padStart(2, "0")}:00`;
              break;
            case "weekly":
              const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
              label = days[item._id - 1];
              break;
            case "monthly":
              label = `Day ${item._id}`;
              break;
            case "yearly":
              const months = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ];
              label = months[item._id - 1];
              break;
          }
        }
        return {
          label,
          orders: item.count,
          revenue: item.revenue,
        };
      });
    };

    const newUsersAgg = await UserModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          role: { $eq: "user" },
        },
      },
      {
        $group: {
          _id: getTimeSeriesMatch(),
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Modify formatUserTimeSeriesData for year/month specific queries
    const formatUserTimeSeriesData = () => {
      return newUsersAgg.map((item) => {
        let label;
        if (year && month) {
          label = `Day ${item._id}`;
        } else if (year) {
          const months = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          label = months[item._id - 1];
        } else {
          switch (timePeriod) {
            case "today":
              label = `${item._id.toString().padStart(2, "0")}:00`;
              break;
            case "weekly":
              const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
              label = days[item._id - 1];
              break;
            case "monthly":
              label = `Day ${item._id}`;
              break;
            case "yearly":
              const months = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ];
              label = months[item._id - 1];
              break;
          }
        }
        return {
          label,
          newUsers: item.count,
        };
      });
    };

    const formattedData = {
      stats: {
        orders: totalStats[0]?.totalOrders || 0,
        revenue: totalStats[0]?.totalRevenue || 0,
        newUsers: newUsers || 0,
      },
      cityData: topCities.map((city) => ({
        city: city._id,
        orders: city.orders,
        revenue: city.revenue,
      })),
      productData: {
        top: productPerformance.slice(0, 5),
        bottom: productPerformance.slice(-5).reverse(),
      },
      periodData: formatTimeSeriesData(),
      newUsersData: formatUserTimeSeriesData(),
      dateRange: {
        start: startDate,
        end: endDate,
      },
    };

    res.status(200).json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
    console.log(error);
  }
};
