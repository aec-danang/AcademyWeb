"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, 
  Heading1, Heading2, List, ListOrdered, Link as LinkIcon, ImageIcon, Video as VideoIcon 
} from 'lucide-react';
import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type RichTextEditorProps = {
  content: string;
  onChange: (content: string) => void;
};

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 hover:text-blue-700 underline underline-offset-2',
        },
      }),
      Image.configure({
        inline: true,
      }),
      Youtube.configure({
        inline: false,
        HTMLAttributes: {
          class: 'w-full aspect-video rounded-lg',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'min-h-[200px] py-4 focus:outline-none prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-a:text-orange prose-a:no-underline hover:prose-a:underline text-slate-800 dark:text-slate-200 w-full',
        style: 'outline: none;'
      },
    },
  });

  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const [youtubeDialogOpen, setYoutubeDialogOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');

  const openLinkDialog = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    setLinkUrl(previousUrl || '');
    setLinkDialogOpen(true);
  }, [editor]);

  const confirmLink = () => {
    if (!editor) return;
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    }
    setLinkDialogOpen(false);
    setLinkUrl('');
  };

  const openImageDialog = useCallback(() => {
    if (!editor) return;
    setImageUrl('');
    setImageDialogOpen(true);
  }, [editor]);

  const confirmImage = () => {
    if (!editor) return;
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
    }
    setImageDialogOpen(false);
    setImageUrl('');
  };

  const openYoutubeDialog = useCallback(() => {
    if (!editor) return;
    setYoutubeUrl('');
    setYoutubeDialogOpen(true);
  }, [editor]);

  const confirmYoutube = () => {
    if (!editor) return;
    if (youtubeUrl) {
      editor.commands.setYoutubeVideo({
        src: youtubeUrl,
        width: 640,
        height: 480,
      });
    }
    setYoutubeDialogOpen(false);
    setYoutubeUrl('');
  };

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ onClick, isActive, disabled = false, children, title }: any) => (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); onClick(); }}
      disabled={disabled}
      title={title}
      className={`
        flex items-center justify-center p-1.5 rounded-md border-none transition-colors
        ${isActive ? 'bg-orange text-white' : 'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-col w-full group border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden bg-white dark:bg-slate-950">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex gap-1 pr-4 border-r border-slate-200 dark:border-slate-700">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold"
          >
            <Bold size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic"
          >
            <Italic size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Underline"
          >
            <UnderlineIcon size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Strikethrough"
          >
            <Strikethrough size={16} />
          </ToolbarButton>
        </div>

        <div className="flex gap-1 px-4 border-r border-slate-200 dark:border-slate-700">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <Heading1 size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 size={16} />
          </ToolbarButton>
        </div>

        <div className="flex gap-1 px-4 border-r border-slate-200 dark:border-slate-700">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <ListOrdered size={16} />
          </ToolbarButton>
        </div>

        <div className="flex gap-1 pl-4">
          <ToolbarButton
            onClick={openLinkDialog}
            isActive={editor.isActive('link')}
            title="Link"
          >
            <LinkIcon size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={openImageDialog}
            title="Image"
          >
            <ImageIcon size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={openYoutubeDialog}
            title="YouTube Video"
          >
            <VideoIcon size={16} />
          </ToolbarButton>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 overflow-y-auto px-4 w-full">
        <EditorContent editor={editor} />
      </div>

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">URL</label>
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmLink();
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmLink}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Image URL</label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmImage();
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmImage}>Insert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* YouTube Dialog */}
      <Dialog open={youtubeDialogOpen} onOpenChange={setYoutubeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Insert YouTube Video</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">YouTube Video URL</label>
              <Input
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmYoutube();
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setYoutubeDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmYoutube}>Insert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
