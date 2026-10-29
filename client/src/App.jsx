import './workspace.css';
import { Discovery,DonationDetail } from './pages/discovery';
import { BrowserRouter,Routes,Route,Link } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'framer-motion';
import { Toaster } from 'sonner';
import { queryClient } from './lib/api';
import { Layout } from './components/layout';
import { Landing } from './pages/landing';
import { EmptyState,Button } from './components/ui';
import { AuthProvider,Protected } from './lib/auth';
import { AuthPage } from './pages/auth';
import { Settings } from './pages/settings';
export default function App() { return <QueryClientProvider client={queryClient}><MotionConfig reducedMotion="user"><BrowserRouter><AuthProvider><Routes><Route element={<Layout/>}><Route index element={<Landing/>}/><Route path="discover" element={<Discovery/>}/><Route path="listings/:listingId" element={<DonationDetail/>}/><Route path="login" element={<AuthPage/>}/><Route path="settings" element={<Protected roles={['donor','ngo']}><Settings/></Protected>}/><Route path="*" element={<div className="container section"><EmptyState title="This table has moved" description="Let’s get you back to the neighbourhood." action={<Button asChild><Link to="/">Back home</Link></Button>}/></div>}/></Route></Routes></AuthProvider></BrowserRouter><Toaster position="top-right" richColors closeButton/></MotionConfig></QueryClientProvider>; }
