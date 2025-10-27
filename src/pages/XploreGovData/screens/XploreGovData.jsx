// XploreDataHomepage.jsx
import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieIcon,
  Activity,
  Database,
  Calendar,
  GitBranch,
  ChevronRight,
  ScatterChart,
  Zap,
  Code,
  Clock,
  Globe,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { useNavigate } from "react-router-dom";

const timeSeriesData = [
  { year: "2019", budgetAllocation: 300, revenue: 450, growthRate: 2.1 },
  { year: "2020", budgetAllocation: 280, revenue: 380, growthRate: 1.8 },
  { year: "2021", budgetAllocation: 375, revenue: 400, growthRate: 2.5 },
  { year: "2022", budgetAllocation: 410, revenue: 440, growthRate: 2.8 },
  { year: "2023", budgetAllocation: 450, revenue: 500, growthRate: 3.2 },
];

const departments = [
  "Tourism",
  "Education",
  "Healthcare",
  "Infrastructure",
  "Defense",
  "Agriculture",
];
const statTypes = [
  "Budget Allocation",
  "Budget Deficit/Surplus",
  "Expenditure",
  "Revenue",
  "Growth Rate",
  "Visitors by Country",
];

const visitorsData = [
  { name: "India", value: 123004, year: 2023 },
  { name: "Russian Federation", value: 91272, year: 2023 },
  { name: "United Kingdom", value: 85187, year: 2023 },
  { name: "Germany", value: 55542, year: 2023 },
  { name: "France", value: 35482, year: 2023 },
  { name: "Australia", value: 30924, year: 2023 },
  { name: "Canada", value: 26845, year: 2023 },
  { name: "United States", value: 22230, year: 2023 },
];

/* ===========================
   DataTimeline component
   - shows years, mini-charts, progress bar
   - receives activeYear and setActiveYear
   =========================== */

const DataTimeline = ({ activeYear, setActiveYear }) => {
  useEffect(() => {
    const years = [2019, 2020, 2021, 2022, 2023];
    let idx =
      years.indexOf(activeYear) === -1
        ? years.length - 1
        : years.indexOf(activeYear);
    const t = setInterval(() => {
      idx = (idx + 1) % years.length;
      setActiveYear(years[idx]);
    }, 2500);
    return () => clearInterval(t);
  }, [activeYear, setActiveYear]);

  const years = [2019, 2020, 2021, 2022, 2023];

  return (
    <div className="relative p-4">
      {/* subtle grid background */}
      <div className="absolute inset-0 opacity-6 pointer-events-none">
        <svg className="w-full h-full">
          <defs>
            <pattern
              id="timelineGrid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#0f172a"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#timelineGrid)" />
        </svg>
      </div>

      <div className="relative">
        {/* Progress line sits behind circles */}
        <div className="-mt-2 absolute top-1/2 left-0 w-full h-1 bg-slate-700 rounded-full -translate-y-1/2 z-0">
          <div
            className="absolute h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-700"
            style={{ width: `${((activeYear - 2019) / (2023 - 2019)) * 100}%` }}
          />
        </div>

        {/* Circles on top */}
        <div className="relative flex justify-between items-center z-10">
          {years.map((year) => {
            const isActive = year === activeYear;
            const isPast = year <= activeYear;
            return (
              <div
                key={year}
                className={`flex flex-col items-center transition-all duration-500 select-none ${
                  isActive ? "scale-70" : "scale-60"
                }`}
                onClick={() => setActiveYear(year)}
              >
                <div
                  className={`w-6 h-6 rounded-full mb-2 ${
                    isPast
                      ? "bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg"
                      : "bg-slate-600"
                  }`}
                />
                <div
                  className={`text-sm ${
                    isActive
                      ? "text-white font-bold"
                      : isPast
                      ? "text-white/80"
                      : "text-slate-400"
                  }`}
                >
                  {year}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const mockLineData = [
  { name: "Jan", value: 40 },
  { name: "Feb", value: 60 },
  { name: "Mar", value: 50 },
  { name: "Apr", value: 70 },
  { name: "May", value: 90 },
];

const mockBarData = [
  { name: "Immigration", value: 120 },
  { name: "Foreign", value: 200 },
  { name: "Tourism", value: 150 },
];

const mockAreaData = [
  { month: "Jan", arrivals: 30 },
  { month: "Feb", arrivals: 45 },
  { month: "Mar", arrivals: 60 },
  { month: "Apr", arrivals: 50 },
];

const mockPieData = [
  { name: "Tourism", value: 400 },
  { name: "Education", value: 300 },
  { name: "Healthcare", value: 300 },
];

const COLORS = ["#0ea5e9", "#a855f7", "#22c55e"];

const chartTypes = [
  {
    name: "Line Chart",
    component: (width, height) => (
      <LineChart
        width={width}
        height={height}
        data={mockLineData}
        margin={{ top: 10, right: 10, bottom: 10, left: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
        <XAxis dataKey="name" stroke="#94A3B8" />
        <YAxis stroke="#94A3B8" />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#10B981"
          strokeWidth={2}
          animationDuration={1500}
        />
      </LineChart>
    ),
  },
  {
    name: "Bar Chart",
    component: (width, height) => (
      <BarChart
        width={width}
        height={height}
        data={mockBarData}
        margin={{ top: 10, right: 10, bottom: 10, left: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
        <XAxis dataKey="name" stroke="#94A3B8" />
        <YAxis stroke="#94A3B8" />
        <Bar dataKey="value" fill="#a855f7" animationDuration={1500} />
      </BarChart>
    ),
  },
  {
    name: "Area Chart",
    component: (width, height) => (
      <AreaChart
        width={width}
        height={height}
        data={mockAreaData}
        margin={{ top: 10, right: 10, bottom: 10, left: 0 }}
      >
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
        <XAxis dataKey="month" stroke="#94A3B8" />
        <YAxis stroke="#94A3B8" />
        <Area
          type="monotone"
          dataKey="arrivals"
          stroke="#3b82f6"
          fill="url(#areaGradient)"
          animationDuration={1500}
        />
      </AreaChart>
    ),
  },
  {
    name: "Pie Chart",
    component: (width, height) => (
      <PieChart width={width} height={height}>
        <Tooltip />
        <Pie
          data={mockPieData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          fill="#10B981"
          animationDuration={1500}
        >
          {mockPieData.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    ),
  },
];

function ChartTypesCard() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % chartTypes.length);
    }, 3000); // change every 3s
    return () => clearInterval(interval);
  }, []);

  const ChartComponent = chartTypes[currentIndex].component;

  return (
    <div className="bg-gray-900/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-purple-400/50 transition-all duration-300 group">
      {/* header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-900/30">
            <ScatterChart className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Multiple Data Visualizations</h3>
            <div className="text-sm text-slate-400">
              Visualize data in various formats
            </div>
          </div>
        </div>
      </div>

      {/* animated chart preview */}
      <div className="mt-20 flex items-center justify-center h-56">
        {ChartComponent(350, 300)}
      </div>

      {/* features */}
      <div className="mt-18 space-y-3">
        <div className="flex items-center p-3 rounded-lg bg-blue-950/20 border-l-4 border-blue-400">
          <LineChartIcon className="w-4 h-4 text-blue-400 mr-3" />
          <span className="text-sm text-slate-300">
            Multiple chart types for different insights
          </span>
        </div>
        <div className="flex items-center p-3 rounded-lg bg-purple-950/20 border-l-4 border-purple-400">
          <PieIcon className="w-4 h-4 text-purple-400 mr-3" />
          <span className="text-sm text-slate-300">
            Interactive visualizations
          </span>
        </div>
      </div>
    </div>
  );
}

/* ===========================
   InteractiveChart component
   - receives activeYear
   - metric toggles, trend chart
   =========================== */

const InteractiveChart = ({ activeYear }) => {
  const [activeMetric, setActiveMetric] = useState("budgetAllocation");

  const metrics = {
    budgetAllocation: {
      color: "#10B981",
      name: "Budget Allocation",
      unit: "M",
    },
    revenue: { color: "#3B82F6", name: "Revenue", unit: "M" },
    growthRate: { color: "#8B5CF6", name: "Growth Rate", unit: "%" },
  };

  // trendData = last 3 years up to activeYear
  const trendData = timeSeriesData
    .filter((d) => parseInt(d.year) <= (activeYear || 2023))
    .slice(-3)
    .map((d) => ({ year: d.year, value: d[activeMetric] || 0 }));

  const currentYearData =
    timeSeriesData.find((d) => parseInt(d.year) === activeYear) ||
    timeSeriesData[timeSeriesData.length - 1];

  const metric = metrics[activeMetric];

  return (
    <div className="mt-6 space-y-6">
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={trendData}
            margin={{ top: 8, right: 20, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={metric.color} stopOpacity={0.8} />
                <stop
                  offset="95%"
                  stopColor={metric.color}
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#475569"
              opacity={0.3}
            />
            <XAxis dataKey="year" stroke="#94A3B8" />
            <YAxis stroke="#94A3B8" />
            <Area
              type="monotone"
              dataKey="value"
              stroke={metric.color}
              strokeWidth={2}
              fill="url(#metricGradient)"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

/* ===========================
   Full homepage component (single export)
   =========================== */

export default function XploreDataHomepage() {
  const [activeYear, setActiveYear] = useState(2023);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-x-hidden relative">
      {/* Enhanced background with gradients and tiny floating points */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-cyan-400/10 to-blue-400/10 blur-3xl animate-pulse" />
        <div
          className="absolute top-1/2 right-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-purple-400/10 to-pink-400/10 blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 w-48 h-48 rounded-full bg-gradient-to-br from-green-400/10 to-teal-400/10 blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />

        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full">
            <defs>
              <pattern
                id="dataGrid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="#06B6D4"
                  strokeWidth="1"
                />
                <circle cx="20" cy="20" r="1" fill="#06B6D4" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dataGrid)" />
          </svg>
        </div>

        {[...Array(18)].map((_, i) => (
          <div
            key={`float-${i}`}
            className="absolute w-2 h-2 bg-cyan-400 rounded-full opacity-30 animate-ping"
            style={{
              left: `${5 + Math.random() * 90}%`,
              top: `${5 + Math.random() * 90}%`,
              animationDelay: `${i * 0.25}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main content container */}
      <div className="relative z-10 px-6">
        <div className="max-w-6xl mx-auto">
          {/* header */}
          <div className="p-6 z-20">
            <h1 className="text-2xl font-bold text-white">
              Xplore
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Data
              </span>
            </h1>
          </div>

          {/* Hero */}
          <section className="text-center mb-12 mt-8">
            <h2 className="text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                XploreData
              </span>
            </h2>

            <p className="text-lg text-slate-300 mb-6">
              Visualize Data Through Time — explore trends, compare sectors, and
              dive deep into the numbers.
            </p>
            <button
              className="mt-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white px-4 py-3 rounded-xl font-semibold text-lg hover:scale-105 transition transform inline-flex items-center space-x-3 hover:cursor-pointer"
              onClick={() => navigate("/statistics")}
            >
              <Zap className="w-6 h-6" />
              <span>XploreData</span>
              <ChevronRight className="w-6 h-6" />
            </button>
            {/* 
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-400/20 flex items-center justify-center">
                  <span className="text-2xl">🗂️</span>
                </div>
                <h4 className="font-semibold text-white mb-2">Why</h4>
                <p className="text-sm text-gray-400">
                  Rendering aspects of life in Sri Lanka through public datasets
                </p>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 flex items-center justify-center">
                  <span className="text-2xl">🔍</span>
                </div>
                <h4 className="font-semibold text-white mb-2">What</h4>
                <p className="text-sm text-gray-400">
                  Vivid visualization methods for government datasets and
                </p>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400/20 to-teal-400/20 flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
                <h4 className="font-semibold text-white mb-2">How</h4>
                <p className="text-sm text-gray-400">
                  Connected datasets with interactive visualizations, filtering
                  and timeline control.
                </p>
              </div>
            </div> */}
          </section>

          {/* main two-column area */}
          <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* left: timeseries card */}
            <div className="bg-gray-900/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-cyan-400/50 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-cyan-900/30">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">
                      Timeseries Data Analysis
                    </h3>
                    <div className="text-sm text-slate-400">
                      Track changes across years and datasets
                    </div>
                  </div>
                </div>

                <div className="text-sm text-slate-400">
                  Year: <span className="text-white ml-1">{activeYear}</span>
                </div>
              </div>

              <DataTimeline
                activeYear={activeYear}
                setActiveYear={setActiveYear}
              />

              <div className="mt-6">
                <InteractiveChart activeYear={activeYear} />
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center p-3 rounded-lg bg-blue-950/20 border-l-4 border-blue-400">
                  <Calendar className="w-4 h-4 text-blue-400 mr-3" />
                  <span className="text-sm text-slate-300">
                    Multi-year trend analysis
                  </span>
                </div>
                <div className="flex items-center p-3 rounded-lg bg-purple-950/20 border-l-4 border-purple-400">
                  <GitBranch className="w-4 h-4 text-purple-400 mr-3" />
                  <span className="text-sm text-slate-300">
                    Dataset evolution tracking
                  </span>
                </div>
              </div>
            </div>
            <ChartTypesCard />
          </main>

          {/* stats */}
          <section className="mt-12">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold">
                Data at a{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Glance
                </span>
              </h3>
              <p className="text-slate-400 max-w-2xl mx-auto mt-2">
                Explore the breadth and depth of Sri Lankan public data through
                our comprehensive platform
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-900/50 rounded-xl p-6 text-center border border-gray-700/30">
                <div className="text-3xl font-bold text-cyan-400 mb-2">
                  {25}
                </div>
                <div className="text-sm text-slate-400">Statistics Types</div>
              </div>

              <div className="bg-gray-900/50 rounded-xl p-6 text-center border border-gray-700/30">
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  {4}
                </div>
                <div className="text-sm text-slate-400">
                  Government Departments
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-xl p-6 text-center border border-gray-700/30">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {timeSeriesData.length}
                </div>
                <div className="text-sm text-slate-400">Years of Data</div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <div className="text-center py-16">
            <h3 className="text-3xl font-bold text-white mb-4">
              Start Exploring Today
            </h3>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Dive deep into Sri Lanka's data landscape and discover insights
              that matter.
            </p>
            <button
              onClick={() => navigate("/statistics")}
              className="bg-none border-2 border-blue-500 rounded-xl px-3 py-2 text-base cursor-pointer inline-flex items-center"
            >
              <span className="underline inline-flex items-center gap-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                XploreData
                <ChevronRight className="w-5 h-5 stroke-blue-500" />
              </span>
            </button>
          </div>

          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-800/50 border border-cyan-400/20 text-sm text-cyan-400 mb-6">
              <Clock className="w-4 h-4 mr-2" />
              Powered by OpenGIN: Open General Information Network
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
