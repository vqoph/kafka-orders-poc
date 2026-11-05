import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DEFAULT_PAGE_SIZE } from '../../pagination';
import { PaginationControls } from './PaginationControls';

const meta: Meta<typeof PaginationControls> = {
  title: 'Molecules/PaginationControls',
  component: PaginationControls,
};

export default meta;
type Story = StoryObj<typeof PaginationControls>;

export const CompactTopRight: Story = {
  args: {
    page: 0,
    totalPages: 10,
    first: true,
    last: false,
    pageSize: DEFAULT_PAGE_SIZE,
    onPageChange: () => undefined,
    onPageSizeChange: () => undefined,
    className: 'justify-end',
  },
};

function InteractivePaginationControls() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const totalElements = 111;
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
  const safePage = Math.min(page, totalPages - 1);

  return (
    <PaginationControls
      page={safePage}
      totalPages={totalPages}
      first={safePage === 0}
      last={safePage >= totalPages - 1}
      pageSize={pageSize}
      onPageChange={setPage}
      onPageSizeChange={(size) => {
        setPageSize(size);
        setPage(0);
      }}
    />
  );
}

export const Interactive: Story = {
  render: () => <InteractivePaginationControls />,
};
