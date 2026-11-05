import type { Meta, StoryObj } from '@storybook/react';
import { ErrorBoundary } from './ErrorBoundary';

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Organisms/ErrorBoundary',
  component: ErrorBoundary,
};

export default meta;
type Story = StoryObj<typeof ErrorBoundary>;

function Boom(): never {
  throw new Error('Remote webpack server is not running');
}

export const WithError: Story = {
  args: {
    name: 'orders',
    children: <Boom />,
  },
};

export const Healthy: Story = {
  args: {
    name: 'orders',
    children: <p className="text-foreground">Remote loaded successfully.</p>,
  },
};
