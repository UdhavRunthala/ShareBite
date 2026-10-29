import React from 'react';
import ReactDOM from 'react-dom/client';
import { MotionConfig } from 'framer-motion';
import { Brand, ThemeToggle, Card, Badge, Button, CountdownRing, StatusTimeline, StatCard } from './components/ui';
import './styles.css';
function DesignPreview() { return <main className="container section"><div className="between"><Brand/><ThemeToggle/></div><div className="page-heading"><div className="eyebrow">The neighbourhood table</div><h1>ShareBite</h1><p>A little sharing. A lot of good.</p></div><div className="grid-2"><Card style={{ padding: 28 }}><Badge>Made for Jaipur</Badge><h2 style={{ margin: '20px 0' }}>Good food deserves<br/><em>another chance.</em></h2><CountdownRing until={new Date(Date.now() + 7200000)}/><StatusTimeline status="Claimed"/><Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to the table</Button></Card><StatCard label="A shared design system" value={4} unit="journey stages" note="From kitchen to community"/></div></main>; }
ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><MotionConfig reducedMotion="user"><DesignPreview/></MotionConfig></React.StrictMode>);
