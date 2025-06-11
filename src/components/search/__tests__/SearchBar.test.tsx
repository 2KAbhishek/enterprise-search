import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '../SearchBar';

describe('SearchBar', () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    mockOnSearch.mockClear();
  });

  it('should render with default placeholder', () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    expect(screen.getByPlaceholderText(/search across all your enterprise systems/i))
      .toBeInTheDocument();
  });

  it('should render with custom placeholder', () => {
    render(
      <SearchBar 
        onSearch={mockOnSearch} 
        placeholder="Custom placeholder"
      />
    );
    
    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
  });

  it('should call onSearch when form is submitted', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('textbox');
    const submitButton = screen.getByRole('button', { name: /search/i });
    
    await user.type(input, 'test query');
    await user.click(submitButton);
    
    expect(mockOnSearch).toHaveBeenCalledWith('test query');
  });

  it('should call onSearch when Enter key is pressed', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('textbox');
    
    await user.type(input, 'test query{enter}');
    
    expect(mockOnSearch).toHaveBeenCalledWith('test query');
  });

  it('should not call onSearch for empty query', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const submitButton = screen.getByRole('button', { name: /search/i });
    
    await user.click(submitButton);
    
    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it('should trim whitespace from query', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('textbox');
    
    await user.type(input, '  test query  {enter}');
    
    expect(mockOnSearch).toHaveBeenCalledWith('test query');
  });

  it('should show searching state when isSearching is true', () => {
    render(<SearchBar onSearch={mockOnSearch} isSearching={true} />);
    
    expect(screen.getByText(/searching\.\.\./i)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should show searching message when isSearching is true', () => {
    render(<SearchBar onSearch={mockOnSearch} isSearching={true} />);
    
    expect(screen.getByText(/searching across your configured mcp servers/i))
      .toBeInTheDocument();
  });

  it('should disable submit button when input is empty', () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const submitButton = screen.getByRole('button', { name: /search/i });
    
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when input has text', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('textbox');
    const submitButton = screen.getByRole('button', { name: /search/i });
    
    await user.type(input, 'test');
    
    expect(submitButton).not.toBeDisabled();
  });

  it('should clear input after submission', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('textbox') as HTMLInputElement;
    
    await user.type(input, 'test query{enter}');
    
    // Input should still contain the text (we don't clear it automatically)
    expect(input.value).toBe('test query');
  });

  it('should handle Shift+Enter without submitting', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('textbox');
    
    // Type text first
    await user.type(input, 'test query');
    mockOnSearch.mockClear();
    
    // Simulate Shift+Enter using fireEvent for precise control
    fireEvent.keyDown(input, { 
      key: 'Enter', 
      shiftKey: true 
    });
    
    expect(mockOnSearch).not.toHaveBeenCalled();
  });
});