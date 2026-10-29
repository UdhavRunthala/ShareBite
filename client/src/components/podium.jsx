import { Crown, Medal } from 'lucide-react';
import { Avatar, Badge, Reveal } from './ui';
import { number, tierFor } from '../lib/utils';
export function Podium({ entries = [] }) {
  if (!entries.length) return null;
  const ordered = [entries[1], entries[0], entries[2]].filter(Boolean);
  return <div className="podium">{ordered.map(entry => { const place = entries.indexOf(entry) + 1; return <Reveal key={entry._id} delay={place * .08} className={`podium-entry place-${place}`}><div className="podium-person">{place === 1 && <Crown className="podium-crown" size={28}/>}<Avatar name={entry.name} size={place === 1 ? 76 : 60}/><h3>{entry.name}</h3><Badge>{tierFor(entry.mealsServed)}</Badge></div><div className="podium-plinth"><Medal size={20}/><strong>{number(entry.mealsServed)}</strong><span>meals served</span><b>0{place}</b></div></Reveal>; })}</div>;
}
