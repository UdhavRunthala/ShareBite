import { BrowserRouter,Routes,Route,Link } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'framer-motion';
import { Toaster } from 'sonner';
import { queryClient } from './lib/api';
import { Layout } from './components/layout';
import { Landing } from './pages/landing';
import { EmptyState,Button } from './components/ui';
export default function App() { return <QueryClientProvider client={queryClient}><MotionConfig reducedMotion="user"><BrowserRouter><Routes><Route element={<Layout/>}><Route index element={<Landing/>}/><Route path="*" element={<div className="container section"><EmptyState title="This table has moved" description="Let’s get you back to the neighbourhood." action={<Button asChild><Link to="/">Back home</Link></Button>}/></div>}/></Route></Routes></BrowserRouter><Toaster position="top-right" richColors closeButton/></MotionConfig></QueryClientProvider>; }
