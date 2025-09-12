// import React, { useState } from 'react';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// const StatsDashboard = () => {
//   const [timePeriod, setTimePeriod] = useState('today');

//   // Previous data generation code remains the same
//   const generateData = (period) => {
//     switch (period) {
//       case 'today':
//         return Array.from({ length: 24 }, (_, i) => ({
//           label: `${i}:00`,
//           count: Math.floor(Math.random() * 30) + 5,
//           revenue: Math.floor(Math.random() * 2000) + 500,
//           newUsers: Math.floor(Math.random() * 15) + 2
//         }));
//       case 'weekly':
//         return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => ({
//           label: day,
//           count: Math.floor(Math.random() * 100) + 20,
//           revenue: Math.floor(Math.random() * 5000) + 1000,
//           newUsers: Math.floor(Math.random() * 50) + 10
//         }));
//       case 'monthly':
//         return Array.from({ length: 30 }, (_, i) => ({
//           label: `Day ${i + 1}`,
//           count: Math.floor(Math.random() * 150) + 30,
//           revenue: Math.floor(Math.random() * 8000) + 2000,
//           newUsers: Math.floor(Math.random() * 75) + 15
//         }));
//       case 'yearly':
//         return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => ({
//           label: month,
//           count: Math.floor(Math.random() * 3000) + 500,
//           revenue: Math.floor(Math.random() * 100000) + 20000,
//           newUsers: Math.floor(Math.random() * 1000) + 200
//         }));
//       default:
//         return [];
//     }
//   };

//   // Generate city data
//   const generateCityData = () => {
//     const cities = [
//       'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
//       'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
//       'Fort Worth', 'Columbus', 'San Francisco', 'Charlotte', 'Indianapolis',
//       'Seattle', 'Denver', 'Boston'
//     ];

//     return cities.map(city => ({
//       city,
//       orders: Math.floor(Math.random() * 1000) + 100,
//       revenue: Math.floor(Math.random() * 50000) + 5000
//     }))
//     .sort((a, b) => b.revenue - a.revenue);
//   };

//   // Generate product data
//   const generateProductData = () => {
//     const products = [
//       'iPhone 15 Pro', 'MacBook Air', 'AirPods Pro', 'iPad Pro', 'Apple Watch',
//       'Magic Keyboard', 'HomePod', 'AirTag', 'Apple TV', 'Mac Mini'
//     ].map(product => ({
//       product,
//       orders: Math.floor(Math.random() * 500) + 50,
//       revenue: Math.floor(Math.random() * 25000) + 2500
//     }))
//     .sort((a, b) => b.revenue - a.revenue);

//     return {
//       top: products.slice(0, 5),
//       bottom: products.slice(-5).reverse()
//     };
//   };

//   const periodData = generateData(timePeriod);
//   const cityData = generateCityData();
//   const productData = generateProductData();

//   const getTotalStats = () => {
//     return periodData.reduce((acc, curr) => ({
//       count: acc.count + curr.count,
//       revenue: acc.revenue + curr.revenue,
//       newUsers: acc.newUsers + curr.newUsers
//     }), { count: 0, revenue: 0, newUsers: 0 });
//   };

//   const stats = getTotalStats();

//   const getPeriodLabel = () => {
//     const labels = {
//       today: 'Today (Hourly)',
//       weekly: 'This Week',
//       monthly: 'This Month',
//       yearly: 'This Year'
//     };
//     return labels[timePeriod];
//   };

//   return (
//     <div className="w-full p-4 space-y-6">
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold">Statistics Dashboard</h2>
//         <Select value={timePeriod} onValueChange={setTimePeriod}>
//           <SelectTrigger className="w-[180px]">
//             <SelectValue placeholder="Select time period" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="today">Today</SelectItem>
//             <SelectItem value="weekly">This Week</SelectItem>
//             <SelectItem value="monthly">This Month</SelectItem>
//             <SelectItem value="yearly">This Year</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>

//       <div className="grid grid-cols-3 gap-4">
//         <Card className="bg-blue-50">
//           <CardContent className="p-4">
//             <div className="text-sm text-blue-600">Total Orders</div>
//             <div className="text-2xl font-bold">{stats.count}</div>
//           </CardContent>
//         </Card>
//         <Card className="bg-green-50">
//           <CardContent className="p-4">
//             <div className="text-sm text-green-600">Total Revenue</div>
//             <div className="text-2xl font-bold">${stats.revenue.toLocaleString()}</div>
//           </CardContent>
//         </Card>
//         <Card className="bg-purple-50">
//           <CardContent className="p-4">
//             <div className="text-sm text-purple-600">New Users</div>
//             <div className="text-2xl font-bold">{stats.newUsers}</div>
//           </CardContent>
//         </Card>
//       </div>

//       <div className="grid grid-cols-2 gap-4">
//         <Card>
//           <CardHeader>
//             <CardTitle>Top 20 Cities</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="relative overflow-x-auto">
//               <table className="w-full text-sm text-left">
//                 <thead className="text-xs bg-gray-50">
//                   <tr>
//                     <th className="px-4 py-2 font-medium">City</th>
//                     <th className="px-4 py-2 font-medium text-right">Orders</th>
//                     <th className="px-4 py-2 font-medium text-right">Revenue</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {cityData.map((city) => (
//                     <tr key={city.city} className="border-b hover:bg-gray-50">
//                       <td className="px-4 py-2">{city.city}</td>
//                       <td className="px-4 py-2 text-right">{city.orders.toLocaleString()}</td>
//                       <td className="px-4 py-2 text-right">${city.revenue.toLocaleString()}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Products Performance</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-6">
//               <div>
//                 <h3 className="text-lg font-semibold mb-2">Top 5 Products</h3>
//                 <div className="relative overflow-x-auto">
//                   <table className="w-full text-sm text-left">
//                     <thead className="text-xs bg-gray-50">
//                       <tr>
//                         <th className="px-4 py-2 font-medium">Product</th>
//                         <th className="px-4 py-2 font-medium text-right">Orders</th>
//                         <th className="px-4 py-2 font-medium text-right">Revenue</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {productData.top.map((product) => (
//                         <tr key={product.product} className="border-b hover:bg-gray-50">
//                           <td className="px-4 py-2">{product.product}</td>
//                           <td className="px-4 py-2 text-right">{product.orders.toLocaleString()}</td>
//                           <td className="px-4 py-2 text-right">${product.revenue.toLocaleString()}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>

//               <div>
//                 <h3 className="text-lg font-semibold mb-2">Bottom 5 Products</h3>
//                 <div className="relative overflow-x-auto">
//                   <table className="w-full text-sm text-left">
//                     <thead className="text-xs bg-gray-50">
//                       <tr>
//                         <th className="px-4 py-2 font-medium">Product</th>
//                         <th className="px-4 py-2 font-medium text-right">Orders</th>
//                         <th className="px-4 py-2 font-medium text-right">Revenue</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {productData.bottom.map((product) => (
//                         <tr key={product.product} className="border-b hover:bg-gray-50">
//                           <td className="px-4 py-2">{product.product}</td>
//                           <td className="px-4 py-2 text-right">{product.orders.toLocaleString()}</td>
//                           <td className="px-4 py-2 text-right">${product.revenue.toLocaleString()}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle>{getPeriodLabel()} Orders</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="h-72">
//             <ResponsiveContainer width="100%" height="100%">
//               <LineChart data={periodData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="label" />
//                 <YAxis />
//                 <Tooltip />
//                 <Line type="monotone" dataKey="count" stroke="#8884d8" name="Orders" strokeWidth={2} />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle>{getPeriodLabel()} Revenue</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="h-72">
//             <ResponsiveContainer width="100%" height="100%">
//               <LineChart data={periodData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="label" />
//                 <YAxis />
//                 <Tooltip />
//                 <Line type="monotone" dataKey="revenue" stroke="#82ca9d" name="Revenue" strokeWidth={2} />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle>{getPeriodLabel()} New Users</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="h-72">
//             <ResponsiveContainer width="100%" height="100%">
//               <LineChart data={periodData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="label" />
//                 <YAxis />
//                 <Tooltip />
//                 <Line type="monotone" dataKey="newUsers" stroke="#9c27b0" name="New Users" strokeWidth={2} />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default StatsDashboard;

import React, { useState, useEffect } from "react";
import {
  CCard,
  CCardHeader,
  CCardBody,
  CFormSelect,
  CRow,
  CCol,
  CWidgetStatsF,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CSpinner,
  CAlert,
  CContainer,
} from "@coreui/react";
import { CChart } from "@coreui/react-chartjs";
import { cilBasket, cilPeople, cilMoney } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import axios from "axios";
import { isAutheticated } from "../../auth.js";

const PERIOD_OPTIONS = [
  { label: "Today (Hourly)", value: "today" },
  { label: "This Week", value: "weekly" },
  { label: "This Month", value: "monthly" },
  { label: "This Year", value: "yearly" },
  { label: "Custom Period", value: "custom" },
];

const MONTH_OPTIONS = [
  { label: "January", value: "1" },
  { label: "February", value: "2" },
  { label: "March", value: "3" },
  { label: "April", value: "4" },
  { label: "May", value: "5" },
  { label: "June", value: "6" },
  { label: "July", value: "7" },
  { label: "August", value: "8" },
  { label: "September", value: "9" },
  { label: "October", value: "10" },
  { label: "November", value: "11" },
  { label: "December", value: "12" },
];

const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return { label: year.toString(), value: year.toString() };
});

const StatsDashboard = () => {
  const [timePeriod, setTimePeriod] = useState("today");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [data, setData] = useState(null);
  const [currency, setCurrency] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = isAutheticated();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        let url = `/api/reports?timePeriod=${timePeriod}`;

        // Add year and month parameters if they're selected
        if (selectedYear) {
          url += `&year=${selectedYear}`;
          if (selectedMonth) {
            url += `&month=${selectedMonth}`;
          }
        }

        const response = await axios(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response?.data?.success) {
          // console.log(response?.data?.data);
          setData(response.data.data);
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [timePeriod, selectedYear, selectedMonth]);

  const getCurrency = async () => {
    try {
      const response = await axios.get("/api/currency/getall", {
        // headers: {
        //   Authorization: `Bearer ${token}`,
        // },
      });

      if (response.status === 200) {
        // console.log(response.data);
        setCurrency(response?.data?.currency);
      }
    } catch (error) {
      swal({
        title: "",
        text: " please login to access the resource ",
        icon: "error",
        button: "Retry",
        dangerMode: true,
      });
    }
  };
  useEffect(() => {
    getCurrency();
  }, []);

  const handlePeriodChange = (value) => {
    setTimePeriod(value);
    if (value !== "custom") {
      setSelectedMonth("");
      setSelectedYear("");
    }
  };

  function getDaysInMonth(month, year) {
    // Month is 0-indexed (0 = January, 1 = February, etc.)
    // console.log(month, year);
    return new Date(year, month + 1, 0).getDate();
  }

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth(); // Get the current month (0-indexed)
  const currentYear = currentDate.getFullYear(); // Get the current year

  // Get the number of days in the current month
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);

  const daysInMonthCustom = getDaysInMonth(selectedMonth - 1, selectedYear);
  const generateChartData = (data, option) => {
    let labels, datasets;
    let mappedData = {};

    switch (timePeriod) {
      case "today":
        labels = Array.from(
          { length: 24 },
          (_, i) => `${String(i).padStart(2, "0")}:00`
        );
        break;
      case "weekly":
        // labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const today = new Date().getDay(); // Gets current day index (0-6, starting from Sunday)

        // Rotate the array so that today becomes the last element
        labels = [
          ...daysOfWeek.slice(today + 1), // Get days after today
          ...daysOfWeek.slice(0, today + 1), // Get days from beginning until today
        ];
        break;
      case "monthly":
        labels = Array.from({ length: daysInMonth }, (_, i) => `Day ${i + 1}`);
        break;
      case "yearly":
        labels = [
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
        break;
      case "custom":
        if (selectedMonth && selectedYear) {
          // console.log(selectedMonth);
          labels = Array.from(
            { length: daysInMonthCustom },
            (_, i) => `Day ${i + 1}`
          );
        } else if (selectedYear && !selectedMonth) {
          // console.log(selectedYear);
          labels = [
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
        }
        break;
      default:
        labels = [];
    }

    // Create an object to store data by day (or month, etc.)
    if (data && Array.isArray(data)) {
      data.forEach((entry) => {
        const day =
          timePeriod === "today" ? entry.label.padStart(5, "0") : entry.label; // Depending on period, use the correct field
        mappedData[day] = {
          orders: entry.orders || 0,
          revenue: entry.revenue || 0,
          newUsers: entry.newUsers || 0,
        };
        // console.log(mappedData);
      });
    }

    const totalCount = Object.values(mappedData).reduce(
      (total, value) => total + (value.orders || 0),
      0
    );
    const totalRevenue = Object.values(mappedData).reduce(
      (total, value) => total + (value.revenue || 0),
      0
    );
    const totalNewUsers = Object.values(mappedData).reduce(
      (total, value) => total + (value.newUsers || 0),
      0
    );

    if (option === "orders") {
      datasets = [
        {
          label: `Total Orders: ${totalCount}`,
          data: labels?.map((label) => mappedData[label]?.orders || 0),
          borderColor: "rgb(60, 117, 250)",
          tension: 0.4,
        },
      ];
    } else if (option === "revenue") {
      datasets = [
        {
          label: `Total Revenue : ${totalRevenue}`,
          data: labels?.map((label) => mappedData[label]?.revenue || 0),
          borderColor: "rgb(26, 124, 80)",
          tension: 0.4,
        },
      ];
    } else if (option === "newUsers") {
      datasets = [
        {
          label: `New Users ${totalNewUsers}`,
          data: labels?.map((label) => mappedData[label]?.newUsers || 0),
          borderColor: "rgb(10, 190, 240)",
          tension: 0.4,
        },
      ];
    }
    // console.log(labels, datasets);
    return { labels, datasets };
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <CSpinner color="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <CContainer>
        <CAlert color="danger">Error: {error}</CAlert>
      </CContainer>
    );
  }

  if (!data) return null;

  const { stats, cityData, productData, periodData, newUsersData } = data;
  return (
    <CContainer fluid className="p-4">
      <CRow className="mb-4 align-items-center">
        <CCol>
          <h2 className="mb-0">Reports & Analytics Dashboard</h2>
        </CCol>
        <CCol xs="auto">
          <CFormSelect
            value={timePeriod}
            onChange={(e) => handlePeriodChange(e.target.value)}
            options={PERIOD_OPTIONS}
            className="w-auto"
          />
        </CCol>

        {timePeriod === "custom" && (
          <>
            <CCol xs="auto">
              <CFormSelect
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                options={[{ label: "Select Year", value: "" }, ...YEAR_OPTIONS]}
                className="w-auto"
              />
            </CCol>
            <CCol xs="auto">
              <CFormSelect
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                options={[
                  { label: "Select Month", value: "" },
                  ...MONTH_OPTIONS,
                ]}
                className="w-auto"
                disabled={!selectedYear}
              />
            </CCol>
          </>
        )}
      </CRow>

      {/* Stats Widgets */}
      <CRow className="mb-4">
        <CCol xs={12} md={4}>
          <CWidgetStatsF
            className="mb-3"
            color="primary"
            icon={<CIcon icon={cilBasket} height={24} />}
            title="Total Orders"
            value={stats?.orders?.toLocaleString() || 0}
            footer={
              <div className="font-weight-bold font-xs text-medium-emphasis">
                {timePeriod === "today"
                  ? "Today's performance"
                  : `${
                      PERIOD_OPTIONS.find((o) => o.value === timePeriod)?.label
                    } performance`}
              </div>
            }
          />
        </CCol>
        <CCol xs={12} md={4}>
          <CWidgetStatsF
            className="mb-3"
            color="success"
            icon={<CIcon icon={cilMoney} height={24} />}
            title="Total Revenue"
            value={`${
              currency[0]?.CurrencySymbol
            } ${stats?.revenue?.toLocaleString()}`}
            footer={
              <div className="font-weight-bold font-xs text-medium-emphasis">
                {timePeriod === "today"
                  ? "Today's earnings"
                  : `${
                      PERIOD_OPTIONS.find((o) => o.value === timePeriod)?.label
                    } earnings`}
              </div>
            }
          />
        </CCol>
        <CCol xs={12} md={4}>
          <CWidgetStatsF
            className="mb-3"
            color="info"
            icon={<CIcon icon={cilPeople} height={24} />}
            title="New Users"
            value={stats?.newUsers?.toLocaleString()}
            footer={
              <div className="font-weight-bold font-xs text-medium-emphasis">
                {timePeriod === "today"
                  ? "Today's registrations"
                  : `${
                      PERIOD_OPTIONS.find((o) => o.value === timePeriod)?.label
                    } registrations`}
              </div>
            }
          />
        </CCol>
      </CRow>

      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="bg-primary text-white">
              <strong>🚚 Orders</strong>
            </CCardHeader>
            <CCardBody>
              <CChart
                type="line"
                data={generateChartData(periodData, "orders")}
                options={{
                  plugins: {
                    legend: {
                      position: "top",
                    },
                    title: {
                      display: true,
                      text: `${
                        PERIOD_OPTIONS.find((o) => o.value === timePeriod)
                          ?.label
                      } Statistics`,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 2, // This controls the spacing between the ticks
                        callback: function (value) {
                          return value; // Optional: you can format the tick values as needed
                        },
                      },
                    },
                  },
                  responsive: true,
                  maintainAspectRatio: false,
                }}
                style={{ height: "300px" }}
              />
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="bg-success text-white">
              <strong>💹 Revenue</strong>
            </CCardHeader>
            <CCardBody>
              <CChart
                type="line"
                data={generateChartData(periodData, "revenue")}
                options={{
                  plugins: {
                    legend: {
                      position: "top",
                    },
                    title: {
                      display: true,
                      text: `${
                        PERIOD_OPTIONS.find((o) => o.value === timePeriod)
                          ?.label
                      } Statistics`,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 500, // This controls the spacing between the ticks
                        callback: function (value) {
                          return value; // Optional: you can format the tick values as needed
                        },
                      },
                    },
                  },
                  responsive: true,
                  maintainAspectRatio: false,
                }}
                style={{ height: "300px" }}
              />
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="bg-info text-white">
              <strong> 🧑🏻‍💻 New Users</strong>
            </CCardHeader>
            <CCardBody>
              <CChart
                type="line"
                data={generateChartData(newUsersData, "newUsers")}
                options={{
                  plugins: {
                    legend: {
                      position: "top",
                    },
                    title: {
                      display: true,
                      text: `${
                        PERIOD_OPTIONS.find((o) => o.value === timePeriod)
                          ?.label
                      } Statistics`,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 2, // This controls the spacing between the ticks
                        callback: function (value) {
                          return value; // Optional: you can format the tick values as needed
                        },
                      },
                    },
                  },
                  responsive: true,
                  maintainAspectRatio: false,
                }}
                style={{ height: "300px" }}
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow className="mb-4">
        <CCol xs={12} md={6} className="mb-4">
          <CCard className="h-100">
            <CCardHeader style={{ backgroundColor: "orange", color: "white" }}>
              <strong>🏙️ Top 20 Cities</strong>
            </CCardHeader>
            <CCardBody>
              <CTable hover responsive small>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>City</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">
                      Orders
                    </CTableHeaderCell>
                    <CTableHeaderCell className="text-end">
                      Revenue
                    </CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {cityData?.length !== 0 ? (
                    cityData?.map((city) => (
                      <CTableRow key={city.city}>
                        <CTableDataCell>{city.city}</CTableDataCell>
                        <CTableDataCell className="text-end">
                          {city?.orders?.toLocaleString() || "No New Orders"}
                        </CTableDataCell>
                        <CTableDataCell className="text-end">
                          {currency[0]?.CurrencySymbol}
                          {city?.revenue?.toLocaleString() || "No New Revenue"}
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan="3" className="text-center">
                        No Data
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol xs={12} md={6} className="mb-4">
          <CCard className="h-100">
            <CCardHeader style={{ backgroundColor: "orange", color: "white" }}>
              <strong>📑 Products Performance</strong>
            </CCardHeader>
            <CCardBody>
              <div className="mb-4">
                <h6 className="mb-3 bg-info text-white p-2 rounded">
                  Top 5 Products 📈
                </h6>
                <CTable hover responsive small>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Product</CTableHeaderCell>
                      <CTableHeaderCell className="text-end">
                        Orders
                      </CTableHeaderCell>
                      <CTableHeaderCell className="text-end">
                        Revenue
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {productData?.top?.length !== 0 ? (
                      productData?.top?.map((product, i) => (
                        <CTableRow key={i}>
                          <CTableDataCell>
                            {product?.productName}
                          </CTableDataCell>
                          <CTableDataCell className="text-end">
                            {product?.orders?.toLocaleString()}
                          </CTableDataCell>
                          <CTableDataCell className="text-end">
                            {currency[0]?.CurrencySymbol}
                            {product?.revenue?.toLocaleString()}
                          </CTableDataCell>
                        </CTableRow>
                      ))
                    ) : (
                      <CTableRow>
                        <CTableDataCell colSpan="3" className="text-center">
                          No Data
                        </CTableDataCell>
                      </CTableRow>
                    )}
                  </CTableBody>
                </CTable>
              </div>

              <div>
                <h6 className="mb-3 bg-danger text-white p-2 rounded">
                  Least 5 Products 📉
                </h6>
                <CTable hover responsive small>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Product</CTableHeaderCell>
                      <CTableHeaderCell className="text-end">
                        Orders
                      </CTableHeaderCell>
                      <CTableHeaderCell className="text-end">
                        Revenue
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {productData?.bottom?.length !== 0 ? (
                      productData?.bottom?.map((product, i) => (
                        <CTableRow key={i}>
                          <CTableDataCell>{product.productName}</CTableDataCell>
                          <CTableDataCell className="text-end">
                            {product?.orders?.toLocaleString() ||
                              "No New Orders"}
                          </CTableDataCell>
                          <CTableDataCell className="text-end">
                            {currency[0]?.CurrencySymbol}
                            {product?.revenue?.toLocaleString() ||
                              "No New Revenue"}
                          </CTableDataCell>
                        </CTableRow>
                      ))
                    ) : (
                      <CTableRow>
                        <CTableDataCell colSpan="3" className="text-center">
                          No Data
                        </CTableDataCell>
                      </CTableRow>
                    )}
                  </CTableBody>
                </CTable>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default StatsDashboard;
