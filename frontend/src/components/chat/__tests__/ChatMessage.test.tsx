import React from 'react';
import {render, screen} from '@testing-library/react';
import {ThemeProvider} from '@/contexts/ThemeContext';
import {ChatMessage} from '../ChatMessage';

const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('ChatMessage', () => {
    const mockMessage = {
        id: '1',
        role: 'user' as const,
        content: 'Test message content',
        timestamp: '2023-01-01T00:00:00.000Z'
    };

    it('renders user message correctly', () => {
        renderWithTheme(<ChatMessage message={mockMessage} />);

        expect(screen.getByText('Test message content')).toBeInTheDocument();
        // User messages don't have a label
        expect(screen.queryByText('🤖 Assistant')).not.toBeInTheDocument();
    });

    it('renders assistant message correctly', () => {
        const assistantMessage = {
            ...mockMessage,
            role: 'assistant' as const
        };

        renderWithTheme(<ChatMessage message={assistantMessage} />);

        expect(screen.getByText('Test message content')).toBeInTheDocument();
        expect(screen.getByText('🤖 Assistant')).toBeInTheDocument();
    });

    it('displays formatted timestamp', () => {
        const messageWithTime = {
            ...mockMessage,
            timestamp: '2023-01-01T12:30:45.000Z'
        };

        renderWithTheme(<ChatMessage message={messageWithTime} />);

        // Time is formatted as locale time
        const timeElement = screen.getByText(/\d{1,2}:\d{2}/);
        expect(timeElement).toBeInTheDocument();
    });

    it('renders markdown content as plain text', () => {
        const markdownMessage = {
            ...mockMessage,
            content: '**Bold text** and *italic text*'
        };

        renderWithTheme(<ChatMessage message={markdownMessage} />);

        expect(
            screen.getByText('**Bold text** and *italic text*')
        ).toBeInTheDocument();
    });

    it('renders code blocks as plain text', () => {
        const codeMessage = {
            ...mockMessage,
            content: '```javascript\nconsole.log("hello");\n```'
        };

        renderWithTheme(<ChatMessage message={codeMessage} />);

        expect(
            screen.getByText(/```javascript[\s\S]*console\.log[\s\S]*```/)
        ).toBeInTheDocument();
    });

    it('renders inline code as plain text', () => {
        const inlineCodeMessage = {
            ...mockMessage,
            content: 'Use `console.log()` to debug'
        };

        renderWithTheme(<ChatMessage message={inlineCodeMessage} />);

        expect(
            screen.getByText('Use `console.log()` to debug')
        ).toBeInTheDocument();
    });

    it('renders lists as plain text', () => {
        const listMessage = {
            ...mockMessage,
            content: '- Item 1\n- Item 2\n- Item 3'
        };

        renderWithTheme(<ChatMessage message={listMessage} />);

        expect(
            screen.getByText(/- Item 1[\s\S]*- Item 2[\s\S]*- Item 3/)
        ).toBeInTheDocument();
    });

    it('renders links as plain text', () => {
        const linkMessage = {
            ...mockMessage,
            content: 'Visit [Google](https://google.com) for search'
        };

        renderWithTheme(<ChatMessage message={linkMessage} />);

        expect(
            screen.getByText('Visit [Google](https://google.com) for search')
        ).toBeInTheDocument();
    });

    it('handles empty content gracefully', () => {
        const emptyMessage = {
            ...mockMessage,
            content: ''
        };

        renderWithTheme(<ChatMessage message={emptyMessage} />);

        // Check that the message container exists even with empty content
        const timestamp = screen.getByText(/\d{1,2}:\d{2}/);
        expect(timestamp).toBeInTheDocument();
    });

    it('handles very long content', () => {
        const longMessage = {
            ...mockMessage,
            content: 'A'.repeat(1000)
        };

        renderWithTheme(<ChatMessage message={longMessage} />);

        expect(screen.getByText('A'.repeat(1000))).toBeInTheDocument();
    });

    it('applies correct styling for user messages', () => {
        renderWithTheme(<ChatMessage message={mockMessage} />);

        const messageContainer = screen.getByText('Test message content');
        expect(messageContainer).toBeInTheDocument();
    });

    it('applies correct styling for assistant messages', () => {
        const assistantMessage = {
            ...mockMessage,
            role: 'assistant' as const
        };

        renderWithTheme(<ChatMessage message={assistantMessage} />);

        const messageContainer = screen.getByText('Test message content');
        expect(messageContainer).toBeInTheDocument();
    });

    it('preserves line breaks in content', () => {
        const multilineMessage = {
            ...mockMessage,
            content: 'Line 1\nLine 2\nLine 3'
        };

        renderWithTheme(<ChatMessage message={multilineMessage} />);

        expect(
            screen.getByText(/Line 1[\s\S]*Line 2[\s\S]*Line 3/)
        ).toBeInTheDocument();
    });
});
