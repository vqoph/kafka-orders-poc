import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ChaosRateForm } from './ChaosRateForm';

const meta: Meta<typeof ChaosRateForm> = {
  title: 'Organisms/ChaosRateForm',
  component: ChaosRateForm,
};

export default meta;
type Story = StoryObj<typeof ChaosRateForm>;

function InteractiveChaosRateForm() {
  const [value, setValue] = useState('0.1');
  return (
    <ChaosRateForm
      title="Payment chaos"
      description="Control the artificial failure rate (0 = none, 1 = always fail)."
      currentRate={0.1}
      value={value}
      onChange={setValue}
      onSubmit={() => undefined}
      successMessage="Payment chaos rate updated"
    />
  );
}

export const Default: Story = {
  render: () => <InteractiveChaosRateForm />,
};

export const Loading: Story = {
  args: {
    title: 'Inventory chaos',
    description: 'Artificial failure rate for inventory-service (0–1).',
    value: '0',
    onChange: () => undefined,
    onSubmit: () => undefined,
    loading: true,
  },
};
