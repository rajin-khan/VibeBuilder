import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  componentRegistry,
  VibeBlockRenderer,
} from './component-registry';
import { PropertiesInspector } from './properties-inspector';
import { InspectorField, InspectorTab, VibeBlock, VibeBlockType } from '../types';

const registryEntries = Object.entries(componentRegistry) as [
  VibeBlockType,
  (typeof componentRegistry)[VibeBlockType],
][];

const makeBlock = (type: VibeBlockType): VibeBlock => ({
  id: `test-${type}`,
  type,
  props: componentRegistry[type].defaultProps,
});

const makeBlockWithProps = (type: VibeBlockType, props: Record<string, unknown>): VibeBlock => ({
  id: `test-${type}`,
  type,
  props: { ...componentRegistry[type].defaultProps, ...props },
});

const tabs: InspectorTab[] = ['content', 'style', 'advanced'];

const visibleFields = (fields: InspectorField[], tab: InspectorTab, props: Record<string, unknown>) =>
  fields.filter((field) => (field.tab ?? 'content') === tab && (!field.visibleWhen || field.visibleWhen(props)));

const firstListItem = (value: unknown) =>
  Array.isArray(value) && typeof value[0] === 'object' && value[0] !== null
    ? (value[0] as Record<string, unknown>)
    : {};

const interactWithField = (container: HTMLElement, block: VibeBlock, field: InspectorField) => {
  const baseTestId = `inspector-field-${block.type}-${field.key}`;
  const byTestId = (suffix = '') => container.querySelector(`[data-testid="${baseTestId}${suffix}"]`) as HTMLElement | null;

  if (field.type === 'buttonGroup' || field.type === 'spacing' || field.type === 'icon') {
    const options = Array.from(container.querySelectorAll(`[data-testid^="${baseTestId}-"]`)) as HTMLElement[];
    expect(options.length, `${baseTestId} options`).toBeGreaterThan(0);
    options.forEach((option) => fireEvent.click(option));
    return;
  }

  if (field.type === 'color') {
    const input = byTestId('-inline') as HTMLInputElement | null;
    expect(input, `${baseTestId} inline color`).toBeTruthy();
    fireEvent.change(input as HTMLInputElement, { target: { value: '#19D3B5' } });
    return;
  }

  if (field.type === 'boolean') {
    const toggle = byTestId();
    expect(toggle, `${baseTestId} toggle`).toBeTruthy();
    fireEvent.click(toggle as HTMLElement);
    return;
  }

  if (field.type === 'list') {
    const list = byTestId();
    expect(list, `${baseTestId} list`).toBeTruthy();
    const firstItem = firstListItem(block.props[field.key]);
    field.itemFields?.forEach((itemField) => {
      if (!itemField.visibleWhen || itemField.visibleWhen(firstItem)) {
        interactWithField(container, block, itemField);
      }
    });
    const addButton = Array.from((list as HTMLElement).querySelectorAll('button')).find((button) =>
      button.textContent?.includes(`Add ${field.itemLabel ?? 'item'}`)
    );
    expect(addButton, `${baseTestId} add button`).toBeTruthy();
    fireEvent.click(addButton as HTMLElement);
    return;
  }

  const input = byTestId() as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
  expect(input, `${baseTestId} input`).toBeTruthy();

  if (field.type === 'select') {
    const options = Array.from((input as HTMLSelectElement).options);
    expect(options.length, `${baseTestId} select options`).toBeGreaterThan(0);
    options.forEach((option) => {
      fireEvent.change(input as HTMLSelectElement, { target: { value: option.value } });
    });
    return;
  }

  if (field.type === 'range' || field.type === 'number') {
    fireEvent.change(input as HTMLInputElement, { target: { value: String(field.min ?? 1) } });
    return;
  }

  fireEvent.change(input as HTMLInputElement, { target: { value: 'QA editable value' } });
};

describe('Vibe component registry', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('keeps every component type wired to a registry definition', () => {
    expect(registryEntries).toHaveLength(57);

    registryEntries.forEach(([type, definition]) => {
      expect(definition.type).toBe(type);
      expect(definition.name).toBeTruthy();
      expect(definition.category).toBeTruthy();
      expect(definition.defaultProps).toBeTruthy();
      expect(Array.isArray(definition.fields)).toBe(true);
    });
  });

  it.each(registryEntries)('renders the %s block without crashing', (type) => {
    render(<VibeBlockRenderer block={makeBlock(type)} />);

    expect(document.body).not.toBeEmptyDOMElement();
  });

  it('renders a representative contact form with expected fields', () => {
    render(<VibeBlockRenderer block={makeBlock('contact')} />);

    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send message' })).toBeInTheDocument();
  });

  it.each(registryEntries)('exposes and updates every inspector tab for %s', (type, definition) => {
    const block = makeBlock(type);
    const onChange = vi.fn();
    const onUploadImage = vi.fn();
    const { container } = render(
      <PropertiesInspector
        block={block}
        uploading={false}
        onChange={onChange}
        onUploadImage={onUploadImage}
      />
    );

    tabs.forEach((tab) => {
      const tabButton = screen.getByTestId(`inspector-tab-${tab}`);
      fireEvent.click(tabButton);

      const fields = visibleFields(definition.fields, tab, block.props);
      fields.forEach((field) => interactWithField(container, block, field));
    });

    expect(screen.getByTestId('inspector-title')).toHaveTextContent(definition.name);
  });

  it.each([
    ['hero', 'right', ['items-end', 'text-right', 'justify-end']],
    ['hero', 'center', ['items-center', 'text-center', 'justify-center']],
    ['heading', 'right', ['text-right']],
    ['paragraph', 'center', ['mx-auto', 'text-center']],
    ['iconBox', 'right', ['items-end', 'text-right']],
    ['image', 'left', ['mr-auto']],
    ['image', 'right', ['ml-auto']],
    ['cta', 'right', ['ml-auto', 'text-right', 'justify-end']],
    ['button', 'right', ['justify-end']],
    ['socialIcons', 'left', ['justify-start']],
    ['imageCaption', 'right', ['ml-auto', 'text-right']],
    ['quote', 'right', ['ml-auto', 'text-right']],
    ['columns', 'right', ['text-right']],
  ] as const)('maps %s %s alignment to rendered layout classes', (type, align, expectedClasses) => {
    const { container } = render(<VibeBlockRenderer block={makeBlockWithProps(type, { align })} />);
    const html = container.innerHTML;

    expectedClasses.forEach((className) => {
      expect(html).toContain(className);
    });
  });
});
