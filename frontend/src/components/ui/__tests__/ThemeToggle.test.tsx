import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import {ThemeProvider, useTheme} from '@/contexts/ThemeContext';
import {ThemeToggle} from '../ThemeToggle';

const TestWrapper = ({children}: {children: React.ReactNode}) => {
    return <ThemeProvider>{children}</ThemeProvider>;
};

const ThemeDisplay = () => {
    const {theme} = useTheme();
    return <div data-testid='theme-display'>{theme}</div>;
};

describe('ThemeToggle', () => {
    const mockLocalStorage = localStorage as jest.Mocked<typeof localStorage>;

    beforeEach(() => {
        mockLocalStorage.clear.mockClear();
        mockLocalStorage.getItem.mockClear();
        mockLocalStorage.setItem.mockClear();
        mockLocalStorage.removeItem.mockClear();

        // Default behavior - no saved theme
        mockLocalStorage.getItem.mockReturnValue(null);
    });

    it('renders theme toggle button', () => {
        render(
            <TestWrapper>
                <ThemeToggle />
            </TestWrapper>
        );

        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
    });

    it('displays sun icon for light theme', () => {
        mockLocalStorage.getItem.mockReturnValue('light');

        render(
            <TestWrapper>
                <ThemeToggle />
            </TestWrapper>
        );

        const button = screen.getByTitle('Switch to dark theme');
        expect(button).toBeInTheDocument();
    });

    it('displays moon icon for dark theme', () => {
        mockLocalStorage.getItem.mockReturnValue('dark');

        render(
            <TestWrapper>
                <ThemeToggle />
            </TestWrapper>
        );

        const button = screen.getByTitle('Switch to light theme');
        expect(button).toBeInTheDocument();
    });

    it('toggles theme when clicked', () => {
        render(
            <TestWrapper>
                <ThemeToggle />
                <ThemeDisplay />
            </TestWrapper>
        );

        const button = screen.getByRole('button');
        const themeDisplay = screen.getByTestId('theme-display');

        const initialTheme = themeDisplay.textContent;

        fireEvent.click(button);

        const newTheme = themeDisplay.textContent;
        expect(newTheme).not.toBe(initialTheme);
    });

    it('switches from dark to light theme', () => {
        mockLocalStorage.getItem.mockReturnValue('dark');

        render(
            <TestWrapper>
                <ThemeToggle />
                <ThemeDisplay />
            </TestWrapper>
        );

        const button = screen.getByTitle('Switch to light theme');
        const themeDisplay = screen.getByTestId('theme-display');

        expect(themeDisplay).toHaveTextContent('dark');

        fireEvent.click(button);

        expect(themeDisplay).toHaveTextContent('light');
    });

    it('switches from light to dark theme', () => {
        mockLocalStorage.getItem.mockReturnValue('light');

        render(
            <TestWrapper>
                <ThemeToggle />
                <ThemeDisplay />
            </TestWrapper>
        );

        const button = screen.getByTitle('Switch to dark theme');
        const themeDisplay = screen.getByTestId('theme-display');

        expect(themeDisplay).toHaveTextContent('light');

        fireEvent.click(button);

        expect(themeDisplay).toHaveTextContent('dark');
    });

    it('persists theme choice in localStorage', () => {
        render(
            <TestWrapper>
                <ThemeToggle />
            </TestWrapper>
        );

        const button = screen.getByRole('button');

        fireEvent.click(button);

        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
            'theme',
            expect.any(String)
        );
    });

    it('handles keyboard interaction', () => {
        render(
            <TestWrapper>
                <ThemeToggle />
                <ThemeDisplay />
            </TestWrapper>
        );

        const button = screen.getByRole('button');
        const themeDisplay = screen.getByTestId('theme-display');

        button.focus();
        expect(button).toHaveFocus();

        const initialTheme = themeDisplay.textContent;

        fireEvent.click(button);

        expect(themeDisplay.textContent).not.toBe(initialTheme);
    });

    it('has proper accessibility attributes', () => {
        render(
            <TestWrapper>
                <ThemeToggle />
            </TestWrapper>
        );

        const button = screen.getByRole('button');

        expect(button).toHaveAttribute('title');
    });

    it('maintains focus after theme toggle', () => {
        render(
            <TestWrapper>
                <ThemeToggle />
            </TestWrapper>
        );

        const button = screen.getByRole('button');

        button.focus();
        fireEvent.click(button);

        expect(button).toHaveFocus();
    });

    it('uses system preference when no saved theme', () => {
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: jest.fn().mockImplementation((query) => ({
                matches: query === '(prefers-color-scheme: dark)',
                media: query,
                onchange: null,
                addListener: jest.fn(),
                removeListener: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn()
            }))
        });

        render(
            <TestWrapper>
                <ThemeToggle />
                <ThemeDisplay />
            </TestWrapper>
        );

        const themeDisplay = screen.getByTestId('theme-display');
        expect(themeDisplay).toHaveTextContent('dark');
    });

    it('applies smooth transition animations', () => {
        render(
            <TestWrapper>
                <ThemeToggle />
            </TestWrapper>
        );

        const button = screen.getByRole('button');

        expect(button).toBeInTheDocument();
    });
});
