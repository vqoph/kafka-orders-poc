import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Atoms/Input',
  component: Input,
  args: { placeholder: 'Enter value' },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {};
export const Number: Story = { args: { type: 'number', min: 0, step: 0.05 } };
