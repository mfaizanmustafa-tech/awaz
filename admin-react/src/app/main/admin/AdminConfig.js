import { lazy } from 'react';

const OverviewPage = lazy(() => import('./overview/OverviewPage'));
const UsersPage = lazy(() => import('./users/UsersPage'));
const StationsPage = lazy(() => import('./stations/StationsPage'));
const AnalyticsPage = lazy(() => import('./analytics/AnalyticsPage'));
const RealtimePage = lazy(() => import('./realtime/RealtimePage'));
const ModerationPage = lazy(() => import('./moderation/ModerationPage'));
const ContentPage = lazy(() => import('./content/ContentPage'));
const SettingsPage = lazy(() => import('./settings/SettingsPage'));
const LogsPage = lazy(() => import('./logs/LogsPage'));
const BackupPage = lazy(() => import('./backup/BackupPage'));

const AdminConfig = {
  settings: {
    layout: {
      config: {},
    },
  },
  routes: [
    {
      path: 'admin/overview',
      element: <OverviewPage />,
    },
    {
      path: 'admin/users',
      element: <UsersPage />,
    },
    {
      path: 'admin/stations',
      element: <StationsPage />,
    },
    {
      path: 'admin/analytics',
      element: <AnalyticsPage />,
    },
    {
      path: 'admin/realtime',
      element: <RealtimePage />,
    },
    {
      path: 'admin/moderation',
      element: <ModerationPage />,
    },
    {
      path: 'admin/content',
      element: <ContentPage />,
    },
    {
      path: 'admin/settings',
      element: <SettingsPage />,
    },
    {
      path: 'admin/logs',
      element: <LogsPage />,
    },
    {
      path: 'admin/backup',
      element: <BackupPage />,
    },
  ],
};

export default AdminConfig;
