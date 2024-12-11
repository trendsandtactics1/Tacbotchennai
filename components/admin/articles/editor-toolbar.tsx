'use client';

import { Editor, ChainedCommands } from '@tiptap/react';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Type,
  Underline,
  Strikethrough,
  Quote,
  Undo,
  Redo,
  Link2,
  TextQuote
} from 'lucide-react';
import Link from '@tiptap/extension-link';

const FONT_SIZES = [
  { label: 'Small', value: '12px' },
  { label: 'Normal', value: '14px' },
  { label: 'Medium', value: '16px' },
  { label: 'Large', value: '18px' },
  { label: 'Extra Large', value: '20px' }
];

const LINE_HEIGHTS = [
  { label: 'Tight', value: '1' },
  { label: 'Normal', value: '1.5' },
  { label: 'Relaxed', value: '1.75' },
  { label: 'Loose', value: '2' }
];

interface EditorToolbarProps {
  editor: Editor | null;
}

type Level = 1 | 2 | 3;

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null;

  const isActive = (type: string, attrs = {}) => {
    return editor?.isActive(type, attrs) ?? false;
  };

  const executeCommand = (
    callback: (chain: ChainedCommands) => ChainedCommands
  ) => {
    if (editor) {
      callback(editor.chain().focus());
    }
  };

  return (
    <div className='border-b p-2 flex flex-wrap gap-2'>
      {/* Undo/Redo Group */}
      <div className='flex items-center gap-1 pr-2 border-r'>
        <button
          type='button'
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className='p-2 rounded hover:bg-gray-100 disabled:opacity-50'
          title='Undo'
        >
          <Undo className='h-4 w-4' />
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className='p-2 rounded hover:bg-gray-100 disabled:opacity-50'
          title='Redo'
        >
          <Redo className='h-4 w-4' />
        </button>
      </div>

      {/* Text Style Group */}
      <div className='flex items-center gap-1 pr-2 border-r'>
        <select
          className='p-2 rounded hover:bg-gray-100 outline-none'
          onChange={(e) => {
            const value = parseInt(e.target.value);
            if (value >= 1 && value <= 3) {
              editor
                .chain()
                .focus()
                .toggleHeading({ level: value as Level })
                .run();
            } else {
              editor.chain().focus().setParagraph().run();
            }
          }}
          value={
            editor.isActive('heading', { level: 1 })
              ? '1'
              : editor.isActive('heading', { level: 2 })
              ? '2'
              : editor.isActive('heading', { level: 3 })
              ? '3'
              : '0'
          }
        >
          <option value='0'>Normal</option>
          <option value='1'>Heading 1</option>
          <option value='2'>Heading 2</option>
          <option value='3'>Heading 3</option>
        </select>
      </div>

      {/* Font Size Group */}
      <div className='flex items-center gap-1 pr-2 border-r'>
        <select
          className='p-2 rounded hover:bg-gray-100 outline-none'
          onChange={(e) => {
            editor
              .chain()
              .focus()
              .setMark('textStyle', { size: e.target.value })
              .run();
          }}
        >
          {FONT_SIZES.map((size) => (
            <option key={size.value} value={size.value}>
              {size.label}
            </option>
          ))}
        </select>
      </div>

      {/* Line Height Group */}
      <div className='flex items-center gap-1 pr-2 border-r'>
        <select
          className='p-2 rounded hover:bg-gray-100 outline-none'
          onChange={(e) => {
            editor
              .chain()
              .focus()
              .setMark('textStyle', { lineHeight: e.target.value })
              .run();
          }}
        >
          {LINE_HEIGHTS.map((height) => (
            <option key={height.value} value={height.value}>
              {height.label}
            </option>
          ))}
        </select>
      </div>

      {/* Text Format Group */}
      <div className='flex items-center gap-1 pr-2 border-r'>
        <button
          type='button'
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('bold') ? 'bg-gray-100' : ''
          }`}
          title='Bold'
        >
          <Bold className='h-4 w-4' />
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('italic') ? 'bg-gray-100' : ''
          }`}
          title='Italic'
        >
          <Italic className='h-4 w-4' />
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('strike') ? 'bg-gray-100' : ''
          }`}
          title='Strikethrough'
        >
          <Strikethrough className='h-4 w-4' />
        </button>
      </div>

      {/* List Group */}
      <div className='flex items-center gap-1 pr-2 border-r'>
        <button
          type='button'
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('bulletList') ? 'bg-gray-100' : ''
          }`}
          title='Bullet List'
        >
          <List className='h-4 w-4' />
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('orderedList') ? 'bg-gray-100' : ''
          }`}
          title='Numbered List'
        >
          <ListOrdered className='h-4 w-4' />
        </button>
      </div>

      {/* Quote & Link Group */}
      <div className='flex items-center gap-1 pr-2 border-r'>
        <button
          type='button'
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('blockquote') ? 'bg-gray-100' : ''
          }`}
          title='Quote'
        >
          <TextQuote className='h-4 w-4' />
        </button>
        <button
          type='button'
          onClick={() => {
            const url = window.prompt('Enter URL');
            if (url) {
              editor.chain().focus().toggleLink({ href: url }).run();
            }
          }}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive('link') ? 'bg-gray-100' : ''
          }`}
          title='Add Link'
        >
          <Link2 className='h-4 w-4' />
        </button>
      </div>

      {/* Alignment Group */}
      <div className='flex items-center gap-1'>
        <button
          type='button'
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive({ textAlign: 'left' }) ? 'bg-gray-100' : ''
          }`}
          title='Align Left'
        >
          <AlignLeft className='h-4 w-4' />
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive({ textAlign: 'center' }) ? 'bg-gray-100' : ''
          }`}
          title='Align Center'
        >
          <AlignCenter className='h-4 w-4' />
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive({ textAlign: 'right' }) ? 'bg-gray-100' : ''
          }`}
          title='Align Right'
        >
          <AlignRight className='h-4 w-4' />
        </button>
      </div>
    </div>
  );
}
