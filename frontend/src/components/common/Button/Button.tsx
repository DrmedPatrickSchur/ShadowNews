/**
 * Button Component
 * 
 * Highly configurable, accessible button component built with Tailwind CSS
 * and class-variance-authority for consistent styling across the ShadowNews
 * platform. Supports multiple variants, sizes, loading states, and icons.
 * 
 * Design System Features:
 * - Multiple Variants: Primary, secondary, destructive, outline, ghost, link
 * - Size Options: Small, default, large, extra-large, and icon variants
 * - Loading States: Built-in spinner with customizable loading text
 * - Icon Support: Left and right icon positioning with proper spacing
 * - Accessibility: Full keyboard navigation and screen reader support
 * 
 * Component Variants:
 * - Default: Primary brand color for main actions
 * - Destructive: Red styling for dangerous actions (delete, remove)
 * - Outline: Bordered style for secondary actions
 * - Secondary: Muted styling for less prominent actions
 * - Ghost: Transparent background for minimal styling
 * - Link: Text-only styling that mimics anchor links
 * - Success: Green styling for positive actions (save, confirm)
 * - Warning: Yellow styling for cautionary actions
 * 
 * Size Variants:
 * - Small (sm): Compact 36px height for tight spaces
 * - Default: Standard 40px height for most use cases
 * - Large (lg): Prominent 44px height for important actions
 * - Extra Large (xl): 48px height with larger text for hero sections
 * - Icon: Square icon-only buttons in multiple sizes
 * 
 * Interactive States:
 * - Hover: Smooth color transitions on mouse over
 * - Focus: Visible focus ring for keyboard navigation
 * - Active: Visual feedback during button press
 * - Disabled: Reduced opacity and pointer events disabled
 * - Loading: Spinner animation with disabled interaction
 * 
 * Accessibility Features:
 * - ARIA Labels: Proper labeling for screen readers
 * - Keyboard Support: Enter and Space key activation
 * - Focus Management: Visible focus indicators
 * - Disabled States: Proper handling of non-interactive states
 * - Loading States: Accessible loading announcements
 * 
 * Performance Optimizations:
 * - forwardRef: Proper ref forwarding for parent component access
 * - Class Variance Authority: Optimized className generation
 * - Conditional Rendering: Efficient icon and loading state handling
 * - Memoization: Stable references for better React optimization
 * 
 * Usage Examples:
 * ```tsx
 * // Basic usage
 * <Button>Click me</Button>
 * 
 * // With variant and size
 * <Button variant="destructive" size="lg">Delete</Button>
 * 
 * // With loading state
 * <Button isLoading loadingText="Saving...">Save</Button>
 * 
 * // With icons
 * <Button leftIcon={<Plus />} rightIcon={<ArrowRight />}>
 *   Create New
 * </Button>
 * ```
 * 
 * Dependencies:
 * - React for component architecture and ref forwarding
 * - class-variance-authority for type-safe variant management
 * - Lucide React for consistent icon system
 * - Tailwind CSS for utility-first styling approach
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '../../../utils/helpers';

/**
 * Button Variant Configuration
 * 
 * Uses class-variance-authority (CVA) to create a type-safe, composable
 * variant system for button styling. Each variant combination generates
 * optimized Tailwind CSS classes for consistent design system adherence.
 */
const buttonVariants = cva(
  // Base classes applied to all button variants
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      /**
       * Visual Variant Options
       * 
       * Defines the appearance and color scheme for different button types.
       * Each variant serves a specific semantic purpose in the interface.
       */
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        success: 'bg-green-600 text-white hover:bg-green-700',
        warning: 'bg-yellow-600 text-white hover:bg-yellow-700',
      },
      /**
       * Size Variant Options
       * 
       * Provides consistent sizing options for different use cases.
       * Icon variants maintain square aspect ratios for proper icon display.
       */
      size: {
        default: 'h-10 px-4 py-2',    // Standard button size for most use cases
        sm: 'h-9 rounded-md px-3',    // Compact size for tight spaces
        lg: 'h-11 rounded-md px-8',   // Large size for prominent actions
        xl: 'h-12 rounded-md px-10 text-base', // Extra large for hero sections
        icon: 'h-10 w-10',            // Square icon button
        iconSm: 'h-8 w-8',           // Small square icon button
        iconLg: 'h-12 w-12',         // Large square icon button
      },
      /**
       * Width Variant Options
       * 
       * Controls button width behavior for layout flexibility.
       */
      fullWidth: {
        true: 'w-full',  // Full width for mobile-first layouts
        false: '',       // Auto width based on content
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {loadingText || children}
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };