import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AppLayout } from '../layouts/AppLayout';
import { LoginPage } from '../pages/LoginPage';
import HomePage from '../pages/HomePage';
import PackagesListPage from '../pages/PackagesListPage';
import PackagesCreatePage from '../pages/PackagesCreatePage';
import PackagesEditPage from '../pages/PackagesEditPage';
import AiExtractPage from '../pages/AiExtractPage';
import ExcelImportPage from '../pages/ExcelImportPage';
import RegisterPackagesPage from '../pages/RegisterPackagesPage';
import UpdateStatusBulkPage from '../pages/UpdateStatusBulkPage';
import AgenciesListPage from '../pages/AgenciesListPage';
import AgenciesCreatePage from '../pages/AgenciesCreatePage';
import AgenciesEditPage from '../pages/AgenciesEditPage';
import GuidesListPage from '../pages/GuidesListPage';
import GuidesCreatePage from '../pages/GuidesCreatePage';
import GuidesEditPage from '../pages/GuidesEditPage';
import RecipientsListPage from '../pages/RecipientsListPage';
import RecipientsCreatePage from '../pages/RecipientsCreatePage';
import RecipientsEditPage from '../pages/RecipientsEditPage';
import ProvincesListPage from '../pages/ProvincesListPage';
import ProvincesCreatePage from '../pages/ProvincesCreatePage';
import ProvincesEditPage from '../pages/ProvincesEditPage';
import MunicipesListPage from '../pages/MunicipesListPage';
import MunicipesCreatePage from '../pages/MunicipesCreatePage';
import MunicipesEditPage from '../pages/MunicipesEditPage';
import LocationsListPage from '../pages/LocationsListPage';
import LocationsCreatePage from '../pages/LocationsCreatePage';
import LocationsEditPage from '../pages/LocationsEditPage';
import StatusesListPage from '../pages/StatusesListPage';
import StatusesCreatePage from '../pages/StatusesCreatePage';
import StatusesEditPage from '../pages/StatusesEditPage';
import UsersListPage from '../pages/UsersListPage';
import UsersCreatePage from '../pages/UsersCreatePage';
import UsersEditPage from '../pages/UsersEditPage';
import RoutesListPage from '../pages/RoutesListPage';
import RoutesCreatePage from '../pages/RoutesCreatePage';
import RoutesEditPage from '../pages/RoutesEditPage';
import VehiclesListPage from '../pages/VehiclesListPage';
import VehiclesCreatePage from '../pages/VehiclesCreatePage';
import VehiclesEditPage from '../pages/VehiclesEditPage';
import DriversListPage from '../pages/DriversListPage';
import DriversCreatePage from '../pages/DriversCreatePage';
import DriversEditPage from '../pages/DriversEditPage';
import TestPage from '../pages/TestPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'packages', element: <PackagesListPage /> },
          { path: 'packages/new', element: <PackagesCreatePage /> },
          { path: 'packages/:id/edit', element: <PackagesEditPage /> },
          { path: 'agencies', element: <AgenciesListPage /> },
          { path: 'agencies/new', element: <AgenciesCreatePage /> },
          { path: 'agencies/:id/edit', element: <AgenciesEditPage /> },
          { path: 'guides', element: <GuidesListPage /> },
          { path: 'guides/new', element: <GuidesCreatePage /> },
          { path: 'guides/:id/edit', element: <GuidesEditPage /> },
          { path: 'recipients', element: <RecipientsListPage /> },
          { path: 'recipients/new', element: <RecipientsCreatePage /> },
          { path: 'recipients/:id/edit', element: <RecipientsEditPage /> },
          { path: 'provinces', element: <ProvincesListPage /> },
          { path: 'provinces/new', element: <ProvincesCreatePage /> },
          { path: 'provinces/:id/edit', element: <ProvincesEditPage /> },
          { path: 'municipes', element: <MunicipesListPage /> },
          { path: 'municipes/new', element: <MunicipesCreatePage /> },
          { path: 'municipes/:id/edit', element: <MunicipesEditPage /> },
          { path: 'locations', element: <LocationsListPage /> },
          { path: 'locations/new', element: <LocationsCreatePage /> },
          { path: 'locations/:id/edit', element: <LocationsEditPage /> },
          { path: 'statuses', element: <StatusesListPage /> },
          { path: 'statuses/new', element: <StatusesCreatePage /> },
          { path: 'statuses/:id/edit', element: <StatusesEditPage /> },
          { path: 'users', element: <UsersListPage /> },
          { path: 'users/new', element: <UsersCreatePage /> },
          { path: 'users/:id/edit', element: <UsersEditPage /> },
          { path: 'routes', element: <RoutesListPage /> },
          { path: 'routes/new', element: <RoutesCreatePage /> },
          { path: 'routes/:id/edit', element: <RoutesEditPage /> },
          { path: 'vehicles', element: <VehiclesListPage /> },
          { path: 'vehicles/new', element: <VehiclesCreatePage /> },
          { path: 'vehicles/:id/edit', element: <VehiclesEditPage /> },
          { path: 'drivers', element: <DriversListPage /> },
          { path: 'drivers/new', element: <DriversCreatePage /> },
          { path: 'drivers/:id/edit', element: <DriversEditPage /> },
          { path: 'test', element: <TestPage /> },
          { path: 'ai-extract', element: <AiExtractPage /> },
          { path: 'excel-import', element: <ExcelImportPage /> },
          { path: 'register-packages', element: <RegisterPackagesPage /> },
          { path: 'update-status-bulk', element: <UpdateStatusBulkPage /> },
        ],
      },
    ],
  },
]);
