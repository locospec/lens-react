'use client';

import { useState } from 'react';
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from '@lens2/shadcn/components/ui/kanban';

const columns = [
  { id: 'col-1', name: 'Planned', color: '#6B7280' },
  { id: 'col-2', name: 'In Progress', color: '#F59E0B' },
  { id: 'col-3', name: 'Done', color: '#10B981' },
];

const users = [
  { id: 'user-1', name: 'John Smith', initials: 'JS' },
  { id: 'user-2', name: 'Sarah Johnson', initials: 'SJ' },
  { id: 'user-3', name: 'Mike Williams', initials: 'MW' },
  { id: 'user-4', name: 'Emily Davis', initials: 'ED' },
];

const exampleFeatures = [
  {
    id: 'task-1',
    name: 'Implement user authentication',
    startAt: new Date('2024-01-15'),
    endAt: new Date('2024-02-01'),
    column: 'col-1',
    owner: users[0],
  },
  {
    id: 'task-2',
    name: 'Design new dashboard layout',
    startAt: new Date('2024-01-20'),
    endAt: new Date('2024-02-10'),
    column: 'col-2',
    owner: users[1],
  },
  {
    id: 'task-3',
    name: 'Optimize database queries',
    startAt: new Date('2024-01-10'),
    endAt: new Date('2024-01-25'),
    column: 'col-3',
    owner: users[2],
  },
  {
    id: 'task-4',
    name: 'Create API documentation',
    startAt: new Date('2024-01-25'),
    endAt: new Date('2024-02-15'),
    column: 'col-1',
    owner: users[3],
  },
  {
    id: 'task-5',
    name: 'Add unit tests for core modules',
    startAt: new Date('2024-01-18'),
    endAt: new Date('2024-02-05'),
    column: 'col-2',
    owner: users[0],
  },
  {
    id: 'task-6',
    name: 'Implement data export feature',
    startAt: new Date('2024-01-22'),
    endAt: new Date('2024-02-08'),
    column: 'col-1',
    owner: users[1],
  },
  {
    id: 'task-7',
    name: 'Update user onboarding flow',
    startAt: new Date('2024-01-12'),
    endAt: new Date('2024-01-28'),
    column: 'col-3',
    owner: users[2],
  },
  {
    id: 'task-8',
    name: 'Integrate payment gateway',
    startAt: new Date('2024-01-30'),
    endAt: new Date('2024-02-20'),
    column: 'col-2',
    owner: users[3],
  },
];

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
});

export function KanbanView() {
  const [features, setFeatures] = useState(exampleFeatures);

  return (
    <div className="h-full p-4">
      <KanbanProvider
        columns={columns}
        data={features}
        onDataChange={setFeatures}
        className="h-full"
        sensors={[]}
      >
        {(column) => (
          <KanbanBoard id={column.id} key={column.id}>
            <KanbanHeader>
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: column.color }}
                />
                <span>{column.name}</span>
              </div>
            </KanbanHeader>
            <KanbanCards id={column.id}>
              {(feature: (typeof features)[number]) => (
                <KanbanCard
                  column={column.id}
                  id={feature.id}
                  key={feature.id}
                  name={feature.name}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1">
                      <p className="m-0 flex-1 font-medium text-sm">
                        {feature.name}
                      </p>
                    </div>
                    {feature.owner && (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                        {feature.owner.initials}
                      </div>
                    )}
                  </div>
                  <p className="m-0 text-muted-foreground text-xs">
                    {shortDateFormatter.format(feature.startAt)} -{' '}
                    {dateFormatter.format(feature.endAt)}
                  </p>
                </KanbanCard>
              )}
            </KanbanCards>
          </KanbanBoard>
        )}
      </KanbanProvider>
    </div>
  );
}