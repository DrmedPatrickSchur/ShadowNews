import styled, { css } from 'styled-components';
import { ButtonProps } from './Button.types';

const sizeStyles = {
 small: css`
   padding: 0.375rem 0.75rem;
   font-size: 0.875rem;
   line-height: 1.25rem;
 `,
 medium: css`
   padding: 0.5rem 1rem;
   font-size: 1rem;
   line-height: 1.5rem;
 `,
 large: css`
   padding: 0.75rem 1.5rem;
   font-size: 1.125rem;
   line-height: 1.75rem;
 `,
};

const variantStyles = {
 primary: css`
   background-color: var(--color-primary);
   color: white;
   border: 1px solid var(--color-primary);

   &:hover:not(:disabled) {
     background-color: var(--color-primary-dark);
     border-color: var(--color-primary-dark);
   }

   &:active:not(:disabled) {
     transform: translateY(1px);
   }
 `,
 secondary: css`
   background-color: var(--color-secondary);
   color: white;
   border: 1px solid var(--color-secondary);

   &:hover:not(:disabled) {
     background-color: var(--color-secondary-dark);
     border-color: var(--color-secondary-dark);
   }
 `,
 outline: css`
   background-color: transparent;
   color: var(--color-primary);
   border: 1px solid var(--color-primary);

   &:hover:not(:disabled) {
     background-color: var(--color-primary);
     color: white;
   }
 `,
 ghost: css`
   background-color: transparent;
   color: var(--color-text-primary);
   border: 1px solid transparent;

   &:hover:not(:disabled) {
     background-color: var(--color-gray-100);
     border-color: var(--color-gray-300);
   }
 `,
 danger: css`
   background-color: var(--color-danger);
   color: white;
   border: 1px solid var(--color-danger);

   &:hover:not(:disabled) {
     background-color: var(--color-danger-dark);
     border-color: var(--color-danger-dark);
   }
 `,
 success: css`
   background-color: var(--color-success);
   color: white;
   border: 1px solid var(--color-success);

   &:hover:not(:disabled) {
     background-color: var(--color-success-dark);
     border-color: var(--color-success-dark);
   }
 `,
 link: css`
   background-color: transparent;
   color: var(--color-primary);
   border: none;
   padding: 0;
   text-decoration: underline;

   &:hover:not(:disabled) {
     color: var(--color-primary-dark);
     text-decoration: none;
   }
 `,
};

export const StyledButton = styled.button<ButtonProps>`
 position: relative;
 display: inline-flex;
 align-items: center;
 justify-content: center;
 gap: 0.5rem;
 font-family: inherit;
 font-weight: 500;
 border-radius: 0.375rem;
 cursor: pointer;
 transition: all 0.2s ease-in-out;
 outline: none;
 user-select: none;
 white-space: nowrap;

 ${({ size = 'medium' }) => sizeStyles[size]}
 ${({ variant = 'primary' }) => variantStyles[variant]}

 ${({ fullWidth }) =>
   fullWidth &&
   css`
     width: 100%;
   `}

 ${({ rounded }) =>
   rounded &&
   css`
     border-radius: 9999px;
   `}

 &:focus-visible {
   box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.2);
 }

 &:disabled {
   opacity: 0.5;
   cursor: not-allowed;
 }

 ${({ loading }) =>
   loading &&
   css`
     color: transparent;
     pointer-events: none;
   `}
`;

export const IconWrapper = styled.span<{ position: 'left' | 'right' }>`
 display: inline-flex;
 align-items: center;
 ${({ position }) =>
   position === 'left'
     ? css`
         margin-right: 0.25rem;
       `
     : css`
         margin-left: 0.25rem;
       `}
`;

export const LoadingSpinner = styled.div`
 position: absolute;
 top: 50%;
 left: 50%;
 transform: translate(-50%, -50%);
 width: 1rem;
 height: 1rem;
 border: 2px solid transparent;
 border-top-color: currentColor;
 border-radius: 50%;
 animation: spin 0.6s linear infinite;

 @keyframes spin {
   to {
     transform: translate(-50%, -50%) rotate(360deg);
   }
 }
`;

export const Badge = styled.span`
 position: absolute;
 top: -0.25rem;
 right: -0.25rem;
 min-width: 1.25rem;
 height: 1.25rem;
 padding: 0 0.25rem;
 background-color: var(--color-danger);
 color: white;
 font-size: 0.75rem;
 font-weight: 600;
 line-height: 1.25rem;
 text-align: center;
 border-radius: 9999px;
 pointer-events: none;
`;

export const Ripple = styled.span`
 position: absolute;
 top: 50%;
 left: 50%;
 width: 0;
 height: 0;
 border-radius: 50%;
 background-color: rgba(255, 255, 255, 0.5);
 transform: translate(-50%, -50%);
 animation: ripple 0.6s ease-out;
 pointer-events: none;

 @keyframes ripple {
   to {
     width: 200%;
     height: 200%;
     opacity: 0;
   }
 }
`;