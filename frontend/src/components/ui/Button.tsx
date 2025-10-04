import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-odoo text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-odoo-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-odoo-primary text-white hover:bg-odoo-primary-dark',
        destructive: 'bg-odoo-danger text-white hover:bg-red-600',
        outline: 'border border-odoo-border bg-white hover:bg-odoo-gray-50 text-odoo-gray-600',
        secondary: 'bg-odoo-secondary text-white hover:bg-blue-600',
        ghost: 'hover:bg-odoo-gray-50 text-odoo-gray-600',
        link: 'text-odoo-primary underline-offset-4 hover:underline',
        success: 'bg-odoo-success text-white hover:bg-green-600',
        warning: 'bg-odoo-warning text-white hover:bg-yellow-500',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };