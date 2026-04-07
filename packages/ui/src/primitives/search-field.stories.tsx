import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchField } from './search-field';

const meta: Meta = {
  title: 'Primitives/SearchField',
  component: SearchField,
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: function Render() {
    const [value, setValue] = useState('');
    return <SearchField value={value} onChange={setValue} />;
  },
};

export const WithValue: Story = {
  render: function Render() {
    const [value, setValue] = useState('react');
    return <SearchField value={value} onChange={setValue} />;
  },
};

export const CustomPlaceholder: Story = {
  render: function Render() {
    const [value, setValue] = useState('');
    return <SearchField value={value} onChange={setValue} placeholder="Filter items…" />;
  },
};
