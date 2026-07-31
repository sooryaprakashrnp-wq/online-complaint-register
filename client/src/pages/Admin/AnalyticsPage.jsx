import { useState, useEffect } from 'react';
import { getStats } from '../../api/adminService';
import { getAllFeedback } from '../../api/feedbackService';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Title, Tooltip, Legend,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { toast } from 'react-toastify';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const AnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, feedbackRes] = await Promise.all([getStats(), getAllFeedback()]);
        setStats(statsRes.data.stats);
        setFeedbacks(feedbackRes.data.feedbacks);
      } catch {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <div className="spinner-border text-primary"></div>
    </div>
  );

  // Status Doughnut
  const statusChart = {
    labels: stats?.statusCounts?.map((s) => s._id) || [],
    datasets: [{
      data: stats?.statusCounts?.map((s) => s.count) || [],
      backgroundColor: ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#6b7280'],
      borderWidth: 2,
      borderColor: '#1a1a2e',
    }],
  };

  // Category Bar
  const categoryChart = {
    labels: stats?.categoryCounts?.map((c) => c._id) || [],
    datasets: [{
      label: 'Complaints by Category',
      data: stats?.categoryCounts?.map((c) => c.count) || [],
      backgroundColor: ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
      borderRadius: 6,
    }],
  };

  // Monthly Line
  const monthlyChart = {
    labels: stats?.monthlyData?.map((m) => `${MONTHS[m._id.month - 1]} ${m._id.year}`) || [],
    datasets: [{
      label: 'Complaints per Month',
      data: stats?.monthlyData?.map((m) => m.count) || [],
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,0.15)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#6366f1',
      pointRadius: 5,
    }],
  };

  // Ratings distribution
  const ratingDist = [1, 2, 3, 4, 5].map((r) => feedbacks.filter((f) => f.rating === r).length);
  const ratingChart = {
    labels: ['1 ⭐', '2 ⭐', '3 ⭐', '4 ⭐', '5 ⭐'],
    datasets: [{
      label: 'Feedback Ratings',
      data: ratingDist,
      backgroundColor: ['#ef4444', '#f59e0b', '#facc15', '#84cc16', '#22c55e'],
      borderRadius: 6,
    }],
  };

  const chartOpts = {
    responsive: true,
    plugins: { legend: { labels: { color: '#9ca3af' } } },
    scales: {
      x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } },
    },
  };

  const doughnutOpts = {
    responsive: true,
    plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af', padding: 12 } } },
  };

  const exportCSVReport = () => {
    if (!feedbacks.length) return toast.info('No data available to export');
    const headers = ['Complaint Title,Category,User,Agent,Rating,Comment,Date\n'];
    const rows = feedbacks.map((f) => [
      `"${f.complaint?.title || ''}"`,
      `"${f.complaint?.category || ''}"`,
      `"${f.user?.name || ''}"`,
      `"${f.agent?.name || ''}"`,
      f.rating,
      `"${f.comment || ''}"`,
      `"${new Date(f.createdAt).toLocaleDateString('en-IN')}"`
    ].join(','));
    const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `complaints_report_${Date.now()}.csv`;
    a.click();
    toast.success('Report exported successfully!');
  };

  return (
    <div className="analytics-page py-4">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h1 className="page-title mb-1">Analytics Dashboard</h1>
            <p className="text-muted mb-0">System performance insights and complaint trends</p>
          </div>
          <button className="btn btn-outline-primary btn-sm" onClick={exportCSVReport}>
            📥 Export CSV Report
          </button>
        </div>

        {/* Top KPIs */}
        <div className="row g-3 mb-4">
          {[
            { label: 'Total Complaints', value: stats?.totalComplaints, icon: '📋', color: 'blue' },
            { label: 'Resolved', value: stats?.resolvedComplaints, icon: '✅', color: 'green' },
            { label: 'Pending', value: stats?.pendingComplaints, icon: '⏳', color: 'orange' },
            { label: 'Avg Rating', value: `${stats?.avgRating} ⭐`, icon: '💬', color: 'purple' },
          ].map((k) => (
            <div key={k.label} className="col-6 col-md-3">
              <div className="analytics-kpi-card card h-100">
                <div className="card-body text-center py-4">
                  <div className="kpi-icon mb-2">{k.icon}</div>
                  <h3 className="kpi-value">{k.value}</h3>
                  <div className="kpi-label text-muted small">{k.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="row g-4 mb-4">
          <div className="col-lg-7">
            <div className="chart-card card h-100">
              <div className="card-header py-3">
                <h6 className="mb-0 fw-bold">📊 Complaints by Category</h6>
              </div>
              <div className="card-body">
                <Bar data={categoryChart} options={chartOpts} id="categoryBarChart" />
              </div>
            </div>
          </div>
          <div className="col-lg-5">
            <div className="chart-card card h-100">
              <div className="card-header py-3">
                <h6 className="mb-0 fw-bold">🍩 Status Distribution</h6>
              </div>
              <div className="card-body d-flex align-items-center justify-content-center">
                <div style={{ maxWidth: '280px', width: '100%' }}>
                  <Doughnut data={statusChart} options={doughnutOpts} id="statusDoughnutChart" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="row g-4 mb-4">
          <div className="col-lg-8">
            <div className="chart-card card h-100">
              <div className="card-header py-3">
                <h6 className="mb-0 fw-bold">📈 Monthly Complaint Trend</h6>
              </div>
              <div className="card-body">
                <Line data={monthlyChart} options={chartOpts} id="monthlyLineChart" />
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="chart-card card h-100">
              <div className="card-header py-3">
                <h6 className="mb-0 fw-bold">⭐ Rating Distribution</h6>
              </div>
              <div className="card-body">
                <Bar data={ratingChart} options={{ ...chartOpts, plugins: { legend: { display: false } } }} id="ratingBarChart" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Feedback Table */}
        <div className="card">
          <div className="card-header py-3">
            <h6 className="mb-0 fw-bold">💬 Recent Feedback ({feedbacks.length})</h6>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" id="feedbackTable">
                <thead className="table-dark">
                  <tr>
                    <th>Complaint</th>
                    <th>User</th>
                    <th>Agent</th>
                    <th>Rating</th>
                    <th>Comment</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbacks.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-4 text-muted">No feedback yet</td></tr>
                  ) : feedbacks.slice(0, 10).map((f) => (
                    <tr key={f._id}>
                      <td className="small fw-semibold">{f.complaint?.title || '—'}</td>
                      <td className="small">{f.user?.name}</td>
                      <td className="small">{f.agent?.name || '—'}</td>
                      <td>
                        <div className="rating-stars">{'⭐'.repeat(f.rating)}</div>
                      </td>
                      <td className="small text-muted">{f.comment || '—'}</td>
                      <td className="small text-muted">{new Date(f.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
