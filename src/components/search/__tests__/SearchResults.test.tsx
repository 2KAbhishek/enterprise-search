import { render, screen } from '@testing-library/react';
import { SearchResults } from '../SearchResults';
import { AggregatedSearchResult } from '@/types/search';
import { MCPSearchResult } from '@/types/mcp';

describe('SearchResults', () => {
  const mockSearchResults: MCPSearchResult[] = [
    {
      id: 'result-1',
      title: 'Test Issue #1',
      content: 'This is a test issue with some content to search through',
      url: 'https://example.com/issue/1',
      type: 'issue',
      source: 'jira',
      serverName: 'Company Jira',
      author: 'John Doe',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-16T14:30:00Z',
      metadata: {
        project: 'TEST',
        status: 'Open',
        priority: 'High'
      },
      relevanceScore: 95
    },
    {
      id: 'result-2',
      title: 'Documentation Page',
      content: 'Comprehensive documentation for the feature',
      url: 'https://example.com/docs/feature',
      type: 'page',
      source: 'confluence',
      serverName: 'Company Confluence',
      author: 'Jane Smith',
      updatedAt: '2024-01-10T09:15:00Z',
      metadata: {},
      relevanceScore: 75
    }
  ];

  const mockAggregatedResults: AggregatedSearchResult = {
    results: mockSearchResults,
    totalCount: 2,
    searchTime: 250,
    sources: {
      'Company Jira': {
        count: 1,
        status: 'success'
      },
      'Company Confluence': {
        count: 1,
        status: 'success'
      }
    }
  };

  it('should show initial state when no results and not searching', () => {
    render(<SearchResults results={null} isSearching={false} />);
    
    expect(screen.getByText(/enter a search query to get started/i))
      .toBeInTheDocument();
    expect(screen.getByText(/search across jira, confluence, github/i))
      .toBeInTheDocument();
  });

  it('should show searching state', () => {
    render(<SearchResults results={null} isSearching={true} />);
    
    expect(screen.getByText(/searching across your enterprise systems/i))
      .toBeInTheDocument();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should show no results found when results array is empty', () => {
    const emptyResults: AggregatedSearchResult = {
      ...mockAggregatedResults,
      results: [],
      totalCount: 0
    };
    
    render(<SearchResults results={emptyResults} isSearching={false} />);
    
    expect(screen.getByText(/no results found/i)).toBeInTheDocument();
    expect(screen.getByText(/try adjusting your search terms/i))
      .toBeInTheDocument();
  });

  it('should display search summary', () => {
    render(<SearchResults results={mockAggregatedResults} isSearching={false} />);
    
    expect(screen.getByText(/found 2 results in 250ms/i)).toBeInTheDocument();
  });

  it('should display source status indicators', () => {
    render(<SearchResults results={mockAggregatedResults} isSearching={false} />);
    
    expect(screen.getByText(/company jira \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/company confluence \(1\)/i)).toBeInTheDocument();
  });

  it('should display search result cards', () => {
    render(<SearchResults results={mockAggregatedResults} isSearching={false} />);
    
    // First result
    expect(screen.getByText('Test Issue #1')).toBeInTheDocument();
    expect(screen.getByText(/this is a test issue with some content/i))
      .toBeInTheDocument();
    expect(screen.getByText('Company Jira')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('TEST')).toBeInTheDocument();
    expect(screen.getByText('Score: 95')).toBeInTheDocument();
    
    // Second result
    expect(screen.getByText('Documentation Page')).toBeInTheDocument();
    expect(screen.getByText(/comprehensive documentation for the feature/i))
      .toBeInTheDocument();
    expect(screen.getByText('Company Confluence')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Score: 75')).toBeInTheDocument();
  });

  it('should display correct source icons', () => {
    render(<SearchResults results={mockAggregatedResults} isSearching={false} />);
    
    expect(screen.getByText('🎯')).toBeInTheDocument(); // Jira
    expect(screen.getByText('📚')).toBeInTheDocument(); // Confluence
  });

  it('should display type badges with correct colors', () => {
    render(<SearchResults results={mockAggregatedResults} isSearching={false} />);
    
    const issueBadge = screen.getByText('issue');
    const pageBadge = screen.getByText('page');
    
    expect(issueBadge).toHaveStyle('background-color: #dbeafe');
    expect(issueBadge).toHaveStyle('color: #1e40af');
    expect(pageBadge).toHaveStyle('background-color: #d1fae5');
    expect(pageBadge).toHaveStyle('color: #065f46');
  });

  it('should display formatted dates', () => {
    render(<SearchResults results={mockAggregatedResults} isSearching={false} />);
    
    const updatedElements = screen.getAllByText(/updated/i);
    expect(updatedElements.length).toBeGreaterThan(0);
  });

  it('should render external links correctly', () => {
    render(<SearchResults results={mockAggregatedResults} isSearching={false} />);
    
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', 'https://example.com/issue/1');
    expect(links[0]).toHaveAttribute('target', '_blank');
    expect(links[0]).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should handle missing optional fields gracefully', () => {
    const incompleteResult: MCPSearchResult = {
      id: 'incomplete',
      title: 'Minimal Result',
      content: 'Basic content',
      url: 'https://example.com',
      type: 'unknown',
      source: 'custom',
      serverName: 'Custom Server',
      metadata: {}
    };

    const incompleteResults: AggregatedSearchResult = {
      results: [incompleteResult],
      totalCount: 1,
      searchTime: 100,
      sources: {
        'Custom Server': {
          count: 1,
          status: 'success'
        }
      }
    };

    render(<SearchResults results={incompleteResults} isSearching={false} />);
    
    expect(screen.getByText('Minimal Result')).toBeInTheDocument();
    expect(screen.getByText('Basic content')).toBeInTheDocument();
  });

  it('should show error status for failed sources', () => {
    const resultsWithErrors: AggregatedSearchResult = {
      ...mockAggregatedResults,
      sources: {
        'Company Jira': {
          count: 1,
          status: 'success'
        },
        'Failed Server': {
          count: 0,
          status: 'error',
          error: 'Connection timeout'
        },
        'Timeout Server': {
          count: 0,
          status: 'timeout'
        }
      }
    };

    render(<SearchResults results={resultsWithErrors} isSearching={false} />);
    
    expect(screen.getByText(/failed server \(0\)/i)).toBeInTheDocument();
    expect(screen.getByText(/timeout server \(0\)/i)).toBeInTheDocument();
  });
});