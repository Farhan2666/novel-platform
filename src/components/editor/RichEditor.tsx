"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, Heading1, Heading2, List, ListOrdered, Quote, Undo, Redo } from "lucide-react";

interface RichEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichEditor({ content, onChange, placeholder }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || "Tulis cerita kamu di sini...",
      }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none focus:outline-none min-h-[400px] px-4 py-3 text-sm leading-relaxed",
      },
    },
  });

  if (!editor) return null;

  const ToolButton = ({ onClick, active, children }: { onClick: () => void; active: boolean; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded-lg transition-all text-xs ${active ? "bg-emerald-500/20 text-emerald-400" : "text-white/50 hover:text-white hover:bg-white/5"}`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <div className="flex items-center gap-1 px-3 py-2 border-b border-white/10 bg-white/[0.02] flex-wrap">
        <ToolButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
          <Bold className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
          <Italic className="w-4 h-4" />
        </ToolButton>
        <span className="w-px h-5 bg-white/10 mx-1" />
        <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })}>
          <Heading1 className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}>
          <Heading2 className="w-4 h-4" />
        </ToolButton>
        <span className="w-px h-5 bg-white/10 mx-1" />
        <ToolButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>
          <List className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>
          <ListOrdered className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>
          <Quote className="w-4 h-4" />
        </ToolButton>
        <span className="w-px h-5 bg-white/10 mx-1" />
        <ToolButton onClick={() => editor.chain().focus().undo().run()} active={false}>
          <Undo className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().redo().run()} active={false}>
          <Redo className="w-4 h-4" />
        </ToolButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
