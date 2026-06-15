import { defineConfig } from 'orval';

export default defineConfig({
  videoRender: {
    input: {
      target: 'http://video.helloipju.com/docs-json',
    },
    output: {
      mode: 'tags-split',
      target: 'lib/api/generated',
      schemas: 'lib/api/models',
      client: 'react-query',
      httpClient: 'axios',
      override: {
        mutator: {
          path: 'lib/api/axios-instance.ts',
          name: 'axiosInstance',
        },
        query: {
          useQuery: true,
          useMutation: true,
          signal: true,
        },
      },
    },
  },
});
