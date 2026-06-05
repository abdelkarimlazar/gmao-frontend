import { Navigate, Route, Routes } from 'react-router-dom';

import AdminLayout from '../components/AdminLayout';
import ProtectedRoute from '../components/ProtectedRoute';

import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Users from '../pages/Users';
import Equipments from '../pages/Equipments';
import Tasks from '../pages/Tasks';
import Breakdowns from '../pages/Breakdowns';
import Notifications from '../pages/Notifications';
import Intent from '../pages/Intent';

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/users"
            element={<Users />}
          />

          <Route
            path="/equipments"
            element={<Equipments />}
          />

          <Route
            path="/tasks"
            element={<Tasks />}
          />

          <Route
            path="/breakdowns"
            element={<Breakdowns />}
          />
          <Route
            path="/notifications"
            element={<Notifications />}
          />
          <Route
            path="/intent"
            element={<Intent />}
          />

        </Route>
      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />
    </Routes>
  );
}

export default AppRoutes;