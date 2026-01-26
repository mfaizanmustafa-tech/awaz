import { lazy } from 'react';
import authRoles from '../../auth/authRoles';

const OverviewPage = lazy(() => import('./overview/OverviewPage'));
const ControlPanelPage = lazy(() => import('./control-panel/ControlPanelPage'));
const MyChannelPage = lazy(() => import('./my-channel/MyChannelPage'));
const ShowsPage = lazy(() => import('./shows/ShowsPage'));
const PerformersPage = lazy(() => import('./performers/PerformersPage'));
const GuestsPage = lazy(() => import('./guests/GuestsPage'));
const AnalyticsPage = lazy(() => import('./analytics/AnalyticsPage'));

const StationOwnerConfig = {
  settings: {
    layout: {
      config: {},
    },
  },
  auth: authRoles.stationOwner,
  routes: [
    {
      path: 'station-owner/overview',
      element: <OverviewPage />,
    },
    {
      path: 'station-owner/control-panel',
      element: <ControlPanelPage />,
    },
    {
      path: 'station-owner/my-channel',
      element: <MyChannelPage />,
    },
    {
      path: 'station-owner/shows',
      element: <ShowsPage />,
    },
    {
      path: 'station-owner/performers',
      element: <PerformersPage />,
    },
    {
      path: 'station-owner/guests',
      element: <GuestsPage />,
    },
    {
      path: 'station-owner/analytics',
      element: <AnalyticsPage />,
    },
  ],
};

export default StationOwnerConfig;
