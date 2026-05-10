import type { AppProps } from 'next/app';
import '../styles/globals.css';
import Nav from '../components/Nav';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Nav />
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}