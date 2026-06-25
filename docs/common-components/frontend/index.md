# Common Components — Catalog

All reusable components live in `src/components/common/`. These are shared across routes and features.

## Page Structure

### `page-header.tsx`

Page title with optional description and actions.

```tsx
<PageHeader
  title="Supporters"
  description="View and manage your supporters"
>
  <Button>Export</Button>
</PageHeader>
```

## Search & Filters

### `search-input.tsx`

Debounced search input with configurable delay.

```tsx
<SearchInput
  value={search}
  onChange={setSearch}
  placeholder="Search supporters..."
  debounceMs={300}
/>
```

### `filter-pills.tsx`

Active filter display as removable chips.

```tsx
<FilterPills filters={activeFilters} onRemove={removeFilter} />
```

### `filter-options.tsx`

Filter option buttons for toggling between values.

```tsx
<FilterOptions
  options={statusOptions}
  value={selectedStatus}
  onChange={setSelectedStatus}
/>
```

### `date-range-filter.tsx`

Date range picker with preset ranges.

```tsx
<DateRangeFilter
  value={dateRange}
  onChange={setDateRange}
  presets={['7d', '30d', '90d', 'custom']}
/>
```

### `time-range-filter.tsx`

Period selection dropdown (7d, 30d, 90d, custom).

```tsx
<TimeRangeFilter value={period} onChange={setPeriod} />
```

## Table Controls

### `table-filter-button.tsx`

Column filter button for tables.

### `table-filter-date.tsx`

Column date filter for tables.

### `table-sort-button.tsx`

Column sort toggle button for tables.

## Navigation

### `segmented-tab-nav.tsx`

Tab navigation bar with segmented control style.

```tsx
<SegmentedTabNav
  tabs={[
    { id: 'overview', label: 'Overview' },
    { id: 'details', label: 'Details' },
  ]}
  activeTab={activeTab}
  onChange={setActiveTab}
/>
```

## Analytics Cards

### `stat-value-card.tsx`

Single stat value display card.

### `stats-list-card.tsx`

List of stat values in a card.

### `stats-breakdown-card.tsx`

Card showing a breakdown of stats (e.g., by category).

### `stats-trend-indicator.tsx`

Trend indicator (up/down arrow with percentage).

## Data Display

### `query-list.tsx`

Generic infinite scroll list component for use with TanStack Query's `useInfiniteQuery`.

```tsx
<QueryList
  query={supportersQuery}
  renderItem={(supporter) => <SupporterCard supporter={supporter} />}
  emptyMessage="No supporters found"
/>
```

## Forms

### `floating-save-bar.tsx`

Sticky save/cancel bar pinned to the bottom of long forms.

```tsx
<FloatingSaveBar
  onSave={handleSave}
  onCancel={handleCancel}
  isSaving={isPending}
/>
```

## Dialogs

### `delete-alert-dialog.tsx`

Confirmation dialog for destructive actions.

### `toggle-alert-dialog.tsx`

Confirmation dialog for toggling states.

### `type-to-confirm-dialog.tsx`

Enhanced confirmation that requires typing a phrase to proceed.

## Inputs

### `tags-input.tsx`

Tag/chip input for entering multiple values.

```tsx
<TagsInput
  value={tags}
  onChange={setTags}
  placeholder="Add a tag..."
/>
```

### `empty-row.tsx`

Empty state placeholder for tables.

```tsx
<EmptyRow colSpan={5} message="No items found" />
```

## Media

### `link-explore.tsx`

Link preview component that fetches and displays metadata.

### `lazy-image.tsx`

Lazy-loaded image with blur placeholder.

```tsx
<LazyImage
  src={imageUrl}
  alt="Description"
  placeholderSrc={blurHash}
/>
```

### `upload-image.tsx`

Image upload widget with drag-and-drop support.

```tsx
<UploadImage
  bucket="avatars"
  onUploadComplete={handleUpload}
  currentUrl={profile.avatar_url}
/>
```

## AI Tools

### `ai-button.tsx`

AI writing assistant button that triggers content generation.

### `ai-polish-button-card.tsx`

Card-style AI polish button for improving existing content.
