import { useCallback, useState } from "react";

type ComposerMenuKey = "plus" | "agent" | "model" | "reasoning" | "continueIn" | "permission" | "branch";

export function useComposerToolbarMenus(closeAutocomplete: () => void) {
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [showReasoningPicker, setShowReasoningPicker] = useState(false);
  const [showAgentPicker, setShowAgentPicker] = useState(false);
  const [showContinueInMenu, setShowContinueInMenu] = useState(false);
  const [showPermMenu, setShowPermMenu] = useState(false);
  const [showBranchMenu, setShowBranchMenu] = useState(false);

  const closeToolbarMenus = useCallback(() => {
    setShowPlusMenu(false);
    setShowModelPicker(false);
    setShowReasoningPicker(false);
    setShowAgentPicker(false);
    setShowContinueInMenu(false);
    setShowPermMenu(false);
    setShowBranchMenu(false);
  }, []);

  const closeAllMenus = useCallback(() => {
    closeAutocomplete();
    closeToolbarMenus();
  }, [closeAutocomplete, closeToolbarMenus]);

  const toggleMenu = useCallback(
    (menu: ComposerMenuKey) => {
      closeAllMenus();
      if (menu === "plus") setShowPlusMenu((value) => !value);
      if (menu === "agent") setShowAgentPicker((value) => !value);
      if (menu === "model") setShowModelPicker((value) => !value);
      if (menu === "reasoning") setShowReasoningPicker((value) => !value);
      if (menu === "continueIn") setShowContinueInMenu((value) => !value);
      if (menu === "permission") setShowPermMenu((value) => !value);
      if (menu === "branch") setShowBranchMenu((value) => !value);
    },
    [closeAllMenus],
  );

  const closeMenu = useCallback((menu: ComposerMenuKey) => {
    if (menu === "plus") setShowPlusMenu(false);
    if (menu === "agent") setShowAgentPicker(false);
    if (menu === "model") setShowModelPicker(false);
    if (menu === "reasoning") setShowReasoningPicker(false);
    if (menu === "continueIn") setShowContinueInMenu(false);
    if (menu === "permission") setShowPermMenu(false);
    if (menu === "branch") setShowBranchMenu(false);
  }, []);

  return {
    menus: {
      plus: showPlusMenu,
      agent: showAgentPicker,
      model: showModelPicker,
      reasoning: showReasoningPicker,
      continueIn: showContinueInMenu,
      permission: showPermMenu,
      branch: showBranchMenu,
    },
    closeToolbarMenus,
    closeAllMenus,
    toggleMenu,
    closeMenu,
    setShowPlusMenu,
  };
}
