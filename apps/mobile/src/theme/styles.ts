import { StyleSheet } from "react-native";

import { tokens } from "./tokens";

export const styles = StyleSheet.create({
  scrollContent: {
    padding: tokens.spacing5,
    gap: tokens.spacing4,
  },

  card: {
    gap: tokens.spacing2_5,
    padding: tokens.spacing4,
    borderRadius: tokens.radius3xl,
    backgroundColor: tokens.colorSurface1,
    borderWidth: tokens.borderWidth,
    borderColor: tokens.colorBorder,
  },

  input: {
    backgroundColor: tokens.colorSurface2,
    color: tokens.colorTextPrimary,
    borderRadius: tokens.radius2xl,
    paddingHorizontal: tokens.spacing3_5,
    paddingVertical: tokens.spacing3,
    borderWidth: tokens.borderWidth,
    borderColor: tokens.colorSurface3,
  },

  primaryButton: {
    backgroundColor: tokens.colorPrimary,
    paddingVertical: tokens.spacing3,
    borderRadius: tokens.radius2xl,
    alignItems: "center" as const,
  },
  primaryButtonText: {
    color: tokens.colorPrimaryForeground,
    fontWeight: "700" as const,
    fontSize: tokens.fontSizeSm,
  },

  secondaryButton: {
    paddingVertical: tokens.spacing2_5,
    borderRadius: tokens.radiusXl,
    alignItems: "center" as const,
    borderWidth: tokens.borderWidth,
    borderColor: tokens.colorSurface3,
  },
  secondaryButtonText: {
    color: tokens.colorTextPrimary,
    fontWeight: "600" as const,
  },

  approveButton: {
    flex: 1,
    alignItems: "center" as const,
    backgroundColor: tokens.colorSuccess,
    borderRadius: tokens.radius2xl,
    paddingVertical: tokens.spacing3,
  },
  approveButtonText: {
    color: tokens.colorSuccessForeground,
    fontWeight: "700" as const,
  },

  denyButton: {
    flex: 1,
    alignItems: "center" as const,
    backgroundColor: tokens.colorDestructive,
    borderRadius: tokens.radius2xl,
    paddingVertical: tokens.spacing3,
  },
  denyButtonText: {
    color: tokens.colorDestructiveForeground,
    fontWeight: "700" as const,
  },

  screenTitle: {
    fontSize: tokens.fontSize2xl,
    fontWeight: "700" as const,
    color: tokens.colorTextPrimary,
  },

  cardTitle: {
    color: tokens.colorTextPrimary,
    fontSize: tokens.fontSizeLg,
    fontWeight: "600" as const,
  },

  sectionTitle: {
    color: tokens.colorTextPrimary,
    fontSize: tokens.fontSizeLg,
    fontWeight: "600" as const,
  },

  mutedText: {
    color: tokens.colorTextSecondary,
    fontSize: tokens.fontSizeSm,
  },

  bodyText: {
    color: tokens.colorTextPrimary,
    fontSize: tokens.fontSizeSm,
    lineHeight: tokens.lineHeightSm,
  },

  descriptionText: {
    color: tokens.colorTextSecondary,
    fontSize: tokens.fontSizeSm,
    lineHeight: tokens.lineHeightSm,
  },

  section: {
    gap: tokens.spacing3,
    padding: tokens.spacing4,
    borderRadius: tokens.radius3xl,
    backgroundColor: tokens.colorSurface1,
    borderWidth: tokens.borderWidth,
    borderColor: tokens.colorBorder,
  },

  sessionRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: tokens.spacing3,
    paddingVertical: tokens.spacing2,
  },

  buttonRow: {
    flexDirection: "row" as const,
    gap: tokens.spacing3,
  },

  tag: {
    paddingHorizontal: tokens.spacing2_5,
    paddingVertical: tokens.spacing1_5,
    borderRadius: tokens.radiusFull,
    backgroundColor: tokens.colorSecondary,
  },
  tagText: {
    color: tokens.colorTextSecondary,
    fontSize: tokens.fontSizeXs,
    fontWeight: "700" as const,
  },

  messageBubble: {
    borderRadius: tokens.radius3xl,
    padding: tokens.spacing3,
    borderWidth: tokens.borderWidth,
    borderColor: tokens.colorBorder,
  },
  userMessage: {
    alignSelf: "flex-end" as const,
    backgroundColor: tokens.colorPrimary,
  },
  assistantMessage: {
    alignSelf: "stretch" as const,
    backgroundColor: tokens.colorSurface2,
  },

  agentCard: {
    borderRadius: tokens.radius2xl,
    padding: tokens.spacing3,
    backgroundColor: tokens.colorSurface2,
    borderWidth: tokens.borderWidth,
    borderColor: tokens.colorBorder,
    gap: tokens.spacing1,
  },

  messageRole: {
    color: tokens.colorTextSecondary,
    fontSize: tokens.fontSizeXs,
    marginBottom: tokens.spacing1,
  },
  messageContent: {
    color: tokens.colorTextPrimary,
    fontSize: tokens.fontSizeSm,
    lineHeight: tokens.lineHeightSm,
  },

  sessionName: {
    color: tokens.colorTextPrimary,
    fontSize: tokens.fontSizeBase,
    fontWeight: "600" as const,
  },

  agentName: {
    color: tokens.colorTextPrimary,
    fontSize: tokens.fontSizeSm,
    fontWeight: "600" as const,
  },

  composerInput: {
    minHeight: 100,
    borderRadius: tokens.radius2xl,
    borderWidth: tokens.borderWidth,
    borderColor: tokens.colorSurface3,
    backgroundColor: tokens.colorSurface2,
    color: tokens.colorTextPrimary,
    padding: tokens.spacing3_5,
    textAlignVertical: "top" as const,
  },

  permissionMessage: {
    color: tokens.colorTextPrimary,
    fontSize: tokens.fontSizeBase,
    fontWeight: "600" as const,
  },
});
