import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Field } from './Field';
import { FormPanel } from './FormPanel';

const meta: Meta<typeof FormPanel> = {
  title: 'Molecules/FormPanel',
  component: FormPanel,
};

export default meta;
type Story = StoryObj<typeof FormPanel>;

export const Default: Story = {
  args: {
    onSubmit: (e) => e.preventDefault(),
    children: (
      <>
        <Field label="Name">
          <Input />
        </Field>
        <Button type="submit" variant="primary">
          Save
        </Button>
      </>
    ),
  },
};
