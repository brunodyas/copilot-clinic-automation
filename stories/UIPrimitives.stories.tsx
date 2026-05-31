import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const meta: Meta = {
  title: 'UI/Primitives',
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj;

export const Buttons: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
    </div>
  ),
};

export const Badges: Story = {
  render: () => (
    <div className="flex gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};

export const Inputs: Story = {
  render: () => <Input placeholder="Search tasks..." className="max-w-sm" />,
};

export const Cards: Story = {
  render: () => (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Project Status</CardTitle>
        <CardDescription>Summary card used across dashboard sections.</CardDescription>
      </CardHeader>
      <CardContent>42 tasks, 12 completed.</CardContent>
    </Card>
  ),
};

export const LoadingSkeleton: Story = {
  render: () => <Skeleton className="h-10 w-64" />,
};
