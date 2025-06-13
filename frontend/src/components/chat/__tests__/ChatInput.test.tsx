import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import {ThemeProvider} from '@/contexts/ThemeContext';
import {ChatInput} from '../ChatInput';

const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('ChatInput', () => {
    const mockOnSendMessage = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders with default placeholder', () => {
        renderWithTheme(<ChatInput onSendMessage={mockOnSendMessage} />);

        expect(
            screen.getByPlaceholderText('Ask me about your enterprise data...')
        ).toBeInTheDocument();
    });

    it('renders with custom placeholder', () => {
        renderWithTheme(
            <ChatInput
                onSendMessage={mockOnSendMessage}
                placeholder='Custom placeholder'
            />
        );

        expect(
            screen.getByPlaceholderText('Custom placeholder')
        ).toBeInTheDocument();
    });

    it('allows typing in textarea', () => {
        renderWithTheme(<ChatInput onSendMessage={mockOnSendMessage} />);

        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        fireEvent.change(textarea, {target: {value: 'test message'}});

        expect(textarea.value).toBe('test message');
    });

    it('calls onSendMessage when send button is clicked', () => {
        renderWithTheme(<ChatInput onSendMessage={mockOnSendMessage} />);

        const textarea = screen.getByRole('textbox');
        const sendButton = screen.getByRole('button');

        fireEvent.change(textarea, {target: {value: 'test message'}});
        fireEvent.click(sendButton);

        expect(mockOnSendMessage).toHaveBeenCalledWith('test message');
    });

    it('calls onSendMessage when Enter is pressed', () => {
        renderWithTheme(<ChatInput onSendMessage={mockOnSendMessage} />);

        const textarea = screen.getByRole('textbox');

        fireEvent.change(textarea, {target: {value: 'test message'}});
        fireEvent.keyDown(textarea, {key: 'Enter', shiftKey: false});

        expect(mockOnSendMessage).toHaveBeenCalledWith('test message');
    });

    it('does not send message when Shift+Enter is pressed', () => {
        renderWithTheme(<ChatInput onSendMessage={mockOnSendMessage} />);

        const textarea = screen.getByRole('textbox');

        fireEvent.change(textarea, {target: {value: 'test message'}});
        fireEvent.keyDown(textarea, {key: 'Enter', shiftKey: true});

        expect(mockOnSendMessage).not.toHaveBeenCalled();
    });

    it('clears textarea after sending message', () => {
        renderWithTheme(<ChatInput onSendMessage={mockOnSendMessage} />);

        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        const sendButton = screen.getByRole('button');

        fireEvent.change(textarea, {target: {value: 'test message'}});
        fireEvent.click(sendButton);

        expect(textarea.value).toBe('');
    });

    it('does not send empty or whitespace-only messages', () => {
        renderWithTheme(<ChatInput onSendMessage={mockOnSendMessage} />);

        const textarea = screen.getByRole('textbox');
        const sendButton = screen.getByRole('button');

        fireEvent.change(textarea, {target: {value: '   '}});
        fireEvent.click(sendButton);

        expect(mockOnSendMessage).not.toHaveBeenCalled();
    });

    it('trims whitespace from messages', () => {
        renderWithTheme(<ChatInput onSendMessage={mockOnSendMessage} />);

        const textarea = screen.getByRole('textbox');
        const sendButton = screen.getByRole('button');

        fireEvent.change(textarea, {target: {value: '  test message  '}});
        fireEvent.click(sendButton);

        expect(mockOnSendMessage).toHaveBeenCalledWith('test message');
    });

    it('disables input when disabled prop is true', () => {
        renderWithTheme(
            <ChatInput onSendMessage={mockOnSendMessage} disabled={true} />
        );

        const textarea = screen.getByRole('textbox');
        const sendButton = screen.getByRole('button');

        expect(textarea).toBeDisabled();
        expect(sendButton).toBeDisabled();
    });

    it('does not send message when disabled', () => {
        renderWithTheme(
            <ChatInput onSendMessage={mockOnSendMessage} disabled={true} />
        );

        const textarea = screen.getByRole('textbox');
        const sendButton = screen.getByRole('button');

        fireEvent.change(textarea, {target: {value: 'test message'}});
        fireEvent.click(sendButton);

        expect(mockOnSendMessage).not.toHaveBeenCalled();
    });

    it('applies center mode styling when centerMode is true', () => {
        renderWithTheme(
            <ChatInput onSendMessage={mockOnSendMessage} centerMode={true} />
        );

        const textarea = screen.getByRole('textbox');
        expect(textarea).toHaveStyle({borderRadius: '20px'});
    });

    it('applies regular styling when centerMode is false', () => {
        renderWithTheme(
            <ChatInput onSendMessage={mockOnSendMessage} centerMode={false} />
        );

        const textarea = screen.getByRole('textbox');
        expect(textarea).toHaveStyle({borderRadius: '12px'});
    });

    it('button is disabled when input is empty', () => {
        renderWithTheme(<ChatInput onSendMessage={mockOnSendMessage} />);

        const sendButton = screen.getByRole('button');
        expect(sendButton).toBeDisabled();
    });

    it('button is enabled when input has content', () => {
        renderWithTheme(<ChatInput onSendMessage={mockOnSendMessage} />);

        const textarea = screen.getByRole('textbox');
        const sendButton = screen.getByRole('button');

        fireEvent.change(textarea, {target: {value: 'test'}});
        expect(sendButton).toBeEnabled();
    });
});
