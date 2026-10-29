import { Link,Outlet,useLocation } from 'react-router-dom';
import { ArrowUpRight,MapPin,Heart } from 'lucide-react';
import { Brand,ThemeToggle,Button } from './ui';
import { useEffect } from 'react';
export function Layout() {
  const location=useLocation();
  useEffect(()=>{if(!location.hash)window.scrollTo(0,0);},[location.pathname,location.hash]);
  return <><a href="#main-content" className="skip-link">Skip to content</a><header className="site-header"><div className="container header-inner"><Link to="/" aria-label="ShareBite home"><Brand/></Link><nav className="desktop-nav" aria-label="Main navigation"><a href="/#sharing">Explore food</a><a href="/#how-it-works">How it works</a><a href="/#community">Our community</a></nav><div className="row header-actions"><span className="location-tag"><MapPin size={13}/>Jaipur, India</span><ThemeToggle/><Button asChild size="sm"><a href="/#sharing">Find your next table<ArrowUpRight size={14}/></a></Button></div></div></header><main id="main-content"><Outlet/></main><footer className="site-footer"><div className="container"><div className="footer-top"><div><Brand/><p>Good food. Good neighbours.<br/>A little more good in the world.</p></div><div><span className="eyebrow">Around the table</span><a href="/#sharing">Food being shared</a><a href="/#how-it-works">How ShareBite works</a><a href="/#community">Community organisations</a></div><div className="footer-note"><Heart size={23}/><h3>Made with care.<br/>Shared with love.</h3><p>Starting in Jaipur. Growing through kindness.</p></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} ShareBite</span><span>Hackathon demo · Organisations and histories are illustrative.</span><span>Every meal matters.</span></div></div></footer></>;
}
