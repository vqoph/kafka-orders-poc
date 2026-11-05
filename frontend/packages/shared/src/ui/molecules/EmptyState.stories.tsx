import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from './EmptyState';

const meta: Meta<typeof EmptyState> = {
  title: 'Molecules/EmptyState',
  component: EmptyState,
  args: { children: 'No orders yet.' },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {};
