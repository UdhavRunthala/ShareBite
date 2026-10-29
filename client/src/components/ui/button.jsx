import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';
const variants = cva('btn', { variants: { variant: { default: 'btn-primary', secondary: 'btn-secondary', ghost: 'btn-ghost', destructive: 'btn-danger' }, size: { default: '', sm: 'btn-sm', icon: 'btn-icon' } }, defaultVariants: { variant: 'default', size: 'default' } });
export const Button = forwardRef(function Button({ className, variant, size, asChild = false, ...props }, ref) { const Comp = asChild ? Slot : 'button'; return <Comp className={cn(variants({ variant, size }), className)} ref={ref} {...props} />; });
