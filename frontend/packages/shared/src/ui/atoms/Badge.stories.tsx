import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Atoms/Badge',
  component: Badge,
  args: { children: 'Status' },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Neutral: Story = { args: { tone: 'neutral' } };
export const Success: Story = { args: { tone: 'success', pill: true, children: 'Connected' } };
export const Danger: Story = { args: { tone: 'danger', pill: true, children: 'Disconnected' } };
export const Accent: Story = { args: { tone: 'accent' } };
