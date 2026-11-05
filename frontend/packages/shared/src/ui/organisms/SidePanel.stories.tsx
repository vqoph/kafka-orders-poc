import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Field } from '../molecules/Field';
import { FormPanel } from '../molecules/FormPanel';
import { SidePanel } from './SidePanel';

const meta: Meta<typeof SidePanel> = {
  title: 'Organisms/SidePanel',
  component: SidePanel,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof SidePanel>;

function InteractiveSidePanel() {
  const [open, setOpen] = useState(true);

  return (
    <div className="min-h-screen bg-surface p-6">
      <Button variant="primary" onClick={() => setOpen(true)}>
        Open panel
      </Button>
      {open ? (
        <SidePanel title="Create order" onClose={() => setOpen(false)}>
          <FormPanel
            onSubmit={(e) => {
              e.preventDefault();
              setOpen(false);
            }}
            className="space-y-3"
          >
            <Field label="Customer id">
              <Input defaultValue="cust-1" />
            </Field>
            <Field label="Amount">
              <Input type="number" defaultValue="19.99" />
            </Field>
            <Button type="submit" variant="primary" size="lg">
              Create order
            </Button>
          </FormPanel>
        </SidePanel>
      ) : null}
    </div>
  );
}

export const Default: Story = {
  render: () => <InteractiveSidePanel />,
};
