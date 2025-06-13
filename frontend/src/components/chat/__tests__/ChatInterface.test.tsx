import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {ThemeProvider} from '@/contexts/ThemeContext';
import {ChatInterface} from '../ChatInterface';
import {apiClient} from '@/lib/api';

jest.mock('@/lib/api');
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('ChatInterface', () => {
    const mockLocalStorage = localStorage as jest.Mocked<typeof localStorage>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockLocalStorage.clear.mockClear();
        mockLocalStorage.getItem.mockClear();
        mockLocalStorage.setItem.mockClear();
        mockLocalStorage.removeItem.mockClear();

        // Default behavior - return empty chat history
        mockLocalStorage.getItem.mockReturnValue('[]');
    });

    it('renders welcome message initially', () => {
        renderWithTheme(<ChatInterface />);

        expect(
            screen.getByText('Welcome to Enterprise Search')
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                /I can help you find information from your connected systems/
            )
        ).toBeInTheDocument();
    });

    it('renders chat input', () => {
        renderWithTheme(<ChatInterface />);

        expect(
            screen.getByPlaceholderText('Ask me about your enterprise data...')
        ).toBeInTheDocument();
    });

    it('sends message and displays response', async () => {
        const mockResponse = {
            success: true,
            response: 'Test response from API',
            timestamp: new Date().toISOString()
        };

        mockApiClient.sendMessage.mockResolvedValueOnce(mockResponse);

        renderWithTheme(<ChatInterface />);

        const input = screen.getByPlaceholderText(
            'Ask me about your enterprise data...'
        );
        const sendButton = screen.getByRole('button');

        fireEvent.change(input, {target: {value: 'test message'}});
        fireEvent.click(sendButton);

        await waitFor(() => {
            expect(screen.getByText('test message')).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(
                screen.getByText('Test response from API')
            ).toBeInTheDocument();
        });

        expect(mockApiClient.sendMessage).toHaveBeenCalledWith('test message');
    });

    it('handles API error', async () => {
        mockApiClient.sendMessage.mockRejectedValueOnce(
            new Error('Network error')
        );

        renderWithTheme(<ChatInterface />);

        const input = screen.getByPlaceholderText(
            'Ask me about your enterprise data...'
        );
        const sendButton = screen.getByRole('button');

        fireEvent.change(input, {target: {value: 'test message'}});
        fireEvent.click(sendButton);

        await waitFor(() => {
            expect(
                screen.getByText(/Sorry, I encountered an error: Network error/)
            ).toBeInTheDocument();
        });
    });

    it('shows loading state while sending message', async () => {
        let resolvePromise: (value: unknown) => void;
        const promise = new Promise((resolve) => {
            resolvePromise = resolve;
        });

        mockApiClient.sendMessage.mockReturnValueOnce(
            promise as Promise<{
                success: boolean;
                response: string;
                timestamp: string;
            }>
        );

        renderWithTheme(<ChatInterface />);

        const input = screen.getByPlaceholderText(
            'Ask me about your enterprise data...'
        );
        const sendButton = screen.getByRole('button');

        fireEvent.change(input, {target: {value: 'test message'}});
        fireEvent.click(sendButton);

        expect(
            screen.getByText('Assistant is thinking...')
        ).toBeInTheDocument();

        resolvePromise!({
            success: true,
            response: 'Response',
            timestamp: new Date().toISOString()
        });

        await waitFor(() => {
            expect(
                screen.queryByText('Assistant is thinking...')
            ).not.toBeInTheDocument();
        });
    });
});
