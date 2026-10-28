import assert from 'node:assert/strict';
import { test, mock } from 'node:test';
import * as React from 'react';

// Local hook harness: exercise drafts across renders without database or DOM.
let slots = [], cursor = 0, dirty = false;
mock.module('react', { namedExports: { ...React,
  useState(initial) {
    const index = cursor++;
    if (!(index in slots)) slots[index] = initial;
    return [slots[index], value => { slots[index] = value; dirty = true; }];
  },
} });
const { default: Content } = await import('../src/components/course/LessonContent.tsx');
const { default: Video } = await import('../src/components/course/LessonVideo.tsx');
const { default: Card } = await import('../src/components/course/LessonCard.tsx');
function render(component, props) {
  for (let count = 0; count < 5; count++) {
    cursor = 0; dirty = false;
    const tree = component(props);
    if (!dirty) return tree;
  }
  throw new Error('Render did not converge');
}
function nodes(tree) {
  return Array.isArray(tree) ? tree.flatMap(nodes) : tree && typeof tree === 'object'
    ? [tree, ...nodes(tree.props?.children)] : [];
}
test('lesson content retains edits on stable props and resets when server content changes', () => {
  slots = [];
  const props = { lessonId: 'lesson', content: 'Original' };
  let field = nodes(render(Content, props)).find(n => n.type === 'textarea');
  field.props.onChange({ target: { value: 'Draft' } });
  field = nodes(render(Content, props)).find(n => n.type === 'textarea');
  assert.equal(field.props.value, 'Draft');
  assert.equal(nodes(render(Content, { ...props, content: null })).find(n => n.type === 'textarea').props.value, '');
});
test('video edits persist until provider or URL props change', () => {
  slots = [];
  const props = { lessonId: 'lesson', videoProvider: 'youtube', videoUrl: 'original' };
  const field = nodes(render(Video, props)).find(n => n.type === 'input');
  field.props.onChange({ target: { value: 'draft' } });
  assert.equal(nodes(render(Video, props)).find(n => n.type === 'input').props.value, 'draft');
  const updated = nodes(render(Video, { ...props, videoProvider: 'vimeo', videoUrl: 'new' }));
  assert.equal(updated.find(n => n.type === 'input').props.value, 'new');
  assert.equal(updated.find(n => n.type === 'select').props.value, 'vimeo');
});
test('lesson card preserves identity-based refresh semantics without resetting open state', () => {
  slots = [];
  const lesson = { id: 'lesson', title: 'Original', description: 'Description' };
  render(Card, { lesson, onUpdated() {} });
  slots[0] = true;
  slots[1] = 'Draft';
  render(Card, { lesson, onUpdated() {} });
  assert.equal(slots[1], 'Draft');
  render(Card, { lesson: { ...lesson, title: 'Updated' }, onUpdated() {} });
  assert.equal(slots[1], 'Updated');
  assert.equal(slots[0], true);
});
