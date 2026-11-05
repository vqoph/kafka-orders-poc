import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '../atoms/Badge';
import { ListCard } from './ListCard';

const meta: Meta<typeof ListCard> = {
  title: 'Molecules/ListCard',
  component: ListCard,
};

export default meta;
type Story = StoryObj<typeof ListCard>;

export const Default: Story = {
  args: {
    interactive: true,
    children: (
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-sm text-accent">order-123</span>
        <Badge>CREATED</Badge>
      </div>
    ),
  },
};
