import { useMemo, useState } from 'react';
import {
  ArchiveIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  ClipboardCopyIcon,
  DragHandleDots2Icon,
  GearIcon,
  ImageIcon,
  MagicWandIcon,
  MixerHorizontalIcon,
  PlusIcon,
  TextAlignCenterIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
  TrashIcon,
} from '@radix-ui/react-icons';
import { Input } from '@/components/ui-kit/input';
import { Textarea } from '@/components/ui-kit/textarea';
import { Button } from '@/components/ui-kit/button';
import { iconNames, lucideIcon, componentRegistry } from './component-registry';
import { InspectorField, InspectorTab, SelectOption, VibeBlock } from '../types';
import { ColorPopover } from './color-popover';

const SPACING_OPTIONS: { value: string; label: string; px: number }[] = [
  { value: 'none', label: '0', px: 0 },
  { value: 'xs', label: 'XS', px: 16 },
  { value: 'sm', label: 'SM', px: 32 },
  { value: 'md', label: 'MD', px: 48 },
  { value: 'lg', label: 'LG', px: 72 },
  { value: 'xl', label: 'XL', px: 96 },
  { value: '2xl', label: '2XL', px: 128 },
  { value: '3xl', label: '3XL', px: 168 },
];

const ALIGN_ICONS: Record<string, typeof TextAlignLeftIcon> = {
  AlignLeft: TextAlignLeftIcon,
  AlignCenter: TextAlignCenterIcon,
  AlignRight: TextAlignRightIcon,
};

const optionShape = (option: string | SelectOption): SelectOption =>
  typeof option === 'string' ? { value: option, label: option.toUpperCase() } : option;

const groupBy = (fields: InspectorField[]) => {
  const map = new Map<string, InspectorField[]>();
  fields.forEach((field) => {
    const key = field.group ?? 'General';
    if (!map.has(key)) map.set(key, []);
    const list = map.get(key);
    if (list) list.push(field);
  });
  return Array.from(map.entries());
};

const Group = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <details
    className="group overflow-hidden rounded-lg border border-border bg-card"
    open
  >
    <summary className="flex cursor-pointer list-none items-center justify-between bg-muted px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground">
      <span>{title}</span>
      <ChevronDownIcon className="size-3 text-muted-foreground transition group-open:rotate-180" />
    </summary>
    <div className="grid gap-2 p-2.5">{children}</div>
  </details>
);

const Label = ({
  text,
  hint,
  trailing,
}: {
  text: string;
  hint?: string;
  trailing?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between gap-2">
    <div className="min-w-0">
      <p className="text-[11px] font-semibold tracking-[0.04em] text-foreground">{text}</p>
      {hint && <p className="mt-0.5 text-[10.5px] leading-4 text-muted-foreground">{hint}</p>}
    </div>
    {trailing}
  </div>
);

const renderField = (
  field: InspectorField,
  block: VibeBlock,
  onChange: (props: Record<string, unknown>) => void,
  onUploadImage: (file: File, propKey: string) => void,
  uploading: boolean,
  onPickAsset?: (propKey: string) => void,
  onPickManyForList?: (payload: { listKey: string; imageKey: string; seed: Record<string, unknown> }) => void
) => {
  const value = block.props[field.key];
  const stringValue = value === undefined || value === null ? '' : String(value);

  if (field.visibleWhen && !field.visibleWhen(block.props)) {
    return null;
  }

  const dataTestId = `inspector-field-${block.type}-${field.key}`;

  if (field.type === 'textarea') {
    return (
      <div key={field.key} className="grid gap-2">
        <Label text={field.label} hint={field.description} />
        <Textarea
          className="min-h-24 bg-background text-foreground placeholder:text-muted-foreground"
          data-testid={dataTestId}
          placeholder={field.placeholder}
          value={stringValue}
          onChange={(event) => onChange({ [field.key]: event.target.value })}
        />
      </div>
    );
  }

  if (field.type === 'color') {
    return (
      <div key={field.key} className="grid gap-2">
        <Label text={field.label} hint={field.description} />
        <ColorPopover
          value={stringValue}
          onChange={(next) => onChange({ [field.key]: next })}
          onReset={() => onChange({ [field.key]: '' })}
          testId={dataTestId}
          ariaLabel={field.label}
        />
      </div>
    );
  }

  if (field.type === 'select') {
    return (
      <div key={field.key} className="grid gap-2">
        <Label text={field.label} hint={field.description} />
        <select
          data-testid={dataTestId}
          className="h-9 rounded-lg border border-input bg-background px-2 text-sm text-foreground shadow-sm"
          value={stringValue}
          onChange={(event) => onChange({ [field.key]: event.target.value })}
        >
          {(field.options ?? []).map((option) => {
            const o = optionShape(option);
            return (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            );
          })}
        </select>
      </div>
    );
  }

  if (field.type === 'buttonGroup') {
    return (
      <div key={field.key} className="grid gap-2">
        <Label text={field.label} hint={field.description} />
        <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/40 p-0.5">
          {(field.options ?? []).map((option) => {
            const o = optionShape(option);
            const active = stringValue === o.value;
            const Icon = o.icon ? ALIGN_ICONS[o.icon] : undefined;
            return (
              <button
                key={o.value}
                type="button"
                data-testid={`${dataTestId}-${o.value}`}
                onClick={() => onChange({ [field.key]: o.value })}
                className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold transition ${
                  active
                    ? 'bg-card text-primary shadow-pop ring-1 ring-primary/20'
                    : 'text-muted-foreground hover:bg-card/60 hover:text-foreground'
                }`}
              >
                {Icon ? <Icon className="size-3.5" /> : null}
                {o.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (field.type === 'range') {
    const min = field.min ?? 0;
    const max = field.max ?? 100;
    const step = field.step ?? 1;
    const numericValue = Number(value ?? min);

    return (
      <div key={field.key} className="grid gap-2">
        <Label
          text={field.label}
          hint={field.description}
          trailing={
            <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10.5px] font-semibold text-muted-foreground">
              {numericValue}
            </span>
          }
        />
        <input
          type="range"
          data-testid={dataTestId}
          min={min}
          max={max}
          step={step}
          value={numericValue}
          onChange={(event) => onChange({ [field.key]: Number(event.target.value) })}
          className="w-full accent-[hsl(var(--primary-600))]"
        />
      </div>
    );
  }

  if (field.type === 'number') {
    return (
      <div key={field.key} className="grid gap-2">
        <Label text={field.label} hint={field.description} />
        <Input
          type="number"
          data-testid={dataTestId}
          value={stringValue}
          min={field.min}
          max={field.max}
          step={field.step}
          onChange={(event) => onChange({ [field.key]: event.target.value === '' ? '' : Number(event.target.value) })}
        />
      </div>
    );
  }

  if (field.type === 'boolean') {
    const isActive = Boolean(value === true || value === 'true');
    return (
      <div
        key={field.key}
        className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2"
      >
        <div className="min-w-0">
          <p className="text-[12px] font-semibold text-foreground">{field.label}</p>
          {field.description && (
            <p className="mt-0.5 text-[10.5px] leading-4 text-muted-foreground">
              {field.description}
            </p>
          )}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isActive}
          data-testid={dataTestId}
          onClick={() => onChange({ [field.key]: !isActive })}
          className={`relative h-6 w-11 flex-none rounded-full transition ${
            isActive ? 'bg-primary' : 'bg-muted'
          }`}
        >
          <span
            className={`absolute top-0.5 size-5 rounded-full bg-background shadow transition ${
              isActive ? 'left-5' : 'left-0.5'
            }`}
          />
        </button>
      </div>
    );
  }

  if (field.type === 'spacing') {
    const current = stringValue || 'sm';
    return (
      <div key={field.key} className="grid gap-2">
        <Label text={field.label} hint={field.description} />
        <div className="flex flex-wrap gap-0.5 rounded-lg border border-border bg-muted/40 p-0.5">
          {SPACING_OPTIONS.map((option) => {
            const active = current === option.value;
            return (
              <button
                key={option.value}
                type="button"
                data-testid={`${dataTestId}-${option.value}`}
                onClick={() => onChange({ [field.key]: option.value })}
                className={`min-w-[2.4rem] rounded-md px-1.5 py-1 text-[10.5px] font-bold tracking-wider transition ${
                  active
                    ? 'bg-card text-primary shadow-pop ring-1 ring-primary/20'
                    : 'text-muted-foreground hover:bg-card/60 hover:text-foreground'
                }`}
                title={`${option.px}px`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (field.type === 'image') {
    return (
      <div key={field.key} className="grid gap-2">
        <Label text={field.label} hint={field.description} />
        {stringValue && (
          <div className="overflow-hidden rounded-lg border border-border bg-muted/40">
            <img src={stringValue} alt={field.label} className="aspect-[16/10] w-full object-cover" />
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-xs font-semibold shadow-sm hover:bg-accent">
            <ImageIcon className="size-4" />
            {uploading ? 'Uploading…' : 'Upload'}
            <input
              className="sr-only"
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  onUploadImage(file, field.key);
                }
                event.target.value = '';
                event.target.blur();
              }}
            />
          </label>
          {onPickAsset && (
            <Button size="sm" variant="outline" type="button" onClick={() => onPickAsset(field.key)}>
              <ArchiveIcon className="size-4" />
              Library
            </Button>
          )}
          {stringValue && (
            <Button size="sm" variant="ghost" type="button" onClick={() => onChange({ [field.key]: '' })}>
              Clear
            </Button>
          )}
        </div>
        <Input
          data-testid={dataTestId}
          placeholder="Or paste an image URL"
          value={stringValue}
          onChange={(event) => onChange({ [field.key]: event.target.value })}
        />
      </div>
    );
  }

  if (field.type === 'icon') {
    return (
      <div key={field.key} className="grid gap-2">
        <Label text={field.label} hint={field.description} />
        <div className="grid grid-cols-6 gap-1 rounded-lg border border-border bg-card p-1.5">
          {iconNames.map((name) => {
            const Icon = lucideIcon(name);
            const active = stringValue === name;
            return (
              <button
                key={name}
                type="button"
                title={name}
                data-testid={`${dataTestId}-${name}`}
                onClick={() => onChange({ [field.key]: name })}
                className={`grid h-8 place-items-center rounded-md transition ${
                  active
                    ? 'bg-primary-50 text-primary ring-1 ring-primary/30'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <Icon className="size-4" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (field.type === 'list') {
    const items = Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
    return (
      <ListField
        key={field.key}
        block={block}
        field={field}
        items={items}
        onChange={onChange}
        onUploadImage={onUploadImage}
        uploading={uploading}
        onPickAsset={onPickAsset}
        onPickManyForList={onPickManyForList}
      />
    );
  }

  return (
    <div key={field.key} className="grid gap-2">
      <Label text={field.label} hint={field.description} />
      <Input
        data-testid={dataTestId}
        placeholder={field.placeholder}
        value={stringValue}
        onChange={(event) => onChange({ [field.key]: event.target.value })}
      />
    </div>
  );
};

const ListField = ({
  block,
  field,
  items,
  onChange,
  onUploadImage,
  uploading,
  onPickAsset,
  onPickManyForList,
}: {
  block: VibeBlock;
  field: InspectorField;
  items: Record<string, unknown>[];
  onChange: (props: Record<string, unknown>) => void;
  onUploadImage: (file: File, propKey: string) => void;
  uploading: boolean;
  onPickAsset?: (propKey: string) => void;
  onPickManyForList?: (payload: { listKey: string; imageKey: string; seed: Record<string, unknown> }) => void;
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(items.length > 0 ? 0 : null);

  const updateItem = (index: number, partial: Record<string, unknown>) => {
    const next = items.map((item, i) => (i === index ? { ...item, ...partial } : item));
    onChange({ [field.key]: next });
  };
  const removeItem = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    onChange({ [field.key]: next });
    setOpenIndex(null);
  };
  const duplicateItem = (index: number) => {
    const item = items[index];
    const next = [...items];
    next.splice(index + 1, 0, { ...item });
    onChange({ [field.key]: next });
    setOpenIndex(index + 1);
  };
  const moveItem = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    onChange({ [field.key]: next });
    setOpenIndex(target);
  };
  const addItem = () => {
    const seed = field.defaultItem ?? {};
    const next = [...items, { ...seed }];
    onChange({ [field.key]: next });
    setOpenIndex(next.length - 1);
  };

  const itemFields = field.itemFields ?? [];
  const firstImageSubfield = itemFields.find((f) => f.type === 'image');

  return (
    <div className="grid gap-2" data-testid={`inspector-field-${block.type}-${field.key}`}>
      <Label text={field.label} hint={field.description} />
      <div className="grid gap-2">
        {items.map((item, index) => {
          const open = openIndex === index;
          const summary =
            String(item.title ?? item.label ?? item.name ?? item.question ?? item.platform ?? `${field.itemLabel ?? 'Item'} ${index + 1}`) || `${field.itemLabel ?? 'Item'} ${index + 1}`;
          return (
            <div
              key={index}
              className="overflow-hidden rounded-lg border border-border bg-card"
            >
              <div className="flex items-center justify-between gap-1 px-2 py-1">
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : index)}
                  className="flex flex-1 items-center gap-2 text-left text-[12px] font-medium text-foreground hover:text-primary"
                >
                  <span className="grid size-5 place-items-center text-muted-foreground/60">
                    <DragHandleDots2Icon className="size-3.5" />
                  </span>
                  <span className="truncate">{summary}</span>
                </button>
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    title="Move up"
                    onClick={() => moveItem(index, -1)}
                    disabled={index === 0}
                    className="grid size-6 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
                  >
                    <ArrowUpIcon className="size-3" />
                  </button>
                  <button
                    type="button"
                    title="Move down"
                    onClick={() => moveItem(index, 1)}
                    disabled={index === items.length - 1}
                    className="grid size-6 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
                  >
                    <ArrowDownIcon className="size-3" />
                  </button>
                  <button
                    type="button"
                    title="Duplicate"
                    onClick={() => duplicateItem(index)}
                    className="grid size-6 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <ClipboardCopyIcon className="size-3" />
                  </button>
                  <button
                    type="button"
                    title="Delete"
                    onClick={() => removeItem(index)}
                    className="grid size-6 place-items-center rounded text-error hover:bg-error/10"
                  >
                    <TrashIcon className="size-3" />
                  </button>
                </div>
              </div>
              {open && (
                <div className="grid gap-2.5 border-t border-border bg-muted/30 p-3">
                  {itemFields.map((itemField) => (
                    <FieldRenderer
                      key={itemField.key}
                      field={itemField}
                      block={block}
                      value={item[itemField.key]}
                      onChange={(partial) => updateItem(index, partial)}
                      onUploadImage={(file, propKey) =>
                        onUploadImage(file, `${field.key}.${index}.${propKey}`)
                      }
                      uploading={uploading}
                      onPickAsset={
                        onPickAsset
                          ? (propKey) => onPickAsset(`${field.key}.${index}.${propKey}`)
                          : undefined
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {firstImageSubfield && onPickManyForList && (
        <Button
          size="sm"
          variant="secondary"
          type="button"
          className="w-full justify-center sm:w-auto"
          onClick={() =>
            onPickManyForList({
              listKey: field.key,
              imageKey: firstImageSubfield.key,
              seed: { ...(field.defaultItem ?? {}) },
            })
          }
        >
          <ArchiveIcon className="size-4" />
          Add multiple from library
        </Button>
      )}
      <Button size="sm" variant="outline" onClick={addItem} type="button">
        <PlusIcon className="size-4" />
        Add {field.itemLabel ?? 'item'}
      </Button>
    </div>
  );
};

const FieldRenderer = ({
  field,
  value,
  block,
  onChange,
  onUploadImage,
  uploading,
  onPickAsset,
}: {
  field: InspectorField;
  value: unknown;
  block: VibeBlock;
  onChange: (partial: Record<string, unknown>) => void;
  onUploadImage: (file: File, propKey: string) => void;
  uploading: boolean;
  onPickAsset?: (propKey: string) => void;
}) => {
  const surrogate = useMemo<VibeBlock>(() => ({
    id: `${block.id}_sub`,
    type: block.type,
    props: { [field.key]: value },
  }), [block.id, block.type, field.key, value]);

  return <>{renderField(field, surrogate, onChange, onUploadImage, uploading, onPickAsset, undefined)}</>;
};

const TabBar = ({
  active,
  onChange,
}: {
  active: InspectorTab;
  onChange: (tab: InspectorTab) => void;
}) => {
  const tabs: { id: InspectorTab; label: string; icon: typeof MagicWandIcon }[] = [
    { id: 'content', label: 'Content', icon: MagicWandIcon },
    { id: 'style', label: 'Style', icon: MixerHorizontalIcon },
    { id: 'advanced', label: 'Advanced', icon: GearIcon },
  ];

  return (
    <div className="flex rounded-lg border border-border bg-muted/40 p-0.5">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const activeTab = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            data-testid={`inspector-tab-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-semibold transition ${
              activeTab
                ? 'bg-card text-primary shadow-pop ring-1 ring-primary/20'
                : 'text-muted-foreground hover:bg-card/60 hover:text-foreground'
            }`}
          >
            <Icon className="size-3.5" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export const PropertiesInspector = ({
  block,
  uploading,
  onChange,
  onUploadImage,
  onPickAsset,
  onPickManyForList,
}: {
  block?: VibeBlock;
  uploading: boolean;
  onChange: (props: Record<string, unknown>) => void;
  onUploadImage: (file: File, propKey: string) => void;
  onPickAsset?: (propKey: string) => void;
  onPickManyForList?: (payload: {
    listKey: string;
    imageKey: string;
    seed: Record<string, unknown>;
  }) => void;
}) => {
  const [tab, setTab] = useState<InspectorTab>('content');
  const definition = block ? componentRegistry[block.type] : undefined;
  const fieldsForTab = useMemo(
    () => (definition ? definition.fields.filter((field) => (field.tab ?? 'content') === tab) : []),
    [definition, tab]
  );
  const groupedFields = useMemo(() => groupBy(fieldsForTab), [fieldsForTab]);

  if (!block || !definition) {
    return (
      <aside
        className="flex h-full min-h-0 w-full max-w-full flex-col bg-card p-2.5 md:h-full"
        data-testid="properties-inspector"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Inspector
        </p>
        <div className="mt-5 grid gap-3 rounded-xl border border-dashed border-border bg-muted/40 p-6 text-sm leading-6 text-muted-foreground">
          <span className="grid size-9 place-items-center rounded-lg bg-primary-50 text-primary">
            <MagicWandIcon className="size-4" />
          </span>
          <p className="font-display text-base font-semibold text-foreground">
            No block selected
          </p>
          <p className="text-xs leading-5">
            Select a block on the canvas to edit copy, layout, color, motion, and more.
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className="flex h-full min-h-0 w-full max-w-full flex-col bg-card p-2.5 md:h-full"
      data-testid="properties-inspector"
    >
      <div className="flex items-start gap-2.5 border-b border-border bg-muted px-3 py-2.5">
        <div className="grid size-8 place-items-center rounded-md bg-primary-50 text-primary">
          <MagicWandIcon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
            {definition.category}
          </p>
          <h2
            className="truncate font-display text-[15px] font-semibold text-foreground"
            data-testid="inspector-title"
          >
            {definition.name}
          </h2>
          <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-muted-foreground">
            {definition.description}
          </p>
        </div>
      </div>
      <div className="border-b border-border px-3 py-2">
        <TabBar active={tab} onChange={setTab} />
      </div>
      <div className="min-h-0 flex-1 space-y-2.5 overflow-auto overscroll-contain p-2.5 pr-1.5">
        {groupedFields.length === 0 && (
          <p className="rounded-xl border border-dashed border-border bg-muted/40 p-4 text-center text-xs text-muted-foreground">
            Nothing to configure on this tab.
          </p>
        )}
        {groupedFields.map(([group, groupFields]) => (
          <Group key={group} title={group}>
            {groupFields.map((field) =>
              renderField(
                field,
                block,
                onChange,
                onUploadImage,
                uploading,
                onPickAsset,
                onPickManyForList
              )
            )}
          </Group>
        ))}
      </div>
    </aside>
  );
};
