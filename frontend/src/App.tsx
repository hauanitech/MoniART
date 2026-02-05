import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Toast from './components/Toast';
import CreateReportPage from './pages/CreateReportPage';
import HistoryPage from './pages/HistoryPage';
import EditReportPage from './pages/EditReportPage';
import EmailPage from './pages/EmailPage';

export default function App() {
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/create" replace />} />
          <Route path="/create" element={<CreateReportPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/edit/:reportId" element={<EditReportPage />} />
          <Route path="/email/:reportId" element={<EmailPage />} />
        </Routes>
      </Layout>
      <Toast />
    </>
  );
}
