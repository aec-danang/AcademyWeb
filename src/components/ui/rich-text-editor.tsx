"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Youtube } from '@tiptap/extension-youtube';
import { Highlight } from '@tiptap/extension-highlight';
import { TaskItem } from '@tiptap/extension-task-item';
import { TaskList } from '@tiptap/extension-task-list';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TextAlign } from '@tiptap/extension-text-align';
import { CharacterCount } from '@tiptap/extension-character-count';
import { Placeholder } from '@tiptap/extension-placeholder';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, 
  Heading1, Heading2, Heading3, Heading4, List, ListOrdered, 
  Link as LinkIcon, ImageIcon, Video as VideoIcon, Highlighter,
  Code, CodeSquare, CheckSquare, Quote, Minus, Table as TableIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Upload
} from 'lucide-react';
import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type RichTextEditorProps = {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
};

export function RichTextEditor({ content, onChange, placeholder = 'Press / for commands, or start typing...' }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        codeBlock: { HTMLAttributes: { class: 'bg-slate-900 text-slate-50 rounded-md p-4 font-mono text-sm my-4' } },
        blockquote: { HTMLAttributes: { class: 'border-l-4 border-slate-300 dark:border-slate-700 pl-4 italic text-slate-700 dark:text-slate-400 my-4' } },
        horizontalRule: { HTMLAttributes: { class: 'my-6 border-slate-200 dark:border-slate-800' } }
      }),
      Underline,
      Highlight.configure({ HTMLAttributes: { class: 'bg-orange/20 text-orange dark:text-orange px-1 rounded' } }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-blue-500 hover:text-blue-700 underline underline-offset-2' },
      }),
      Image.configure({ inline: true }),
      Youtube.configure({
        inline: false,
        HTMLAttributes: { class: 'w-full aspect-video rounded-lg my-4' },
      }),
      TaskList.configure({
        HTMLAttributes: { class: 'not-prose pl-2 my-4 space-y-1' },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: { class: 'flex items-start gap-2' },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: { class: 'border-collapse table-auto w-full border border-slate-200 dark:border-slate-800 my-4' },
      }),
      TableRow,
      TableHeader.configure({ HTMLAttributes: { class: 'border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2 font-bold' } }),
      TableCell.configure({ HTMLAttributes: { class: 'border border-slate-200 dark:border-slate-800 p-2' } }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      CharacterCount,
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'cursor-text before:content-[attr(data-placeholder)] before:text-slate-400 before:absolute before:pointer-events-none'
      })
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'min-h-[400px] p-6 focus:outline-none prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-a:text-orange prose-a:no-underline hover:prose-a:underline text-slate-800 dark:text-slate-200 w-full bg-white dark:bg-slate-950',
      },
    },
  });

  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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

  const insertTable = () => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  if (!editor) return null;

  const ToolbarButton = ({ onClick, isActive, disabled = false, children, title }: any) => (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); onClick(); }}
      disabled={disabled}
      title={title}
      className={`
        flex items-center justify-center p-2 rounded-md border-none transition-colors
        ${isActive ? 'bg-orange text-white' : 'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {children}
    </button>
  );

  const Divider = ({ className = "" }: { className?: string }) => <div className={`w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1 ${className}`} />;

  return (
    <div className="flex flex-col w-full h-full border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-950 shadow-sm flex-1">
      {/* CMS Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        
        {/* Text Formatting */}
        <div className="flex gap-0.5">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold (Ctrl+B)">
            <Bold size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic (Ctrl+I)">
            <Italic size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline (Ctrl+U)">
            <UnderlineIcon size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strikethrough">
            <Strikethrough size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')} title="Highlight">
            <Highlighter size={16} />
          </ToolbarButton>
        </div>
        
        <Divider />
        
        {/* Headings */}
        <div className="flex gap-0.5">
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="Heading 1">
            <Heading1 size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Heading 2">
            <Heading2 size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Heading 3">
            <Heading3 size={16} />
          </ToolbarButton>
        </div>

        <Divider />

        {/* Alignment */}
        <div className="flex gap-0.5 hidden sm:flex">
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Align Left">
            <AlignLeft size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Align Center">
            <AlignCenter size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Align Right">
            <AlignRight size={16} />
          </ToolbarButton>
        </div>

        <Divider className="hidden sm:block" />

        {/* Lists & Tasks */}
        <div className="flex gap-0.5">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List">
            <List size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Numbered List">
            <ListOrdered size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleTaskList().run()} isActive={editor.isActive('taskList')} title="Checklist">
            <CheckSquare size={16} />
          </ToolbarButton>
        </div>

        <Divider />

        {/* Code & Blocks */}
        <div className="flex gap-0.5 hidden md:flex">
          <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} title="Inline Code">
            <Code size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} title="Code Block">
            <CodeSquare size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Blockquote">
            <Quote size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
            <Minus size={16} />
          </ToolbarButton>
        </div>

        <Divider className="hidden md:block" />

        {/* Inserts */}
        <div className="flex gap-0.5">
          <ToolbarButton onClick={openLinkDialog} isActive={editor.isActive('link')} title="Insert Link (Ctrl+K)">
            <LinkIcon size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={openImageDialog} title="Insert Image">
            <ImageIcon size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={openYoutubeDialog} title="Insert YouTube Video">
            <VideoIcon size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={insertTable} title="Insert Table">
            <TableIcon size={16} />
          </ToolbarButton>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-slate-50/30 dark:bg-slate-900/30 relative flex">
        <EditorContent editor={editor} className="h-full w-full max-w-none" />
      </div>

      {/* Status Footer */}
      <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between shrink-0">
        <div className="flex gap-4">
          <span>{editor.storage.characterCount.words()} words</span>
          <span>{editor.storage.characterCount.characters()} chars</span>
        </div>
        <div>
          {editor.isFocused ? 'Writing...' : 'Saved'}
        </div>
      </div>

      {/* Dialogs... */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">URL</label>
              <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://example.com" autoFocus onKeyDown={(e) => { if (e.key === 'Enter') confirmLink(); }} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmLink} className="bg-orange hover:bg-orange-hover text-white">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Chèn hình ảnh vào bài viết</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Direct File Upload Option */}
            <div className="p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center text-center space-y-2">
              <Upload className="h-7 w-7 text-orange" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Tải ảnh từ máy tính của bạn</p>
                <p className="text-[11px] text-slate-400">Hỗ trợ PNG, JPG, JPEG, WEBP</p>
              </div>
              <input
                type="file"
                accept="image/*"
                id="editor-image-upload"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    setIsUploadingImage(true);
                    const formData = new FormData();
                    formData.append("file", file);
                    const res = await fetch("/api/upload", {
                      method: "POST",
                      body: formData,
                    });
                    const data = await res.json();
                    if (data.url) {
                      editor?.chain().focus().setImage({ src: data.url }).run();
                      setImageDialogOpen(false);
                      setImageUrl("");
                    } else {
                      alert(data.error || "Không thể tải ảnh lên.");
                    }
                  } catch {
                    alert("Lỗi kết nối khi tải ảnh.");
                  } finally {
                    setIsUploadingImage(false);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploadingImage}
                className="h-8 text-xs rounded-lg font-bold border-slate-300"
                onClick={() => document.getElementById("editor-image-upload")?.click()}
              >
                {isUploadingImage ? "Đang tải..." : "Chọn ảnh từ máy..."}
              </Button>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
              <span className="bg-white dark:bg-slate-950 px-3 text-[11px] font-bold text-slate-400 uppercase">Hoặc dán đường dẫn URL</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Đường dẫn URL ảnh</label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="rounded-xl h-9 text-xs"
                onKeyDown={(e) => { if (e.key === 'Enter') confirmImage(); }}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setImageDialogOpen(false)} className="rounded-xl h-9 text-xs">
              Hủy
            </Button>
            <Button onClick={confirmImage} className="bg-orange hover:bg-orange-hover text-white rounded-xl h-9 text-xs font-bold">
              Chèn URL
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={youtubeDialogOpen} onOpenChange={setYoutubeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Insert YouTube Video</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">YouTube Video URL</label>
              <Input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." autoFocus onKeyDown={(e) => { if (e.key === 'Enter') confirmYoutube(); }} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setYoutubeDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmYoutube} className="bg-orange hover:bg-orange-hover text-white">Insert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
