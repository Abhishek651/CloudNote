import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import '../styles/tiptap-custom.css';
import { Box, IconButton, Divider, useTheme, useMediaQuery, Stack, Tooltip, ButtonGroup } from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  Code,
  FormatQuote,
  Undo,
  Redo,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatAlignJustify,
  Link as LinkIcon,
  Image as ImageIcon,
  Highlight as HighlightIcon,
  DataObject as CodeBlockIcon,
} from '@mui/icons-material';

const lowlight = createLowlight(common);

export default function RichTextEditor({ value, onChange, placeholder = 'Start writing...' }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'tiptap-code-block',
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight,
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'tiptap-link',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'tiptap-image',
        },
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
        style: `min-height: ${isSmallMobile ? '300px' : isMobile ? '400px' : '500px'}`,
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ onClick, isActive, icon, tooltip, disabled = false }) => (
    <Tooltip title={tooltip}>
      <span>
        <IconButton
          onClick={onClick}
          disabled={disabled}
          size={isSmallMobile ? 'small' : 'medium'}
          sx={{
            minWidth: isSmallMobile ? '32px' : '36px',
            minHeight: isSmallMobile ? '32px' : '36px',
            borderRadius: 1,
            bgcolor: isActive ? 'primary.main' : 'transparent',
            color: isActive ? 'primary.contrastText' : 'text.primary',
            '&:hover': {
              bgcolor: isActive ? 'primary.dark' : 'action.hover',
            },
          }}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  );

  const handleLink = () => {
    if (editor.isActive('link')) {
      const existingUrl = editor.getAttributes('link').href;
      const newUrl = window.prompt('Edit URL or leave blank to remove:', existingUrl);

      if (newUrl === null) { // User clicked cancel
        return;
      }

      if (newUrl === '') { // User left it blank
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
        return;
      }

      editor.chain().focus().extendMarkRange('link').setLink({ href: newUrl }).run();
    } else {
      const url = window.prompt('Enter URL:');
      if (url) {
        editor.chain().focus().setLink({ href: url }).run();
      }
    }
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden',
        '& .tiptap-editor': {
          padding: isSmallMobile ? '12px' : isMobile ? '16px' : '20px',
          fontSize: isSmallMobile ? '15px' : '16px',
          lineHeight: 1.7,
          outline: 'none',
          color: theme.palette.text.primary,
          fontFamily: theme.typography.fontFamily,
          '&:focus': {
            outline: 'none',
          },
          '& p': {
            marginBottom: '12px',
            '&:last-child': {
              marginBottom: 0,
            },
          },
          '& h1': {
            fontSize: isSmallMobile ? '1.75rem' : '2rem',
            fontWeight: 700,
            marginTop: '24px',
            marginBottom: '12px',
            lineHeight: 1.3,
            '&:first-child': {
              marginTop: 0,
            },
          },
          '& h2': {
            fontSize: isSmallMobile ? '1.5rem' : '1.75rem',
            fontWeight: 600,
            marginTop: '20px',
            marginBottom: '10px',
            lineHeight: 1.3,
          },
          '& h3': {
            fontSize: isSmallMobile ? '1.25rem' : '1.5rem',
            fontWeight: 600,
            marginTop: '16px',
            marginBottom: '8px',
            lineHeight: 1.4,
          },
          '& h4, & h5, & h6': {
            fontWeight: 600,
            marginTop: '12px',
            marginBottom: '6px',
          },
          '& blockquote': {
            borderLeft: `4px solid ${theme.palette.primary.main}`,
            paddingLeft: '16px',
            marginLeft: 0,
            marginRight: 0,
            marginTop: '16px',
            marginBottom: '16px',
            fontStyle: 'italic',
            color: theme.palette.text.secondary,
          },
          '& pre': {
            backgroundColor: theme.palette.mode === 'dark' ? '#2d2d2d' : '#f5f5f5',
            color: theme.palette.mode === 'dark' ? '#e0e0e0' : '#333',
            borderRadius: '6px',
            padding: '16px',
            overflowX: 'auto',
            overflowY: 'auto',
            fontSize: '14px',
            lineHeight: '1.5',
            fontFamily: '"Consolas", "Monaco", "Courier New", monospace',
            marginTop: '12px',
            marginBottom: '12px',
            border: theme.palette.mode === 'dark' ? '1px solid #444' : '1px solid #ddd',
            position: 'relative',
            whiteSpace: 'pre',
          },
          '& .tiptap-code-block': {
            position: 'relative',
          },
          '& code': {
            backgroundColor: theme.palette.mode === 'dark' ? '#2d2d2d' : '#f0f0f0',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '0.9em',
            fontFamily: '"Consolas", "Monaco", "Courier New", monospace',
            color: theme.palette.mode === 'dark' ? '#e0e0e0' : '#333',
          },
          '& pre code': {
            backgroundColor: 'transparent',
            padding: '0',
            color: 'inherit',
            whiteSpace: 'pre',
            wordWrap: 'normal',
          },
          '& ul, & ol': {
            paddingLeft: isSmallMobile ? '20px' : '24px',
            marginTop: '12px',
            marginBottom: '12px',
          },
          '& li': {
            marginBottom: '6px',
          },
          '& .tiptap-image': {
            maxWidth: '100%',
            height: 'auto',
            borderRadius: '8px',
            marginTop: '12px',
            marginBottom: '12px',
          },
          '& .tiptap-link': {
            color: theme.palette.primary.main,
            textDecoration: 'underline',
            cursor: 'pointer',
          },
          '& mark': {
            backgroundColor: '#ffeb3b',
            padding: '1px 2px',
            borderRadius: '2px',
          },
          '& p.is-editor-empty:first-child::before': {
            content: `"${placeholder}"`,
            color: theme.palette.text.secondary,
            pointerEvents: 'none',
            height: 0,
            float: 'left',
          },
        },
      }}
    >
      {/* Toolbar */}
      <Box
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
          padding: isSmallMobile ? '6px' : '8px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: isSmallMobile ? '4px' : '8px',
          alignItems: 'center',
        }}
      >
        {/* Text Formatting */}
        <ButtonGroup size={isSmallMobile ? 'small' : 'medium'}>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            icon={<FormatBold fontSize="small" />}
            tooltip="Bold"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            icon={<FormatItalic fontSize="small" />}
            tooltip="Italic"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            icon={<FormatUnderlined fontSize="small" />}
            tooltip="Underline"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            icon={<Code fontSize="small" />}
            tooltip="Code"
          />
        </ButtonGroup>

        {!isSmallMobile && <Divider orientation="vertical" flexItem />}

        {/* Headings - Show on desktop only */}
        {!isMobile && (
          <>
            <ButtonGroup size="medium">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive('heading', { level: 1 })}
                icon={<span style={{ fontWeight: 'bold', fontSize: '14px' }}>H1</span>}
                tooltip="Heading 1"
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive('heading', { level: 2 })}
                icon={<span style={{ fontWeight: 'bold', fontSize: '14px' }}>H2</span>}
                tooltip="Heading 2"
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editor.isActive('heading', { level: 3 })}
                icon={<span style={{ fontWeight: 'bold', fontSize: '14px' }}>H3</span>}
                tooltip="Heading 3"
              />
            </ButtonGroup>
            <Divider orientation="vertical" flexItem />
          </>
        )}

        {/* Lists */}
        <ButtonGroup size={isSmallMobile ? 'small' : 'medium'}>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            icon={<FormatListBulleted fontSize="small" />}
            tooltip="Bullet List"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            icon={<FormatListNumbered fontSize="small" />}
            tooltip="Numbered List"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            icon={<FormatQuote fontSize="small" />}
            tooltip="Quote"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            icon={<CodeBlockIcon fontSize="small" />}
            tooltip="Code Block"
          />
        </ButtonGroup>

        {!isSmallMobile && <Divider orientation="vertical" flexItem />}

        {/* Alignment - Desktop only */}
        {!isMobile && (
          <>
            <ButtonGroup size="medium">
              <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                isActive={editor.isActive({ textAlign: 'left' })}
                icon={<FormatAlignLeft fontSize="small" />}
                tooltip="Align Left"
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                isActive={editor.isActive({ textAlign: 'center' })}
                icon={<FormatAlignCenter fontSize="small" />}
                tooltip="Align Center"
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                isActive={editor.isActive({ textAlign: 'right' })}
                icon={<FormatAlignRight fontSize="small" />}
                tooltip="Align Right"
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                isActive={editor.isActive({ textAlign: 'justify' })}
                icon={<FormatAlignJustify fontSize="small" />}
                tooltip="Justify"
              />
            </ButtonGroup>
            <Divider orientation="vertical" flexItem />
          </>
        )}

        {/* Highlight */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive('highlight')}
          icon={<HighlightIcon fontSize="small" />}
          tooltip="Highlight"
        />

        {/* Link & Image - Desktop only */}
        {!isMobile && (
          <>
            <ToolbarButton
              onClick={handleLink}
              isActive={editor.isActive('link')}
              icon={<LinkIcon fontSize="small" />}
              tooltip="Manage Link"
            />
            <ToolbarButton
              onClick={addImage}
              icon={<ImageIcon fontSize="small" />}
              tooltip="Add Image"
            />
          </>
        )}

        {!isSmallMobile && <Divider orientation="vertical" flexItem />}

        {/* Undo/Redo */}
        <ButtonGroup size={isSmallMobile ? 'small' : 'medium'}>
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            icon={<Undo fontSize="small" />}
            tooltip="Undo"
            disabled={!editor.can().undo()}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            icon={<Redo fontSize="small" />}
            tooltip="Redo"
            disabled={!editor.can().redo()}
          />
        </ButtonGroup>
      </Box>

      {/* Editor Content */}
      <EditorContent editor={editor} />
    </Box>
  );
}
