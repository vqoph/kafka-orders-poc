import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '../atoms/Input';
import { Field } from './Field';

const meta: Meta<typeof Field> = {
  title: 'Molecules/Field',
  component: Field,
};

export default meta;
type Story = StoryObj<typeof Field>;

export const Default: Story = {
  args: {
    label: 'Customer id',
    children: <Input defaultValue="cust-1" />,
  },
};

export const WithError: Story = {
  args: {
    label: 'Amount',
    error: 'Amount must be >= 0.01',
    children: <Input type="number" defaultValue="0" />,
  },
};
