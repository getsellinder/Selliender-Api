import React, { useEffect, useState } from "react";
import { isAutheticated } from "src/auth";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const OrderdayChart = () => {
  const token = isAutheticated();
  const [ordersData, setOrdersData] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    function getOrder() {
      axios
        .get(`/api/order/getAll/`, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setOrdersData(res.data.order);
        })
        .catch((err) => {
          console.log(err);
        });
    }
    getOrder();
  }, [token]);

  useEffect(() => {
    // Filter orders based on selected year and month
    const filtered = ordersData.filter((order) => {
      const createdAt = new Date(order.createdAt);
      return (
        createdAt.getFullYear() === selectedYear &&
        createdAt.getMonth() + 1 === selectedMonth
      );
    });
    // Sort filtered orders by date in ascending order
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateA - dateB;
    });
    setFilteredOrders(filtered);
  }, [ordersData, selectedYear, selectedMonth]); // Update filtered orders when orders data, year, or month changes

  // Extract unique dates from filtered orders
  const uniqueDates = Array.from(
    new Set(filteredOrders.map((order) => order.createdAt.split("T")[0]))
  );

  // Prepare data for chart
  const data = {
    labels: uniqueDates,
    datasets: [
      {
        label: "Total Orders",
        data: uniqueDates.map((date) => {
          // Count total orders for each date
          return filteredOrders.filter((order) => order.createdAt.includes(date)).length;
        }),
        backgroundColor: "rgba(43, 63, 229, 0.8)",
        borderRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Revenue Order",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Orders",
        },
        ticks: {
          stepSize: 1, // Adjust step size as needed
        },
      },
    },
  };

  // Convert month number to string
  const monthToString = (monthNumber) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[monthNumber - 1];
  };

  // Determine the lowest year found in the ordersData
  const lowestYear = Math.min(
    ...ordersData.map((order) => new Date(order.createdAt).getFullYear())
  );

  // Generate an array of years from the lowest year to the current year
  const years = Array.from(
    { length: new Date().getFullYear() - lowestYear + 1 },
    (_, index) => lowestYear + index
  );

  return (
    <>
      <div style={{ display: "flex"}}>
        <div style={{ marginRight: "20px" }}>
          <label htmlFor="year">Select Year:</label>
          <select
            id="year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="month">Select Month:</label>
          <select
            id="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          >
            {[...Array(12).keys()].map((month) => (
              <option key={month + 1} value={month + 1}>
                {monthToString(month + 1)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ textAlign: "center" }}>
        {filteredOrders.length === 0 ? (
          <p>No data available</p>
        ) : (
          <div style={{height:"75vh"}}>
            <Bar data={data} options={options} />
          </div>
        )}
      </div>
    </>
  );
};

export default OrderdayChart;
