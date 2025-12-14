import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import HomePage from '@/pages/HomePage';
import FleetPage from '@/pages/FleetPage';
import DriversPage from '@/pages/DriversPage';
import DispatchPage from '@/pages/DispatchPage';
import LoginPage from '@/pages/LoginPage';
import LandingPage from '@/pages/LandingPage';
import DriverPortal from '@/pages/DriverPortal';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="fleet" element={<FleetPage />} />
          <Route path="drivers" element={<DriversPage />} />
          <Route path="dispatch" element={<DispatchPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>

        {/* Driver Routes */}
        <Route path="/driver" element={<DriverPortal />} />
      </Routes>
    </Router>
  );
}

export default App;
