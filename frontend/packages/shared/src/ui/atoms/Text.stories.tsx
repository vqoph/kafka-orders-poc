import type { Meta, StoryObj } from '@storybook/react';
import { ErrorText } from './ErrorText';
import { LoadingText } from './LoadingText';
import { SuccessText } from './SuccessText';

const meta: Meta = {
  title: 'Atoms/Text',
};

export default meta;

export const Loading: StoryObj = {
  render: () => <LoadingText />,
};

export const Error: StoryObj = {
  render: () => <ErrorText>Something went wrong</ErrorText>,
};

export const Success: StoryObj = {
  render: () => <SuccessText>Saved successfully</SuccessText>,
};
