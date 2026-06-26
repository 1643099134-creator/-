import { QueryClient } from '@tanstack/react-query';
import { createRouter } from '@tanstack/react-router';
import { createHashHistory } from '@tanstack/history';
import { routeTree } from './routeTree.gen';

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    history: createHashHistory(),
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
