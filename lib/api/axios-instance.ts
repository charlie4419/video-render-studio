import Axios, { AxiosRequestConfig } from 'axios';

export const axiosClient = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000',
});

export const axiosInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  const source = Axios.CancelToken.source();
  const promise = axiosClient({
    ...config,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-expect-error orval cancel token
  promise.cancel = () => {
    source.cancel('Query was cancelled by React Query');
  };

  return promise;
};

export default axiosInstance;
