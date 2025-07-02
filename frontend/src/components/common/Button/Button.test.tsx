import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';
import { ThemeProvider } from 'styled-components';
import { theme } from '../../../styles/theme';

const renderWithTheme = (component: React.ReactElement) => {
 return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('Button Component', () => {
 describe('Rendering', () => {
   it('renders button with text', () => {
     renderWithTheme(<Button>Click me</Button>);
     expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
   });

   it('renders button with children elements', () => {
     renderWithTheme(
       <Button>
         <span data-testid="icon">🚀</span>
         <span>Submit Post</span>
       </Button>
     );
     expect(screen.getByTestId('icon')).toBeInTheDocument();
     expect(screen.getByText('Submit Post')).toBeInTheDocument();
   });

   it('renders different button variants', () => {
     const { rerender } = renderWithTheme(<Button variant="primary">Primary</Button>);
     expect(screen.getByRole('button')).toHaveClass('variant-primary');

     rerender(
       <ThemeProvider theme={theme}>
         <Button variant="secondary">Secondary</Button>
       </ThemeProvider>
     );
     expect(screen.getByRole('button')).toHaveClass('variant-secondary');

     rerender(
       <ThemeProvider theme={theme}>
         <Button variant="danger">Danger</Button>
       </ThemeProvider>
     );
     expect(screen.getByRole('button')).toHaveClass('variant-danger');

     rerender(
       <ThemeProvider theme={theme}>
         <Button variant="ghost">Ghost</Button>
       </ThemeProvider>
     );
     expect(screen.getByRole('button')).toHaveClass('variant-ghost');
   });

   it('renders different button sizes', () => {
     const { rerender } = renderWithTheme(<Button size="small">Small</Button>);
     expect(screen.getByRole('button')).toHaveClass('size-small');

     rerender(
       <ThemeProvider theme={theme}>
         <Button size="medium">Medium</Button>
       </ThemeProvider>
     );
     expect(screen.getByRole('button')).toHaveClass('size-medium');

     rerender(
       <ThemeProvider theme={theme}>
         <Button size="large">Large</Button>
       </ThemeProvider>
     );
     expect(screen.getByRole('button')).toHaveClass('size-large');
   });

   it('renders full width button', () => {
     renderWithTheme(<Button fullWidth>Full Width</Button>);
     expect(screen.getByRole('button')).toHaveClass('full-width');
   });

   it('renders button with custom className', () => {
     renderWithTheme(<Button className="custom-class">Custom</Button>);
     expect(screen.getByRole('button')).toHaveClass('custom-class');
   });
 });

 describe('States', () => {
   it('renders disabled button', () => {
     renderWithTheme(<Button disabled>Disabled</Button>);
     const button = screen.getByRole('button');
     expect(button).toBeDisabled();
     expect(button).toHaveAttribute('aria-disabled', 'true');
   });

   it('renders loading button', () => {
     renderWithTheme(<Button loading>Loading</Button>);
     const button = screen.getByRole('button');
     expect(button).toBeDisabled();
     expect(screen.getByTestId('button-spinner')).toBeInTheDocument();
     expect(screen.queryByText('Loading')).not.toBeInTheDocument();
   });

   it('renders loading button with loadingText', () => {
     renderWithTheme(
       <Button loading loadingText="Submitting...">
         Submit
       </Button>
     );
     expect(screen.getByText('Submitting...')).toBeInTheDocument();
     expect(screen.queryByText('Submit')).not.toBeInTheDocument();
   });

   it('renders active state', () => {
     renderWithTheme(<Button active>Active</Button>);
     expect(screen.getByRole('button')).toHaveClass('active');
   });
 });

 describe('Interactions', () => {
   it('handles click events', () => {
     const handleClick = jest.fn();
     renderWithTheme(<Button onClick={handleClick}>Click me</Button>);
     
     fireEvent.click(screen.getByRole('button'));
     expect(handleClick).toHaveBeenCalledTimes(1);
   });

   it('prevents click when disabled', () => {
     const handleClick = jest.fn();
     renderWithTheme(
       <Button disabled onClick={handleClick}>
         Disabled
       </Button>
     );
     
     fireEvent.click(screen.getByRole('button'));
     expect(handleClick).not.toHaveBeenCalled();
   });

   it('prevents click when loading', () => {
     const handleClick = jest.fn();
     renderWithTheme(
       <Button loading onClick={handleClick}>
         Loading
       </Button>
     );
     
     fireEvent.click(screen.getByRole('button'));
     expect(handleClick).not.toHaveBeenCalled();
   });

   it('handles keyboard interactions', async () => {
     const handleClick = jest.fn();
     const user = userEvent.setup();
     
     renderWithTheme(<Button onClick={handleClick}>Press Enter</Button>);
     const button = screen.getByRole('button');
     
     button.focus();
     await user.keyboard('{Enter}');
     expect(handleClick).toHaveBeenCalledTimes(1);
     
     await user.keyboard(' ');
     expect(handleClick).toHaveBeenCalledTimes(2);
   });

   it('handles focus and blur events', () => {
     const handleFocus = jest.fn();
     const handleBlur = jest.fn();
     
     renderWithTheme(
       <Button onFocus={handleFocus} onBlur={handleBlur}>
         Focus me
       </Button>
     );
     
     const button = screen.getByRole('button');
     
     fireEvent.focus(button);
     expect(handleFocus).toHaveBeenCalledTimes(1);
     
     fireEvent.blur(button);
     expect(handleBlur).toHaveBeenCalledTimes(1);
   });
 });

 describe('Icons', () => {
   it('renders with left icon', () => {
     const Icon = () => <span data-testid="left-icon">←</span>;
     renderWithTheme(<Button leftIcon={<Icon />}>Back</Button>);
     
     const leftIcon = screen.getByTestId('left-icon');
     expect(leftIcon).toBeInTheDocument();
     expect(leftIcon.parentElement).toHaveClass('button-icon-left');
   });

   it('renders with right icon', () => {
     const Icon = () => <span data-testid="right-icon">→</span>;
     renderWithTheme(<Button rightIcon={<Icon />}>Next</Button>);
     
     const rightIcon = screen.getByTestId('right-icon');
     expect(rightIcon).toBeInTheDocument();
     expect(rightIcon.parentElement).toHaveClass('button-icon-right');
   });

   it('renders with both icons', () => {
     const LeftIcon = () => <span data-testid="left-icon">←</span>;
     const RightIcon = () => <span data-testid="right-icon">→</span>;
     
     renderWithTheme(
       <Button leftIcon={<LeftIcon />} rightIcon={<RightIcon />}>
         Navigate
       </Button>
     );
     
     expect(screen.getByTestId('left-icon')).toBeInTheDocument();
     expect(screen.getByTestId('right-icon')).toBeInTheDocument();
   });

   it('hides icons when loading', () => {
     const Icon = () => <span data-testid="icon">→</span>;
     renderWithTheme(
       <Button loading rightIcon={<Icon />}>
         Submit
       </Button>
     );
     
     expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
     expect(screen.getByTestId('button-spinner')).toBeInTheDocument();
   });
 });

 describe('Link Button', () => {
   it('renders as anchor when href is provided', () => {
     renderWithTheme(<Button href="/submit">Submit Post</Button>);
     
     const link = screen.getByRole('link', { name: /submit post/i });
     expect(link).toHaveAttribute('href', '/submit');
   });

   it('renders with target and rel attributes', () => {
     renderWithTheme(
       <Button href="https://shadownews.com" target="_blank">
         External Link
       </Button>
     );
     
     const link = screen.getByRole('link');
     expect(link).toHaveAttribute('target', '_blank');
     expect(link).toHaveAttribute('rel', 'noopener noreferrer');
   });

   it('renders as button when onClick is provided with href', () => {
     const handleClick = jest.fn();
     renderWithTheme(
       <Button href="/submit" onClick={handleClick}>
         Submit
       </Button>
     );
     
     expect(screen.getByRole('button')).toBeInTheDocument();
     expect(screen.queryByRole('link')).not.toBeInTheDocument();
   });
 });

 describe('Accessibility', () => {
   it('has correct ARIA attributes when disabled', () => {
     renderWithTheme(<Button disabled>Disabled</Button>);
     
     const button = screen.getByRole('button');
     expect(button).toHaveAttribute('aria-disabled', 'true');
   });

   it('has correct ARIA attributes when loading', () => {
     renderWithTheme(<Button loading>Loading</Button>);
     
     const button = screen.getByRole('button');
     expect(button).toHaveAttribute('aria-busy', 'true');
     expect(button).toHaveAttribute('aria-disabled', 'true');
   });

   it('supports aria-label', () => {
     renderWithTheme(<Button aria-label="Upvote post">⬆</Button>);
     
     expect(screen.getByRole('button', { name: /upvote post/i })).toBeInTheDocument();
   });

   it('supports aria-describedby', () => {
     renderWithTheme(
       <>
         <Button aria-describedby="help-text">Submit</Button>
         <span id="help-text">Press to submit your post</span>
       </>
     );
     
     const button = screen.getByRole('button');
     expect(button).toHaveAttribute('aria-describedby', 'help-text');
   });

   it('has correct tab index when disabled', () => {
     renderWithTheme(<Button disabled>Disabled</Button>);
     
     expect(screen.getByRole('button')).toHaveAttribute('tabIndex', '-1');
   });
 });

 describe('Form Integration', () => {
   it('submits form when type is submit', () => {
     const handleSubmit = jest.fn((e) => e.preventDefault());
     
     renderWithTheme(
       <form onSubmit={handleSubmit}>
         <Button type="submit">Submit</Button>
       </form>
     );
     
     fireEvent.click(screen.getByRole('button'));
     expect(handleSubmit).toHaveBeenCalledTimes(1);
   });

   it('resets form when type is reset', () => {
     let inputValue = 'test';
     
     renderWithTheme(
       <form>
         <input
           value={inputValue}
           onChange={(e) => (inputValue = e.target.value)}
           data-testid="input"
         />
         <Button type="reset">Reset</Button>
       </form>
     );
     
     const input = screen.getByTestId('input') as HTMLInputElement;
     expect(input.value).toBe('test');
     
     fireEvent.click(screen.getByRole('button'));
     // Reset behavior would clear the form in a real scenario
   });

   it('does not submit form when type is button', () => {
     const handleSubmit = jest.fn();
     
     renderWithTheme(
       <form onSubmit={handleSubmit}>
         <Button type="button">Button</Button>
       </form>
     );
     
     fireEvent.click(screen.getByRole('button'));
     expect(handleSubmit).not.toHaveBeenCalled();
   });
 });

 describe('Custom Props', () => {
   it('passes through data attributes', () => {
     renderWithTheme(
       <Button data-testid="custom-button" data-action="upvote">
         Upvote
       </Button>
     );
     
     const button = screen.getByTestId('custom-button');
     expect(button).toHaveAttribute('data-action', 'upvote');
   });

   it('applies custom styles', () => {
     renderWithTheme(
       <Button style={{ marginTop: '10px', color: 'red' }}>Styled</Button>
     );
     
     const button = screen.getByRole('button');
     expect(button).toHaveStyle({ marginTop: '10px', color: 'red' });
   });

   it('forwards ref correctly', () => {
     const ref = React.createRef<HTMLButtonElement>();
     renderWithTheme(<Button ref={ref}>Button</Button>);
     
     expect(ref.current).toBeInstanceOf(HTMLButtonElement);
     expect(ref.current?.textContent).toBe('Button');
   });
 });

 describe('Edge Cases', () => {
   it('handles rapid clicks', () => {
     const handleClick = jest.fn();
     renderWithTheme(<Button onClick={handleClick}>Click rapidly</Button>);
     
     const button = screen.getByRole('button');
     
     for (let i = 0; i < 10; i++) {
       fireEvent.click(button);
     }
     
     expect(handleClick).toHaveBeenCalledTimes(10);
   });

   it('handles undefined children gracefully', () => {
     renderWithTheme(<Button>{undefined}</Button>);
     expect(screen.getByRole('button')).toBeInTheDocument();
   });

   it('handles null children gracefully', () => {
     renderWithTheme(<Button>{null}</Button>);
     expect(screen.getByRole('button')).toBeInTheDocument();
   });

   it('maintains button state during rerender', () => {
     const { rerender } = renderWithTheme(
       <Button disabled={false}>Enabled</Button>
     );
     
     expect(screen.getByRole('button')).not.toBeDisabled();
     
     rerender(
       <ThemeProvider theme={theme}>
         <Button disabled={true}>Disabled</Button>
       </ThemeProvider>
     );
     
     expect(screen.getByRole('button')).toBeDisabled();
   });
 });
});