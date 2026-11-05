import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../atoms/Button';
import { PageHeader } from './PageHeader';

const meta: Meta<typeof PageHeader> = {
  title: 'Molecules/PageHeader',
  component: PageHeader,
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {
  args: {
    title: 'Orders',
    subtitle: 'Manage customer orders',
    actions: (
      <>
        <Button variant="secondary">Refresh</Button>
        <Button variant="primary">New order</Button>
      </>
    ),
  },
};
