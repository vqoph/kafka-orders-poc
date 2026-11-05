import type { Meta, StoryObj } from '@storybook/react';
import { PageHeader } from '../molecules/PageHeader';
import { PageShell } from './PageShell';

const meta: Meta<typeof PageShell> = {
  title: 'Organisms/PageShell',
  component: PageShell,
};

export default meta;
type Story = StoryObj<typeof PageShell>;

export const Default: Story = {
  args: {
    maxWidth: 'md',
    children: <PageHeader title="Notifications" subtitle="Live SSE stream" />,
  },
};
