"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, 
  Heading1, Heading2, List, ListOrdered, Link as LinkIcon, ImageIcon 
} from 'lucide-react';
import styles from "../../admin.module.css";
import { useCallback } from 'react';

type SimpleEditorProps = {
  content: string;
  onChange: (content: string) => void;
};

export default function SimpleEditor({ content, onChange }: SimpleEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: styles.editorLink || 'editor-link',
        },
      }),
      Image.configure({
        inline: true,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: styles.editorContentBox || 'editor-content',
        style: 'outline: none;'
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ onClick, isActive, disabled = false, children, title }: any) => (
    <button
      onClick={(e) => { e.preventDefault(); onClick(); }}
      disabled={disabled}
      title={title}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.4rem',
        borderRadius: '8px',
        border: 'none',
        background: isActive ? 'var(--color-orange)' : 'transparent',
        color: isActive ? 'white' : 'inherit',
        opacity: disabled ? 0.5 : (isActive ? 1 : 0.7),
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s'
      }}
    >
      {children}
    </button>
  );

  return (
    <div className={styles.editorBox}>
      {/* Toolbar */}
      <div className={styles.editorToolbar}>
        <div style={{ display: 'flex', gap: '0.25rem', paddingRight: '1rem', borderRight: '1px solid rgba(100,116,139,0.2)' }}>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold"
          >
            <Bold size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic"
          >
            <Italic size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Underline"
          >
            <UnderlineIcon size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Strikethrough"
          >
            <Strikethrough size={18} />
          </ToolbarButton>
        </div>

        <div style={{ display: 'flex', gap: '0.25rem', padding: '0 1rem', borderRight: '1px solid rgba(100,116,139,0.2)' }}>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <Heading1 size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 size={18} />
          </ToolbarButton>
        </div>

        <div style={{ display: 'flex', gap: '0.25rem', padding: '0 1rem', borderRight: '1px solid rgba(100,116,139,0.2)' }}>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <ListOrdered size={18} />
          </ToolbarButton>
        </div>

        <div style={{ display: 'flex', gap: '0.25rem', paddingLeft: '1rem' }}>
          <ToolbarButton
            onClick={setLink}
            isActive={editor.isActive('link')}
            title="Link"
          >
            <LinkIcon size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={addImage}
            title="Image"
          >
            <ImageIcon size={18} />
          </ToolbarButton>
        </div>
      </div>

      {/* Editor Content Area */}
      <div>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
