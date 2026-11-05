import type { Meta, StoryObj } from '@storybook/react';
import { CurrentValueCallout } from './CurrentValueCallout';

const meta: Meta<typeof CurrentValueCallout> = {
  title: 'Molecules/CurrentValueCallout',
  component: CurrentValueCallout,
  args: { label: 'Current rate', value: 0.25 },
};

export default meta;
type Story = StoryObj<typeof CurrentValueCallout>;

export const Default: Story = {};
