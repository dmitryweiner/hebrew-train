// Главный компонент приложения: роутинг в hash-режиме (работает на GitHub Pages без 404-трюков)

import { createHashRouter, Navigate, Outlet, RouterProvider } from 'react-router';
import HomePage from './pages/HomePage';
import PlayPage from './pages/PlayPage';
import UpdateBanner from './pwa/UpdateBanner';
import { ProgressProvider } from './state/ProgressProvider';

const Layout = () => (
  <div className="app-container">
    <Outlet />
    <UpdateBanner />
  </div>
);

const router = createHashRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/play/:kind', element: <PlayPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

function App() {
  return (
    <ProgressProvider>
      <RouterProvider router={router} />
    </ProgressProvider>
  );
}

export default App;
