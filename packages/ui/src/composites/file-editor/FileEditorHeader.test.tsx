import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, mock, test, vi } from "vitest";
import { FileEditorHeader } from './FileEditorHeader';

// Mock lucide-react icons
vi.fn('lucide-react', () => ({
  Edit: ({ size }: { size: number }) => (
    <span data-testid="edit-icon" style={{ width: size, height: size }}>
      Edit
    </span>
  ),
  Save: ({ size }: { size: number }) => (
    <span data-testid="save-icon" style={{ width: size, height: size }}>
      Save
    </span>
  ),
  X: ({ size }: { size: number }) => (
    <span data-testid="x-icon" style={{ width: size, height: size }}>
      X
    </span>
  ),
}));

// Mock getFileIcon
vi.fn('../file-browser/utils', () => ({
  getFileIcon: (name: string, size: number) => <span data-testid={`file-icon-${name}`}>icon</span>,
}));

describe('FileEditorHeader', () => {
  const makeProps = () => ({
    fileName: 'test.ts',
    filePath: '/src/test.ts',
    editMode: false,
    hasUnsaved: false,
    onEdit: vi.fn(() => {}),
    onSave: vi.fn(() => {}),
    onCancel: vi.fn(() => {}),
  });

  test('renders file name', () => {
    const props = makeProps();
    render(<FileEditorHeader {...props} />);
    expect(screen.getByText('test.ts')).toBeTruthy();
  });

  test('renders file path', () => {
    const props = makeProps();
    render(<FileEditorHeader {...props} />);
    expect(screen.getByText('/src/test.ts')).toBeTruthy();
  });

  test('shows unsaved indicator when hasUnsaved is true', () => {
    const props = makeProps();
    props.hasUnsaved = true;
    render(<FileEditorHeader {...props} />);
    expect(screen.getByText('test.ts •')).toBeTruthy();
  });

  test('does not show unsaved indicator when hasUnsaved is false', () => {
    const props = makeProps();
    props.hasUnsaved = false;
    render(<FileEditorHeader {...props} />);
    expect(screen.queryByText('•')).toBeNull();
  });

  test('shows Edit button when not in edit mode', () => {
    const props = makeProps();
    props.editMode = false;
    render(<FileEditorHeader {...props} />);
    expect(screen.getByText('Edit')).toBeTruthy();
  });

  test('calls onEdit when Edit button is clicked', () => {
    const props = makeProps();
    props.editMode = false;
    render(<FileEditorHeader {...props} />);
    fireEvent.click(screen.getByText('Edit'));
    expect(props.onEdit).toHaveBeenCalled();
  });

  test('shows Save and Cancel buttons when in edit mode', () => {
    const props = makeProps();
    props.editMode = true;
    render(<FileEditorHeader {...props} />);
    expect(screen.getByText('Save')).toBeTruthy();
    expect(screen.getByText('X')).toBeTruthy();
  });

  test('calls onSave when Save button is clicked', () => {
    const props = makeProps();
    props.editMode = true;
    props.hasUnsaved = true;
    render(<FileEditorHeader {...props} />);
    fireEvent.click(screen.getByText('Save'));
    expect(props.onSave).toHaveBeenCalled();
  });

  test('Save button is disabled when hasUnsaved is false', () => {
    const props = makeProps();
    props.editMode = true;
    props.hasUnsaved = false;
    render(<FileEditorHeader {...props} />);
    const saveButton = screen.getByText('Save').closest('button');
    expect(saveButton).toBeDisabled();
  });

  test('calls onCancel when Cancel button is clicked', () => {
    const props = makeProps();
    props.editMode = true;
    render(<FileEditorHeader {...props} />);
    fireEvent.click(screen.getByText('X'));
    expect(props.onCancel).toHaveBeenCalled();
  });
});
