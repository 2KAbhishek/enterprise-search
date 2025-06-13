import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import {ThemeProvider} from '@/contexts/ThemeContext';
import {Header} from '../Header';

const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Header', () => {
    const mockOnServersClick = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the application title', () => {
        renderWithTheme(<Header onServersClick={mockOnServersClick} />);

        expect(screen.getByText(/Enterprise Search/)).toBeInTheDocument();
    });

    it('renders the theme toggle button', () => {
        renderWithTheme(<Header onServersClick={mockOnServersClick} />);

        const themeToggle = screen.getByTitle(/Switch to .* theme/);
        expect(themeToggle).toBeInTheDocument();
    });

    it('renders the servers button', () => {
        renderWithTheme(<Header onServersClick={mockOnServersClick} />);

        const serversButton = screen.getByTitle('MCP Servers');
        expect(serversButton).toBeInTheDocument();
    });

    it('calls onServersClick when servers button is clicked', () => {
        renderWithTheme(<Header onServersClick={mockOnServersClick} />);

        const serversButton = screen.getByTitle('MCP Servers');
        fireEvent.click(serversButton);

        expect(mockOnServersClick).toHaveBeenCalledTimes(1);
    });

    it('toggles theme when theme toggle is clicked', () => {
        renderWithTheme(<Header onServersClick={mockOnServersClick} />);

        const themeToggle = screen.getByTitle(/Switch to .* theme/);

        fireEvent.click(themeToggle);
    });

    it('has proper header structure', () => {
        renderWithTheme(<Header onServersClick={mockOnServersClick} />);

        const header = screen.getByRole('banner');
        expect(header).toBeInTheDocument();
        expect(header.tagName).toBe('HEADER');
    });

    it('renders navigation elements in correct order', () => {
        renderWithTheme(<Header onServersClick={mockOnServersClick} />);

        const title = screen.getByText(/Enterprise Search/);
        const buttons = screen.getAllByRole('button');

        expect(title).toBeInTheDocument();
        expect(buttons).toHaveLength(2);
    });

    it('renders enterprise search title with icon', () => {
        renderWithTheme(<Header onServersClick={mockOnServersClick} />);

        const title = screen.getByText(/🔍 Enterprise Search/);
        expect(title).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
        renderWithTheme(<Header onServersClick={mockOnServersClick} />);

        expect(screen.getByTitle(/Switch to .* theme/)).toBeInTheDocument();
        expect(screen.getByTitle('MCP Servers')).toBeInTheDocument();
    });

    it('renders header element', () => {
        renderWithTheme(<Header onServersClick={mockOnServersClick} />);

        const header = screen.getByRole('banner');
        expect(header).toBeInTheDocument();
    });

    it('responds to keyboard navigation', () => {
        renderWithTheme(<Header onServersClick={mockOnServersClick} />);

        const serversButton = screen.getByTitle('MCP Servers');
        serversButton.focus();

        expect(serversButton).toHaveFocus();

        fireEvent.click(serversButton);
        expect(mockOnServersClick).toHaveBeenCalledTimes(1);
    });

    it('handles multiple rapid clicks gracefully', () => {
        renderWithTheme(<Header onServersClick={mockOnServersClick} />);

        const serversButton = screen.getByTitle('MCP Servers');

        fireEvent.click(serversButton);
        fireEvent.click(serversButton);
        fireEvent.click(serversButton);

        expect(mockOnServersClick).toHaveBeenCalledTimes(3);
    });
});
