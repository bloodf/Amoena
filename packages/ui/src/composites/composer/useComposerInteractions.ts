import { useCallback, useMemo, useState } from "react";
import type { RefObject } from "react";

import { composerFiles, composerSkills, type ComposerAgentVariant } from "./config";
import { buildComposerPaletteGroups, buildComposerPaletteItems } from "./palette";
import type { ComposerAttachment, PaletteGroup, PaletteItem } from "./types";

export function useComposerInteractions({
  message,
  setMessage,
  attachments,
  setAttachments,
  textareaRef,
  agents,
  onCycleAgent,
  onSelectAgent,
  onAutocompleteOpen,
}: {
  message: string;
  setMessage: (value: string) => void;
  attachments: ComposerAttachment[];
  setAttachments: React.Dispatch<React.SetStateAction<ComposerAttachment[]>>;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  agents: ComposerAgentVariant[];
  onCycleAgent: () => void;
  onSelectAgent: (agentId: string) => void;
  onAutocompleteOpen: () => void;
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [showUnifiedPalette, setShowUnifiedPalette] = useState(false);
  const [showSkills, setShowSkills] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredFiles = useMemo(
    () =>
      composerFiles.filter(
        (file) =>
          file.path.toLowerCase().includes(filterText.toLowerCase()) || file.name.toLowerCase().includes(filterText.toLowerCase()),
      ),
    [filterText],
  );

  const filteredSkills = useMemo(
    () =>
      composerSkills.filter(
        (skill) => skill.name.toLowerCase().includes(filterText.toLowerCase()) || skill.desc.toLowerCase().includes(filterText.toLowerCase()),
      ),
    [filterText],
  );

  const paletteItems = useMemo(
    () => (showUnifiedPalette ? buildComposerPaletteItems({ filter: filterText, agents, activeAgentId: agents[0]?.id ?? "" }) : []),
    [agents, filterText, showUnifiedPalette],
  );

  const paletteGroups: PaletteGroup[] = useMemo(
    () => (showUnifiedPalette ? buildComposerPaletteGroups(paletteItems) : []),
    [paletteItems, showUnifiedPalette],
  );

  const flatPaletteItems = useMemo(() => paletteGroups.flatMap((group) => group.items), [paletteGroups]);

  const closeAutocomplete = useCallback(() => {
    setShowFilePicker(false);
    setShowUnifiedPalette(false);
    setShowSkills(false);
  }, []);

  const focusComposer = useCallback(() => {
    textareaRef.current?.focus();
  }, [textareaRef]);

  const addAttachment = useCallback(
    (attachment: ComposerAttachment) => {
      if (!attachments.find((item) => item.path === attachment.path)) {
        setAttachments((previous) => [...previous, attachment]);
      }
    },
    [attachments, setAttachments],
  );

  const insertFileRef = useCallback(
    (file: (typeof composerFiles)[number]) => {
      const cleaned = message.replace(/@\S*$/, "").trimEnd();
      setMessage(cleaned);
      addAttachment({
        type: file.type,
        name: file.name,
        path: file.path,
        itemCount: file.type === "folder" ? Math.floor(Math.random() * 15) + 3 : undefined,
      });
      setShowFilePicker(false);
      focusComposer();
    },
    [addAttachment, focusComposer, message, setMessage],
  );

  const insertSkill = useCallback(
    (skill: (typeof composerSkills)[number]) => {
      void skill;
      setMessage(message.replace(/\$\S*$/, "").trimEnd());
      setShowSkills(false);
      focusComposer();
    },
    [focusComposer, message, setMessage],
  );

  const handlePaletteSelect = useCallback(
    (item: PaletteItem) => {
      if (item.category === "commands" || item.category === "skills") {
        setMessage(`${item.name} `);
      } else if (item.category === "agents") {
        const agent = agents.find((entry) => entry.id === item.id.replace("agent-", ""));
        if (agent) onSelectAgent(agent.id);
        setMessage("");
      } else if (item.category === "files") {
        const file = composerFiles.find((entry) => `file-${entry.path}` === item.id);
        if (file) {
          setMessage("");
          addAttachment({
            type: file.type,
            name: file.name,
            path: file.path,
            itemCount: file.type === "folder" ? Math.floor(Math.random() * 15) + 3 : undefined,
          });
        }
      }
      setShowUnifiedPalette(false);
      focusComposer();
    },
    [addAttachment, agents, focusComposer, setMessage],
  );

  const handleInput = useCallback(
    (value: string) => {
      setMessage(value);
      const atMatch = value.match(/@(\S*)$/);
      if (atMatch) {
        onAutocompleteOpen();
        setFilterText(atMatch[1]);
        setShowFilePicker(true);
        setShowUnifiedPalette(false);
        setShowSkills(false);
        setSelectedIndex(0);
        return;
      }
      const dollarMatch = value.match(/\$(\S*)$/);
      if (dollarMatch) {
        onAutocompleteOpen();
        setFilterText(dollarMatch[1]);
        setShowSkills(true);
        setShowFilePicker(false);
        setShowUnifiedPalette(false);
        setSelectedIndex(0);
        return;
      }
      const slashMatch = value.match(/^\/(\S*)$/);
      if (slashMatch) {
        onAutocompleteOpen();
        setFilterText(slashMatch[1]);
        setShowUnifiedPalette(true);
        setShowFilePicker(false);
        setShowSkills(false);
        setSelectedIndex(0);
        return;
      }
      closeAutocomplete();
    },
    [closeAutocomplete, onAutocompleteOpen, setMessage],
  );

  const removeAttachment = useCallback((path: string) => setAttachments((previous) => previous.filter((item) => item.path !== path)), [setAttachments]);

  const handleKeyDown = useCallback(
    (
      event: React.KeyboardEvent,
    ) => {
      if (showFilePicker || showUnifiedPalette || showSkills) {
        const items = showFilePicker ? filteredFiles : showUnifiedPalette ? flatPaletteItems : filteredSkills;
        if (event.key === "ArrowDown") {
          event.preventDefault();
          setSelectedIndex((previous) => Math.min(previous + 1, items.length - 1));
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          setSelectedIndex((previous) => Math.max(previous - 1, 0));
        } else if (event.key === "Enter" || event.key === "Tab") {
          event.preventDefault();
          if (showFilePicker && filteredFiles[selectedIndex]) insertFileRef(filteredFiles[selectedIndex]);
          else if (showUnifiedPalette && flatPaletteItems[selectedIndex]) handlePaletteSelect(flatPaletteItems[selectedIndex]);
          else if (showSkills && filteredSkills[selectedIndex]) insertSkill(filteredSkills[selectedIndex]);
        } else if (event.key === "Escape") {
          closeAutocomplete();
        }
        return;
      }
      if (event.key === "Tab" && !message.trim()) {
        event.preventDefault();
        onCycleAgent();
        return;
      }
      if (event.key === "Enter" && !event.shiftKey) event.preventDefault();
    },
    [
      filteredFiles,
      filteredSkills,
      flatPaletteItems,
      handlePaletteSelect,
      insertFileRef,
      insertSkill,
      message,
      onCycleAgent,
      selectedIndex,
      showFilePicker,
      showSkills,
      showUnifiedPalette,
    ],
  );

  const handlePaste = useCallback(
    (event: React.ClipboardEvent) => {
      for (let index = 0; index < event.clipboardData.items.length; index += 1) {
        const item = event.clipboardData.items[index];
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) {
            event.preventDefault();
            addAttachment({ type: "file", name: file.name, path: file.name });
          }
        }
      }
    },
    [addAttachment],
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node)) setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragOver(false);

      const fileData = event.dataTransfer.getData("amoena/file");
      if (fileData) {
        try {
          const parsed = JSON.parse(fileData);
          addAttachment({
            type: parsed.type,
            name: parsed.name,
            path: parsed.path,
            itemCount: parsed.type === "folder" ? parsed.itemCount : undefined,
          });
        } catch {
          // Ignore invalid drag payloads.
        }
        return;
      }

      if (event.dataTransfer.files.length > 0) {
        Array.from(event.dataTransfer.files).forEach((file) => addAttachment({ type: "file", name: file.name, path: file.name }));
      }
    },
    [addAttachment],
  );

  return {
    isDragOver,
    showFilePicker,
    showUnifiedPalette,
    showSkills,
    selectedIndex,
    filteredFiles,
    filteredSkills,
    flatPaletteItems,
    paletteGroups,
    closeAutocomplete,
    handleInput,
    insertFileRef,
    handlePaletteSelect,
    insertSkill,
    removeAttachment,
    handleKeyDown,
    handlePaste,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    openUnifiedPalette: () => {
      onAutocompleteOpen();
      setShowUnifiedPalette((previous) => !previous);
      setFilterText("");
      setSelectedIndex(0);
      focusComposer();
    },
  };
}
