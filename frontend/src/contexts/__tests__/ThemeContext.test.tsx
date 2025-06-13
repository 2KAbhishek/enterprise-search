import React from 'react';
import {render, screen, fireEvent, act} from '@testing-library/react';
import {ThemeProvider, useTheme} from '../ThemeContext';

const TestComponent = () => {
    const {theme, toggleTheme, colors} = useTheme();

    return (
        <div>
            <div data-testid='theme'>{theme}</div>
            <div data-testid='background-color'>{colors.background}</div>
            <div data-testid='foreground-color'>{colors.foreground}</div>
            <button onClick={toggleTheme} data-testid='toggle-button'>
                Toggle Theme
            </button>
        </div>
    );
};

describe('ThemeContext', () => {
    const mockLocalStorage = localStorage as jest.Mocked<typeof localStorage>;

    beforeEach(() => {
        mockLocalStorage.clear.mockClear();
        mockLocalStorage.getItem.mockClear();
        mockLocalStorage.setItem.mockClear();
        mockLocalStorage.removeItem.mockClear();

        // Default behavior - no saved theme
        mockLocalStorage.getItem.mockReturnValue(null);
    });

    it('provides default dark theme', () => {
        render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>
        );

        expect(screen.getByTestId('theme')).toHaveTextContent('dark');
        expect(screen.getByTestId('background-color')).toHaveTextContent(
            '#000000'
        );
        expect(screen.getByTestId('foreground-color')).toHaveTextContent(
            '#ffffff'
        );
    });

    it('loads saved theme from localStorage', () => {
        mockLocalStorage.getItem.mockReturnValue('light');

        render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>
        );

        expect(screen.getByTestId('theme')).toHaveTextContent('light');
        expect(screen.getByTestId('background-color')).toHaveTextContent(
            '#f8fafc'
        );
    });

    it('toggles from dark to light theme', () => {
        render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>
        );

        expect(screen.getByTestId('theme')).toHaveTextContent('dark');

        act(() => {
            fireEvent.click(screen.getByTestId('toggle-button'));
        });

        expect(screen.getByTestId('theme')).toHaveTextContent('light');
    });

    it('toggles from light to dark theme', () => {
        mockLocalStorage.getItem.mockReturnValue('light');

        render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>
        );

        expect(screen.getByTestId('theme')).toHaveTextContent('light');

        act(() => {
            fireEvent.click(screen.getByTestId('toggle-button'));
        });

        expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    });

    it('persists theme changes to localStorage', () => {
        render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>
        );

        act(() => {
            fireEvent.click(screen.getByTestId('toggle-button'));
        });

        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'light');

        act(() => {
            fireEvent.click(screen.getByTestId('toggle-button'));
        });

        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
    });

    it('provides correct light theme colors', () => {
        mockLocalStorage.getItem.mockReturnValue('light');

        render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>
        );

        expect(screen.getByTestId('background-color')).toHaveTextContent(
            '#f8fafc'
        );
        expect(screen.getByTestId('foreground-color')).toHaveTextContent(
            '#0f172a'
        );
    });

    it('provides correct dark theme colors', () => {
        mockLocalStorage.getItem.mockReturnValue('dark');

        render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>
        );

        expect(screen.getByTestId('background-color')).toHaveTextContent(
            '#000000'
        );
        expect(screen.getByTestId('foreground-color')).toHaveTextContent(
            '#ffffff'
        );
    });

    it('detects system preference when no saved theme', () => {
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
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>
        );

        expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    });

    it('falls back to light when system preference is light', () => {
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: jest.fn().mockImplementation((query) => ({
                matches: false,
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
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>
        );

        expect(screen.getByTestId('theme')).toHaveTextContent('light');
    });
});
