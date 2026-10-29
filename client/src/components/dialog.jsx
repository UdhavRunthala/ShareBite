import { useEffect,useRef,useId } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui';
export function Dialog({ open,onClose,title,children }) {
  const ref=useRef(null),id=useId();
  useEffect(()=>{ const dialog=ref.current;if(open&&!dialog.open)dialog.showModal();if(!open&&dialog.open)dialog.close(); },[open]);
  return <dialog ref={ref} className="dialog" aria-labelledby={id} onCancel={onClose} onClick={event=>{if(event.target===ref.current)onClose();}}><div className="dialog-content"><div className="between" style={{marginBottom:24}}><h3 id={id}>{title}</h3><Button variant="ghost" size="icon" onClick={onClose} aria-label="Close dialog"><X size={20}/></Button></div>{children}</div></dialog>;
}
