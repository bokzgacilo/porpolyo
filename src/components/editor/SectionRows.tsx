import {
  Box,
  Button,
  HStack,
  IconButton,
  Menu,
  Portal,
  Text,
} from "@chakra-ui/react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEditorStore } from "../../store/editorStore";
import { PortfolioSection, SelectedElement } from "../../types/portfolio";
import { sectionIcons } from "./layerHelpers";
import {
  LuChevronDown,
  LuChevronRight,
  LuCopy,
  LuPenLine,
  LuTrash2,
  LuEye,
  LuEyeOff,
  LuGripVertical,
  LuLock,
} from "react-icons/lu";

const sectionRowStyle = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: 2,
  padding: "0 16px",
  height: "45px",
  width: "100%",
  backgroundColor: "var(--chakra-colors-bg-panel)",
  borderBottom: "1px solid var(--chakra-colors-border)",
  cursor: "pointer",
  color: "var(--chakra-colors-fg)",
};

export function PageStructureRow({
  icon: Icon,
  label,
  active,
  expanded,
  onToggle,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  active: boolean;
  expanded?: boolean;
  onToggle?: () => void;
  onClick: () => void;
}) {
  return (
    <Box aria-pressed={active} onClick={onClick} {...sectionRowStyle}>
      {onToggle ? (
        <IconButton
          aria-label={expanded ? `Collapse ${label}` : `Expand ${label}`}
          color="fg.muted"
          minW="18px"
          onClick={(event) => {
            event.stopPropagation();
            onToggle();
          }}
          unstyled
        >
          {expanded ? (
            <LuChevronDown size={16} />
          ) : (
            <LuChevronRight size={16} />
          )}
        </IconButton>
      ) : (
        <Box minW="18px" />
      )}
      <Icon size={16} />
      <Text as="span" flex="1" textAlign="left" truncate>
        {label}
      </Text>
      <LuLock size={16} />
    </Box>
  );
}

export function SortableSectionRow({
  section,
  onToggle,
  onDuplicate,
  onDelete,
  onRename,
  onToggleLock,
  onSelect,
}: {
  section: PortfolioSection;
  onToggle: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onRename: () => void;
  onToggleLock: () => void;
  onSelect: (selection: SelectedElement) => void;
}) {
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: section.id });

  return (
    <Box
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <SectionRow
        section={section}
        onToggle={onToggle}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onRename={onRename}
        onToggleLock={onToggleLock}
        onSelect={onSelect}
        dragHandle={{ attributes, listeners, setActivatorNodeRef }}
      />
    </Box>
  );
}

export function SectionRow({
  section,
  onToggle,
  onDuplicate,
  onDelete,
  onRename,
  onToggleLock,
  onSelect,
  dragHandle,
}: {
  section: PortfolioSection;
  onToggle: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onRename: () => void;
  onToggleLock: () => void;
  onSelect?: (selection: SelectedElement) => void;
  dragHandle?: {
    attributes: ReturnType<typeof useSortable>["attributes"];
    listeners: ReturnType<typeof useSortable>["listeners"];
    setActivatorNodeRef: ReturnType<typeof useSortable>["setActivatorNodeRef"];
  };
}) {
  const { selected, select } = useEditorStore();
  const Icon = sectionIcons[section.type];
  const active =
    selected?.kind === "section" && selected.sectionId === section.id;
  const handleSelect = onSelect || select;
  const structural = section.type === "header" || section.type === "footer";

  return (
    <Menu.Root>
      <Menu.ContextTrigger asChild>
        <HStack
          {...sectionRowStyle}
          bg={active ? "bg.muted" : "bg.panel"}
          onClick={() =>
            handleSelect({ kind: "section", sectionId: section.id })
          }
        >
          {dragHandle ? (
            <IconButton
              ref={dragHandle.setActivatorNodeRef}
              {...dragHandle.attributes}
              {...dragHandle.listeners}
              aria-label={`Drag ${section.label}`}
              title={`Drag ${section.label}`}
              color="fg.muted"
              cursor="grab"
              touchAction="none"
              _active={{ cursor: "grabbing" }}
              onClick={(event) => {
                event.stopPropagation();
              }}
              unstyled
            >
              <LuGripVertical size={16} />
            </IconButton>
          ) : (
            <Box as="span" color="fg.muted">
              <LuLock size={16} />
            </Box>
          )}
          <Icon size={16} />
          <Text as="span" flex="1" textAlign="left" truncate>
            {section.label}
          </Text>
          <HStack gap={2}>
            <IconButton
              aria-label={
                section.visible
                  ? `Hide ${section.label}`
                  : `Show ${section.label}`
              }
              color="fg.muted"
              onClick={(event) => {
                event.stopPropagation();
                onToggle();
              }}
              unstyled
            >
              {section.visible ? <LuEye size={16} /> : <LuEyeOff size={16} />}
            </IconButton>
            {!section.locked && (
              <IconButton
                aria-label={`Duplicate ${section.label}`}
                color="fg.muted"
                onClick={(event) => {
                  event.stopPropagation();
                  onDuplicate();
                }}
                unstyled
              >
                <LuCopy size={16} />
              </IconButton>
            )}
          </HStack>
        </HStack>
      </Menu.ContextTrigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.Item value="rename" onSelect={onRename}>
              <LuPenLine size={14} /> Rename
            </Menu.Item>
            <Menu.Item value="visibility" onSelect={onToggle}>
              {section.visible ? <LuEyeOff size={14} /> : <LuEye size={14} />}
              {section.visible ? "Hide section" : "Show section"}
            </Menu.Item>
            <Menu.Item
              value="duplicate"
              disabled={section.locked || structural}
              onSelect={onDuplicate}
            >
              <LuCopy size={14} /> Duplicate
            </Menu.Item>
            <Menu.Item
              value="lock"
              disabled={structural}
              onSelect={onToggleLock}
            >
              <LuLock size={14} /> {section.locked ? "Unlock" : "Lock"}
            </Menu.Item>
            <Menu.Item
              value="delete"
              colorPalette="red"
              disabled={structural}
              onSelect={onDelete}
            >
              <LuTrash2 size={14} /> Delete section
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
