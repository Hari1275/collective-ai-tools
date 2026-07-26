import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CompactToolCard from './CompactToolCard';
import type { Tool } from '../../types/tools';

const tool: Tool = {
  name: 'Example Tool',
  url: 'https://example.com',
  description: 'An example tool for testing.',
  tags: ['testing'],
};

describe('CompactToolCard', () => {
  it('keeps the external-link affordance visible without hover', () => {
    const { container } = render(
      <CompactToolCard tool={tool} rank={1} onTrackClick={vi.fn()} />
    );

    const arrow = container.querySelector('svg')?.parentElement;

    expect(arrow).toHaveClass('opacity-60', 'group-hover:opacity-100');
    expect(arrow).not.toHaveClass('opacity-0');
  });
});
