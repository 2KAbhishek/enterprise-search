import {ChatService} from '../ChatService';
import {ClaudeService} from '../ClaudeService';
import {MCPService} from '../MCPService';

// Mock the services
jest.mock('../ClaudeService');
jest.mock('../MCPService');

describe('ChatService', () => {
    let chatService: ChatService;
    let mockClaudeService: jest.Mocked<ClaudeService>;
    let mockMCPService: jest.Mocked<MCPService>;

    beforeEach(() => {
        jest.clearAllMocks();

        // Create mock instances
        mockClaudeService = {
            sendMessage: jest.fn(),
            setMCPService: jest.fn()
        } as unknown as jest.Mocked<ClaudeService>;

        mockMCPService = {
            connectToServers: jest.fn(),
            getConnectedServers: jest.fn(),
            queryAllServers: jest.fn(),
            disconnect: jest.fn()
        } as unknown as jest.Mocked<MCPService>;

        // Mock constructors
        (ClaudeService as jest.Mock).mockImplementation(
            () => mockClaudeService
        );
        (MCPService as jest.Mock).mockImplementation(() => mockMCPService);

        chatService = new ChatService();
    });

    describe('sendMessage', () => {
        it('should process message with MCP context', async () => {
            mockMCPService.connectToServers.mockResolvedValue(undefined);
            mockMCPService.getConnectedServers.mockReturnValue(['GitHub']);
            mockClaudeService.sendMessage.mockResolvedValue(
                'Here are your repositories: repo1, repo2'
            );

            const result = await chatService.sendMessage(
                'Show me my repositories'
            );

            expect(mockMCPService.connectToServers).toHaveBeenCalled();
            expect(mockClaudeService.setMCPService).toHaveBeenCalledWith(
                mockMCPService
            );
            expect(mockClaudeService.sendMessage).toHaveBeenCalledWith(
                'Show me my repositories'
            );
            expect(result).toBe('Here are your repositories: repo1, repo2');
        });

        it('should process message without MCP context when no servers connected', async () => {
            mockMCPService.connectToServers.mockResolvedValue(undefined);
            mockMCPService.getConnectedServers.mockReturnValue([]);
            mockClaudeService.sendMessage.mockResolvedValue(
                'I can help you with that.'
            );

            const result = await chatService.sendMessage('Hello');

            expect(mockClaudeService.sendMessage).toHaveBeenCalledWith('Hello');
            expect(result).toBe('I can help you with that.');
        });

        it('should handle MCP service errors gracefully', async () => {
            mockMCPService.connectToServers.mockRejectedValue(
                new Error('MCP connection failed')
            );
            mockMCPService.getConnectedServers.mockReturnValue([]);
            mockClaudeService.sendMessage.mockResolvedValue(
                'Sorry, I had trouble accessing your data.'
            );

            const result = await chatService.sendMessage('Test message');

            expect(mockClaudeService.sendMessage).toHaveBeenCalledWith(
                'Test message'
            );
            expect(result).toBe('Sorry, I had trouble accessing your data.');
        });

        it('should handle Claude service errors', async () => {
            mockMCPService.connectToServers.mockResolvedValue(undefined);
            mockMCPService.getConnectedServers.mockReturnValue([]);
            mockClaudeService.sendMessage.mockRejectedValue(
                new Error('Claude API error')
            );

            await expect(chatService.sendMessage('Test')).rejects.toThrow(
                'Failed to process your message. Please try again.'
            );
        });

        it('should initialize only once on multiple calls', async () => {
            mockMCPService.connectToServers.mockResolvedValue(undefined);
            mockMCPService.getConnectedServers.mockReturnValue([]);
            mockClaudeService.sendMessage.mockResolvedValue('Response');

            await chatService.sendMessage('Message 1');
            await chatService.sendMessage('Message 2');

            expect(mockMCPService.connectToServers).toHaveBeenCalledTimes(1);
        });
    });

    describe('shutdown', () => {
        it('should disconnect MCP service', async () => {
            mockMCPService.disconnect.mockResolvedValue(undefined);

            await chatService.shutdown();

            expect(mockMCPService.disconnect).toHaveBeenCalled();
        });

        it('should handle shutdown errors gracefully', async () => {
            mockMCPService.disconnect.mockRejectedValue(
                new Error('Disconnect failed')
            );

            await chatService.shutdown();

            expect(mockMCPService.disconnect).toHaveBeenCalled();
        });
    });
});
